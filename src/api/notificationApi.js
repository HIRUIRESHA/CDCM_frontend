// src/api/notificationApi.js
import api from "./api"; 

// Change this to match @RequestMapping("/api/notifications") in Java
const BASE_URL = "/api/notifications"; 

export const getNotifications = (userId) => {
  return api.get(`${BASE_URL}/${userId}`);
};

export const markAsRead = (id) => {
  return api.put(`${BASE_URL}/read/${id}`);
};