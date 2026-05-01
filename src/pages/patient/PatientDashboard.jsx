import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  Calendar, FileText, Search, Activity, Bell,
  ChevronRight, Heart, FlaskConical, Video,
  Stethoscope, Clock, CheckCircle2, AlertTriangle,
  TrendingUp, Star, ArrowUpRight, Loader2, Users,
  MessageSquare, CreditCard, ClipboardList
} from "lucide-react";

/* ─── helpers ───────────────────────────────── */
const todayISO = new Date().toISOString().split("T")[0];

function Counter({ to, suffix = "" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!to) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 800, 1);
      setV(Math.floor(p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to]);
  return <>{v}{suffix}</>;
}

function Pulse({ color = "bg-emerald-400" }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
}

/* ═══════════════════════════════════════════════ */
export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const patientId = user?.id;

  /* ── data state ── */
  const [appointments,  setAppointments]  = useState([]);
  const [doctors,       setDoctors]       = useState([]);
  const [hospitals,     setHospitals]     = useState([]);
  const [medHistory,    setMedHistory]    = useState([]);
  const [labTests,      setLabTests]      = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedbacks,     setFeedbacks]     = useState([]);
  const [loading,       setLoading]       = useState(true);

  /* ── fetch all ── */
  useEffect(() => {
    if (!patientId) { setLoading(false); return; }
    const token = localStorage.getItem("token");
    const auth  = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    (async () => {
      try {
        const [apptR, docR, hospR, medR, labR, notifR] = await Promise.allSettled([
          fetch(`http://localhost:8082/api/appointments/patient/${patientId}`, { headers: auth }),
          fetch("http://localhost:8082/api/hospital/doctors/assigned-all"),
          fetch("http://localhost:8082/api/hospital/doctors/all-hospitals"),
          axios.get(`http://localhost:8082/api/medical-records/patient/${patientId}`),
          axios.get(`http://localhost:8082/api/lab/patient/${patientId}`),
          axios.get(`http://localhost:8082/api/notifications/patient/${patientId}`),
        ]);

        if (apptR.status  === "fulfilled" && apptR.value.ok)  setAppointments(await apptR.value.json());
        if (docR.status   === "fulfilled" && docR.value.ok)   setDoctors(await docR.value.json());
        if (hospR.status  === "fulfilled" && hospR.value.ok)  setHospitals(await hospR.value.json());
        if (medR.status   === "fulfilled")  setMedHistory(medR.value?.data   || []);
        if (labR.status   === "fulfilled")  setLabTests(labR.value?.data     || []);
        if (notifR.status === "fulfilled")  setNotifications(notifR.value?.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [patientId]);

  /* ── derived ── */
  const getDoctorName = (id) => {
    const d = doctors.find(x => x.id === id);
    return d ? `${d.title || ""} ${d.firstName || ""} ${d.lastName || ""}`.trim() : "Doctor";
  };
  const getHospitalName = (id) => {
    const h = hospitals.find(x => x.id === id);
    return h ? h.name : "Hospital";
  };

  const todayAppts     = appointments.filter(a => a.date === todayISO || a.date?.startsWith(todayISO));
  const upcomingAppts  = appointments.filter(a => new Date(a.date) >= new Date(todayISO));
  const nextAppt       = [...upcomingAppts].sort((a,b) => new Date(a.date) - new Date(b.date))[0];
  const unpaidLabs     = labTests.filter(t => !t.isPaid && !t.paid);
  const unreadNotifs   = notifications.filter(n => !n.read);
  const uniqueDoctorIds= [...new Set(appointments.map(a => a.doctorId))];
  const videoAppts     = appointments.filter(a => a.consultationType === "VIDEO");
  const recentHistory  = [...medHistory].sort((a,b) => new Date(b.dateOfVisit) - new Date(a.dateOfVisit)).slice(0,3);

  /* ── greeting ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  /* ═══════════════ RENDER ═══════════════════ */
  return (
    <div style={{ fontFamily:"'DM Sans','Nunito',sans-serif", background:"#f0f4ff", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Lora:wght@600;700&display=swap');
        .card { background:#fff; border-radius:20px; box-shadow:0 1px 3px rgba(0,30,80,.06),0 4px 20px rgba(0,30,80,.05); }
        .card-hover { transition:transform .2s,box-shadow .2s; }
        .card-hover:hover { transform:translateY(-3px); box-shadow:0 8px 32px rgba(0,30,80,.10); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .fu  { animation:fadeUp .5s ease both; }
        .fu1 { animation-delay:.04s } .fu2 { animation-delay:.08s }
        .fu3 { animation-delay:.12s } .fu4 { animation-delay:.16s }
        .fu5 { animation-delay:.20s } .fu6 { animation-delay:.24s }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spin { animation:spin .9s linear infinite }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.35)} 50%{box-shadow:0 0 0 10px rgba(99,102,241,0)} }
        .pulse-glow { animation:pulse-glow 2.4s ease infinite; }
        .bar { transition:width 1s cubic-bezier(.4,0,.2,1); }
        .qbtn { display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:14px 10px;border-radius:14px;border:1.5px solid transparent;cursor:pointer;transition:all .18s;font-size:12px;font-weight:700;background:#fff; }
        .qbtn:hover { transform:translateY(-3px); }
      `}</style>

      {/* ══ HERO BANNER ══════════════════════════════════════ */}
      <div style={{
        background:"linear-gradient(135deg,#0c1b6b 0%,#1a3a9a 55%,#2d5be3 100%)",
        padding:"2rem 2.5rem 6rem",
        position:"relative", overflow:"hidden",
      }}>
        {/* decorative blobs */}
        <div style={{ position:"absolute", top:-80, right:-80, width:280, height:280, borderRadius:"50%", background:"rgba(255,255,255,.06)" }} />
        <div style={{ position:"absolute", bottom:-60, left:60, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,.04)" }} />
        <div style={{ position:"absolute", top:30, right:220, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,.05)" }} />

        <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Pulse />
              <span style={{ color:"rgba(165,180,252,.85)", fontSize:12, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" }}>
                Patient Portal
              </span>
            </div>
            <h1 style={{ color:"#fff", fontSize:"clamp(1.6rem,3vw,2.1rem)", fontWeight:800, margin:"0 0 6px", fontFamily:"'Lora',serif" }}>
              {greeting}, {user?.name?.split(" ")[0] || "Patient"} 👋
            </h1>
            <p style={{ color:"rgba(199,210,254,.75)", fontSize:14, margin:0 }}>
              Here's your complete health overview for today
            </p>
          </div>

          <div style={{
            background:"rgba(255,255,255,.12)", backdropFilter:"blur(12px)",
            borderRadius:14, padding:"10px 18px", border:"1px solid rgba(255,255,255,.18)",
            flexShrink:0,
          }}>
            <p style={{ color:"rgba(199,210,254,.65)", fontSize:10, fontWeight:700, margin:"0 0 2px", letterSpacing:"0.1em", textTransform:"uppercase" }}>Today</p>
            <p style={{ color:"#fff", fontSize:14, fontWeight:700, margin:0 }}>
              {new Date().toLocaleDateString("en-US", { weekday:"long", month:"short", day:"numeric", year:"numeric" })}
            </p>
          </div>
        </div>

        {/* ── STAT PILLS inside banner ── */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { icon:<Calendar size={18}/>, label:"Total Appts",  value:loading?null:appointments.length,    grad:"linear-gradient(135deg,#6366f1,#818cf8)" },
            { icon:<Users size={18}/>,    label:"My Doctors",   value:loading?null:uniqueDoctorIds.length,  grad:"linear-gradient(135deg,#ec4899,#f472b6)" },
            { icon:<ClipboardList size={18}/>, label:"Med Records", value:loading?null:medHistory.length,  grad:"linear-gradient(135deg,#0ea5e9,#38bdf8)" },
            { icon:<FlaskConical size={18}/>, label:"Lab Tests",  value:loading?null:labTests.length,       grad:"linear-gradient(135deg,#10b981,#34d399)" },
          ].map((s,i)=>(
            <div key={i} className={`fu fu${i+1}`} style={{
              background:s.grad, borderRadius:14, padding:"14px 16px",
              position:"relative", overflow:"hidden",
            }}>
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.03))", borderRadius:14 }} />
              <div style={{ position:"relative", zIndex:1 }}>
                <div style={{ background:"rgba(255,255,255,.2)", borderRadius:9, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", marginBottom:8 }}>
                  {s.icon}
                </div>
                <p style={{ color:"rgba(255,255,255,.75)", fontSize:10, fontWeight:700, margin:"0 0 3px", letterSpacing:"0.1em", textTransform:"uppercase" }}>{s.label}</p>
                <p style={{ color:"#fff", fontSize:"1.7rem", fontWeight:900, margin:0, lineHeight:1 }}>
                  {loading ? <Loader2 size={16} className="spin" style={{opacity:.7}}/> : <Counter to={s.value}/>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ BODY (overlaps banner) ═══════════════════════════ */}
      <div style={{ maxWidth:1280, margin:"-3.5rem auto 0", padding:"0 1.5rem 3rem", position:"relative", zIndex:10 }}>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT: Next Appointment hero card + Today's list ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* NEXT APPOINTMENT CARD */}
            <div className={`fu fu1 ${!nextAppt ? "card" : ""}`} style={{ borderRadius:22, overflow:"hidden" }}>
              {loading ? (
                <div className="card" style={{ padding:"2.5rem", textAlign:"center" }}>
                  <Loader2 size={28} className="spin" style={{ display:"block", margin:"0 auto 10px", color:"#6366f1" }} />
                  <p style={{ color:"#94a3b8", fontSize:14 }}>Loading your appointments…</p>
                </div>
              ) : nextAppt ? (
                <div style={{
                  background:"linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#3b82f6 100%)",
                  padding:"24px 28px", color:"#fff", position:"relative", overflow:"hidden",
                  boxShadow:"0 8px 40px rgba(37,99,235,.35)",
                }}>
                  {/* bg circles */}
                  <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,.07)" }} />
                  <div style={{ position:"absolute", bottom:-40, left:40, width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,.05)" }} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <span style={{ background:"rgba(255,255,255,.15)", backdropFilter:"blur(8px)", borderRadius:99, padding:"4px 12px", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>
                          {nextAppt.date === todayISO ? "🟢 Today" : `📅 ${nextAppt.date}`}
                        </span>
                        <h2 style={{ fontSize:"1.35rem", fontWeight:800, margin:"10px 0 4px", fontFamily:"'Lora',serif" }}>
                          {getDoctorName(nextAppt.doctorId)}
                        </h2>
                        <div className="flex items-center gap-2">
                          <Stethoscope size={13} color="rgba(199,210,254,.8)" />
                          <p style={{ color:"rgba(199,210,254,.85)", fontSize:13, margin:0 }}>
                            {getHospitalName(nextAppt.hospitalId)}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ fontSize:"2.2rem", fontWeight:900, margin:0, lineHeight:1 }}>{nextAppt.time}</p>
                        <span style={{
                          display:"inline-block", marginTop:6,
                          background: nextAppt.status === "CONFIRMED" ? "rgba(16,185,129,.25)" : "rgba(251,191,36,.25)",
                          border: `1px solid ${nextAppt.status === "CONFIRMED" ? "rgba(52,211,153,.5)" : "rgba(251,191,36,.5)"}`,
                          color: nextAppt.status === "CONFIRMED" ? "#34d399" : "#fbbf24",
                          fontSize:11, fontWeight:700, borderRadius:99, padding:"3px 10px",
                        }}>
                          {nextAppt.status || "Scheduled"}
                        </span>
                      </div>
                    </div>

                    {/* Queue info */}
                    <div style={{ background:"rgba(255,255,255,.12)", backdropFilter:"blur(12px)", borderRadius:14, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div className="flex items-center gap-6">
                        <div style={{ textAlign:"center" }}>
                          <p style={{ fontSize:10, color:"rgba(165,180,252,.8)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 4px" }}>Appt No.</p>
                          <p style={{ fontSize:"1.8rem", fontWeight:900, margin:0, lineHeight:1 }}>#{nextAppt.appointmentNumber || "—"}</p>
                        </div>
                        <div style={{ width:1, height:40, background:"rgba(165,180,252,.35)" }} />
                        <div style={{ textAlign:"center" }}>
                          <p style={{ fontSize:10, color:"rgba(165,180,252,.8)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 4px" }}>Type</p>
                          <p style={{ fontSize:13, fontWeight:800, margin:0, color: nextAppt.consultationType==="VIDEO" ? "#34d399" : "#a5b4fc" }}>
                            {nextAppt.consultationType || "PHYSICAL"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/patient/appointments")}
                        style={{
                          background:"#fff", color:"#1e3a8a", fontSize:12, fontWeight:800,
                          border:"none", borderRadius:10, padding:"9px 16px", cursor:"pointer",
                          boxShadow:"0 2px 12px rgba(0,0,0,.15)",
                        }}
                      >
                        View Ticket →
                      </button>
                    </div>

                    {/* unpaid labs warning */}
                    {unpaidLabs.length > 0 && (
                      <div style={{ marginTop:12, background:"rgba(251,191,36,.15)", borderRadius:10, padding:"10px 14px", border:"1px solid rgba(251,191,36,.35)", display:"flex", alignItems:"center", gap:8 }}>
                        <AlertTriangle size={15} color="#fbbf24" />
                        <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,.9)" }}>
                          {unpaidLabs.length} unpaid lab test{unpaidLabs.length>1?"s":""} pending payment
                        </span>
                        <button onClick={()=>navigate("/patient/reports")} style={{ marginLeft:"auto", fontSize:11, fontWeight:800, color:"#fbbf24", background:"none", border:"none", cursor:"pointer" }}>Pay Now →</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card" style={{ padding:"2.5rem", textAlign:"center" }}>
                  <div style={{ width:60, height:60, borderRadius:"50%", background:"#eef2ff", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                    <Calendar size={26} color="#6366f1" />
                  </div>
                  <h3 style={{ fontWeight:700, color:"#1e293b", margin:"0 0 6px" }}>No upcoming appointments</h3>
                  <p style={{ fontSize:13, color:"#94a3b8", margin:"0 0 16px" }}>Feeling unwell? Find a specialist in seconds.</p>
                  <button
                    onClick={() => navigate("/find-doctor")}
                    style={{ background:"linear-gradient(135deg,#6366f1,#818cf8)", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", fontWeight:700, fontSize:13, cursor:"pointer" }}
                  >
                    Book a Consultation
                  </button>
                </div>
              )}
            </div>

            {/* TODAY'S APPOINTMENTS LIST */}
            {!loading && todayAppts.length > 0 && (
              <div className="card fu fu2" style={{ overflow:"hidden" }}>
                <div style={{ padding:"18px 22px 14px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div className="flex items-center gap-2">
                    <div style={{ background:"#eef2ff", borderRadius:9, padding:7 }}>
                      <Calendar size={15} color="#6366f1" />
                    </div>
                    <h3 style={{ fontSize:16, fontWeight:700, color:"#0f172a", margin:0 }}>Today's Appointments</h3>
                    <span style={{ background:"#eef2ff", color:"#6366f1", fontSize:11, fontWeight:800, borderRadius:99, padding:"2px 8px" }}>{todayAppts.length}</span>
                  </div>
                  <button onClick={()=>navigate("/patient/appointments")} style={{ display:"flex", alignItems:"center", gap:4, background:"#f8faff", border:"1px solid #e2e8f0", borderRadius:9, padding:"6px 12px", fontSize:12, fontWeight:600, color:"#6366f1", cursor:"pointer" }}>
                    All <ChevronRight size={13}/>
                  </button>
                </div>
                <div style={{ padding:"12px 20px 16px", display:"flex", flexDirection:"column", gap:10 }}>
                  {todayAppts.map((a,i)=>(
                    <div key={a.id||i} style={{ display:"flex", alignItems:"center", gap:14, background:"#f8faff", border:"1px solid #e8eaf6", borderRadius:12, padding:"12px 16px" }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background: a.status==="CONFIRMED"?"#10b981":a.status==="PENDING"?"#f59e0b":"#6366f1", flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:700, fontSize:14, color:"#1e293b", margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {getDoctorName(a.doctorId)}
                        </p>
                        <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>{getHospitalName(a.hospitalId)}</p>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ fontWeight:700, fontSize:13, color:"#6366f1", margin:"0 0 2px" }}>{a.time}</p>
                        <span style={{ fontSize:10, fontWeight:700, color: a.consultationType==="VIDEO"?"#0ea5e9":"#64748b" }}>
                          {a.consultationType || "PHYSICAL"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RECENT MEDICAL HISTORY */}
            <div className="card fu fu3" style={{ overflow:"hidden" }}>
              <div style={{ padding:"18px 22px 14px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div className="flex items-center gap-2">
                  <div style={{ background:"#fdf4ff", borderRadius:9, padding:7 }}>
                    <ClipboardList size={15} color="#a855f7" />
                  </div>
                  <h3 style={{ fontSize:16, fontWeight:700, color:"#0f172a", margin:0 }}>Recent Medical History</h3>
                </div>
                <button onClick={()=>navigate("/patient/medical-history")} style={{ display:"flex", alignItems:"center", gap:4, background:"#f8faff", border:"1px solid #e2e8f0", borderRadius:9, padding:"6px 12px", fontSize:12, fontWeight:600, color:"#a855f7", cursor:"pointer" }}>
                  View All <ChevronRight size={13}/>
                </button>
              </div>

              <div style={{ padding:"12px 20px 16px" }}>
                {loading ? (
                  <div style={{ textAlign:"center", padding:"2rem 0" }}>
                    <Loader2 size={22} className="spin" style={{ display:"block", margin:"0 auto 8px", color:"#a855f7" }} />
                  </div>
                ) : recentHistory.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"2rem 0" }}>
                    <ClipboardList size={30} color="#e2e8f0" style={{ display:"block", margin:"0 auto 8px" }} />
                    <p style={{ fontSize:13, color:"#94a3b8", margin:0 }}>No medical records yet.</p>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {recentHistory.map((r,i)=>(
                      <div key={r.id||i} style={{ background:"#f8faff", border:"1px solid #e8eaf6", borderRadius:12, padding:"14px 16px", borderLeft:"4px solid #6366f1" }}>
                        <div className="flex items-start justify-between">
                          <div style={{ flex:1 }}>
                            <p style={{ fontWeight:700, fontSize:14, color:"#1e293b", margin:"0 0 4px" }}>{r.conditions || "Visit record"}</p>
                            <p style={{ fontSize:12, color:"#64748b", margin:"0 0 6px" }}>
                              👨‍⚕️ {r.doctorName} · 🏥 {r.hospitalName}
                            </p>
                            {r.medications && (
                              <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>💊 {r.medications}</p>
                            )}
                          </div>
                          <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
                            <p style={{ fontSize:11, fontWeight:700, color:"#6366f1", margin:"0 0 4px" }}>{r.dateOfVisit}</p>
                            {r.followUp && r.followUp !== "No" && (
                              <span style={{ fontSize:10, fontWeight:700, background:"#fef3c7", color:"#92400e", borderRadius:99, padding:"2px 8px" }}>
                                Follow-up: {r.followUp}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* QUICK ACTIONS */}
            <div className="card fu fu2" style={{ padding:"18px 18px 16px" }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 14px" }}>Quick Actions</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { icon:<Search size={20}/>,      label:"Find Doctor",    path:"/find-doctor",            color:"#6366f1", bg:"#eef2ff", border:"#c7d2fe" },
                  { icon:<Calendar size={20}/>,    label:"Appointments",   path:"/patient/appointments",   color:"#0ea5e9", bg:"#e0f2fe", border:"#bae6fd" },
                  { icon:<ClipboardList size={20}/>,label:"Med History",   path:"/patient/medical-history",color:"#a855f7", bg:"#faf5ff", border:"#e9d5ff" },
                  { icon:<FlaskConical size={20}/>, label:"Lab Reports",   path:"/patient/reports",        color:"#10b981", bg:"#ecfdf5", border:"#a7f3d0" },
                  { icon:<Video size={20}/>,        label:"Video Consult", path:"/patient/appointments",   color:"#f59e0b", bg:"#fffbeb", border:"#fde68a" },
                  { icon:<MessageSquare size={20}/>,label:"Feedback",      path:"/patient/add-feedback",   color:"#ec4899", bg:"#fdf2f8", border:"#fbcfe8" },
                ].map((a,i)=>(
                  <button key={i} className="qbtn" onClick={()=>navigate(a.path)}
                    style={{ background:a.bg, borderColor:a.border, color:a.color }}
                    onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 6px 20px ${a.bg}`; }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
                  >
                    {a.icon}
                    <span style={{ color:"#1e293b", fontSize:11 }}>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* NOTIFICATIONS */}
            <div className="card fu fu3" style={{ overflow:"hidden" }}>
              <div style={{ padding:"16px 18px 12px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div className="flex items-center gap-2">
                  <div style={{ background:"#fff7ed", borderRadius:9, padding:7, position:"relative" }}>
                    <Bell size={15} color="#f97316" />
                    {unreadNotifs.length > 0 && (
                      <span style={{ position:"absolute", top:-4, right:-4, background:"#ef4444", color:"#fff", fontSize:9, fontWeight:800, borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {unreadNotifs.length}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:0 }}>Notifications</h3>
                </div>
              </div>
              <div style={{ padding:"10px 16px 14px", maxHeight:220, overflowY:"auto" }}>
                {loading ? (
                  <Loader2 size={18} className="spin" style={{ display:"block", margin:"1rem auto", color:"#f97316" }} />
                ) : notifications.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"1.5rem 0" }}>
                    <Bell size={22} color="#e2e8f0" style={{ display:"block", margin:"0 auto 6px" }} />
                    <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0,5).map((n,i)=>(
                    <div key={n.id||i} style={{
                      padding:"10px 12px", borderRadius:10, marginBottom:8,
                      background: n.read ? "#f8fafc" : "#fff7ed",
                      border:`1px solid ${n.read ? "#e2e8f0" : "#fed7aa"}`,
                    }}>
                      <p style={{ fontSize:13, fontWeight: n.read ? 500 : 700, color:"#1e293b", margin:"0 0 3px" }}>{n.message}</p>
                      <p style={{ fontSize:11, color:"#94a3b8", margin:0 }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* LAB TESTS SUMMARY */}
            <div className="card fu fu4" style={{ padding:"18px 18px 16px" }}>
              <div className="flex items-center gap-2 mb-4">
                <div style={{ background:"#ecfdf5", borderRadius:9, padding:7 }}>
                  <FlaskConical size={15} color="#10b981" />
                </div>
                <h3 style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:0 }}>Lab Tests</h3>
              </div>

              {loading ? (
                <Loader2 size={18} className="spin" style={{ display:"block", margin:"0.5rem auto", color:"#10b981" }} />
              ) : labTests.length === 0 ? (
                <p style={{ fontSize:13, color:"#94a3b8", textAlign:"center", margin:"0.5rem 0" }}>No lab tests found.</p>
              ) : (
                <>
                  {/* progress bars */}
                  {[
                    { label:"Paid",    count:labTests.filter(t=>t.isPaid||t.paid).length, color:"#10b981" },
                    { label:"Pending", count:unpaidLabs.length,                            color:"#f59e0b" },
                    { label:"Reported",count:labTests.filter(t=>t.reportStatus==="Uploaded").length, color:"#6366f1" },
                  ].map(item=>(
                    <div key={item.label} style={{ marginBottom:10 }}>
                      <div className="flex justify-between" style={{ marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:"#64748b" }}>{item.label}</span>
                        <span style={{ fontSize:12, fontWeight:800, color:"#0f172a" }}>{item.count}</span>
                      </div>
                      <div style={{ background:"#f1f5f9", borderRadius:99, height:6, overflow:"hidden" }}>
                        <div className="bar" style={{ width:`${labTests.length ? (item.count/labTests.length)*100 : 0}%`, height:"100%", background:item.color, borderRadius:99 }} />
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>navigate("/patient/reports")} style={{ width:"100%", marginTop:8, background:"#ecfdf5", color:"#065f46", border:"1px solid #a7f3d0", borderRadius:10, padding:"8px 0", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    View All Lab Reports →
                  </button>
                </>
              )}
            </div>

            {/* APPOINTMENTS SUMMARY BREAKDOWN */}
            <div className="card fu fu5" style={{ padding:"18px 18px 16px" }}>
              <div className="flex items-center gap-2 mb-4">
                <div style={{ background:"#eef2ff", borderRadius:9, padding:7 }}>
                  <TrendingUp size={15} color="#6366f1" />
                </div>
                <h3 style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:0 }}>Appointment Breakdown</h3>
              </div>

              {loading ? (
                <Loader2 size={18} className="spin" style={{ display:"block", margin:"0.5rem auto", color:"#6366f1" }} />
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { label:"Confirmed", count:appointments.filter(a=>a.status==="CONFIRMED").length, color:"#10b981" },
                    { label:"Pending",   count:appointments.filter(a=>a.status==="PENDING").length,   color:"#f59e0b" },
                    { label:"Completed", count:appointments.filter(a=>a.status==="COMPLETED").length, color:"#6366f1" },
                    { label:"Video",     count:videoAppts.length,                                     color:"#0ea5e9" },
                  ].map(item=>(
                    <div key={item.label}>
                      <div className="flex justify-between" style={{ marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:"#64748b" }}>{item.label}</span>
                        <span style={{ fontSize:12, fontWeight:800, color:"#0f172a" }}>{item.count}</span>
                      </div>
                      <div style={{ background:"#f1f5f9", borderRadius:99, height:6, overflow:"hidden" }}>
                        <div className="bar" style={{ width:`${appointments.length ? (item.count/appointments.length)*100 : 0}%`, height:"100%", background:item.color, borderRadius:99 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ══ ROW 2: My Doctors ═══════════════════════════════ */}
        {!loading && uniqueDoctorIds.length > 0 && (
          <div className="card fu fu5 mt-5" style={{ overflow:"hidden" }}>
            <div style={{ padding:"18px 22px 14px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div className="flex items-center gap-2">
                <div style={{ background:"#fdf2f8", borderRadius:9, padding:7 }}>
                  <Stethoscope size={15} color="#ec4899" />
                </div>
                <h3 style={{ fontSize:16, fontWeight:700, color:"#0f172a", margin:0 }}>My Doctors</h3>
                <span style={{ background:"#fdf2f8", color:"#ec4899", fontSize:11, fontWeight:800, borderRadius:99, padding:"2px 8px" }}>{uniqueDoctorIds.length}</span>
              </div>
              <button onClick={()=>navigate("/patient/my-doctors")} style={{ display:"flex", alignItems:"center", gap:4, background:"#f8faff", border:"1px solid #e2e8f0", borderRadius:9, padding:"6px 12px", fontSize:12, fontWeight:600, color:"#ec4899", cursor:"pointer" }}>
                View All <ChevronRight size={13}/>
              </button>
            </div>
            <div style={{ padding:"16px 20px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
              {uniqueDoctorIds.slice(0,4).map((did,i)=>{
                const d = doctors.find(x=>x.id===did);
                const apptCount = appointments.filter(a=>a.doctorId===did).length;
                return (
                  <div key={did||i} style={{ background:"#f8faff", border:"1px solid #e8eaf6", borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{
                      width:44, height:44, borderRadius:12, flexShrink:0,
                      background: d?.profileImage ? "transparent" : `hsl(${i*67+200},60%,65%)`,
                      overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center",
                      fontWeight:800, color:"#fff", fontSize:16,
                    }}>
                      {d?.profileImage
                        ? <img src={d.profileImage} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        : (d ? `${d.firstName||"D"}`.charAt(0) : "D")
                      }
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:13, color:"#1e293b", margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {d ? `${d.title||""} ${d.firstName||""} ${d.lastName||""}`.trim() : "Unknown"}
                      </p>
                      <p style={{ fontSize:11, color:"#6366f1", fontWeight:600, margin:"0 0 4px" }}>{d?.specialization || "Specialist"}</p>
                      <p style={{ fontSize:11, color:"#94a3b8", margin:0 }}>{apptCount} appointment{apptCount!==1?"s":""}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ FOOTER STRIP ════════════════════════════════════ */}
        <div style={{
          marginTop:20, borderRadius:16,
          background:"linear-gradient(135deg,#f8faff,#eef2ff)",
          border:"1px solid #e8eaf6", padding:"14px 22px",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8,
        }}>
          <div className="flex items-center gap-2">
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>
              <strong style={{ color:"#0f172a" }}>{appointments.length}</strong> total appointments ·{" "}
              <strong style={{ color:"#0f172a" }}>{uniqueDoctorIds.length}</strong> doctors ·{" "}
              <strong style={{ color:"#0f172a" }}>{medHistory.length}</strong> medical records
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Pulse color="bg-blue-400" />
            <span style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>Live data</span>
          </div>
        </div>

      </div>
    </div>
  );
}