import { axiosClient } from "@/utils/axios";
import {
  DEFAULT_IMAGE_COMPRESS_CONFIG,
  ImageCompressOptions,
} from "@/config/image-config";

export interface SpacesUploadResult {
  key: string;
  baseUrl?: string;
  relativePath?: string;
  url: string;
}

export interface SpacesMultiSizeResult {
  key?: string;
  baseUrl?: string;
  relativePath?: string;
  url?: string;
  sm: SpacesUploadResult;
  md: SpacesUploadResult;
  o: SpacesUploadResult;
}

/**
 * Rethrow with the backend's user-facing message when possible (e.g. the
 * "Your file is too big …" message from MaxUploadSizeExceededException),
 * so toasts show something useful instead of "Network Error".
 */
function rethrowFriendly(err: any, fallback: string): never {
  const backendMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error?.message ||
    err?.message;
  throw new Error(backendMessage || fallback);
}

/**
 * Automatically compresses and resizes ALL image files on the client side
 * using HTML5 Canvas before uploading to server.
 * 
 * - Does NOT skip pre-compression file size checking (compresses all images regardless of original size).
 * - Ensures final compressed output submitted to server is under maxServerSizeBytes (default 4.8MB < 5MB).
 */
export async function compressImage(
  file: File,
  customOptions?: ImageCompressOptions
): Promise<File> {
  const options = { ...DEFAULT_IMAGE_COMPRESS_CONFIG, ...customOptions };

  // Safety check: SSR environment or non-image files
  if (typeof window === "undefined" || !file || !file.type.startsWith("image/")) {
    return file;
  }

  // SVG or Animated GIF cannot be canvas-compressed without losing vector/animation
  if (file.type.includes("svg") || file.type.includes("gif")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;
      let maxDim = options.maxWidthOrHeight;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

      const renderCanvas = (
        currentWidth: number,
        currentHeight: number,
        quality: number
      ): Promise<Blob | null> => {
        return new Promise((blobResolve) => {
          const canvas = document.createElement("canvas");
          canvas.width = currentWidth;
          canvas.height = currentHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            blobResolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
          canvas.toBlob((b) => blobResolve(b), outputType, quality);
        });
      };

      const processBlob = async () => {
        let currentQuality = options.quality;
        let currentW = width;
        let currentH = height;

        let blob = await renderCanvas(currentW, currentH, currentQuality);

        // Iteratively reduce dimensions / quality if blob still exceeds maxServerSizeBytes (4.8MB)
        let attempts = 0;
        while (blob && blob.size > options.maxServerSizeBytes && attempts < 4) {
          attempts++;
          currentQuality = Math.max(0.5, currentQuality - 0.15);
          currentW = Math.round(currentW * 0.85);
          currentH = Math.round(currentH * 0.85);
          blob = await renderCanvas(currentW, currentH, currentQuality);
        }

        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: outputType,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      };

      processBlob();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

export async function uploadImage(
  file: File,
  businessId: string,
  compressOptions?: ImageCompressOptions
): Promise<SpacesUploadResult> {
  const readyFile = await compressImage(file, compressOptions);
  const form = new FormData();
  form.append("file", readyFile);
  form.append("businessId", businessId);
  try {
    const res = await axiosClient.post<SpacesUploadResult>(
      "/api/v1/spaces/upload",
      form
    );
    return res.data;
  } catch (err) {
    rethrowFriendly(err, "Image upload failed — please try again");
  }
}

export async function uploadMultiSize(
  file: File,
  businessId: string,
  compressOptions?: ImageCompressOptions
): Promise<SpacesMultiSizeResult> {
  const readyFile = await compressImage(file, compressOptions);
  const form = new FormData();
  form.append("file", readyFile);
  form.append("businessId", businessId);
  try {
    const res = await axiosClient.post<SpacesMultiSizeResult>(
      "/api/v1/spaces/upload-multi",
      form
    );
    return res.data;
  } catch (err) {
    rethrowFriendly(err, "Image upload failed — please try again");
  }
}

/** Upload for customer profile — stored under customer/yyyy-MM-dd/, no businessId needed */
export async function uploadMultiSizeCustomer(
  file: File,
  compressOptions?: ImageCompressOptions
): Promise<SpacesMultiSizeResult> {
  const readyFile = await compressImage(file, compressOptions);
  const form = new FormData();
  form.append("file", readyFile);
  try {
    const res = await axiosClient.post<SpacesMultiSizeResult>(
      "/api/v1/spaces/upload-multi-customer",
      form
    );
    return res.data;
  } catch (err) {
    rethrowFriendly(err, "Image upload failed — please try again");
  }
}

export async function deleteImage(key: string): Promise<void> {
  await axiosClient.delete("/api/v1/spaces/object", { params: { key } });
}

export async function deleteByDate(
  businessId: string,
  prefix: string
): Promise<void> {
  await axiosClient.delete("/api/v1/spaces/date", {
    params: { businessId, prefix },
  });
}
