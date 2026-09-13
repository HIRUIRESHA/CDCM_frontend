// src/pages/notifications/Notification.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext"; // ✅ AuthContext
import { getNotifications, markAsRead } from "../../api/notificationApi";

export default function Notification() {
  const { user } = useAuth(); // Get the logged-in user
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications whenever the logged-in user changes
  useEffect(() => {
   if (!user?.id) {
      console.error("No logged-in user found!");
      setLoading(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        setLoading(true);
         const res = await getNotifications(user.id); // fetch by AuthContext ID
        setNotifications(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  const handleRead = async (id) => {
    try {
      await markAsRead(id);   // mark notification as read
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  if (loading) return <p className="p-6">Loading notifications...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No new notifications.</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 mb-2 rounded-lg border ${
              n.read ? "bg-gray-100 border-gray-200" : "bg-blue-50 border-blue-200"
            }`}
          >
            {n.title && <p className="font-bold text-blue-950 text-sm mb-1">{n.title}</p>}
            <p className="font-medium text-slate-700">{n.message}</p>
            <p className="text-xs text-gray-400 mb-2">
              {new Date(n.createdAt).toLocaleString()}
            </p>
            {!n.read && (
              <button
                onClick={() => handleRead(n.id)}
                className="text-sm text-blue-600 hover:underline"
              >
                Mark as read
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}