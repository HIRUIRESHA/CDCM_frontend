import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Toast({ id, type, title, message, onClose }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl min-w-[300px] max-w-sm bg-white shadow-lg
      ${type === "success" ? "border-l-4 border-emerald-500" : "border-l-4 border-red-500"}`}
    >
      <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
        ${type === "success" ? "bg-emerald-100 text-emerald-500" : "bg-red-100 text-red-500"}`}
      >
        {type === "success" ? (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v4m0 2.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        )}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {message && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{message}</p>}
      </div>
      <button onClick={() => onClose(id)} className="text-gray-300 hover:text-gray-500 text-lg leading-none flex-shrink-0">×</button>
    </div>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8082/api/auth/forgot-password", null, {
        params: { email, role }
      });
      addToast("success", "Reset link sent!", `Check ${email} for your password reset link.`);
    } catch (error) {
      console.error(error);
      addToast("error", "Something went wrong", error.response?.data || "Unable to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toasts */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onClose={removeToast} />
          </div>
        ))}
      </div>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden px-4">

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }}
        />
        {/* Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        {/* Card */}
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-indigo-100 px-10 py-12">

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <p className="text-xs font-semibold tracking-widest uppercase text-indigo-500 mb-2">Account Recovery</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">Forgot your password?</h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-8">No worries. Enter your email and we'll send you a reset link right away.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-wide uppercase text-gray-400">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm placeholder-gray-300 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-wide uppercase text-gray-400">Account type</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="HOSPITAL">Hospital</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-400 hover:from-indigo-600 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          <div className="h-px bg-gray-100 my-7" />

          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-indigo-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to sign in
          </button>
        </div>
      </div>
    </>
  );
}