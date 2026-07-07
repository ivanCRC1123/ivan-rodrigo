import { http } from "../../../shared/services/api";
import type { CloudinaryResponse } from "../types/upload.types";

export const uploadImage = async (
  file: File,
  folder: string,
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await http.post<CloudinaryResponse>(
    "/api/v1/uploads/imagen",
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    },
  );

  return response.data.secure_url;
};
