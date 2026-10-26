import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../api/api';
import defaultDocImg from '../../assets/doc1.png';
import {
  Calendar,
  Clock,
  Building2,
  Video,
  Plus,
  CheckCircle2,
  ExternalLink,
  History,
  CalendarCheck,
  XCircle,
  AlertCircle,
  AlertTriangle,
  X,
  ShieldAlert,
  Percent,
  RotateCcw,
  CreditCard
} from 'lucide-react';
import { getSriLankaTodayDate, formatTimeRange } from '../../utils/dateTime';

function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [videoAppointments, setVideoAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'video' | 'upcoming' | 'previous'

  // Cancellation & Refund Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedApptForCancel, setSelectedApptForCancel] = useState(null);
  const [cancelPreviewLoading, setCancelPreviewLoading] = useState(false);
  const [cancelPreviewData, setCancelPreviewData] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  // Bank Details Modal State
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [selectedApptForBank, setSelectedApptForBank] = useState(null);
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    bankName: '',
    bankBranchName: '',
    accountNumber: '',
    confirmAccountNumber: ''
  });
  const [submittingBank, setSubmittingBank] = useState(false);
  const [bankError, setBankError] = useState('');
  const [bankSuccess, setBankSuccess] = useState('');

  const handleOpenBankModal = (appt) => {
    setSelectedApptForBank(appt);
    setBankForm({
      accountHolderName: appt.bankAccountHolderName || user?.name || '',
      bankName: appt.bankName || '',
      bankBranchName: appt.bankBranchName || '',
      accountNumber: '',
      confirmAccountNumber: ''
    });
    setBankError('');
    setBankSuccess('');
    setBankModalOpen(true);
  };

  const handleSubmitBankDetails = async (e) => {
    e?.preventDefault();
    if (!selectedApptForBank) return;

    if (!bankForm.accountHolderName.trim() || !bankForm.bankName.trim() || !bankForm.bankBranchName.trim() || !bankForm.accountNumber.trim()) {
      setBankError('Please complete all required bank fields including the branch name.');
      return;
    }

    if (bankForm.accountNumber.trim() !== bankForm.confirmAccountNumber.trim()) {
      setBankError('Account numbers do not match. Please verify.');
      return;
    }

    setSubmittingBank(true);
    setBankError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Your login session has expired. Please log in again.");
      }

      const apptId = selectedApptForBank.id || selectedApptForBank._id;
      const res = await fetch(`${API_BASE_URL}/api/appointments/${apptId}/bank-details`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountHolderName: bankForm.accountHolderName.trim(),
          bankName: bankForm.bankName.trim(),
          branchName: bankForm.bankBranchName.trim(),
          bankBranchName: bankForm.bankBranchName.trim(),
          accountNumber: bankForm.accountNumber.trim()
        })
      });

      const rawText = await res.text();
      let updated = null;
      try {
        updated = rawText ? JSON.parse(rawText) : null;
      } catch {
        updated = null;
      }

      if (!res.ok) {
        throw new Error(updated?.message || updated?.error || 'Failed to submit bank details.');
      }

      setAppointments(prev => prev.map(a => (a.id === updated.id || a._id === updated.id) ? { ...a, ...updated } : a));
      setBankSuccess('Bank details submitted successfully! Hospital administrators will process your refund transfer.');
      setActionSuccessMessage(`Bank details recorded for #${updated.appointmentNumber || updated.id}. Refund is now awaiting hospital transfer.`);
      setTimeout(() => {
        setBankModalOpen(false);
        setSelectedApptForBank(null);
        setBankSuccess('');
      }, 2500);
    } catch (err) {
      setBankError(err.message || 'Error submitting bank details.');
    } finally {
      setSubmittingBank(false);
    }
  };

  const handleOpenCancelModal = async (appt) => {
    setSelectedApptForCancel(appt);
    setCancelModalOpen(true);
    setCancelPreviewLoading(true);
    setCancelError('');
    setCancelPreviewData(null);
    setCancelReason('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Your login session has expired or is missing. Please log in again to manage your appointments.");
      }

      const apptId = appt.id || appt._id;
      const res = await fetch(`${API_BASE_URL}/api/appointments/${apptId}/cancel-preview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const rawText = await res.text();
      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        let msg = data?.message || data?.error;
        if (!msg) {
          if (res.status === 403) {
            msg = "Access denied (403): Your session may have expired or you are not authorized to cancel this appointment. Please log in again as a Patient.";
          } else if (res.status === 401) {
            msg = "Authentication required (401). Please log in to manage your appointments.";
          } else {
            msg = rawText ? rawText.trim() : `Server returned error status ${res.status}`;
          }
        }
        throw new Error(msg);
      }

      setCancelPreviewData(data);
    } catch (err) {
      setCancelError(err.message || 'Could not load refund preview.');
    } finally {
      setCancelPreviewLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedApptForCancel) return;
    setCancelling(true);
    setCancelError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Your login session has expired or is missing. Please log in again to manage your appointments.");
      }

      const apptId = selectedApptForCancel.id || selectedApptForCancel._id;
      const res = await fetch(`${API_BASE_URL}/api/appointments/${apptId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      const rawText = await res.text();
      let updated = null;
      try {
        updated = rawText ? JSON.parse(rawText) : null;
      } catch {
        updated = null;
      }

      if (!res.ok) {
        let msg = updated?.message || updated?.error;
        if (!msg) {
          if (res.status === 403) {
            msg = "Access denied (403): Your session may have expired or you are not authorized to cancel this appointment. Please log in again as a Patient.";
          } else if (res.status === 401) {
            msg = "Authentication required (401). Please log in to manage your appointments.";
          } else {
            msg = rawText ? rawText.trim() : `Server returned error status ${res.status}`;
          }
        }
        throw new Error(msg);
      }

      setAppointments(prev => prev.map(a => (a.id === updated.id || a._id === updated.id) ? { ...a, ...updated } : a));
      setVideoAppointments(prev => prev.map(a => (a.id === updated.id || a._id === updated.id) ? { ...a, ...updated } : a));

      if (updated.refundStatus === 'AWAITING_BANK_DETAILS') {
        setActionSuccessMessage(
          `Appointment #${updated.appointmentNumber || updated.id} cancelled. ${updated.refundPercentage}% refund (LKR ${Number(updated.refundAmount || 0).toFixed(2)}) is due. Please provide your bank details below.`
        );
        handleOpenBankModal(updated);
      } else if (updated.refundStatus === 'REFUNDED') {
        setActionSuccessMessage(
          `Appointment #${updated.appointmentNumber || updated.id} cancelled. ${updated.refundPercentage}% refund (LKR ${Number(updated.refundAmount || 0).toFixed(2)}) recorded.`
        );
      } else {
        setActionSuccessMessage(
          `Appointment #${updated.appointmentNumber || updated.id} cancelled successfully.`
        );
      }
      setCancelModalOpen(false);
      setSelectedApptForCancel(null);

      setTimeout(() => setActionSuccessMessage(''), 7000);
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    const fetchAppointmentsData = async () => {
      if (!user || !user.id) return;

      try {
        const token = localStorage.getItem('token');
        const authHeaders = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };

        const [apptRes, docsRes, hospsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/appointments/patient/${user.id}`, {
            headers: authHeaders
          }),
          fetch(`${API_BASE_URL}/api/hospital/doctors/assigned-all`),
          fetch(`${API_BASE_URL}/api/hospital/doctors/all-hospitals`)
        ]);

        if (apptRes.ok) {
          const apptData = await apptRes.json();

          // Keep VIDEO appointments out of the normal appointments section
          // Only show confirmed and paid physical appointments
          const normalAppointments = Array.isArray(apptData)
            ? apptData.filter(
              appt =>
                appt.consultationType !== "VIDEO" &&
                (appt.paid === true || (appt.paymentStatus && appt.paymentStatus.toUpperCase() === "PAID")) &&
                appt.status !== "PENDING" &&
                appt.paymentStatus !== "PENDING" &&
                appt.paymentStatus !== "FAILED"
            )
            : [];

          setAppointments(normalAppointments);
        }
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setDoctors(Array.isArray(docsData) ? docsData : []);
        }

        if (hospsRes.ok) {
          const hospsData = await hospsRes.json();
          setHospitals(Array.isArray(hospsData) ? hospsData : []);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentsData();
  }, [user]);

  // ============================================================
  // FETCH VIDEO CONSULTING APPOINTMENTS
  // ============================================================

  useEffect(() => {
    const fetchVideoAppointments = async () => {
      if (!user || !user.id) return;

      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          `https://cdcm-backend.onrender.com/api/video-appointments/patient/${user.id}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Only show VIDEO appointments here
          const videoData = Array.isArray(data)
            ? data.filter(
              appt => appt.consultationType === "VIDEO"
            )
            : [];

          setVideoAppointments(videoData);
        } else {
          console.error(
            "Failed to fetch video appointments:",
            response.status
          );

          setVideoAppointments([]);
        }

      } catch (error) {
        console.error(
          "Error fetching video appointments:",
          error
        );

        setVideoAppointments([]);

      } finally {
        setVideoLoading(false);
      }
    };

    fetchVideoAppointments();

  }, [user]);

  // --- LOGIC TO CATEGORIZE APPOINTMENTS ---
  const today = getSriLankaTodayDate();

  const upcomingAppointments = appointments
    .filter(appt => appt.date >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const previousAppointments = appointments
    .filter(appt => appt.date < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const getDoctor = (doctorId) => {
    return doctors.find(d => d.id === doctorId);
  };

  const getDoctorName = (doctorId) => {
    const doc = getDoctor(doctorId);
    return doc ? `${doc.title || ''} ${doc.firstName || ''} ${doc.lastName || ''}`.trim() : "Doctor";
  };

  const getDoctorSpecialty = (doctorId) => {
    const doc = getDoctor(doctorId);
    return doc ? (doc.specialization || doc.specialty || "Specialist") : "Specialist";
  };

  const getDoctorImage = (doctorId) => {
    const doc = getDoctor(doctorId);
    return doc?.profileImage || doc?.image || defaultDocImg;
  };

  const getHospitalName = (hospitalId) => {
    const hosp = hospitals.find(h => h.id === hospitalId);
    return hosp ? hosp.name : "Hospital";
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PAID':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  // Reusable Appointment Card for Upcoming and Previous Physical Appointments
  const AppointmentCard = ({ appt, isPrevious }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Card Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isPrevious ? 'bg-slate-50 border-slate-200' : 'bg-blue-50/60 border-blue-100'
        }`}>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Appointment No</span>
            <p className="font-bold text-slate-800 text-sm">{appt.appointmentNumber || `#APT-${appt.id}`}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(appt.status)}`}>
              {appt.status || "CONFIRMED"}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">
          {/* Doctor Profile Info with Image */}
          <div className="flex items-center gap-3.5">
            <img
              src={getDoctorImage(appt.doctorId)}
              alt={getDoctorName(appt.doctorId)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = defaultDocImg;
              }}
              className="w-13 h-13 rounded-full object-cover border-2 border-blue-100 shadow-sm shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Doctor</p>
              <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                {getDoctorName(appt.doctorId)}
              </h3>
              <p className="text-xs font-semibold text-blue-600 truncate mt-0.5">
                {getDoctorSpecialty(appt.doctorId)}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Date</p>
                <p className="text-xs font-bold text-slate-700 truncate">{appt.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Time</p>
                <p className="text-xs font-bold text-slate-700 truncate">{formatTimeRange(appt.time)}</p>
              </div>
            </div>
          </div>

          {/* Hospital */}
          <div className="flex items-center gap-2.5 pt-1 border-t border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Hospital</p>
              <p className="text-xs font-medium text-slate-700 truncate">{getHospitalName(appt.hospitalId)}</p>
            </div>
          </div>

          {/* Consultation Type Indicator */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-400 font-medium text-[11px]">Type</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded text-[11px]">
              PHYSICAL
            </span>
          </div>
        </div>
      </div>

      {/* Cancellation & Refund Audit Summary */}
      {appt.status === 'CANCELLED' && (
        <div className="mx-5 mb-4 p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-rose-800">
              Cancelled by: {appt.cancelledBy || 'Patient'}
            </span>
            {appt.refundStatus === 'REFUNDED' ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {appt.refundPercentage}% Refunded
              </span>
            ) : appt.refundStatus === 'AWAITING_PROCESSING' ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Awaiting Hospital Transfer
              </span>
            ) : appt.refundStatus === 'AWAITING_BANK_DETAILS' ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                Action Required: Bank Details
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                Non-Refundable
              </span>
            )}
          </div>

          {(Number(appt.refundAmount || 0) > 0 || Number(appt.refundPercentage || 0) > 0) && (
            <div className="p-2.5 rounded-lg bg-white/90 border border-rose-100 text-slate-700 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Eligible Refund ({appt.refundPercentage}%):</span>
                <strong className="text-emerald-700 font-bold text-xs">LKR {Number(appt.refundAmount || 0).toFixed(2)}</strong>
              </div>
              {appt.maskedBankAccountNumber && (
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Transfer Account:</span>
                  <span className="font-mono font-medium text-slate-800">{appt.bankName} ({appt.maskedBankAccountNumber})</span>
                </div>
              )}
              {appt.refundTransactionRef && (
                <div className="flex justify-between items-center text-[11px] text-emerald-700 pt-1 border-t border-slate-100">
                  <span>Transfer Ref:</span>
                  <span className="font-mono font-bold">{appt.refundTransactionRef}</span>
                </div>
              )}
            </div>
          )}

          {(appt.cancellationReason || appt.refundReason) && (
            <p className="text-slate-600 italic text-[11px]">
              Reason: &ldquo;{appt.cancellationReason || appt.refundReason}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Card Actions */}
      <div className="px-5 pb-5 pt-1 space-y-2">
        {appt.status === 'CANCELLED' && appt.refundStatus === 'AWAITING_BANK_DETAILS' && (
          <button
            type="button"
            onClick={() => handleOpenBankModal(appt)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition duration-150 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Submit Bank Details for Refund</span>
          </button>
        )}

        {appt.status !== 'CANCELLED' && (
          <Link
            to={`/patient/video-book/${appt.id}?doctorId=${appt.doctorId}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition duration-150 shadow-sm shadow-purple-200"
          >
            <Video className="w-4 h-4" />
            <span>Book Video Consultation</span>
          </Link>
        )}

        {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && !isPrevious && (
          <button
            type="button"
            onClick={() => handleOpenCancelModal(appt)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition duration-150 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Appointment</span>
          </button>
        )}
      </div>
    </div>
  );

  // Video Consultation Card
  const VideoAppointmentCard = ({ appt }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Card Header */}
        <div className="bg-purple-50/70 border-b border-purple-100 px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600">Video Consultation</span>
            <p className="font-bold text-slate-800 text-sm">{appt.appointmentNumber || `VIDEO-${appt.id}`}</p>
          </div>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(appt.status)}`}>
            {appt.status || "CONFIRMED"}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">
          {/* Doctor Profile Info with Image */}
          <div className="flex items-center gap-3.5">
            <img
              src={getDoctorImage(appt.doctorId)}
              alt={getDoctorName(appt.doctorId)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = defaultDocImg;
              }}
              className="w-13 h-13 rounded-full object-cover border-2 border-purple-200 shadow-sm shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Doctor</p>
              <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                {getDoctorName(appt.doctorId)}
              </h3>
              <p className="text-xs font-semibold text-purple-600 truncate mt-0.5">
                {getDoctorSpecialty(appt.doctorId)}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-purple-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Date</p>
                <p className="text-xs font-bold text-slate-700 truncate">{appt.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Time</p>
                <p className="text-xs font-bold text-slate-700 truncate">{formatTimeRange(appt.time)}</p>
              </div>
            </div>
          </div>

          {/* Hospital */}
          <div className="flex items-center gap-2.5 pt-1 border-t border-purple-50">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Hospital</p>
              <p className="text-xs font-medium text-slate-700 truncate">{getHospitalName(appt.hospitalId)}</p>
            </div>
          </div>

          {/* Consultation Type */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-50">
            <span className="text-slate-400 font-medium text-[11px]">Type</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-semibold rounded text-[11px]">
              VIDEO
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-5 pb-5 pt-1 space-y-2">
        {appt.status === "PAID" && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Payment completed successfully</span>
            </div>
            {appt.meetingLink ? (
              <a
                href={appt.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition duration-150"
              >
                <Video className="w-4 h-4" />
                <span>Join Zoom Meeting</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="text-center py-2 px-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-medium">
                Zoom meeting link will be available soon
              </div>
            )}
          </div>
        )}

        {appt.status === "CONFIRMED" && (
          <Link
            to={`/video-call/${appt.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition duration-150"
          >
            <Video className="w-4 h-4" />
            <span>Join Video Call</span>
          </Link>
        )}

        {appt.status === "PENDING" && (
          <div className="text-center py-2 px-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-medium">
            Payment Pending
          </div>
        )}

        {appt.status === "FAILED" && (
          <div className="text-center py-2 px-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
            Payment Failed
          </div>
        )}

        {appt.status === "CANCELLED" && (
          <div className="p-3 bg-rose-50/80 border border-rose-200/80 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-rose-800">
                Cancelled by: {appt.cancelledBy || 'Patient'}
              </span>
              {appt.refundStatus === 'REFUNDED' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {appt.refundPercentage}% Refunded
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                  Non-Refundable
                </span>
              )}
            </div>
            {appt.refundStatus === 'REFUNDED' && (
              <p className="text-slate-700 font-medium">
                Refund Amount: <strong className="text-emerald-700">LKR {Number(appt.refundAmount || 0).toFixed(2)}</strong>
              </p>
            )}
            {appt.refundReason && (
              <p className="text-slate-500 italic text-[11px] truncate">
                Reason: &ldquo;{appt.refundReason}&rdquo;
              </p>
            )}
          </div>
        )}

        {appt.status === "COMPLETED" && (
          <div className="text-center py-2 px-3 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium">
            Consultation Completed
          </div>
        )}

        {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
          <button
            type="button"
            onClick={() => handleOpenCancelModal(appt)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition duration-150 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Appointment</span>
          </button>
        )}
      </div>
    </div>
  );

  if (loading && videoLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and view your upcoming visits, past consultations, and video sessions
          </p>
        </div>
        <Link
          to="/find-doctor"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition duration-150 shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* Action Notification Alert */}
      {actionSuccessMessage && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-px">
          {/* Tab 1: Video Consultation */}
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'video'
                ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Consultation</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'video' ? 'bg-purple-200/70 text-purple-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {videoAppointments.length}
            </span>
          </button>

          {/* Tab 2: Upcoming Appointments */}
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'upcoming'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Upcoming Appointments</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'upcoming' ? 'bg-blue-200/70 text-blue-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {upcomingAppointments.length}
            </span>
          </button>

          {/* Tab 3: Previous Appointments */}
          <button
            onClick={() => setActiveTab('previous')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'previous'
                ? 'border-slate-600 text-slate-800 bg-slate-100/70 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Previous Appointments</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'previous' ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {previousAppointments.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      <div>
        {/* =====================================================
            1. VIDEO CONSULTATION SECTION
        ====================================================== */}
        {activeTab === 'video' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-purple-600 rounded-full"></span>
                Video Consultation Appointments
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {videoAppointments.length} {videoAppointments.length === 1 ? 'session' : 'sessions'}
              </span>
            </div>

            {videoLoading ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-purple-200 text-center">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-purple-600 text-sm font-medium">Loading video consultations...</p>
              </div>
            ) : videoAppointments.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No video consultations found</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                  You don't have any booked video consultations. You can book one from your physical appointment cards.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {videoAppointments.map((appt) => (
                  <VideoAppointmentCard key={appt.id} appt={appt} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            2. UPCOMING APPOINTMENTS SECTION
        ====================================================== */}
        {activeTab === 'upcoming' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-blue-600 rounded-full"></span>
                Upcoming Doctor Appointments
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {upcomingAppointments.length} {upcomingAppointments.length === 1 ? 'appointment' : 'appointments'}
              </span>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No upcoming appointments</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                  You have no scheduled upcoming physical appointments. Book a new appointment to see your doctor.
                </p>
                <div className="mt-4">
                  <Link
                    to="/find-doctor"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Find & Book Doctor</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {upcomingAppointments.map((appt) => (
                  <AppointmentCard key={appt.id} appt={appt} isPrevious={false} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            3. PREVIOUS APPOINTMENTS SECTION
        ====================================================== */}
        {activeTab === 'previous' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-slate-400 rounded-full"></span>
                Previous Appointments History
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {previousAppointments.length} {previousAppointments.length === 1 ? 'appointment' : 'appointments'}
              </span>
            </div>

            {previousAppointments.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No previous appointment history</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                  You have no past appointment records in the system yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {previousAppointments.map((appt) => (
                  <AppointmentCard key={appt.id} appt={appt} isPrevious={true} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* =====================================================
          CANCELLATION & REFUND PREVIEW MODAL
      ====================================================== */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-50 to-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Cancel Appointment</h3>
                  <p className="text-xs text-slate-500">
                    {selectedApptForCancel?.appointmentNumber || `Appt #${selectedApptForCancel?.id}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCancelModalOpen(false);
                  setSelectedApptForCancel(null);
                }}
                disabled={cancelling}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {cancelPreviewLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-medium">Calculating eligible refund based on hospital policy...</p>
                </div>
              ) : cancelError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Unable to Cancel Appointment</p>
                    <p>{cancelError}</p>
                  </div>
                </div>
              ) : cancelPreviewData ? (
                <div className="space-y-4">
                  {/* Appointment Details Recap */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Doctor:</span>
                      <span className="font-bold text-slate-800">{cancelPreviewData.doctorName || getDoctorName(selectedApptForCancel?.doctorId)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Facility:</span>
                      <span className="font-bold text-slate-800">{cancelPreviewData.hospitalName || getHospitalName(selectedApptForCancel?.hospitalId)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Schedule:</span>
                      <span className="font-bold text-slate-800">{cancelPreviewData.date} at {formatTimeRange(cancelPreviewData.time)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Notice Remaining:</span>
                      <span className="font-bold text-teal-700">{cancelPreviewData.hoursRemaining} hours ahead</span>
                    </div>
                  </div>

                  {/* Refund Calculation Box */}
                  <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-teal-900 border-b border-teal-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Percent className="w-4 h-4 text-teal-600" />
                        <span>Hospital Refund Policy Tier</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                        {cancelPreviewData.refundPercentage}% Refund
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Original Payment</span>
                        <span className="font-bold text-slate-800 text-sm">
                          LKR {Number(cancelPreviewData.originalPayment || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[11px]">Eligible Refund</span>
                        <span className="font-extrabold text-emerald-700 text-base">
                          LKR {Number(cancelPreviewData.eligibleRefund || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-teal-800/90 pt-1 border-t border-teal-100/80">
                      {cancelPreviewData.message}
                    </p>
                  </div>

                  {/* Reason Textarea */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Reason for cancellation (optional):
                    </label>
                    <textarea
                      rows={2}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="e.g., Unexpected schedule conflict, feeling unwell..."
                      className="w-full text-xs border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                    />
                  </div>

                  {/* Irreversible Caution */}
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Cancellation is final. Your appointment slot will be released immediately.</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCancelModalOpen(false);
                  setSelectedApptForCancel(null);
                }}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Keep Appointment
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling || cancelPreviewLoading || !!cancelError}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm shadow-rose-200 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {cancelling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Cancellation...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PATIENT BANK DETAILS MODAL FOR REFUND
      ====================================================== */}
      {bankModalOpen && selectedApptForBank && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-50 to-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Provide Bank Account Details</h3>
                  <p className="text-xs text-slate-500">
                    For Refund of {selectedApptForBank?.appointmentNumber || `Appt #${selectedApptForBank?.id}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBankModalOpen(false);
                  setSelectedApptForBank(null);
                }}
                disabled={submittingBank}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitBankDetails} className="p-6 space-y-4">
              {/* Refund Info Banner */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-emerald-800 font-semibold block">Eligible Refund Due</span>
                  <span className="text-slate-500 text-[11px]">
                    {selectedApptForBank.refundPercentage}% of original payment
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-emerald-700 block">
                    LKR {Number(selectedApptForBank.refundAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {bankError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bankError}</span>
                </div>
              )}

              {bankSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{bankSuccess}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Holder Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                    placeholder="e.g., John D. Silva"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Bank Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      placeholder="e.g., Commercial Bank"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Branch Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.bankBranchName}
                      onChange={(e) => setBankForm({ ...bankForm, bankBranchName: e.target.value })}
                      placeholder="e.g., Colombo Main"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bank Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    placeholder="Enter full account number"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.confirmAccountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, confirmAccountNumber: e.target.value })}
                    placeholder="Re-enter account number to confirm"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>
                    Your account details will be masked and accessed only by authorized hospital administrators to complete your manual refund transfer.
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBankModalOpen(false);
                    setSelectedApptForBank(null);
                  }}
                  disabled={submittingBank}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingBank || !!bankSuccess}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm shadow-amber-200 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {submittingBank ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting Details...</span>
                    </>
                  ) : (
                    <span>Submit Bank Details</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientAppointments;