import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, User } from 'lucide-react';

const DoctorSchedulePage = () => {
  const [selectedHospital, setSelectedHospital] = useState('');

  const schedules = [
    {
      date: "October 23, 2025",
      time: "Thursday 5:45 P.M.",
      activeAppointments: 12,
      status: "Available"
    },
    {
      date: "October 27, 2025",
      time: "Monday 5:00 P.M.",
      activeAppointments: 4,
      status: "Available"
    },
    {
      date: "October 30, 2025",
      time: "Thursday 5:45 P.M.",
      activeAppointments: 0,
      status: "Cancel"
    },
    {
      date: "November 2, 2025",
      time: "Sunday 4:30 P.M.",
      activeAppointments: 1,
      status: "Available"
    },
    {
      date: "November 3, 2025",
      time: "Monday 5:00 P.M.",
      activeAppointments: 0,
      status: "Cancel"
    },
    {
      date: "November 6, 2025",
      time: "Thursday 5:00 P.M.",
      activeAppointments: 2,
      status: "Available"
    },
    {
      date: "November 9, 2025",
      time: "Sunday 4:30 P.M.",
      activeAppointments: 0,
      status: "Available"
    }
  ];

  const hospitals = [
    "Asiri Hospital Galle",
    "Co-Operative Hospital Matara",
    "Nawaloka Hospital Colombo"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-6">
        {/* Header with Profile Icon */}
        <div className="flex justify-end mb-6">
          <div className="bg-gray-800 p-3 rounded-full">
            <User size={24} className="text-white" />
          </div>
        </div>

        {/* Hospital Selector */}
        <div className="mb-6">
          <div className="relative inline-block w-64">
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full bg-gray-300 text-gray-800 font-semibold py-3 px-4 pr-10 rounded-lg appearance-none cursor-pointer hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Hospital</option>
              {hospitals.map((hospital, index) => (
                <option key={index} value={hospital}>
                  {hospital}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={20} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none"
            />
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="space-y-4 max-w-4xl">
          {schedules.map((schedule, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-blue-600 hover:shadow-lg transition-shadow"
            >
              <div className="p-5 flex items-center justify-between">
                {/* Left Section - Date & Time */}
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold text-lg">
                    {schedule.date}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {schedule.time}
                  </p>
                </div>

                {/* Middle Section - Active Appointments */}
                <div className="flex-1 text-center">
                  <p className="text-gray-600 text-sm mb-1">
                    Active Appointments
                  </p>
                  <p className="text-gray-900 font-bold text-2xl">
                    {schedule.activeAppointments}
                  </p>
                </div>

                {/* Right Section - Status Button */}
                <div className="flex-1 flex justify-end">
                  <button
                    className={`px-8 py-2 rounded-md font-semibold text-white transition-colors ${
                      schedule.status === "Available"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {schedule.status}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrow */}
        <button className="fixed left-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default DoctorSchedulePage;