import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Stethoscope, MapPin, Phone, Mail } from 'lucide-react';

const DoctorManagement = () => {
  // Mock Data - Replace with API call later
  const [doctors] = useState([
    {
      id: 1,
      name: "Dr. nayomi Perera",
      specialty: "Cardiologist",
      email: "nayomi@example.com",
      phone: "071-6032143",
      status: "Active",
      patients: 124,
      image: "https://ui-avatars.com/api/?name=Thilina+Weerasinghe&background=0D8ABC&color=fff"
    },
    {
      id: 2,
      name: "Dr. Sewwandi",
      specialty: "Dermatologist",
      email: "sewwandi@example.com",
      phone: "077-1234567",
      status: "On Leave",
      patients: 89,
      image: "https://ui-avatars.com/api/?name=Sewwandi&background=6b21a8&color=fff"
    },
    {
      id: 3,
      name: "Dr. Perera",
      specialty: "Neurologist",
      email: "perera@example.com",
      phone: "070-9876543",
      status: "Active",
      patients: 45,
      image: "https://ui-avatars.com/api/?name=Perera&background=10b981&color=fff"
    }
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="text-gray-500 text-sm">Overview of all registered specialists in your hospital.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={18} />
          Add New Doctor
        </button>
      </div>

      {/* 2. Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, specialty or ID..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
            <option>All Specialties</option>
            <option>Cardiology</option>
            <option>Dermatology</option>
            <option>Neurology</option>
          </select>
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-smQX text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
            <option>All Status</option>
            <option>Active</option>
            <option>On Leave</option>
          </select>
        </div>
      </div>

      {/* 3. Doctors Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center relative group">
            
            {/* Action Menu (Top Right) */}
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <MoreVertical size={18} />
            </button>

            {/* Profile Image */}
            <div className="relative mb-4">
              <img 
                src={doctor.image} 
                alt={doctor.name} 
                className="w-20 h-20 rounded-full object-cover border-4 border-blue-50"
              />
              <span className={`absolute bottom-0 right-0 w-5 h-5 border-4 border-white rounded-full ${
                doctor.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'
              }`}></span>
            </div>

            {/* Doctor Info */}
            <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
            <div className="flex items-center gap-1.5 text-blue-600 text-sm font-medium mt-1 mb-4">
              <Stethoscope size={14} />
              {doctor.specialty}
            </div>

            {/* Contact Details */}
            <div className="w-full space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Mail size={16} className="text-gray-400" />
                <span className="truncate">{doctor.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Phone size={16} className="text-gray-400" />
                <span>{doctor.phone}</span>
              </div>
            </div>

            {/* Footer / Stats */}
            <div className="w-full mt-6 flex gap-3">
              <button className="flex-1 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                View Profile
              </button>
              <button className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                Schedule
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default DoctorManagement;