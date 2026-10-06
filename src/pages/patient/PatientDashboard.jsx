import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  Calendar,
  Search,
  Activity,
  Bell,
  ChevronRight,
  Heart,
  FlaskConical,
  Video,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Loader2,
  Users,
  MessageSquare,
  ClipboardList,
  MapPin,
  Pill,
  ArrowRight
} from "lucide-react";

/* ─── helpers ───────────────────────────────── */
const todayISO = new Date().toISOString().split("T")[0];

function Counter({ to, suffix = "" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!to) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 800, 1);
      setV(Math.floor(p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to]);
  return <>{v}{suffix}</>;
}

function Pulse({ color = "bg-emerald-400" }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
}

/* ═══════════════════════════════════════════════ */
export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const patientId = user?.id;

  /* ── data state ── */
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [medHistory, setMedHistory] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── fetch all ── */
  useEffect(() => {
    if (!patientId) { setLoading(false); return; }
    const token = localStorage.getItem("token");
    const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    (async () => {
      try {
        const [apptR, docR, hospR, medR, labR, notifR] = await Promise.allSettled([
          fetch(`https://cdcm-backend.onrender.com/api/appointments/patient/${patientId}`, { headers: auth }),
          fetch("https://cdcm-backend.onrender.com/api/hospital/doctors/assigned-all"),
          fetch("https://cdcm-backend.onrender.com/api/hospital/doctors/all-hospitals"),
          axios.get(`https://cdcm-backend.onrender.com/api/medical-records/patient/${patientId}`),
          axios.get(`https://cdcm-backend.onrender.com/api/lab/patient/${patientId}`),
          axios.get(`https://cdcm-backend.onrender.com/api/notifications/patient/${patientId}`),
        ]);

        if (apptR.status === "fulfilled" && apptR.value.ok) setAppointments(await apptR.value.json());
        if (docR.status === "fulfilled" && docR.value.ok) setDoctors(await docR.value.json());
        if (hospR.status === "fulfilled" && hospR.value.ok) setHospitals(await hospR.value.json());
        if (medR.status === "fulfilled") setMedHistory(medR.value?.data || []);
        if (labR.status === "fulfilled") setLabTests(labR.value?.data || []);
        if (notifR.status === "fulfilled") setNotifications(notifR.value?.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [patientId]);

  /* ── derived ── */
  const getDoctorName = (id) => {
    const d = doctors.find(x => x.id === id);
    return d ? `${d.title || ""} ${d.firstName || ""} ${d.lastName || ""}`.trim() : "Doctor";
  };
  const getHospitalName = (id) => {
    const h = hospitals.find(x => x.id === id);
    return h ? h.name : "Hospital";
  };

  const todayAppts = appointments.filter(a => a.date === todayISO || a.date?.startsWith(todayISO));
  const upcomingAppts = appointments.filter(a => new Date(a.date) >= new Date(todayISO));
  const nextAppt = [...upcomingAppts].sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const unpaidLabs = labTests.filter(t => !t.isPaid && !t.paid);
  const unreadNotifs = notifications.filter(n => !n.read);
  const uniqueDoctorIds = [...new Set(appointments.map(a => a.doctorId))];
  const videoAppts = appointments.filter(a => a.consultationType === "VIDEO");
  const recentHistory = [...medHistory].sort((a, b) => new Date(b.dateOfVisit) - new Date(a.dateOfVisit)).slice(0, 3);

  /* ── greeting ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  /* ── KPI summary data ── */
  const kpiCards = [
    {
      label: "Total Appointments",
      count: appointments.length,
      icon: <Calendar className="w-5 h-5" />,
      iconBox: "bg-blue-50 text-blue-600 border border-blue-200/80",
      accent: "All-time bookings",
    },
    {
      label: "My Doctors",
      count: uniqueDoctorIds.length,
      icon: <Users className="w-5 h-5" />,
      iconBox: "bg-indigo-50 text-indigo-600 border border-indigo-200/80",
      accent: "Consulted specialists",
    },
    {
      label: "Medical Records",
      count: medHistory.length,
      icon: <ClipboardList className="w-5 h-5" />,
      iconBox: "bg-cyan-50 text-cyan-600 border border-cyan-200/80",
      accent: "Clinical visit logs",
    },
    {
      label: "Lab Tests",
      count: labTests.length,
      icon: <FlaskConical className="w-5 h-5" />,
      iconBox: "bg-teal-50 text-teal-600 border border-teal-200/80",
      accent: unpaidLabs.length > 0 ? `${unpaidLabs.length} pending payment` : "Diagnostic reports",
      accentColor: unpaidLabs.length > 0 ? "text-amber-600" : "text-slate-400",
    },
  ];

  /* ═══════════════ RENDER ═══════════════════ */
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-12">
      {/* ══ HERO BANNER ══════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F1E3D] via-[#172554] to-[#2563EB] text-white px-5 sm:px-8 lg:px-10 pt-7 pb-16 sm:pb-20 shadow-md">
        {/* Subtle decorative circles */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/[0.04] blur-2xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-32 h-80 w-80 rounded-full bg-cyan-400/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-10 h-44 w-44 rounded-full bg-indigo-500/[0.05] blur-xl" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-blue-200 backdrop-blur-md border border-white/15 shadow-sm mb-3">
              <Pulse color="bg-emerald-400" />
              <span className="tracking-wider uppercase text-[11px] font-bold">Patient Portal</span>
              <span className="text-white/30">·</span>
              <span className="text-emerald-300 font-medium text-[11px]">Connected</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {greeting}, {user?.name?.split(" ")[0] || "Patient"} 👋
            </h1>

            <p className="mt-1.5 text-xs sm:text-sm text-blue-100/80 max-w-xl leading-relaxed">
              Welcome back to your healthcare portal. View your upcoming appointments, medical history, and clinical lab reports.
            </p>
          </div>

          {/* Today's date pill */}
          <div className="self-start sm:self-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 text-left sm:text-right shadow-sm flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200/80 mb-0.5">Today</p>
            <p className="text-xs sm:text-sm font-bold text-white">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* ══ MAIN CONTAINER ════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ══ HEALTH OVERVIEW KPI CARDS ════════════════════════ */}
        <div className="relative z-20 -mt-10 sm:-mt-12 mb-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {kpiCards.map((kpi, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
                    {kpi.label}
                  </span>
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.iconBox}`}>
                    {kpi.icon}
                  </div>
                </div>

                <div className="mt-2.5">
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400 inline" />
                    ) : (
                      <Counter to={kpi.count} />
                    )}
                  </p>
                  <p className={`text-[11px] sm:text-xs font-medium mt-1 truncate ${kpi.accentColor || "text-slate-400"}`}>
                    {kpi.accent}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ MAIN DASHBOARD GRID (2/3 Left, 1/3 Right) ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN (2/3) ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. NEXT APPOINTMENT FOCUS CARD */}
            <div className="rounded-2xl overflow-hidden">
              {loading ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 shadow-sm">
                  <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-600 mb-2.5" />
                  <p className="text-sm font-medium text-slate-500">Loading your appointments…</p>
                </div>
              ) : nextAppt ? (
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0F1E3D] via-[#172554] to-[#1E3A8A] text-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-700/50">
                  {/* Background glow & subtle shapes */}
                  <div className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full bg-blue-500/[0.12] blur-2xl" />
                  <div className="pointer-events-none absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-cyan-400/[0.08] blur-xl" />

                  <div className="relative z-10">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white backdrop-blur-md border border-white/15">
                          {nextAppt.date === todayISO ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              Today's Consultation
                            </>
                          ) : (
                            <>
                              <Calendar className="w-3.5 h-3.5 text-blue-300" />
                              {nextAppt.date}
                            </>
                          )}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            nextAppt.consultationType === "VIDEO"
                              ? "bg-cyan-500/15 text-cyan-200 border-cyan-400/30"
                              : "bg-teal-500/15 text-teal-200 border-teal-400/30"
                          }`}
                        >
                          {nextAppt.consultationType === "VIDEO" ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-cyan-300" />
                              Online Video
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3.5 h-3.5 text-teal-300" />
                              Physical Visit
                            </>
                          )}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          nextAppt.status === "CONFIRMED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                            : nextAppt.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                            : "bg-blue-500/20 text-blue-200 border border-blue-400/40"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            nextAppt.status === "CONFIRMED"
                              ? "bg-emerald-400"
                              : nextAppt.status === "PENDING"
                              ? "bg-amber-400"
                              : "bg-blue-400"
                          }`}
                        />
                        {nextAppt.status || "Scheduled"}
                      </span>
                    </div>

                    {/* Middle details */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-200/80 mb-1">
                          Upcoming Appointment
                        </p>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                          {getDoctorName(nextAppt.doctorId)}
                        </h2>
                        <div className="flex items-center gap-2 mt-1.5 text-xs sm:text-sm text-blue-100/80">
                          <Stethoscope className="w-4 h-4 text-blue-300 flex-shrink-0" />
                          <span className="truncate">{getHospitalName(nextAppt.hospitalId)}</span>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200/70 mb-0.5">
                          Scheduled Time
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-white leading-tight">
                          {nextAppt.time}
                        </p>
                      </div>
                    </div>

                    {/* Bottom ticket banner */}
                    <div className="rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200/70 mb-0.5">
                            Appointment No.
                          </p>
                          <p className="text-xl font-black text-white">
                            #{nextAppt.appointmentNumber || "—"}
                          </p>
                        </div>

                        <div className="h-9 w-px bg-white/15" />

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200/70 mb-0.5">
                            Consultation Mode
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-white">
                            {nextAppt.consultationType || "PHYSICAL"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate("/patient/appointments")}
                        className="inline-flex items-center justify-center gap-1.5 bg-white text-blue-950 hover:bg-blue-50 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm active:scale-95 self-stretch sm:self-auto"
                      >
                        <span>View Ticket</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Unpaid lab tests warning */}
                    {unpaidLabs.length > 0 && (
                      <div className="mt-3 rounded-xl bg-amber-500/15 border border-amber-400/35 p-3 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-200">
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>
                            {unpaidLabs.length} unpaid lab test{unpaidLabs.length > 1 ? "s" : ""} pending payment
                          </span>
                        </div>
                        <button
                          onClick={() => navigate("/patient/reports")}
                          className="text-xs font-bold text-amber-300 hover:text-amber-100 underline flex-shrink-0"
                        >
                          Pay Now →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Empty state when no appointment exists */
                <div className="bg-white rounded-2xl p-8 sm:p-10 text-center border border-slate-200/80 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3.5 border border-blue-100">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                    No upcoming appointments
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-5">
                    Feeling unwell or due for a routine check-up? Find a specialist and book your consultation in seconds.
                  </p>
                  <button
                    onClick={() => navigate("/find-doctor")}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-sm active:scale-95"
                  >
                    <span>Book a Consultation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 2. TODAY'S APPOINTMENTS SCHEDULE */}
            {!loading && todayAppts.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        Today's Appointments
                      </h3>
                      <p className="text-[11px] text-slate-400">Scheduled consultations today</p>
                    </div>
                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      {todayAppts.length}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate("/patient/appointments")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/60 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                  >
                    <span>All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 sm:p-5 space-y-2.5">
                  {todayAppts.map((a, i) => (
                    <div
                      key={a.id || i}
                      className="bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 rounded-xl p-3.5 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            a.status === "CONFIRMED"
                              ? "bg-emerald-500"
                              : a.status === "PENDING"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {getDoctorName(a.doctorId)}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {getHospitalName(a.hospitalId)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xs sm:text-sm font-bold text-blue-600">
                          {a.time}
                        </p>
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider ${
                            a.consultationType === "VIDEO" ? "text-cyan-600" : "text-slate-500"
                          }`}
                        >
                          {a.consultationType || "PHYSICAL"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. RECENT MEDICAL HISTORY */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100/80">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      Recent Medical History
                    </h3>
                    <p className="text-[11px] text-slate-400">Clinical consultations & diagnoses</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/patient/medical-history")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50/60 hover:bg-cyan-50 px-3 py-1.5 rounded-lg transition"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 sm:p-5">
                {loading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-600 mb-2" />
                    <p className="text-xs text-slate-500">Loading medical records…</p>
                  </div>
                ) : recentHistory.length === 0 ? (
                  <div className="py-8 text-center">
                    <ClipboardList className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-medium text-slate-500">No medical records found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentHistory.map((r, i) => (
                      <div
                        key={r.id || i}
                        className="bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 border-l-4 border-l-blue-600 rounded-xl p-3.5 sm:p-4 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {r.conditions || "Clinical Consultation Visit"}
                            </h4>

                            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
                              <span>👨‍⚕️ {r.doctorName || "Attending Doctor"}</span>
                              <span className="text-slate-300">·</span>
                              <span>🏥 {r.hospitalName || "Hospital"}</span>
                            </p>

                            {r.medications && (
                              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5 truncate">
                                <Pill className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                                <span>{r.medications}</span>
                              </p>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-xs font-bold text-blue-600">
                              {r.dateOfVisit}
                            </p>
                            {r.followUp && r.followUp !== "No" && (
                              <span className="inline-block mt-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                Follow-up: {r.followUp}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN (1/3) ────────────────────────────── */}
          <div className="space-y-6">

            {/* 1. QUICK ACTIONS GRID */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Quick Actions
                </h3>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Shortcuts
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    icon: <Search className="w-4 h-4" />,
                    label: "Find Doctor",
                    path: "/find-doctor",
                    style: "bg-blue-50/80 text-blue-700 border-blue-100 hover:border-blue-200 hover:bg-blue-100/70",
                  },
                  {
                    icon: <Calendar className="w-4 h-4" />,
                    label: "Appointments",
                    path: "/patient/appointments",
                    style: "bg-indigo-50/80 text-indigo-700 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-100/70",
                  },
                  {
                    icon: <ClipboardList className="w-4 h-4" />,
                    label: "Med History",
                    path: "/patient/medical-history",
                    style: "bg-cyan-50/80 text-cyan-700 border-cyan-100 hover:border-cyan-200 hover:bg-cyan-100/70",
                  },
                  {
                    icon: <FlaskConical className="w-4 h-4" />,
                    label: "Lab Reports",
                    path: "/patient/reports",
                    style: "bg-teal-50/80 text-teal-700 border-teal-100 hover:border-teal-200 hover:bg-teal-100/70",
                  },
                  {
                    icon: <Video className="w-4 h-4" />,
                    label: "Video Consult",
                    path: "/patient/appointments",
                    style: "bg-sky-50/80 text-sky-700 border-sky-100 hover:border-sky-200 hover:bg-sky-100/70",
                  },
                  {
                    icon: <MessageSquare className="w-4 h-4" />,
                    label: "Feedback",
                    path: "/patient/add-feedback",
                    style: "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100",
                  },
                ].map((a, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(a.path)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${a.style}`}
                  >
                    {a.icon}
                    <span className="text-[11px] font-bold leading-tight">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. NOTIFICATIONS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                </div>

                {unreadNotifs.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white shadow-sm">
                    {unreadNotifs.length} new
                  </span>
                )}
              </div>

              <div className="p-4 max-h-[220px] overflow-y-auto space-y-2">
                {loading ? (
                  <div className="py-4 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-6 text-center">
                    <Bell className="w-7 h-7 mx-auto text-slate-200 mb-1" />
                    <p className="text-xs text-slate-400">No notifications yet.</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n, i) => (
                    <div
                      key={n.id || i}
                      className={`p-3 rounded-xl border transition ${
                        n.read
                          ? "bg-slate-50/70 border-slate-200/60 text-slate-700"
                          : "bg-blue-50/70 border-blue-200/80 text-slate-900"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs ${n.read ? "font-medium" : "font-bold"} leading-snug`}>
                            {n.message}
                          </p>
                          {n.createdAt && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. LAB TESTS SUMMARY */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                    <FlaskConical className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Lab Test Summary</h3>
                </div>
                <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  {labTests.length} Total
                </span>
              </div>

              {loading ? (
                <div className="py-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-teal-600" />
                </div>
              ) : labTests.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No lab tests found.</p>
              ) : (
                <div className="space-y-3">
                  {[
                    {
                      label: "Paid",
                      count: labTests.filter(t => t.isPaid || t.paid).length,
                      barColor: "bg-teal-500",
                      badgeColor: "text-teal-700 bg-teal-50 border-teal-100",
                    },
                    {
                      label: "Pending Payment",
                      count: unpaidLabs.length,
                      barColor: "bg-amber-500",
                      badgeColor: "text-amber-700 bg-amber-50 border-amber-100",
                    },
                    {
                      label: "Reported",
                      count: labTests.filter(t => t.reportStatus === "Uploaded").length,
                      barColor: "bg-blue-600",
                      badgeColor: "text-blue-700 bg-blue-50 border-blue-100",
                    },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-600">{item.label}</span>
                        <span className="font-bold text-slate-900">{item.count}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                          style={{
                            width: `${labTests.length ? (item.count / labTests.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => navigate("/patient/reports")}
                    className="w-full mt-2 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 rounded-xl transition text-center"
                  >
                    View All Lab Reports →
                  </button>
                </div>
              )}
            </div>

            {/* 4. APPOINTMENT BREAKDOWN */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Appointment Breakdown</h3>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {appointments.length} Total
                </span>
              </div>

              {loading ? (
                <div className="py-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-600" />
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    {
                      label: "Confirmed",
                      count: appointments.filter(a => a.status === "CONFIRMED").length,
                      barColor: "bg-emerald-500",
                    },
                    {
                      label: "Pending",
                      count: appointments.filter(a => a.status === "PENDING").length,
                      barColor: "bg-amber-500",
                    },
                    {
                      label: "Completed",
                      count: appointments.filter(a => a.status === "COMPLETED").length,
                      barColor: "bg-indigo-600",
                    },
                    {
                      label: "Video Consult",
                      count: videoAppts.length,
                      barColor: "bg-cyan-500",
                    },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-600">{item.label}</span>
                        <span className="font-bold text-slate-900">{item.count}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                          style={{
                            width: `${appointments.length ? (item.count / appointments.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ══ MY DOCTORS (ROW 2) ══════════════════════════════ */}
        {!loading && uniqueDoctorIds.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mt-6">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">My Doctors</h3>
                  <p className="text-[11px] text-slate-400">Specialists you have consulted with</p>
                </div>
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  {uniqueDoctorIds.length}
                </span>
              </div>

              <button
                onClick={() => navigate("/patient/my-doctors")}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/60 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {uniqueDoctorIds.slice(0, 4).map((did, i) => {
                const d = doctors.find(x => x.id === did);
                const apptCount = appointments.filter(a => a.doctorId === did).length;
                return (
                  <div
                    key={did || i}
                    className="bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 rounded-2xl p-4 flex items-center gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white text-base shadow-sm overflow-hidden"
                      style={{
                        background: d?.profileImage
                          ? "transparent"
                          : "linear-gradient(135deg, #1E3A8A, #3B82F6)",
                      }}
                    >
                      {d?.profileImage ? (
                        <img src={d.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        d ? `${d.firstName || "D"}`.charAt(0) : "D"
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {d ? `${d.title || ""} ${d.firstName || ""} ${d.lastName || ""}`.trim() : "Unknown"}
                      </p>
                      <p className="text-[11px] font-semibold text-blue-600 truncate mt-0.5">
                        {d?.specialization || "Specialist"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {apptCount} appointment{apptCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ FOOTER / LIVE DATA STRIP ═════════════════════════ */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm mt-6">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 flex-shrink-0" />
            <span>
              <strong className="text-slate-900">{appointments.length}</strong> total appointments ·{" "}
              <strong className="text-slate-900">{uniqueDoctorIds.length}</strong> doctors ·{" "}
              <strong className="text-slate-900">{medHistory.length}</strong> medical records
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Pulse color="bg-blue-500" />
            <span>Live clinical data</span>
          </div>
        </div>

      </div>
    </div>
  );
}