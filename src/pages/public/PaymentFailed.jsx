import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, RefreshCw, Home } from "lucide-react";

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-rose-50/40 to-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 text-center">
        {/* Failed Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="relative w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border-4 border-rose-100 shadow-md">
            <AlertCircle className="w-10 h-10" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Payment Incomplete
        </h1>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          The payment process was cancelled or was not completed. No funds have been charged, and the appointment slot was released.
        </p>

        {orderId && (
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 text-xs text-slate-600 flex justify-between items-center">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Reference ID</span>
            <span className="font-mono font-bold text-slate-700">{orderId}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/find-doctor"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-[0.99]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Booking Again</span>
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
