package com.emenu.shared.logging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class RestTemplateLoggingInterceptor implements ClientHttpRequestInterceptor {

    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
        String method = request.getMethod().name();
        String uri = request.getURI().toString();
        log.info("Outbound HTTP Request: Method={}, URI={}", method, uri);

        long start = System.currentTimeMillis();
        try {
            ClientHttpResponse response = execution.execute(request, body);
            long duration = System.currentTimeMillis() - start;
            log.info("Outbound HTTP Response: Method={}, URI={} [Status={}, Duration={}ms]", 
                    method, uri, response.getStatusCode(), duration);
            return response;
        } catch (IOException ex) {
            long duration = System.currentTimeMillis() - start;
            log.error("Outbound HTTP Request Failed: Method={}, URI={} [Duration={}ms] with message={}", 
                    method, uri, duration, ex.getMessage());
            throw ex;
        }
    }
}
