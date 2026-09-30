import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  CalendarDays,
  DollarSign,
  Clock,
  Activity,
  CheckCircle2,
  Stethoscope,
  RefreshCw,
  Video,
  Building2,
  AlertCircle,
  TrendingUp,
  FileText
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import HospitalDash from "../../assets/HospitalDash.jpg";

// ==========================================
// HELPER FUNCTIONS (Date, Currency, Badges)
// ==========================================

const getTodayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const isSameDay = (dateStr, targetDate = new Date()) => {
  if (!dateStr) return false;
  const cleanStr = String(dateStr).trim();
  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dd = String(targetDate.getDate()).padStart(2, "0");
  const targetISO = `${yyyy}-${mm}-${dd}`;
  const targetLocal = `${dd}/${mm}/${yyyy}`;
  return cleanStr === targetISO || cleanStr === targetLocal || cleanStr.startsWith(targetISO);
};

const formatLKR = (amount) => {
  const num = Number(amount);
  if (!num || isNaN(num) || num <= 0) return "Rs. 0";
  return `Rs. ${num.toLocaleString("en-LK")}`;
};

const formatTimeString = (timeStr) => {
  if (!timeStr) return "—";
  if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
    return timeStr;
  }
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (!isNaN(hours)) {
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    }
  }
  return timeStr;
};

const formatHeaderDate = (date = new Date()) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusBadge = (status) => {
  const normalized = (status || "").toUpperCase();
  switch (normalized) {
    case "CONFIRMED":
      return {
        label: "Confirmed",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        dotClass: "bg-emerald-500",
      };
    case "PENDING":
      return {
        label: "Pending",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
        dotClass: "bg-amber-500",
      };
    case "COMPLETED":
      return {
        label: "Completed",
        badgeClass: "bg-sky-50 text-sky-700 border border-sky-200",
        dotClass: "bg-sky-500",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        badgeClass: "bg-rose-50 text-rose-700 border border-rose-200",
        dotClass: "bg-rose-500",
      };
    case "CANCELLATION_REQUESTED":
      return {
        label: "Cancellation Requested",
        badgeClass: "bg-orange-50 text-orange-700 border border-orange-200",
        dotClass: "bg-orange-500",
      };
    default:
      return {
        label: status || "Unknown",
        badgeClass: "bg-slate-100 text-slate-600 border border-slate-200",
        dotClass: "bg-slate-400",
      };
  }
};

const getLast7DaysData = (allAppointments) => {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const count = (allAppointments || []).filter((appt) => isSameDay(appt.date, d)).length;
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const isTodayFlag = i === 0;

    days.push({
      weekday,
      dateLabel,
      count,
      isToday: isTodayFlag,
    });
  }
  return days;
};

// ==========================================
// MAIN COMPONENT: HospitalDashboard
// ==========================================

const HospitalDashboard = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!user?.id) return;

    if (!isSilent) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError("");

    try {
      const today = getTodayISO();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [apptsRes, schedulesRes, doctorsRes] = await Promise.all([
        api.get(`/api/appointments/hospital/${user.id}`, { headers }),
        api.get(`/api/schedules/hospital/${user.id}?date=${today}`, { headers }),
        api.get(`/api/hospital/doctors/hospital/${user.id}`, { headers }),
        // Analytics endpoint is called to verify health & warm cache
        api.get(`/api/hospitals/${user.id}/analytics`, { headers }).catch((e) => {
          console.warn("Analytics endpoint warning:", e?.message);
          return { data: null };
        }),
      ]);

      setAppointments(Array.isArray(apptsRes.data) ? apptsRes.data : []);
      setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error("Hospital dashboard fetch error:", err);
      setError("Unable to load full operational dashboard data. Please check your connection or retry.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, token]);

  useEffect(() => {
    fetchDashboardData(false);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // ==========================================
  // METRICS & COMPUTED DATA
  // ==========================================

  // 1. Appointments Today
  const todayAppointments = appointments.filter((appt) => isSameDay(appt.date, new Date()));
  const appointmentsTodayCount = todayAppointments.length;

  // 2. Doctors On Duty (Distinct doctorId where schedule status === "ACCEPTED" and date matches today)
  const todayAcceptedSchedules = schedules.filter(
    (s) => s.status === "ACCEPTED" && isSameDay(s.date, new Date())
  );

  const distinctDutyDoctorsMap = new Map();
  todayAcceptedSchedules.forEach((sch) => {
    if (sch.doctorId && !distinctDutyDoctorsMap.has(sch.doctorId)) {
      const docProfile = doctors.find((d) => d.id === sch.doctorId);
      const doctorFullName = docProfile
        ? `${docProfile.title || "Dr."} ${docProfile.firstName || ""} ${docProfile.lastName || ""}`.trim()
        : (sch.doctorName || "Doctor");
      const specialization = docProfile?.specialization || sch.specialty || "Specialist";
      const profileImage = docProfile?.profileImage || null;

      // Count today's appointments for this doctor
      const docApptsCount = todayAppointments.filter((a) => a.doctorId === sch.doctorId).length;

      distinctDutyDoctorsMap.set(sch.doctorId, {
        doctorId: sch.doctorId,
        scheduleId: sch.id,
        doctorName: doctorFullName,
        specialization,
        profileImage,
        startTime: sch.startTime,
        endTime: sch.endTime,
        type: sch.type || "PHYSICAL",
        appointmentsCount: docApptsCount,
      });
    }
  });

  const doctorsOnDutyList = Array.from(distinctDutyDoctorsMap.values());
  const doctorsOnDutyCount = doctorsOnDutyList.length;

  // 3. Waiting Patients (Today's appointments with status CONFIRMED or PENDING)
  const waitingPatientsCount = todayAppointments.filter(
    (a) => a.status === "CONFIRMED" || a.status === "PENDING"
  ).length;

  // 4. Revenue Today (Paid today appointments only: isPaid === true OR paymentStatus === "PAID")
  const revenueToday = todayAppointments
    .filter((a) => a.isPaid === true || String(a.paymentStatus).toUpperCase() === "PAID")
    .reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

  // 5. Last 7 Days (Today - 6 through Today)
  const last7Days = getLast7DaysData(appointments);
  const maxDayCount = Math.max(...last7Days.map((d) => d.count), 1);

  // 6. Specialization Load (Real doctor specialization and today's appointments)
  const specializationLoadMap = {};
  // Seed with active doctors' specialties so departments on duty are visible
  doctorsOnDutyList.forEach((d) => {
    if (d.specialization) {
      specializationLoadMap[d.specialization] = 0;
    }
  });
  // Accumulate count from today's appointments
  todayAppointments.forEach((appt) => {
    const doc = doctors.find((d) => d.id === appt.doctorId);
    const spec = doc?.specialization || "General Medicine";
    specializationLoadMap[spec] = (specializationLoadMap[spec] || 0) + 1;
  });

  const specializationLoadList = Object.entries(specializationLoadMap).map(([specialty, count]) => ({
    specialty,
    count,
  }));
  specializationLoadList.sort((a, b) => b.count - a.count);
  const maxSpecCount = Math.max(...specializationLoadList.map((s) => s.count), 1);

  // 7. Live Channeling Queue (Today's appointments sorted by appointmentNumber, then time)
  const sortedTodayQueue = [...todayAppointments].sort((a, b) => {
    const extractNum = (str) => {
      if (!str) return Infinity;
      const match = String(str).match(/\d+/);
      return match ? parseInt(match[0], 10) : Infinity;
    };
    const numA = extractNum(a.appointmentNumber);
    const numB = extractNum(b.appointmentNumber);
    if (numA !== numB) return numA - numB;
    return (a.time || "").localeCompare(b.time || "");
  });

  const resolveDoctorNameForQueue = (appt) => {
    if (appt.doctorName) return appt.doctorName;
    if (appt.doctorId) {
      const doc = doctors.find((d) => d.id === appt.doctorId);
      if (doc) {
        return `${doc.title || "Dr."} ${doc.firstName || ""} ${doc.lastName || ""}`.trim();
      }
    }
    return "Assigned Doctor";
  };

  // ==========================================
  // RENDER: LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-sm w-full">
          <Activity className="animate-spin mx-auto text-indigo-600 mb-3" size={36} />
          <h3 className="text-base font-bold text-slate-900">Loading Operational Dashboard</h3>
          <p className="text-xs text-slate-500 mt-1">Connecting to clinical records and doctor schedules...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN DASHBOARD
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 md:px-8 py-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. DASHBOARD HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/70">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital Overview
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              {formatHeaderDate()} · Live operational overview
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {lastRefreshedAt && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Updated {lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}

            <button
              onClick={() => fetchDashboardData(false)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-sm active:scale-95 disabled:opacity-60"
              title="Refresh now"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-indigo-600" : ""} />
              <span>Refresh</span>
            </button>

            {/* Hospital Name Badge */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white px-4 py-2 rounded-2xl shadow-sm">
              <p className="text-xs uppercase tracking-wider text-indigo-200 font-semibold leading-none">Logged In</p>
              <p className="text-sm font-bold truncate max-w-[200px] mt-0.5">
                {user?.name || "Hospital Partner"}
              </p>
            </div>
          </div>
        </div>

        {/* ERROR NOTICE IF OCCURRED */}
        {error && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchDashboardData(false)}
              className="font-bold underline hover:text-amber-950 ml-3"
            >
              Retry
            </button>
          </div>
        )}

        {/* 2. HERO SECTION */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl text-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Left Content */}
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-indigo-200 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Channeling Operations
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Welcome back, {user?.name || "Hospital Administration"}
              </h2>

              <p className="text-sm text-indigo-200 leading-relaxed max-w-xl">
                Monitor real-time patient queues, active doctor duty rotations, and clinical channeling performance across all hospital departments today.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-indigo-100">
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                  <Activity size={14} className="text-emerald-400" />
                  Auto-refresh active (30s)
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                  <CheckCircle2 size={14} className="text-sky-400" />
                  {appointmentsTodayCount} appointments scheduled today
                </span>
              </div>
            </div>

            {/* Right Medical Image (Preserved src/assets/HospitalDash.jpg) */}
            <div className="flex-shrink-0 self-center lg:self-auto">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-800">
                <img
                  src={HospitalDash}
                  alt="Hospital Operations"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. FOUR SUMMARY METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Card 1: Appointments Today */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Appointments Today
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CalendarDays size={20} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900">
                {appointmentsTodayCount}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Total bookings for {formatHeaderDate().split(",")[0]}
              </p>
            </div>
          </div>

          {/* Card 2: Doctors On Duty */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Doctors On Duty
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Stethoscope size={20} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900">
                {doctorsOnDutyCount}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Distinct physicians with active accepted shifts
              </p>
            </div>
          </div>

          {/* Card 3: Waiting Patients */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Waiting Patients
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900">
                {waitingPatientsCount}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Confirmed & pending patients in channeling queue
              </p>
            </div>
          </div>

          {/* Card 4: Revenue Today */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Revenue Today
              </span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900 truncate">
                {formatLKR(revenueToday)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Collected from verified paid appointments
              </p>
            </div>
          </div>

        </div>

        {/* 4. MID SECTION: LAST 7 DAYS & SPECIALIZATION LOAD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left (2 Cols): Appointments, Last 7 Days */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-600" />
                    Appointments, Last 7 Days
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daily appointment volume across the past 7 calendar days
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                  {last7Days.reduce((acc, d) => acc + d.count, 0)} total visits
                </span>
              </div>

              {/* Vertical Bars Chart (Tailwind / CSS div-based, zero external libraries) */}
              <div className="flex items-end justify-between gap-3 h-44 pt-6 pb-2 border-b border-slate-100">
                {last7Days.map((day, idx) => {
                  const heightPercent =
                    day.count > 0 ? Math.max(Math.round((day.count / maxDayCount) * 100), 12) : 6;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Bar Value Label */}
                      <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition">
                        {day.count}
                      </span>

                      {/* Bar Container */}
                      <div className="w-full bg-slate-100 rounded-xl h-28 flex items-end p-1">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-lg transition-all duration-500 ${
                            day.isToday
                              ? "bg-gradient-to-t from-indigo-600 to-blue-500 shadow-sm"
                              : day.count > 0
                              ? "bg-gradient-to-t from-slate-400 to-slate-300 group-hover:from-indigo-400 group-hover:to-blue-400"
                              : "bg-slate-200"
                          }`}
                        />
                      </div>

                      {/* Day Label */}
                      <div className="text-center">
                        <p
                          className={`text-xs font-bold ${
                            day.isToday ? "text-indigo-600 font-extrabold" : "text-slate-600"
                          }`}
                        >
                          {day.weekday}
                        </p>
                        <p className="text-[10px] text-slate-400">{day.dateLabel}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Today's Volume
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 ml-2" /> Past Days
              </span>
              <span>Based on confirmed hospital bookings</span>
            </div>
          </div>

          {/* Right (1 Col): Specialization Load */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope size={18} className="text-teal-600" />
                    Specialization Load
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Distribution of today's workload by department
                  </p>
                </div>
              </div>

              {specializationLoadList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <FileText size={28} className="mx-auto mb-2 opacity-40" />
                  <p>No specialization workload recorded today.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                  {specializationLoadList.map((item, idx) => {
                    const barWidth = Math.max(Math.round((item.count / maxSpecCount) * 100), 6);

                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-800 truncate pr-2">{item.specialty}</span>
                          <span className="text-slate-600 font-bold whitespace-nowrap">
                            {item.count} {item.count === 1 ? "appointment" : "appointments"} today
                          </span>
                        </div>

                        {/* Proportional visual bar (no capacity percentage) */}
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${barWidth}%` }}
                            className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center">
              <span>{specializationLoadList.length} Active Medical Fields</span>
              <span>Workload Distribution</span>
            </div>
          </div>

        </div>

        {/* 5. DOCTORS ON DUTY SECTION */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users size={19} className="text-indigo-600" />
                Doctors On Duty
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Physicians currently on duty under today's accepted schedule rotations
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full self-start sm:self-auto">
              {doctorsOnDutyCount} {doctorsOnDutyCount === 1 ? "Doctor" : "Doctors"} Active Today
            </span>
          </div>

          {doctorsOnDutyList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Stethoscope size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="font-semibold text-slate-600">No doctors on duty for today</p>
              <p className="text-slate-400 mt-0.5">No accepted schedules were found for today's date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctorsOnDutyList.map((docDuty) => (
                <div
                  key={docDuty.doctorId}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:shadow-sm transition"
                >
                  <div className="flex items-start gap-3">
                    {/* Doctor Profile Image / Fallback Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-sm overflow-hidden flex-shrink-0 border border-indigo-200">
                      {docDuty.profileImage ? (
                        <img
                          src={docDuty.profileImage}
                          alt={docDuty.doctorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        docDuty.doctorName.replace("Dr.", "").trim().charAt(0) || "D"
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {docDuty.doctorName}
                      </p>
                      <p className="text-xs text-indigo-600 font-medium truncate mt-0.5">
                        {docDuty.specialization}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          <Clock size={11} className="text-slate-400" />
                          {formatTimeString(docDuty.startTime)} – {formatTimeString(docDuty.endTime)}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                            docDuty.type === "VIDEO"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {docDuty.type === "VIDEO" ? <Video size={10} /> : <Building2 size={10} />}
                          {docDuty.type}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Assigned Today:</span>
                        <span className="font-bold text-slate-900 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                          {docDuty.appointmentsCount} {docDuty.appointmentsCount === 1 ? "patient" : "patients"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. LIVE CHANNELING QUEUE SECTION */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock size={19} className="text-teal-600" />
                Live Channeling Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sequential patient queue for today's physical and video channeling consultations
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full self-start sm:self-auto">
              {sortedTodayQueue.length} {sortedTodayQueue.length === 1 ? "Patient" : "Patients"} in Queue Today
            </span>
          </div>

          {sortedTodayQueue.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CalendarDays size={34} className="mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="font-semibold text-slate-600">No channeling appointments found for today</p>
              <p className="text-slate-400 mt-0.5">New bookings for today will automatically appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Token</th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Doctor</th>
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {sortedTodayQueue.map((appt, idx) => {
                    const badge = getStatusBadge(appt.status);
                    const tokenDisplay =
                      appt.appointmentNumber?.replace("APT-", "#") ||
                      (appt.appointmentNumber ? `#${appt.appointmentNumber}` : `#${idx + 1}`);
                    const doctorDisplay = resolveDoctorNameForQueue(appt);

                    return (
                      <tr key={appt.id || idx} className="hover:bg-slate-50/70 transition">
                        {/* Token */}
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center justify-center font-extrabold text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {tokenDisplay}
                          </span>
                        </td>

                        {/* Patient */}
                        <td className="py-3.5 px-3">
                          <p className="font-bold text-slate-900">
                            {appt.patientName || `Patient #${appt.patientId?.slice(-4) || "—"}`}
                          </p>
                          {appt.consultationType && (
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                              {appt.consultationType}
                            </span>
                          )}
                        </td>

                        {/* Doctor */}
                        <td className="py-3.5 px-3">
                          <p className="font-medium text-slate-800">{doctorDisplay}</p>
                        </td>

                        {/* Time */}
                        <td className="py-3.5 px-3">
                          <span className="font-mono font-semibold text-slate-700">
                            {formatTimeString(appt.time)}
                          </span>
                        </td>

                        {/* Status (Actual persistent status badge) */}
                        <td className="py-3.5 px-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HospitalDashboard;