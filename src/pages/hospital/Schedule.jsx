import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8082/api/schedules";

const STATUS_CONFIG = {
  ACCEPTED: {
    label: "Accepted",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-500",
    border: "border-slate-200",
  },
};

function formatTime(time) {
  if (!time) return "--";

  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);

  if (Number.isNaN(hour)) return time;

  const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const period = hour >= 12 ? "PM" : "AM";

  return `${formattedHour}:${minutes} ${period}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "Date not available";

  const date = new Date(`${dateStr}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";

  const date = new Date(`${dateStr}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* =========================
   ICONS
========================= */

function CalendarIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ClockIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function DoctorIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 21a7 7 0 0 1 14 0" />
      <path d="M8.5 14.5h7" />
    </svg>
  );
}

function HospitalIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
      <path d="M9 21v-5h6v5M8 8h2M14 8h2M8 12h2M14 12h2" />
      <path d="M10 3v4M14 3v4M12 5v4M10 7h4" />
    </svg>
  );
}

function VideoIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10 5-3v10l-5-3z" />
    </svg>
  );
}

function PlusIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function RefreshIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 11a8.1 8.1 0 0 0-14.8-4.3L3 9" />
      <path d="M3 4v5h5" />
      <path d="M4 13a8.1 8.1 0 0 0 14.8 4.3L21 15" />
      <path d="M21 20v-5h-5" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function EmptyCalendarIcon() {
  return (
    <svg
      className="w-12 h-12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  numberColor = "text-gray-900",
}) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
            {label}
          </p>

          <p className={`mt-3 text-3xl font-bold ${numberColor}`}>
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================
   SCHEDULE CARD
========================= */

function ScheduleCard({ schedule }) {
  const cfg =
    STATUS_CONFIG[schedule.status] || STATUS_CONFIG.PENDING;

  const isVideo = schedule.type === "VIDEO";

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md">
      {/* TOP ROW */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* LEFT */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-4">
            {/* Doctor avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <DoctorIcon className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-gray-900">
                {schedule.doctorName || "Unknown Doctor"}
              </h3>

              <p className="mt-0.5 text-sm text-gray-500">
                {schedule.specialty || "General"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {formatShortDate(schedule.date)}
                </span>

                <span className="text-gray-300">•</span>

                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {formatTime(schedule.startTime)} -{" "}
                  {formatTime(schedule.endTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 lg:pl-4">
          {/* Schedule type */}
          <span
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
              isVideo
                ? "border-purple-200 bg-purple-50 text-purple-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            {isVideo ? (
              <VideoIcon className="h-4 w-4" />
            ) : (
              <HospitalIcon className="h-4 w-4" />
            )}

            {isVideo ? "Video Consultation" : "Physical Visit"}
          </span>

          {/* Status */}
          <span
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${cfg.bg} ${cfg.border}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${cfg.dot}`}
            />

            <span className={`text-xs font-semibold ${cfg.text}`}>
              {cfg.label}
            </span>
          </span>
        </div>
      </div>

      {/* DETAILS */}
      <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2">
        {/* Date */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
            <CalendarIcon className="h-4 w-4" />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Date
            </p>

            <p className="mt-0.5 text-sm font-medium text-gray-700">
              {formatDate(schedule.date)}
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
            <ClockIcon className="h-4 w-4" />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Consultation Time
            </p>

            <p className="mt-0.5 text-sm font-semibold text-gray-700">
              {formatTime(schedule.startTime)} -{" "}
              {formatTime(schedule.endTime)}
            </p>
          </div>
        </div>
      </div>

      {/* VIDEO LINK */}
      {isVideo && schedule.meetingLink && (
        <div className="mt-3 rounded-xl border border-purple-100 bg-purple-50/60 px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <VideoIcon className="h-4 w-4 shrink-0 text-purple-600" />

              <span className="text-xs font-semibold text-purple-700">
                Meeting Link
              </span>

              <span className="hidden text-xs text-gray-400 sm:inline">
                —
              </span>

              <span className="truncate text-xs text-gray-500">
                {schedule.meetingLink}
              </span>
            </div>

            <a
              href={schedule.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-semibold text-purple-700 hover:text-purple-900"
            >
              Open Meeting →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */

export default function SchedulePage() {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showFilter, setShowFilter] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const hospital = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("hospital") || "null");
    } catch {
      return null;
    }
  }, []);

  const hospitalId = hospital?.id || hospital?._id;

  /* =========================
     LOAD SCHEDULES
  ========================= */

  const loadSchedules = async (isRefresh = false) => {
    if (!hospitalId) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      let url = `${API_URL}/hospital/${hospitalId}`;

      if (selectedDate) {
        url += `?date=${selectedDate}`;
      }

      const response = await axios.get(url);

      setSchedules(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Schedule fetch error:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [hospitalId, selectedDate]);

  /* =========================
     COUNTS
  ========================= */

  const counts = useMemo(() => {
    return {
      total: schedules.length,

      accepted: schedules.filter(
        (schedule) => schedule.status === "ACCEPTED"
      ).length,

      pending: schedules.filter(
        (schedule) => schedule.status === "PENDING"
      ).length,

      rejected: schedules.filter(
        (schedule) => schedule.status === "REJECTED"
      ).length,

      cancelled: schedules.filter(
        (schedule) => schedule.status === "CANCELLED"
      ).length,
    };
  }, [schedules]);

  /* =========================
     FILTERED SCHEDULES
  ========================= */

  const filteredSchedules = useMemo(() => {
    if (statusFilter === "ALL") {
      return schedules;
    }

    return schedules.filter(
      (schedule) => schedule.status === statusFilter
    );
  }, [schedules, statusFilter]);

  /* =========================
     FILTER OPTIONS
  ========================= */

  const filterOptions = [
    {
      value: "ALL",
      label: "All Appointments",
      count: counts.total,
    },
    {
      value: "ACCEPTED",
      label: "Accepted",
      count: counts.accepted,
    },
    {
      value: "PENDING",
      label: "Pending",
      count: counts.pending,
    },
    {
      value: "REJECTED",
      label: "Rejected",
      count: counts.rejected,
    },
    {
      value: "CANCELLED",
      label: "Cancelled",
      count: counts.cancelled,
    },
  ];

  const activeFilter =
    filterOptions.find(
      (option) => option.value === statusFilter
    ) || filterOptions[0];

  /* =========================
     NO HOSPITAL
  ========================= */

  if (!hospitalId) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] font-sans text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <HospitalIcon className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Hospital information not found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              We could not find the logged-in hospital information.
              Please sign in again to continue managing schedules.
            </p>

            <button
              onClick={() => navigate("/hospital")}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Go to Hospital Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-sans text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* ==================================
            PAGE HEADER
        ================================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              Hospital Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Schedule Management
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Manage physical and video consultation schedules for
              your hospital.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => navigate("/hospital/schedule/add")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <PlusIcon className="h-4 w-4" />
              Physical Schedule
            </button>

            <button
              onClick={() =>
                navigate("/hospital/schedule/video/add")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <VideoIcon className="h-4 w-4" />
              Video Schedule
            </button>
          </div>
        </div>

        {/* ==================================
            DATE TOOLBAR
        ================================== */}

        <div className="mb-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CalendarIcon className="h-4 w-4 text-indigo-500" />
                Schedule Date
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    setSelectedDate(e.target.value)
                  }
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />

                <button
                  onClick={() => setSelectedDate("")}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    selectedDate === ""
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All Dates
                </button>
              </div>
            </div>

            <button
              onClick={() => loadSchedules(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshIcon
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* ==================================
            STATS
        ================================== */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total"
            value={counts.total}
            icon={<CalendarIcon className="h-5 w-5" />}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />

          <StatCard
            label="Accepted"
            value={counts.accepted}
            icon={<span className="text-lg font-bold">✓</span>}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            numberColor="text-emerald-600"
          />

          <StatCard
            label="Pending"
            value={counts.pending}
            icon={<ClockIcon className="h-5 w-5" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            numberColor="text-amber-600"
          />

          <StatCard
            label="Rejected"
            value={counts.rejected}
            icon={<span className="text-lg font-bold">×</span>}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            numberColor="text-rose-600"
          />

          <StatCard
            label="Cancelled"
            value={counts.cancelled}
            icon={<span className="text-lg font-bold">−</span>}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
            numberColor="text-slate-600"
          />
        </div>

        {/* ==================================
            APPOINTMENTS HEADER
        ================================== */}

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Appointments
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {selectedDate
                ? `Schedules for ${formatDate(selectedDate)}`
                : "Showing schedules for all dates"}
            </p>
          </div>

          {/* STATUS FILTER */}
          <div className="relative">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="inline-flex min-w-[190px] items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <span>{activeFilter.label}</span>

              <ChevronDownIcon
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  showFilter ? "rotate-180" : ""
                }`}
              />
            </button>

            {showFilter && (
              <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                {filterOptions.map((option) => {
                  const selected =
                    option.value === statusFilter;

                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setShowFilter(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        selected
                          ? "bg-indigo-50 font-semibold text-indigo-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{option.label}</span>

                      <span
                        className={`rounded-md px-2 py-0.5 text-xs ${
                          selected
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {option.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ==================================
            SCHEDULE LIST
        ================================== */}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gray-200" />

                  <div className="flex-1">
                    <div className="h-5 w-48 rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-32 rounded bg-gray-100" />
                    <div className="mt-3 h-3 w-64 rounded bg-gray-100" />
                  </div>

                  <div className="hidden h-9 w-28 rounded-lg bg-gray-100 sm:block" />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                  <div className="h-14 rounded-xl bg-gray-100" />
                  <div className="h-14 rounded-xl bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
              <EmptyCalendarIcon />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              No schedules found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {statusFilter !== "ALL"
                ? `There are no ${activeFilter.label.toLowerCase()} schedules for the selected date.`
                : selectedDate
                ? "There are no schedules available for the selected date."
                : "There are no schedules available at the moment."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              {statusFilter !== "ALL" && (
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Clear Filter
                </button>
              )}

              <button
                onClick={() => navigate("/hospital/schedule/add")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4" />
                Add Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSchedules.map((schedule, index) => (
              <ScheduleCard
                key={schedule.id || schedule._id || index}
                schedule={schedule}
              />
            ))}
          </div>
        )}

        {/* ==================================
            FOOTER SUMMARY
        ================================== */}

        {!loading && filteredSchedules.length > 0 && (
          <div className="mt-5 flex flex-col gap-2 border-t border-gray-200 pt-5 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing{" "}
              <span className="font-semibold text-gray-600">
                {filteredSchedules.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-600">
                {schedules.length}
              </span>{" "}
              schedules
            </p>

            <p>
              Last updated automatically when the selected date changes
            </p>
          </div>
        )}

        {/* ==================================
            INFORMATION PANEL
        ================================== */}

        <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
              <CalendarIcon className="h-4 w-4" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Schedule information
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Use the date selector to view schedules for a
                specific day, or choose "All Dates" to see all
                available schedules. Physical and video consultations
                are clearly identified for easy management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}