import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

// Fallback avatar for broken images
const defaultAvatar = "https://ui-avatars.com/api/?name=Patient&background=random";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Helper to group appointments by date
const groupAppointmentsByDate = (list) => {
  if (!Array.isArray(list)) return {};
  return list.reduce((acc, appt) => {
    const date = appt.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(appt);
    return acc;
  }, {});
};

// Helper to safely read and validate cached appointments
const readValidCache = (id) => {
  if (!id) return null;
  try {
    const raw = sessionStorage.getItem(`doctorMyPatientsCache_${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.timestamp === "number" && Array.isArray(parsed.appointments)) {
      if (Date.now() - parsed.timestamp <= CACHE_TTL_MS) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading doctor patients cache:", err);
  }
  return null;
};

const MyPatients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const doctorId = user?.id || user?._id;

  const initialCache = readValidCache(doctorId);
  const [groupedAppointments, setGroupedAppointments] = useState(() => {
    return initialCache ? groupAppointmentsByDate(initialCache.appointments) : {};
  });
  const [loading, setLoading] = useState(!initialCache);

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    const cacheKey = `doctorMyPatientsCache_${doctorId}`;
    const cachedData = readValidCache(doctorId);

    if (cachedData) {
      setGroupedAppointments(groupAppointmentsByDate(cachedData.appointments));
      setLoading(false);
    } else {
      setLoading(true);
    }

    (async () => {
      try {
        const res = await axios.get(`http://localhost:8082/api/appointments/doctor/${doctorId}`);
        const rawAppointments = Array.isArray(res.data) ? res.data : [];
        const grouped = groupAppointmentsByDate(rawAppointments);
        setGroupedAppointments(grouped);

        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              appointments: rawAppointments,
              timestamp: Date.now()
            })
          );
        } catch (storageErr) {
          console.warn("Error saving doctor patients cache:", storageErr);
        }
      } catch (err) {
        console.error("Error fetching patient data", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId]);

  // Handle Medical History button click with OTP gate
  const handleMedicalHistoryClick = async (appt) => {
    const doctorId = user?.id || user?._id;

    // 1. Payment Verification Check
    const isPaid = appt.isPaid === true || appt.paymentStatus?.toUpperCase() === "PAID";
    if (!isPaid) {
      await Swal.fire({
        icon: "warning",
        title: "Payment Required",
        text: "Medical history access is available only after the patient's appointment payment has been completed.",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "OK"
      });
      return;
    }

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      Swal.showLoading();

      // 2. Check current access status from backend
      const res = await axios.get(
        `http://localhost:8082/api/medical-records/access-status?appointmentId=${appt.id}&doctorId=${doctorId}`,
        { headers }
      );

      Swal.close();
      const statusData = res.data;

      // 3. Active 1-hour access already exists
      if (statusData.hasActiveAccess) {
        navigate(`/doctor/update-history/${appt.patientId}`, {
          state: {
            appointmentId: appt.id,
            hospitalName: appt.hospitalName || "Selected Hospital",
            accessExpiresAt: statusData.accessExpiresAt
          }
        });
        return;
      }

      // 4. Access has already expired for this consultation
      if (statusData.accessExpired) {
        await Swal.fire({
          icon: "error",
          title: "Access Expired",
          text: "The 1-hour medical history access window for this consultation has ended.",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "OK"
        });
        return;
      }

      // 5. Account/appointment locked due to too many failed attempts
      if (statusData.locked) {
        await Swal.fire({
          icon: "error",
          title: "Access Locked",
          text: "Too many failed OTP attempts. Medical history access has been locked for this appointment.",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "OK"
        });
        return;
      }

      // 6. No OTP issued (legacy appointment prior to feature)
      if (!statusData.otpIssued) {
        await Swal.fire({
          icon: "info",
          title: "No Access Code Issued",
          text: "No medical history access code was issued for this appointment.",
          confirmButtonColor: "#2563eb",
          confirmButtonText: "OK"
        });
        return;
      }

      // 7. Payment complete & OTP issued, but access not yet active -> Prompt for OTP
      promptForOtp(appt, headers);

    } catch (err) {
      console.error("Error checking access status:", err);
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Unable to verify medical history access status. Please try again.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "OK"
      });
    }
  };

  // SweetAlert2 OTP prompt dialog
  const promptForOtp = async (appt, headers, initialError = null) => {
    const doctorId = user?.id || user?._id;

    const { value: enteredOtp, isConfirmed } = await Swal.fire({
      title: "Medical History Access",
      html: `
        <div style="font-size: 0.95rem; color: #4b5563; margin-bottom: 0.75rem; line-height: 1.4;">
          Ask the patient for the 6-digit medical history access code sent to their registered email.
        </div>
        ${initialError ? `<div style="color: #dc2626; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; background-color: #fee2e2; padding: 0.5rem; rounded: 0.5rem;">⚠️ ${initialError}</div>` : ""}
      `,
      input: "text",
      inputPlaceholder: "Enter 6-digit OTP",
      inputAttributes: {
        maxlength: "6",
        autocapitalize: "off",
        autocorrect: "off",
        inputmode: "numeric",
        pattern: "[0-9]*",
        style: "text-align: center; letter-spacing: 0.35em; font-size: 1.4rem; font-weight: bold; padding: 0.5rem;"
      },
      showCancelButton: true,
      confirmButtonText: "Verify & Access",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value) {
          return "Please enter the 6-digit access code";
        }
        const trimmed = value.trim();
        if (!/^\d{6}$/.test(trimmed)) {
          return "Access code must be exactly 6 digits (numbers only)";
        }
        return null;
      }
    });

    if (!isConfirmed || !enteredOtp) return;

    try {
      Swal.showLoading();
      const verifyRes = await axios.post(
        "http://localhost:8082/api/medical-records/verify-access",
        {
          appointmentId: appt.id,
          doctorId: doctorId,
          otp: enteredOtp.trim()
        },
        { headers }
      );

      if (verifyRes.data?.success) {
        await Swal.fire({
          icon: "success",
          title: "Access Granted",
          text: "Medical history access is available for 1 hour.",
          confirmButtonColor: "#2563eb",
          confirmButtonText: "Proceed to Records"
        });

        navigate(`/doctor/update-history/${appt.patientId}`, {
          state: {
            appointmentId: appt.id,
            hospitalName: appt.hospitalName || "Selected Hospital",
            accessExpiresAt: verifyRes.data.accessExpiresAt
          }
        });
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Verification failed. Please check the code and try again.";

      if (status === 429) {
        Swal.fire({
          icon: "error",
          title: "Access Locked",
          text: msg,
          confirmButtonColor: "#dc2626"
        });
      } else if (status === 403 && (msg.toLowerCase().includes("expired") || err.response?.data?.hasActiveAccess === false)) {
        Swal.fire({
          icon: "error",
          title: "Access Expired",
          text: msg,
          confirmButtonColor: "#dc2626"
        });
      } else {
        // Re-prompt for OTP allowing doctor to re-try manually
        promptForOtp(appt, headers, msg);
      }
    }
  };

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
                            onClick={() => handleMedicalHistoryClick(appt)}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-lg transition-all transform active:scale-95 inline-flex items-center gap-1.5"
                          >
                            <span>📝</span>
                            <span>MEDICAL HISTORY</span>
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