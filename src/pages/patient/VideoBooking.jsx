import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const API_URL = "http://localhost:8082/api";

export default function VideoConference() {
  const [searchParams] = useSearchParams();

  const doctorId = searchParams.get("doctorId");

  const [schedules, setSchedules] = useState([]);
  const [bookedSchedules, setBookedSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);

  // =====================================================
  // LOAD VIDEO SCHEDULES
  // =====================================================

  const loadSchedules = async () => {
    if (!doctorId) {
      console.error("Doctor ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/schedules/doctor/${doctorId}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      const videoSchedules = data.filter(
  (schedule) =>
    schedule.type === "VIDEO" &&
    schedule.status === "ACCEPTED"
);
      setSchedules(videoSchedules);
    } catch (error) {
      console.error(
        "Load schedules error:",
        error.response?.data || error.message
      );

      alert("Failed to load video consultation schedules.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PATIENT'S EXISTING VIDEO BOOKINGS
  // =====================================================

  const loadBookedSchedules = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user?.id) {
        return;
      }

      const response = await axios.get(
        `${API_URL}/video-appointments/patient/${user.id}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      const appointments = Array.isArray(response.data)
        ? response.data
        : [];

      const scheduleIds = appointments
        .filter(
          (appointment) =>
            appointment.consultationType === "VIDEO" &&
            (appointment.status === "PAID" ||
              appointment.status === "PENDING")
        )
        .map((appointment) => String(appointment.scheduleId));

      setBookedSchedules(scheduleIds);
    } catch (error) {
      console.error(
        "Load booked schedules error:",
        error.response?.data || error.message
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (doctorId) {
      loadSchedules();
      loadBookedSchedules();
    } else {
      setLoading(false);
    }
  }, [doctorId]);

  // =====================================================
  // ACCEPT SCHEDULE
  // =====================================================

  const acceptSchedule = async (scheduleId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/schedules/accept/${scheduleId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Schedule accepted successfully.");

      await loadSchedules();
    } catch (error) {
      console.error(
        "Accept schedule error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to accept schedule."
      );
    }
  };

  // =====================================================
  // REJECT SCHEDULE
  // =====================================================

  const rejectSchedule = async (scheduleId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/schedules/reject/${scheduleId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Schedule rejected.");

      await loadSchedules();
    } catch (error) {
      console.error(
        "Reject schedule error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to reject schedule."
      );
    }
  };

  // =====================================================
  // BOOK VIDEO APPOINTMENT
  // =====================================================

  const addAppointment = async (schedule) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user?.id) {
        alert("Please login first.");
        return;
      }

      if (!token) {
        alert("Authentication token is missing. Please login again.");
        return;
      }

      if (!doctorId) {
        alert("Doctor ID is missing.");
        return;
      }

      const scheduleId = schedule?.id || schedule?._id;

      if (!scheduleId) {
        alert("Invalid schedule ID.");
        return;
      }

      // Prevent multiple clicks
      if (bookingId) {
        alert("Please wait. Your booking is being processed.");
        return;
      }

      const scheduleIdString = String(scheduleId);

      // Check current frontend state
      if (bookedSchedules.includes(scheduleIdString)) {
        alert("You have already booked this schedule.");
        return;
      }

      // Check PayHere
      if (!window.payhere) {
        alert(
          "PayHere is not loaded. Please refresh the page and try again."
        );
        return;
      }

      setBookingId(scheduleIdString);

      // =================================================
      // CREATE VIDEO APPOINTMENT
      // =================================================

      const appointmentResponse = await axios.post(
        `${API_URL}/video-appointments/book`,
        {
          patientId: String(user.id),
          doctorId: String(doctorId),
          scheduleId: scheduleIdString,
          date: schedule.date,
          time: `${schedule.startTime} - ${schedule.endTime}`,

          // IMPORTANT
          consultationType: "VIDEO",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const appointment = appointmentResponse.data;

      console.log("Created video appointment:", appointment);

      if (!appointment?.id) {
        throw new Error(
          "Appointment was not created correctly."
        );
      }

      const appointmentId = appointment.id;

      // Fixed consultation price
      const amount = Number(appointment.amount || 1000);

      // =================================================
      // GET PAYHERE HASH
      // =================================================

      const hashResponse = await axios.get(
        `${API_URL}/payments/generate-hash/${appointmentId}/${amount}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const paymentData = hashResponse.data;

      console.log("Payment data:", paymentData);

      if (!paymentData?.hash) {
        throw new Error("Unable to generate PayHere hash.");
      }

      // =================================================
      // PAYHERE PAYMENT OBJECT
      // =================================================

      const payment = {
        sandbox: true,

        merchant_id: paymentData.merchantId,

        return_url: "http://localhost:5173/payment-success",

        cancel_url: "http://localhost:5173/payment-failed",

        notify_url:
          "http://localhost:8082/api/payments/notify",

        order_id: String(appointmentId),

        items: "Video Consultation",

        amount: Number(paymentData.amount).toFixed(2),

        currency: paymentData.currency || "LKR",

        hash: paymentData.hash,

        first_name: user.firstName || "Patient",

        last_name: user.lastName || "",

        email: user.email,

        phone: user.phone || "0000000000",

        address: "Sri Lanka",

        city: "Colombo",

        country: "Sri Lanka",
      };

      // =================================================
      // PAYMENT COMPLETED
      // =================================================

      window.payhere.onCompleted = async function (orderId) {
        console.log(
          "PayHere payment completed:",
          orderId
        );

        try {
          await axios.post(
            `${API_URL}/video-appointments/payment-success/${appointmentId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          alert(
            "Payment successful! Your video consultation has been booked."
          );

          // Update UI
          setBookedSchedules((previous) => {
            if (previous.includes(scheduleIdString)) {
              return previous;
            }

            return [
              ...previous,
              scheduleIdString,
            ];
          });

          await loadSchedules();
          await loadBookedSchedules();
        } catch (error) {
          console.error(
            "Payment success update error:",
            error.response?.data || error.message
          );

          alert(
            "Payment was completed, but appointment status could not be updated. Please contact the administrator."
          );
        } finally {
          setBookingId(null);
        }
      };

      // =================================================
      // PAYMENT DISMISSED
      // =================================================

      window.payhere.onDismissed = async function () {
        console.log("PayHere payment dismissed");

        try {
          await axios.post(
            `${API_URL}/video-appointments/payment-failed/${appointmentId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (error) {
          console.error(
            "Failed to update cancelled payment:",
            error.response?.data || error.message
          );
        }

        setBookingId(null);

        alert("Payment cancelled.");
      };

      // =================================================
      // PAYMENT ERROR
      // =================================================

      window.payhere.onError = async function (error) {
        console.error("PayHere error:", error);

        try {
          await axios.post(
            `${API_URL}/video-appointments/payment-failed/${appointmentId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (backendError) {
          console.error(
            "Failed to update payment failure:",
            backendError.response?.data ||
              backendError.message
          );
        }

        setBookingId(null);

        alert(
          "Payment failed. Please try again."
        );
      };

      // =================================================
      // START PAYHERE
      // =================================================

      window.payhere.startPayment(payment);
    } catch (error) {
      console.error(
        "Booking error FULL:",
        error.response?.data || error.message
      );

      setBookingId(null);

      if (error.response?.status === 403) {
        alert(
          "Access denied (403). Please login again or check your account permissions."
        );
        return;
      }

      alert(
        error.response?.data?.message ||
          error.message ||
          "Booking failed. Please try again."
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f0f2f8] p-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-2">
          Video Consultation
        </h1>

        <p className="text-gray-600 mb-6">
          Select an available video consultation schedule
          and complete the payment.
        </p>

        {!doctorId && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            Doctor ID is missing from the URL.
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500">
              Loading schedules...
            </p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500">
              No video consultation schedules available.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">

            <table className="w-full text-sm">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">
                    Date
                  </th>

                  <th className="p-4 text-left">
                    Time
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-left">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {schedules.map((schedule) => {
                  const scheduleId =
                    schedule.id || schedule._id;

                  const scheduleIdString =
                    String(scheduleId);

                  const isBooked =
                    bookedSchedules.includes(
                      scheduleIdString
                    );

                  const isProcessing =
                    bookingId === scheduleIdString;

                  return (
                    <tr
                      key={scheduleIdString}
                      className="border-b hover:bg-gray-50"
                    >

                      {/* DATE */}
                      <td className="p-4">
                        {schedule.date}
                      </td>

                      {/* TIME */}
                      <td className="p-4">
                        {schedule.startTime}
                        {" - "}
                        {schedule.endTime}
                      </td>

                      {/* STATUS */}
                      <td className="p-4">

                        {schedule.status ===
                          "ACCEPTED" && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                            Accepted
                          </span>
                        )}

                        {schedule.status ===
                          "PENDING" && (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
                            Pending
                          </span>
                        )}

                        {schedule.status ===
                          "CANCELLED" && (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">
                            Cancelled
                          </span>
                        )}

                      </td>

                      {/* ACTION */}
                      <td className="p-4">

                        {/* PENDING */}
                        {schedule.status ===
                          "PENDING" && (
                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                acceptSchedule(
                                  scheduleId
                                )
                              }
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
                            >
                              Accept
                            </button>

                            <button
                              onClick={() =>
                                rejectSchedule(
                                  scheduleId
                                )
                              }
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                            >
                              Reject
                            </button>

                          </div>
                        )}

                        {/* ACCEPTED */}
                        {schedule.status ===
                          "ACCEPTED" && (
                          <>
                            {isBooked ? (
                              <span className="bg-green-100 text-green-700 px-3 py-2 rounded text-xs">
                                Already Booked
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  addAppointment(
                                    schedule
                                  )
                                }
                                disabled={isProcessing}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
                              >
                                {isProcessing
                                  ? "Processing..."
                                  : "Book Appointment"}
                              </button>
                            )}
                          </>
                        )}

                        {/* CANCELLED */}
                        {schedule.status ===
                          "CANCELLED" && (
                          <span className="text-gray-400 text-xs">
                            No actions available
                          </span>
                        )}

                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}
