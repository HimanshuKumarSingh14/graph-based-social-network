import api from "../api/axios";

export const sendFriendRequest = (friendEmail) =>
  api.post("/friends/send-request", { friendEmail });

export const getPendingRequests = () => api.get("/friends/pending");

export const getSentRequests = () => api.get("/friends/sent");

export const acceptFriendRequest = (friendEmail) =>
  api.post("/friends/accept", { friendEmail });

export const rejectFriendRequest = (friendEmail) =>
  api.post("/friends/reject", { friendEmail });
