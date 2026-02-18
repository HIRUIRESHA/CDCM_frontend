import React from 'react';
import { Calendar, Users, Clock, Video, TrendingUp, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // 1. Import useAuth

const DoctorDashboard = () => {
  const { user } = useAuth(); // 2. Get user data

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
      value: "12",
      subtitle: "8 Completed",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      icon: <Clock size={24} className="text-white" />,
      title: "Upcoming",
      value: "4",
      subtitle: "Next at 2:00 PM",
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

  const todayAppointments = [
    {
      time: "09:00 AM",
      patient: "Sarah Johnson",
      type: "General Checkup",
      status: "completed",
      color: "bg-green-100 text-green-700"
    },
    {
      time: "10:30 AM",
      patient: "Michael Chen",
      type: "Follow-up",
      status: "completed",
      color: "bg-green-100 text-green-700"
    },
    {
      time: "02:00 PM",
      patient: "Emma Williams",
      type: "Video Consultation",
      status: "upcoming",
      color: "bg-blue-100 text-blue-700"
    },
    {
      time: "03:30 PM",
      patient: "James Brown",
      type: "General Checkup",
      status: "upcoming",
      color: "bg-blue-100 text-blue-700"
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* 3. Use user.name (Backend sends title + name for doctors) */}
          <h1 className="text-3xl font-bold text-[#0a1647]">
            Welcome back, {user?.name || "Doctor"}
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your patients today</p>
        </div>
        <div className="bg-white px-6 py-2 rounded-xl shadow-md">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg font-semibold text-[#0a1647]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
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
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[#0a1647]">Today's Schedule</h3>
            <button className="px-4 py-2 bg-[#0a1647] text-white rounded-lg hover:bg-[#1a2557] transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {todayAppointments.map((appointment, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="text-center min-w-[80px]">
                  <p className="text-sm font-semibold text-[#0a1647]">{appointment.time}</p>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{appointment.patient}</h4>
                  <p className="text-sm text-gray-600">{appointment.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.color}`}>
                  {appointment.status === 'completed' ? 'Completed' : 'Upcoming'}
                </span>
                {appointment.status === 'upcoming' && (
                  <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                    Start
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-2xl font-bold text-[#0a1647] mb-6">Recent Activities</h3>
          
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index}
                className={`p-4 ${activity.bgColor} rounded-xl`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {activity.text}
                    </p>
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