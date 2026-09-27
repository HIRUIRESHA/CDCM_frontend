import api from "./api";

const BASE_URL = "/api/notifications";

export const getNotifications = (userId) => {
  return api.get(`${BASE_URL}/${userId}`);
};

export const getUnreadCount = (userId) => {
  return api.get(`${BASE_URL}/${userId}/unread-count`);
};

export const markAsRead = (id) => {
  return api.put(`${BASE_URL}/read/${id}`);
};

export const markAllAsRead = (userId) => {
  return api.put(`${BASE_URL}/${userId}/read-all`);
};