import React from 'react';
import { Users, Calendar, DollarSign, Star, AlertTriangle, Activity } from 'lucide-react';

const HospitalDashboard = () => {
  const stats = [
    {
      icon: <Users size={24} className="text-white" />,
      title: "Total Doctors",
      value: "35",
      subtitle: "Active Doctors",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      icon: <Calendar size={24} className="text-white" />,
      title: "Appointments Today",
      value: "320",
      subtitle: "Scheduled",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      icon: <DollarSign size={24} className="text-white" />,
      title: "Total Earnings (This Month)",
      value: "Rs. 450,000",
      subtitle: "",
      bgColor: "bg-gradient-to-br from-purple-600 to-purple-700"
    },
    {
      icon: <Star size={24} className="text-white" />,
      title: "Average Rating",
      value: "4.8 / 5",
      subtitle: "",
      bgColor: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    },
    {
      icon: <AlertTriangle size={24} className="text-white" />,
      title: "Pending Payments",
      value: "Rs. 18,000",
      subtitle: "",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600"
    }
  ];

  const updates = [
    {
      icon: <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
        <Calendar size={20} className="text-white" />
      </div>,
      text: "Dr. Fernando canceled her 3 PM session.",
      time: "Updated 10 minutes ago"
    },
    {
      icon: <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
        <Calendar size={20} className="text-white" />
      </div>,
      text: "New appointment booked with Dr. Perera.",
      time: "Updated 10 minutes ago"
    },
    {
      icon: <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
        <DollarSign size={20} className="text-white" />
      </div>,
      text: "Payment of Rs. 2,000 received.",
      time: "Updated 10 minutes ago"
    },
    {
      icon: <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
        <AlertTriangle size={20} className="text-white" />
      </div>,
      text: "System update scheduled for tonight.",
      time: "Updated 10 minutes ago"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-end mb-6">
        <div className="bg-white px-6 py-2 rounded-bl-3xl shadow-md">
          <h1 className="text-2xl font-bold text-[#0a1647]">Asiri Hospital</h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-200 via-purple-100 to-blue-100 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-[#0a1647] mb-3">Dashboard</h2>
          <p className="text-[#0a1647] text-lg max-w-2xl mb-4">
            Welcome back! Here's what's happening at your hospital today. Monitor key metrics, 
            track activities, and stay updated with real-time information.
          </p>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <Activity size={18} className="text-green-500" />
            <span className="text-sm font-medium text-gray-700">Live Updates</span>
          </div>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
          <img 
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%230a1647' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 12h-4l-3 9L9 3l-3 9H2'%3E%3C/path%3E%3C/svg%3E" 
            alt="Medical Icon"
            className="w-48 h-48"
          />
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

      {/* Real-time Updates */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-2xl font-bold text-red-600 mb-6">Real-time Session Updates</h3>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-1 bg-[#0a1647]"></div>
          
          {/* Updates */}
          <div className="space-y-6">
            {updates.map((update, index) => (
              <div key={index} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#0a1647] border-4 border-white"></div>
                </div>
                
                {/* Update content */}
                <div className="flex-1 bg-blue-100 rounded-2xl p-4 ml-2">
                  <div className="flex items-start gap-3">
                    {update.icon}
                    <div className="flex-1">
                      <p className="text-gray-900 font-semibold mb-1">{update.text}</p>
                      <p className="text-sm text-gray-600">{update.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;