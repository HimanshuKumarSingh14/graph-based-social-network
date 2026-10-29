import api from "../api/axios";

export const getAllUsers = (search = "") =>
  api.get("/users/all", { params: { search } });

export const getProfile = () => api.get("/users/profile");

export const updateProfile = (data) => api.put("/users/update-profile", data);

export const addFriend = (friendEmail) =>
  api.post("/users/add-friend", { friendEmail });

export const deleteFriend = (friendEmail) =>
  api.delete("/users/delete-friend", { data: { friendEmail } });

export const getFriends = () => api.get("/users/friends");
