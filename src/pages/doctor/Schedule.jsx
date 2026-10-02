import { useEffect, useState } from "react";
import axios from "axios";
import {
  showSuccess,
  showError,
  showConfirm,
} from "../../utils/alert";

const API_URL = "https://cdcm-backend.onrender.com/api/schedules";

/* =========================
   CACHE
========================= */

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const readValidCache = (doctorId) => {
  try {
    const cached = sessionStorage.getItem(
      `doctorScheduleCache_${doctorId}`
    );

    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached);

    if (
      !parsed ||
      !Array.isArray(parsed.schedules) ||
      !parsed.timestamp
    ) {
      sessionStorage.removeItem(
        `doctorScheduleCache_${doctorId}`
      );
      return null;
    }

    const isExpired =
      Date.now() - parsed.timestamp > CACHE_DURATION;

    if (isExpired) {
      sessionStorage.removeItem(
        `doctorScheduleCache_${doctorId}`
      );
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn(
      "Error reading doctor schedule cache:",
      error
    );

    try {
      sessionStorage.removeItem(
        `doctorScheduleCache_${doctorId}`
      );
    } catch {
      // Ignore storage errors
    }

    return null;
  }
};

const clearScheduleCache = (doctorId) => {
  try {
    sessionStorage.removeItem(
      `doctorScheduleCache_${doctorId}`
    );
  } catch (error) {
    console.warn(
      "Error clearing doctor schedule cache:",
      error
    );
  }
};

/* =========================
   STATISTICS
========================= */

const statCards = [
  {
    label: "Total Shifts",
    key: "total",
    icon: "▦",
    iconClass: "bg-slate-100 text-slate-600",
    valueClass: "text-slate-900",
    description: "All assigned shifts",
  },
  {
    label: "Accepted",
    key: "accepted",
    icon: "✓",
    iconClass: "bg-emerald-50 text-emerald-600",
    valueClass: "text-emerald-700",
    description: "Confirmed shifts",
  },
  {
    label: "Pending",
    key: "pending",
    icon: "◷",
    iconClass: "bg-amber-50 text-amber-600",
    valueClass: "text-amber-700",
    description: "Awaiting response",
  },
  {
    label: "Rejected",
    key: "rejected",
    icon: "✕",
    iconClass: "bg-rose-50 text-rose-600",
    valueClass: "text-rose-700",
    description: "Declined shifts",
  },
  {
    label: "Cancelled",
    key: "cancelled",
    icon: "⊘",
    iconClass: "bg-slate-100 text-slate-500",
    valueClass: "text-slate-600",
    description: "Cancelled shifts",
  },
];

/* =========================
   STATUS STYLES
========================= */

const statusStyles = {
  PENDING:
    "bg-amber-50 text-amber-700 border-amber-200",

  ACCEPTED:
    "bg-emerald-50 text-emerald-700 border-emerald-200",

  REJECTED:
    "bg-rose-50 text-rose-700 border-rose-200",

  CANCELLED:
    "bg-slate-100 text-slate-600 border-slate-200",
};

/* =========================
   FORMATTERS
========================= */

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMonth = (date) => {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
  });
};

const getDay = (date) => {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.getDate();
};

const formatTime = (time) => {
  if (!time) return "—";

  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes || 0),
    0,
    0
  );

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/* =========================
   ICONS
========================= */

const PersonIcon = ({
  className = "h-5 w-5",
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
    />

    <circle
      cx="9"
      cy="7"
      r="4"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
    />
  </svg>
);

const CalendarIcon = ({
  className = "h-5 w-5",
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
    />
  </svg>
);

const ClockIcon = ({
  className = "h-5 w-5",
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 7v5l3 2"
    />
  </svg>
);

const HospitalIcon = ({
  className = "h-5 w-5",
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 7h6M9 11h6M9 15h2M13 15h2M11 21v-4h2v4"
    />
  </svg>
);

const RefreshIcon = ({
  className = "h-4 w-4",
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 11a8.1 8.1 0 00-15.5-2M4 5v4h4M4 13a8.1 8.1 0 0015.5 2M20 19v-4h-4"
    />
  </svg>
);

/* =========================
   MAIN COMPONENT
========================= */

export default function SchedulePage() {
  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch (error) {
      console.warn(
        "Unable to read user from localStorage:",
        error
      );
      return null;
    }
  })();

  const doctorId = user?.id || user?._id;

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTargetId, setCancelTargetId] =
    useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [processingId, setProcessingId] =
    useState(null);

  /* =========================
     TOAST
  ========================= */

  const showToast = (type, msg) => {
    setToast({
      type,
      msg,
    });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  /* =========================
     LOAD SCHEDULES
  ========================= */

  const loadSchedules = async ({
    showLoading = true,
  } = {}) => {
    if (!doctorId) {
      console.warn(
        "Doctor ID not found. User:",
        user
      );

      setSchedules([]);
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }

    const requestUrl =
      `${API_URL}/doctor/${doctorId}`;

    console.log(
      "Loading doctor schedules..."
    );

    console.log(
      "Doctor ID:",
      doctorId
    );

    console.log(
      "Schedule URL:",
      requestUrl
    );

    try {
      const res = await axios.get(
        requestUrl
      );

      console.log(
        "Schedule API response:",
        res.data
      );

      const physicalSchedules =
        (res.data || []).filter(
          (schedule) =>
            schedule.type === "PHYSICAL"
        );

      setSchedules(
        physicalSchedules
      );

      /* Save latest schedules to cache */
      try {
        sessionStorage.setItem(
          `doctorScheduleCache_${doctorId}`,
          JSON.stringify({
            schedules:
              physicalSchedules,
            timestamp:
              Date.now(),
          })
        );
      } catch (storageErr) {
        console.warn(
          "Error saving doctor schedule cache:",
          storageErr
        );
      }
    } catch (err) {
      console.error(
        "Failed to load schedules:",
        err
      );

      console.error(
        "Request URL:",
        requestUrl
      );

      console.error(
        "HTTP status:",
        err.response?.status
      );

      console.error(
        "Response data:",
        err.response?.data
      );

      console.error(
        "Response headers:",
        err.response?.headers
      );

      showToast(
        "error",
        "Unable to load schedules."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    console.log(
      "User from localStorage:",
      user
    );

    console.log(
      "Doctor ID:",
      doctorId
    );

    if (!doctorId) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    const cachedData =
      readValidCache(doctorId);

    if (cachedData) {
      console.log(
        "Using cached schedules:",
        cachedData.schedules
      );

      setSchedules(
        cachedData.schedules
      );

      setLoading(false);

      /* Refresh from backend in background */
      loadSchedules({
        showLoading: false,
      });
    } else {
      console.log(
        "No valid schedule cache found."
      );

      loadSchedules({
        showLoading: true,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  /* =========================
     REFRESH
  ========================= */

  const refreshSchedules = async () => {
    if (!doctorId) {
      return;
    }

    clearScheduleCache(
      doctorId
    );

    setLoading(true);

    await loadSchedules({
      showLoading: true,
    });
  };

  /* =========================
     ACCEPT
  ========================= */

  const acceptSchedule = async (id) => {
    const confirmed =
      await showConfirm(
        "Do you want to accept this schedule?",
        "Accept Schedule?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(id);

      await axios.put(
        `${API_URL}/accept/${id}`
      );

      clearScheduleCache(
        doctorId
      );

      await showSuccess(
        "Schedule accepted successfully!"
      );

      await loadSchedules({
        showLoading: false,
      });
    } catch (err) {
      console.error(
        "Failed to accept schedule:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Response:",
        err.response?.data
      );

      await showError(
        "Failed to accept schedule."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================
     REJECT
  ========================= */

  const rejectSchedule = async (id) => {
    const confirmed =
      await showConfirm(
        "Do you want to reject this schedule?",
        "Reject Schedule?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(id);

      await axios.put(
        `${API_URL}/reject/${id}`
      );

      clearScheduleCache(
        doctorId
      );

      await showSuccess(
        "Schedule rejected successfully!"
      );

      await loadSchedules({
        showLoading: false,
      });
    } catch (err) {
      console.error(
        "Failed to reject schedule:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Response:",
        err.response?.data
      );

      await showError(
        "Failed to reject schedule."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================
     CANCEL
  ========================= */

  const confirmCancel = async () => {
    if (!cancelTargetId) {
      return;
    }

    try {
      setProcessingId(
        cancelTargetId
      );

      const requestUrl =
        `${API_URL}/cancel/${cancelTargetId}`;

      console.log(
        "Cancelling schedule:",
        requestUrl
      );

      await axios.put(
        requestUrl
      );

      clearScheduleCache(
        doctorId
      );

      showToast(
        "success",
        "Schedule cancelled successfully."
      );

      setCancelTargetId(null);

      await loadSchedules({
        showLoading: false,
      });
    } catch (err) {
      console.error(
        "Failed to cancel schedule:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Response:",
        err.response?.data
      );

      showToast(
        "error",
        "Failed to cancel schedule."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================
     COUNTS
  ========================= */

  const counts = {
    total: schedules.length,

    accepted: schedules.filter(
      (s) =>
        s.status === "ACCEPTED"
    ).length,

    pending: schedules.filter(
      (s) =>
        s.status === "PENDING"
    ).length,

    rejected: schedules.filter(
      (s) =>
        s.status === "REJECTED"
    ).length,

    cancelled: schedules.filter(
      (s) =>
        s.status === "CANCELLED"
    ).length,
  };

  /* =========================
     FILTER
  ========================= */

  const filteredSchedules =
    filter === "ALL"
      ? schedules
      : schedules.filter(
          (s) =>
            s.status === filter
        );

  const filterOptions = [
    {
      value: "ALL",
      label: "All",
      count: counts.total,
    },
    {
      value: "PENDING",
      label: "Pending",
      count: counts.pending,
    },
    {
      value: "ACCEPTED",
      label: "Accepted",
      count: counts.accepted,
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

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-slate-800">
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <section className="mb-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <div className="mb-2 flex items-center gap-2">

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <CalendarIcon className="h-4 w-4" />
                </span>

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Doctor Portal
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Schedule Management
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
                Review your assigned hospital shifts and manage your schedule.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">

              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500 shadow-sm sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Schedule information up to date
              </div>

              <button
                type="button"
                onClick={refreshSchedules}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshIcon
                  className={
                    loading
                      ? "h-4 w-4 animate-spin"
                      : "h-4 w-4"
                  }
                />

                Refresh
              </button>

            </div>
          </div>
        </section>

        {/* =========================
            STATISTICS
        ========================= */}

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">

          {statCards.map((card) => (
            <div
              key={card.key}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${card.iconClass}`}
                >
                  {card.icon}
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {card.key === "total"
                    ? "Overall"
                    : "Shifts"}
                </span>

              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {card.label}
              </p>

              <p
                className={`mt-0.5 text-2xl font-bold ${card.valueClass}`}
              >
                {counts[card.key]}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {card.description}
              </p>
            </div>
          ))}

        </section>

        {/* =========================
            MAIN SCHEDULE CARD
        ========================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* CARD TITLE */}

          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-7">

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <CalendarIcon className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    My Schedule
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                    Assigned physical hospital shifts
                  </p>
                </div>

              </div>
            </div>

            <div className="flex items-center gap-2">

              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                {counts.pending} Pending
              </span>

              <button
                type="button"
                onClick={refreshSchedules}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 sm:hidden"
              >
                <RefreshIcon
                  className={
                    loading
                      ? "h-4 w-4 animate-spin"
                      : "h-4 w-4"
                  }
                />
              </button>

            </div>
          </div>

          {/* =========================
              FILTER BAR
          ========================= */}

          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-7">

            <div className="flex flex-wrap gap-2">

              {filterOptions.map(
                (option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFilter(
                        option.value
                      )
                    }
                    className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all sm:px-4 ${
                      filter ===
                      option.value
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {option.label} (
                    {option.count})
                  </button>
                )
              )}

            </div>

            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {
                  filteredSchedules.length
                }
              </span>{" "}
              of {schedules.length} shifts
            </p>

          </div>

          {/* =========================
              CONTENT STATES
          ========================= */}

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

              <p className="text-sm font-medium text-slate-500">
                Loading schedules...
              </p>

            </div>
          ) : !doctorId ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-2xl font-bold text-amber-500">
                !
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Doctor account not found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Please sign in again to view your assigned schedules.
              </p>

            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <CalendarIcon className="h-7 w-7" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                {filter === "ALL"
                  ? "No schedules yet"
                  : `No ${filter.toLowerCase()} schedules`}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
                {filter === "ALL"
                  ? "Your assigned physical hospital shifts will appear here."
                  : "There are currently no schedules matching this status."}
              </p>

              {filter !== "ALL" && (
                <button
                  type="button"
                  onClick={() =>
                    setFilter("ALL")
                  }
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  View all schedules
                </button>
              )}

            </div>
          ) : (
            <>
              {/* =========================
                  DESKTOP TABLE
              ========================= */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[1050px] text-left">

                  <thead className="border-b border-slate-100 bg-slate-50/70">

                    <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">

                      <th className="px-6 py-4">
                        Date
                      </th>

                      <th className="px-6 py-4">
                        Time
                      </th>

                      <th className="px-6 py-4">
                        Hospital
                      </th>

                      <th className="px-6 py-4">
                        Patients
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredSchedules.map(
                      (s) => {
                        const id =
                          s.id ||
                          s._id;

                        const isProcessing =
                          processingId ===
                          id;

                        const bookedPatientCount =
                          Number(
                            s.bookedPatientCount ||
                              0
                          );

                        return (
                          <tr
                            key={id}
                            className="transition-colors hover:bg-slate-50/70"
                          >

                            {/* DATE */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">

                                  <span className="text-[9px] font-bold uppercase tracking-wide">
                                    {getMonth(
                                      s.date
                                    )}
                                  </span>

                                  <span className="text-lg font-bold leading-tight">
                                    {getDay(
                                      s.date
                                    )}
                                  </span>

                                </div>

                                <div>

                                  <p className="text-sm font-semibold text-slate-700">
                                    {formatDate(
                                      s.date
                                    )}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    Hospital shift
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* TIME */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-2.5">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                  <ClockIcon className="h-4 w-4" />
                                </div>

                                <div>

                                  <p className="text-sm font-semibold text-slate-700">
                                    {formatTime(
                                      s.startTime
                                    )}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    until{" "}
                                    {formatTime(
                                      s.endTime
                                    )}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* HOSPITAL */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                  <HospitalIcon className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">

                                  <p className="max-w-[240px] truncate text-sm font-semibold text-slate-700">
                                    {s.hospitalName ||
                                      "Hospital"}
                                  </p>

                                  <p className="mt-1 max-w-[240px] truncate text-xs text-slate-400">
                                    {s.hospitalLocation ||
                                      "Location unavailable"}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* PATIENTS */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                  <PersonIcon className="h-5 w-5" />
                                </div>

                                <div>

                                  <p className="text-sm font-bold text-slate-700">
                                    {
                                      bookedPatientCount
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {bookedPatientCount ===
                                    1
                                      ? "patient booked"
                                      : "patients booked"}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5">

                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                  statusStyles[
                                    s.status
                                  ] ||
                                  statusStyles.CANCELLED
                                }`}
                              >

                                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                {s.status}

                              </span>

                            </td>

                            {/* ACTION */}

                            <td className="px-6 py-5">

                              <div className="flex flex-wrap items-center gap-2">

                                {s.status ===
                                  "PENDING" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        acceptSchedule(
                                          id
                                        )
                                      }
                                      disabled={
                                        isProcessing
                                      }
                                      className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {isProcessing
                                        ? "..."
                                        : "✓ Accept"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        rejectSchedule(
                                          id
                                        )
                                      }
                                      disabled={
                                        isProcessing
                                      }
                                      className="rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      ✕ Reject
                                    </button>
                                  </>
                                )}

                                {s.status ===
                                  "ACCEPTED" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCancelTargetId(
                                        id
                                      )
                                    }
                                    disabled={
                                      isProcessing
                                    }
                                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Cancel shift
                                  </button>
                                )}

                                {s.status ===
                                  "REJECTED" && (
                                  <span className="text-xs font-medium text-slate-400">
                                    Declined
                                  </span>
                                )}

                                {s.status ===
                                  "CANCELLED" && (
                                  <span className="text-xs font-medium text-slate-400">
                                    Cancelled
                                  </span>
                                )}

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>
                </table>

              </div>

              {/* =========================
                  MOBILE CARDS
              ========================= */}

              <div className="space-y-3 p-4 md:hidden">

                {filteredSchedules.map(
                  (s) => {
                    const id =
                      s.id ||
                      s._id;

                    const isProcessing =
                      processingId ===
                      id;

                    const bookedPatientCount =
                      Number(
                        s.bookedPatientCount ||
                          0
                      );

                    return (
                      <article
                        key={id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >

                        {/* DATE + STATUS */}

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">

                              <span className="text-[9px] font-bold uppercase">
                                {getMonth(
                                  s.date
                                )}
                              </span>

                              <span className="text-lg font-bold leading-tight">
                                {getDay(
                                  s.date
                                )}
                              </span>

                            </div>

                            <div>

                              <p className="text-sm font-bold text-slate-800">
                                {formatDate(
                                  s.date
                                )}
                              </p>

                              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">

                                <ClockIcon className="h-3.5 w-3.5" />

                                {formatTime(
                                  s.startTime
                                )}{" "}
                                –{" "}
                                {formatTime(
                                  s.endTime
                                )}

                              </div>

                            </div>

                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                              statusStyles[
                                s.status
                              ] ||
                              statusStyles.CANCELLED
                            }`}
                          >
                            {s.status}
                          </span>

                        </div>

                        {/* HOSPITAL */}

                        <div className="my-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                            <HospitalIcon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-700">
                              {s.hospitalName ||
                                "Hospital"}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {s.hospitalLocation ||
                                "Location unavailable"}
                            </p>

                          </div>

                        </div>

                        {/* PATIENT COUNT */}

                        <div className="mb-4 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                              <PersonIcon className="h-5 w-5" />
                            </div>

                            <div>

                              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                                Bookings
                              </p>

                              <p className="mt-0.5 text-sm font-bold text-slate-700">
                                {
                                  bookedPatientCount
                                }{" "}
                                {bookedPatientCount ===
                                1
                                  ? "patient"
                                  : "patients"}
                              </p>

                            </div>

                          </div>

                          <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-indigo-600 shadow-sm">
                            Confirmed
                          </span>

                        </div>

                        {/* ACTIONS */}

                        {s.status ===
                          "PENDING" && (
                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                acceptSchedule(
                                  id
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              className="flex-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isProcessing
                                ? "..."
                                : "✓ Accept"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                rejectSchedule(
                                  id
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              className="flex-1 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              ✕ Reject
                            </button>

                          </div>
                        )}

                        {s.status ===
                          "ACCEPTED" && (
                          <button
                            type="button"
                            onClick={() =>
                              setCancelTargetId(
                                id
                              )
                            }
                            disabled={
                              isProcessing
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel shift
                          </button>
                        )}

                        {s.status ===
                          "REJECTED" && (
                          <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-center text-xs font-medium text-slate-400">
                            This shift was declined
                          </div>
                        )}

                        {s.status ===
                          "CANCELLED" && (
                          <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-center text-xs font-medium text-slate-400">
                            This shift was cancelled
                          </div>
                        )}

                      </article>
                    );
                  }
                )}

              </div>
            </>
          )}

          {/* =========================
              FOOTER
          ========================= */}

          {!loading &&
            schedules.length > 0 && (
              <div className="flex flex-col justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:px-7">

                <p>
                  Showing{" "}
                  <span className="font-semibold text-slate-600">
                    {
                      filteredSchedules.length
                    }
                  </span>{" "}
                  schedule
                  {filteredSchedules.length !==
                  1
                    ? "s"
                    : ""}
                </p>

                <p className="flex items-center gap-1.5">

                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  Schedule information is up to date

                </p>

              </div>
            )}

        </section>

        {/* =========================
            INFORMATION PANEL
        ========================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:px-7">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >

                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />

                <path
                  strokeLinecap="round"
                  d="M12 10v6M12 7.5h.01"
                />

              </svg>

            </div>

            <div>

              <h3 className="text-sm font-bold text-slate-800">
                Schedule information
              </h3>

              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                Review your hospital shifts and respond to pending
                assignments. Patient bookings are shown for each shift.
                Only accepted shifts can be cancelled.
              </p>

            </div>

          </div>

        </section>

      </main>

      {/* =========================
          CANCEL MODAL
      ========================= */}

      {cancelTargetId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (
              e.target ===
                e.currentTarget &&
              !processingId
            ) {
              setCancelTargetId(null);
            }
          }}
        >

          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl font-bold text-rose-500">
              !
            </div>

            <h2 className="text-center text-xl font-bold text-slate-900">
              Cancel this schedule?
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-slate-500">
              Are you sure you want to cancel this accepted hospital shift?
              This action cannot be undone.
            </p>

            <div className="mt-7 flex gap-3">

              <button
                type="button"
                onClick={() =>
                  setCancelTargetId(null)
                }
                disabled={!!processingId}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep Schedule
              </button>

              <button
                type="button"
                onClick={confirmCancel}
                disabled={!!processingId}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingId
                  ? "Cancelling..."
                  : "Yes, Cancel"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          TOAST
      ========================= */}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] flex max-w-[calc(100%-3rem)] items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-xl ${
            toast.type === "success"
              ? "border-emerald-100"
              : "border-rose-100"
          }`}
        >

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {toast.type ===
            "success"
              ? "✓"
              : "!"}
          </div>

          <div>

            <p className="text-sm font-bold text-slate-800">
              {toast.type ===
              "success"
                ? "Success"
                : "Error"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {toast.msg}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setToast(null)
            }
            className="ml-2 text-slate-400 transition hover:text-slate-700"
            aria-label="Close notification"
          >
            ✕
          </button>

        </div>
      )}
    </div>
  );
}