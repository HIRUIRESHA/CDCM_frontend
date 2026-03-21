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

  // ✅ New State for Custom Notifications instead of alerts
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, specRes, hospRes] = await Promise.all([
          fetch("http://localhost:8082/api/hospital/doctors/assigned-all"),
          fetch("http://localhost:8082/api/hospital/doctors/specializations"),
          fetch("http://localhost:8082/api/hospital/doctors/all-hospitals")
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
                const schedRes = await fetch(`http://localhost:8082/api/schedules/doctor/${doc.id}`);
                if (schedRes.ok) {
                  const schedData = await schedRes.json();
                  schedulesMap[doc.id] = schedData.filter((s) => s.status === "ACCEPTED");
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
    const fullName = `${doc.title || ""} ${doc.firstName || ""} ${doc.lastName || ""}`.toLowerCase();
    const matchesName = fullName.includes(search.toLowerCase());
    const matchesSpec = selectedSpec === "" || doc.specialization === selectedSpec;
    const matchesHosp = selectedHosp === "" || (doc.hospitals && doc.hospitals.includes(selectedHosp));
    const matchesDate = selectedDate === "" || 
      (schedules[doc.id] && schedules[doc.id].some((s) => s.date === selectedDate));

    return matchesName && matchesSpec && matchesHosp && matchesDate;
  });

  const openBookingModal = async (doctor, schedule) => {
    if (!user || user.role !== 'PATIENT') {
      navigate('/login', { state: { from: '/find-doctor' } });
      return;
    }

    setBookingDoc(doctor);
    setBookingSchedule(schedule);
    setSelectedNumber(null);
    setIsModalOpen(true);

    try {
      const response = await fetch(`http://localhost:8082/api/appointments/schedule/${schedule.id}`);
      if (response.ok) {
        const data = await response.json();
        const takenNumbers = data.map(appt => appt.appointmentNumber);
        setBookedNumbers(takenNumbers);
      }
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  };

  const confirmBooking = async () => {
    if (!selectedNumber) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:8082/api/appointments/book", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
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
        setIsModalOpen(false); // Close the number selector modal
        // ✅ Show Custom Success Modal instead of alert
        setNotification({
          type: 'success',
          title: 'Booking Successful!',
          message: 'Your appointment has been confirmed.',
          apptNumber: appointmentData.appointmentNumber
        });
      } else {
        // ✅ Show Custom Error Modal
        setNotification({
          type: 'error',
          title: 'Booking Failed',
          message: 'Failed to book appointment. Someone may have just taken this number!'
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'An error occurred while booking. Please try again.'
      });
    }
  };

  // ✅ Function to handle closing the custom notification modal
  const handleCloseNotification = () => {
    const wasSuccess = notification?.type === 'success';
    setNotification(null);
    if (wasSuccess) {
      navigate('/patient/appointments'); // Redirect only after they click "Done" on a success
    }
  };

  return (
     <div className="min-h-screen bg-gray-100 relative">
      
      {/* ===================== CUSTOM NOTIFICATION MODAL ===================== */}
      {notification && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-100 transition-transform">
            
            {notification.type === 'success' ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{notification.title}</h3>
                <p className="text-gray-500 mb-6 font-medium">{notification.message}</p>
                
                <div className="bg-blue-50 rounded-xl p-4 mb-8 border border-blue-100">
                  <p className="text-xs text-blue-600 uppercase tracking-widest font-bold mb-1">Queue Number</p>
                  <p className="text-3xl font-black text-blue-700">{notification.apptNumber}</p>
                </div>

                <button
                  onClick={handleCloseNotification}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{notification.title}</h3>
                <p className="text-gray-500 mb-8 font-medium">{notification.message}</p>
                
                <button
                  onClick={handleCloseNotification}
                  className="w-full bg-gray-100 text-gray-800 py-3.5 rounded-xl font-bold text-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </>
            )}
            
          </div>
        </div>
      )}
      {/* ==================================================================== */}

      {/* ===================== BOOKING QUEUE MODAL ===================== */}
      {isModalOpen && bookingDoc && bookingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-800">Select Queue Number</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Dr. {bookingDoc.firstName} {bookingDoc.lastName} • <span className="font-semibold text-indigo-600">{bookingSchedule.date}</span> at {bookingSchedule.startTime}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3 mb-8">
              {[...Array(30)].map((_, index) => {
                const num = index + 1;
                const formattedNum = `APT-${String(num).padStart(3, '0')}`;
                const isBooked = bookedNumbers.includes(formattedNum);
                const isSelected = selectedNumber === num.toString();

                return (
                  <button
                    key={num}
                    disabled={isBooked}
                    onClick={() => setSelectedNumber(num.toString())}
                    className={`py-3 rounded-lg font-bold text-lg transition-all transform ${
                      isBooked 
                        ? 'bg-red-50 text-red-300 cursor-not-allowed border border-red-100 line-through' 
                        : isSelected 
                        ? 'bg-blue-600 text-white shadow-lg scale-110 border-blue-600' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:-translate-y-1 hover:shadow-md border border-blue-200'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-100 pt-6 gap-4">
              <div className="flex gap-4 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded-full"></div> Available</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-50 border border-red-100 rounded-full"></div> Taken</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-600 rounded-full shadow"></div> Selected</span>
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium w-full sm:w-auto transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmBooking} 
                  disabled={!selectedNumber}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 w-full sm:w-auto transition shadow-md"
                >
                  {selectedNumber ? `Confirm #${selectedNumber}` : 'Select a Number'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* ======================================================== */}


      <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-400 text-white">
        <div className="flex items-center justify-center p-10">
          <h1 className="text-3xl md:text-4xl font-bold leading-snug">
            Smart <br /> channeling for <br /> a healthier <br /> tomorrow.
          </h1>
        </div>

        <div className="p-10 bg-gray-500">
          <h2 className="text-2xl font-bold mb-4">Find Your Doctor</h2>

          <input
            id="doctor-name-search"
            name="doctorSearch"
            type="text"
            placeholder="Search doctor name"
            className="w-full mb-3 p-2 rounded text-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select 
            id="spec-select" 
            name="specialization" 
            className="w-full mb-3 p-2 rounded text-black"
            value={selectedSpec}
            onChange={(e) => setSelectedSpec(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((spec, index) => (
              <option key={index} value={spec}>{spec}</option>
            ))}
          </select>
          
          <select 
            id="hosp-select" 
            name="hospital" 
            className="w-full mb-3 p-2 rounded text-black"
            value={selectedHosp}
            onChange={(e) => setSelectedHosp(e.target.value)}
          >
            <option value="">All Hospitals</option>
            {hospitals.map((hosp) => (
              <option key={hosp.id} value={hosp.id}>{hosp.name}</option>
            ))}
          </select>

          <input
            id="appointment-date-picker"
            name="appointmentDate"
            type="date"
            className="w-full mb-4 p-2 rounded text-black"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <button className="w-full bg-blue-300 text-black py-2 rounded hover:bg-blue-200">
            🔍 Search
          </button>
        </div>
      </div>

      <div className="p-10">
        <h2 className="text-xl font-bold mb-1">Available Doctors</h2>
        
        {loading ? (
          <p className="text-sm">Loading doctors...</p>
        ) : (
          <>
            <p className="text-sm mb-4">
              Found {filteredDoctors.length} doctors matching your criteria
            </p>

            <div className="space-y-6">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc) => (
                  <div key={doc.id} className="bg-indigo-200 p-4 rounded-lg shadow-md">
                    <div className="flex items-start gap-4">
                      <img 
                        src={doc.profileImage || defaultDocImg} 
                        alt="Doctor" 
                        className="w-20 h-20 bg-gray-300 rounded object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="font-bold text-lg">
                          {doc.title} {doc.firstName} {doc.lastName}
                        </h3>
                        <p className="text-sm mb-1">{doc.specialization}</p>

                        <div className="text-sm mb-2">
                          {doc.hospitals && doc.hospitals.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {doc.hospitals.map((hospitalId) => {
                                const hospitalObj = hospitals.find((h) => h.id === hospitalId);
                                return (
                                  <span key={hospitalId} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                                    {hospitalObj ? hospitalObj.name : "Unknown Hospital"}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">Independent</p>
                          )}
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-semibold mb-1">Available Times:</p>
                          {schedules[doc.id] && schedules[doc.id].length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {schedules[doc.id].map((schedule) => (
                                <div key={schedule.id} className="flex items-center justify-between bg-white px-3 py-2 rounded shadow-sm border border-indigo-100 w-full max-w-md">
                                  <div className="text-xs">
                                    <span className="font-medium">{schedule.date}</span>
                                    <span className="mx-1">|</span>
                                    <span>{schedule.startTime} - {schedule.endTime}</span>
                                    <span className="mx-1">•</span>
                                    <span className="text-indigo-600 font-medium">
                                      {schedule.hospitalName || "Hospital"}
                                    </span>
                                  </div>
                                  <button 
                                    onClick={() => openBookingModal(doc, schedule)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition shadow-sm"
                                  >
                                    Book Now
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-600">No available schedules at the moment.</p>
                          )}
                        </div>

                        <button 
                          onClick={() => navigate(`/doctor/account/${doc.id}`)}
                          className="text-sm bg-green-200 px-3 py-1 rounded hover:bg-green-300"
                        >
                          View Profile
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium">Contact</p>
                        <p className="text-xs text-gray-700">{doc.phone}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No doctors match your current filters.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FindDoctor;