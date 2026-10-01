import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError, showWarning,showConfirm } from "../../utils/alert";


export default function AddVideoConsultingSchedule() {
  const navigate = useNavigate();

  const hospital = JSON.parse(localStorage.getItem("hospital"));
  const hospitalId = hospital?.id;

  const [form, setForm] = useState({
    doctorId: "",
    date: "",
    startTime: "",
    endTime: "",
    meetingLink: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDoctors = async () => {
      if (!hospitalId) return;

      try {
        const res = await axios.get(
          `https://cdcm-backend.onrender.com/api/hospital/doctors/hospital/${hospitalId}`
        );
        setDoctors(res.data);
      } catch (err) {
        setError("Failed to load doctors");
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, [hospitalId]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async () => {
  if (!form.doctorId || !form.date || !form.startTime || !form.endTime) {
    await showWarning(
      "Please fill in all required fields."
    );
    return;
  }

  if (!hospitalId) {
    await showError(
      "Hospital not found. Please log in again."
    );
    return;
  }

  if (form.startTime >= form.endTime) {
    await showWarning(
      "End time must be later than start time."
    );
    return;
  }

  const confirmed = await showConfirm(
    "Do you want to create and send this video schedule to the selected doctor?",
    "Create and Send Video Schedule?",
    "Yes, Send"
  );

  if (!confirmed) return;

  setSubmitting(true);

  try {
    await axios.post(
      "https://cdcm-backend.onrender.com/api/schedules",
      {
        doctorId: form.doctorId,
        hospitalId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        type: "VIDEO",
        meetingLink: form.meetingLink,
      }
    );

    await showSuccess(
      "Video schedule created and sent to the doctor successfully!"
    );

    navigate("/hospital/schedule");

  } catch (err) {
    console.error(err);

    await showError(
      "Failed to create and send the video schedule. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-4">Add Video Consulting Schedule</h1>

      {/* Doctor */}
      <label className="block mb-2 font-semibold">Select Doctor</label>
      <select
        name="doctorId"
        value={form.doctorId}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-4"
      >
        <option value="">Choose doctor</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.firstName} {d.lastName}
          </option>
        ))}
      </select>

      {/* Date */}
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-4"
      />

      {/* Time */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          type="time"
          name="startTime"
          value={form.startTime}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="time"
          name="endTime"
          value={form.endTime}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      {/* Meeting Link */}
      <input
        type="text"
        name="meetingLink"
        value={form.meetingLink}
        onChange={handleChange}
        placeholder="Zoom / Google Meet link"
        className="w-full border p-2 rounded mb-4"
      />

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/hospital/schedule")}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {submitting
              ? "Creating & Sending..."
              : "Create and Send Video Schedule"}
</button>
      </div>
    </div>
  );
}