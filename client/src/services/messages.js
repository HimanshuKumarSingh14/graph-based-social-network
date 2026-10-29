import api from "../api/axios";

export const getConversations = () => api.get("/messages/conversations");
export const getConversation = (friendEmail) => api.get(`/messages/${encodeURIComponent(friendEmail)}`);
export const sendMessage = (to, text) => api.post("/messages", { to, text });
