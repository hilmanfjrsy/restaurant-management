import axios from "axios";

export const tableApi = axios.create({
  baseURL: import.meta.env.VITE_TABLE_SERVICE_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_TABLE_SERVICE_API_KEY || "",
  },
});