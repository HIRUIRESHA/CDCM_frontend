import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getNotifications, getUnreadCount, markAsRead as apiMarkAsRead, markAllAsRead as apiMarkAllAsRead } from '../api/notificationApi';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const hospital = JSON.parse(localStorage.getItem("hospital") || "null");
  const effectiveUserId = user?.id || user?._id || hospital?.id || hospital?._id;

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const filterForUser = useCallback((list) => {
    if (!Array.isArray(list)) return [];
    const userRole = (localStorage.getItem("userRole") || "").toUpperCase();
    return list.filter((n) => {
      // 1. Strict recipient check: if userId is populated, it must match effectiveUserId
      if (effectiveUserId && n.userId && String(n.userId) !== String(effectiveUserId)) {
        return false;
      }
      // 2. Role-based exclusions
      if (userRole === "HOSPITAL") {
        if (n.title === "Hospital Assigned Schedule to Doctor" || n.title === "New Patient Feedback") {
          return false;
        }
      }
      if (userRole === "DOCTOR") {
        if (n.title === "Appointment Booked Successfully" || n.title === "Appointment Confirmed") {
          return false;
        }
      }
      if (userRole === "PATIENT") {
        if (n.title === "Hospital Assigned Schedule to Doctor" || n.title === "Schedule Accepted" || n.title === "Schedule Declined") {
          return false;
        }
      }
      return true;
    });
  }, [effectiveUserId]);

  const fetchUnread = useCallback(async () => {
    if (!effectiveUserId) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await getNotifications(effectiveUserId);
      const list = Array.isArray(res.data) ? res.data : [];
      const valid = filterForUser(list);
      setUnreadCount(valid.filter((n) => !n.read).length);
    } catch (err) {
      // Fallback: if unread-count fails, don't crash
      console.warn("Could not fetch unread count:", err.message);
    }
  }, [effectiveUserId, filterForUser]);

  const fetchAll = useCallback(async (isSilent = false) => {
    if (!effectiveUserId) return;
    if (!isSilent) setLoading(true);
    try {
      const res = await getNotifications(effectiveUserId);
      const list = Array.isArray(res.data) ? res.data : [];
      const valid = filterForUser(list);
      setNotifications(valid);
      setUnreadCount(valid.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [effectiveUserId, filterForUser]);

  // Mark single as read
  const markNotificationAsRead = async (id) => {
    try {
      await apiMarkAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all as read
  const markAllNotificationsAsRead = async () => {
    // 1. Instant optimistic state update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    if (!effectiveUserId) return;
    try {
      await apiMarkAllAsRead(effectiveUserId);
    } catch (err) {
      console.warn("API mark-all-as-read notice:", err.message);
      // Fallback: mark each unread individually
      const unreadItems = notifications.filter((n) => !n.read);
      for (const item of unreadItems) {
        apiMarkAsRead(item.id).catch(() => {});
      }
    }
  };

  useEffect(() => {
    fetchUnread();
    fetchAll(false);

    // Poll every 8 seconds for real-time updates across the app
    const interval = setInterval(() => {
      fetchUnread();
      fetchAll(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchUnread, fetchAll]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        loading,
        fetchUnread,
        fetchAll,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      unreadCount: 0,
      notifications: [],
      loading: false,
      fetchUnread: () => {},
      fetchAll: () => {},
      markNotificationAsRead: () => {},
      markAllNotificationsAsRead: () => {},
    };
  }
  return context;
};
