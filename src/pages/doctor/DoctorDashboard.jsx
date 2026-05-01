import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users, Calendar, Clock, Video, Star, Activity,
  CheckCircle, XCircle, AlertCircle, TrendingUp,
  Building2, ChevronRight, Stethoscope, Award,
  MessageSquare, FileText, ArrowUpRight, Loader2,
  Zap, Heart, BarChart3
} from "lucide-react";

const parseTime = (t = "") => {
  if (!t) return Infinity;
  const [time, period] = t.split(" ");
  let [h, m = 0] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

const todayISO = new Date().toISOString().split("T")[0];

const statusConfig = {
  ACCEPTED:  { label: "Accepted",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PENDING:   { label: "Pending",   cls: "bg-amber-50  text-amber-700  border-amber-200"  },
  REJECTED:  { label: "Rejected",  cls: "bg-rose-50   text-rose-700   border-rose-200"   },
  CANCELLED: { label: "Cancelled", cls: "bg-slate-100 text-slate-500  border-slate-200"  },
};

function Counter({ to, duration = 900 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!to && to !== 0) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(pct * to));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to]);
  return <>{val}</>;
}

const PulseDot = ({ color = "bg-emerald-400" }) => (
  <span className="relative flex h-2.5 w-2.5">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
  </span>
);

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const doctorId  = user?.id || user?._id;

  const [schedules,    setSchedules]    = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [feedbacks,    setFeedbacks]    = useState([]);
  const [doctorProfile,setDoctorProfile]= useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!doctorId) { setLoading(false); return; }
    (async () => {
      try {
        const [schRes, apptRes, fbRes, profRes] = await Promise.allSettled([
          axios.get(`http://localhost:8082/api/schedules/doctor/${doctorId}`),
          axios.get(`http://localhost:8082/api/appointments/doctor/${doctorId}`),
          axios.get(`http://localhost:8082/api/feedback/doctor/${doctorId}`),
          axios.get(`http://localhost:8082/api/auth/doctors/${doctorId}`),
        ]);
        if (schRes.status  === "fulfilled") setSchedules(schRes.value.data   || []);
        if (apptRes.status === "fulfilled") setAppointments(apptRes.value.data || []);
        if (fbRes.status   === "fulfilled") setFeedbacks(fbRes.value.data    || []);
        if (profRes.status === "fulfilled") setDoctorProfile(profRes.value.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [doctorId]);

  const todaySchedules = schedules.filter((s) => {
    try { return new Date(s.date).toISOString().split("T")[0] === todayISO; }
    catch { return false; }
  });

  const allAppointments   = appointments;
  const uniquePatients    = new Set(appointments.map((a) => a.patientId)).size;
  const videoSchedules    = schedules.filter((s) => s.type === "VIDEO");
  const todayVideoSch     = videoSchedules.filter((s) => {
    try { return new Date(s.date).toISOString().split("T")[0] === todayISO; }
    catch { return false; }
  });

  const acceptedToday  = todaySchedules.filter((s) => s.status === "ACCEPTED").length;
  const pendingToday   = todaySchedules.filter((s) => s.status === "PENDING").length;

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : null;

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const nextShift  = todaySchedules
    .filter((s) => s.status === "ACCEPTED" && parseTime(s.startTime) > nowMinutes)
    .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime))[0];

  const specialty = doctorProfile?.specialization || user?.specialization || "Specialist";
  const doctorName = user?.name ||
    (doctorProfile ? `${doctorProfile.title || ""} ${doctorProfile.firstName || ""} ${doctorProfile.lastName || ""}`.trim() : "Doctor");

  const recentPatients = [];
  const seen = new Set();
  for (const a of [...appointments].reverse()) {
    if (!seen.has(a.patientId) && recentPatients.length < 5) {
      seen.add(a.patientId);
      recentPatients.push(a);
    }
  }

  const totalSch    = schedules.length || 1;
  const accPct      = Math.round((schedules.filter(s=>s.status==="ACCEPTED").length / totalSch) * 100);
  const pendPct     = Math.round((schedules.filter(s=>s.status==="PENDING").length  / totalSch) * 100);
  const rejPct      = Math.round((schedules.filter(s=>s.status==="REJECTED").length / totalSch) * 100);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg,#f8faff 0%,#eef2ff 50%,#f5f3ff 100%)",
        fontFamily: "'DM Sans', 'Nunito', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Playfair+Display:wght@700&display=swap');
        .card  { background:#fff; border-radius:20px; box-shadow:0 1px 3px rgba(0,0,40,.06),0 4px 24px rgba(0,0,40,.05); }
        .glow  { box-shadow:0 8px 32px rgba(99,102,241,.18); }
        .stat-shine { background: linear-gradient(135deg,rgba(255,255,255,.22) 0%,rgba(255,255,255,.04) 100%); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        .fade-up { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation-delay:.05s }
        .fade-up-2 { animation-delay:.10s }
        .fade-up-3 { animation-delay:.15s }
        .fade-up-4 { animation-delay:.20s }
        .fade-up-5 { animation-delay:.25s }
        .fade-up-6 { animation-delay:.30s }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spin { animation:spin 1s linear infinite }
        .bar-fill { transition: width 1s cubic-bezier(.4,0,.2,1); }
      `}</style>

      <div
        style={{
          background: "linear-gradient(135deg,#0f1c5c 0%,#1e3a8a 45%,#312e81 100%)",
          borderRadius: "0 0 32px 32px",
          padding: "2rem 2.5rem 2.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,.06)" }} />
        <div style={{ position:"absolute", bottom:-40, left:80, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,.04)" }} />
        <div style={{ position:"absolute", top:20, right:200, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,.05)" }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* avatar */}
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{
                width:64, height:64, borderRadius:16,
                background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:26, fontWeight:800, color:"#fff",
                border:"3px solid rgba(255,255,255,.3)",
                boxShadow:"0 4px 20px rgba(0,0,0,.3)",
              }}>
                {doctorName.charAt(0).toUpperCase()}
              </div>
              <div style={{
                position:"absolute", bottom:-4, right:-4,
                background:"#10b981", borderRadius:"50%", padding:4,
                border:"2px solid #fff",
              }}>
                <Stethoscope size={10} color="#fff" />
              </div>
            </div>

            <div>
              <p style={{ color:"rgba(165,180,252,.9)", fontSize:12, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", margin:"0 0 4px" }}>
                Doctor Portal
              </p>
              <h1 style={{ color:"#fff", fontSize:"1.65rem", fontWeight:800, margin:0, lineHeight:1.2 }}>
                {loading ? "Loading…" : `Welcome, ${doctorName}`}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <PulseDot />
                <span style={{ color:"rgba(199,210,254,.85)", fontSize:13, fontWeight:500 }}>
                  {specialty} · Active now
                </span>
              </div>
            </div>
          </div>

          <div style={{
            background:"rgba(255,255,255,.12)", backdropFilter:"blur(12px)",
            borderRadius:14, padding:"10px 18px", border:"1px solid rgba(255,255,255,.18)",
          }}>
            <p style={{ color:"rgba(199,210,254,.7)", fontSize:11, fontWeight:600, margin:"0 0 2px", letterSpacing:"0.1em" }}>TODAY</p>
            <p style={{ color:"#fff", fontSize:15, fontWeight:700, margin:0 }}>
              {new Date().toLocaleDateString("en-US", { weekday:"long", month:"short", day:"numeric", year:"numeric" })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            {
              icon:<Users size={20}/>, label:"Total Patients",
              value: loading ? null : uniquePatients,
              sub: "All-time",
              grad:"linear-gradient(135deg,#6366f1,#818cf8)",
            },
            {
              icon:<Calendar size={20}/>, label:"Today's Shifts",
              value: loading ? null : todaySchedules.length,
              sub:`${acceptedToday} accepted · ${pendingToday} pending`,
              grad:"linear-gradient(135deg,#8b5cf6,#a78bfa)",
            },
            {
              icon:<Video size={20}/>, label:"Video Sessions",
              value: loading ? null : todayVideoSch.length,
              sub:"Today",
              grad:"linear-gradient(135deg,#0ea5e9,#38bdf8)",
            },
            {
              icon:<Star size={20}/>, label:"Avg Rating",
              value: loading ? null : (avgRating || "—"),
              sub:`${feedbacks.length} reviews`,
              grad:"linear-gradient(135deg,#f59e0b,#fbbf24)",
            },
          ].map((s,i) => (
            <div
              key={i}
              className={`fade-up fade-up-${i+1}`}
              style={{
                background: s.grad,
                borderRadius:14, padding:"14px 16px",
                position:"relative", overflow:"hidden",
              }}
            >
              <div className="stat-shine absolute inset-0 rounded-2xl" />
              <div style={{ position:"relative", zIndex:1 }}>
                <div style={{ background:"rgba(255,255,255,.22)", borderRadius:9, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", marginBottom:10 }}>
                  {s.icon}
                </div>
                <p style={{ color:"rgba(255,255,255,.8)", fontSize:11, fontWeight:600, margin:"0 0 4px", letterSpacing:"0.08em", textTransform:"uppercase" }}>{s.label}</p>
                <p style={{ color:"#fff", fontSize:"1.6rem", fontWeight:800, margin:"0 0 2px", lineHeight:1 }}>
                  {loading ? <Loader2 size={18} className="spin" style={{opacity:.7}}/> :
                   typeof s.value === "number" ? <Counter to={s.value}/> : s.value}
                </p>
                <p style={{ color:"rgba(255,255,255,.7)", fontSize:11, margin:0 }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"1.75rem 1.5rem 3rem" }}>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="lg:col-span-2 card fade-up fade-up-3" style={{ overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px 16px", borderBottom:"1px solid #f1f5f9" }}>
              <div className="flex items-center gap-2">
                <div style={{ background:"#eef2ff", borderRadius:9, padding:7 }}>
                  <Calendar size={16} color="#6366f1" />
                </div>
                <h2 style={{ fontSize:17, fontWeight:700, color:"#0f172a", margin:0 }}>Today's Schedule</h2>
              </div>
              <button
                onClick={() => navigate("/doctor/schedule")}
                style={{
                  display:"flex", alignItems:"center", gap:4,
                  background:"#f8faff", border:"1px solid #e2e8f0",
                  borderRadius:9, padding:"6px 12px",
                  fontSize:12, fontWeight:600, color:"#6366f1", cursor:"pointer",
                }}
              >
                View all <ChevronRight size={13} />
              </button>
            </div>

            <div style={{ padding:"16px 24px" }}>
              {loading ? (
                <div style={{ textAlign:"center", padding:"3rem 0", color:"#94a3b8" }}>
                  <Loader2 size={28} className="spin" style={{ margin:"0 auto 10px", display:"block" }} />
                  <p style={{ fontSize:13 }}>Loading schedule…</p>
                </div>
              ) : todaySchedules.length === 0 ? (
                <div style={{ textAlign:"center", padding:"3rem 0" }}>
                  <div style={{ width:56, height:56, borderRadius:"50%", background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                    <Calendar size={24} color="#cbd5e1" />
                  </div>
                  <p style={{ fontWeight:600, color:"#64748b", margin:"0 0 4px" }}>No shifts today</p>
                  <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>Shifts assigned for today will appear here.</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {todaySchedules.map((s, idx) => {
                    const id   = s.id || s._id;
                    const cfg  = statusConfig[s.status] || statusConfig.PENDING;
                    const past = parseTime(s.endTime) < nowMinutes;
                    const isVideo = s.type === "VIDEO";
                    return (
                      <div
                        key={id}
                        style={{
                          display:"flex", alignItems:"center", gap:14,
                          background: past ? "#f8fafc" : "#fafbff",
                          border:`1px solid ${past ? "#e2e8f0" : "#e8eaf6"}`,
                          borderRadius:14, padding:"12px 16px",
                          opacity: past ? 0.6 : 1,
                        }}
                      >
                        <div style={{ minWidth:76, textAlign:"center", background:"#eef2ff", borderRadius:10, padding:"8px 6px" }}>
                          <p style={{ color:"#6366f1", fontWeight:800, fontSize:13, margin:"0 0 2px" }}>{s.startTime}</p>
                          <p style={{ color:"#a5b4fc", fontSize:11, margin:0 }}>{s.endTime}</p>
                        </div>

                        {/* info */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="flex items-center gap-1.5">
                            <Building2 size={13} color="#6366f1" />
                            <p style={{ fontWeight:700, fontSize:14, color:"#1e293b", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {s.hospitalName || "Unknown Hospital"}
                            </p>
                            {isVideo && (
                              <span style={{ background:"#e0f2fe", color:"#0369a1", fontSize:10, fontWeight:700, borderRadius:6, padding:"1px 7px", marginLeft:4 }}>
                                VIDEO
                              </span>
                            )}
                          </div>
                          {s.hospitalLocation && (
                            <p style={{ color:"#94a3b8", fontSize:12, margin:"3px 0 0" }}>📍 {s.hospitalLocation}</p>
                          )}
                        </div>

                        <span style={{ fontSize:11, fontWeight:700, borderRadius:20, padding:"4px 10px", border:"1px solid", whiteSpace:"nowrap" }}
                          className={cfg.cls}>
                          {cfg.label}
                        </span>

                        {/* action */}
                        {s.status === "ACCEPTED" && !past && (
                          <button style={{
                            background:"linear-gradient(135deg,#6366f1,#818cf8)",
                            color:"#fff", fontSize:12, fontWeight:700,
                            border:"none", borderRadius:9, padding:"7px 14px", cursor:"pointer",
                            whiteSpace:"nowrap",
                          }}>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            <div className="card fade-up fade-up-4" style={{ padding:"20px 22px" }}>
              <div className="flex items-center gap-2 mb-4">
                <div style={{ background:"#fef9ec", borderRadius:9, padding:7 }}>
                  <Star size={15} color="#f59e0b" fill="#f59e0b" />
                </div>
                <h3 style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:0 }}>Patient Satisfaction</h3>
              </div>

              {loading ? (
                <div style={{ textAlign:"center", padding:"1.5rem 0" }}>
                  <Loader2 size={22} className="spin" style={{ color:"#94a3b8", margin:"0 auto", display:"block" }} />
                </div>
              ) : (
                <>
                  <div className="flex items-end gap-3 mb-3">
                    <p style={{ fontSize:"3rem", fontWeight:900, color:"#0f172a", lineHeight:1, margin:0 }}>
                      {avgRating || "—"}
                    </p>
                    <div style={{ paddingBottom:6 }}>
                      <div className="flex gap-0.5 mb-1">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} size={14}
                            fill={n <= Math.round(parseFloat(avgRating)) ? "#f59e0b" : "#e2e8f0"}
                            color={n <= Math.round(parseFloat(avgRating)) ? "#f59e0b" : "#e2e8f0"}
                          />
                        ))}
                      </div>
                      <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>{feedbacks.length} reviews</p>
                    </div>
                  </div>

                  {feedbacks.length > 0 && (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {feedbacks.slice(-3).reverse().map((fb, i) => (
                        <div key={i} style={{ background:"#f8faff", borderRadius:10, padding:"10px 12px", border:"1px solid #e8eaf6" }}>
                          <div className="flex items-center gap-1.5 mb-1">
                            {[1,2,3,4,5].map(n=>(
                              <Star key={n} size={11}
                                fill={n<=fb.rating?"#f59e0b":"#e2e8f0"}
                                color={n<=fb.rating?"#f59e0b":"#e2e8f0"}
                              />
                            ))}
                          </div>
                          {fb.comment && (
                            <p style={{ fontSize:12, color:"#64748b", margin:0, fontStyle:"italic", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                              "{fb.comment}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {feedbacks.length === 0 && (
                    <p style={{ fontSize:13, color:"#94a3b8", textAlign:"center", padding:"1rem 0", margin:0 }}>No feedback yet</p>
                  )}
                </>
              )}
            </div>

            <div className="card fade-up fade-up-5" style={{ padding:"20px 22px" }}>
              <div className="flex items-center gap-2 mb-4">
                <div style={{ background:"#eef2ff", borderRadius:9, padding:7 }}>
                  <BarChart3 size={15} color="#6366f1" />
                </div>
                <h3 style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:0 }}>Schedule Overview</h3>
              </div>

              {loading ? (
                <Loader2 size={20} className="spin" style={{ color:"#94a3b8", display:"block", margin:"1rem auto" }} />
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { label:"Accepted",  pct:accPct,  color:"#10b981", bg:"#d1fae5" },
                    { label:"Pending",   pct:pendPct, color:"#f59e0b", bg:"#fef3c7" },
                    { label:"Rejected",  pct:rejPct,  color:"#ef4444", bg:"#fee2e2" },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span style={{ fontSize:12, fontWeight:600, color:"#64748b" }}>{item.label}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{item.pct}%</span>
                      </div>
                      <div style={{ background:"#f1f5f9", borderRadius:99, height:7, overflow:"hidden" }}>
                        <div className="bar-fill" style={{
                          width:`${item.pct}%`, height:"100%",
                          background: item.color, borderRadius:99,
                        }} />
                      </div>
                    </div>
                  ))}
                  <p style={{ fontSize:11, color:"#94a3b8", margin:"6px 0 0", textAlign:"right" }}>
                    {schedules.length} total schedules
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">

          {/* Recent Patients */}
          <div className="lg:col-span-2 card fade-up fade-up-4" style={{ overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px 16px", borderBottom:"1px solid #f1f5f9" }}>
              <div className="flex items-center gap-2">
                <div style={{ background:"#fdf2f8", borderRadius:9, padding:7 }}>
                  <Users size={16} color="#d946ef" />
                </div>
                <h2 style={{ fontSize:17, fontWeight:700, color:"#0f172a", margin:0 }}>Recent Patients</h2>
              </div>
              <button
                onClick={() => navigate("/doctor/mypatients")}
                style={{
                  display:"flex", alignItems:"center", gap:4,
                  background:"#f8faff", border:"1px solid #e2e8f0",
                  borderRadius:9, padding:"6px 12px",
                  fontSize:12, fontWeight:600, color:"#6366f1", cursor:"pointer",
                }}
              >
                View all <ChevronRight size={13} />
              </button>
            </div>

            <div style={{ padding:"12px 24px 16px" }}>
              {loading ? (
                <div style={{ textAlign:"center", padding:"2.5rem 0", color:"#94a3b8" }}>
                  <Loader2 size={24} className="spin" style={{ display:"block", margin:"0 auto 8px" }} />
                  <p style={{ fontSize:13, margin:0 }}>Loading patients…</p>
                </div>
              ) : recentPatients.length === 0 ? (
                <div style={{ textAlign:"center", padding:"2.5rem 0" }}>
                  <Users size={32} color="#cbd5e1" style={{ display:"block", margin:"0 auto 10px" }} />
                  <p style={{ fontWeight:600, color:"#64748b", margin:"0 0 4px" }}>No patients yet</p>
                  <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>Booked patients will appear here.</p>
                </div>
              ) : (
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      {["Patient","Date","Time","Appt No.","Status"].map(h=>(
                        <th key={h} style={{ textAlign:"left", fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.1em", padding:"8px 10px 8px 0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentPatients.map((a,i)=>(
                      <tr key={a.id||i} style={{ borderTop:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"10px 10px 10px 0" }}>
                          <div className="flex items-center gap-2.5">
                            <div style={{
                              width:34, height:34, borderRadius:"50%", flexShrink:0,
                              background:`hsl(${(i*57+220)%360},60%,62%)`,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontWeight:700, color:"#fff", fontSize:13,
                              overflow:"hidden",
                            }}>
                              {a.profileImage
                                ? <img src={a.profileImage} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
                                : (a.patientName||"P").charAt(0).toUpperCase()
                              }
                            </div>
                            <div>
                              <p style={{ fontWeight:700, fontSize:13, color:"#1e293b", margin:0, whiteSpace:"nowrap" }}>{a.patientName||"Unknown"}</p>
                              <p style={{ fontSize:11, color:"#94a3b8", margin:0 }}>ID: {a.patientId}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize:13, color:"#64748b", padding:"10px 10px 10px 0", whiteSpace:"nowrap" }}>{a.date}</td>
                        <td style={{ fontSize:13, color:"#64748b", padding:"10px 10px 10px 0", whiteSpace:"nowrap" }}>{a.time}</td>
                        <td style={{ padding:"10px 10px 10px 0" }}>
                          <span style={{ background:"#eef2ff", color:"#6366f1", fontSize:12, fontWeight:700, borderRadius:7, padding:"3px 9px" }}>#{a.appointmentNumber}</span>
                        </td>
                        <td style={{ padding:"10px 0" }}>
                          <span style={{ background:"#d1fae5", color:"#065f46", fontSize:11, fontWeight:700, borderRadius:99, padding:"3px 10px", textTransform:"uppercase" }}>
                            {a.status||"Confirmed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            <div
              className="card fade-up fade-up-5 glow"
              style={{
                background:"linear-gradient(135deg,#1e3a8a,#312e81)",
                padding:"20px 22px", color:"#fff",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap size={15} color="#fbbf24" fill="#fbbf24" />
                <p style={{ fontSize:12, fontWeight:700, color:"rgba(199,210,254,.8)", margin:0, textTransform:"uppercase", letterSpacing:"0.1em" }}>Next Shift</p>
              </div>
              {loading ? (
                <Loader2 size={20} className="spin" style={{ color:"rgba(255,255,255,.5)", display:"block" }} />
              ) : nextShift ? (
                <>
                  <p style={{ fontSize:"1.8rem", fontWeight:900, margin:"0 0 6px", lineHeight:1 }}>{nextShift.startTime}</p>
                  <p style={{ fontSize:13, color:"rgba(199,210,254,.8)", margin:"0 0 10px" }}>
                    ends {nextShift.endTime}
                  </p>
                  <div style={{ background:"rgba(255,255,255,.12)", borderRadius:10, padding:"8px 12px" }}>
                    <p style={{ fontSize:13, fontWeight:700, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {nextShift.hospitalName||"Hospital"}
                    </p>
                    {nextShift.hospitalLocation && (
                      <p style={{ fontSize:11, color:"rgba(199,210,254,.7)", margin:"3px 0 0" }}>📍 {nextShift.hospitalLocation}</p>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign:"center", padding:"0.75rem 0" }}>
                  <p style={{ fontSize:15, fontWeight:700, margin:"0 0 4px" }}>No upcoming shifts</p>
                  <p style={{ fontSize:12, color:"rgba(199,210,254,.7)", margin:0 }}>You're all clear for today!</p>
                </div>
              )}
            </div>

            {/* quick actions */}
            <div className="card fade-up fade-up-6" style={{ padding:"18px 20px" }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 12px" }}>Quick Actions</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { icon:<Calendar size={15}/>, label:"My Schedule",   path:"/doctor/schedule",   grad:"#6366f1,#818cf8" },
                  { icon:<Users size={15}/>,    label:"My Patients",   path:"/doctor/mypatients", grad:"#ec4899,#f472b6" },
                  { icon:<Video size={15}/>,    label:"Video Sessions",path:"/doctor/video",       grad:"#0ea5e9,#38bdf8" },
                  { icon:<FileText size={15}/>, label:"My Profile",    path:"/doctor/account",    grad:"#10b981,#34d399" },
                ].map((a,i)=>(
                  <button
                    key={i}
                    onClick={() => navigate(a.path)}
                    style={{
                      display:"flex", alignItems:"center", gap:10,
                      background:`linear-gradient(135deg,${a.grad})`,
                      color:"#fff", border:"none", borderRadius:11,
                      padding:"10px 14px", cursor:"pointer", width:"100%",
                      textAlign:"left", fontSize:13, fontWeight:700,
                      boxShadow:"0 2px 8px rgba(0,0,0,.08)",
                      transition:"transform .15s,box-shadow .15s",
                    }}
                    onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,.14)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,.08)"; }}
                  >
                    <span style={{ background:"rgba(255,255,255,.22)", borderRadius:7, padding:"5px", display:"flex" }}>{a.icon}</span>
                    {a.label}
                    <ArrowUpRight size={13} style={{ marginLeft:"auto", opacity:.7 }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {!loading && videoSchedules.length > 0 && (
          <div className="card fade-up fade-up-6 mt-5" style={{ overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px 14px", borderBottom:"1px solid #f1f5f9" }}>
              <div className="flex items-center gap-2">
                <div style={{ background:"#e0f2fe", borderRadius:9, padding:7 }}>
                  <Video size={15} color="#0ea5e9" />
                </div>
                <h2 style={{ fontSize:16, fontWeight:700, color:"#0f172a", margin:0 }}>Video Consultations</h2>
              </div>
              <button
                onClick={() => navigate("/doctor/video")}
                style={{
                  display:"flex", alignItems:"center", gap:4,
                  background:"#f8faff", border:"1px solid #e2e8f0",
                  borderRadius:9, padding:"6px 12px",
                  fontSize:12, fontWeight:600, color:"#0ea5e9", cursor:"pointer",
                }}
              >
                Manage <ChevronRight size={13} />
              </button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12, padding:16 }}>
              {videoSchedules.slice(0,4).map((s,i)=>{
                const cfg = statusConfig[s.status]||statusConfig.PENDING;
                return (
                  <div key={s.id||s._id||i} style={{
                    background:"#f8faff", border:"1px solid #e8eaf6",
                    borderRadius:12, padding:"12px 14px",
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize:12, fontWeight:700, color:"#0369a1", background:"#e0f2fe", borderRadius:7, padding:"2px 8px" }}>VIDEO</span>
                      <span style={{ fontSize:11, fontWeight:700, border:"1px solid", borderRadius:99, padding:"2px 8px" }} className={cfg.cls}>{cfg.label}</span>
                    </div>
                    <p style={{ fontWeight:700, fontSize:14, color:"#1e293b", margin:"0 0 2px" }}>{s.date}</p>
                    <p style={{ fontSize:13, color:"#64748b", margin:"0 0 6px" }}>{s.startTime} – {s.endTime}</p>
                    {s.patientName && <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>👤 {s.patientName}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{
          marginTop:24, borderRadius:16,
          background:"linear-gradient(135deg,#f8faff,#eef2ff)",
          border:"1px solid #e8eaf6", padding:"14px 22px",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8,
        }}>
          <div className="flex items-center gap-2">
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>
              Caring for <strong style={{ color:"#0f172a" }}>{loading ? "…" : uniquePatients}</strong> patients · {schedules.length} total schedules
            </span>
          </div>
          <div className="flex items-center gap-2">
            <PulseDot />
            <span style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>Live data · refreshes on load</span>
          </div>
        </div>

      </div>
    </div>
  );
}