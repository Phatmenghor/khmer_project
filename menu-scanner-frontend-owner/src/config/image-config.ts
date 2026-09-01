/**
 * Global Configuration for Frontend Image Compression & Uploads
 * Easily adjust max file size, max dimensions, and quality in 1 central location.
 */
export interface ImageCompressOptions {
  /** Target maximum server submission file size in bytes (default: 4.8MB < 5MB limit) */
  maxServerSizeBytes?: number;
  /** Maximum width or height of compressed image in pixels (default: 2048px) */
  maxWidthOrHeight?: number;
  /** Initial compression quality between 0.0 and 1.0 (default: 0.85 = 85%) */
  quality?: number;
}

export const DEFAULT_IMAGE_COMPRESS_CONFIG: Required<ImageCompressOptions> = {
  maxServerSizeBytes: 4.8 * 1024 * 1024, // 4.8MB (guarantees under 5MB backend limit)
  maxWidthOrHeight: 2048,                 // 2048px max dimension
  quality: 0.85,                          // 85% quality
};
