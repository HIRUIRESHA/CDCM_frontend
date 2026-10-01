import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import { showSuccess, showError } from "../../utils/alert";

const formatExpiryTime = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return (
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " (" +
      d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) +
      ")"
    );
  } catch (e) {
    return isoString;
  }
};

const PreviousRecordCard = ({ record, index, isExpanded, onToggle }) => {
  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        isExpanded
          ? "border-blue-300 shadow-md ring-2 ring-blue-50/50"
          : "border-gray-200/80 shadow-sm hover:border-gray-300 hover:shadow-md"
      }`}
    >
      {/* Compact Card Header */}
      <div
        onClick={onToggle}
        className={`p-4 md:p-5 flex items-center justify-between cursor-pointer select-none transition-colors ${
          isExpanded ? "bg-blue-50/40 border-b border-blue-100" : "bg-white hover:bg-gray-50/60"
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
          <span
            className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
              isExpanded ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-700"
            }`}
          >
            #{index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="font-black text-gray-900 text-sm">
                📅 {record.dateOfVisit || "Unknown Date"}
              </span>
              {record.hospitalName && (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 border border-blue-200/50 px-2.5 py-0.5 rounded-full truncate max-w-[260px]">
                  🏥 {record.hospitalName}
                </span>
              )}
            </div>
            {record.doctorName && (
              <p className="text-xs text-gray-500 font-medium truncate">
                Attending: <span className="font-bold text-gray-700">Dr. {record.doctorName}</span>
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
            isExpanded
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
          }`}
        >
          <span>{isExpanded ? "Hide Details" : "View Details"}</span>
          <span>{isExpanded ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* Expanded Detailed Body */}
      {isExpanded && (
        <div className="p-6 space-y-4 text-xs bg-white">
          {/* Diagnosis / Conditions */}
          {record.conditions && (
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-150">
              <span className="font-black text-blue-900 uppercase tracking-wider text-[10px] block mb-1">
                Conditions / Diagnosis
              </span>
              <p className="text-gray-800 font-semibold text-sm leading-relaxed">{record.conditions}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Treatment / Procedure */}
            {record.treatment && (
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-black text-gray-600 uppercase tracking-wider text-[10px] block mb-1">
                  Treatment / Procedure
                </span>
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">{record.treatment}</p>
              </div>
            )}

            {/* Prescribed Medications */}
            {record.medications && (
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <span className="font-black text-emerald-800 uppercase tracking-wider text-[10px] block mb-1">
                  Prescribed Medication
                </span>
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">{record.medications}</p>
              </div>
            )}

            {/* Known Allergies */}
            {record.allergies && (
              <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200">
                <span className="font-black text-rose-800 uppercase tracking-wider text-[10px] block mb-1">
                  Known Allergies
                </span>
                <p className="text-rose-900 font-semibold">{record.allergies}</p>
              </div>
            )}

            {/* Follow-up Required */}
            {record.followUp && record.followUp !== "No" && (
              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200">
                <span className="font-black text-amber-800 uppercase tracking-wider text-[10px] block mb-1">
                  Follow-up Required
                </span>
                <p className="text-amber-900 font-bold">{record.followUp}</p>
              </div>
            )}

            {/* Required Lab Tests */}
            {record.requiredLabTests && (
              <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200 md:col-span-2">
                <span className="font-black text-purple-800 uppercase tracking-wider text-[10px] block mb-1">
                  Required Lab Tests
                </span>
                <p className="text-purple-900 font-medium">{record.requiredLabTests}</p>
              </div>
            )}

            {/* Internal Notes */}
            {record.notes && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 md:col-span-2">
                <span className="font-black text-slate-600 uppercase tracking-wider text-[10px] block mb-1">
                  Clinical Notes
                </span>
                <p className="text-slate-700 italic">{record.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const UpdateMedicalHistory = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Read appointmentId and hospitalName passed from MyPatients
  const appointmentId = location.state?.appointmentId;
  const scheduledHospital = location.state?.hospitalName || "General Hospital / Clinic";

  // Authorization & data state
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessAuthorized, setAccessAuthorized] = useState(false);
  const [accessExpiresAt, setAccessExpiresAt] = useState(location.state?.accessExpiresAt || null);
  const [previousHistory, setPreviousHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Accordion state: index of the currently open record, or null (all collapsed by default)
  const [expandedRecordIndex, setExpandedRecordIndex] = useState(null);

  // Form state matching clinical visit requirements
  const [formData, setFormData] = useState({
    conditions: "",
    treatment: "",
    medications: "",
    allergies: "",
    followUp: "No",
    requiredLabTests: "",
    notes: ""
  });

  // Verify access authorization on page load
  useEffect(() => {
    const verifyAndLoadHistory = async () => {
      const doctorId = user?.id || user?._id;

      // 1. Missing appointmentId or doctorId - direct URL typing blocked!
      if (!appointmentId || !doctorId) {
        setCheckingAccess(false);
        await Swal.fire({
          icon: "warning",
          title: "Unauthorized Access",
          text: "No active appointment session found. Please access patient medical history from the My Patients dashboard.",
          confirmButtonColor: "#2563eb",
          confirmButtonText: "Go to My Patients"
        });
        navigate("/doctor/mypatients");
        return;
      }

      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        setCheckingAccess(true);

        // 2. Check access status with backend
        const statusRes = await axios.get(
          `https://cdcm-backend.onrender.com/api/medical-records/access-status?appointmentId=${appointmentId}&doctorId=${doctorId}`,
          { headers }
        );

        if (!statusRes.data.hasActiveAccess) {
          setCheckingAccess(false);
          await Swal.fire({
            icon: "error",
            title: "Access Required",
            text: statusRes.data.accessExpired
              ? "The 1-hour medical history access window for this consultation has expired."
              : "Medical history access is not active for this appointment. Please verify the patient's access code.",
            confirmButtonColor: "#2563eb",
            confirmButtonText: "Go to My Patients"
          });
          navigate("/doctor/mypatients");
          return;
        }

        // Access is valid!
        setAccessAuthorized(true);
        setAccessExpiresAt(statusRes.data.accessExpiresAt);
        setCheckingAccess(false);

        // 3. Fetch previous medical history using protected doctor endpoint
        setLoadingHistory(true);
        try {
          const historyRes = await axios.get(
            `https://cdcm-backend.onrender.com/api/medical-records/doctor/patient/${patientId}?appointmentId=${appointmentId}&doctorId=${doctorId}`,
            { headers }
          );
          setPreviousHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
        } catch (histErr) {
          if (histErr.response?.status === 403) {
            // Expired during access
            setAccessAuthorized(false);
            setPreviousHistory([]);
            await Swal.fire({
              icon: "error",
              title: "Medical History Access Expired",
              text: "The 1-hour consultation access period has ended.",
              confirmButtonColor: "#dc2626",
              confirmButtonText: "OK"
            });
            navigate("/doctor/mypatients");
            return;
          }
          console.error("Error loading previous history:", histErr);
        } finally {
          setLoadingHistory(false);
        }

      } catch (err) {
        console.error("Access verification error:", err);
        setCheckingAccess(false);
        await Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: "Unable to verify medical history authorization. Returning to My Patients.",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "OK"
        });
        navigate("/doctor/mypatients");
      }
    };

    if (user) {
      verifyAndLoadHistory();
    }
  }, [patientId, appointmentId, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const record = {
      patientId,
      doctorId: user.id,
      doctorName: user.name,
      hospitalName: scheduledHospital,
      dateOfVisit: new Date().toISOString().split("T")[0],
      ...formData
    };

    try {
      setSubmitting(true);
      await axios.post(
        "https://cdcm-backend.onrender.com/api/medical-records/add",
        record,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const result = await showSuccess(
        "Medical History Updated Successfully!"
      );

      if (result.isConfirmed) {
        navigate("/doctor/mypatients");
      }
    } catch (err) {
      console.error("Save Error:", err);
      await showError(
        "Failed to save record. Please check the backend connection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-gray-700 font-black text-sm uppercase tracking-wider">Verifying Medical History Authorization...</p>
        <p className="text-gray-400 text-xs mt-1">Validating consultation session with backend...</p>
      </div>
    );
  }

  if (!accessAuthorized) {
    return null;
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen flex justify-center items-start">
      <div className="w-full max-w-4xl space-y-8">

        {/* 1. Header Card with Patient & Consultation Info */}
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex flex-wrap justify-between items-center border-b pb-6 mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-black text-blue-900 uppercase">Update Medical History</h2>
              <p className="text-gray-400 text-sm font-bold mt-1 tracking-widest">CLINICAL VISIT RECORD & PATIENT DOSSIER</p>
            </div>
            <div className="text-right bg-blue-50/70 border border-blue-150 px-4 py-2 rounded-2xl">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Patient ID</p>
              <p className="text-blue-700 font-black text-lg">{patientId}</p>
            </div>
          </div>

          {/* Doctor & Facility Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attending Medical Officer</label>
              <input 
                className="w-full p-4 bg-blue-50/50 rounded-xl border border-blue-100 font-bold text-blue-800 outline-none cursor-not-allowed" 
                value={user?.name || "Doctor Name"} 
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
          </div>

          {/* 2. Medical History Access Active Banner */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-emerald-800">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-900">
                  🔒 Privacy-Controlled Medical History Access Active
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Verified consultation session for Appointment ID: <span className="font-mono font-bold">{appointmentId}</span>
                </p>
              </div>
            </div>
            {accessExpiresAt && (
              <div className="bg-emerald-100/90 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-900 border border-emerald-300/60 shadow-sm">
                ⏱️ Access Expires: {formatExpiryTime(accessExpiresAt)}
              </div>
            )}
          </div>
        </div>

        {/* 2. CURRENT CONSULTATION / ADD RECORD FORM (Now placed ABOVE Previous History) */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Section Header */}
          <div className="md:col-span-2 border-b pb-5 mb-2">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">🩺 Current Consultation - Add Clinical Visit Record</h3>
            <p className="text-gray-400 text-xs font-semibold mt-1">
              Document findings, treatment plan, and prescription for today's visit ({new Date().toISOString().split("T")[0]})
            </p>
          </div>

          {/* Medical Input Fields */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
              Conditions / Diagnosis <span className="text-red-500">*</span>
            </label>
            <textarea 
              required 
              placeholder="Enter diagnosis details..."
              className="w-full p-4 border-2 border-gray-150 rounded-2xl focus:border-blue-500 outline-none transition-all" 
              rows="2" 
              value={formData.conditions}
              onChange={(e) => setFormData({...formData, conditions: e.target.value})} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Treatment / Procedure</label>
            <textarea 
              className="w-full p-4 border-2 border-gray-150 rounded-2xl focus:border-blue-500 outline-none" 
              placeholder="Procedures performed..."
              rows="4" 
              value={formData.treatment}
              onChange={(e) => setFormData({...formData, treatment: e.target.value})} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Prescribed Medication</label>
            <textarea 
              className="w-full p-4 border-2 border-gray-150 rounded-2xl focus:border-green-500 outline-none" 
              placeholder="Dosage and frequency..."
              rows="4" 
              value={formData.medications}
              onChange={(e) => setFormData({...formData, medications: e.target.value})} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-red-600 uppercase tracking-widest">Known Allergies</label>
            <input 
              className="w-full p-3.5 border-2 border-gray-150 rounded-xl focus:border-red-500 outline-none" 
              placeholder="None" 
              value={formData.allergies}
              onChange={(e) => setFormData({...formData, allergies: e.target.value})} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Follow-up Required?</label>
            <select 
              className="w-full p-3.5 border-2 border-gray-150 rounded-xl outline-none" 
              value={formData.followUp}
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
              className="w-full p-3.5 border-2 border-gray-150 rounded-xl focus:border-purple-500 outline-none" 
              placeholder="e.g., Blood Test, X-Ray" 
              value={formData.requiredLabTests}
              onChange={(e) => setFormData({...formData, requiredLabTests: e.target.value})} 
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Internal Notes</label>
            <textarea 
              className="w-full p-3.5 border-2 border-gray-150 rounded-2xl outline-none" 
              rows="2" 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})} 
            />
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-2 flex gap-4 mt-6">
            <button 
              type="button"
              onClick={() => navigate("/doctor/mypatients")}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {submitting ? "Saving Record..." : "Save Record"}
            </button>
          </div>
        </form>

        {/* 3. PREVIOUS MEDICAL HISTORY SECTION (Now placed BELOW Current Consultation Form) */}
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex items-center justify-between border-b pb-5 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">📋 Previous Medical History</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-black rounded-full">
                  {previousHistory.length} {previousHistory.length === 1 ? "Record" : "Records"}
                </span>
              </div>
              <p className="text-gray-400 text-xs font-semibold mt-1">
                Authorized past clinical consultations, diagnoses, and prescriptions (click a record to view details)
              </p>
            </div>
          </div>

          {loadingHistory ? (
            <div className="py-12 text-center text-gray-500 font-medium flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-3"></div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Loading Patient Medical Records...</p>
            </div>
          ) : previousHistory.length === 0 ? (
            <div className="p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-gray-600 font-bold text-sm">
                No previous medical history records are available for this patient.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                This may be the patient's first clinical visit in the CDCM system.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {previousHistory.map((rec, idx) => (
                <PreviousRecordCard
                  key={rec.id || idx}
                  record={rec}
                  index={idx}
                  isExpanded={expandedRecordIndex === idx}
                  onToggle={() => setExpandedRecordIndex((prev) => (prev === idx ? null : idx))}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UpdateMedicalHistory;