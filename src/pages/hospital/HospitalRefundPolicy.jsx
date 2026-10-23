import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Percent, 
  Info,
  DollarSign,
  Building
} from "lucide-react";
import { API_BASE_URL } from "../../api/api";

const HospitalRefundPolicy = () => {
  const token = localStorage.getItem("token");

  const DEFAULT_POLICY = {
    over48HoursPercent: 90,
    between24And48HoursPercent: 75,
    between6And24HoursPercent: 50,
    under6HoursPercent: 0,
  };

  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [initialPolicy, setInitialPolicy] = useState(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPolicy = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/hospitals/me/refund-policy`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const contentType = response.headers.get("content-type") || "";
      let data = null;
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Server returned error (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load refund policy.");
      }

      const loaded = {
        over48HoursPercent: data.over48HoursPercent ?? 90,
        between24And48HoursPercent: data.between24And48HoursPercent ?? 75,
        between6And24HoursPercent: data.between6And24HoursPercent ?? 50,
        under6HoursPercent: data.under6HoursPercent ?? 0,
      };
      setPolicy(loaded);
      setInitialPolicy(loaded);
    } catch (err) {
      setError(err.message || "An error occurred while loading the policy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const handleInputChange = (field, value) => {
    setError("");
    setSuccess("");
    const num = parseFloat(value);
    setPolicy((prev) => ({
      ...prev,
      [field]: isNaN(num) ? "" : num,
    }));
  };

  const handleResetToDefaults = () => {
    setPolicy(DEFAULT_POLICY);
    setError("");
    setSuccess("Reset to recommended CDCMS default tiers (90% / 75% / 50% / 0%). Click 'Save Policy' to persist.");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate 0-100%
    const keys = [
      "over48HoursPercent",
      "between24And48HoursPercent",
      "between6And24HoursPercent",
      "under6HoursPercent",
    ];

    for (const key of keys) {
      const val = Number(policy[key]);
      if (isNaN(val) || val < 0 || val > 100) {
        setError("All refund percentages must be between 0% and 100%.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        over48HoursPercent: Number(policy.over48HoursPercent),
        between24And48HoursPercent: Number(policy.between24And48HoursPercent),
        between6And24HoursPercent: Number(policy.between6And24HoursPercent),
        under6HoursPercent: Number(policy.under6HoursPercent),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/hospitals/me/refund-policy`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const contentType = response.headers.get("content-type") || "";
      let data = null;
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Server returned error (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update refund policy.");
      }

      setInitialPolicy(payload);
      setPolicy(payload);
      setSuccess("Cancellation refund policy updated successfully!");
    } catch (err) {
      setError(err.message || "An error occurred while updating the policy.");
    } finally {
      setSaving(false);
    }
  };

  const sampleFee = 2500;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Loading hospital refund policy...</p>
      </div>
    );
  }

  const tiers = [
    {
      key: "over48HoursPercent",
      title: "48+ Hours Notice",
      badge: "Early Cancellation",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description: "Cancelled more than 48 hours prior to appointment start time.",
      defaultVal: 90,
    },
    {
      key: "between24And48HoursPercent",
      title: "24 – 48 Hours Notice",
      badge: "Standard Notice",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      description: "Cancelled between 24 and 48 hours prior to appointment start time.",
      defaultVal: 75,
    },
    {
      key: "between6And24HoursPercent",
      title: "6 – 24 Hours Notice",
      badge: "Short Notice",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      description: "Cancelled between 6 and 24 hours prior to appointment start time.",
      defaultVal: 50,
    },
    {
      key: "under6HoursPercent",
      title: "Under 6 Hours Notice",
      badge: "Last Minute",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      description: "Cancelled less than 6 hours prior to appointment start time.",
      defaultVal: 0,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
            <Building className="w-3.5 h-3.5" />
            <span>Facility Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Appointment Cancellation & Refund Policy
          </h1>
          <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
            Configure the refund percentage returned to patients when they cancel appointments in advance. 
            Doctor and hospital-initiated cancellations are always automatically refunded at 100%.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Policy Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Refund Tiers by Lead Time</h2>
              <p className="text-xs text-slate-500">
                Set the refund percentage (0% – 100%) for each fixed time range.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tiers.map((tier) => {
              const currentVal = policy[tier.key];
              const pct = typeof currentVal === "number" ? currentVal : Number(currentVal) || 0;
              const sampleRefund = ((sampleFee * pct) / 100).toFixed(2);

              return (
                <div
                  key={tier.key}
                  className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm">{tier.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tier.badgeColor}`}>
                        {tier.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{tier.description}</p>
                  </div>

                  {/* Input field & slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold text-slate-600">
                        Refund Percentage:
                      </label>
                      <div className="relative w-28">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={currentVal}
                          onChange={(e) => handleInputChange(tier.key, e.target.value)}
                          className="w-full text-right font-bold text-slate-800 text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 pr-7 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        />
                        <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-400">
                          %
                        </span>
                      </div>
                    </div>

                    {/* Visual Slider */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={pct}
                      onChange={(e) => handleInputChange(tier.key, e.target.value)}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />

                    {/* Live Preview snippet */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                      <span>On LKR {sampleFee.toLocaleString()} booking:</span>
                      <span className="font-bold text-teal-700">LKR {Number(sampleRefund).toLocaleString()} refund</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Defaults: 90% (48h+), 75% (24-48h), 50% (6-24h), 0% (&lt;6h).</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm shadow-md shadow-teal-500/20 disabled:opacity-50 cursor-pointer transition-all duration-150"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Policy...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Policy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Informational Policy Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <ShieldAlert className="w-4 h-4 text-teal-600" />
          <span>Cancellation Policy Rules &amp; Settlement Guarantees</span>
        </div>
        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
          <li>
            <strong>Doctor or Facility Cancellations:</strong> If a doctor cancels an appointment or an entire schedule, patients who already paid always receive a <strong>100% refund</strong> regardless of timing.
          </li>
          <li>
            <strong>Past Appointments:</strong> Once an appointment time has passed or started, cancellation is locked and cannot be processed.
          </li>
          <li>
            <strong>Unpaid Appointments:</strong> Appointments that are unpaid or pending payment are marked cancelled without recording a refund.
          </li>
          <li>
            <strong>Payment Integrity:</strong> Original payment records (PayHere ID, transaction amount, timestamp) remain permanently archived for auditing and reconciliation.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HospitalRefundPolicy;
