import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddSchedulePage() {
  const navigate = useNavigate();

  // ----------------- Get logged-in hospital -----------------
  const hospital = JSON.parse(localStorage.getItem("hospital"));
  const hospitalId = hospital?.id; // Use real _id automatically

  // ----------------- Form state -----------------
  const [form, setForm] = useState({
    doctorId: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ----------------- Doctors list from backend -----------------
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    const loadDoctors = async () => {
      if (!hospitalId) {
        setError("Hospital not found. Please log in again.");
        setLoadingDoctors(false);
        return;
      }

      try {
        // Fetch doctors assigned to this hospital
        const res = await axios.get(
          `http://localhost:8082/api/hospital/doctors/hospital/${hospitalId}`
        );
        setDoctors(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctors");
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, [hospitalId]);

  // ----------------- Handle input changes -----------------
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  // ----------------- Submit form -----------------
  const handleSubmit = async () => {
    if (!form.doctorId || !form.date || !form.startTime || !form.endTime) {
      setError("Please fill all fields");
      return;
    }

    if (!hospitalId) {
      setError("Hospital not found. Please log in again.");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post("http://localhost:8082/api/schedules", {
        doctorId: form.doctorId,
        hospitalId: hospitalId, // Automatically from logged-in hospital
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
      });

      navigate("/hospital/schedule");
    } catch (err) {
      console.error(err);
      setError("Failed to create schedule");
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------- Selected doctor info (optional) -----------------
  const selectedDoctor = doctors.find((d) => d.id === form.doctorId);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-6">
      <h1 className="text-2xl font-bold mb-4">Add Doctor Schedule</h1>

      {/* Doctor Select */}
      <label className="block mb-2 text-sm font-semibold">Select Doctor</label>
      <select
        name="doctorId"
        value={form.doctorId}
        onChange={handleChange}
        className="w-full border rounded-lg p-2 mb-4"
        disabled={loadingDoctors}
      >
        <option value="">— Choose a doctor —</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.title} {d.firstName} {d.lastName} · {d.specialization}
          </option>
        ))}
      </select>

      {/* Date Input */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-semibold">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          min={new Date().toISOString().split("T")[0]}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* Start/End Time */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-2 text-sm font-semibold">Start Time</label>
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-semibold">End Time</label>
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/hospital/schedule")}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Schedule"}
        </button>
      </div>
    </div>
  );
}