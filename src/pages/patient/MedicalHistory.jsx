import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const MedicalHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Ensure you are using the correct port (8082) and the correct endpoint
        const res = await axios.get(`http://localhost:8082/api/medical-records/patient/${user.id}`);
        setHistory(res.data);
      } catch (err) {
        console.error("Error loading history:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading Medical Records...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Clinical History</h1>
          <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold">
            {history.length} Visits Found
          </span>
        </div>

        {history.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-lg">No medical history records available yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {history.map((record) => (
              <div 
                key={record.id} 
                className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow border-l-[12px] border-blue-600 overflow-hidden"
              >
                {/* Header: Date and Doctor Information */}
                <div className="bg-gray-50 px-8 py-5 border-b flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date of Visit</p>
                    <p className="text-xl font-bold text-gray-800">{record.dateOfVisit}</p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medical Officer</p>
                    <p className="font-bold text-blue-700 text-lg">{record.doctorName}</p>
                    <p className="text-xs text-gray-500 font-medium">{record.hospitalName}</p>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* Diagnosis & Conditions */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-blue-800 uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        Conditions / Diagnosis
                      </h4>
                      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                        <p className="text-gray-700 leading-relaxed font-semibold italic">
                          {record.conditions || "No diagnosis provided."}
                        </p>
                      </div>
                    </div>

                    {/* Treatment & Procedure */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-green-800 uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                        Treatment / Procedure
                      </h4>
                      <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100">
                        <p className="text-gray-700 leading-relaxed">
                          {record.treatment || "No treatment details recorded."}
                        </p>
                      </div>
                    </div>

                    {/* Medications */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-purple-800 uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                        Prescribed Medications
                      </h4>
                      <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                        <p className="text-gray-700 leading-relaxed">
                          {record.medications || "None prescribed."}
                        </p>
                      </div>
                    </div>

                    {/* Lab Tests & Allergies */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-red-700 uppercase mb-2">⚠️ Allergies Identified</h4>
                        <p className="text-sm font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                          {record.allergies || "None reported"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-orange-700 uppercase mb-2">🧪 Required Lab Tests</h4>
                        <p className="text-sm text-gray-700 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                          {record.requiredLabTests || "No tests required"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Info: Follow up and Notes */}
                  <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">Follow-up:</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${record.followUp === "No" ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>
                        {record.followUp}
                      </span>
                    </div>
                    {record.notes && (
                      <div className="w-full bg-gray-50 p-4 rounded-xl italic text-sm text-gray-500">
                        <span className="font-bold not-italic">Notes: </span> {record.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;