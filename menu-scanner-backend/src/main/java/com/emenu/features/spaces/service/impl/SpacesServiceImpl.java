package com.emenu.features.spaces.service.impl;

import com.emenu.config.spaces.SpacesProperties;
import com.emenu.features.spaces.dto.response.SpacesImageResponse;
import com.emenu.features.spaces.dto.response.SpacesMultiUploadResponse;
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
import net.coobird.thumbnailator.Thumbnails;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.ByteArrayOutputStream;
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

        byte[] imageBytes;
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Thumbnails.of(file.getInputStream())
                    .scale(1.0)
                    .outputFormat("jpg")
                    .outputQuality(0.85)
                    .toOutputStream(out);
            imageBytes = out.toByteArray();
        } catch (IOException e) {
            log.error("Image conversion failed for business {}: {}", businessId, e.getMessage());
            throw new RuntimeException("Image conversion failed: " + e.getMessage());
        }

        try {
            spacesS3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(spacesProperties.getBucket())
                            .key(key)
                            .contentType("image/jpeg")
                            .contentLength((long) imageBytes.length)
                            .acl(ObjectCannedACL.PUBLIC_READ)
                            .build(),
                    RequestBody.fromBytes(imageBytes)
            );
        } catch (Exception e) {
            log.error("Upload failed for key {}: {}", key, e.getMessage());
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }

        String url = spacesProperties.getCdnBaseUrl() + "/" + key;

        spacesImageRepository.save(SpacesImage.builder()
                .businessId(businessId)
                .objectKey(key)
                .url(url)
                .originalFilename(file.getOriginalFilename())
                .fileSize((long) imageBytes.length)
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

    @Override
    @Transactional
    public SpacesMultiUploadResponse uploadMulti(MultipartFile file, UUID businessId) {
        try {
            byte[] original = file.getBytes();
            String base = StorageNameUtil.generateBase();

            SpacesUploadResponse sm = uploadResized(original, businessId, base + "-sm.jpg", 300, file.getOriginalFilename());
            SpacesUploadResponse md = uploadResized(original, businessId, base + "-md.jpg", 600, file.getOriginalFilename());
            SpacesUploadResponse o  = uploadResized(original, businessId, base + ".jpg",    0,    file.getOriginalFilename());

            log.info("Uploaded multi-size for business {}: {}", businessId, base);
            return SpacesMultiUploadResponse.builder().sm(sm).md(md).o(o).build();
        } catch (IOException e) {
            log.error("Multi upload failed for business {}: {}", businessId, e.getMessage());
            throw new RuntimeException("Multi-size image upload failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public SpacesMultiUploadResponse uploadMultiOwner(MultipartFile file) {
        try {
            byte[] original = file.getBytes();
            String base = StorageNameUtil.generateBase();

            SpacesUploadResponse sm = uploadResizedOwner(original, base + "-sm.jpg", 300, file.getOriginalFilename());
            SpacesUploadResponse md = uploadResizedOwner(original, base + "-md.jpg", 600, file.getOriginalFilename());
            SpacesUploadResponse o  = uploadResizedOwner(original, base + ".jpg",    0,   file.getOriginalFilename());

            log.info("Uploaded multi-size owner: {}", base);
            return SpacesMultiUploadResponse.builder().sm(sm).md(md).o(o).build();
        } catch (IOException e) {
            log.error("Owner multi upload failed: {}", e.getMessage());
            throw new RuntimeException("Multi-size image upload failed: " + e.getMessage());
        }
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    /** Resize and upload to owner/yyyy-MM-dd/ — no businessId involved */
    private SpacesUploadResponse uploadResizedOwner(byte[] original,
                                                    String name, int maxWidth, String originalFilename) throws IOException {
        String key = StorageKeyUtil.ownerKey(name);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        var builder = Thumbnails.of(new java.io.ByteArrayInputStream(original))
                .outputFormat("jpg")
                .outputQuality(0.85);

        if (maxWidth > 0) {
            java.awt.image.BufferedImage img = javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(original));
            int targetWidth = Math.min(img.getWidth(), maxWidth);
            builder = builder.width(targetWidth);
        } else {
            builder = builder.scale(1.0);
        }
        builder.toOutputStream(out);

        byte[] bytes = out.toByteArray();

        spacesS3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(spacesProperties.getBucket())
                        .key(key)
                        .contentType("image/jpeg")
                        .contentLength((long) bytes.length)
                        .acl(ObjectCannedACL.PUBLIC_READ)
                        .build(),
                RequestBody.fromBytes(bytes)
        );

        String url = spacesProperties.getCdnBaseUrl() + "/" + key;

        spacesImageRepository.save(SpacesImage.builder()
                .objectKey(key)
                .url(url)
                .originalFilename(originalFilename)
                .fileSize((long) bytes.length)
                .build());

        return SpacesUploadResponse.builder().key(key).url(url).build();
    }

    private SpacesUploadResponse uploadResized(byte[] original, UUID businessId,
                                               String name, int maxWidth, String originalFilename) throws IOException {
        String key = StorageKeyUtil.key(businessId, name);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        var builder = Thumbnails.of(new java.io.ByteArrayInputStream(original))
                .outputFormat("jpg")
                .outputQuality(0.85);

        if (maxWidth > 0) {
            // only downscale — never upscale smaller images
            java.awt.image.BufferedImage img = javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(original));
            int targetWidth = Math.min(img.getWidth(), maxWidth);
            builder = builder.width(targetWidth);
        } else {
            builder = builder.scale(1.0);
        }
        builder.toOutputStream(out);

        byte[] bytes = out.toByteArray();

        spacesS3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(spacesProperties.getBucket())
                        .key(key)
                        .contentType("image/jpeg")
                        .contentLength((long) bytes.length)
                        .acl(ObjectCannedACL.PUBLIC_READ)
                        .build(),
                RequestBody.fromBytes(bytes)
        );

        String url = spacesProperties.getCdnBaseUrl() + "/" + key;

        spacesImageRepository.save(SpacesImage.builder()
                .businessId(businessId)
                .objectKey(key)
                .url(url)
                .originalFilename(originalFilename)
                .fileSize((long) bytes.length)
                .build());

        return SpacesUploadResponse.builder().key(key).url(url).build();
    }

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
