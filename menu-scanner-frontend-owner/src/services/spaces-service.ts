import { axiosClient } from "@/utils/axios";
import { getUserInfo } from "@/utils/local-storage/userInfo";

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

// Multi-size result from single upload-multi endpoint (matches client project)
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

// Returns the owner's userId to use as the storage path prefix
function getOwnerId(): string {
  const id = getUserInfo()?.userId;
  if (!id) throw new Error("Not logged in — please sign in again");
  return id;
}

// Upload a single size — stored under owner's userId path
export async function uploadImage(
  file: File,
  size: ImageSize = "o"
): Promise<SpacesUploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("businessId", getOwnerId());
  form.append("size", size);

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

// Upload all 4 sizes in parallel
export async function uploadAllSizes(
  file: File,
  onProgress?: (done: number, total: number) => void
): Promise<SpacesAllSizes> {
  const sizes: ImageSize[] = ["sm", "md", "lg", "o"];
  let done = 0;

  const results = await Promise.all(
    sizes.map(async (size) => {
      const result = await uploadImage(file, size);
      done++;
      onProgress?.(done, sizes.length);
      return result;
    })
  );

  return {
    sm: results[0],
    md: results[1],
    lg: results[2],
    o: results[3],
  };
}

// Upload all sizes in one request — stored under owner's userId path
export async function uploadMultiSize(
  file: File
): Promise<SpacesMultiSizeResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("businessId", getOwnerId());

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

// Delete one image by its key
export async function deleteImage(key: string): Promise<void> {
  await axiosClient.delete("/api/v1/spaces/object", { params: { key } });
}

// Delete by date prefix — uses owner's userId as the businessId path
export async function deleteByDate(prefix: string): Promise<void> {
  await axiosClient.delete("/api/v1/spaces/date", {
    params: { businessId: getOwnerId(), prefix },
  });
}
