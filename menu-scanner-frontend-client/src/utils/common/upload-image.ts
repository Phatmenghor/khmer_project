import { uploadImageService } from "@/services/image-service";

/**
 * Check if a string is a base64 image
 */
export function isBase64Image(str: string): boolean {
  if (!str) return false;
  return str.startsWith("data:image");
}

/**
 * Check if a string is a valid URL
 */
export function isValidImageUrl(str: string): boolean {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extract image type from base64 string
 * @param base64Image - The base64 encoded image string
 * @returns The image type (e.g., "png", "jpeg", "jpg", "gif")
 */
export function extractImageType(base64Image: string): string {
  if (!base64Image.startsWith("data:image")) {
    throw new Error("Invalid base64 image format");
  }

  // Extract type from "data:image/png;base64,..." -> "png"
  const match = base64Image.match(/data:image\/([a-zA-Z0-9]+);/);

  if (!match || !match[1]) {
    throw new Error("Could not extract image type from base64 string");
  }

  return match[1];
}

/**
 * Upload a base64 image and get back a URL
 * If the input is already a URL, it returns it as-is
 *
 * @param imageData - The base64 encoded image string or existing URL
 * @returns Promise<string> - The uploaded image URL or existing URL
 * @throws Error if upload fails
 */
export async function uploadImage(imageData: string): Promise<string> {
  // Return empty string if no data provided
  if (!imageData) {
    return "";
  }

  // If it's already a valid URL, return it as-is
  if (isValidImageUrl(imageData)) {
    return imageData;
  }

  // If it's not a base64 image, throw error
  if (!isBase64Image(imageData)) {
    throw new Error("Invalid image data: must be a base64 string or valid URL");
  }

  try {
    // Extract image type from base64 string
    const imageType = extractImageType(imageData);

    // Call the upload service
    const uploadResult = await uploadImageService({
      base64: imageData,
      type: imageType,
    });

    // Validate the response
    if (!uploadResult || !uploadResult.imageUrl) {
      throw new Error("Upload service did not return a valid URL");
    }

    return uploadResult.imageUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload image"
    );
  }
}

/**
 * Upload multiple images and return an array of URLs
 * Skips empty strings and preserves order
 *
 * @param imageDataArray - Array of base64 encoded images or URLs
 * @returns Promise<string[]> - Array of uploaded image URLs
 */
export async function uploadImages(
  imageDataArray: string[]
): Promise<string[]> {
  const uploadPromises = imageDataArray.map((imageData) => {
    if (!imageData) return Promise.resolve("");
    return uploadImage(imageData);
  });

  return Promise.all(uploadPromises);
}

/**
 * Process image for upload - handles both new uploads and existing URLs
 * This is a convenience function that wraps uploadImage with better error messages
 *
 * @param imageData - The image data (base64 or URL)
 * @param fieldName - Name of the field (for error messages)
 * @returns Promise<string> - The final image URL
 * @throws Error with user-friendly message
 */
export async function processImageUpload(
  imageData: string,
  fieldName: string = "image"
): Promise<string> {
  if (!imageData) {
    return "";
  }

  try {
    return await uploadImage(imageData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to upload ${fieldName}: ${message}`);
  }
}

/**
 * Validate image before upload
 *
 * @param imageData - The image data to validate
 * @returns Object with validation result
 */
export function validateImageData(imageData: string): {
  isValid: boolean;
  error?: string;
} {
  if (!imageData) {
    return { isValid: false, error: "No image provided" };
  }

  if (isValidImageUrl(imageData)) {
    return { isValid: true };
  }

  if (!isBase64Image(imageData)) {
    return {
      isValid: false,
      error: "Image must be a valid base64 string or URL",
    };
  }

  try {
    extractImageType(imageData);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Invalid image format",
    };
  }
}
