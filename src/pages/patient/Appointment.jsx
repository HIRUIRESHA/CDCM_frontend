import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
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
  CalendarCheck
} from 'lucide-react';

function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [videoAppointments, setVideoAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'video' | 'upcoming' | 'previous'

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
          fetch(`http://localhost:8082/api/appointments/patient/${user.id}`, {
            headers: authHeaders
          }),
          fetch("http://localhost:8082/api/hospital/doctors/assigned-all"),
          fetch("http://localhost:8082/api/hospital/doctors/all-hospitals")
        ]);

        if (apptRes.ok) {
          const apptData = await apptRes.json();

          // Keep VIDEO appointments out of the normal appointments section
          const normalAppointments = Array.isArray(apptData)
            ? apptData.filter(
              appt => appt.consultationType !== "VIDEO"
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
          `http://localhost:8082/api/video-appointments/patient/${user.id}`,
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
  const today = new Date().toISOString().split('T')[0];

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
                <p className="text-xs font-bold text-slate-700 truncate">{appt.time}</p>
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

      {/* Card Action */}
      <div className="px-5 pb-5 pt-1">
        <Link
          to={`/patient/video-book/${appt.id}?doctorId=${appt.doctorId}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition duration-150 shadow-sm shadow-purple-200"
        >
          <Video className="w-4 h-4" />
          <span>Book Video Consultation</span>
        </Link>
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
                <p className="text-xs font-bold text-slate-700 truncate">{appt.time}</p>
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

        {appt.status === "COMPLETED" && (
          <div className="text-center py-2 px-3 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium">
            Consultation Completed
          </div>
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
    </div>
  );
}

export default PatientAppointments;