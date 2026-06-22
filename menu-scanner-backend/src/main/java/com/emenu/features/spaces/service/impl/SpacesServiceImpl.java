package com.emenu.features.spaces.service.impl;

import com.emenu.config.spaces.SpacesProperties;
import com.emenu.features.spaces.dto.response.SpacesMultiUploadResponse;
import com.emenu.features.spaces.service.SpacesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Proxy implementation — forwards every call to resource-storage-service.
 *
 * <p>This project's single API key already carries projectCode + pathStore;
 * each upload scope (business / owner / customer) is passed as the dynamic
 * {@code path} (customPath) on the multipart request body.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SpacesServiceImpl implements SpacesService {

    private final SpacesProperties spacesProperties;
    private final RestTemplate restTemplate = new RestTemplate();

    // ── Upload ───────────────────────────────────────────────────────────────

    @Override
    public SpacesMultiUploadResponse upload(MultipartFile file, String path) {
        try {
            String url = spacesProperties.getServiceUrl() + "/api/v1/storage/upload/multi";

            HttpEntity<MultiValueMap<String, Object>> entity = buildMultipart(file, path, spacesProperties.getApiKey());
            SpacesMultiUploadResponse response = restTemplate.postForObject(url, entity, SpacesMultiUploadResponse.class);
            log.info("Proxy upload succeeded: path=[{}], key=[{}]", path, response != null ? response.getKey() : null);
            return response;
        } catch (Exception e) {
            log.error("Proxy upload failed: path=[{}], error=[{}]", path, e.getMessage());
            throw new RuntimeException("Storage service error: " + e.getMessage(), e);
        }
    }

    @Override
    public SpacesMultiUploadResponse uploadForBusiness(MultipartFile file) {
        return upload(file, "business");
    }

    @Override
    public SpacesMultiUploadResponse uploadForOwner(MultipartFile file) {
        return upload(file, "owner");
    }

    @Override
    public SpacesMultiUploadResponse uploadForCustomer(MultipartFile file) {
        return upload(file, "customer");
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    private HttpEntity<MultiValueMap<String, Object>> buildMultipart(MultipartFile file, String path, String apiKey) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });
            body.add("path", path);

            HttpHeaders h = headers(apiKey);
            h.setContentType(MediaType.MULTIPART_FORM_DATA);
            return new HttpEntity<>(body, h);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file bytes: " + e.getMessage(), e);
        }
    }

    private HttpHeaders headers(String apiKey) {
        HttpHeaders h = new HttpHeaders();
        h.set("X-API-Key", apiKey);
        return h;
    }
}
