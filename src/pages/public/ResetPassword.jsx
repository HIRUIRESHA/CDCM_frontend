import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function getStrength(pw) {
  if (!pw) return { score: 0, label: "", barColor: "", textColor: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels     = ["", "Weak", "Fair", "Good", "Strong"];
  const barColors  = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"];
  const textColors = ["", "text-red-500", "text-amber-500", "text-blue-500", "text-emerald-500"];
  return { score, label: labels[score], barColor: barColors[score], textColor: textColors[score] };
}

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

export default function ResetPassword() {

  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const strength = getStrength(password);

  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── original logic untouched ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "http://localhost:8082/api/auth/reset-password",
        {
          token: token,
          newPassword: password,
          role: role
        }
      );

      addToast("success", "Password reset successful!", "Redirecting you to login…");
      setTimeout(() => navigate("/login"), 2000);

    } catch (error) {
      console.error(error);
      addToast("error", "Reset failed", error.response?.data || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

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
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }} />

        {/* Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        {/* Card */}
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-emerald-100 px-10 py-12">

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>

          <p className="text-xs font-semibold tracking-widest uppercase text-emerald-500 mb-2">Account Security</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">Set a new password</h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-8">Choose a strong password to keep your account protected.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-wide uppercase text-gray-400">New Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm placeholder-gray-300 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 text-gray-300 hover:text-emerald-500 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${strength.score >= i ? strength.barColor : "bg-gray-200"}`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs text-right font-medium ${strength.textColor}`}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Role Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-wide uppercase text-gray-400">Account type</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="HOSPITAL">Hospital</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white font-medium text-sm rounded-xl shadow-md shadow-emerald-200 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Resetting…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Reset Password
                </>
              )}
            </button>

          </form>

          <div className="h-px bg-gray-100 my-7" />

          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-emerald-500 transition-colors"
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