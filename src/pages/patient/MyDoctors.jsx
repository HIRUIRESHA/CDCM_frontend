import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import defaultDocImg from "../../assets/doc1.png";
import axios from "axios";
import {
  Stethoscope,
  Building2,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  Heart,
  Calendar,
  Clock,
  Plus,
  MessageSquarePlus,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  X,
  CalendarDays
} from "lucide-react";

export default function MyDoctors() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [doctorList, setDoctorList] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [likedDoctorIds, setLikedDoctorIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // In-page schedule slots state
  const [expandedDoctorId, setExpandedDoctorId] = useState(null);
  const [doctorSchedules, setDoctorSchedules] = useState({});
  const [loadingSchedules, setLoadingSchedules] = useState({});

  // Booking modal states (using existing application booking logic)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingDoc, setBookingDoc] = useState(null);
  const [bookingSchedule, setBookingSchedule] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchBookedDoctorsAndHospitals = async () => {
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

        // Fetch appointments, doctors, and hospitals simultaneously
        const [apptRes, docsRes, hospsRes] = await Promise.all([
          fetch(`http://localhost:8082/api/appointments/patient/${user.id}`, {
            headers: authHeaders
          }),
          fetch("http://localhost:8082/api/hospital/doctors/assigned-all"),
          fetch("http://localhost:8082/api/hospital/doctors/all-hospitals")
        ]);

        if (!apptRes.ok) throw new Error("Failed to fetch your appointments");
        if (!docsRes.ok) throw new Error("Failed to fetch doctors list");

        const appointments = await apptRes.json();
        const allDoctors = await docsRes.json();
        let allHospitals = [];
        if (hospsRes.ok) {
          allHospitals = await hospsRes.json();
          setHospitals(Array.isArray(allHospitals) ? allHospitals : []);
        }

        // Extract unique doctor IDs from appointments
        const uniqueDoctorIds = [
          ...new Set(
            (Array.isArray(appointments) ? appointments : [])
              .map((appt) => appt.doctorId)
              .filter(Boolean)
          )
        ];

        if (uniqueDoctorIds.length === 0) {
          setDoctorList([]);
          setIsLoading(false);
          return;
        }

        // Find the matching doctors from the allDoctors list
        const bookedDoctorsData = (
          Array.isArray(allDoctors) ? allDoctors : []
        ).filter((doc) => uniqueDoctorIds.includes(doc.id));

        // Format data using strictly genuine fields from the API without any hardcoded mock data
        const formattedDoctors = bookedDoctorsData.map((doc) => {
          const docHospitalIds = Array.isArray(doc.hospitals)
            ? doc.hospitals
            : doc.hospitals
              ? [doc.hospitals]
              : [];

          const hospitalNames = docHospitalIds
            .map((hId) => {
              const matched = allHospitals.find(
                (h) => h.id === hId || h._id === hId
              );
              return matched ? matched.name : hId;
            })
            .filter(Boolean);

          return {
            id: doc.id,
            rawDoctor: doc,
            name:
              [doc.title, doc.firstName, doc.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() || "Doctor",
            firstName: doc.firstName || "",
            lastName: doc.lastName || "",
            title: doc.title || "",
            specialization: doc.specialization || doc.specialty || "",
            experience: doc.experience || "",
            qualifications: Array.isArray(doc.qualifications)
              ? doc.qualifications
              : doc.qualifications
                ? [doc.qualifications]
                : [],
            hospitalNames: hospitalNames,
            phone: doc.phone || "",
            email: doc.email || "",
            profileImage: doc.profileImage || doc.image || ""
          };
        });

        setDoctorList(formattedDoctors);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookedDoctorsAndHospitals();
  }, [user]);

  // ============================================================
  // IN-PAGE FETCH APPOINTMENT SLOTS FOR SELECTED DOCTOR
  // ============================================================
  const toggleDoctorSlots = async (doctor) => {
    const doctorId = doctor.id;

    if (expandedDoctorId === doctorId) {
      // Collapse
      setExpandedDoctorId(null);
      return;
    }

    // Expand
    setExpandedDoctorId(doctorId);

    // Fetch schedules if not already loaded
    if (!doctorSchedules[doctorId]) {
      setLoadingSchedules((prev) => ({ ...prev, [doctorId]: true }));
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await fetch(
          `http://localhost:8082/api/schedules/doctor/${doctorId}`
        );

        if (res.ok) {
          const schedData = await res.json();
          const validSlots = Array.isArray(schedData)
            ? schedData.filter(
              (s) =>
                s.status === "ACCEPTED" &&
                s.date >= today &&
                s.type === "PHYSICAL"
            )
            : [];
          setDoctorSchedules((prev) => ({ ...prev, [doctorId]: validSlots }));
        } else {
          setDoctorSchedules((prev) => ({ ...prev, [doctorId]: [] }));
        }
      } catch (err) {
        console.error("Error fetching schedules for doctor:", err);
        setDoctorSchedules((prev) => ({ ...prev, [doctorId]: [] }));
      } finally {
        setLoadingSchedules((prev) => ({ ...prev, [doctorId]: false }));
      }
    }
  };

  // ============================================================
  // OPEN BOOKING MODAL (EXISTING BOOKING FLOW)
  // ============================================================
  const handleSelectSlot = async (doctor, schedule) => {
    if (!user || user.role !== "PATIENT") {
      navigate("/login", { state: { from: "/patient/my-doctors" } });
      return;
    }

    setBookingDoc(doctor);
    setBookingSchedule(schedule);
    setIsModalOpen(true);

    try {
      const response = await fetch(
        `http://localhost:8082/api/appointments/schedule/${schedule.id}`
      );
      if (response.ok) {
        const data = await response.json();
        const takenNumbers = data.map((appt) => appt.appointmentNumber);

        let nextAvailable = null;
        for (let i = 1; i <= 30; i++) {
          const formatted = `APT-${String(i).padStart(3, "0")}`;
          if (!takenNumbers.includes(formatted)) {
            nextAvailable = i.toString();
            break;
          }
        }
        setSelectedNumber(nextAvailable);
      }
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  };

  // ============================================================
  // CONFIRM BOOKING & PAYMENT (EXISTING PAYHERE INTEGRATION)
  // ============================================================
  const confirmBooking = async () => {
    if (!selectedNumber || !bookingDoc || !bookingSchedule) return;

    try {
      const token = localStorage.getItem("token");

      // 1. Create Appointment Record
      const response = await fetch("http://localhost:8082/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: user.id,
          doctorId: bookingDoc.id,
          hospitalId: bookingSchedule.hospitalId,
          scheduleId: bookingSchedule.id,
          date: bookingSchedule.date,
          time: `${bookingSchedule.startTime} - ${bookingSchedule.endTime}`,
          appointmentNumber: selectedNumber
        })
      });

      if (response.ok) {
        const appointmentData = await response.json();
        const orderId = appointmentData.id;
        const amount = appointmentData.amount || 1000.0;

        // Fetch Secure Hash from Backend
        const hashRes = await axios.get(
          `http://localhost:8082/api/payments/generate-hash/${orderId}/${amount}`
        );
        const hashData = hashRes.data;

        // Prepare PayHere Payment Object
        const payment = {
          sandbox: true,
          merchant_id: hashData.merchantId,
          return_url: "http://localhost:5173/payment-success",
          cancel_url: "http://localhost:5173/payment-failed",
          notify_url: "http://localhost:8082/api/payments/notify",
          order_id: orderId,
          items: `Booking with Dr. ${bookingDoc.firstName || bookingDoc.name}`,
          amount: hashData.amount,
          currency: hashData.currency,
          hash: hashData.hash,
          custom_1: user.id || user._id,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email || "patient@example.com",
          phone: user.phone || "0771234567",
          address: "Galle Road",
          city: "Colombo",
          country: "Sri Lanka"
        };

        // Define Callbacks
        window.payhere.onCompleted = async function onCompleted(completedOrderId) {
          try {
            const confirmRes = await axios.post(
              `http://localhost:8082/api/payments/payment-success/${completedOrderId}`,
              {
                payhereId: completedOrderId,
                amount: amount
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            if (confirmRes.data && confirmRes.data.success !== false) {
              setIsModalOpen(false);
              setNotification({
                type: "success",
                title: "Payment Successful!",
                message: "Your appointment has been confirmed and paid.",
                apptNumber: appointmentData.appointmentNumber
              });
            } else {
              setIsModalOpen(false);
              setNotification({
                type: "error",
                title: "Payment Confirmation Issue",
                message:
                  "Payment was processed, but server confirmation reported an issue. Please check your Payment History."
              });
            }
          } catch (err) {
            console.error("Backend payment confirmation error:", err);
            setIsModalOpen(false);
            setNotification({
              type: "error",
              title: "Payment Confirmation Issue",
              message:
                "Payment succeeded with PayHere, but failed to record in the system. Please check your Payment History."
            });
          }
        };

        window.payhere.onDismissed = function onDismissed() {
          setIsModalOpen(false);
          setNotification({
            type: "error",
            title: "Payment Incomplete",
            message:
              "You closed the payment window. Your appointment remains pending until payment is completed."
          });
        };

        window.payhere.onError = function onError(payErr) {
          console.error("Payment Error:", payErr);
          setIsModalOpen(false);
          setNotification({
            type: "error",
            title: "Payment Failed",
            message:
              "An error occurred during payment processing. Appointment is not confirmed."
          });
        };

        // Start Payment
        window.payhere.startPayment(payment);
      } else {
        let errorMessage = "Could not initiate booking. Please try again.";
        try {
          const text = await response.text();
          try {
            const data = JSON.parse(text);
            if (data && data.message) errorMessage = data.message;
            else if (typeof data === "string") errorMessage = data;
          } catch {
            if (text) errorMessage = text;
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        setIsModalOpen(false);
        setNotification({
          type: "error",
          title: "Booking Failed",
          message: errorMessage
        });
      }
    } catch (err) {
      console.error("Booking error:", err);
      setIsModalOpen(false);
      setNotification({
        type: "error",
        title: "Error",
        message: "An error occurred during payment initiation."
      });
    }
  };

  const handleCloseNotification = () => {
    const wasSuccess = notification?.type === "success";
    setNotification(null);
    if (wasSuccess) {
      navigate("/patient/appointments");
    }
  };

  const toggleLike = (id) => {
    setLikedDoctorIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ===================== NOTIFICATION MODAL ===================== */}
      {notification && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
            {notification.type === "success" ? (
              <>
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {notification.title}
                </h3>
                <p className="text-slate-500 text-xs mb-5">
                  {notification.message}
                </p>
                <div className="bg-blue-950 rounded-2xl p-4 mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-blue-300 mb-0.5">
                    Queue Number
                  </p>
                  <p className="text-3xl font-black text-white">
                    {notification.apptNumber}
                  </p>
                </div>
                <button
                  onClick={handleCloseNotification}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  View My Appointments
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-rose-200">
                  <X className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {notification.title}
                </h3>
                <p className="text-slate-500 text-xs mb-6">
                  {notification.message}
                </p>
                <button
                  onClick={handleCloseNotification}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===================== BOOKING QUEUE MODAL ===================== */}
      {isModalOpen && bookingDoc && bookingSchedule && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  Confirm Appointment Booking
                </h3>
                <p className="text-slate-500 text-xs">
                  Dr. {bookingDoc.firstName || bookingDoc.name}
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="text-blue-700 font-semibold">
                    {bookingSchedule.date}
                  </span>
                  <span className="mx-2 text-slate-300">·</span>
                  {bookingSchedule.startTime}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center font-bold transition-colors shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Queue Number Display */}
            <div className="bg-blue-50/80 border-2 border-dashed border-blue-200 rounded-2xl p-6 mb-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">
                Your Appointment Number
              </p>
              {selectedNumber ? (
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-black text-blue-950 mb-1">
                    {selectedNumber}
                  </span>
                  <span className="text-xs text-blue-700 bg-blue-100/80 px-3 py-0.5 rounded-full font-bold">
                    APT-{String(selectedNumber).padStart(3, "0")}
                  </span>
                </div>
              ) : (
                <p className="text-rose-500 text-xs font-bold py-2">
                  No slots available for this session.
                </p>
              )}
            </div>

            {/* Fee Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-slate-700">
                  Doctor Channeling Fee
                </span>
                <p className="text-[11px] text-slate-500">
                  Payable via PayHere Secure Gateway
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-slate-900">
                  LKR 1,000.00
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                disabled={!selectedNumber}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
              >
                {selectedNumber
                  ? "Proceed to Payment (LKR 1,000.00)"
                  : "Fully Booked"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== PAGE HEADER ===================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Doctors
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Doctors and specialists you have previously consulted with
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/patient/add-feedback")}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition duration-150 cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4 text-slate-500" />
            <span>Add Feedback</span>
          </button>
          <Link
            to="/find-doctor"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition duration-150 shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            <span>Find Doctor</span>
          </Link>
        </div>
      </div>

      {/* ===================== LOADING STATE ===================== */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">
            Loading your doctors...
          </p>
        </div>
      )}

      {/* ===================== ERROR STATE ===================== */}
      {!isLoading && error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center">
          <p className="font-semibold text-sm">Failed to load doctors</p>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      )}

      {/* ===================== EMPTY STATE ===================== */}
      {!isLoading && !error && doctorList.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No doctors found
          </h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            You haven't booked any appointments yet. Search and book your first doctor consultation to see them listed here.
          </p>
          <div className="mt-5">
            <Link
              to="/find-doctor"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition shadow-sm shadow-blue-200"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find & Book a Doctor</span>
            </Link>
          </div>
        </div>
      )}

      {/* ===================== DOCTORS GRID (EQUAL HEIGHT CARDS) ===================== */}
      {!isLoading && !error && doctorList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctorList.map((doctor) => {
            const isExpanded = expandedDoctorId === doctor.id;
            const isLiked = likedDoctorIds.has(doctor.id);
            const isSlotsLoading = loadingSchedules[doctor.id];
            const slots = doctorSchedules[doctor.id] || [];

            return (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between h-full"
              >
                {/* Top Section */}
                <div className="flex-1 flex flex-col">
                  {/* Card Header with Consistent Fixed-Size Doctor Avatar */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border-2 border-blue-100 shadow-2xs shrink-0 flex items-center justify-center">
                          <img
                            src={doctor.profileImage || defaultDocImg}
                            alt={doctor.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = defaultDocImg;
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                            {doctor.name}
                          </h3>
                          <p className="text-xs font-semibold text-blue-600 truncate mt-0.5">
                            {doctor.specialization || "Specialist"}
                          </p>
                        </div>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleLike(doctor.id)}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                        aria-label="Toggle favorite"
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${isLiked
                              ? "fill-rose-500 text-rose-500"
                              : "text-slate-300 hover:text-rose-400"
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Card Body with Organized Details (Fills Available Height) */}
                  <div className="px-5 pb-4 space-y-2.5 flex-1 flex flex-col justify-start">
                    {/* Relevant Hospitals / Clinics */}
                    {doctor.hospitalNames && doctor.hospitalNames.length > 0 && (
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 font-medium">
                          {doctor.hospitalNames.join(" · ")}
                        </span>
                      </div>
                    )}

                    {/* Qualifications */}
                    {doctor.qualifications &&
                      doctor.qualifications.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {doctor.qualifications.map((q, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium"
                              >
                                {q}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Experience */}
                    {doctor.experience && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doctor.experience}</span>
                      </div>
                    )}

                    {/* Phone */}
                    {doctor.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doctor.phone}</span>
                      </div>
                    )}

                    {/* Email */}
                    {doctor.email && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Book Appointment Button Consistently Aligned at Bottom */}
                <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 mt-auto">
                  <button
                    onClick={() => toggleDoctorSlots(doctor)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition duration-150 cursor-pointer shadow-sm ${isExpanded
                        ? "bg-slate-800 hover:bg-slate-900 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                      }`}
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>{isExpanded ? "Hide Slots" : "Book Appointment"}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                    )}
                  </button>

                  {/* Expandable Appointment Slots Section */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-200/80">
                      {isSlotsLoading ? (
                        <div className="py-5 text-center">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-xs text-blue-600 font-medium">
                            Loading available appointment slots...
                          </p>
                        </div>
                      ) : slots.length === 0 ? (
                        <div className="py-4 px-3 bg-white border border-dashed border-slate-200 rounded-xl text-center">
                          <p className="text-xs font-semibold text-slate-700">
                            No available appointment slots
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            This doctor has no open slots at the moment.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            <span>Available Sessions</span>
                            <span className="text-blue-600 font-semibold">
                              {slots.length} {slots.length === 1 ? "slot" : "slots"}
                            </span>
                          </div>

                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {slots.map((schedule) => {
                              const hospName =
                                schedule.hospitalName ||
                                hospitals.find(
                                  (h) =>
                                    h.id === schedule.hospitalId ||
                                    h._id === schedule.hospitalId
                                )?.name ||
                                "Hospital";

                              return (
                                <div
                                  key={schedule.id}
                                  className="bg-white border border-blue-100 hover:border-blue-300 p-3 rounded-xl flex items-center justify-between gap-3 shadow-2xs transition-colors"
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                      <span>{schedule.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span>
                                        {schedule.startTime} – {schedule.endTime}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-medium mt-0.5 truncate">
                                      <Building2 className="w-3 h-3 text-blue-400 shrink-0" />
                                      <span className="truncate">{hospName}</span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() =>
                                      handleSelectSlot(doctor, schedule)
                                    }
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-2xs cursor-pointer whitespace-nowrap"
                                  >
                                    Select Slot
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}