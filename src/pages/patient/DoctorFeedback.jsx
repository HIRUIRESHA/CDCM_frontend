import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed

// --- UI Components for the Form ---

function HeartRating({ rating, setRating }) {
  return (
    <div className="flex gap-3 mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className={`w-12 h-12 flex items-center justify-center rounded-lg border-4 transition-colors ${
            rating >= star
              ? "border-gray-400 bg-gray-100"
              : "border-gray-300 bg-white hover:border-gray-400"
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={rating >= star ? "#9ca3af" : "none"} // gray-400
            stroke="#9ca3af"
            strokeWidth="2"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function MiniDoctorCard({ doctor, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 cursor-pointer transition-all border-2 ${
        isSelected
          ? "border-blue-400 shadow-md ring-2 ring-blue-50"
          : "border-gray-100 shadow-sm hover:border-gray-300"
      }`}
    >
      <div className="flex gap-3">
        <img
          src={doctor.image || "https://randomuser.me/api/portraits/women/44.jpg"}
          alt={doctor.name}
          className="w-14 h-14 rounded-lg object-cover shrink-0"
        />
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold text-gray-900">{doctor.name}</p>
          <p className="text-xs text-blue-500 font-medium">{doctor.specialty}</p>
          <p className="text-xs text-gray-500">{doctor.experience}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              {doctor.rating}%
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              {doctor.patients} Patient Stories
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-[10px] text-blue-500 font-semibold">Next Available</p>
        <p className="text-xs font-bold text-gray-800">{doctor.nextAvailable}</p>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function DoctorFeedback() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Data State
  const [doctorList, setDoctorList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the patient's booked doctors on load
  useEffect(() => {
    const fetchBookedDoctors = async () => {
      if (!user || !user.id) return;

      try {
        const token = localStorage.getItem("token");
        const authHeaders = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [apptRes, docsRes] = await Promise.all([
          fetch(`http://localhost:8082/api/appointments/patient/${user.id}`, { headers: authHeaders }),
          fetch("http://localhost:8082/api/hospital/doctors/assigned-all"),
        ]);

        if (apptRes.ok && docsRes.ok) {
          const appointments = await apptRes.json();
          const allDoctors = await docsRes.json();

          const uniqueDoctorIds = [...new Set(appointments.map((appt) => appt.doctorId))];
          const bookedDoctorsData = allDoctors.filter((doc) => uniqueDoctorIds.includes(doc.id));

          const formattedDoctors = bookedDoctorsData.map((doc) => ({
            id: doc.id,
            name: `${doc.title || ""} ${doc.firstName || ""} ${doc.lastName || ""}`.trim() || "Unknown Doctor",
            specialty: doc.specialization || "Specialist Medicine",
            experience: doc.experience || "6 Years experience",
            rating: 87,
            patients: 69,
            nextAvailable: "10:00 AM tomorrow",
            image: doc.profileImage || "https://randomuser.me/api/portraits/women/44.jpg",
          }));

          setDoctorList(formattedDoctors);
        }
      } catch (error) {
        console.error("Error fetching doctors for feedback:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookedDoctors();
  }, [user]);

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      alert("Please select a doctor to leave feedback for.");
      return;
    }
    if (rating === 0) {
      alert("Please provide an overall rating.");
      return;
    }

    const feedbackData = {
      patientId: user.id,
      doctorId: selectedDoctorId,
      rating: rating,
      comment: feedback,
    };

    try {
      const token = localStorage.getItem("token");
      
      // 👇 THIS IS THE NEW FETCH CALL THAT SAVES TO MONGODB 👇
      const response = await fetch("http://localhost:8082/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include if your backend requires auth here
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      alert("Feedback submitted successfully!");
      navigate("/patient/my-doctors"); // Route back to the doctors page
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("There was an error saving your feedback. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white p-10 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Doctor Feedback</h1>
        <p className="text-gray-600 text-sm">Share your experience with your healthcare providers</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        {/* Main Card */}
        <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-8 w-full max-w-4xl shadow-sm">
          <h2 className="text-xl font-medium text-gray-800 mb-6">Submit Your Feedback</h2>

          {/* Section 1: Select Doctor */}
          <div className="mb-8">
            <h3 className="text-sm text-gray-700 mb-4">Select Doctor</h3>
            {isLoading ? (
              <p className="text-gray-500 text-sm">Loading your doctors...</p>
            ) : doctorList.length === 0 ? (
              <p className="text-gray-500 text-sm">You haven't booked any doctors yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctorList.map((doctor) => (
                  <MiniDoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    isSelected={selectedDoctorId === doctor.id}
                    onClick={() => setSelectedDoctorId(doctor.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Overall Rating */}
          <div className="mb-8">
            <h3 className="text-sm text-gray-700 mb-2">Overall Rating</h3>
            <HeartRating rating={rating} setRating={setRating} />
          </div>

          {/* Section 3: Feedback Text */}
          <div>
            <h3 className="text-sm text-gray-700 mb-3">Your Feedback</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add your feedback here"
              className="w-full h-40 p-4 border border-gray-400 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none text-gray-700"
              required
            ></textarea>
          </div>
        </div>

        {/* Submit Button (Outside the card, centered at bottom) */}
        <div className="mt-8">
          <button
            type="submit"
            className="bg-[#90CAF9] hover:bg-[#64B5F6] text-black font-semibold py-3 px-10 rounded-full transition-colors shadow-sm"
          >
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
}