import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import defaultDocImg from "../../assets/doc1.png";
import { ArrowLeft, Check, Heart, Stethoscope, MessageSquare } from "lucide-react";

// --- Rating Component for the Form ---
function HeartRating({ rating, setRating }) {
  return (
    <div className="flex gap-2 sm:gap-3 mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border-2 transition-all cursor-pointer ${
            rating >= star
              ? "border-rose-400 bg-rose-50 text-rose-500 scale-105 shadow-xs"
              : "border-slate-200 bg-white text-slate-300 hover:border-slate-300 hover:text-slate-400"
          }`}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Heart
            className={`w-6 h-6 transition-transform ${
              rating >= star ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// Doctor Card in Feedback Section - Displays ONLY:
// 1. Doctor Profile Image
// 2. Doctor Name
// 3. Doctor Specialization
function FeedbackDoctorCard({ doctor, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-5 cursor-pointer transition-all duration-200 border-2 flex flex-col items-center text-center ${
        isSelected
          ? "border-blue-600 shadow-md ring-2 ring-blue-100 bg-blue-50/20"
          : "border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* 1. Doctor Profile Image */}
      <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-blue-100 shadow-2xs mb-3 flex items-center justify-center shrink-0">
        <img
          src={doctor.image || defaultDocImg}
          alt={doctor.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultDocImg;
          }}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 2. Doctor Name */}
      <h4 className="font-bold text-slate-900 text-sm md:text-base leading-tight truncate w-full">
        {doctor.name}
      </h4>

      {/* 3. Doctor Specialization */}
      <p className="text-xs font-semibold text-blue-600 truncate w-full mt-1">
        {doctor.specialty}
      </p>
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data State
  const [doctorList, setDoctorList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the patient's booked doctors on load
  useEffect(() => {
    const fetchBookedDoctors = async () => {
      if (!user || !user.id) {
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const authHeaders = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        };

        const [apptRes, docsRes] = await Promise.all([
          fetch(`http://localhost:8082/api/appointments/patient/${user.id}`, {
            headers: authHeaders
          }),
          fetch("http://localhost:8082/api/hospital/doctors/assigned-all")
        ]);

        if (apptRes.ok && docsRes.ok) {
          const appointments = await apptRes.json();
          const allDoctors = await docsRes.json();

          const uniqueDoctorIds = [
            ...new Set(
              (Array.isArray(appointments) ? appointments : [])
                .map((appt) => appt.doctorId)
                .filter(Boolean)
            )
          ];
          const bookedDoctorsData = (
            Array.isArray(allDoctors) ? allDoctors : []
          ).filter((doc) => uniqueDoctorIds.includes(doc.id));

          // Extract ONLY genuine fields: Profile Image, Doctor Name, Specialization
          const formattedDoctors = bookedDoctorsData.map((doc) => {
            let docName = "Doctor";
            if (doc.title || doc.firstName || doc.lastName) {
              const fullName = [doc.title, doc.firstName, doc.lastName]
                .filter(Boolean)
                .join(" ")
                .trim();
              docName = fullName.startsWith("Dr") ? fullName : `Dr. ${fullName}`;
            } else if (doc.name) {
              docName = doc.name.startsWith("Dr") ? doc.name : `Dr. ${doc.name}`;
            }

            return {
              id: doc.id,
              name: docName,
              specialty: doc.specialization || doc.specialty || "Specialist",
              image: doc.profileImage || doc.image || ""
            };
          });

          setDoctorList(formattedDoctors);
          if (formattedDoctors.length > 0) {
            setSelectedDoctorId(formattedDoctors[0].id);
          }
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
      comment: feedback
    };

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8082/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      alert("Feedback submitted successfully!");
      navigate("/patient/my-doctors");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("There was an error saving your feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans max-w-4xl mx-auto space-y-6">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span>Doctor Feedback</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Share your experience and review the care provided by your doctors
          </p>
        </div>
        <Link
          to="/patient/my-doctors"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-xs bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Doctors</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
          {/* Section 1: Select Doctor */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  1. Select Doctor
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the doctor you would like to submit feedback for
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-500 font-medium">
                  Loading your doctors...
                </p>
              </div>
            ) : doctorList.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center">
                <Stethoscope className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  No doctors found
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  You can provide feedback once you have consulted with a doctor.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {doctorList.map((doctor) => (
                  <FeedbackDoctorCard
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
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              2. Overall Rating
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              How would you rate your overall consultation experience?
            </p>
            <HeartRating rating={rating} setRating={setRating} />
          </div>

          {/* Section 3: Feedback Text */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              3. Your Feedback
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Write your review or notes about the doctor's service
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about your consultation, punctuality, treatment advice..."
              className="w-full h-36 p-4 border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-800 text-sm transition-all"
              required
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || doctorList.length === 0}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-sm shadow-blue-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </form>
    </div>
  );
}