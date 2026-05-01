import React, { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, Star, AlertTriangle, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      fetch(`http://localhost:8082/api/hospital/doctors/hospital/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://localhost:8082/api/appointments/hospital/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
      .then(([docRes, apptRes]) => Promise.all([docRes.json(), apptRes.json()]))
      .then(([doctors, appts]) => {

        setAppointments(appts);

        const today = new Date().toISOString().split("T")[0];

        const todayAppointments = appts.filter(a =>
          a.date?.startsWith(today)
        );

        const totalEarnings = appts
          .filter(a => a.isPaid)
          .reduce((sum, a) => sum + (a.amount || 0), 0);

        const pendingPayments = appts
          .filter(a => !a.isPaid)
          .reduce((sum, a) => sum + (a.amount || 0), 0);

        setStats([
          {
            icon: <Users size={24} className="text-white" />,
            title: "Total Doctors",
            value: doctors.length,
            subtitle: "Active Doctors",
            bgColor: "bg-gradient-to-br from-purple-500 to-purple-600"
          },
          {
            icon: <Calendar size={24} className="text-white" />,
            title: "Appointments Today",
            value: todayAppointments.length,
            subtitle: "Scheduled",
            bgColor: "bg-gradient-to-br from-blue-500 to-blue-600"
          },
          {
            icon: <DollarSign size={24} className="text-white" />,
            title: "Total Earnings",
            value: `Rs. ${totalEarnings}`,
            bgColor: "bg-gradient-to-br from-purple-600 to-purple-700"
          },
          {
            icon: <Star size={24} className="text-white" />,
            title: "Average Rating",
            value: "4.8 / 5",
            bgColor: "bg-gradient-to-br from-indigo-500 to-indigo-600"
          },
          {
            icon: <AlertTriangle size={24} className="text-white" />,
            title: "Pending Payments",
            value: `Rs. ${pendingPayments}`,
            bgColor: "bg-gradient-to-br from-purple-500 to-purple-600"
          }
        ]);

        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard error:", err);
        setLoading(false);
      });

  }, [user]);

  // ✅ REAL-TIME UPDATES (from appointments)
  const updates = appointments.slice(0, 5).map((appt) => {
    let text = "";

    if (appt.status === "CONFIRMED") {
      text = `New appointment for ${appt.patientName || "Patient"}`;
    } else if (appt.status === "CANCELLED") {
      text = `${appt.patientName || "Patient"} cancelled appointment`;
    } else if (appt.isPaid) {
      text = `Payment received from ${appt.patientName || "Patient"}`;
    } else {
      text = `Appointment scheduled for ${appt.patientName || "Patient"}`;
    }

    return {
      icon: (
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
          <Calendar size={20} className="text-white" />
        </div>
      ),
      text,
      time: appt.date || "Recently"
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="flex justify-end mb-6">
        <div className="bg-white px-6 py-2 rounded-bl-3xl shadow-md">
          <h1 className="text-2xl font-bold text-[#0a1647]">
            {user?.name || "Hospital Dashboard"}
          </h1>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-200 via-purple-100 to-blue-100 rounded-3xl p-8 mb-8">
        <h2 className="text-4xl font-bold text-[#0a1647] mb-3">Dashboard</h2>
        <p className="text-[#0a1647] text-lg">
          Welcome back! Here's what's happening at <strong>{user?.name}</strong>
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <p className="text-center text-gray-500">Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-2xl p-6 text-white shadow-lg`}>
              <div className="mb-4">{stat.icon}</div>
              <h3 className="text-sm mb-2">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* REAL UPDATES */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-2xl font-bold text-red-600 mb-6">
          Real-time Updates
        </h3>

        {updates.length === 0 ? (
          <p className="text-gray-500">No recent activity</p>
        ) : (
          updates.map((update, index) => (
            <div key={index} className="flex gap-4 mb-4">
              {update.icon}
              <div>
                <p className="font-semibold">{update.text}</p>
                <p className="text-sm text-gray-500">{update.time}</p>
              </div>
            </div>
          ))
        )}

      </div>

    </div>
  );
};

export default HospitalDashboard;