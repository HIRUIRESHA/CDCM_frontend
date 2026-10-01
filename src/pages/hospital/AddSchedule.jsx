import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  showSuccess,
  showError,
  showConfirm,
  showWarning,
} from "../../utils/alert";

const API_URL = "http://localhost:8082/api";

/* =========================
   ICONS
========================= */

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
      <path d="M9 21v-5h6v5" />
      <path d="M8 8h2M14 8h2M8 12h2M14 12h2" />
      <path d="M10 3v4M14 3v4M12 5v4M10 7h4" />
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
      <path d="M9 14.5h6" />
    </svg>
  );
}

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

function ArrowLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function SendIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function InfoIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

/* =========================
   MAIN COMPONENT
========================= */

export default function AddSchedulePage() {
  const navigate = useNavigate();

  /* =========================
     HOSPITAL
  ========================= */

  const hospital = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("hospital") || "null");
    } catch {
      return null;
    }
  }, []);

  const hospitalId = hospital?.id || hospital?._id;

  /* =========================
     FORM STATE
  ========================= */

  const [form, setForm] = useState({
    doctorId: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     DOCTORS
  ========================= */

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  /* =========================
     LOAD DOCTORS
  ========================= */

  useEffect(() => {
    const loadDoctors = async () => {
      if (!hospitalId) {
        setError("Hospital information not found. Please log in again.");
        setLoadingDoctors(false);
        return;
      }

      try {
        // Fetch doctors assigned to this hospital
        const res = await axios.get(
          `https://cdcm-backend.onrender.com/api/hospital/doctors/hospital/${hospitalId}`
        );

        setDoctors(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Doctor loading error:", err);

        setDoctors([]);

        setError(
          "Unable to load doctors assigned to this hospital."
        );
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, [hospitalId]);

  /* =========================
     HANDLE INPUT
  ========================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  /* =========================
     SELECTED DOCTOR
  ========================= */

  const selectedDoctor = useMemo(() => {
    return doctors.find(
      (doctor) =>
        String(doctor.id || doctor._id) === String(form.doctorId)
    );
  }, [doctors, form.doctorId]);

  /* =========================
     DATE
  ========================= */

  const today = new Date().toLocaleDateString("en-CA");

  /* =========================
     FORM VALIDATION
  ========================= */

  const validateForm = async () => {
    if (
      !form.doctorId ||
      !form.date ||
      !form.startTime ||
      !form.endTime
    ) {
      await showWarning(
        "Please fill in all fields before creating the schedule."
      );

      return false;
    }

    if (!hospitalId) {
      await showError(
        "Hospital information not found. Please log in again."
      );

      return false;
    }

    if (form.startTime >= form.endTime) {
      await showWarning(
        "End time must be later than start time."
      );

      return false;
    }

    return true;
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async () => {
    const isValid = await validateForm();

    if (!isValid) return;

    const doctorName = selectedDoctor
      ? `${selectedDoctor.title || ""} ${
          selectedDoctor.firstName || ""
        } ${selectedDoctor.lastName || ""}`.trim()
      : "the selected doctor";

    const confirmed = await showConfirm(
      `Do you want to create and send this schedule to ${doctorName}?`,
      "Create and Send Schedule?",
      "Yes, Send"
    );

    if (!confirmed) return;

    setSubmitting(true);
    setError("");

    try {
      await axios.post(`${API_URL}/schedules`, {
  try {
    await axios.post(
      "https://cdcm-backend.onrender.com/api/schedules",
      {
        doctorId: form.doctorId,
        hospitalId: hospitalId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
      });

      await showSuccess(
        "Schedule created and sent to the doctor successfully!"
      );

      navigate("/hospital/schedule");
    } catch (err) {
      console.error("Schedule creation error:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error;

      setError(
        backendMessage ||
          "Failed to create and send the schedule. Please try again."
      );

      await showError(
        backendMessage ||
          "Failed to create and send the schedule. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     HOSPITAL NOT FOUND
  ========================= */

  if (!hospitalId) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] font-sans text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <HospitalIcon className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Hospital information not found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              We could not find the logged-in hospital information.
              Please sign in again to create a schedule.
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
     PAGE
  ========================= */

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-sans text-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* ==================================
            HEADER
        ================================== */}

        <div className="mb-7">
          <button
            onClick={() => navigate("/hospital/schedule")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Schedule
          </button>

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              Hospital Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Add Physical Schedule
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Create a physical consultation schedule and send it
              directly to an assigned doctor.
            </p>
          </div>
        </div>

        {/* ==================================
            MAIN GRID
        ================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

          {/* ==================================
              FORM
          ================================== */}

          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">

            {/* FORM HEADER */}

            <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <CalendarIcon className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">
                    Schedule Details
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-400">
                    Enter the consultation information below
                  </p>
                </div>
              </div>
            </div>

            {/* FORM BODY */}

            <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">

              {/* ERROR */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <div className="mt-0.5 text-rose-500">
                    <InfoIcon className="h-4 w-4" />
                  </div>

                  <p className="text-sm leading-5 text-rose-700">
                    {error}
                  </p>
                </div>
              )}

              {/* ==================================
                  DOCTOR
              ================================== */}

              <div>
                <label
                  htmlFor="doctorId"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Select Doctor
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <DoctorIcon className="h-5 w-5" />
                  </div>

                  <select
                    id="doctorId"
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    disabled={loadingDoctors || submitting}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-10 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {loadingDoctors
                        ? "Loading doctors..."
                        : doctors.length === 0
                        ? "No doctors available"
                        : "Choose a doctor"}
                    </option>

                    {doctors.map((doctor) => {
                      const doctorId = doctor.id || doctor._id;

                      return (
                        <option
                          key={doctorId}
                          value={doctorId}
                        >
                          {doctor.title || "Dr."}{" "}
                          {doctor.firstName || ""}{" "}
                          {doctor.lastName || ""}
                          {" · "}
                          {doctor.specialization ||
                            "General"}
                        </option>
                      );
                    })}
                  </select>

                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>

                {!loadingDoctors && doctors.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No doctors are currently assigned to this
                    hospital.
                  </p>
                )}
              </div>

              {/* SELECTED DOCTOR PREVIEW */}

              {selectedDoctor && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                      <DoctorIcon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
                        Selected Doctor
                      </p>

                      <p className="mt-1 truncate text-sm font-bold text-gray-800">
                        {selectedDoctor.title || "Dr."}{" "}
                        {selectedDoctor.firstName || ""}{" "}
                        {selectedDoctor.lastName || ""}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        {selectedDoctor.specialization ||
                          "General"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================
                  DATE
              ================================== */}

              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Consultation Date
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <CalendarIcon className="h-5 w-5" />
                  </div>

                  <input
                    id="date"
                    type="date"
                    name="date"
                    value={form.date}
                    min={today}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 pl-11 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  You can only create schedules for today or a
                  future date.
                </p>
              </div>

              {/* ==================================
                  TIME
              ================================== */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    Consultation Time
                    <span className="ml-1 text-rose-500">*</span>
                  </label>

                  <span className="text-xs text-gray-400">
                    24-hour format
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* START */}

                  <div>
                    <label
                      htmlFor="startTime"
                      className="mb-2 block text-xs font-medium text-gray-500"
                    >
                      Start Time
                    </label>

                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <ClockIcon className="h-5 w-5" />
                      </div>

                      <input
                        id="startTime"
                        type="time"
                        name="startTime"
                        value={form.startTime}
                        onChange={handleChange}
                        disabled={submitting}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 pl-11 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* END */}

                  <div>
                    <label
                      htmlFor="endTime"
                      className="mb-2 block text-xs font-medium text-gray-500"
                    >
                      End Time
                    </label>

                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <ClockIcon className="h-5 w-5" />
                      </div>

                      <input
                        id="endTime"
                        type="time"
                        name="endTime"
                        value={form.endTime}
                        onChange={handleChange}
                        disabled={submitting}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 pl-11 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                {form.startTime &&
                  form.endTime &&
                  form.startTime < form.endTime && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      Valid consultation time:
                      {" "}
                      {form.startTime} - {form.endTime}
                    </div>
                  )}
              </div>

              {/* ==================================
                  ACTIONS
              ================================== */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/hospital/schedule")
                  }
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    loadingDoctors ||
                    doctors.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                        />

                        <path
                          className="opacity-90"
                          fill="currentColor"
                          d="M21 12a9 9 0 0 1-9 9v-3a6 6 0 0 0 6-6h3Z"
                        />
                      </svg>

                      Creating & Sending...
                    </>
                  ) : (
                    <>
                      <SendIcon className="h-4 w-4" />
                      Create & Send Schedule
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ==================================
              RIGHT INFORMATION PANEL
          ================================== */}

          <div className="space-y-5">

            {/* PREVIEW */}

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
                  Schedule Preview
                </p>

                <h2 className="mt-1 text-lg font-bold text-gray-900">
                  Physical Consultation
                </h2>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">

                {/* DOCTOR */}

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <DoctorIcon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Doctor
                    </p>

                    <p className="mt-0.5 truncate text-sm font-semibold text-gray-800">
                      {selectedDoctor
                        ? `${selectedDoctor.title || "Dr."} ${
                            selectedDoctor.firstName || ""
                          } ${
                            selectedDoctor.lastName || ""
                          }`
                        : "No doctor selected"}
                    </p>
                  </div>
                </div>

                <div className="my-4 border-t border-gray-200" />

                {/* DATE */}

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm">
                    <CalendarIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Date
                    </p>

                    <p className="mt-0.5 text-sm font-medium text-gray-700">
                      {form.date || "Not selected"}
                    </p>
                  </div>
                </div>

                <div className="my-4 border-t border-gray-200" />

                {/* TIME */}

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm">
                    <ClockIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Time
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-gray-700">
                      {form.startTime || "--:--"}
                      {" - "}
                      {form.endTime || "--:--"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <HospitalIcon className="h-4 w-4 text-blue-600" />

                    <span className="text-xs font-semibold text-blue-700">
                      Physical Hospital Visit
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* INFORMATION */}

            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                  <InfoIcon className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Before you create
                  </h3>

                  <ul className="mt-3 space-y-2 text-xs leading-5 text-gray-500">
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                      Select a doctor assigned to your hospital.
                    </li>

                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                      Choose today or a future consultation date.
                    </li>

                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                      Make sure the end time is later than the start time.
                    </li>

                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                      The schedule will be sent to the selected doctor.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* HOSPITAL */}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                  <HospitalIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Hospital
                  </p>

                  <p className="mt-0.5 truncate text-sm font-semibold text-gray-700">
                    {hospital?.name || "Current Hospital"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================
            FOOTER
        ================================== */}

        <div className="mt-8 border-t border-gray-200 pt-5 text-center">
          <p className="text-xs text-gray-400">
            Hospital Schedule Management • Physical Consultation
          </p>
        </div>
      </div>
    </div>
  );
}