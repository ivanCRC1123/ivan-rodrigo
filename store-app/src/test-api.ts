import apiClient from "./shared/apiClient";

apiClient.get("/productos/")
  .then(res => console.log("SUCCESS_DATA:", JSON.stringify(res.data)))
  .catch(err => console.error("ERROR_DATA:", err.response?.data || err.message));
