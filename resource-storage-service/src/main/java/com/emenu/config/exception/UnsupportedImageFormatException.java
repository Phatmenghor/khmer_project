package com.emenu.config.exception;

/**
 * Thrown when an uploaded image cannot be decoded because its format is not
 * supported by the server (e.g. AVIF when ffmpeg is unavailable) or the file
 * is corrupt / not an image at all.
 *
 * <p>Maps to HTTP 422 Unprocessable Entity in {@link GlobalExceptionHandler}.</p>
 */
public class UnsupportedImageFormatException extends RuntimeException {

    public UnsupportedImageFormatException(String message) {
        super(message);
    }

    public UnsupportedImageFormatException(String message, Throwable cause) {
        super(message, cause);
    }
}
