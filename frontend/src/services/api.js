// services/api.js
// Semua komunikasi dengan backend API

import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

// Buat instance axios dengan konfigurasi default
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor: otomatis tambahkan token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: handle response error secara global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kalau token expired, logout otomatis
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  logout: () => api.post("/auth/logout"),
};

// Parking
export const parkingAPI = {
  vehicleEntry: (data) => api.post("/parking/entry", data),
  vehicleExit: (data) => api.post("/parking/exit", data),
  getActiveVehicles: () => api.get("/parking/active"),
  getTodayStats: () => api.get("/parking/stats"),
  checkTicket: (code) => api.get(`/parking/ticket/${code}`),
};

export default api;
