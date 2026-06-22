package com.emenu.config.security.repository;

import com.emenu.config.security.model.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {

    Optional<ApiKey> findByApiKeyAndActiveTrue(String apiKey);
}
