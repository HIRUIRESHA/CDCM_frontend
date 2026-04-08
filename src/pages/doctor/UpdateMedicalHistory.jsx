import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const UpdateMedicalHistory = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Capture the specific hospital name passed from the MyPatients page
  // We use a fallback just in case the user navigates here directly
  const scheduledHospital = location.state?.hospitalName || "General Hospital / Clinic";

  // 2. Form state matching your requirements
  const [formData, setFormData] = useState({
    conditions: "",
    treatment: "",
    medications: "",
    allergies: "",
    followUp: "No",
    requiredLabTests: "",
    notes: ""
  });

const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const record = {
      patientId,
      doctorId: user.id,
      doctorName: user.name, 
      hospitalName: scheduledHospital,
      dateOfVisit: new Date().toISOString().split('T')[0], 
      ...formData
    };

    try {
      await axios.post("http://localhost:8082/api/medical-records/add", record, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      // ✅ This will show the popup and wait for the user to click OK
      alert("Medical History Updated Successfully!");
      
      // ✅ This only runs AFTER the user clicks OK
      navigate("/doctor/mypatients"); 
      
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save record. Please check the backend connection.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex justify-center items-start">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-100"
      >
        {/* Header Section */}
        <div className="md:col-span-2 flex justify-between items-center border-b pb-6 mb-2">
          <div>
            <h2 className="text-3xl font-black text-blue-900 uppercase">Update Medical History</h2>
            <p className="text-gray-400 text-sm font-bold mt-1 tracking-widest">CLINICAL VISIT RECORD</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient ID</p>
            <p className="text-blue-600 font-bold">{patientId}</p>
          </div>
        </div>

        {/* --- AUTO-FILLED SECTION --- */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attending Medical Officer</label>
          <input 
            className="w-full p-4 bg-blue-50/50 rounded-xl border border-blue-100 font-bold text-blue-800 outline-none cursor-not-allowed" 
            value={user?.name || "Doctor Name Loading..."} 
            readOnly 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scheduled Facility</label>
          <input 
            className="w-full p-4 bg-blue-50/50 rounded-xl border border-blue-100 font-bold text-blue-800 outline-none cursor-not-allowed" 
            value={scheduledHospital} 
            readOnly 
          />
        </div>

        {/* --- MEDICAL INPUT FIELDS --- */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Conditions / Diagnosis</label>
          <textarea 
            required 
            placeholder="Enter diagnosis details..."
            className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition-all" 
            rows="2" 
            onChange={(e) => setFormData({...formData, conditions: e.target.value})} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Treatment / Procedure</label>
          <textarea 
            className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none" 
            placeholder="Procedures performed..."
            rows="4" 
            onChange={(e) => setFormData({...formData, treatment: e.target.value})} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Prescribed Medication</label>
          <textarea 
            className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none" 
            placeholder="Dosage and frequency..."
            rows="4" 
            onChange={(e) => setFormData({...formData, medications: e.target.value})} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-red-600 uppercase tracking-widest">Known Allergies</label>
          <input 
            className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none" 
            placeholder="None" 
            onChange={(e) => setFormData({...formData, allergies: e.target.value})} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Follow-up Required?</label>
          <select 
            className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none" 
            onChange={(e) => setFormData({...formData, followUp: e.target.value})}
          >
            <option value="No">No</option>
            <option value="1 Week">Yes (1 week)</option>
            <option value="2 Weeks">Yes (2 weeks)</option>
            <option value="1 Month">Yes (1 month)</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Required Lab Tests</label>
          <input 
            className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none" 
            placeholder="e.g., Blood Test, X-Ray" 
            onChange={(e) => setFormData({...formData, requiredLabTests: e.target.value})} 
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Internal Notes</label>
          <textarea 
            className="w-full p-3 border-2 border-gray-100 rounded-2xl outline-none" 
            rows="2" 
            onChange={(e) => setFormData({...formData, notes: e.target.value})} 
          />
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex gap-4 mt-6">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest"
          >
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateMedicalHistory;