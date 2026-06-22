package com.emenu.features.spaces.service.impl;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.config.spaces.SpacesProperties;
import com.emenu.features.spaces.dto.response.SpacesMultiUploadResponse;
import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import com.emenu.features.spaces.model.SpacesImage;
import com.emenu.features.spaces.repository.SpacesImageRepository;
import com.emenu.features.spaces.service.SpacesService;
import com.emenu.features.spaces.util.StorageKeyUtil;
import com.emenu.features.spaces.util.StorageNameUtil;
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
public class SpacesServiceImpl implements SpacesService {

    private final S3Client spacesS3Client;
    private final SpacesProperties spacesProperties;
    private final SpacesImageRepository spacesImageRepository;

    // ── Upload ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public SpacesMultiUploadResponse upload(MultipartFile file, String customPath, ApiKeyContext ctx) {
        try {
            byte[] original = file.getBytes();
            String base = StorageNameUtil.generateBase();
            String originalFilename = file.getOriginalFilename();

            String resolvedPath = StorageKeyUtil.resolvePath(ctx.getPath(), customPath);

            SpacesUploadResponse sm = uploadResized(original, ctx.getProjectCode(), resolvedPath, base + "-sm.jpg", 300, originalFilename);
            SpacesUploadResponse md = uploadResized(original, ctx.getProjectCode(), resolvedPath, base + "-md.jpg", 600, originalFilename);
            SpacesUploadResponse o  = uploadResized(original, ctx.getProjectCode(), resolvedPath, base + ".jpg", 0, originalFilename);

            log.info("[{}][{}] Uploaded sm/md/o: {}", ctx.getProjectCode(), resolvedPath, base);
            return SpacesMultiUploadResponse.builder()
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
        spacesImageRepository.deleteByProjectCodeAndPath(ctx.getProjectCode(), resolvedPath);
        log.info("[{}][{}] Deleted all objects", ctx.getProjectCode(), resolvedPath);
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    private SpacesUploadResponse uploadResized(byte[] original, String projectCode, String resolvedPath,
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
                .projectCode(projectCode)
                .path(resolvedPath)
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
}
