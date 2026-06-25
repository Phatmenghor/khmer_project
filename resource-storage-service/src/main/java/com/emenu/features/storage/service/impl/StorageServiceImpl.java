package com.emenu.features.storage.service.impl;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.config.storage.StorageProperties;
import com.emenu.features.storage.dto.response.StorageDeleteResponse;
import com.emenu.features.storage.dto.response.StorageMultiUploadResponse;
import com.emenu.features.storage.dto.response.StorageUploadResponse;
import com.emenu.features.storage.model.StorageResource;
import com.emenu.features.storage.repository.StorageResourceRepository;
import com.emenu.features.storage.service.StorageAuditService;
import com.emenu.features.storage.service.StorageService;
import com.emenu.features.storage.util.StorageKeyUtil;
import com.emenu.features.storage.util.StorageNameUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageServiceImpl implements StorageService {

    private final S3Client storageS3Client;
    private final StorageProperties storageProperties;
    private final StorageResourceRepository storageResourceRepository;
    private final StorageAuditService storageAuditService;

    @Qualifier("taskExecutor")
    private final Executor taskExecutor;

    // ── Upload ───────────────────────────────────────────────────────────────

    @Override
    public StorageUploadResponse upload(MultipartFile file, String customPath, ApiKeyContext ctx) {
        try {
            byte[] decodable = ensureDecodable(file.getBytes(), file.getOriginalFilename());
            String name = StorageNameUtil.generateName();
            String originalFilename = file.getOriginalFilename();
            String resolvedPath = StorageKeyUtil.resolvePath(ctx.getPath(), customPath);

            StorageUploadResponse response = uploadResized(decodable, ctx.getProjectCode(), resolvedPath, name, 0, originalFilename);

            log.info("[{}][{}] Upload succeeded: key=[{}]", ctx.getProjectCode(), resolvedPath, response.getKey());
            return response;
        } catch (Exception e) {
            log.error("[{}][{}] Upload failed: {}", ctx.getProjectCode(), customPath, e.getMessage(), e);
            throw new RuntimeException("Image upload failed: " + e.getMessage(), e);
        }
    }

    @Override
    public StorageMultiUploadResponse uploadMulti(MultipartFile file, String customPath, ApiKeyContext ctx) {
        try {
            byte[] decodable = ensureDecodable(file.getBytes(), file.getOriginalFilename());
            String base = StorageNameUtil.generateBase();
            String originalFilename = file.getOriginalFilename();
            String resolvedPath = StorageKeyUtil.resolvePath(ctx.getPath(), customPath);

            // Run the 3 size variants concurrently — each does CPU-bound resize + a blocking S3
            // put, so doing them sequentially on the request thread triples the response latency.
            // MDC (traceId etc.) is copied across since taskExecutor threads don't inherit it.
            var mdcContext = MDC.getCopyOfContextMap();
            CompletableFuture<StorageUploadResponse> smF = CompletableFuture.supplyAsync(
                    withMdc(mdcContext, () -> uploadResizedUnchecked(decodable, ctx.getProjectCode(), resolvedPath, base + "-sm.jpg", 300, originalFilename)), taskExecutor);
            CompletableFuture<StorageUploadResponse> mdF = CompletableFuture.supplyAsync(
                    withMdc(mdcContext, () -> uploadResizedUnchecked(decodable, ctx.getProjectCode(), resolvedPath, base + "-md.jpg", 600, originalFilename)), taskExecutor);
            CompletableFuture<StorageUploadResponse> oF = CompletableFuture.supplyAsync(
                    withMdc(mdcContext, () -> uploadResizedUnchecked(decodable, ctx.getProjectCode(), resolvedPath, base + ".jpg", 0, originalFilename)), taskExecutor);

            CompletableFuture.allOf(smF, mdF, oF).join();
            StorageUploadResponse sm = smF.join();
            StorageUploadResponse md = mdF.join();
            StorageUploadResponse o = oF.join();

            log.info("[{}][{}] Multi-upload succeeded: base=[{}]", ctx.getProjectCode(), resolvedPath, base);
            return StorageMultiUploadResponse.builder()
                    .key(o.getKey())
                    .url(o.getUrl())
                    .sm(sm)
                    .md(md)
                    .o(o)
                    .build();
        } catch (Exception e) {
            log.error("[{}][{}] Multi-upload failed: {}", ctx.getProjectCode(), customPath, e.getMessage(), e);
            throw new RuntimeException("Multi-size image upload failed: " + e.getMessage(), e);
        }
    }

    private StorageUploadResponse uploadResizedUnchecked(byte[] decodable, String projectCode, String resolvedPath,
                                                           String name, int maxWidth, String originalFilename) {
        try {
            return uploadResized(decodable, projectCode, resolvedPath, name, maxWidth, originalFilename);
        } catch (IOException e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    private java.util.function.Supplier<StorageUploadResponse> withMdc(
            java.util.Map<String, String> mdcContext, java.util.function.Supplier<StorageUploadResponse> task) {
        return () -> {
            if (mdcContext != null) {
                MDC.setContextMap(mdcContext);
            }
            try {
                return task.get();
            } finally {
                MDC.clear();
            }
        };
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    @Override
    public StorageDeleteResponse deleteAll(String path) {
        String prefix = StorageKeyUtil.prefix(path);
        List<String> deletedKeys = deleteByPrefix(prefix);
        storageResourceRepository.deleteByPath(path);

        log.info("[{}] Delete-all succeeded: deletedCount=[{}]", path, deletedKeys.size());
        return StorageDeleteResponse.builder()
                .path(path)
                .deletedCount(deletedKeys.size())
                .build();
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    /**
     * Resizes (if requested), uploads to S3, and responds immediately on success.
     * The audit row is persisted asynchronously so the DB write never blocks the response.
     */
    private StorageUploadResponse uploadResized(byte[] decodable, String projectCode, String resolvedPath,
                                                 String name, int maxWidth,
                                                 String originalFilename) throws IOException {
        String key = StorageKeyUtil.key(resolvedPath, name);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        var builder = Thumbnails.of(new ByteArrayInputStream(decodable))
                .outputFormat("jpg")
                .outputQuality(0.85);

        if (maxWidth > 0) {
            BufferedImage img = javax.imageio.ImageIO.read(new ByteArrayInputStream(decodable));
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

        storageAuditService.saveAsync(StorageResource.builder()
                .projectCode(projectCode)
                .path(resolvedPath)
                .objectKey(key)
                .url(url)
                .originalFilename(originalFilename)
                .fileSize((long) bytes.length)
                .build());

        return StorageUploadResponse.builder().key(key).url(url).build();
    }

    /**
     * ImageIO can't decode AVIF/HEIC and a few other modern formats out of the box.
     * Falls back to ffmpeg (must be installed on the host) to re-encode those into
     * a JPEG that the rest of the pipeline (Thumbnails/ImageIO) can read normally.
     */
    private byte[] ensureDecodable(byte[] original, String originalFilename) throws IOException {
        if (javax.imageio.ImageIO.read(new ByteArrayInputStream(original)) != null) {
            return original;
        }

        log.info("ImageIO could not decode [{}] directly, converting via ffmpeg", originalFilename);
        byte[] converted = convertWithFfmpeg(original);

        if (javax.imageio.ImageIO.read(new ByteArrayInputStream(converted)) == null) {
            throw new IOException("Unsupported or corrupt image format: " + originalFilename);
        }
        return converted;
    }

    private byte[] convertWithFfmpeg(byte[] original) throws IOException {
        Process process = new ProcessBuilder(
                "ffmpeg", "-y", "-i", "pipe:0", "-frames:v", "1", "-f", "image2", "-vcodec", "mjpeg", "pipe:1"
        ).start();

        Thread stdinWriter = new Thread(() -> {
            try (var stdin = process.getOutputStream()) {
                stdin.write(original);
            } catch (IOException ignored) {
                // process may have already exited/closed its stdin on a decode failure
            }
        });
        stdinWriter.start();

        byte[] converted;
        try (InputStream stdout = process.getInputStream()) {
            converted = stdout.readAllBytes();
        }

        try {
            stdinWriter.join(15_000);
            boolean finished = process.waitFor(15, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new IOException("ffmpeg conversion timed out");
            }
            if (process.exitValue() != 0 || converted.length == 0) {
                throw new IOException("ffmpeg could not decode image (exit=" + process.exitValue() + ")");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("ffmpeg conversion interrupted", e);
        }

        return converted;
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

        log.info("Deleted {} object(s) with prefix: {}", toDelete.size(), prefix);
        return toDelete.stream().map(ObjectIdentifier::key).toList();
    }
}
