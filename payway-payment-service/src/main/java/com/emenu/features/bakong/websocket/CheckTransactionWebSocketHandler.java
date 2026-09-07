package com.emenu.features.bakong.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.emenu.features.bakong.enums.TransactionState;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.bakong.dto.TransactionSocketRequest;
import com.emenu.features.bakong.dto.TransactionStatusResponse;
import com.emenu.features.bakong.mapper.TransactionStatusMapper;
import com.emenu.features.bakong.service.BakongService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.CloseStatus;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class CheckTransactionWebSocketHandler implements WebSocketHandler {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BASIC_AUTH_PREFIX = "Basic ";

    private final BakongService bakongService;
    private final ObjectMapper objectMapper;
    private final TransactionStatusMapper transactionStatusMapper;

    @Value("${security.basic.username}")
    private String basicUsername;

    @Value("${security.basic.password}")
    private String basicPassword;

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        String requestUrl = session.getHandshakeInfo().getUri().toString();
        log.info("WebSocket connected path={} remoteAddress={}", requestUrl, session.getHandshakeInfo().getRemoteAddress());

        return authenticate(session)
                .flatMap(username -> session.send(
                        session.receive()
                                .next()
                                .switchIfEmpty(Mono.error(new IllegalArgumentException("WebSocket request payload is required")))
                                .map(WebSocketMessage::getPayloadAsText)
                                .flatMap(this::parseRequest)
                                .flatMapMany(request -> streamTransaction(session, request, requestUrl, username))
                ))
                .doOnCancel(() -> log.warn("WebSocket cancelled by client path={}", requestUrl))
                .doFinally(signal -> log.info("WebSocket finished path={} signal={}", requestUrl, signal))
                .onErrorResume(ex -> sendErrorAndClose(session, requestUrl, ex));
    }

    private Mono<String> authenticate(WebSocketSession session) {
        String queryUsername = queryParam(session.getHandshakeInfo().getUri(), "username");
        String queryPassword = queryParam(session.getHandshakeInfo().getUri(), "password");

        if (hasText(queryUsername) && hasText(queryPassword)) {
            return isValidCredentials(queryUsername, queryPassword)
                    ? Mono.just(queryUsername)
                    : Mono.error(new SecurityException("Invalid WebSocket credentials"));
        }

        String authorization = session.getHandshakeInfo().getHeaders().getFirst(AUTHORIZATION_HEADER);
        if (authorization != null && authorization.startsWith(BASIC_AUTH_PREFIX)) {
            try {
                String encoded = authorization.substring(BASIC_AUTH_PREFIX.length());
                String decoded = new String(Base64.getDecoder().decode(encoded), StandardCharsets.UTF_8);
                int separatorIndex = decoded.indexOf(':');
                if (separatorIndex > 0) {
                    String username = decoded.substring(0, separatorIndex);
                    String password = decoded.substring(separatorIndex + 1);
                    if (isValidCredentials(username, password)) {
                        return Mono.just(username);
                    }
                }
            } catch (Exception ex) {
                log.debug("Failed to decode WebSocket Basic Auth header", ex);
            }
        }

        return Mono.error(new SecurityException("Missing WebSocket credentials"));
    }

    private Flux<WebSocketMessage> streamTransaction(
            WebSocketSession session,
            TransactionSocketRequest request,
            String requestUrl,
            String username
    ) {
        log.info("Starting WebSocket transaction stream md5={} intervalSeconds={} authUser={}",
                request.md5(),
                request.intervalSeconds(),
                username);

        return Flux.interval(Duration.ZERO, Duration.ofSeconds(request.intervalSeconds()))
                .concatMap(tick -> bakongService.checkTransactionByMD5(new CheckTransactionRequest(request.md5()), requestUrl)
                        .map(response -> buildSuccessMessage(session, requestUrl, response, tick)))
                .takeUntil(message -> isTerminal(message))
                .doOnCancel(() -> log.warn("Stopping WebSocket stream due to client disconnect md5={}", request.md5()));
    }

    private Mono<TransactionSocketRequest> parseRequest(String payload) {
        try {
            TransactionSocketRequest request = objectMapper.readValue(payload, TransactionSocketRequest.class);
            if (!hasText(request.md5())) {
                return Mono.error(new IllegalArgumentException("md5 is required"));
            }
            return Mono.just(request);
        } catch (Exception ex) {
            return Mono.error(new IllegalArgumentException("Invalid WebSocket request payload", ex));
        }
    }

    private WebSocketMessage buildSuccessMessage(
            WebSocketSession session,
            String requestUrl,
            BakongResponse response,
            long attemptIndex
    ) {
        TransactionStatusResponse statusResponse = transactionStatusMapper.toStreamingStatus(response, attemptIndex);
        ApiResponse<TransactionStatusResponse> body = ApiResponse.success("Transaction status update", statusResponse);

        return session.textMessage(toJson(body));
    }

    private boolean isTerminal(WebSocketMessage message) {
        try {
            ApiResponse<?> response = objectMapper.readValue(message.getPayloadAsText(), ApiResponse.class);
            if (!(response.getData() instanceof java.util.Map<?, ?> map)) {
                return false;
            }
            Object terminal = map.get("terminal");
            return Objects.equals(terminal, true) || Objects.equals(String.valueOf(terminal), "true");
        } catch (Exception ex) {
            return false;
        }
    }

    private Mono<Void> sendErrorAndClose(WebSocketSession session, String requestUrl, Throwable ex) {
        log.error("WebSocket transaction stream failed path={}", requestUrl, ex);
        ApiResponse<Object> body = ApiResponse.error(ex.getMessage());

        return session.send(Mono.just(session.textMessage(toJson(body))))
                .then(session.close(CloseStatus.SERVER_ERROR));
    }

    private boolean isValidCredentials(String username, String password) {
        return Objects.equals(username, basicUsername)
                && Objects.equals(password, basicPassword);
    }

    private String queryParam(URI uri, String key) {
        String query = uri.getQuery();
        if (!hasText(query)) {
            return null;
        }

        for (String part : query.split("&")) {
            String[] pair = part.split("=", 2);
            if (pair.length == 2 && Objects.equals(pair[0], key)) {
                return pair[1];
            }
        }

        return null;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String toJson(Object body) {
        try {
            return objectMapper.writeValueAsString(body);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to serialize WebSocket response", ex);
        }
    }
}
