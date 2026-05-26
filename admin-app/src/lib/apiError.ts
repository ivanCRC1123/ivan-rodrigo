import axios from "axios";

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(" | ");
    }

    return error.message;
  }

  if (error instanceof Error) return error.message;

  return "Error fatal";
};
