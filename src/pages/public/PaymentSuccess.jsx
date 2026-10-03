import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, CreditCard, ArrowRight, Home, Stethoscope } from "lucide-react";
import axios from "axios";
import { useNotifications } from "../../context/NotificationContext";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchAll, fetchUnread } = useNotifications();

  const orderId = searchParams.get("order_id") || searchParams.get("orderId");
  const paymentId = searchParams.get("payment_id") || searchParams.get("paymentId");

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processSuccess = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        if (orderId) {
          // Confirm payment with backend (idempotent - safe to call even if webhook already processed it)
          try {
            const res = await axios.post(
              `https://cdcm-backend.onrender.com/api/payments/payment-success/${orderId}`,
              {
                payhereId: paymentId || orderId,
              },
              { headers }
            );

            if (res.data && res.data.appointment) {
              setAppointment(res.data.appointment);
            }
          } catch (confirmErr) {
            console.warn("Backend payment success check response:", confirmErr);
          }
        }

        // Immediately refresh notifications so the bell and list are updated
        if (fetchAll) fetchAll();
        if (fetchUnread) fetchUnread();
      } catch (err) {
        console.error("Error processing payment success page:", err);
        setError("Payment was processed, but details could not be loaded immediately.");
      } finally {
        setLoading(false);
      }
    };

    processSuccess();
  }, [orderId, paymentId, fetchAll, fetchUnread]);

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-blue-50/60 to-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 text-center">
        {/* Success Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
          <div className="relative w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Payment Successful!
        </h1>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Your payment has been successfully verified and your appointment is confirmed.
        </p>

        {/* Queue / Appointment Number Card */}
        {appointment?.appointmentNumber && (
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-5 mb-6 text-white shadow-lg shadow-blue-950/20">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-1">
              Queue / Appointment Number
            </p>
            <p className="text-4xl font-black tracking-tight">{appointment.appointmentNumber}</p>
          </div>
        )}

        {/* Appointment / Payment Details */}
        <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100 text-left space-y-3 text-xs">
          {orderId && (
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Order / Ref ID
              </span>
              <span className="font-mono font-bold text-slate-800">{orderId}</span>
            </div>
          )}

          {appointment?.date && (
            <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200/60">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date & Time
              </span>
              <span className="font-bold text-slate-800">
                {appointment.date} {appointment.time ? `• ${appointment.time}` : ""}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200/60">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Payment Status
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              PAID & CONFIRMED
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/patient/appointments"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-[0.99]"
          >
            <span>View My Appointments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/patient/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
