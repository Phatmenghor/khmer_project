package com.emenu.features.storage.service.impl;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.config.storage.StorageProperties;
import com.emenu.features.storage.dto.response.StorageMultiUploadResponse;
import com.emenu.features.storage.dto.response.StorageUploadResponse;
import com.emenu.features.storage.model.StorageResource;
import com.emenu.features.storage.repository.StorageResourceRepository;
import com.emenu.features.storage.service.StorageService;
import com.emenu.features.storage.util.StorageKeyUtil;
import com.emenu.features.storage.util.StorageNameUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageServiceImpl implements StorageService {

    private final S3Client storageS3Client;
    private final StorageProperties storageProperties;
    private final StorageResourceRepository storageResourceRepository;

    // ── Upload ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public StorageUploadResponse upload(MultipartFile file, String customPath, ApiKeyContext ctx) {
        try {
            byte[] original = file.getBytes();
            String name = StorageNameUtil.generateName();
            String originalFilename = file.getOriginalFilename();

            String resolvedPath = StorageKeyUtil.resolvePath(ctx.getPath(), customPath);

            StorageUploadResponse response = uploadResized(original, ctx.getProjectCode(), resolvedPath, name, 0, originalFilename);

            log.info("[{}][{}] Uploaded: {}", ctx.getProjectCode(), resolvedPath, name);
            return response;
        } catch (IOException e) {
            log.error("[{}][{}] Upload failed: {}", ctx.getProjectCode(), customPath, e.getMessage());
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public StorageMultiUploadResponse uploadMulti(MultipartFile file, String customPath, ApiKeyContext ctx) {
        try {
            byte[] original = file.getBytes();
            String base = StorageNameUtil.generateBase();
            String originalFilename = file.getOriginalFilename();

            String resolvedPath = StorageKeyUtil.resolvePath(ctx.getPath(), customPath);

            StorageUploadResponse sm = uploadResized(original, ctx.getProjectCode(), resolvedPath, base + "-sm.jpg", 300, originalFilename);
            StorageUploadResponse md = uploadResized(original, ctx.getProjectCode(), resolvedPath, base + "-md.jpg", 600, originalFilename);
            StorageUploadResponse o  = uploadResized(original, ctx.getProjectCode(), resolvedPath, base + ".jpg", 0, originalFilename);

            log.info("[{}][{}] Uploaded sm/md/o: {}", ctx.getProjectCode(), resolvedPath, base);
            return StorageMultiUploadResponse.builder()
                    .key(o.getKey())
                    .url(o.getUrl())
                    .sm(sm)
                    .md(md)
                    .o(o)
                    .build();
        } catch (IOException e) {
            log.error("[{}][{}] Upload failed: {}", ctx.getProjectCode(), customPath, e.getMessage());
            throw new RuntimeException("Multi-size image upload failed: " + e.getMessage());
        }
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteAll(String customPath, ApiKeyContext ctx) {
        String resolvedPath = StorageKeyUtil.resolvePath(ctx.getPath(), customPath);
        String prefix = StorageKeyUtil.prefix(resolvedPath);
        deleteByPrefix(prefix);
        storageResourceRepository.deleteByProjectCodeAndPath(ctx.getProjectCode(), resolvedPath);
        log.info("[{}][{}] Deleted all objects", ctx.getProjectCode(), resolvedPath);
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    private StorageUploadResponse uploadResized(byte[] original, String projectCode, String resolvedPath,
                                               String name, int maxWidth,
                                               String originalFilename) throws IOException {
        String key = StorageKeyUtil.key(resolvedPath, name);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        var builder = Thumbnails.of(new ByteArrayInputStream(original))
                .outputFormat("jpg")
                .outputQuality(0.85);

        if (maxWidth > 0) {
            BufferedImage img = javax.imageio.ImageIO.read(new ByteArrayInputStream(original));
            int targetWidth = Math.min(img.getWidth(), maxWidth);
            builder = builder.width(targetWidth);
        } else {
            builder = builder.scale(1.0);
        }
        builder.toOutputStream(out);

        byte[] bytes = out.toByteArray();

        storageS3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(storageProperties.getBucket())
                        .key(key)
                        .contentType("image/jpeg")
                        .contentLength((long) bytes.length)
                        .acl(ObjectCannedACL.PUBLIC_READ)
                        .build(),
                RequestBody.fromBytes(bytes)
        );

        String url = storageProperties.getCdnBaseUrl() + "/" + key;

        storageResourceRepository.save(StorageResource.builder()
                .projectCode(projectCode)
                .path(resolvedPath)
                .objectKey(key)
                .url(url)
                .originalFilename(originalFilename)
                .fileSize((long) bytes.length)
                .build());

        return StorageUploadResponse.builder().key(key).url(url).build();
    }

    private List<String> deleteByPrefix(String prefix) {
        List<ObjectIdentifier> toDelete = new ArrayList<>();

        ListObjectsV2Request listReq = ListObjectsV2Request.builder()
                .bucket(storageProperties.getBucket())
                .prefix(prefix)
                .build();

        ListObjectsV2Response page;
        do {
            page = storageS3Client.listObjectsV2(listReq);
            page.contents().forEach(obj ->
                    toDelete.add(ObjectIdentifier.builder().key(obj.key()).build())
            );
            listReq = listReq.toBuilder().continuationToken(page.nextContinuationToken()).build();
        } while (Boolean.TRUE.equals(page.isTruncated()));

        if (toDelete.isEmpty()) return List.of();

        for (int i = 0; i < toDelete.size(); i += 1000) {
            List<ObjectIdentifier> batch = toDelete.subList(i, Math.min(i + 1000, toDelete.size()));
            storageS3Client.deleteObjects(DeleteObjectsRequest.builder()
                    .bucket(storageProperties.getBucket())
                    .delete(Delete.builder().objects(batch).build())
                    .build());
        }

        log.info("Deleted {} objects with prefix: {}", toDelete.size(), prefix);
        return toDelete.stream().map(ObjectIdentifier::key).toList();
    }
}
