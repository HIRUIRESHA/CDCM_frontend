import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Fallback avatar for broken images
const defaultAvatar = "https://ui-avatars.com/api/?name=Patient&background=random";

const MyPatients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groupedAppointments, setGroupedAppointments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // Using port 8082 as per your configuration
        const res = await axios.get(`http://localhost:8082/api/appointments/doctor/${user.id}`);
        
        // DEBUG: Check your console (F12) to see if hospitalName exists in the list
        console.log("Backend Raw Data:", res.data);

        // Grouping logic: Group by Date
        const grouped = res.data.reduce((acc, appt) => {
          const date = appt.date;
          if (!acc[date]) acc[date] = [];
          acc[date].push(appt);
          return acc;
        }, {});

        setGroupedAppointments(grouped);
      } catch (err) {
        console.error("Error fetching patient data", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchPatients();
  }, [user]);

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading Patients...</div>;

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black mb-8 text-gray-800 tracking-tight">My Booked Patients</h1>

        {Object.keys(groupedAppointments).length === 0 ? (
          <div className="bg-white p-16 rounded-3xl shadow-sm text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-lg">No patients booked yet.</p>
          </div>
        ) : (
          Object.keys(groupedAppointments).sort().reverse().map((date) => (
            <div key={date} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-sm font-black text-white bg-blue-600 px-5 py-2 rounded-full shadow-md uppercase tracking-widest">
                  📅 {date}
                </h2>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Patient Details</th>
                      <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Time Slot</th>
                      <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Appt No</th>
                      <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                      <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {groupedAppointments[date].map((appt) => (
                      <tr key={appt.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <img 
                              src={appt.profileImage || defaultAvatar} 
                              alt="Patient" 
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              onError={(e) => { e.target.src = defaultAvatar; }}
                            />
                            <div>
                              <p className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                                {appt.patientName || "Unknown Patient"}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">ID: {appt.patientId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className="text-sm font-semibold text-gray-600">{appt.time}</span>
                        </td>
                        <td className="p-5">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-black text-xs">
                            {appt.appointmentNumber}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase">
                            {appt.status}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={() => {
                              // Safety check: ensure we are sending a real value
                              const hName = appt.hospitalName || "Selected Hospital";
                              navigate(`/doctor/update-history/${appt.patientId}`, {
                                state: { hospitalName: hName }
                              });
                            }}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-lg transition-all transform active:scale-95"
                          >
                            📝 MEDICAL HISTORY
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyPatients;