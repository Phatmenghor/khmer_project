package com.emenu.features.spaces.service.impl;

import com.emenu.config.spaces.SpacesProperties;
import com.emenu.features.spaces.dto.response.SpacesImageResponse;
import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import com.emenu.features.spaces.model.SpacesImage;
import com.emenu.features.spaces.repository.SpacesImageRepository;
import com.emenu.features.spaces.service.SpacesService;
import com.emenu.features.spaces.util.StorageKeyUtil;
import com.emenu.features.spaces.util.StorageNameUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpacesServiceImpl implements SpacesService {

    private final S3Client spacesS3Client;
    private final SpacesProperties spacesProperties;
    private final SpacesImageRepository spacesImageRepository;

    @Override
    @Transactional
    public SpacesUploadResponse upload(MultipartFile file, UUID businessId) {
        String name = StorageNameUtil.generateName();
        String key = StorageKeyUtil.key(businessId, name);
        String contentType = file.getContentType() != null ? file.getContentType() : "image/webp";

        try {
            spacesS3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(spacesProperties.getBucket())
                            .key(key)
                            .contentType(contentType)
                            .contentLength(file.getSize())
                            .acl(ObjectCannedACL.PUBLIC_READ)
                            .build(),
                    RequestBody.fromBytes(file.getBytes())
            );
        } catch (IOException e) {
            log.error("Upload failed for key {}: {}", key, e.getMessage());
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }

        String url = spacesProperties.getCdnBaseUrl() + "/" + key;

        spacesImageRepository.save(SpacesImage.builder()
                .businessId(businessId)
                .objectKey(key)
                .url(url)
                .originalFilename(file.getOriginalFilename())
                .fileSize(file.getSize())
                .build());

        log.info("Uploaded: {}", key);
        return SpacesUploadResponse.builder().key(key).url(url).build();
    }

    @Override
    @Transactional
    public void deleteByKey(String key) {
        spacesS3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(spacesProperties.getBucket())
                .key(key)
                .build());
        spacesImageRepository.deleteByObjectKey(key);
        log.info("Deleted: {}", key);
    }

    @Override
    @Transactional
    public void deleteByDate(UUID businessId, String datePrefix) {
        String fullPrefix = "b/" + businessId + "/" + datePrefix;
        List<String> deletedKeys = deleteByPrefix(fullPrefix);
        deletedKeys.forEach(spacesImageRepository::deleteByObjectKey);
        log.info("Deleted {} objects for date prefix {} (business {})",
                deletedKeys.size(), datePrefix, businessId);
    }

    @Override
    @Transactional
    public void deleteAllByBusiness(UUID businessId) {
        deleteByPrefix(StorageKeyUtil.businessPrefix(businessId));
        spacesImageRepository.deleteByBusinessId(businessId);
        log.info("Deleted all objects for business {}", businessId);
    }

    @Override
    public List<SpacesImageResponse> getByBusiness(UUID businessId) {
        return spacesImageRepository
                .findByBusinessIdOrderByCreatedAtDesc(businessId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    private List<String> deleteByPrefix(String prefix) {
        List<ObjectIdentifier> toDelete = new ArrayList<>();

        ListObjectsV2Request listReq = ListObjectsV2Request.builder()
                .bucket(spacesProperties.getBucket())
                .prefix(prefix)
                .build();

        ListObjectsV2Response page;
        do {
            page = spacesS3Client.listObjectsV2(listReq);
            page.contents().forEach(obj ->
                    toDelete.add(ObjectIdentifier.builder().key(obj.key()).build())
            );
            listReq = listReq.toBuilder().continuationToken(page.nextContinuationToken()).build();
        } while (Boolean.TRUE.equals(page.isTruncated()));

        if (toDelete.isEmpty()) return List.of();

        for (int i = 0; i < toDelete.size(); i += 1000) {
            List<ObjectIdentifier> batch = toDelete.subList(i, Math.min(i + 1000, toDelete.size()));
            spacesS3Client.deleteObjects(DeleteObjectsRequest.builder()
                    .bucket(spacesProperties.getBucket())
                    .delete(Delete.builder().objects(batch).build())
                    .build());
        }

        log.info("Deleted {} objects with prefix: {}", toDelete.size(), prefix);
        return toDelete.stream().map(ObjectIdentifier::key).toList();
    }

    private SpacesImageResponse toResponse(SpacesImage image) {
        return SpacesImageResponse.builder()
                .id(image.getId())
                .businessId(image.getBusinessId())
                .objectKey(image.getObjectKey())
                .url(image.getUrl())
                .originalFilename(image.getOriginalFilename())
                .fileSize(image.getFileSize())
                .createdAt(image.getCreatedAt())
                .build();
    }
}
