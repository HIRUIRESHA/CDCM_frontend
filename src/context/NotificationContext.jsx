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

  const fetchUnread = useCallback(async () => {
    if (!effectiveUserId) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await getUnreadCount(effectiveUserId);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      // Fallback: if unread-count fails, don't crash
      console.warn("Could not fetch unread count:", err.message);
    }
  }, [effectiveUserId]);

  const fetchAll = useCallback(async () => {
    if (!effectiveUserId) return;
    setLoading(true);
    try {
      const res = await getNotifications(effectiveUserId);
      const list = Array.isArray(res.data) ? res.data : [];
      setNotifications(list);
      // derive unread count from list as well
      const count = list.filter((n) => !n.read).length;
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

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
    fetchAll();

    // Poll every 15 seconds for real-time updates
    const interval = setInterval(() => {
      fetchUnread();
    }, 15000);

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
