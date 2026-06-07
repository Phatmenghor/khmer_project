import { axiosClient } from "@/utils/axios";

export type ImageSize = "sm" | "md" | "lg" | "o";

export interface SpacesUploadResult {
  key: string;
  url: string;
}

export interface SpacesAllSizes {
  sm: SpacesUploadResult;
  md: SpacesUploadResult;
  lg: SpacesUploadResult;
  o: SpacesUploadResult;
}

// Multi-size result — sm, md, o — stored under owner/yyyy-MM-dd/
export interface SpacesMultiSizeResult {
  sm: SpacesUploadResult;
  md: SpacesUploadResult;
  o: SpacesUploadResult;
}

function rethrowFriendly(err: any, fallback: string): never {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error?.message ||
    err?.message;
  throw new Error(msg || fallback);
}

// Upload all sizes in one request — stored under owner/yyyy-MM-dd/, no businessId
export async function uploadMultiSize(
  file: File
): Promise<SpacesMultiSizeResult> {
  const form = new FormData();
  form.append("file", file);

  try {
    const res = await axiosClient.post<SpacesMultiSizeResult>(
      "/api/v1/spaces/upload-multi-owner",
      form
    );
    return res.data;
  } catch (err) {
    rethrowFriendly(err, "Image upload failed — please try again");
  }
}

// Delete one image by its key
export async function deleteImage(key: string): Promise<void> {
  await axiosClient.delete("/api/v1/spaces/object", { params: { key } });
}
