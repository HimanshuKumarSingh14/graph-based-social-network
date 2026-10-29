import axios from "axios";
import { BASE_URL } from "../config";

const api = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach the JWT to every request
api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auto-logout on 401/403 (expired or invalid token)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
