package com.emenu.features.storage.service.impl;

import com.emenu.config.exception.UnsupportedImageFormatException;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
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
        } catch (UnsupportedImageFormatException e) {
            // Re-throw as-is; GlobalExceptionHandler maps this to 422
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
        } catch (UnsupportedImageFormatException e) {
            // Re-throw as-is; GlobalExceptionHandler maps this to 422
            throw e;
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
     * Ensures the uploaded bytes are decodable by the rest of the pipeline.
     *
     * <p><b>Stage 1 — magic-byte detection</b>: Reads the file header to identify
     * formats that need ffmpeg directly (AVIF, HEIC/HEIF, camera RAW — CR2, NEF, ARW).
     * These are forwarded straight to ffmpeg, skipping the ImageIO attempt.</p>
     *
     * <p><b>Stage 2 — TwelveMonkeys + ImageIO</b>: Handles the vast majority of
     * formats in pure Java: JPEG, PNG, GIF, WebP, TIFF, BMP, PSD, ICNS, PCX, PNM,
     * TGA, SGI, etc. TwelveMonkeys registers its plugins via ServiceLoader at startup.</p>
     *
     * <p><b>Stage 3 — ffmpeg fallback</b>: Last resort for any format that slipped
     * through stages 1 and 2. Requires {@code ffmpeg} on the host PATH (see Dockerfile).
     * If ffmpeg is absent an {@link UnsupportedImageFormatException} is thrown, which
     * maps to HTTP 422 so the caller gets a clear error instead of a generic 500.</p>
     */
    private byte[] ensureDecodable(byte[] original, String originalFilename) throws IOException {
        String detectedFormat = detectFormat(original);

        // AVIF, HEIC, and camera RAW have no pure-Java decoder — go straight to ffmpeg.
        if (detectedFormat != null) {
            log.info("Detected [{}] format for [{}] — routing directly to ffmpeg", detectedFormat, originalFilename);
            return convertWithFfmpeg(original, originalFilename);
        }

        // Try TwelveMonkeys + standard ImageIO (covers JPEG, PNG, GIF, WebP, TIFF, BMP, PSD, etc.)
        if (javax.imageio.ImageIO.read(new ByteArrayInputStream(original)) != null) {
            return original;
        }

        // Last resort: ffmpeg for anything else ImageIO couldn't handle
        log.info("ImageIO (+ TwelveMonkeys) could not decode [{}] — attempting ffmpeg fallback", originalFilename);
        byte[] converted = convertWithFfmpeg(original, originalFilename);

        if (javax.imageio.ImageIO.read(new ByteArrayInputStream(converted)) == null) {
            throw new UnsupportedImageFormatException(
                    "Unsupported or corrupt image format: '" + originalFilename + "'. "
                    + "Please upload a JPEG, PNG, WebP, AVIF, HEIC, TIFF, BMP, PSD, or other common image format.");
        }
        return converted;
    }

    /**
     * Identifies formats that cannot be decoded by Java ImageIO (even with TwelveMonkeys)
     * by inspecting the raw file header (magic bytes).
     *
     * <p>Returns a human-readable format name if the file must go through ffmpeg,
     * or {@code null} if ImageIO should be tried first.</p>
     *
     * <ul>
     *   <li>AVIF — ISO Base Media container with {@code avif} / {@code avis} brand</li>
     *   <li>HEIC/HEIF — ISO Base Media container with {@code heic} / {@code heif} / {@code mif1} brand</li>
     *   <li>Camera RAW — Canon CR2, Nikon NEF, Sony ARW, Olympus ORF, Fuji RAF</li>
     * </ul>
     */
    private String detectFormat(byte[] data) {
        if (data == null || data.length < 12) return null;

        // ISO Base Media File Format (MP4 / HEIF / AVIF family)
        // Bytes [4..7] = 'ftyp', bytes [8..11] = major brand
        if (data.length >= 12
                && data[4] == 'f' && data[5] == 't' && data[6] == 'y' && data[7] == 'p') {
            String brand = new String(data, 8, 4).toLowerCase();
            if (brand.startsWith("avif") || brand.startsWith("avis")) return "AVIF";
            if (brand.startsWith("heic") || brand.startsWith("heif")
                    || brand.startsWith("mif1") || brand.startsWith("msf1")
                    || brand.startsWith("heis") || brand.startsWith("hevx")) return "HEIC/HEIF";
        }

        // Canon CR2 — starts with II (little-endian TIFF) + magic 0x002A + offset 0x00000008, then CR
        if (data[0] == 0x49 && data[1] == 0x49 && data[2] == 0x2A && data[3] == 0x00
                && data.length >= 10 && data[8] == 'C' && data[9] == 'R') return "Canon CR2";

        // Nikon NEF / Sony ARW / Olympus ORF — TIFF-based RAW (little-endian or big-endian)
        // We use a lightweight check: standard TIFF magic then no ImageIO decode = RAW
        // (handled by the ImageIO fallback path; only override if we add more magic here)

        // Fuji RAF
        if (data.length >= 8) {
            String header = new String(data, 0, 8);
            if (header.startsWith("FUJIFILM")) return "Fuji RAF";
        }

        return null; // let ImageIO try first
    }

    /**
     * Converts an image to JPEG using ffmpeg, reading from a temp file on disk.
     *
     * <p>AVIF, HEIC and other ISOBMFF-based containers are <em>seekable</em> formats:
     * ffmpeg must jump around the file to locate the {@code moov}/{@code ftyp} box.
     * Piping bytes via {@code pipe:0} gives ffmpeg a non-seekable stream and causes
     * it to exit with code 183 (ENOTSUP / cannot seek). Writing to a temp file on
     * disk restores random-access and lets ffmpeg decode any container format.</p>
     */
    private byte[] convertWithFfmpeg(byte[] original, String originalFilename) throws IOException {
        Path tempInput  = Files.createTempFile("storage-in-",  ".tmp");
        Path tempOutput = Files.createTempFile("storage-out-", ".jpg");
        try {
            // Write raw bytes to a real file so ffmpeg can seek freely
            Files.write(tempInput, original);

            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y",
                    "-i",         tempInput.toString(),
                    "-frames:v",  "1",
                    "-vf",        "scale=iw:ih",   // preserve dimensions
                    "-q:v",       "2",              // high quality JPEG (1=best, 31=worst)
                    tempOutput.toString()
            );
            pb.redirectErrorStream(true); // merge stderr so we can log it on failure

            Process process;
            try {
                process = pb.start();
            } catch (IOException e) {
                if (e.getMessage() != null && e.getMessage().contains("error=2")) {
                    log.warn("ffmpeg is not installed — cannot decode [{}]", originalFilename);
                    throw new UnsupportedImageFormatException(
                            "The image format '" + originalFilename + "' requires ffmpeg to be decoded, "
                            + "but ffmpeg is not available on this server. "
                            + "Please upload a JPEG, PNG, WebP, or other standard image format.", e);
                }
                throw e;
            }

            // Drain ffmpeg stdout/stderr (redirected to stdout above) to prevent blocking
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
                            "ffmpeg could not decode '" + originalFilename + "' (exit=" + process.exitValue() + "). "
                            + "The file may be corrupt or in an unsupported format.");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException("ffmpeg conversion interrupted for file: " + originalFilename, e);
            }

            byte[] result = Files.readAllBytes(tempOutput);
            if (result.length == 0) {
                throw new UnsupportedImageFormatException(
                        "ffmpeg produced an empty output for '" + originalFilename + "'. "
                        + "The file may be corrupt or in an unsupported format.");
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
