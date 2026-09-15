package com.emenu.features.bakong.service.impl;

import com.emenu.config.bakong.BakongProperties;
import com.emenu.exception.BusinessException;
import com.emenu.features.bakong.service.BakongProxyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
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
            log.warn("Proxy request failed: [{}] [{}] status=[{}] body=[{}]", method, targetUrl, rce.getStatusCode(), responseBody);
            HttpStatus status = HttpStatus.resolve(rce.getStatusCode().value());
            throw BusinessException.of(
                    "Bakong payment service returned error: " + (responseBody != null && !responseBody.isBlank() ? responseBody : rce.getStatusText()),
                    status != null ? status : HttpStatus.BAD_GATEWAY,
                    "BAKONG_SERVICE_ERROR"
            );
        } catch (ResourceAccessException rae) {
            log.warn("Bakong payment service unreachable: [{}] [{}] error=[{}]", method, targetUrl, rae.getMessage());
            throw BusinessException.of(
                    "Bakong payment service is currently unreachable. Please verify that the service is running.",
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "SERVICE_UNAVAILABLE"
            );
        } catch (Exception e) {
            log.warn("Proxy request error: [{}] [{}] error=[{}]", method, targetUrl, e.getMessage());
            throw BusinessException.of(
                    "Failed to communicate with Bakong payment service: " + e.getMessage(),
                    HttpStatus.BAD_GATEWAY,
                    "SERVICE_COMMUNICATION_ERROR"
            );
        }
    }
}
