import { useEffect, useState } from "react";
import axios from "axios";

export default function HospitalNotifications() {
  const user = JSON.parse(localStorage.getItem("user"));
  const hospitalId = user?.id || user?._id;

  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
     const res = await axios.get(
  `http://localhost:8082/api/notifications/${hospitalId}`
);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [hospitalId]);

  return (
    <div>
      <h2>Notifications</h2>

      {notifications.length === 0 ? (
        <p>No notifications yet</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            style={{
              background: n.read ? "#f9fafb" : "#fff7ed",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "10px"
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>{n.message}</p>
            <small>{n.createdAt}</small>
          </div>
        ))
      )}
    </div>
  );
}