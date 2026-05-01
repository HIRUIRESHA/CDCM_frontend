import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

// ─── SVG Icon ─────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const I = {
  calendar: "M8 2v3M16 2v3M3.5 9h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5z",
  doctor:   "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM3.41 22c0-3.87 3.85-7 8.59-7s8.59 3.13 8.59 7",
  bell:     "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  flask:    "M9 3h6M9 3v6l-4 9a1 1 0 0 0 .9 1.45h12.2A1 1 0 0 0 19 18l-4-9V3",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  arrow:    "M5 12h14M12 5l7 7-7 7",
  chevron:  "M9 18l6-6-6-6",
  check:    "M20 6 9 17l-5-5",
  clock:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  alert:    "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  search:   "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  hospital: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  payment:  "M2 8h20M2 12h20M6 16h4M14 16h4M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z",
  chat:     "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, bg, text, border, onClick }) => (
  <button onClick={onClick}
    className={`group w-full text-left bg-white border-2 ${border} rounded-2xl p-5 hover:shadow-lg transition-all duration-200`}>
    <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${bg} mb-4`}>
      <span className={text}><Icon d={icon} size={20} /></span>
    </div>
    <p className="text-3xl font-extrabold text-gray-900">{value}</p>
    <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-widest leading-tight">{label}</p>
    <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${text} opacity-0 group-hover:opacity-100 transition-opacity`}>
      View <Icon d={I.arrow} size={13} />
    </div>
  </button>
);

// ─── Quick Action ─────────────────────────────────────────────────────────────
const QuickAction = ({ icon, label, desc, bg, text, onClick }) => (
  <button onClick={onClick}
    className="flex items-center gap-3 w-full bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-blue-200 hover:shadow-sm transition-all duration-150 text-left">
    <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0`}>
      <span className={text}><Icon d={icon} size={17} /></span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-800">{label}</p>
      <p className="text-xs text-gray-400 truncate">{desc}</p>
    </div>
    <span className="text-gray-300 flex-shrink-0"><Icon d={I.chevron} size={16} /></span>
  </button>
);

// ─── Activity Row ─────────────────────────────────────────────────────────────
const ActivityRow = ({ icon, title, subtitle, time, bg, text }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className={`p-2 rounded-xl flex-shrink-0 ${bg}`}>
      <span className={text}><Icon d={icon} size={14} /></span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 leading-tight">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>
    </div>
    <span className="text-[10px] font-bold text-gray-300 flex-shrink-0 mt-0.5 uppercase tracking-wide">{time}</span>
  </div>
);

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [hospitals,    setHospitals]    = useState([]);
  const [notifications,setNotifications]= useState([]);
  const [tests,        setTests]        = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    (async () => {
      try {
        setLoading(true);
        const [r1, r2, r3, r4, r5] = await Promise.allSettled([
          fetch(`http://localhost:8082/api/appointments/patient/${user.id}`, { headers }),
          fetch("http://localhost:8082/api/hospital/doctors/assigned-all"),
          fetch("http://localhost:8082/api/hospital/doctors/all-hospitals"),
          axios.get(`http://localhost:8082/api/notifications/${user.id}`),
          axios.get(`http://localhost:8082/api/lab-tests/patient/${user.id}`),
        ]);
        if (r1.status === "fulfilled" && r1.value.ok) setAppointments(await r1.value.json());
        if (r2.status === "fulfilled" && r2.value.ok) { const d = await r2.value.json(); setDoctors(Array.isArray(d) ? d : []); }
        if (r3.status === "fulfilled" && r3.value.ok) { const h = await r3.value.json(); setHospitals(Array.isArray(h) ? h : []); }
        if (r4.status === "fulfilled") setNotifications(Array.isArray(r4.value.data) ? r4.value.data : []);
        if (r5.status === "fulfilled") setTests(Array.isArray(r5.value.data) ? r5.value.data : []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const today    = new Date().toISOString().split("T")[0];
  const upcoming = appointments.filter(a => a.date >= today).sort((a,b) => new Date(a.date)-new Date(b.date));
  const previous = appointments.filter(a => a.date < today).sort((a,b) => new Date(b.date)-new Date(a.date));
  const unread   = notifications.filter(n => !n.read);
  const unpaid   = tests.filter(t => !(t.isPaid || t.paid));
  const paid     = tests.filter(t =>  (t.isPaid || t.paid));
  const uniqueDrs= [...new Set(appointments.map(a => a.doctorId))];

  const drName   = id => { const d = doctors.find(d=>d.id===id); return d ? `${d.title||""} ${d.firstName||""} ${d.lastName||""}`.trim() : "Unknown Doctor"; };
  const hospName = id => { const h = hospitals.find(h=>h.id===id); return h ? h.name : "Unknown Hospital"; };

  const greeting = () => { const h=new Date().getHours(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; };

  // Build unified activity feed
  const feed = [
    ...upcoming.slice(0,2).map(a=>({ icon:I.calendar, title:`Upcoming: ${drName(a.doctorId)}`, subtitle:`${hospName(a.hospitalId)} · ${a.date} at ${a.time}`, time:"Soon",  bg:"bg-blue-50",   text:"text-blue-600"   })),
    ...previous.slice(0,2).map(a=>({ icon:I.check,    title:`Visited ${drName(a.doctorId)}`,    subtitle:`${hospName(a.hospitalId)} · ${a.date}`,             time:a.date, bg:"bg-green-50",  text:"text-green-600"  })),
    ...unpaid.slice(0,2).map(t=> ({ icon:I.alert,     title:`Payment due: ${t.testType}`,       subtitle:`Rs ${t.price} · ${t.testDate}`,                     time:"Due",  bg:"bg-orange-50", text:"text-orange-600" })),
    ...paid.slice(0,1).map(t=>   ({ icon:I.flask,     title:`Test paid: ${t.testType}`,         subtitle:`Rs ${t.price} · ${t.testDate}`,                     time:"Paid", bg:"bg-purple-50", text:"text-purple-600" })),
    ...unread.slice(0,2).map(n=> ({ icon:I.bell,      title:n.message,                          subtitle:new Date(n.createdAt).toLocaleString(),               time:"New",  bg:"bg-red-50",    text:"text-red-500"    })),
  ].slice(0, 8);

  const summaryStats = [
    { label:"Total Visits",         value:previous.length,    color:"text-green-300"  },
    { label:"Upcoming Appointments", value:upcoming.length,    color:"text-blue-200"   },
    { label:"Doctors Consulted",     value:uniqueDrs.length,   color:"text-purple-300" },
    { label:"Lab Tests Done",        value:tests.length,       color:"text-yellow-300" },
    { label:"Payments Cleared",      value:paid.length,        color:"text-green-300"  },
    { label:"Payments Pending",      value:unpaid.length,      color:"text-orange-300" },
    { label:"Unread Notifications",  value:unread.length,      color:"text-red-300"    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-700" />
        <p className="text-sm text-gray-400 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-7">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{greeting()}</p>
            <h1 className="text-3xl font-extrabold text-gray-900">{user?.name || "Patient"} 👋</h1>
            <p className="text-sm text-gray-400 mt-1">
              {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
            </p>
          </div>
          <button onClick={() => navigate("/patient/notifications")}
            className="relative self-start sm:self-auto bg-white border-2 border-gray-100 rounded-xl p-3 hover:shadow-md transition">
            <span className="text-gray-600"><Icon d={I.bell} size={20} /></span>
            {unread.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                {unread.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Stat Cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Upcoming Appointments" value={upcoming.length} icon={I.calendar}
            bg="bg-blue-50"   text="text-blue-600"   border="border-blue-100"   onClick={() => navigate("/patient/appointments")} />
          <StatCard label="My Doctors"            value={uniqueDrs.length} icon={I.doctor}
            bg="bg-green-50"  text="text-green-600"  border="border-green-100"  onClick={() => navigate("/patient/my-doctors")} />
          <StatCard label="Lab Reports"           value={tests.length}     icon={I.flask}
            bg="bg-purple-50" text="text-purple-600" border="border-purple-100" onClick={() => navigate("/patient/reports")} />
          <StatCard label="Pending Payments"      value={unpaid.length}    icon={I.payment}
            bg="bg-orange-50" text="text-orange-600" border="border-orange-100" onClick={() => navigate("/patient/reports")} />
        </div>

        {/* ── Main Grid ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2/3 */}
          <div className="lg:col-span-2 space-y-6">

            {/* Next Appointment Hero */}
            {upcoming.length > 0 ? (
              <div className="relative bg-blue-700 rounded-2xl p-6 text-white overflow-hidden shadow-lg">
                <div className="absolute -top-12 -right-12 w-44 h-44 bg-white opacity-5 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white opacity-5 rounded-full" />
                <div className="relative z-10">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200">Next Appointment</p>
                  <h2 className="text-2xl font-extrabold mt-1">{drName(upcoming[0].doctorId)}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-blue-300"><Icon d={I.hospital} size={13} /></span>
                    <p className="text-sm text-blue-200">{hospName(upcoming[0].hospitalId)}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-5">
                    {[{label:"Date",value:upcoming[0].date,icon:I.calendar},{label:"Time",value:upcoming[0].time,icon:I.clock},{label:"Ticket",value:upcoming[0].appointmentNumber,icon:I.activity}]
                      .map(({label,value,icon})=>(
                        <div key={label} className="bg-white bg-opacity-10 rounded-xl px-4 py-3 flex items-center gap-2">
                          <span className="text-blue-300"><Icon d={icon} size={14} /></span>
                          <div>
                            <p className="text-[9px] font-bold text-blue-300 uppercase tracking-wider">{label}</p>
                            <p className="text-sm font-bold">{value}</p>
                          </div>
                        </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-5">
                    <span className="text-xs font-bold bg-white bg-opacity-20 px-3 py-1 rounded-full">{upcoming[0].status}</span>
                    <button onClick={() => navigate("/patient/appointments")}
                      className="flex items-center gap-1.5 bg-white text-blue-700 text-xs font-extrabold px-4 py-2 rounded-xl hover:bg-blue-50 transition">
                      View All <Icon d={I.arrow} size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 rounded-full mb-3">
                  <span className="text-gray-300"><Icon d={I.calendar} size={26} /></span>
                </div>
                <p className="font-bold text-gray-600">No upcoming appointments</p>
                <p className="text-sm text-gray-400 mt-1">Find a specialist and book your next visit</p>
                <button onClick={() => navigate("/patient/find-doctor")}
                  className="mt-4 bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition">
                  Book Appointment
                </button>
              </div>
            )}

            {/* Appointments Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-extrabold text-gray-800">All Appointments</h3>
                <button onClick={() => navigate("/patient/appointments")}
                  className="text-xs font-bold text-blue-600 hover:underline">View all</button>
              </div>
              {appointments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No appointments yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                        <th className="px-5 py-3 text-left">Ticket</th>
                        <th className="px-5 py-3 text-left">Doctor</th>
                        <th className="px-5 py-3 text-left">Hospital</th>
                        <th className="px-5 py-3 text-left">Date</th>
                        <th className="px-5 py-3 text-left">Time</th>
                        <th className="px-5 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.slice(0, 6).map((a, i) => (
                        <tr key={a.id} className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${i%2===0?"bg-white":"bg-gray-50/30"}`}>
                          <td className="px-5 py-3 font-bold text-blue-700">{a.appointmentNumber}</td>
                          <td className="px-5 py-3 font-semibold text-gray-800 truncate max-w-[140px]">{drName(a.doctorId)}</td>
                          <td className="px-5 py-3 text-gray-500 truncate max-w-[120px]">{hospName(a.hospitalId)}</td>
                          <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{a.date}</td>
                          <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{a.time}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                              a.date >= today ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {a.date >= today ? "Upcoming" : "Completed"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Lab Reports Table */}
            {tests.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-extrabold text-gray-800">Lab Reports</h3>
                  <button onClick={() => navigate("/patient/reports")}
                    className="text-xs font-bold text-blue-600 hover:underline">View all</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                        <th className="px-5 py-3 text-left">Test</th>
                        <th className="px-5 py-3 text-left">Date</th>
                        <th className="px-5 py-3 text-left">Price</th>
                        <th className="px-5 py-3 text-left">Payment</th>
                        <th className="px-5 py-3 text-left">Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.slice(0, 5).map((t, i) => {
                        const isPaid = t.isPaid || t.paid;
                        return (
                          <tr key={t.id} className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${i%2===0?"bg-white":"bg-gray-50/30"}`}>
                            <td className="px-5 py-3 font-semibold text-gray-800">{t.testType}</td>
                            <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{t.testDate}</td>
                            <td className="px-5 py-3 font-bold text-gray-700">Rs {t.price}</td>
                            <td className="px-5 py-3">
                              {isPaid ? (
                                <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">Paid</span>
                              ) : (
                                <button onClick={() => navigate("/patient/reports")}
                                  className="text-xs font-bold bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600 transition">
                                  Pay Now
                                </button>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                t.reportStatus === "Uploaded"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-gray-100 text-gray-400"
                              }`}>
                                {t.reportStatus === "Uploaded" ? "Ready" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 1/3 */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h3 className="font-extrabold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <QuickAction icon={I.search}   label="Find a Doctor"      desc="Search by specialty or name"       bg="bg-purple-50" text="text-purple-600" onClick={() => navigate("/patient/find-doctor")} />
                <QuickAction icon={I.calendar}  label="My Appointments"    desc={`${upcoming.length} upcoming`}     bg="bg-blue-50"   text="text-blue-600"   onClick={() => navigate("/patient/appointments")} />
                <QuickAction icon={I.doctor}    label="My Doctors"         desc={`${uniqueDrs.length} consulted`}   bg="bg-green-50"  text="text-green-600"  onClick={() => navigate("/patient/my-doctors")} />
                <QuickAction icon={I.flask}     label="Lab Reports"        desc={`${tests.length} total · ${unpaid.length} pending payment`} bg="bg-purple-50" text="text-purple-600" onClick={() => navigate("/patient/reports")} />
                <QuickAction icon={I.chat}      label="Add Feedback"       desc="Rate your experience"             bg="bg-pink-50"   text="text-pink-600"   onClick={() => navigate("/patient/add-feedback")} />
              </div>
            </div>

            {/* Pending Payments Alert */}
            {unpaid.length > 0 && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-orange-500"><Icon d={I.alert} size={17} /></span>
                  <h3 className="font-extrabold text-orange-800 text-sm">Action Required</h3>
                  <span className="ml-auto bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {unpaid.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {unpaid.slice(0, 3).map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-orange-100">
                      <div>
                        <p className="text-xs font-bold text-gray-800">{t.testType}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Rs {t.price}</p>
                      </div>
                      <button onClick={() => navigate("/patient/reports")}
                        className="text-xs font-extrabold bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition">
                        Pay
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Summary Feed */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-gray-800">Activity Summary</h3>
                <span className="text-xs text-gray-400 font-semibold">{feed.length} events</span>
              </div>
              {feed.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-gray-200"><Icon d={I.activity} size={32} /></span>
                  <p className="text-sm text-gray-400 mt-2">No activity yet</p>
                </div>
              ) : (
                feed.map((item, i) => <ActivityRow key={i} {...item} />)
              )}
            </div>

            {/* Notifications */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-gray-800">Notifications</h3>
                  {unread.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                      {unread.length}
                    </span>
                  )}
                </div>
                <button onClick={() => navigate("/patient/notifications")}
                  className="text-xs font-bold text-blue-600 hover:underline">All</button>
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-5">
                  <span className="text-gray-200"><Icon d={I.bell} size={28} /></span>
                  <p className="text-sm text-gray-400 mt-2">No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 4).map(n => (
                  <div key={n.id} className={`flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 ${!n.read?"":"opacity-50"}`}>
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read?"bg-blue-500":"bg-gray-200"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Health Summary Stats */}
            <div className="bg-blue-700 rounded-2xl p-5 text-white">
              <h3 className="font-extrabold text-sm mb-4 text-blue-200 uppercase tracking-widest">
                Health Summary
              </h3>
              <div className="space-y-3">
                {summaryStats.map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between border-b border-white border-opacity-10 pb-3 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold text-blue-200">{label}</p>
                    <p className={`text-xl font-extrabold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}