import api from "../api/axios";

export const getDashboardStats = () => api.get("/dashboard/stats");
export const getRecentActivity = () => api.get("/dashboard/recent");
