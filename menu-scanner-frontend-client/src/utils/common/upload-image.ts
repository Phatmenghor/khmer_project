import { uploadImageService } from "@/services/image-service";


export function isBase64Image(str: string): boolean {
  if (!str) return false;
  return str.startsWith("data:image");
}


export function isValidImageUrl(str: string): boolean {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}


export function extractImageType(base64Image: string): string {
  if (!base64Image.startsWith("data:image")) {
    throw new Error("Invalid base64 image format");
  }


  const match = base64Image.match(/data:image\/([a-zA-Z0-9]+);/);

  if (!match || !match[1]) {
    throw new Error("Could not extract image type from base64 string");
  }

  return match[1];
}


export async function uploadImage(imageData: string): Promise<string> {

  if (!imageData) {
    return "";
  }


  if (isValidImageUrl(imageData)) {
    return imageData;
  }


  if (!isBase64Image(imageData)) {
    throw new Error("Invalid image data: must be a base64 string or valid URL");
  }

  try {

    const imageType = extractImageType(imageData);


    const uploadResult = await uploadImageService({
      base64: imageData,
      type: imageType,
    });


    if (!uploadResult || !uploadResult.imageUrl) {
      throw new Error("Upload service did not return a valid URL");
    }

    return uploadResult.imageUrl;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload image"
    );
  }
}


export async function uploadImages(
  imageDataArray: string[]
): Promise<string[]> {
  const uploadPromises = imageDataArray.map((imageData) => {
    if (!imageData) return Promise.resolve("");
    return uploadImage(imageData);
  });

  return Promise.all(uploadPromises);
}


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
