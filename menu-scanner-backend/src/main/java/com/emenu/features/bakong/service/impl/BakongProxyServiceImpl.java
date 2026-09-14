package com.emenu.features.bakong.service.impl;

import com.emenu.config.bakong.BakongProperties;
import com.emenu.features.bakong.service.BakongProxyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class BakongProxyServiceImpl implements BakongProxyService {

    private final BakongProperties bakongProperties;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public <T> T proxyRequest(String path, HttpMethod method, Object requestBody, Class<T> responseType) {
        String targetUrl = bakongProperties.getServiceUrl() + path;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-API-Key", bakongProperties.getApiKey());

            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<T> response = restTemplate.exchange(targetUrl, method, entity, responseType);

            log.info("Successfully proxied [{}] request to [{}] -> status [{}]", method, targetUrl, response.getStatusCode());
            return response.getBody();
        } catch (RestClientResponseException rce) {
            String responseBody = rce.getResponseBodyAsString();
            log.error("Proxy request failed: [{}] [{}] status=[{}] body=[{}]", method, targetUrl, rce.getStatusCode(), responseBody);
            throw new RuntimeException("Bakong payment service error (" + rce.getStatusCode() + "): " + responseBody, rce);
        } catch (Exception e) {
            log.error("Proxy request error: [{}] [{}] error=[{}]", method, targetUrl, e.getMessage());
            throw new RuntimeException("Failed to communicate with Bakong payment service: " + e.getMessage(), e);
        }
    }
}
