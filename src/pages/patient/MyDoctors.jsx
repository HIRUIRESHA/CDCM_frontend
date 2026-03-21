import { useState, useEffect } from "react";
import { useAuth } from '../../context/AuthContext'; // ✅ Added AuthContext
import { useNavigate } from "react-router-dom";

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#e53e3e" : "none"} stroke={filled ? "#e53e3e" : "#aaa"} strokeWidth="1.8">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function DoctorCard({ doctor, onToggleLike }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative">
      <button
        onClick={() => onToggleLike(doctor.id)}
        className="absolute top-4 right-4 p-1 cursor-pointer bg-transparent border-none"
        aria-label="Toggle favorite"
      >
        <HeartIcon filled={doctor.liked} />
      </button>

      <div className="flex gap-3 mb-4">
        <img
          src={doctor.image || "https://via.placeholder.com/150"} 
          alt={doctor.name}
          className="w-16 h-16 rounded-xl object-cover shrink-0"
        />
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold text-gray-900">{doctor.name}</p>
          <p className="text-xs font-semibold text-blue-500 mt-0.5">{doctor.specialty}</p>
          <p className="text-xs text-gray-400 mt-0.5">{doctor.experience}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-600">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              {doctor.rating}%
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-600">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              {doctor.patients} Patient Stories
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div>
          <p className="text-xs font-semibold text-blue-500">Next Available</p>
          <p className="text-xs font-bold text-gray-700 mt-0.5">{doctor.nextAvailable}</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer">
          Book Again
        </button>
      </div>
    </div>
  );
}

export default function MyDoctors() {
  const { user } = useAuth(); // ✅ Get the logged-in user
  const navigate = useNavigate();
  const [doctorList, setDoctorList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookedDoctors = async () => {
      if (!user || !user.id) return; // ✅ Wait for user to load

      try {
        const token = localStorage.getItem('token');
        const authHeaders = {
          "Authorization": `Bearer ${token}`, // ✅ Added security token
          "Content-Type": "application/json"
        };

        // ✅ 1. Fetch appointments and doctors simultaneously (just like PatientAppointments.jsx)
        const [apptRes, docsRes] = await Promise.all([
          fetch(`http://localhost:8082/api/appointments/patient/${user.id}`, { headers: authHeaders }),
          fetch("http://localhost:8082/api/hospital/doctors/assigned-all")
        ]);

        if (!apptRes.ok) throw new Error("Failed to fetch your appointments");
        if (!docsRes.ok) throw new Error("Failed to fetch doctors list");

        const appointments = await apptRes.json();
        const allDoctors = await docsRes.json();

        // 2. Extract unique doctor IDs from appointments
        const uniqueDoctorIds = [...new Set(appointments.map(appt => appt.doctorId))];

        if (uniqueDoctorIds.length === 0) {
          setDoctorList([]);
          setIsLoading(false);
          return;
        }

        // 3. Find the matching doctors from the allDoctors list
        const bookedDoctorsData = allDoctors.filter(doc => uniqueDoctorIds.includes(doc.id));

        // ✅ 4. Format the data to match DoctorCard (handling firstName/lastName properly)
        const formattedDoctors = bookedDoctorsData.map(doc => ({
          id: doc.id,
          name: `${doc.title || ''} ${doc.firstName || ''} ${doc.lastName || ''}`.trim() || "Unknown Doctor",
          specialty: doc.specialization || "General Medicine", 
          experience: doc.experience || "Experience unlisted",
          rating: 90, // Fallback if not in DB
          patients: 120, // Fallback if not in DB
          nextAvailable: "Check availability", 
          liked: false,
          image: doc.profileImage || "https://randomuser.me/api/portraits/med/men/1.jpg"
        }));

        setDoctorList(formattedDoctors);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookedDoctors();
  }, [user]); // ✅ Re-run if user context changes

  const toggleLike = (id) => {
    setDoctorList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, liked: !d.liked } : d))
    );
  };

  return (
    <div className="flex-1 bg-white min-h-screen p-10">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">My Doctors</h1>

      {isLoading && <p className="text-gray-500 font-medium">Loading your doctors...</p>}
      {error && <p className="text-red-500 font-medium">Error: {error}</p>}

      {!isLoading && !error && doctorList.length === 0 && (
        <p className="text-gray-500 font-medium">You haven't booked any doctors yet.</p>
      )}

      {!isLoading && !error && doctorList.length > 0 && (
        <div className="grid grid-cols-2 gap-5 max-w-2xl">
          {doctorList.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} onToggleLike={toggleLike} />
          ))}
        </div>
      )}

      <div className="flex justify-end max-w-2xl mt-12">
        <button 
          // 👇 Add this onClick 👇
          onClick={() => navigate('/patient/add-feedback')}
          className="bg-blue-200 hover:bg-blue-300 text-blue-900 font-extrabold px-8 py-3 rounded-full text-sm transition-colors cursor-pointer"
        >
          Add Feedback
        </button>
      </div>
    </div>
  );
}