import api from "./api"; 

const BASE_URL = "/api/notifications"; 

export const getNotifications = (userId) => {
  return api.get(`${BASE_URL}/${userId}`);
};

export const markAsRead = (id) => {
  return api.put(`${BASE_URL}/read/${id}`);
};