export function getApiErrorMessage(error: unknown, fallback = "Error inesperado"): string {
  if (typeof error === "object" && error !== null) {
    const err = error as any;
    // Axios error with response
    if (err.response?.data?.detail) {
      return err.response.data.detail;
    }
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    // Network / other
    if (err.message) {
      return err.message;
    }
  }
  return fallback;
}
