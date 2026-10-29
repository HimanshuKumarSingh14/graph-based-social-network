import api from "../api/axios";

export const getGraphData = () => api.get("/graph");
export const getNetworkStats = () => api.get("/graph/stats");
export const getMostConnectedUser = () => api.get("/graph/most-connected");
export const getMutualFriends = (email1, email2) =>
  api.get(`/graph/mutual/${encodeURIComponent(email1)}/${encodeURIComponent(email2)}`);
export const getSuggestions = (email) =>
  api.get(`/graph/suggestions/${encodeURIComponent(email)}`);
export const getShortestPath = (email1, email2) =>
  api.get(`/graph/path/${encodeURIComponent(email1)}/${encodeURIComponent(email2)}`);
