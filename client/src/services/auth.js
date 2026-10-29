import api from "../api/axios";

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data;
};

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};
