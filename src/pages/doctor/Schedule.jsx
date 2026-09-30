import { useEffect, useState } from "react";
import axios from "axios";
import {
  showSuccess,
  showError,
  showConfirm,
} from "../../utils/alert";

const API_URL = "http://localhost:8082/api/schedules";

const statCards = [
  {
    label: "TOTAL SHIFTS",
    key: "total",
    icon: "▦",
    gradient: "from-[#4F46E5] to-[#6366F1]",
    description: "All assigned shifts",
  },
  {
    label: "ACCEPTED",
    key: "accepted",
    icon: "✓",
    gradient: "from-[#059669] to-[#14B8A6]",
    description: "Confirmed shifts",
  },
  {
    label: "PENDING",
    key: "pending",
    icon: "◷",
    gradient: "from-[#F59E0B] to-[#FBBF24]",
    description: "Awaiting response",
  },
  {
    label: "REJECTED",
    key: "rejected",
    icon: "✕",
    gradient: "from-[#E11D48] to-[#F43F5E]",
    description: "Declined shifts",
  },
  {
    label: "CANCELLED",
    key: "cancelled",
    icon: "⊘",
    gradient: "from-[#475569] to-[#64748B]",
    description: "Cancelled shifts",
  },
];

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

export default function SchedulePage() {
  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  })();

  const doctorId = user?.id || user?._id;

  const doctorName =
    user?.name ||
    user?.fullName ||
    user?.firstName ||
    "Doctor";

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTargetId, setCancelTargetId] =
    useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [processingId, setProcessingId] =
    useState(null);

  const today = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const showToast = (type, msg) => {
    setToast({ type, msg });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadSchedules = async () => {
    if (!doctorId) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/doctor/${doctorId}`
      );

      const physicalSchedules = (
        res.data || []
      ).filter(
        (schedule) =>
          schedule.type === "PHYSICAL"
      );

      setSchedules(physicalSchedules);
    } catch (err) {
      console.error(
        "Failed to load schedules:",
        err
      );

      showToast(
        "error",
        "Unable to load schedules."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [doctorId]);

  const acceptSchedule = async (id) => {
    const confirmed = await showConfirm(
      "Do you want to accept this schedule?",
      "Accept Schedule?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);

      await axios.put(
        `${API_URL}/accept/${id}`
      );

      await showSuccess(
        "Schedule accepted successfully!"
      );

      await loadSchedules();
    } catch (err) {
      console.error(err);

      await showError(
        "Failed to accept schedule."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const rejectSchedule = async (id) => {
    const confirmed = await showConfirm(
      "Do you want to reject this schedule?",
      "Reject Schedule?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);

      await axios.put(
        `${API_URL}/reject/${id}`
      );

      await showSuccess(
        "Schedule rejected successfully!"
      );

      await loadSchedules();
    } catch (err) {
      console.error(err);

      await showError(
        "Failed to reject schedule."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTargetId) return;

    try {
      setProcessingId(cancelTargetId);

      await axios.put(
        `${API_URL}/cancel/${cancelTargetId}`
      );

      showToast(
        "success",
        "Schedule cancelled successfully."
      );

      setCancelTargetId(null);

      await loadSchedules();
    } catch (err) {
      console.error(err);

      showToast(
        "error",
        "Failed to cancel schedule."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const counts = {
    total: schedules.length,

    accepted: schedules.filter(
      (s) => s.status === "ACCEPTED"
    ).length,

    pending: schedules.filter(
      (s) => s.status === "PENDING"
    ).length,

    rejected: schedules.filter(
      (s) => s.status === "REJECTED"
    ).length,

    cancelled: schedules.filter(
      (s) => s.status === "CANCELLED"
    ).length,
  };

  const filteredSchedules =
    filter === "ALL"
      ? schedules
      : schedules.filter(
          (s) => s.status === filter
        );

  return (
    <div className="min-h-screen bg-[#F4F6FC] text-slate-800">

      {/* ================================================= */}
      {/* HERO HEADER */}
      {/* ================================================= */}

      <header className="relative mx-3 mt-3 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#18265E] via-[#30368D] to-[#463B9C] px-5 pb-8 pt-7 text-white shadow-xl sm:mx-5 sm:px-8 sm:pb-9 sm:pt-8 lg:mx-7 lg:px-10">

        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[55px] border-white/[0.035]" />

        <div className="pointer-events-none absolute -bottom-40 left-[25%] h-96 w-96 rounded-full bg-white/[0.025]" />

        <div className="pointer-events-none absolute right-[28%] top-10 h-36 w-36 rounded-full bg-indigo-300/[0.05]" />

        <div className="relative z-10">

          {/* TOP AREA */}

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            {/* DOCTOR */}

            <div className="flex items-center gap-4">

              <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl border-2 border-indigo-300/50 bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-bold shadow-lg">

                {doctorName
                  .charAt(0)
                  .toUpperCase()}

                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#30368D] bg-emerald-500 text-xs font-bold">
                  ✓
                </span>

              </div>

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-200">
                  Doctor Portal
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome, Dr. {doctorName}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-indigo-100">

                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.8)]" />

                  <span>
                    Schedule Management
                  </span>

                  <span className="text-indigo-300">
                    •
                  </span>

                  <span>
                    {counts.accepted} active shifts
                  </span>

                </div>

              </div>

            </div>

            {/* TODAY */}

            <div className="flex items-center gap-3 self-start rounded-2xl border border-white/10 bg-white/10 px-4 py-3.5 backdrop-blur-md lg:self-center">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                ▦
              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200">
                  Today
                </p>

                <p className="mt-1 text-sm font-semibold sm:text-base">
                  {today}
                </p>

              </div>

            </div>

          </div>

          {/* STATISTICS */}

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">

            {statCards.map((card) => (
              <div
                key={card.key}
                className={`group rounded-2xl bg-gradient-to-br ${card.gradient} p-4 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white backdrop-blur-sm">
                    {card.icon}
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/65">
                    {card.key === "total"
                      ? "Overall"
                      : "Shifts"}
                  </span>

                </div>

                <p className="mt-4 text-[10px] font-bold tracking-wider text-white/80">
                  {card.label}
                </p>

                <h2 className="mt-0.5 text-2xl font-bold">
                  {counts[card.key]}
                </h2>

                <p className="mt-1 text-[11px] text-white/75">
                  {card.description}
                </p>

              </div>
            ))}

          </div>

        </div>
      </header>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">

        {/* SCHEDULE CARD */}

        <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_10px_40px_rgba(40,50,100,0.07)]">

          {/* CARD HEADER */}

          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-7">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
                ▦
              </div>

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  My Schedule
                </h2>

                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Manage and review your assigned hospital shifts
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                {counts.pending} Pending
              </span>

              <button
                onClick={() => {
                  setLoading(true);
                  loadSchedules();
                }}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <span
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                >
                  ↻
                </span>

                Refresh

              </button>

            </div>

          </div>

          {/* FILTER BAR */}

          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-7">

            <div className="flex flex-wrap gap-2">

              {[
                "ALL",
                "PENDING",
                "ACCEPTED",
                "REJECTED",
                "CANCELLED",
              ].map((status) => {

                const count =
                  status === "ALL"
                    ? counts.total
                    : counts[
                        status.toLowerCase()
                      ];

                const label =
                  status === "ALL"
                    ? "All"
                    : status
                        .charAt(0)
                        .toUpperCase() +
                      status
                        .slice(1)
                        .toLowerCase();

                return (
                  <button
                    key={status}
                    onClick={() =>
                      setFilter(status)
                    }
                    className={`rounded-full px-3.5 py-2 text-xs font-bold transition-all sm:px-4 ${
                      filter === status
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {label} ({count})
                  </button>
                );
              })}

            </div>

            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {filteredSchedules.length}
              </span>{" "}
              of {schedules.length} shifts
            </p>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="flex min-h-[340px] flex-col items-center justify-center gap-4">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

              <p className="text-sm font-medium text-slate-500">
                Loading your schedules...
              </p>

            </div>

          ) : !doctorId ? (

            <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-500">
                !
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                Doctor account not found
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Please sign in again to view your assigned schedules.
              </p>

            </div>

          ) : filteredSchedules.length === 0 ? (

            <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-500">
                ▦
              </div>

              <h3 className="text-lg font-bold text-slate-800">
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
                  onClick={() => setFilter("ALL")}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  View all schedules
                </button>
              )}

            </div>

          ) : (

            <>

              {/* ================================================= */}
              {/* DESKTOP TABLE */}
              {/* ================================================= */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[1100px] text-left">

                  <thead className="bg-slate-50/80">

                    <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">

                      <th className="px-6 py-5">
                        Date
                      </th>

                      <th className="px-6 py-5">
                        Time
                      </th>

                      <th className="px-6 py-5">
                        Hospital
                      </th>

                      {/* NEW PATIENT COUNT COLUMN */}

                      <th className="px-6 py-5">
                        Patients
                      </th>

                      <th className="px-6 py-5">
                        Status
                      </th>

                      <th className="px-6 py-5">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredSchedules.map(
                      (s) => {

                        const id =
                          s.id || s._id;

                        const isProcessing =
                          processingId === id;

                        const bookedPatientCount =
                          Number(
                            s.bookedPatientCount || 0
                          );

                        return (
                          <tr
                            key={id}
                            className="group transition-colors hover:bg-indigo-50/30"
                          >

                            {/* DATE */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-3">

                                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                                  <span className="text-[9px] font-bold uppercase tracking-wide">
                                    {getMonth(s.date)}
                                  </span>

                                  <span className="text-lg font-bold leading-tight">
                                    {getDay(s.date)}
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

                              <div className="flex items-start gap-2">

                                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
                                  ◷
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

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg text-violet-600">
                                  ✚
                                </div>

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-semibold text-slate-700">
                                    {s.hospitalName ||
                                      "Hospital"}
                                  </p>

                                  <p className="mt-1 max-w-[230px] truncate text-xs text-slate-400">
                                    {s.hospitalLocation ||
                                      "Location unavailable"}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* ================================================= */}
                            {/* PATIENT COUNT */}
                            {/* ================================================= */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">

                                  <svg
                                    className="h-5 w-5"
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

                                </div>

                                <div>

                                  <p className="text-sm font-bold text-slate-700">
                                    {bookedPatientCount}
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
                                      onClick={() =>
                                        acceptSchedule(
                                          id
                                        )
                                      }
                                      disabled={
                                        isProcessing
                                      }
                                      className="rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {isProcessing
                                        ? "..."
                                        : "✓ Accept"}
                                    </button>

                                    <button
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
                                    onClick={() =>
                                      setCancelTargetId(
                                        id
                                      )
                                    }
                                    disabled={
                                      isProcessing
                                    }
                                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                                  >
                                    Cancel shift
                                  </button>
                                )}

                                {s.status ===
                                  "REJECTED" && (
                                  <span className="text-xs text-slate-400">
                                    Declined
                                  </span>
                                )}

                                {s.status ===
                                  "CANCELLED" && (
                                  <span className="text-xs text-slate-400">
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

              {/* ================================================= */}
              {/* MOBILE CARDS */}
              {/* ================================================= */}

              <div className="space-y-3 p-4 md:hidden">

                {filteredSchedules.map(
                  (s) => {

                    const id =
                      s.id || s._id;

                    const isProcessing =
                      processingId === id;

                    const bookedPatientCount =
                      Number(
                        s.bookedPatientCount || 0
                      );

                    return (
                      <div
                        key={id}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                      >

                        {/* DATE + STATUS */}

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                              <span className="text-[9px] font-bold uppercase">
                                {getMonth(s.date)}
                              </span>

                              <span className="text-lg font-bold leading-tight">
                                {getDay(s.date)}
                              </span>

                            </div>

                            <div>

                              <p className="text-sm font-bold text-slate-800">
                                {formatDate(
                                  s.date
                                )}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {formatTime(
                                  s.startTime
                                )}{" "}
                                –{" "}
                                {formatTime(
                                  s.endTime
                                )}
                              </p>

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

                        <div className="my-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-lg text-violet-600">
                            ✚
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

                        {/* ================================================= */}
                        {/* MOBILE PATIENT COUNT */}
                        {/* ================================================= */}

                        <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-3">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-500 shadow-sm">

                              <svg
                                className="h-5 w-5"
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

                            </div>

                            <div>

                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                                Bookings
                              </p>

                              <p className="mt-0.5 text-sm font-bold text-slate-700">
                                {bookedPatientCount}{" "}
                                {bookedPatientCount ===
                                1
                                  ? "patient"
                                  : "patients"}
                              </p>

                            </div>

                          </div>

                          <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-blue-600 shadow-sm">
                            Confirmed
                          </span>

                        </div>

                        {/* ACTIONS */}

                        {s.status ===
                          "PENDING" && (
                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                acceptSchedule(
                                  id
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              className="flex-1 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                            >
                              {isProcessing
                                ? "..."
                                : "✓ Accept"}
                            </button>

                            <button
                              onClick={() =>
                                rejectSchedule(
                                  id
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              className="flex-1 rounded-xl border border-rose-200 px-3 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                            >
                              ✕ Reject
                            </button>

                          </div>
                        )}

                        {s.status ===
                          "ACCEPTED" && (
                          <button
                            onClick={() =>
                              setCancelTargetId(
                                id
                              )
                            }
                            disabled={
                              isProcessing
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                          >
                            Cancel shift
                          </button>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </>
          )}

          {/* FOOTER */}

          {!loading &&
            schedules.length > 0 && (
              <div className="flex flex-col justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:px-7">

                <p>
                  Showing{" "}
                  <span className="font-semibold text-slate-600">
                    {filteredSchedules.length}
                  </span>{" "}
                  schedule
                  {filteredSchedules.length !==
                  1
                    ? "s"
                    : ""}
                </p>

                <p className="flex items-center gap-1.5">

                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  Schedule information is up to date

                </p>

              </div>
            )}

        </section>

        {/* INFORMATION PANEL */}

        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:px-7">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
              ℹ
            </div>

            <div>

              <h3 className="text-sm font-bold text-slate-800">
                Schedule information
              </h3>

              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
                Review your hospital shifts and respond to pending
                assignments. Patient bookings are shown for each shift.
                Only accepted shifts can be cancelled.
              </p>

            </div>

          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            Doctor Portal

          </div>

        </div>

      </main>

      {/* ================================================= */}
      {/* CANCEL MODAL */}
      {/* ================================================= */}

      {cancelTargetId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (
              e.target === e.currentTarget &&
              !processingId
            ) {
              setCancelTargetId(null);
            }
          }}
        >

          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-2xl text-rose-500">
              !
            </div>

            <h2 className="text-center text-xl font-bold text-slate-800">
              Cancel this schedule?
            </h2>

            <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-relaxed text-slate-500">
              Are you sure you want to cancel this accepted hospital
              shift? This action cannot be undone.
            </p>

            <div className="mt-7 flex gap-3">

              <button
                onClick={() =>
                  setCancelTargetId(null)
                }
                disabled={!!processingId}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Keep Schedule
              </button>

              <button
                onClick={confirmCancel}
                disabled={!!processingId}
                className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 disabled:opacity-50"
              >
                {processingId
                  ? "Cancelling..."
                  : "Yes, Cancel"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* TOAST */}
      {/* ================================================= */}

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
            {toast.type === "success"
              ? "✓"
              : "!"}
          </div>

          <div>

            <p className="text-sm font-bold text-slate-800">
              {toast.type === "success"
                ? "Success"
                : "Error"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {toast.msg}
            </p>

          </div>

          <button
            onClick={() => setToast(null)}
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