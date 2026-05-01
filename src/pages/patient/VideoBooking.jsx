import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VideoBooking() {
  const { id } = useParams(); // appointment ID
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:8082/api/appointments/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setAppointment(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  // 🔄 Create Video Appointment
  const handleCreateVideo = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8082/api/appointments/${id}/request-video`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        alert("Video consultation booked successfully!");
        navigate("/patient/appointments");
      } else {
        alert("Failed to create video consultation");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ⏳ Loading
  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  // ❌ No appointment
  if (!appointment) {
    return <div className="p-10 text-center text-red-500">Appointment not found</div>;
  }

  // ❌ Not completed
  if (appointment.status !== "COMPLETED") {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-red-600">
          You must complete your physical appointment first
        </h2>
      </div>
    );
  }

  // ✅ Allowed
  return (
    <div className="p-10 max-w-xl mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Video Consultation Booking
      </h2>

      <div className="space-y-3 mb-6">
        <p><strong>Appointment ID:</strong> {appointment.id}</p>
        <p><strong>Date:</strong> {appointment.date}</p>
        <p><strong>Time:</strong> {appointment.time}</p>
        <p><strong>Status:</strong> {appointment.status}</p>
      </div>

      <button
        onClick={handleCreateVideo}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
      >
        Confirm Video Consultation
      </button>
    </div>
  );
}

export default VideoBooking;