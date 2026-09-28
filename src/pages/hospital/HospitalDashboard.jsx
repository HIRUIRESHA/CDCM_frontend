import React, { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  DollarSign,
  AlertTriangle,
  Activity,
  MessageSquare,
  CheckCircle2,
  XCircle,
  CreditCard,
  Stethoscope
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import HospitalDash from "../../assets/HospitalDash.jpg";

const HospitalDashboard = () => {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/hospitals/${user.id}/analytics`
      );

      setData(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?.id]);

  const summary = data?.summary || {
    totalRevenue: 0,
    appointmentRevenue: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    pendingAppointments: 0,
    activeDoctorsCount: 0,
    totalLabTests: 0,
    labRevenue: 0
  };

  const recentAppointments = data?.recentAppointments || [];

  const formatLKR = (amount) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0
    }).format(amount || 0);

  const today = new Date().toISOString().split("T")[0];

  const todayAppointments = recentAppointments.filter(
    (appointment) => appointment.date?.startsWith(today)
  ).length;

  const pendingPayments = recentAppointments
    .filter(
      (appointment) =>
        appointment.status !== "PAID" &&
        appointment.status !== "COMPLETED"
    )
    .reduce(
      (total, appointment) =>
        total + Number(appointment.amount || 0),
      0
    );

  const stats = [
    {
      icon: <Stethoscope size={20} />,
      title: "Total Doctors",
      value: summary.activeDoctorsCount,
      subtitle: `${summary.activeDoctorsCount} Active Doctors`
    },
    {
      icon: <CalendarDays size={20} />,
      title: "Appointments Today",
      value: todayAppointments,
      subtitle: `${summary.totalAppointments} Total`
    },
    {
      icon: <DollarSign size={20} />,
      title: "Total Earnings",
      value: formatLKR(summary.totalRevenue),
      subtitle: "Hospital Revenue"
    },
    {
      icon: <CheckCircle2 size={20} />,
      title: "Completed",
      value: summary.completedAppointments,
      subtitle: `${summary.confirmedAppointments} Confirmed`
    },
    {
      icon: <AlertTriangle size={20} />,
      title: "Pending Payments",
      value: formatLKR(pendingPayments),
      subtitle: `${summary.pendingAppointments} Pending`
    }
  ];

  const getActivity = (appointment) => {
    const patient = appointment.patientName || "Patient";
    const doctor = appointment.doctorName || "Doctor";

    if (appointment.status === "CANCELLED") {
      return {
        icon: <XCircle size={19} />,
        iconColor: "text-red-600",
        textColor: "text-red-700",
        text: `${patient} cancelled an appointment with ${doctor}.`
      };
    }

    if (appointment.status === "COMPLETED") {
      return {
        icon: <CheckCircle2 size={19} />,
        iconColor: "text-emerald-600",
        textColor: "text-emerald-700",
        text: `Appointment completed with ${doctor}.`
      };
    }

    if (
      appointment.status === "PAID" ||
      appointment.isPaid
    ) {
      return {
        icon: <CreditCard size={19} />,
        iconColor: "text-purple-600",
        textColor: "text-purple-700",
        text: `Payment of ${formatLKR(
          appointment.amount
        )} received from ${patient}.`
      };
    }

    return {
      icon: <MessageSquare size={19} />,
      iconColor: "text-blue-700",
      textColor: "text-blue-900",
      text: `New appointment booked with ${doctor}.`
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Activity
            className="animate-spin mx-auto text-indigo-700"
            size={32}
          />
          <p className="mt-3 text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 md:px-8 py-5">

      {/* Hospital Name */}
      <div className="flex justify-end mb-1">
        <div className="relative bg-slate-200 px-10 md:px-14 py-3 rounded-bl-[40px]">
          <h1 className="text-2xl md:text-3xl font-black text-indigo-950">
            {user?.name || "Hospital"}
          </h1>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-indigo-200/80 rounded-[25px] px-7 md:px-12 py-7 mb-7 relative overflow-hidden">

        <div className="relative z-10 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-black text-indigo-950">
            Dashboard
          </h2>

          <p className="mt-2 text-indigo-700 max-w-2xl">
            Welcome back! Here's what's happening at your hospital
            today. Monitor key metrics, track activities, and stay
            updated with real-time information.
          </p>

          <div className="mt-5 inline-flex items-center gap-3 bg-white rounded-full px-5 py-2 shadow-sm">
            <Activity
              size={19}
              className="text-green-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Live Updates
            </span>
          </div>
        </div>

        {/* Decorative right section */}
        <div className="hidden lg:flex absolute right-5 top-3 bottom-3 w-40 bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-300 rounded-2xl items-center justify-center">
          <Activity
            size={70}
            className="text-indigo-600/60"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-[#7255b5] to-[#5b3f9d] text-white rounded-xl px-5 py-5 shadow-lg hover:-translate-y-1 transition"
          >
            <div className="flex items-start gap-2">
              <div className="text-yellow-300">
                {stat.icon}
              </div>

              <div>
                <p className="text-sm font-bold leading-tight">
                  {stat.title}
                </p>

                <p className="text-xl font-black mt-2">
                  {stat.value}
                </p>

                <p className="text-[11px] text-purple-100 mt-1">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Updates Heading */}
      <h2 className="text-center text-2xl md:text-3xl font-black text-red-500 mb-3">
        Real-time Session Updates
      </h2>

      {/* Timeline + Updates */}
      <div className="max-w-3xl mx-auto flex gap-5 md:gap-7">

        {/* Timeline */}
        <div className="relative w-7 flex-shrink-0">
          <div className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-[3px] bg-indigo-950 rounded-full" />

          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 bg-indigo-950 rounded-full border-4 border-white shadow" />
        </div>

        {/* Update Box */}
        <div className="flex-1 bg-[#a9d2ee] rounded-xl shadow-lg px-6 md:px-10 py-6 min-h-[260px]">

          {recentAppointments.length === 0 ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-600">
              <Activity
                size={32}
                className="mb-2 opacity-50"
              />

              <p>No recent activity available.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentAppointments
                .slice(0, 5)
                .map((appointment, index) => {
                  const activity = getActivity(appointment);

                  return (
                    <div
                      key={appointment.id || index}
                      className="flex items-start gap-5"
                    >
                      <div
                        className={`${activity.iconColor} mt-1 flex-shrink-0`}
                      >
                        {activity.icon}
                      </div>

                      <div>
                        <p
                          className={`font-bold text-sm md:text-base ${activity.textColor}`}
                        >
                          {activity.text}
                        </p>

                        <p className="text-[11px] text-slate-600 mt-1">
                          {appointment.date || "Recently"}
                          {appointment.time &&
                            ` • ${appointment.time}`}
                        </p>
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
};

export default HospitalDashboard;