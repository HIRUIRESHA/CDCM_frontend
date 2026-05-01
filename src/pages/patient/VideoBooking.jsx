import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "react-router-dom";

export default function VideoConference() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const doctorId = searchParams.get("doctorId");

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ track booked schedules
  const [bookedSchedules, setBookedSchedules] = useState([]);

  // ================= LOAD SCHEDULES =================
  const loadSchedules = async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8082/api/schedules/doctor/${doctorId}`
      );

      const filtered = res.data.filter(
        (s) =>
          s.type === "VIDEO" &&
          (s.status === "ACCEPTED" ||
            s.status === "CANCELLED" ||
            s.status === "PENDING")
      );

      setSchedules(filtered);
    } catch (err) {
      console.error("Load schedules error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [doctorId]);

  // ================= ACCEPT / REJECT =================
  const acceptSchedule = async (sid) => {
    await axios.put(`http://localhost:8082/api/schedules/accept/${sid}`);
    loadSchedules();
  };

  const rejectSchedule = async (sid) => {
    await axios.put(`http://localhost:8082/api/schedules/reject/${sid}`);
    loadSchedules();
  };

  // ================= BOOK + PAYMENT =================
  const addAppointment = async (schedule) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      const scheduleId = schedule?.id || schedule?._id;

      if (!scheduleId) {
        alert("Invalid schedule ID");
        return;
      }

      if (!window.payhere) {
        alert("PayHere not loaded");
        return;
      }

      // ✅ prevent duplicate booking
      if (bookedSchedules.includes(scheduleId)) {
        alert("Already booked!");
        return;
      }

      // ================= CREATE APPOINTMENT =================
      const res = await axios.post(
        "http://localhost:8082/api/video-appointments/book", // ✅ FIXED endpoint
        {
          patientId: user.id,
          doctorId: doctorId,
          scheduleId: scheduleId,
          date: schedule.date,
          time: `${schedule.startTime} - ${schedule.endTime}`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const appointment = res.data;

      if (!appointment?.id) {
        alert("Appointment creation failed");
        return;
      }

      const orderId = appointment.id;
      const amount = appointment.amount || 1000;

      // ================= GET HASH =================
      const hashRes = await axios.get(
        `http://localhost:8082/api/payments/generate-hash/${orderId}/${amount}`
      );

      const hash = hashRes.data;

      // ================= PAYHERE CONFIG =================
      const payment = {
        sandbox: true,
        merchant_id: hash.merchantId,
        return_url: "http://localhost:5173/payment-success",
        cancel_url: "http://localhost:5173/payment-failed",
        notify_url: "http://localhost:8082/api/payments/notify",

        order_id: orderId,
        items: "Video Consultation",
        amount: hash.amount,
        currency: hash.currency,
        hash: hash.hash,

        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone || "0000000000",
        address: "Sri Lanka",
        city: "Colombo",
        country: "Sri Lanka",
      };

      // ================= CALLBACKS =================
      window.payhere.onCompleted = async function () {
        alert("Payment Successful!");

        // ✅ mark as booked in UI
        setBookedSchedules((prev) => [...prev, scheduleId]);

        // ✅ update backend status
        await axios.post(
          `http://localhost:8082/api/video-appointments/payment-success/${orderId}`
        );

        loadSchedules();
      };

      window.payhere.onDismissed = function () {
        alert("Payment Cancelled!");
      };

      window.payhere.onError = function (err) {
        console.error("Payment Error:", err);
      };

      // ================= START PAYMENT =================
      window.payhere.startPayment(payment);

    } catch (err) {
      console.error(
        "Booking error FULL:",
        err.response?.data || err.message
      );
      alert("Booking failed - check backend logs");
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-[#f0f2f8] p-10">

      <h1 className="text-3xl font-bold mb-6">
        Video Consultation
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full bg-white rounded-xl shadow text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {schedules.map((s) => {
              const sid = s.id || s._id;

              return (
                <tr key={sid} className="border-b">

                  <td className="p-3">{s.date}</td>

                  <td className="p-3">
                    {s.startTime} - {s.endTime}
                  </td>

                  <td className="p-3">{s.status}</td>

                  <td className="p-3 flex gap-2">

                    {/* PENDING */}
                    {s.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => acceptSchedule(sid)}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => rejectSchedule(sid)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* ACCEPTED */}
                    {s.status === "ACCEPTED" && (
                      bookedSchedules.includes(sid) ? (
                        <span className="bg-green-200 text-green-700 px-3 py-1 rounded text-xs">
                          Booked
                        </span>
                      ) : (
                        <button
                          onClick={() => addAppointment(s)}
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Book Appointment
                        </button>
                      )
                    )}

                    {/* CANCELLED */}
                    {s.status === "CANCELLED" && (
                      <span className="text-gray-400 text-xs">
                        No actions
                      </span>
                    )}

                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      )}
    </div>
  );
}