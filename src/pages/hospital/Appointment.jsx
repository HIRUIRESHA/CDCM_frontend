import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AppointmentManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (!user) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`http://localhost:8082/api/appointments/hospital/${user.id}`, { headers }),
      fetch(`http://localhost:8082/api/hospital/doctors/hospital/${user.id}`, { headers }),
    ])
      .then(([apptRes, docRes]) => Promise.all([apptRes.json(), docRes.json()]))
      .then(([apptData, docData]) => {
        setAppointments(Array.isArray(apptData) ? apptData : []);
        setDoctors(Array.isArray(docData) ? docData : []);
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [user]);

  // ── Date helpers ─────────────────────────────────────────────────
  const now = new Date();
  const todayISO   = now.toISOString().split("T")[0];                                                            // "2026-05-01"
  const todayLocal = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`; // "01/05/2026"
  const todayDisplay = now.toLocaleDateString("en-GB");

  const isToday = (date) => date === todayISO || date === todayLocal;

  // ── Doctor name resolver ─────────────────────────────────────────
  const getDoctorName = (doctorId) => {
    const doc = doctors.find((d) => d.id === doctorId);
    return doc ? `${doc.title || ""} ${doc.firstName || ""} ${doc.lastName || ""}`.trim() : "—";
  };

  // ── Filters ──────────────────────────────────────────────────────
  const applySearch = (list) =>
    list.filter((a) => {
      const term = search.toLowerCase();
      return (
        a.id?.toLowerCase().includes(term) ||
        a.patientName?.toLowerCase().includes(term) ||
        a.appointmentNumber?.toString().includes(term)
      );
    });

  const applyStatus = (list) =>
    statusFilter === "ALL" ? list : list.filter((a) => a.status === statusFilter);

  const todayList = applyStatus(applySearch(
    appointments.filter((a) => isToday(a.date))
  ));

  const historyList = applyStatus(applySearch(
    appointments
      .filter((a) => !isToday(a.date))
      .filter((a) => {
        if (fromDate && a.date < fromDate) return false;
        if (toDate && a.date > toDate) return false;
        return true;
      })
      .sort((a, b) => b.date?.localeCompare(a.date))
  ));

  // ── Stats ─────────────────────────────────────────────────────────
  const stats = [
    { label: "Today's Appointments",  value: appointments.filter((a) => isToday(a.date)).length },
    { label: "Cancellation Requests", value: appointments.filter((a) => a.status === "CANCELLATION_REQUESTED").length },
    { label: "Pending Refunds",        value: appointments.filter((a) => a.paymentStatus === "REFUND_PENDING").length },
    { label: "Total Appointments",     value: appointments.length },
  ];

  // ── Styles ────────────────────────────────────────────────────────
  const statusStyle = (s) => ({
    CONFIRMED:              { color: "#15803d", background: "#dcfce7" },
    CANCELLED:              { color: "#b91c1c", background: "#fee2e2" },
    CANCELLATION_REQUESTED: { color: "#d97706", background: "#fef3c7" },
    PENDING:                { color: "#6d28d9", background: "#ede9fe" },
    COMPLETED:              { color: "#0369a1", background: "#e0f2fe" },
  }[s] || { color: "#64748b", background: "#f1f5f9" });

  const fmt = (s) => s ? s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ") : "—";

  const S = {
    page:      { background: "#f0f4f8", minHeight: "100vh", padding: 28, fontFamily: "'Segoe UI', sans-serif" },
    wrap:      { maxWidth: 1050, margin: "0 auto" },
    hospital:  { background: "linear-gradient(135deg,#e0f2fe,#bae6fd)", padding: "8px 24px", borderRadius: "0 0 16px 16px", fontSize: 20, fontWeight: 800, color: "#1b3a6b", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    hero:      { background: "linear-gradient(135deg,#c7d2fe,#a5b4fc)", borderRadius: 16, padding: "28px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" },
    statCard:  { background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 16px", textAlign: "center" },
    input:     { border: "1px solid #cbd5e1", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "#64748b", outline: "none", background: "white" },
    tabBtn:    (active) => ({ padding: "10px 22px", fontSize: 13, fontWeight: active ? 700 : 500, cursor: "pointer", background: "none", border: "none", borderBottom: active ? "2.5px solid #0d7490" : "2.5px solid transparent", color: active ? "#0d7490" : "#64748b", marginBottom: -1 }),
    th:        { padding: "10px 11px", textAlign: "left", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" },
    td:        { padding: "11px", borderBottom: "1px solid #e2e8f0", verticalAlign: "top", fontSize: 12 },
    actionBtn: (bg) => ({ background: bg, color: "white", border: "none", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "block", width: "100%", marginBottom: 3 }),
  };

  // ── Table renderer ────────────────────────────────────────────────
  const renderTable = (list, showDate = false) => (
    <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#0d7490", color: "white" }}>
            <th style={S.th}>Appt ID</th>
            <th style={S.th}>Patient</th>
            <th style={S.th}>Doctor</th>
            {showDate && <th style={S.th}>Date</th>}
            <th style={S.th}>Time</th>
            <th style={S.th}>No.</th>
            <th style={S.th}>Status</th>
            <th style={S.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={showDate ? 8 : 7} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                Loading...
              </td>
            </tr>
          ) : list.length === 0 ? (
            <tr>
              <td colSpan={showDate ? 8 : 7} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                {search || statusFilter !== "ALL"
                  ? "No appointments match your filters."
                  : showDate
                  ? "No past appointments found."
                  : "No appointments for today."}
              </td>
            </tr>
          ) : (
            list.map((appt) => (
              <tr key={appt.id} style={{ borderBottom: "1px solid #e2e8f0" }}>

                {/* Appt ID */}
                <td style={{ ...S.td, fontWeight: 700, color: "#1b3a6b" }}>
                  {appt.id?.slice(-6).toUpperCase()}
                </td>

                {/* Patient */}
                <td style={S.td}>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{appt.patientName || "—"}</div>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>{appt.patientId || ""}</div>
                </td>

                {/* Doctor */}
                <td style={S.td}>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{getDoctorName(appt.doctorId)}</div>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>{appt.doctorId || ""}</div>
                </td>

                {/* Date — history only */}
                {showDate && (
                  <td style={{ ...S.td, color: "#64748b" }}>{appt.date || "—"}</td>
                )}

                {/* Time */}
                <td style={{ ...S.td, fontWeight: 600 }}>{appt.time || "—"}</td>

                {/* Channeling No */}
                <td style={S.td}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "#0d7490", color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 11, flexShrink: 0
                  }}>
                    {appt.appointmentNumber?.replace("APT-", "") || "—"}
                  </div>
                </td>

                {/* Status */}
                <td style={S.td}>
                  <span style={{ ...statusStyle(appt.status), padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>
                    {fmt(appt.status)}
                  </span>
                </td>

                {/* Actions */}
                <td style={S.td}>
                  <button onClick={() => navigate(`/hospital/appointments/${appt.id}`)} style={S.actionBtn("#22c55e")}>View</button>
                  {appt.status === "CONFIRMED" && <button style={S.actionBtn("#3b82f6")}>Cancel</button>}
                  {appt.status === "CANCELLED" && <button style={S.actionBtn("#3b82f6")}>Receipt</button>}
                  {appt.status === "CANCELLATION_REQUESTED" && <button style={S.actionBtn("#f97316")}>Refund</button>}
                  {!showDate && <button style={S.actionBtn("#6366f1")}>Remind</button>}
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Hospital name */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <div style={S.hospital}>Asiri <span style={{ color: "#0099b0" }}>Hospital</span></div>
        </div>

        {/* Hero */}
        <div style={S.hero}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1e1b4b", marginBottom: 6 }}>Appointment Management</h1>
            <p style={{ fontSize: 14, color: "#4338ca", fontWeight: 500 }}>Manage and track all patient appointments</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📅</div>
            <div style={{ background: "white", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "#1e1b4b", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>{todayDisplay}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {stats.map(({ label, value }) => (
            <div key={label} style={S.statCard}>
              <div style={{ fontSize: 12, color: "#0099b0", fontWeight: 600, marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#1b3a6b" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: "1px solid #e2e8f0", marginBottom: 20, display: "flex", gap: 4 }}>
          <button style={S.tabBtn(activeTab === "today")} onClick={() => { setActiveTab("today"); setSearch(""); setStatusFilter("ALL"); }}>
            Today's Appointments
          </button>
          <button style={S.tabBtn(activeTab === "history")} onClick={() => { setActiveTab("history"); setSearch(""); setStatusFilter("ALL"); }}>
            Appointment History
          </button>
        </div>

        {/* TODAY TAB */}
        {activeTab === "today" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 8, flex: 1 }}>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍  Search patient, appointment ID..." style={{ ...S.input, flex: 1 }} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={S.input}>
                  <option value="ALL">All Status</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="CANCELLATION_REQUESTED">Cancellation Requested</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, marginLeft: 12 }}>
                <button style={{ background: "#22c55e", color: "white", border: "none", padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Process Refund</button>
                <button style={{ background: "#1b3a6b", color: "white", border: "none", padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Auto Assign No.</button>
              </div>
            </div>
            {renderTable(todayList, false)}
          </>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍  Search patient, appointment ID..." style={{ ...S.input, flex: 1, minWidth: 180 }} />
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={S.input} />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={S.input} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={S.input}>
                <option value="ALL">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="CANCELLATION_REQUESTED">Cancellation Requested</option>
              </select>
            </div>
            {renderTable(historyList, true)}
          </>
        )}

      </div>
    </div>
  );
};

export default AppointmentManagement;