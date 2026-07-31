package com.emenu.features.storage.service.impl;

import com.emenu.config.exception.UnsupportedImageFormatException;
import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.config.storage.StorageProperties;
import com.emenu.features.storage.dto.response.StorageDeleteResponse;
import com.emenu.features.storage.dto.response.StorageMultiUploadResponse;
import com.emenu.features.storage.dto.response.StorageUploadResponse;
import com.emenu.features.storage.model.StorageBase64;
import com.emenu.features.storage.model.StorageResource;
import com.emenu.features.storage.repository.StorageBase64Repository;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageServiceImpl implements StorageService {

    private final S3Client storageS3Client;
    private final StorageProperties storageProperties;
    private final StorageResourceRepository storageResourceRepository;
    private final StorageBase64Repository storageBase64Repository;
    private final StorageAuditService storageAuditService;

    @Qualifier("taskExecutor")
    private final Executor taskExecutor;

    @Override
    public StorageUploadResponse upload(MultipartFile file, String customPath, ApiKeyContext ctx) {
        try {
            byte[] decodable = ensureDecodable(file.getBytes(), file.getOriginalFilename());
            String name = StorageNameUtil.generateName();
            String originalFilename = file.getOriginalFilename();
            String resolvedPath = StorageKeyUtil.resolvePath(ctx.getPath(), customPath);

            StorageUploadResponse response = uploadResized(decodable, ctx.getProjectCode(), resolvedPath, name, 0, originalFilename, ctx.getApiKey());

            log.info("[{}][{}] Upload succeeded: key=[{}]", ctx.getProjectCode(), resolvedPath, response.getKey());
            return response;
        } catch (UnsupportedImageFormatException e) {
            throw e;
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
            String apiKey = ctx.getApiKey();

            var mdcContext = MDC.getCopyOfContextMap();
            CompletableFuture<StorageUploadResponse> smF = CompletableFuture.supplyAsync(
                    withMdc(mdcContext, () -> uploadResizedUnchecked(decodable, ctx.getProjectCode(), resolvedPath, base + "-sm.jpg", 300, originalFilename, apiKey)), taskExecutor);
            CompletableFuture<StorageUploadResponse> mdF = CompletableFuture.supplyAsync(
                    withMdc(mdcContext, () -> uploadResizedUnchecked(decodable, ctx.getProjectCode(), resolvedPath, base + "-md.jpg", 600, originalFilename, apiKey)), taskExecutor);
            CompletableFuture<StorageUploadResponse> oF = CompletableFuture.supplyAsync(
                    withMdc(mdcContext, () -> uploadResizedUnchecked(decodable, ctx.getProjectCode(), resolvedPath, base + ".jpg", 0, originalFilename, apiKey)), taskExecutor);

            CompletableFuture.allOf(smF, mdF, oF).join();
            StorageUploadResponse sm = smF.join();
            StorageUploadResponse md = mdF.join();
            StorageUploadResponse o = oF.join();

            log.info("[{}][{}] Multi-upload succeeded: base=[{}]", ctx.getProjectCode(), resolvedPath, base);
            return StorageMultiUploadResponse.builder()
                    .key(o.getKey())
                    .baseUrl(o.getBaseUrl())
                    .relativePath(o.getRelativePath())
                    .url(o.getUrl())
                    .sm(sm)
                    .md(md)
                    .o(o)
                    .build();
        } catch (UnsupportedImageFormatException e) {
            throw e;
        } catch (Exception e) {
            log.error("[{}][{}] Multi-upload failed: {}", ctx.getProjectCode(), customPath, e.getMessage(), e);
            throw new RuntimeException("Multi-size image upload failed: " + e.getMessage(), e);
        }
    }

    private StorageUploadResponse uploadResizedUnchecked(byte[] decodable, String projectCode, String resolvedPath,
                                                           String name, int maxWidth, String originalFilename, String apiKey) {
        try {
            return uploadResized(decodable, projectCode, resolvedPath, name, maxWidth, originalFilename, apiKey);
        } catch (IOException e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    private Supplier<StorageUploadResponse> withMdc(Map<String, String> mdcContext, Supplier<StorageUploadResponse> task) {
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

    @Override
    @Transactional
    public StorageDeleteResponse deleteAll(String path) {
        String prefix = StorageKeyUtil.prefix(path);
        List<String> deletedKeys = List.of();

        if (!storageProperties.isStoreOnDatabase()) {
            try {
                deletedKeys = deleteByPrefix(prefix);
            } catch (Exception e) {
                log.warn("[{}] S3 delete prefix failed (storeOnDatabase=false): {}", path, e.getMessage());
            }
        }

        storageResourceRepository.deleteByPath(path);
        storageBase64Repository.deleteByObjectKeyPrefix(prefix);

        log.info("[{}] Delete-all succeeded: deletedCount=[{}]", path, deletedKeys.size());
        return StorageDeleteResponse.builder()
                .path(path)
                .deletedCount(deletedKeys.size())
                .build();
    }

    private StorageUploadResponse uploadResized(byte[] decodable, String projectCode, String resolvedPath,
                                                 String name, int maxWidth,
                                                 String originalFilename, String apiKey) throws IOException {
        String key = StorageKeyUtil.key(resolvedPath, name);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        var builder = Thumbnails.of(new ByteArrayInputStream(decodable))
                .outputFormat("jpg")
                .outputQuality(0.85);

        if (maxWidth > 0) {
            BufferedImage img = ImageIO.read(new ByteArrayInputStream(decodable));
            int targetWidth = Math.min(img.getWidth(), maxWidth);
            builder = builder.width(targetWidth);
        } else {
            builder = builder.scale(1.0);
        }
        builder.toOutputStream(out);

        byte[] bytes = out.toByteArray();

        boolean storeOnDb = storageProperties.isStoreOnDatabase();
        boolean storeOnS3 = !storeOnDb;

        if (storeOnS3) {
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
        }

        if (storeOnDb) {
            try {
                StorageBase64 base64Entity = StorageBase64.builder()
                        .objectKey(key)
                        .content(Base64.getEncoder().encodeToString(bytes))
                        .build();
                if (apiKey != null) {
                    base64Entity.setCreatedBy(apiKey);
                    base64Entity.setUpdatedBy(apiKey);
                }
                storageBase64Repository.save(base64Entity);
            } catch (Exception e) {
                log.error("Failed to store Base64 content in database for key=[{}]: {}", key, e.getMessage());
                throw new RuntimeException("Failed to save Base64 content: " + e.getMessage(), e);
            }
        }

        String baseUrl = storeOnDb ? storageProperties.getLocalBaseUrl() : storageProperties.getCdnBaseUrl();
        String relativePath = storeOnDb ? "/api/v1/storage/files/" + key : key;
        String url = storeOnDb ? (baseUrl + relativePath) : (baseUrl + "/" + key);

        StorageResource resource = StorageResource.builder()
                .projectCode(projectCode)
                .path(resolvedPath)
                .objectKey(key)
                .baseUrl(baseUrl)
                .relativePath(relativePath)
                .url(url)
                .originalFilename(originalFilename)
                .fileSize((long) bytes.length)
                .build();

        if (apiKey != null) {
            resource.setCreatedBy(apiKey);
            resource.setUpdatedBy(apiKey);
        }

        storageAuditService.saveAsync(resource);

        return StorageUploadResponse.builder()
                .key(key)
                .baseUrl(baseUrl)
                .relativePath(relativePath)
                .url(url)
                .build();
    }

    @Override
    public byte[] getFile(String key) {
        Optional<StorageBase64> base64Opt = storageBase64Repository.findByObjectKey(key);
        if (base64Opt.isPresent() && base64Opt.get().getContent() != null) {
            try {
                return Base64.getDecoder().decode(base64Opt.get().getContent());
            } catch (Exception e) {
                log.error("Failed to decode Base64 content for key=[{}]: {}", key, e.getMessage());
            }
        }

        if (!storageProperties.isStoreOnDatabase()) {
            try {
                GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                        .bucket(storageProperties.getBucket())
                        .key(key)
                        .build();
                return storageS3Client.getObjectAsBytes(getObjectRequest).asByteArray();
            } catch (Exception e) {
                log.error("Failed to fetch file from S3 for key=[{}]: {}", key, e.getMessage());
                throw new RuntimeException("File not found or S3 error: " + e.getMessage(), e);
            }
        }

        throw new RuntimeException("File not found in database for key: " + key);
    }

    private byte[] ensureDecodable(byte[] original, String originalFilename) throws IOException {
        String detectedFormat = detectFormat(original);

        if (detectedFormat != null) {
            log.info("Detected [{}] format for [{}] — routing directly to ffmpeg", detectedFormat, originalFilename);
            return convertWithFfmpeg(original, originalFilename);
        }

        if (ImageIO.read(new ByteArrayInputStream(original)) != null) {
            return original;
        }

        log.info("ImageIO could not decode [{}] — attempting ffmpeg fallback", originalFilename);
        byte[] converted = convertWithFfmpeg(original, originalFilename);

        if (ImageIO.read(new ByteArrayInputStream(converted)) == null) {
            throw new UnsupportedImageFormatException(
                    "Unsupported or corrupt image format: '" + originalFilename + "'.");
        }
        return converted;
    }

    private String detectFormat(byte[] data) {
        if (data == null || data.length < 12) return null;

        if (data.length >= 12
                && data[4] == 'f' && data[5] == 't' && data[6] == 'y' && data[7] == 'p') {
            String brand = new String(data, 8, 4).toLowerCase();
            if (brand.startsWith("avif") || brand.startsWith("avis")) return "AVIF";
            if (brand.startsWith("heic") || brand.startsWith("heif")
                    || brand.startsWith("mif1") || brand.startsWith("msf1")
                    || brand.startsWith("heis") || brand.startsWith("hevx")) return "HEIC/HEIF";
        }

        if (data[0] == 0x49 && data[1] == 0x49 && data[2] == 0x2A && data[3] == 0x00
                && data.length >= 10 && data[8] == 'C' && data[9] == 'R') return "Canon CR2";

        if (data.length >= 8) {
            String header = new String(data, 0, 8);
            if (header.startsWith("FUJIFILM")) return "Fuji RAF";
        }

        return null;
    }

    private byte[] convertWithFfmpeg(byte[] original, String originalFilename) throws IOException {
        Path tempInput  = Files.createTempFile("storage-in-",  ".tmp");
        Path tempOutput = Files.createTempFile("storage-out-", ".jpg");
        try {
            Files.write(tempInput, original);

            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y",
                    "-i",         tempInput.toString(),
                    "-frames:v",  "1",
                    "-vf",        "scale=iw:ih",
                    "-q:v",       "2",
                    tempOutput.toString()
            );
            pb.redirectErrorStream(true);

            Process process;
            try {
                process = pb.start();
            } catch (IOException e) {
                if (e.getMessage() != null && e.getMessage().contains("error=2")) {
                    log.warn("ffmpeg is not installed — cannot decode [{}]", originalFilename);
                    throw new UnsupportedImageFormatException(
                            "The image format '" + originalFilename + "' requires ffmpeg to be decoded.", e);
                }
                throw e;
            }

            String ffmpegOutput;
            try (InputStream stdout = process.getInputStream()) {
                ffmpegOutput = new String(stdout.readAllBytes());
            }

            try {
                boolean finished = process.waitFor(30, TimeUnit.SECONDS);
                if (!finished) {
                    process.destroyForcibly();
                    throw new IOException("ffmpeg conversion timed out for file: " + originalFilename);
                }
                if (process.exitValue() != 0) {
                    log.warn("ffmpeg exit={} for [{}]: {}", process.exitValue(), originalFilename, ffmpegOutput);
                    throw new UnsupportedImageFormatException(
                            "ffmpeg could not decode '" + originalFilename + "'.");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException("ffmpeg conversion interrupted for file: " + originalFilename, e);
            }

            byte[] result = Files.readAllBytes(tempOutput);
            if (result.length == 0) {
                throw new UnsupportedImageFormatException(
                        "ffmpeg produced empty output for '" + originalFilename + "'.");
            }
            return result;

        } finally {
            Files.deleteIfExists(tempInput);
            Files.deleteIfExists(tempOutput);
        }
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
