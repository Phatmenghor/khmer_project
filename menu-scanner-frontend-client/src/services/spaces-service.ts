import { axiosClient } from "@/utils/axios";

export interface SpacesUploadResult {
  key: string;
  url: string;
}

export interface SpacesMultiSizeResult {
  sm: SpacesUploadResult;
  md: SpacesUploadResult;
  o: SpacesUploadResult;
}

export async function uploadImage(
  file: File,
  businessId: string
): Promise<SpacesUploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("businessId", businessId);
  const res = await axiosClient.post<SpacesUploadResult>(
    "/api/v1/spaces/upload",
    form
  );
  return res.data;
}

export async function uploadMultiSize(
  file: File,
  businessId: string
): Promise<SpacesMultiSizeResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("businessId", businessId);
  const res = await axiosClient.post<SpacesMultiSizeResult>(
    "/api/v1/spaces/upload-multi",
    form
  );
  return res.data;
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
