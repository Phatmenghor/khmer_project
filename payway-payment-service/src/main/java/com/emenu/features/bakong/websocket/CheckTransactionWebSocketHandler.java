package com.emenu.features.bakong.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.bakong.dto.TransactionSocketRequest;
import com.emenu.features.bakong.dto.TransactionStatusResponse;
import com.emenu.features.bakong.mapper.TransactionStatusMapper;
import com.emenu.features.bakong.service.BakongService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.time.Duration;

@Component
@RequiredArgsConstructor
@Slf4j
public class CheckTransactionWebSocketHandler implements WebSocketHandler {

    private final ObjectMapper objectMapper;
    private final BakongService bakongService;
    private final TransactionStatusMapper transactionStatusMapper;

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        String requestUrl = getRequestUrl(session);
        String username = getAuthenticatedUser(session);

        log.info("WebSocket connection established session=[{}], authUser=[{}]", session.getId(), username);

        return session.receive()
                .map(WebSocketMessage::getPayloadAsText)
                .flatMap(this::parseRequest)
                .concatMap(request -> streamTransaction(session, request, requestUrl, username))
                .onErrorResume(ex -> sendErrorMessage(session, ex))
                .doFinally(signal -> log.info("WebSocket session ended session=[{}], signal=[{}]", session.getId(), signal))
                .then();
    }

    private Flux<WebSocketMessage> streamTransaction(
            WebSocketSession session,
            TransactionSocketRequest request,
            String requestUrl,
            String username
    ) {
        log.info("Starting WebSocket transaction stream md5={} intervalSeconds={} authUser={}",
                request.getMd5(),
                request.getIntervalSeconds(),
                username);

        return Flux.interval(Duration.ZERO, Duration.ofSeconds(request.getIntervalSeconds()))
                .concatMap(tick -> bakongService.checkTransactionByMD5(new CheckTransactionRequest(request.getMd5()), requestUrl)
                        .map(response -> buildSuccessMessage(session, requestUrl, response, tick)))
                .takeUntil(message -> isTerminal(message))
                .doOnCancel(() -> log.warn("Stopping WebSocket stream due to client disconnect md5={}", request.getMd5()));
    }

    private Mono<TransactionSocketRequest> parseRequest(String payload) {
        try {
            TransactionSocketRequest request = objectMapper.readValue(payload, TransactionSocketRequest.class);
            if (!hasText(request.getMd5())) {
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
            String payload = message.getPayloadAsText();
            return payload.contains("\"terminal\":true");
        } catch (Exception e) {
            return false;
        }
    }

    private Mono<WebSocketMessage> sendErrorMessage(WebSocketSession session, Throwable ex) {
        log.error("WebSocket stream error on session=[{}]: {}", session.getId(), ex.getMessage());
        ApiResponse<Void> body = ApiResponse.error(ex.getMessage());
        return Mono.just(session.textMessage(toJson(body)));
    }

    private String getRequestUrl(WebSocketSession session) {
        URI uri = session.getHandshakeInfo().getUri();
        return uri != null ? uri.toString() : "ws://localhost:7073/ws/bakong/check-transaction";
    }

    private String getAuthenticatedUser(WebSocketSession session) {
        Object attr = session.getAttributes().get(ApiKeyContext.REQUEST_ATTR);
        if (attr instanceof ApiKeyContext context && context.getProjectCode() != null) {
            return context.getProjectCode();
        }
        return "ANONYMOUS";
    }

    private String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            return "{\"success\":false,\"message\":\"JSON serialization error\"}";
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
