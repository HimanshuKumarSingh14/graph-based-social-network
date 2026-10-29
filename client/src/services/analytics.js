import api from "../api/axios";

export const getMyCentrality = (email) =>
  api.get("/analytics/centrality", { params: email ? { email } : {} });

export const getCentralityLeaderboard = () =>
  api.get("/analytics/centrality/leaderboard");

export const getCommunities = () => api.get("/analytics/communities");

export const getConnectionBreakdown = () => api.get("/analytics/connections");
