import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Users, Clock, Video, TrendingUp, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const doctorId = user?.id || user?._id;

  const [todaySchedules, setTodaySchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  // Fetch today's schedules from the same endpoint as SchedulePage,
  // then filter client-side to only today's date.
  useEffect(() => {
    if (!doctorId) {
      setLoadingSchedules(false);
      return;
    }

    const fetchTodaySchedules = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8082/api/schedules/doctor/${doctorId}`
        );

        // The schedule objects have a `date` field (e.g. "2026-03-18" or "Mar 18, 2026").
        // Normalise today's date to the same string format for comparison.
        const todayISO = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

        const todayOnly = res.data.filter((s) => {
          // Support both ISO format ("2026-03-18") and locale strings
          if (!s.date) return false;
          try {
            const scheduleDate = new Date(s.date).toISOString().split('T')[0];
            return scheduleDate === todayISO;
          } catch {
            return false;
          }
        });

        setTodaySchedules(todayOnly);
      } catch (err) {
        console.error('Error fetching today schedules:', err);
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchTodaySchedules();
  }, [doctorId]);

  // Derive stat values from real data
  const acceptedToday  = todaySchedules.filter((s) => s.status === 'ACCEPTED').length;
  const pendingToday   = todaySchedules.filter((s) => s.status === 'PENDING').length;

  // Find the next upcoming shift (accepted, time not yet passed)
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const parseTime  = (t = '') => {
    if (!t) return Infinity;
    const [time, period] = t.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + (m || 0);
  };

  const nextShift = todaySchedules
    .filter((s) => s.status === 'ACCEPTED' && parseTime(s.startTime) > nowMinutes)
    .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime))[0];

  const stats = [
    {
      icon: <Users size={24} className="text-white" />,
      title: "Total Patients",
      value: "156",
      subtitle: "Active Patients",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      icon: <Calendar size={24} className="text-white" />,
      title: "Today's Appointments",
      value: loadingSchedules ? "–" : String(todaySchedules.length),
      subtitle: `${acceptedToday} Accepted`,
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      icon: <Clock size={24} className="text-white" />,
      title: "Upcoming",
      value: loadingSchedules ? "–" : String(pendingToday),
      subtitle: nextShift ? `Next at ${nextShift.startTime}` : "No upcoming shifts",
      bgColor: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    },
    {
      icon: <Video size={24} className="text-white" />,
      title: "Video Consultations",
      value: "3",
      subtitle: "Scheduled Today",
      bgColor: "bg-gradient-to-br from-teal-500 to-teal-600"
    },
    {
      icon: <TrendingUp size={24} className="text-white" />,
      title: "Patient Satisfaction",
      value: "4.9/5",
      subtitle: "Based on 89 reviews",
      bgColor: "bg-gradient-to-br from-green-500 to-green-600"
    }
  ];

  const recentActivities = [
    {
      icon: <CheckCircle size={20} className="text-green-500" />,
      text: "Completed consultation with Sarah Johnson",
      time: "30 minutes ago",
      bgColor: "bg-green-50"
    },
    {
      icon: <MessageSquare size={20} className="text-blue-500" />,
      text: "New message from Michael Chen regarding prescription",
      time: "1 hour ago",
      bgColor: "bg-blue-50"
    },
    {
      icon: <Calendar size={20} className="text-purple-500" />,
      text: "New appointment booked for tomorrow at 10:00 AM",
      time: "2 hours ago",
      bgColor: "bg-purple-50"
    },
    {
      icon: <AlertCircle size={20} className="text-orange-500" />,
      text: "Lab results available for review - Patient: Emma Williams",
      time: "3 hours ago",
      bgColor: "bg-orange-50"
    }
  ];

  // Map schedule status → badge colours (same as SchedulePage)
  const statusStyle = {
    ACCEPTED: "bg-green-100 text-green-700",
    PENDING:  "bg-yellow-100 text-yellow-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const statusLabel = {
    ACCEPTED: "Accepted",
    PENDING:  "Pending",
    REJECTED: "Rejected",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0a1647]">
            Welcome back, {user?.name || "Doctor"}
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your patients today</p>
        </div>
        <div className="bg-white px-6 py-2 rounded-xl shadow-md">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg font-semibold text-[#0a1647]">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                {stat.icon}
              </div>
            </div>
            <h3 className="text-sm font-medium mb-2 opacity-90">{stat.title}</h3>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-sm opacity-80">{stat.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule — REAL DATA */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[#0a1647]">Today's Schedule</h3>
            <button className="px-4 py-2 bg-[#0a1647] text-white rounded-lg hover:bg-[#1a2557] transition-colors">
              View All
            </button>
          </div>

          {loadingSchedules ? (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
              <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm">Loading today's schedule…</span>
            </div>
          ) : todaySchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Calendar size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">No schedules for today</p>
              <p className="text-xs mt-1 opacity-70">Shifts assigned for today will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaySchedules.map((s) => {
                const id = s.id || s._id;
                const isPast = parseTime(s.endTime) < nowMinutes;

                return (
                  <div
                    key={id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {/* Time */}
                    <div className="text-center min-w-[90px]">
                      <p className="text-sm font-semibold text-[#0a1647]">{s.startTime}</p>
                      <p className="text-xs text-gray-400">{s.endTime}</p>
                    </div>

                    {/* Hospital info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {s.hospitalName || "Unknown Hospital"}
                      </h4>
                      {s.hospitalLocation && (
                        <p className="text-sm text-gray-500">📍 {s.hospitalLocation}</p>
                      )}
                    </div>

                    {/* Status badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[s.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabel[s.status] || s.status}
                    </span>

                    {/* Start button for accepted & not yet passed */}
                    {s.status === 'ACCEPTED' && !isPast && (
                      <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                        Start
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activities — kept as-is */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-2xl font-bold text-[#0a1647] mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className={`p-4 ${activity.bgColor} rounded-xl`}>
                <div className="flex items-start gap-3">
                  <div className="mt-1">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">{activity.text}</p>
                    <p className="text-xs text-gray-600">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-3">
          <Calendar size={24} />
          <span className="font-semibold">Schedule Appointment</span>
        </button>
        <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-3">
          <Users size={24} />
          <span className="font-semibold">View Patients</span>
        </button>
        <button className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-3">
          <Video size={24} />
          <span className="font-semibold">Start Video Call</span>
        </button>
        <button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-3">
          <MessageSquare size={24} />
          <span className="font-semibold">Messages</span>
        </button>
      </div>
    </div>
  );
};

export default DoctorDashboard;