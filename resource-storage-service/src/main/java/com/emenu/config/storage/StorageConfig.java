package com.emenu.config.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

@Configuration
@RequiredArgsConstructor
public class StorageConfig {

    private final StorageProperties properties;

    @Bean
    public S3Client storageS3Client() {
        String endpoint = properties.getEndpoint();
        if (endpoint == null || endpoint.isBlank()) {
            endpoint = "https://sgp1.digitaloceanspaces.com";
        }
        String region = properties.getRegion();
        if (region == null || region.isBlank()) {
            region = "sgp1";
        }
        String accessKey = properties.getAccessKey();
        if (accessKey == null || accessKey.isBlank()) {
            accessKey = "dummy_access_key";
        }
        String secretKey = properties.getSecretKey();
        if (secretKey == null || secretKey.isBlank()) {
            secretKey = "dummy_secret_key";
        }

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKey, secretKey)
                        )
                )
                .forcePathStyle(true)
                .build();
    }
}
