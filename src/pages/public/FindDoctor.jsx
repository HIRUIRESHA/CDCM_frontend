import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import defaultDocImg from "../../assets/doc1.png";

function FindDoctor() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedSpec, setSelectedSpec] = useState("");
  const [selectedHosp, setSelectedHosp] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingDoc, setBookingDoc] = useState(null);
  const [bookingSchedule, setBookingSchedule] = useState(null);
  const [bookedNumbers, setBookedNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);

  const [notification, setNotification] = useState(null);

  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, specRes, hospRes] = await Promise.all([
          fetch("http://localhost:8082/api/hospital/doctors/assigned-all"),
          fetch("http://localhost:8082/api/hospital/doctors/specializations"),
          fetch("http://localhost:8082/api/hospital/doctors/all-hospitals"),
        ]);

        const docs = await docRes.json();
        const specs = await specRes.json();
        const hosps = await hospRes.json();

        const doctorsList = Array.isArray(docs) ? docs : [];
        setDoctors(doctorsList);
        setSpecializations(Array.isArray(specs) ? specs : []);
        setHospitals(Array.isArray(hosps) ? hosps : []);

        const schedulesMap = {};
        if (doctorsList.length > 0) {
          await Promise.all(
            doctorsList.map(async (doc) => {
              try {
                const schedRes = await fetch(
                  `http://localhost:8082/api/schedules/doctor/${doc.id}`
                );
                if (schedRes.ok) {
                  const schedData = await schedRes.json();
                  schedulesMap[doc.id] = schedData.filter(
                    (s) => s.status === "ACCEPTED"
                  );
                } else {
                  schedulesMap[doc.id] = [];
                }
              } catch (err) {
                schedulesMap[doc.id] = [];
              }
            })
          );
        }
        setSchedules(schedulesMap);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const fullName =
      `${doc.title || ""} ${doc.firstName || ""} ${doc.lastName || ""}`.toLowerCase();
    const matchesName = fullName.includes(search.toLowerCase());
    const matchesSpec = selectedSpec === "" || doc.specialization === selectedSpec;
    const matchesHosp =
      selectedHosp === "" ||
      (doc.hospitals && doc.hospitals.includes(selectedHosp));
    const matchesDate =
      selectedDate === "" ||
      (schedules[doc.id] &&
        schedules[doc.id].some((s) => s.date === selectedDate));
    return matchesName && matchesSpec && matchesHosp && matchesDate;
  });

  const openBookingModal = async (doctor, schedule) => {
  if (!user || user.role !== "PATIENT") {
    navigate("/login", { state: { from: "/find-doctor" } });
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
      setBookedNumbers(takenNumbers);

      // --- NEW LOGIC: Auto-select next number ---
      // We look for the first number (1-30) not in the taken list
      let nextAvailable = null;
      for (let i = 1; i <= 30; i++) {
        const formatted = `APT-${String(i).padStart(3, "0")}`;
        if (!takenNumbers.includes(formatted)) {
          nextAvailable = i.toString(); // Store as string to match your state
          break;
        }
      }
      setSelectedNumber(nextAvailable);
      // ------------------------------------------
    }
  } catch (error) {
    console.error("Error fetching booked slots:", error);
  }
};

  const confirmBooking = async () => {
    if (!selectedNumber) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8082/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: user.id,
          doctorId: bookingDoc.id,
          hospitalId: bookingSchedule.hospitalId,
          scheduleId: bookingSchedule.id,
          date: bookingSchedule.date,
          time: `${bookingSchedule.startTime} - ${bookingSchedule.endTime}`,
          appointmentNumber: selectedNumber,
        }),
      });

      if (response.ok) {
        const appointmentData = await response.json();
        setIsModalOpen(false);
        setNotification({
          type: "success",
          title: "Booking Confirmed!",
          message: "Your appointment has been successfully scheduled.",
          apptNumber: appointmentData.appointmentNumber,
        });
      } else {
        setNotification({
          type: "error",
          title: "Booking Failed",
          message: "Failed to book appointment. Someone may have just taken this number!",
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      setNotification({
        type: "error",
        title: "Error",
        message: "An error occurred while booking. Please try again.",
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

  return (
    <div className="min-h-screen bg-blue-50">

      {/* ===================== NOTIFICATION MODAL ===================== */}
      {notification && (
        <div className="fixed inset-0 bg-blue-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm text-center">
            {notification.type === "success" ? (
              <>
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-100">
                  <svg className="w-9 h-9 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-blue-950 mb-2">{notification.title}</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">{notification.message}</p>
                <div className="bg-blue-950 rounded-2xl p-5 mb-7">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-1">Queue Number</p>
                  <p className="text-4xl font-black text-white">{notification.apptNumber}</p>
                </div>
                <button
                  onClick={handleCloseNotification}
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
                  <svg className="w-9 h-9 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-blue-950 mb-2">{notification.title}</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">{notification.message}</p>
                <button
                  onClick={handleCloseNotification}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-base transition-colors"
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
        <div className="fixed inset-0 bg-blue-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex justify-between items-start mb-7">
              <div>
                <h3 className="text-2xl font-bold text-blue-950 mb-1">Select Queue Number</h3>
                <p className="text-slate-500 text-sm">
                  Dr. {bookingDoc.firstName} {bookingDoc.lastName}
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="text-blue-700 font-semibold">{bookingSchedule.date}</span>
                  <span className="mx-2 text-slate-300">·</span>
                  {bookingSchedule.startTime}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center font-bold transition-colors flex-shrink-0 ml-4"
              >
                ✕
              </button>
            </div>

            {/* Queue Grid */}
            {/* Automatically Assigned Number Display */}
<div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl p-8 mb-7 text-center">
  <p className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-2">
    Your Appointment Number
  </p>
  {selectedNumber ? (
    <div className="flex flex-col items-center">
      <span className="text-6xl font-black text-blue-950 mb-2">
        {selectedNumber}
      </span>
      <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-bold">
        APT-{String(selectedNumber).padStart(3, "0")}
      </span>
    </div>
  ) : (
    <p className="text-red-500 font-bold">No slots available for this session.</p>
  )}
</div>

            {/* Legend + Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 pt-5 gap-4">
              <div className="flex gap-5 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-50 border-2 border-blue-200 inline-block"></span>Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-100 border-2 border-red-200 inline-block"></span>Taken
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-700 inline-block"></span>Selected
                </span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
  onClick={confirmBooking}
  disabled={!selectedNumber}
  className="flex-1 sm:flex-none px-10 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg"
>
  {selectedNumber ? "Confirm Appointment" : "Fully Booked"}
</button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================== HERO / SEARCH SECTION ===================== */}
      <div className="bg-blue-950 relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-700/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-900/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-blue-800/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Hero Copy */}
          <div>
            <span className="inline-flex items-center gap-2 bg-blue-800/50 border border-blue-600/40 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
              Smart Channeling System
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
              Find the right<br />
              <span className="text-blue-400 italic">doctor for you</span>,<br />
              instantly.
            </h1>
            <p className="text-blue-200/70 text-base leading-relaxed max-w-sm font-light">
              Browse verified specialists, check real-time availability, and book your appointment in seconds — no phone calls needed.
            </p>
          </div>

          {/* Search Panel */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl shadow-blue-950/50">
            <h2 className="text-xl font-bold text-blue-950 mb-1">Find Your Doctor</h2>
            <p className="text-slate-400 text-sm mb-6">Filter by name, specialty, hospital, or date</p>

            <div className="relative mb-4">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔍</span>
              <input
                id="doctor-name-search"
                name="doctorSearch"
                type="text"
                placeholder="Search by doctor name…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-blue-950 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="relative mb-4">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🩺</span>
              <select
                id="spec-select"
                name="specialization"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-blue-950 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map((spec, index) => (
                  <option key={index} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="relative mb-4">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🏥</span>
              <select
                id="hosp-select"
                name="hospital"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-blue-950 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                value={selectedHosp}
                onChange={(e) => setSelectedHosp(e.target.value)}
              >
                <option value="">All Hospitals</option>
                {hospitals.map((hosp) => (
                  <option key={hosp.id} value={hosp.id}>{hosp.name}</option>
                ))}
              </select>
            </div>

            <div className="relative mb-6">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">📅</span>
              <input
                id="appointment-date-picker"
                name="appointmentDate"
                type="date"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-blue-950 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <button className="w-full bg-blue-700 hover:bg-blue-600 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-lg tracking-wide">
              Search Doctors
            </button>
          </div>
        </div>
      </div>

      {/* ===================== RESULTS SECTION ===================== */}
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-bold text-blue-950">Available Doctors</h2>
          {!loading && (
            <span className="bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full">
              {filteredDoctors.length} found
            </span>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center py-24">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-700 rounded-full animate-spin mb-4"></div>
            <p className="text-blue-400 text-sm">Loading doctors…</p>
          </div>

        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-400 text-base">No doctors match your current filters.</p>
          </div>

        ) : (
          /* ── 2-per-row grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* ── Card Header ── */}
                <div className="bg-blue-950 px-5 py-4 relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: "radial-gradient(circle at 85% 30%, #3b82f6 0%, transparent 55%)" }}
                  />
                  <div className="relative flex items-center gap-4">
                    <img
                      src={doc.profileImage || defaultDocImg}
                      alt="Doctor"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-blue-400/40 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white leading-tight truncate">
                        {doc.title} {doc.firstName} {doc.lastName}
                      </h3>
                      <p className="text-blue-300 text-xs font-semibold mt-0.5">{doc.specialization}</p>
                      {doc.phone && (
                        <p className="text-blue-400/80 text-xs mt-1">{doc.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Card Body ── */}
                <div className="px-5 pt-4 pb-5 flex flex-col flex-1">

                  {/* Hospital Tags */}
                  {doc.hospitals && doc.hospitals.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {doc.hospitals.map((hospitalId) => {
                        const hospitalObj = hospitals.find((h) => h.id === hospitalId);
                        return (
                          <span
                            key={hospitalId}
                            className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-2.5 py-1 rounded-full"
                          >
                            🏥 {hospitalObj ? hospitalObj.name : "Unknown Hospital"}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic mb-4">Independent Practice</p>
                  )}

                  {/* Schedule Slots Label */}
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Available Slots
                  </p>

                  {/* Schedule Rows */}
                  <div className="flex-1 space-y-2 mb-4">
                    {schedules[doc.id] && schedules[doc.id].length > 0 ? (
                      schedules[doc.id].map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 hover:border-blue-300 hover:bg-blue-100/60 transition-colors"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0 mr-2">
                            <span className="text-xs font-bold text-blue-950">{schedule.date}</span>
                            <span className="text-xs text-slate-500">{schedule.startTime} – {schedule.endTime}</span>
                            <span className="text-xs text-blue-600 font-semibold">{schedule.hospitalName || "Hospital"}</span>
                          </div>
                          <button
                            onClick={() => openBookingModal(doc, schedule)}
                            className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex-shrink-0 shadow-sm whitespace-nowrap"
                          >
                            Book Now
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">No available schedules at the moment.</p>
                    )}
                  </div>

                  {/* View Profile Button */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => navigate(`/doctor/account/${doc.id}`)}
                      className="w-full inline-flex items-center justify-center gap-2 border border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View Full Profile
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FindDoctor;