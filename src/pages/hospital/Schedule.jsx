import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const STATUS_CONFIG = {
  ACCEPTED: { label: "Accepted", bg: "bg-emerald-100", text: "text-emerald-600", dot: "bg-emerald-600", border: "border-emerald-200" },
  PENDING: { label: "Pending", bg: "bg-amber-100", text: "text-amber-600", dot: "bg-amber-600", border: "border-amber-200" },
  REJECTED: { label: "Rejected", bg: "bg-rose-100", text: "text-rose-600", dot: "bg-rose-600", border: "border-rose-200" },
  CANCELLED: { label: "Cancelled", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-500", border: "border-slate-200" },
};

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SchedulePage() {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  const hospital = JSON.parse(localStorage.getItem("hospital"));
  const hospitalId = hospital?.id;

  useEffect(() => {
    if (!hospitalId) return;

    setLoading(true);

    let url = `http://localhost:8082/api/schedules/hospital/${hospitalId}`;
    if (selectedDate) url += `?date=${selectedDate}`;

    axios
      .get(url)
      .then((res) => {
        setSchedules(res.data || []);
      })
      .catch((err) => console.error("Schedule fetch error:", err))
      .finally(() => setLoading(false));
  }, [hospitalId, selectedDate]);

  // ✅ single source
  const allSchedules = schedules;

  const counts = {
    total: allSchedules.length,
    accepted: allSchedules.filter(s => s.status === "ACCEPTED").length,
    pending: allSchedules.filter(s => s.status === "PENDING").length,
    rejected: allSchedules.filter(s => s.status === "REJECTED").length,
    cancelled: allSchedules.filter(s => s.status === "CANCELLED").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">

          <div>
            <h1 className="text-4xl font-bold">Schedule</h1>
            <p className="text-gray-500 mt-2">{selectedDate}</p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={() => navigate("/hospital/schedule/add")}
              className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-500"
            >
              Add Physical Schedule
            </button>

            <button
              onClick={() => navigate("/hospital/schedule/video/add")}
              className="bg-purple-600 text-white px-5 py-3 rounded-xl hover:bg-purple-500"
            >
              Add Video Schedule
            </button>

          </div>

        </div>

        {/* DATE FILTER */}
        <div className="flex items-center gap-4 mb-6">

          <label className="font-semibold">Select Date:</label>

          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <button
            className="bg-gray-200 px-3 py-2 rounded-lg"
            onClick={() => setSelectedDate("")}
          >
            Show All
          </button>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-5 gap-4 mb-10">

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-xs text-gray-500">TOTAL</p>
            <p className="text-3xl font-bold">{counts.total}</p>
          </div>

          <div className="bg-emerald-100 border rounded-2xl p-5">
            <p className="text-xs text-gray-500">ACCEPTED</p>
            <p className="text-3xl font-bold text-emerald-600">{counts.accepted}</p>
          </div>

          <div className="bg-amber-100 border rounded-2xl p-5">
            <p className="text-xs text-gray-500">PENDING</p>
            <p className="text-3xl font-bold text-amber-600">{counts.pending}</p>
          </div>

          <div className="bg-rose-100 border rounded-2xl p-5">
            <p className="text-xs text-gray-500">REJECTED</p>
            <p className="text-3xl font-bold text-rose-600">{counts.rejected}</p>
          </div>

          <div className="bg-slate-100 border rounded-2xl p-5">
            <p className="text-xs text-gray-500">CANCELLED</p>
            <p className="text-3xl font-bold text-slate-600">{counts.cancelled}</p>
          </div>

        </div>

        {/* LIST */}
        <h2 className="text-xs text-gray-500 uppercase mb-4">
          All Appointments
        </h2>

        {loading ? (
          <p>Loading schedules...</p>
        ) : allSchedules.length === 0 ? (
          <div className="bg-white border rounded-2xl p-16 text-center">
            <p className="text-gray-500 font-medium">No schedules found</p>
          </div>
        ) : (
          <div className="space-y-3">

            {allSchedules.map((schedule) => {
              const cfg =
                STATUS_CONFIG[schedule.status] || STATUS_CONFIG.PENDING;

              return (
                <div
                  key={schedule.id}
                  className="bg-white border rounded-2xl p-5 shadow-sm"
                >

                  <div className="flex justify-between">

                    <div>

                      <p className="font-semibold">
                        {schedule.doctorName || "Unknown Doctor"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {schedule.specialty || "General"}
                      </p>

                      <p className="text-xs text-gray-400">
                        {formatDate(schedule.date)}
                      </p>

                      {/* TYPE */}
                      {schedule.type === "VIDEO" ? (
                        <>
                          <p className="text-xs text-purple-600 font-semibold">
                            🎥 Video Consulting
                          </p>

                          <p className="text-xs text-gray-500">
                            Meeting: {schedule.meetingLink}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-blue-600 font-semibold">
                          🏥 Physical Visit
                        </p>
                      )}

                    </div>

                    <div className="text-right">

                      <p className="font-mono font-semibold">
                        {formatTime(schedule.startTime)} —{" "}
                        {formatTime(schedule.endTime)}
                      </p>

                      <div
                        className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg ${cfg.bg} border ${cfg.border}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`}></div>
                        <span className={`text-xs font-semibold ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}