import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom'; // ✅ Import Link for smooth navigation

function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

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
          setAppointments(apptData);
        } else {
          console.error("Failed to fetch appointments. Status:", apptRes.status);
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

  const getDoctorName = (doctorId) => {
    const doc = doctors.find(d => d.id === doctorId);
    return doc ? `${doc.title || ''} ${doc.firstName || ''} ${doc.lastName || ''}`.trim() : "Unknown Doctor";
  };

  const getHospitalName = (hospitalId) => {
    const hosp = hospitals.find(h => h.id === hospitalId);
    return hosp ? hosp.name : "Unknown Hospital";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600 text-lg animate-pulse">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* ✅ Updated Header Section with the new button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
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
    </div>
  );
}

export default PatientAppointments;