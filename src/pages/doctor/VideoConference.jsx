import { useEffect, useState } from "react";
import axios from "axios";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const readValidCache = (id) => {
  if (!id) return null;
  try {
    const raw = sessionStorage.getItem(`doctorVideoScheduleCache_${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.timestamp === "number" &&
      Array.isArray(parsed.schedules)
    ) {
      if (Date.now() - parsed.timestamp <= CACHE_TTL_MS) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading doctor video schedule cache:", err);
  }
  return null;
};

export default function VideoConference() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const doctorId = user?.id || user?._id;

  const initialCache = readValidCache(doctorId);
  const [schedules, setSchedules] = useState(initialCache?.schedules || []);
  const [loading, setLoading] = useState(!initialCache);

  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [toast, setToast] = useState(null);

  const [activeFilter, setActiveFilter] = useState("ALL");

  const showToast = (type, msg) => {
    setToast({ type, msg });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // ==============================
  // LOAD DOCTOR VIDEO SCHEDULES
  // ==============================

  const loadSchedules = async ({ showLoading = true } = {}) => {

    if (!doctorId) {
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }

    try {
      const res = await axios.get(
        `https://cdcm-backend.onrender.com/api/schedules/doctor/${doctorId}`
      );

      const videoSchedules = (res.data || []).filter(
        (schedule) =>
          String(schedule.type || "").toUpperCase() === "VIDEO"
      );

      setSchedules(videoSchedules);

      try {
        sessionStorage.setItem(
          `doctorVideoScheduleCache_${doctorId}`,
          JSON.stringify({
            schedules: videoSchedules,
            timestamp: Date.now(),
          })
        );
      } catch (storageErr) {
        console.warn("Error saving doctor video schedule cache:", storageErr);
      }
    } catch (err) {
      console.error("Error loading video schedules:", err);

      if (showLoading) {
        showToast("error", "Failed to load video schedules.");
      } dev
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    const cachedData = readValidCache(doctorId);
    if (cachedData) {
      setSchedules(cachedData.schedules);
      setLoading(false);
      loadSchedules({ showLoading: false });
    } else {
      loadSchedules({ showLoading: true });
    }
  }, [doctorId]);

  // ==============================
  // ACCEPT SCHEDULE
  // ==============================

  const acceptSchedule = async (id) => {
    if (!id) return;

    try {
      await axios.put(
        `https://cdcm-backend.onrender.com/api/schedules/accept/${id}`
      );

      showToast(
        "success",
        "Video consultation schedule accepted successfully."
      );

      await loadSchedules({ showLoading: false });
    } catch (err) {
      console.error("Error accepting schedule:", err);

      const message =
        err.response?.data?.message ||
        "Failed to accept schedule.";

      showToast("error", message);
    }
  };

  // ==============================
  // REJECT SCHEDULE
  // ==============================

  const rejectSchedule = async (id) => {
    if (!id) return;

    try {
      await axios.put(
        `https://cdcm-backend.onrender.com/api/schedules/reject/${id}`
      );

      showToast(
        "success",
        "Video consultation schedule rejected."
      );

      await loadSchedules({ showLoading: false });
    } catch (err) {
      console.error("Error rejecting schedule:", err);

      const message =
        err.response?.data?.message ||
        "Failed to reject schedule.";

      showToast("error", message);
    }
  };

  // ==============================
  // OPEN CANCEL CONFIRMATION
  // ==============================

  const cancelSchedule = (id) => {
    if (!id) return;

    setCancelTargetId(id);
  };

  // ==============================
  // CONFIRM CANCEL
  // ==============================

  const confirmCancel = async () => {
    if (!cancelTargetId) return;

    try {
      await axios.put(
        `https://cdcm-backend.onrender.com/api/schedules/cancel/${cancelTargetId}`
      );

      showToast(
        "success",
        "Video consultation schedule cancelled successfully."
      );

      await loadSchedules({ showLoading: false });
    } catch (err) {
      console.error("Error cancelling schedule:", err);

      const message =
        err.response?.data?.message ||
        "Failed to cancel schedule.";

      showToast("error", message);
    } finally {
      setCancelTargetId(null);
    }
  };

  // ==============================
  // STATISTICS
  // ==============================

  const totalCount = schedules.length;

  const pendingCount = schedules.filter(
    (schedule) => schedule.status === "PENDING"
  ).length;

  const acceptedCount = schedules.filter(
    (schedule) => schedule.status === "ACCEPTED"
  ).length;

  const rejectedCount = schedules.filter(
    (schedule) => schedule.status === "REJECTED"
  ).length;

  const cancelledCount = schedules.filter(
    (schedule) => schedule.status === "CANCELLED"
  ).length;

  // ==============================
  // FILTERED SCHEDULES
  // ==============================

  const filteredSchedules = schedules.filter((schedule) => {
    if (activeFilter === "ALL") {
      return true;
    }

    return schedule.status === activeFilter;
  });

  // ==============================
  // FILTER BUTTONS
  // ==============================

  const filters = [
    {
      key: "ALL",
      label: "All",
      count: totalCount,
    },
    {
      key: "PENDING",
      label: "Pending",
      count: pendingCount,
    },
    {
      key: "ACCEPTED",
      label: "Accepted",
      count: acceptedCount,
    },
    {
      key: "REJECTED",
      label: "Rejected",
      count: rejectedCount,
    },
    {
      key: "CANCELLED",
      label: "Cancelled",
      count: cancelledCount,
    },
  ];

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="min-h-screen bg-[#F5F5F2] px-4 py-6 md:px-8 lg:px-10">

      {/* ==============================
          PAGE HEADER
      ============================== */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0EBFF]">
              <svg
                className="h-5 w-5 text-[#7657D9]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h6a4 4 0 004-4V8a4 4 0 00-4-4H5a4 4 0 00-4 4v6a4 4 0 004 4z"
                />
              </svg>
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#7657D9]">
              Video Consultation
            </span>

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            My Video Schedule
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your online consultation sessions and appointments.
          </p>
        </div>

        {/* ONLINE STATUS */}

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">

          <span className="h-2.5 w-2.5 rounded-full bg-[#22A579]" />

          <span className="text-sm font-medium text-gray-600">
            Online consultations
          </span>

        </div>
      </div>

      {/* ==============================
          STATISTICS
      ============================== */}

      {!loading && (
        <div className="mb-7 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">

          {/* TOTAL */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Total
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {totalCount}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Video schedules
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EBFF]">
                <svg
                  className="h-5 w-5 text-[#7657D9]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

            </div>
          </div>

          {/* ACCEPTED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Accepted
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {acceptedCount}
                </h2>

                <p className="mt-1 text-xs text-[#22A579]">
                  Confirmed sessions
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F7F2]">
                <svg
                  className="h-5 w-5 text-[#22A579]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

            </div>
          </div>

          {/* PENDING */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Pending
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {pendingCount}
                </h2>

                <p className="mt-1 text-xs text-amber-500">
                  Awaiting response
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <svg
                  className="h-5 w-5 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="8" />

                  <path
                    strokeLinecap="round"
                    d="M12 8v4l2.5 1.5"
                  />
                </svg>
              </div>

            </div>
          </div>

          {/* REJECTED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Rejected
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {rejectedCount}
                </h2>

                <p className="mt-1 text-xs text-red-500">
                  Declined requests
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    d="M8 8l8 8M16 8l-8 8"
                  />

                  <circle cx="12" cy="12" r="8" />
                </svg>
              </div>

            </div>
          </div>

          {/* CANCELLED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Cancelled
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {cancelledCount}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Cancelled sessions
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ==============================
          MAIN CARD
      ============================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* CARD HEADER */}

        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">

          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Video Schedule Overview
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Review and manage your online consultation requests.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-amber-400" />

            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600">
              {pendingCount} Pending
            </span>

          </div>

        </div>

        {/* ==============================
            FILTER TABS
        ============================== */}

        {!loading && (
          <div className="border-b border-gray-100 px-5 py-4 md:px-6">

            <div className="flex flex-wrap items-center gap-2">

              {filters.map((filter) => {
                const isActive =
                  activeFilter === filter.key;

                return (
                  <button
                    key={filter.key}
                    onClick={() =>
                      setActiveFilter(filter.key)
                    }
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-[#7657D9] text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-[#7657D9] hover:bg-[#F0EBFF] hover:text-[#7657D9]"
                      }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                );
              })}

            </div>
          </div>
        )}

        {/* ==============================
            LOADING
        ============================== */}

        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center">

            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#7657D9]" />

            <p className="mt-4 text-sm text-gray-500">
              Loading video schedules...
            </p>

          </div>
        ) : filteredSchedules.length === 0 ? (

          /* ==============================
             EMPTY STATE
          ============================== */

          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0EBFF]">

              <svg
                className="h-8 w-8 text-[#7657D9]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h6a4 4 0 004-4V8a4 4 0 00-4-4H5a4 4 0 00-4 4v6a4 4 0 004 4z"
                />
              </svg>

            </div>

            <h3 className="mt-5 text-base font-semibold text-gray-900">
              {activeFilter === "ALL"
                ? "No video schedules yet"
                : `No ${activeFilter.toLowerCase()} schedules`}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-gray-400">
              {activeFilter === "ALL"
                ? "Video consultation requests will appear here when hospitals create online consultation schedules."
                : `There are currently no ${activeFilter.toLowerCase()} video consultation requests.`}
            </p>

          </div>

        ) : (

          /* ==============================
             TABLE
          ============================== */

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px] text-sm">

              <thead>
                <tr className="border-b border-gray-100 bg-[#FAFAFA]">

                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Time
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Patients
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Conference
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredSchedules.map((s) => {
                  const id = s.id || s._id;

                  const bookedPatientCount =
                    Number(s.bookedPatientCount) || 0;

                  return (
                    <tr
                      key={id}
                      className="group transition-colors hover:bg-[#FAFAFF]"
                    >

                      {/* ==============================
                          DATE
                      ============================== */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0EBFF]">

                            <svg
                              className="h-4 w-4 text-[#7657D9]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>

                          </div>

                          <span className="font-medium text-gray-800">
                            {s.date || "—"}
                          </span>

                        </div>

                      </td>

                      {/* ==============================
                          TIME
                      ============================== */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-gray-600">

                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="8"
                            />

                            <path
                              strokeLinecap="round"
                              d="M12 8v4l2.5 1.5"
                            />
                          </svg>

                          <span>
                            {s.startTime || "—"}{" "}
                            -{" "}
                            {s.endTime || "—"}
                          </span>

                        </div>

                      </td>

                      {/* ==============================
                          PATIENT COUNT
                      ============================== */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">

                            <svg
                              className="h-4 w-4 text-blue-500"
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

                            <p className="font-semibold text-gray-800">
                              {bookedPatientCount}
                            </p>

                            <p className="text-xs text-gray-400">
                              {bookedPatientCount === 1
                                ? "patient booked"
                                : "patients booked"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* ==============================
                          STATUS
                      ============================== */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${s.status === "PENDING"
                            ? "bg-amber-50 text-amber-600"
                            : s.status === "ACCEPTED"
                              ? "bg-[#E9F7F2] text-[#22A579]"
                              : s.status === "REJECTED"
                                ? "bg-red-50 text-red-600"
                                : s.status === "CANCELLED"
                                  ? "bg-gray-100 text-gray-500"
                                  : "bg-gray-100 text-gray-500"
                            }`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${s.status === "PENDING"
                              ? "bg-amber-500"
                              : s.status === "ACCEPTED"
                                ? "bg-[#22A579]"
                                : s.status === "REJECTED"
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                              }`}
                          />

                          {s.status || "UNKNOWN"}

                        </span>

                      </td>

                      {/* ==============================
                          CONFERENCE
                      ============================== */}

                      <td className="px-6 py-5">

                        {s.status === "ACCEPTED" &&
                          s.meetingLink ? (
                          <a
                            href={s.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#7657D9] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#6647C7] active:scale-95"
                          >

                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h6a4 4 0 004-4V8a4 4 0 00-4-4H5a4 4 0 00-4 4v6a4 4 0 004 4z"
                              />
                            </svg>

                            Join Conference

                          </a>
                        ) : s.status === "ACCEPTED" ? (

                          <span className="inline-flex items-center gap-2 text-xs font-medium text-amber-500">

                            <span className="h-2 w-2 rounded-full bg-amber-400" />

                            Link unavailable

                          </span>

                        ) : (

                          <span className="text-xs text-gray-400">
                            Not available
                          </span>

                        )}

                      </td>

                      {/* ==============================
                          ACTION
                      ============================== */}

                      <td className="px-6 py-5">

                        {s.status === "PENDING" && (
                          <div className="flex items-center gap-2">

                            <button
                              onClick={() =>
                                acceptSchedule(id)
                              }
                              className="rounded-lg bg-[#7657D9] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#6647C7] active:scale-95"
                            >
                              Accept
                            </button>

                            <button
                              onClick={() =>
                                rejectSchedule(id)
                              }
                              className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
                            >
                              Reject
                            </button>

                          </div>
                        )}

                        {s.status === "ACCEPTED" && (
                          <button
                            onClick={() =>
                              cancelSchedule(id)
                            }
                            className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
                          >
                            Cancel
                          </button>
                        )}

                        {(s.status === "CANCELLED" ||
                          s.status === "REJECTED") && (
                            <span className="text-xs text-gray-400">
                              No action
                            </span>
                          )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>

          </div>
        )}
      </div>

      {/* ==============================
          CANCEL CONFIRMATION MODAL
      ============================== */}

      {cancelTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">

              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 4h.01M5.07 19h13.86a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z"
                />
              </svg>

            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Cancel schedule?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to cancel this video consultation
              schedule? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">

              <button
                onClick={() => setCancelTargetId(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Keep Schedule
              </button>

              <button
                onClick={confirmCancel}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Cancel Schedule
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ==============================
          TOAST
      ============================== */}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 w-[320px] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">

          <div className="flex items-start gap-3">

            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toast.type === "success"
                ? "bg-[#E9F7F2]"
                : "bg-red-50"
                }`}
            >

              {toast.type === "success" ? (
                <svg
                  className="h-5 w-5 text-[#22A579]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    d="M8 8l8 8M16 8l-8 8"
                  />
                </svg>
              )}

            </div>

            <div className="min-w-0">

              <p
                className={`text-sm font-semibold ${toast.type === "success"
                  ? "text-[#22A579]"
                  : "text-red-600"
                  }`}
              >
                {toast.type === "success"
                  ? "Success"
                  : "Error"}
              </p>

              <p className="mt-0.5 text-xs leading-5 text-gray-500">
                {toast.msg}
              </p>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}