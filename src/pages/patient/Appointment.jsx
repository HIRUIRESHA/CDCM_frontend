import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [videoAppointments, setVideoAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);

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

  const getDoctorName = (doctorId) => {
    const doc = doctors.find(d => d.id === doctorId);
    return doc ? `${doc.title || ''} ${doc.firstName || ''} ${doc.lastName || ''}`.trim() : "Unknown Doctor";
  };

  const getHospitalName = (hospitalId) => {
    const hosp = hospitals.find(h => h.id === hospitalId);
    return hosp ? hosp.name : "Unknown Hospital";
  };

  // Reusable component for the Appointment Card to keep code clean
  const AppointmentCard = ({ appt }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className={`${appt.date < today ? 'bg-gray-500' : 'bg-blue-600'} px-5 py-3 text-white flex justify-between items-center`}>
        <span className="font-bold tracking-wider text-lg">{appt.appointmentNumber}</span>
        <span className="px-3 py-1 bg-white/20 text-xs rounded-full font-semibold uppercase tracking-wide">
          {appt.status}
        </span>
      </div>
      <div className="p-5 space-y-5">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 text-xl">📅</div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Date & Time</p>
            <p className="font-bold text-gray-800">{appt.date}</p>
            <p className="text-sm text-gray-600">{appt.time}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-green-100 p-2.5 rounded-lg text-green-600 text-xl">👨‍⚕️</div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Doctor</p>
            <p className="font-bold text-gray-800">{getDoctorName(appt.doctorId)}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-red-100 p-2.5 rounded-lg text-red-600 text-xl">🏥</div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Hospital</p>
            <p className="font-bold text-gray-800">{getHospitalName(appt.hospitalId)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
// VIDEO APPOINTMENT CARD
// ============================================================

const VideoAppointmentCard = ({ appt }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-100 hover:shadow-lg transition-shadow duration-300">

    {/* Header */}
    <div className="bg-purple-600 px-5 py-3 text-white flex justify-between items-center">

      <div>
        <span className="font-bold tracking-wider text-lg">
          {appt.appointmentNumber || `VIDEO-${appt.id}`}
        </span>

        <p className="text-xs text-purple-100 mt-1">
          Video Consultation
        </p>
      </div>

      <span className="px-3 py-1 bg-white/20 text-xs rounded-full font-semibold uppercase tracking-wide">
        {appt.status}
      </span>

    </div>


    {/* Details */}
    <div className="p-5 space-y-5">

      {/* Date & Time */}
      <div className="flex items-start gap-4">

        <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600 text-xl">
          📹
        </div>

        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
            Date & Time
          </p>

          <p className="font-bold text-gray-800">
            {appt.date}
          </p>

          <p className="text-sm text-gray-600">
            {appt.time}
          </p>
        </div>

      </div>


      {/* Doctor */}
      <div className="flex items-start gap-4">

        <div className="bg-green-100 p-2.5 rounded-lg text-green-600 text-xl">
          👨‍⚕️
        </div>

        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
            Doctor
          </p>

          <p className="font-bold text-gray-800">
            {getDoctorName(appt.doctorId)}
          </p>
        </div>

      </div>


      {/* Hospital */}
      <div className="flex items-start gap-4">

        <div className="bg-red-100 p-2.5 rounded-lg text-red-600 text-xl">
          🏥
        </div>

        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
            Hospital
          </p>

          <p className="font-bold text-gray-800">
            {getHospitalName(appt.hospitalId)}
          </p>
        </div>

      </div>


      {/* Consultation Type */}
      <div className="flex items-center justify-between">

        <span className="text-sm text-gray-500">
          Consultation Type
        </span>

        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
          VIDEO
        </span>

      </div>

    </div>


    {/* Actions */}
    <div className="px-5 pb-5">

     {appt.status === "PAID" && (
  <div className="space-y-2">

    <p className="text-xs text-green-600 mb-2">
      ✓ Payment completed successfully
    </p>

    {appt.meetingLink ? (
      <a
        href={appt.meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
      >
        🎥 Join Zoom Meeting
      </a>
    ) : (
      <span className="block w-full text-center bg-yellow-100 text-yellow-700 py-2 rounded-lg text-sm font-medium">
        Zoom meeting link will be available soon
      </span>
    )}

  </div>
)}

      {/* CONFIRMED */}
      {appt.status === "CONFIRMED" && (
        <Link
          to={`/video-call/${appt.id}`}
          className="block text-center w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          🎥 Join Video Call
        </Link>
      )}


      {/* PENDING */}
      {appt.status === "PENDING" && (
        <div className="text-center">

          <p className="text-xs text-yellow-600 mb-2">
            Payment is pending
          </p>

          <span className="block w-full bg-yellow-100 text-yellow-700 py-2 rounded-lg text-sm font-medium">
            Payment Pending
          </span>

        </div>
      )}


      {/* FAILED */}
      {appt.status === "FAILED" && (
        <div className="text-center">

          <p className="text-xs text-red-500 mb-2">
            Payment failed
          </p>

          <span className="block w-full bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium">
            Payment Failed
          </span>

        </div>
      )}


      {/* COMPLETED */}
      {appt.status === "COMPLETED" && (
        <span className="block w-full text-center bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium">
          Consultation Completed
        </span>
      )}

    </div>

  </div>
);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600 text-lg animate-pulse">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
        <Link 
          to="/find-doctor" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 transition font-medium flex items-center gap-2"
        >
          <span>+</span> Book Appointment
        </Link>
      </div>
      
      {appointments.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-200">
          <p className="text-gray-500 text-lg mb-4">You don't have any booked appointments yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              
              <div className="bg-blue-600 px-5 py-3 text-white flex justify-between items-center">
                <span className="font-bold tracking-wider text-lg">{appt.appointmentNumber}</span>
                <span className="px-3 py-1 bg-blue-500 text-xs rounded-full font-semibold uppercase tracking-wide">
                  {appt.status}
                </span>
              </div>
              
              <div className="p-5 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 text-xl">📅</div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Date & Time</p>
                    <p className="font-bold text-gray-800">{appt.date}</p>
                    <p className="text-sm text-gray-600">{appt.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2.5 rounded-lg text-green-600 text-xl">👨‍⚕️</div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Doctor</p>
                    <p className="font-bold text-gray-800">{getDoctorName(appt.doctorId)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-2.5 rounded-lg text-red-600 text-xl">🏥</div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Hospital</p>
                    <p className="font-bold text-gray-800">{getHospitalName(appt.hospitalId)}</p>
                  </div>
                </div>
              </div>
              {/* ✅ ACTION SECTION */}
<div className="px-5 pb-5 space-y-2">

  {/* Consultation Type */}
  <p className="text-sm text-gray-500">
    Type: {appt.consultationType || "PHYSICAL"}
  </p>

  {/* ✅ Video Consultation Button (not for cancelled) */}
  <Link
  to={`/patient/video-book/${appt.id}?doctorId=${appt.doctorId}`}
  className="block text-center w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
>
  Video Consultation
</Link>

  {/* ⚠️ Message if not completed */}
  {appt.consultationType === "PHYSICAL" &&
   appt.status !== "COMPLETED" && (
    <p className="text-xs text-red-500">
      Complete physical appointment first to request video consultation
    </p>
  )}

  {/* ✅ Join Video Call */}
  {appt.consultationType === "VIDEO" &&
   appt.status === "CONFIRMED" && (
    <Link
      to={`/video-call/${appt.id}`}
      className="block text-center w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
    >
      Join Video Call
    </Link>
  )}

</div>
            </div>
          ))}
        </div>
           )}

      {/* =====================================================
          VIDEO CONSULTING SECTION
      ====================================================== */}

      <section className="mb-12">

        <h2 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">

          <span className="w-2 h-8 bg-purple-600 rounded-full"></span>

          🎥 Video Consulting

        </h2>


        {videoLoading ? (

          <div className="bg-white p-6 rounded-xl border border-dashed border-purple-300 text-center">

            <p className="text-purple-500 animate-pulse">
              Loading video consultations...
            </p>

          </div>

        ) : videoAppointments.length === 0 ? (

          <div className="bg-white p-8 rounded-xl border border-dashed border-purple-300 text-center">

            <div className="text-4xl mb-3">
              🎥
            </div>

            <p className="text-gray-500 text-lg">
              No video consultations booked yet.
            </p>

            <p className="text-gray-400 text-sm mt-2">
              Complete a physical appointment and use the
              "Video Consultation" button to book one.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {videoAppointments.map((appt) => (
              <VideoAppointmentCard
                key={appt.id}
                appt={appt}
              />
            ))}

          </div>

        )}

      </section>


      {/* --- UPCOMING SECTION --- */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
          Upcoming Appointments
        </h2>
        {upcomingAppointments.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-400">No upcoming appointments scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {upcomingAppointments.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
          </div>
        )}
      </section>

      {/* --- PREVIOUS SECTION --- */}
      <section>
        <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-gray-400 rounded-full"></span>
          Previous Appointments
        </h2>
        {previousAppointments.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-400">No previous appointment history found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {previousAppointments.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
          </div>
        )}
      </section>
    </div>
  );
}

export default PatientAppointments;