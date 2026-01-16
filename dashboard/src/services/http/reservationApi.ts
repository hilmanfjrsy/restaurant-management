import axios from "axios";

export const reservationApi = axios.create({
  baseURL: import.meta.env.VITE_RESERVATION_SERVICE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_RESERVATION_SERVICE_API_KEY || "",
  },
});