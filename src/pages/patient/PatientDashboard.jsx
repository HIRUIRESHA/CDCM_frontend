import React from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import { 
  Calendar, Activity, AlertCircle, Clock, 
  ArrowRight, FileText, Search 
} from 'lucide-react';

const PatientDashboard = () => {
  const navigate = useNavigate();

  // Mock Data (Summary data only)
  const nextAppt = {
    hasAppointment: true,
    doctor: "Dr. Thilina Weerasinghe",
    hospital: "Ruhuna Hospital",
    time: "10:30 AM",
    date: "Today, Oct 25",
    myNumber: 15,
    currentServing: 12, // The "Live" feature
    status: "ON_TIME" // or "DELAYED"
  };

  const pendingTasks = [
    { id: 1, type: 'payment', message: 'Pending payment for Channeling #402', amount: 'LKR 1,500' },
    { id: 2, type: 'report', message: 'New feedback from Dr. Sewwandi on Lab Report' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header with Personalization */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your healthcare status</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-400">Current Date</p>
          <p className="text-lg font-medium text-slate-700">Tuesday, Oct 25, 2024</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN - Main Status (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* A. Live Appointment Status */}
          {nextAppt.hasAppointment ? (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="bg-blue-500/30 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                      Happening Today
                    </span>
                    <h2 className="text-2xl font-bold mt-2">{nextAppt.doctor}</h2>
                    <p className="text-blue-100">{nextAppt.hospital}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">{nextAppt.time}</p>
                    {nextAppt.status === 'DELAYED' && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Delayed</span>
                    )}
                  </div>
                </div>

                {/* The "Live Queue" Feature */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-blue-200 uppercase">Your No.</p>
                      <p className="text-2xl font-bold">{nextAppt.myNumber}</p>
                    </div>
                    <div className="h-8 w-px bg-blue-400/50"></div>
                    <div className="text-center">
                      <p className="text-xs text-blue-200 uppercase">Now Serving</p>
                      <p className="text-2xl font-bold text-green-300 animate-pulse">{nextAppt.currentServing}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/appointments')}
                    className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
                  >
                    View Ticket
                  </button>
                </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>
          ) : (
            // Fallback if no appointment today
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Calendar className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">No appointments today</h3>
              <p className="text-gray-400 text-sm mt-1">Feeling unwell? Find a specialist easily.</p>
              <button 
                onClick={() => navigate('/find-doctor')}
                className="mt-4 text-blue-600 font-semibold hover:underline"
              >
                Book a consultation
              </button>
            </div>
          )}

          {/* B. Action Required (Pending Tasks) */}
          {pendingTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <AlertCircle size={20} className="text-orange-500" />
                Action Required
              </h3>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="bg-white border-l-4 border-orange-400 shadow-sm p-4 rounded-r-xl flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-800">{task.message}</p>
                      {task.amount && <p className="text-sm text-slate-500 mt-1">{task.amount}</p>}
                    </div>
                    <button 
                      onClick={() => navigate(task.type === 'payment' ? '/payments' : '/reports')}
                      className="text-sm bg-orange-50 text-orange-700 px-3 py-1.5 rounded-md font-medium hover:bg-orange-100"
                    >
                      {task.type === 'payment' ? 'Pay Now' : 'View'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Quick Access (1/3 width) */}
        <div className="space-y-6">
          
          {/* C. Quick Shortcuts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickBtn 
                icon={<Search size={20} />} 
                label="Find Doctor" 
                color="text-purple-600 bg-purple-50"
                onClick={() => navigate('/find-doctor')}
              />
              <QuickBtn 
                icon={<FileText size={20} />} 
                label="Upload Report" 
                color="text-emerald-600 bg-emerald-50"
                onClick={() => navigate('/reports')}
              />
              <QuickBtn 
                icon={<Calendar size={20} />} 
                label="History" 
                color="text-blue-600 bg-blue-50"
                onClick={() => navigate('/history')}
              />
              <QuickBtn 
                icon={<Activity size={20} />} 
                label="My Vitals" 
                color="text-pink-600 bg-pink-50"
                onClick={() => navigate('/vitals')} // Optional future feature
              />
            </div>
          </div>

          {/* D. Recent Activity Feed (Mini version of History) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Recent Activity</h3>
              <button 
                onClick={() => navigate('/history')}
                className="text-xs text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              <ActivityItem 
                icon={<Clock size={16} />} 
                text="Appointment scheduled with Dr. Perera" 
                date="2h ago" 
              />
              <ActivityItem 
                icon={<FileText size={16} />} 
                text="X-Ray Report uploaded" 
                date="Yesterday" 
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const QuickBtn = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-transform hover:scale-105 ${color}`}
  >
    <div className="mb-2">{icon}</div>
    <span className="text-xs font-bold text-slate-700">{label}</span>
  </button>
);

const ActivityItem = ({ icon, text, date }) => (
  <div className="flex gap-3 items-start">
    <div className="mt-1 text-slate-400 bg-slate-50 p-1.5 rounded-full">{icon}</div>
    <div>
      <p className="text-sm font-medium text-slate-700 leading-tight">{text}</p>
      <p className="text-xs text-slate-400 mt-1">{date}</p>
    </div>
  </div>
);

export default PatientDashboard;