package com.emenu.features.apikey.repository;

import com.emenu.features.apikey.model.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApiKeyRepository extends JpaRepository<ApiKey, String> {

    Optional<ApiKey> findByApiKeyAndActiveTrue(String apiKey);
}
