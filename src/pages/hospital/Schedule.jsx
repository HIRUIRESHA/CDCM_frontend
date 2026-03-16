import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const STATUS_CONFIG = {
  ACCEPTED: { label: "Accepted", bg: "bg-emerald-100", text: "text-emerald-600", dot: "bg-emerald-600", border: "border-emerald-200" },
  PENDING:  { label: "Pending",  bg: "bg-amber-100",  text: "text-amber-600",  dot: "bg-amber-600",  border: "border-amber-200" },
  REJECTED: { label: "Rejected", bg: "bg-rose-100",   text: "text-rose-600",   dot: "bg-rose-600",   border: "border-rose-200" },
};

function formatTime(t) {
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

function isToday(dateStr) {
  const todayStr = new Date().toLocaleDateString("en-CA");
  return dateStr === todayStr;
}

export default function SchedulePage() {

  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-CA");

  const [selectedDate, setSelectedDate] = useState(today);

  const hospital = JSON.parse(localStorage.getItem("hospital"));
  const hospitalId = hospital?.id;

  useEffect(() => {

    if (!hospitalId) {
      console.error("Hospital ID not found");
      return;
    }

    setLoading(true);

    let url = `http://localhost:8082/api/schedules/hospital/${hospitalId}`;

    if (selectedDate) {
      url += `?date=${selectedDate}`;
    }

    axios.get(url)
      .then((res) => {
        setSchedules(res.data);
      })
      .catch((err) => {
        console.error("Error fetching schedules:", err);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [hospitalId, selectedDate]);

  const counts = {
    total: schedules.length,
    accepted: schedules.filter(s => s.status === "ACCEPTED").length,
    pending: schedules.filter(s => s.status === "PENDING").length,
    rejected: schedules.filter(s => s.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}

        <div className="flex justify-between items-start mb-6">

          <div>
            <h1 className="text-4xl font-bold">Schedule</h1>
            <p className="text-gray-500 mt-2">
              {selectedDate ? formatDate(selectedDate) : "All Dates"}
            </p>
          </div>

          <button
            onClick={() => navigate("/hospital/schedule/add")}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-500"
          >
            Add Schedule
          </button>

        </div>

        {/* Date Picker */}

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

        {/* Stats */}

        <div className="grid grid-cols-4 gap-4 mb-10">

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-xs text-gray-500">TOTAL</p>
            <p className="text-3xl font-bold">{loading ? "—" : counts.total}</p>
          </div>

          <div className="bg-emerald-100 border border-emerald-200 rounded-2xl p-5">
            <p className="text-xs text-gray-500">ACCEPTED</p>
            <p className="text-3xl font-bold text-emerald-600">{counts.accepted}</p>
          </div>

          <div className="bg-amber-100 border border-amber-200 rounded-2xl p-5">
            <p className="text-xs text-gray-500">PENDING</p>
            <p className="text-3xl font-bold text-amber-600">{counts.pending}</p>
          </div>

          <div className="bg-rose-100 border border-rose-200 rounded-2xl p-5">
            <p className="text-xs text-gray-500">REJECTED</p>
            <p className="text-3xl font-bold text-rose-600">{counts.rejected}</p>
          </div>

        </div>

        {/* Schedule List */}

        <h2 className="text-xs text-gray-500 uppercase mb-4">
          {selectedDate ? "Appointments" : "All Appointments"}
        </h2>

        {loading ? (

          <p>Loading schedules...</p>

        ) : schedules.length === 0 ? (

          <div className="bg-white border rounded-2xl p-16 text-center">

            <p className="text-gray-500 font-medium">No schedules found</p>

            <p className="text-gray-400 text-sm mt-1">
              Click "Add Schedule" to create one
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {schedules.map((schedule) => {

              const cfg = STATUS_CONFIG[schedule.status] || STATUS_CONFIG.PENDING;

              const name = schedule.doctorName || "Unknown Doctor";
              const specialty = schedule.specialty || "General";

              return (

                <div
                  key={schedule.id}
                  className="bg-white border rounded-2xl p-5 shadow-sm"
                >

                  <div className="flex justify-between">

                    <div>

                      <p className="font-semibold">{name}</p>

                      <p className="text-sm text-gray-500">{specialty}</p>

                      <p className="text-xs text-gray-400">
                        {formatDate(schedule.date)}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="font-mono font-semibold">

                        {formatTime(schedule.startTime)} — {formatTime(schedule.endTime)}

                      </p>

                      <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg ${cfg.bg} border ${cfg.border}`}>

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