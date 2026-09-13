import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Building2,
  Users,
  Stethoscope,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Activity,
  Bell,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Clock,
  LayoutDashboard,
  RefreshCw,
  CalendarDays,
  Zap,
} from "lucide-react";


const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});


const StatCard = ({ icon: Icon, label, value, sub, color, gradient, loading }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm p-6 flex flex-col gap-4 group hover:shadow-md transition-shadow`}
  >
    {/* Decorative blob */}
    <div
      className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 ${gradient}`}
    />
    <div className="flex items-start justify-between">
      <div
        className={`h-11 w-11 rounded-xl flex items-center justify-center ${gradient} shadow-inner`}
      >
        <Icon size={22} className="text-white" />
      </div>
      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
        <ArrowUpRight size={12} /> Live
      </span>
    </div>
    {loading ? (
      <div className="space-y-2 animate-pulse">
        <div className="h-8 w-20 bg-slate-100 rounded-lg" />
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>
    ) : (
      <div>
        <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">
          {value ?? "—"}
        </p>
        <p className="text-sm font-semibold text-slate-500 mt-1">{label}</p>
        {sub && (
          <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>
        )}
      </div>
    )}
  </div>
);

const SectionTitle = ({ icon: Icon, title, color }) => (
  <div className={`flex items-center gap-2 mb-4`}>
    <div className={`h-6 w-1 rounded-full ${color}`} />
    <Icon size={18} className="text-slate-600" />
    <h2 className="text-base font-bold text-slate-800 tracking-tight">{title}</h2>
  </div>
);

const VerifiedBadge = ({ verified }) =>
  verified ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
      <CheckCircle size={11} /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
      <Clock size={11} /> Pending
    </span>
  );


export default function Dashboard() {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [hRes, dRes, pRes] = await Promise.all([
        api.get("/api/admin/hospitals"),
        api.get("/api/admin/doctors"),
        api.get("/api/admin/patients"),
      ]);
      setHospitals(hRes.data);
      setDoctors(dRes.data);
      setPatients(pRes.data);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Derived stats
  const verifiedDoctors = doctors.filter((d) => d.verified).length;
  const pendingDoctors = doctors.length - verifiedDoctors;
  const verifiedPatients = patients.filter((p) => p.verified).length;
  const pendingPatients = patients.length - verifiedPatients;

  // Recent items (last 5)
  const recentHospitals = [...hospitals].slice(-5).reverse();
  const recentDoctors = [...doctors].slice(-5).reverse();
  const recentPatients = [...patients].slice(-5).reverse();

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow">
                <LayoutDashboard size={18} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium pl-12">
              <CalendarDays size={14} />
              {today}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pending alerts badge */}
            {(pendingDoctors > 0 || pendingPatients > 0) && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold px-4 py-2 rounded-2xl">
                <Bell size={15} className="animate-pulse" />
                {pendingDoctors + pendingPatients} pending verification
                {pendingDoctors + pendingPatients > 1 ? "s" : ""}
              </div>
            )}
            <button
              onClick={load}
              className="p-2.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-600 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Building2}
            label="Hospitals Registered"
            value={hospitals.length}
            sub="Medical facilities onboarded"
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            loading={loading}
          />
          <StatCard
            icon={Stethoscope}
            label="Doctors Enrolled"
            value={doctors.length}
            sub={`${verifiedDoctors} verified · ${pendingDoctors} pending`}
            gradient="bg-gradient-to-br from-purple-500 to-violet-600"
            loading={loading}
          />
          <StatCard
            icon={Users}
            label="Patients Registered"
            value={patients.length}
            sub={`${verifiedPatients} verified · ${pendingPatients} pending`}
            gradient="bg-gradient-to-br from-teal-500 to-emerald-600"
            loading={loading}
          />
          <StatCard
            icon={Activity}
            label="Total System Users"
            value={!loading ? hospitals.length + doctors.length + patients.length : null}
            sub="Across all roles"
            gradient="bg-gradient-to-br from-red-500 to-rose-600"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Doctors Verification */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <SectionTitle icon={Stethoscope} title="Doctor Verification Status" color="bg-purple-500" />
            <div className="flex items-center gap-4 mt-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Verified</span>
                  <span>{doctors.length > 0 ? Math.round((verifiedDoctors / doctors.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-violet-600 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${doctors.length > 0 ? (verifiedDoctors / doctors.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-emerald-700">{loading ? "—" : verifiedDoctors}</p>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">Verified</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-amber-700">{loading ? "—" : pendingDoctors}</p>
                <p className="text-xs font-bold text-amber-600 mt-0.5">Pending</p>
              </div>
            </div>
          </div>

          {/* Patients Verification */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <SectionTitle icon={Users} title="Patient Verification Status" color="bg-teal-500" />
            <div className="flex items-center gap-4 mt-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Verified</span>
                  <span>{patients.length > 0 ? Math.round((verifiedPatients / patients.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${patients.length > 0 ? (verifiedPatients / patients.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-emerald-700">{loading ? "—" : verifiedPatients}</p>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">Verified</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-amber-700">{loading ? "—" : pendingPatients}</p>
                <p className="text-xs font-bold text-amber-600 mt-0.5">Pending</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Recent Hospitals */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <SectionTitle icon={Building2} title="Recent Hospitals" color="bg-blue-500" />
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-center animate-pulse">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentHospitals.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No hospitals yet</p>
            ) : (
              <ul className="space-y-3">
                {recentHospitals.map((h) => (
                  <li key={h.id} className="flex items-center gap-3 group hover:bg-blue-50/50 -mx-2 px-2 py-1.5 rounded-xl transition-colors">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-inner">
                      <Building2 size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{h.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{h.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Doctors */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <SectionTitle icon={Stethoscope} title="Recent Doctors" color="bg-purple-500" />
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-center animate-pulse">
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentDoctors.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No doctors yet</p>
            ) : (
              <ul className="space-y-3">
                {recentDoctors.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 hover:bg-purple-50/50 -mx-2 px-2 py-1.5 rounded-xl transition-colors">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-inner">
                      {d.firstName?.[0]}{d.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {d.title} {d.firstName} {d.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{d.specialization}</p>
                    </div>
                    <VerifiedBadge verified={d.verified} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <SectionTitle icon={Users} title="Recent Patients" color="bg-teal-500" />
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-center animate-pulse">
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentPatients.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No patients yet</p>
            ) : (
              <ul className="space-y-3">
                {recentPatients.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 hover:bg-teal-50/50 -mx-2 px-2 py-1.5 rounded-xl transition-colors">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-inner">
                      {p.firstName?.[0]}{p.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {p.title} {p.firstName} {p.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{p.nicOrPassport}</p>
                    </div>
                    <VerifiedBadge verified={p.verified} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-xl">
          {[
            { label: "Total Hospitals", value: hospitals.length, icon: Building2, color: "text-blue-400" },
            { label: "Verified Doctors", value: verifiedDoctors, icon: CheckCircle, color: "text-emerald-400" },
            { label: "Pending Reviews", value: pendingDoctors + pendingPatients, icon: Clock, color: "text-amber-400" },
            { label: "Active Users", value: hospitals.length + verifiedDoctors + verifiedPatients, icon: Zap, color: "text-rose-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center">
              <Icon size={22} className={`${color} mx-auto mb-2`} />
              <p className="text-2xl font-black text-white">{loading ? "—" : value}</p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}