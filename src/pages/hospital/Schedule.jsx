import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Status badge configuration
const STATUS_CONFIG = {
  ACCEPTED: { label: "Accepted", bg: "bg-emerald-100", text: "text-emerald-600", dot: "bg-emerald-600", border: "border-emerald-200" },
  PENDING:  { label: "Pending",  bg: "bg-amber-100",  text: "text-amber-600",  dot: "bg-amber-600",  border: "border-amber-200" },
  REJECTED: { label: "Rejected", bg: "bg-rose-100",   text: "text-rose-600",   dot: "bg-rose-600",   border: "border-rose-200" },
};

// Time formatting
function formatTime(t) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

// Date formatting
function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

// Helper to check if a date is today
function isToday(dateStr) {
  const todayStr = new Date().toLocaleDateString("en-CA");
  return dateStr === todayStr;
}

export default function HospitalSchedulePage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-CA");
  const hospitalId = "H1"; // Replace with auth context hospital ID
  const [selectedDate, setSelectedDate] = useState(today);

  // Fetch schedules based on selected date
  useEffect(() => {
    setLoading(true);
    let url = `http://localhost:8082/api/schedules/hospital/${hospitalId}`;
    if (selectedDate) url += `?date=${selectedDate}`;

    axios.get(url)
      .then((res) => {
        setSchedules(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching schedules:", err);
        setLoading(false);
      });
  }, [hospitalId, selectedDate]);

  const counts = {
    total: schedules.length,
    accepted: schedules.filter(s => s.status === "ACCEPTED").length,
    pending:  schedules.filter(s => s.status === "PENDING").length,
    rejected: schedules.filter(s => s.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Schedule</h1>
            <p className="mt-2 text-gray-500 text-sm">{selectedDate ? formatDate(selectedDate) : "All Dates"}</p>
          </div>
          <button
            onClick={() => navigate("/hospital/schedule/add")}
            className="group flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-300/50 hover:shadow-blue-300/70 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Schedule
          </button>
        </div>

        {/* Date Picker */}
        <div className="mb-6 flex items-center gap-4">
          <label className="font-semibold">Select Date:</label>
          <input
            type="date"
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg"
            onClick={() => setSelectedDate("")} // show all schedules
          >
            Show All
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: selectedDate ? "Total Today" : "Total", value: counts.total, color: "text-gray-900", bg: "bg-white", border: "border-gray-200" },
            { label: "Accepted", value: counts.accepted, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" },
            { label: "Pending", value: counts.pending, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" },
            { label: "Rejected", value: counts.rejected, color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-200" },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-2xl p-5 backdrop-blur-sm`}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{loading ? "—" : stat.value}</p>
            </div>
          ))}
        </div>

        {/* Schedule List */}
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">
            {selectedDate ? "Appointments" : "All Appointments"}
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : schedules.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
              <p className="text-gray-500 font-medium">No schedules found</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add Schedule" to create one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule, index) => {
                const cfg = STATUS_CONFIG[schedule.status] || STATUS_CONFIG.PENDING;
                const name = schedule.doctorName || "Unknown Doctor";
                const specialty = schedule.specialty || "General";
                const highlightToday = isToday(schedule.date);

                return (
                  <div
                    key={schedule.id}
                    className={`group bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200
                      ${highlightToday ? "border-blue-400 ring-1 ring-blue-100" : "border-gray-200"}`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold text-sm">
                            {name.split(" ").filter(w => w !== "Dr.").map(w => w[0]).join("").slice(0,2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{specialty}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(schedule.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-gray-900 font-mono font-semibold text-sm">
                            {formatTime(schedule.startTime)} — {formatTime(schedule.endTime)}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {(() => {
                              const [sh, sm] = schedule.startTime.split(":").map(Number);
                              const [eh, em] = schedule.endTime.split(":").map(Number);
                              const diff = (eh * 60 + em) - (sh * 60 + sm);
                              return `${diff} min session`;
                            })()}
                          </p>
                        </div>

                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${cfg.bg} border ${cfg.border}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${schedule.status === "PENDING" ? "animate-pulse" : ""}`} />
                          <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
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
    </div>
  );
}