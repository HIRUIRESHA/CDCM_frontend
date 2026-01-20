import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, FileText, MoreVertical, Search } from 'lucide-react';

const PatientAppointments = () => {
  // Simple state for switching tabs
  const [activeTab,Tb] = useState('upcoming'); // 'upcoming' or 'history'

  // Mock Data - Replace with API call later
  const appointments = [
    {
      id: 1,
      doctor: "Dr. Thilina Weerasinghe",
      specialty: "Cardiologist",
      hospital: "Ruhuna Hospital",
      date: "Oct 25, 2024",
      time: "10:30 AM",
      status: "CONFIRMED",
      type: "upcoming",
      img: "https://ui-avatars.com/api/?name=Thilina+Weerasinghe&background=0D8ABC&color=fff"
    },
    {
      id: 2,
      doctor: "Dr. Sewwandi",
      specialty: "Dermatologist",
      hospital: "Asiri Hospital",
      date: "Nov 02, 2024",
      time: "04:00 PM",
      status: "PENDING",
      type: "upcoming",
      img: "https://ui-avatars.com/api/?name=Sewwandi&background=6b21a8&color=fff"
    },
    {
      id: 3,
      doctor: "Dr. Perera",
      specialty: "Neurologist",
      hospital: "Nawaloka Hospital",
      date: "Sep 15, 2024",
      time: "09:00 AM",
      status: "COMPLETED",
      type: "history",
      img: "https://ui-avatars.com/api/?name=Perera&background=10b981&color=fff"
    }
  ];

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter(appt => appt.type === activeTab);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 text-sm">Manage your upcoming and past sessions.</p>
        </div>
        
        {/* Search Bar (Optional) */}
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Search doctor..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
        </div>
      </div>

      {/* 2. Tabs (Upcoming vs History) */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button 
            onClick={() => Tb('upcoming')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'upcoming' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming
            {activeTab === 'upcoming' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => Tb('history')}
            className={`pb-3 text-sm font-medium transition-colorsnD relative ${
              activeTab === 'history' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History
            {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
          </button>
        </nav>
      </div>

      {/* 3. Appointment List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appt) => (
            <div key={appt.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center">
              
              {/* Date Box */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-blue-50 text-blue-700 rounded-xl font-bold">
                <span className="text-xs uppercase">{appt.date.split(' ')[0]}</span>
                <span className="text-xl">{appt.date.split(' ')[1].replace(',', '')}</span>
              </div>

              {/* Info Section */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{appt.doctor}</h3>
                        <p className="text-gray-500 text-sm">{appt.specialty}</p>
                    </div>
                    {/* Status Badge */}
                    <StatusBadge status={appt.status} />
                </div>
                
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        {appt.time}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin size={16} />
                        {appt.hospital}
                    </div>
                </div>
              </div>

              {/* Actions Button */}
              <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                {activeTab === 'upcoming' ? (
                    <>
                        <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            Reschedule
                        </button>
                        <button className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            View Ticket
                        </button>
                    </>
                ) : (
                    <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <FileText size={16} /> View Report
                    </button>
                )}
              </div>

            </div>
          ))
        ) : (
          // Empty State
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
            <p className="text-gray-500 text-sm">You don't have any {activeTab} appointments.</p>
          </div>
        )}
      </div>

    </div>
  );
};

// Helper Component for Status Colors
const StatusBadge = ({ status }) => {
    const styles = {
        CONFIRMED: "bg-green-100 text-green-700",
        PENDING: "bg-orange-100 text-orange-700",
        COMPLETED: "bg-gray-100 text-gray-700",
        CANCELLED: "bg-red-100 text-red-700"
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || styles.COMPLETED}`}>
            {status}
        </span>
    );
};

export default PatientAppointments;