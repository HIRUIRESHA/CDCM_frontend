import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../api/api";
import {
  CheckCircle2,
  AlertCircle,
  X,
  Building,
  CreditCard,
  ArrowRight,
  Clock,
  Copy,
  Check,
  Search,
  RefreshCw,
  Info,
  ShieldCheck,
} from "lucide-react";

const AppointmentManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  // Core data states
  const [appointments, setAppointments] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const [refundsError, setRefundsError] = useState("");

  // Navigation & filtering states
  const [activeTab, setActiveTab] = useState("today"); // "today" | "history" | "refunds"
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [refundSubFilter, setRefundSubFilter] = useState("ALL"); // "ALL" | "READY" | "AWAITING_DETAILS"
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Refund processing modal states
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [loadingRefundModal, setLoadingRefundModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    transactionRef: "",
    notes: "",
    confirmedCheck: false,
  });
  const [confirmingTransfer, setConfirmingTransfer] = useState(false);
  const [refundError, setRefundError] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");
  const [copiedAccount, setCopiedAccount] = useState(false);

  const selectedHasBankDetails = Boolean(
    selectedRefund &&
      (selectedRefund.bankAccountNumber ||
        (selectedRefund.bankName && selectedRefund.bankAccountHolderName) ||
        selectedRefund.refundStatus === "AWAITING_PROCESSING")
  );

  // Fetch all appointments, doctors, and pending refunds
  const fetchData = async () => {
    if (!user) return;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    setLoading(true);
    setRefundsLoading(true);
    setRefundsError("");

    try {
      const [apptRes, docRes, refundsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/appointments/hospital/${user.id}`, { headers }).catch((e) => {
          console.error("Failed to fetch appointments:", e);
          return { ok: false, json: async () => [] };
        }),
        fetch(`${API_BASE_URL}/api/hospital/doctors/hospital/${user.id}`, { headers }).catch((e) => {
          console.error("Failed to fetch doctors:", e);
          return { ok: false, json: async () => [] };
        }),
        fetch(`${API_BASE_URL}/api/appointments/hospital/${user.id}/pending-refunds`, { headers }).catch((e) => {
          console.warn("Failed to fetch pending refunds:", e);
          return { ok: false, json: async () => [] };
        }),
      ]);

      const apptData = apptRes.ok ? await apptRes.json() : [];
      const docData = docRes.ok ? await docRes.json() : [];
      const refundsData = refundsRes && refundsRes.ok ? await refundsRes.json() : [];

      if (!refundsRes.ok && refundsRes.status !== 200) {
        setRefundsError("Could not load pending refunds from server.");
      }

      setAppointments(Array.isArray(apptData) ? apptData : []);
      setDoctors(Array.isArray(docData) ? docData : []);
      setPendingRefunds(Array.isArray(refundsData) ? refundsData : []);
    } catch (err) {
      console.error("Error loading hospital appointment data:", err);
      setRefundsError("Error loading refund data. Please refresh.");
    } finally {
      setLoading(false);
      setRefundsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const now = new Date();
  const todayISO = now.toISOString().split("T")[0];
  const todayLocal = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;
  const todayDisplay = now.toLocaleDateString("en-GB");

  const isToday = (date) => date === todayISO || date === todayLocal;

  // Doctor name resolver
  const getDoctorName = (doctorId) => {
    const doc = doctors.find((d) => d.id === doctorId);
    return doc ? `${doc.title || ""} ${doc.firstName || ""} ${doc.lastName || ""}`.trim() : "—";
  };

  // Open refund processing modal with fresh verified details from backend
  const handleOpenRefundModal = async (appt) => {
    const apptId = appt.id || appt._id;
    // Look up in pendingRefunds first so we have an initial candidate
    const foundRefund = pendingRefunds.find((r) => (r.id || r._id) === apptId);
    const target = foundRefund || appt;
    setSelectedRefund(target);
    setTransferForm({
      transactionRef: "",
      notes: "",
      confirmedCheck: false,
    });
    setRefundError("");
    setCopiedAccount(false);
    setRefundModalOpen(true);
    setLoadingRefundModal(true);

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/api/appointments/${apptId}/refund-details`, { headers });
      if (res.ok) {
        const freshDetails = await res.json();
        if (freshDetails && (freshDetails.id || freshDetails._id)) {
          setSelectedRefund(freshDetails);
          // Sync with local pendingRefunds list
          setPendingRefunds((prev) => {
            const exists = prev.some((r) => (r.id || r._id) === apptId);
            if (freshDetails.refundStatus === "REFUNDED") {
              return prev.filter((r) => (r.id || r._id) !== apptId);
            }
            if (exists) {
              return prev.map((r) => ((r.id || r._id) === apptId ? { ...r, ...freshDetails } : r));
            }
            return [freshDetails, ...prev];
          });
          // Sync with appointments list so table badges update
          setAppointments((prev) =>
            prev.map((a) => ((a.id || a._id) === apptId ? { ...a, ...freshDetails } : a))
          );
        }
      } else if (res.status === 403) {
        setRefundError("You are not authorized to view refund details for another hospital's appointment.");
      }
    } catch (err) {
      console.warn("Could not fetch latest refund details:", err);
    } finally {
      setLoadingRefundModal(false);
    }
  };

  // Copy bank account number to clipboard
  const handleCopyAccountNumber = (accNumber) => {
    if (!accNumber) return;
    navigator.clipboard?.writeText(accNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  // Confirm manual bank refund transfer
  const handleConfirmRefundSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedRefund) return;

    const hasBankDetails = Boolean(
      selectedRefund.bankAccountNumber ||
      (selectedRefund.bankName && selectedRefund.bankAccountHolderName) ||
      (selectedRefund.refundStatus === "AWAITING_PROCESSING")
    );

    if (!hasBankDetails && selectedRefund.refundStatus === "AWAITING_BANK_DETAILS") {
      setRefundError(
        "Cannot confirm refund: Patient has not submitted their bank details yet."
      );
      return;
    }

    if (!transferForm.confirmedCheck) {
      setRefundError(
        "Please check the confirmation box verifying that the manual bank transfer has actually been completed outside the system."
      );
      return;
    }

    setConfirmingTransfer(true);
    setRefundError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const refundId = selectedRefund.id || selectedRefund._id;
      const res = await fetch(
        `${API_BASE_URL}/api/appointments/${refundId}/confirm-refund`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            transactionRef: transferForm.transactionRef.trim(),
            notes: transferForm.notes.trim(),
          }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to confirm refund (status code ${res.status}).`
        );
      }

      // Immediately update local UI state
      setPendingRefunds((prev) => prev.filter((r) => (r.id || r._id) !== refundId));
      setAppointments((prev) =>
        prev.map((a) =>
          (a.id || a._id) === refundId
            ? {
                ...a,
                refundStatus: "REFUNDED",
                refundTransactionRef:
                  transferForm.transactionRef.trim() || data?.refundTransactionRef,
                refundedAt: new Date().toISOString(),
              }
            : a
        )
      );

      const confirmedAmt = Number(selectedRefund.refundAmount || 0).toFixed(2);
      setActionSuccessMessage(
        `Refund of LKR ${confirmedAmt} confirmed and recorded successfully! Notification & email sent to patient.`
      );
      setTimeout(() => setActionSuccessMessage(""), 7000);

      setRefundModalOpen(false);
      setSelectedRefund(null);

      // Refresh in background
      fetchData();
    } catch (err) {
      console.error("Confirm refund transfer error:", err);
      setRefundError(err.message || "Failed to confirm refund transfer.");
    } finally {
      setConfirmingTransfer(false);
    }
  };

  // Filter lists
  const applySearch = (list) =>
    list.filter((a) => {
      const term = search.toLowerCase();
      return (
        a.id?.toLowerCase().includes(term) ||
        a.patientName?.toLowerCase().includes(term) ||
        a.appointmentNumber?.toString().includes(term) ||
        (a.bankName && a.bankName.toLowerCase().includes(term))
      );
    });

  const applyStatus = (list) => {
    if (statusFilter === "ALL") return list;
    if (statusFilter === "REFUND_PENDING") {
      return list.filter(
        (a) =>
          a.refundStatus === "AWAITING_BANK_DETAILS" ||
          a.refundStatus === "AWAITING_PROCESSING"
      );
    }
    if (statusFilter === "REFUNDED") {
      return list.filter((a) => a.refundStatus === "REFUNDED");
    }
    return list.filter((a) => a.status === statusFilter);
  };

  const todayList = applyStatus(
    applySearch(appointments.filter((a) => isToday(a.date)))
  );

  const historyList = applyStatus(
    applySearch(
      appointments
        .filter((a) => !isToday(a.date))
        .filter((a) => {
          if (fromDate && a.date < fromDate) return false;
          if (toDate && a.date > toDate) return false;
          return true;
        })
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    )
  );

  // Filtered pending refunds list
  const filteredPendingRefunds = pendingRefunds.filter((r) => {
    if (refundSubFilter === "READY") {
      return r.refundStatus === "AWAITING_PROCESSING";
    }
    if (refundSubFilter === "AWAITING_DETAILS") {
      return r.refundStatus === "AWAITING_BANK_DETAILS";
    }
    return true;
  });

  const searchedPendingRefunds = applySearch(filteredPendingRefunds);

  const readyForTransferCount = pendingRefunds.filter(
    (r) => r.refundStatus === "AWAITING_PROCESSING"
  ).length;
  const awaitingBankDetailsCount = pendingRefunds.filter(
    (r) => r.refundStatus === "AWAITING_BANK_DETAILS"
  ).length;

  const totalPendingRefundAmount = pendingRefunds.reduce(
    (sum, r) => sum + (Number(r.refundAmount) || 0),
    0
  );

  // Stats
  const stats = [
    {
      label: "Today's Appointments",
      value: appointments.filter((a) => isToday(a.date)).length,
      tab: "today",
    },
    {
      label: "Cancelled Appointments",
      value: appointments.filter((a) => a.status === "CANCELLED").length,
      tab: "history",
    },
    {
      label: "Pending Refunds",
      value: pendingRefunds.length,
      tab: "refunds",
      badge: readyForTransferCount > 0 ? `${readyForTransferCount} ready` : null,
    },
    {
      label: "Total Appointments",
      value: appointments.length,
      tab: "history",
    },
  ];

  // Styles
  const statusStyle = (s) =>
    ({
      CONFIRMED: { color: "#15803d", background: "#dcfce7" },
      CANCELLED: { color: "#b91c1c", background: "#fee2e2" },
      CANCELLATION_REQUESTED: { color: "#d97706", background: "#fef3c7" },
      PENDING: { color: "#6d28d9", background: "#ede9fe" },
      COMPLETED: { color: "#0369a1", background: "#e0f2fe" },
    }[s] || { color: "#64748b", background: "#f1f5f9" });

  const fmt = (s) =>
    s ? s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ") : "—";

  const S = {
    page: {
      background: "#f0f4f8",
      minHeight: "100vh",
      padding: 28,
      fontFamily: "'Segoe UI', sans-serif",
    },
    wrap: { maxWidth: 1100, margin: "0 auto" },
    hospital: {
      background: "linear-gradient(135deg,#e0f2fe,#bae6fd)",
      padding: "8px 24px",
      borderRadius: "0 0 16px 16px",
      fontSize: 18,
      fontWeight: 800,
      color: "#1b3a6b",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    hero: {
      background: "linear-gradient(135deg,#c7d2fe,#a5b4fc)",
      borderRadius: 16,
      padding: "26px 32px",
      marginBottom: 24,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statCard: (active) => ({
      background: "white",
      border: active ? "2px solid #0d7490" : "1px solid #e2e8f0",
      borderRadius: 12,
      padding: "16px 14px",
      textAlign: "center",
      cursor: "pointer",
      transition: "transform 0.15s, box-shadow 0.15s",
      boxShadow: active
        ? "0 4px 14px rgba(13,116,144,0.15)"
        : "0 1px 4px rgba(0,0,0,0.04)",
    }),
    input: {
      border: "1px solid #cbd5e1",
      borderRadius: 8,
      padding: "9px 14px",
      fontSize: 13,
      color: "#334155",
      outline: "none",
      background: "white",
    },
    tabBtn: (active) => ({
      padding: "10px 22px",
      fontSize: 13,
      fontWeight: active ? 700 : 500,
      cursor: "pointer",
      background: "none",
      border: "none",
      borderBottom: active
        ? "2.5px solid #0d7490"
        : "2.5px solid transparent",
      color: active ? "#0d7490" : "#64748b",
      marginBottom: -1,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    }),
    th: {
      padding: "11px 12px",
      textAlign: "left",
      fontWeight: 600,
      fontSize: 12,
      whiteSpace: "nowrap",
    },
    td: {
      padding: "11px 12px",
      borderBottom: "1px solid #e2e8f0",
      verticalAlign: "top",
      fontSize: 12,
    },
    actionBtn: (bg) => ({
      background: bg,
      color: "white",
      border: "none",
      padding: "5px 11px",
      borderRadius: 5,
      fontSize: 11,
      fontWeight: 600,
      cursor: "pointer",
      display: "block",
      width: "100%",
      marginBottom: 3,
      transition: "opacity 0.15s",
    }),
  };

  const handleAutoAssign = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/appointments/auto-assign/${user.id}?date=${todayISO}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to auto assign numbers");
      }

      const updated = await res.json();

      setAppointments((prev) =>
        prev.map((appt) => {
          const found = updated.find((u) => u.id === appt.id);
          return found ? found : appt;
        })
      );

      alert("Appointment numbers assigned successfully");
    } catch (err) {
      console.error(err);
      alert("Auto assign failed");
    }
  };

  // Standard Table renderer for Today and History
  const renderTable = (list, showDate = false) => (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
      }}
    >
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
            <th style={S.th}>Refund</th>
            <th style={S.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={showDate ? 9 : 8}
                style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}
              >
                Loading appointments...
              </td>
            </tr>
          ) : list.length === 0 ? (
            <tr>
              <td
                colSpan={showDate ? 9 : 8}
                style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}
              >
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
                  {appt.appointmentNumber || (appt.id ? appt.id.slice(-6).toUpperCase() : "—")}
                </td>

                {/* Patient */}
                <td style={S.td}>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>
                    {appt.patientName || "—"}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>
                    {appt.patientId || ""}
                  </div>
                </td>

                {/* Doctor */}
                <td style={S.td}>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>
                    {getDoctorName(appt.doctorId)}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>
                    {appt.doctorId || ""}
                  </div>
                </td>

                {/* Date — history only */}
                {showDate && (
                  <td style={{ ...S.td, color: "#64748b" }}>{appt.date || "—"}</td>
                )}

                {/* Time */}
                <td style={{ ...S.td, fontWeight: 600 }}>{appt.time || "—"}</td>

                {/* Channeling No */}
                <td style={S.td}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "#0d7490",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    {appt.appointmentNumber
                      ? appt.appointmentNumber.replace("APT-", "")
                      : "—"}
                  </div>
                </td>

                {/* Status */}
                <td style={S.td}>
                  <span
                    style={{
                      ...statusStyle(appt.status),
                      padding: "3px 8px",
                      borderRadius: 5,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {fmt(appt.status)}
                  </span>
                </td>

                {/* Refund Status */}
                <td style={S.td}>
                  {appt.refundStatus === "REFUNDED" ? (
                    <span
                      style={{
                        color: "#15803d",
                        background: "#dcfce7",
                        padding: "3px 8px",
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 700,
                        display: "inline-block",
                      }}
                    >
                      ✓ Refunded
                    </span>
                  ) : appt.refundStatus === "AWAITING_PROCESSING" ? (
                    <span
                      style={{
                        color: "#0284c7",
                        background: "#e0f2fe",
                        padding: "3px 8px",
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 700,
                        display: "inline-block",
                      }}
                    >
                      Ready to Transfer
                    </span>
                  ) : appt.refundStatus === "AWAITING_BANK_DETAILS" ? (
                    <span
                      style={{
                        color: "#d97706",
                        background: "#fef3c7",
                        padding: "3px 8px",
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 600,
                        display: "inline-block",
                      }}
                    >
                      Details Pending
                    </span>
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: 11 }}>—</span>
                  )}
                </td>

                {/* Actions */}
                <td style={{ ...S.td, minWidth: 100 }}>
                  {appt.status === "CANCELLED" &&
                    (appt.refundStatus === "AWAITING_PROCESSING" ||
                      appt.refundStatus === "AWAITING_BANK_DETAILS") && (
                      <button
                        onClick={() => handleOpenRefundModal(appt)}
                        style={S.actionBtn(
                          appt.refundStatus === "AWAITING_PROCESSING"
                            ? "#ea580c"
                            : "#d97706"
                        )}
                        title="Process manual bank refund transfer"
                      >
                        Refund
                      </button>
                    )}
                  {appt.refundStatus === "REFUNDED" && (
                    <button
                      onClick={() => handleOpenRefundModal(appt)}
                      style={S.actionBtn("#0284c7")}
                      title="View completed refund details"
                    >
                      Receipt
                    </button>
                  )}
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
        {/* Success Alert Toast */}
        {actionSuccessMessage && (
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #10b981",
              color: "#065f46",
              borderRadius: 10,
              padding: "12px 18px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(16,185,129,0.15)",
            }}
          >
            <CheckCircle2 size={18} color="#059669" />
            <span style={{ flex: 1 }}>{actionSuccessMessage}</span>
            <button
              onClick={() => setActionSuccessMessage("")}
              style={{
                background: "none",
                border: "none",
                color: "#065f46",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Hospital Header Branding */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <div style={S.hospital}>
            {user?.name || "Hospital"}{" "}
            <span style={{ color: "#0099b0" }}>Portal</span>
          </div>
        </div>

        {/* Hero Banner */}
        <div style={S.hero}>
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#1e1b4b",
                marginBottom: 6,
              }}
            >
              Appointment & Refund Management
            </h1>
            <p style={{ fontSize: 14, color: "#4338ca", fontWeight: 500 }}>
              Track patient appointments and process authorized manual bank refunds
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 42, marginBottom: 6 }}>🏥</div>
            <div
              style={{
                background: "white",
                borderRadius: 20,
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: 700,
                color: "#1e1b4b",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              {todayDisplay}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {stats.map(({ label, value, tab, badge }) => (
            <div
              key={label}
              style={S.statCard(activeTab === tab && (label !== "Pending Refunds" || activeTab === "refunds"))}
              onClick={() => {
                setActiveTab(tab);
                setSearch("");
                setStatusFilter("ALL");
              }}
              title={`Switch to ${label}`}
            >
              <div
                style={{
                  fontSize: 12,
                  color: label === "Pending Refunds" ? "#ea580c" : "#0099b0",
                  fontWeight: 700,
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {label}
                {badge && (
                  <span
                    style={{
                      background: "#ffedd5",
                      color: "#c2410c",
                      padding: "1px 6px",
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: label === "Pending Refunds" ? "#c2410c" : "#1b3a6b",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            borderBottom: "1px solid #e2e8f0",
            marginBottom: 20,
            display: "flex",
            gap: 4,
          }}
        >
          <button
            style={S.tabBtn(activeTab === "today")}
            onClick={() => {
              setActiveTab("today");
              setSearch("");
              setStatusFilter("ALL");
            }}
          >
            Today's Appointments
          </button>
          <button
            style={S.tabBtn(activeTab === "history")}
            onClick={() => {
              setActiveTab("history");
              setSearch("");
              setStatusFilter("ALL");
            }}
          >
            Appointment History
          </button>
          <button
            style={S.tabBtn(activeTab === "refunds")}
            onClick={() => {
              setActiveTab("refunds");
              setSearch("");
            }}
          >
            Pending Refunds ({pendingRefunds.length})
          </button>
        </div>

        {/* TAB 1: TODAY'S APPOINTMENTS */}
        {activeTab === "today" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", gap: 8, flex: 1 }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search patient, appointment ID..."
                  style={{ ...S.input, flex: 1 }}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={S.input}
                >
                  <option value="ALL">All Status</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REFUND_PENDING">Refunds Pending</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, marginLeft: 12 }}>
                <button
                  onClick={() => {
                    setActiveTab("refunds");
                    setSearch("");
                  }}
                  style={{
                    background: "#ea580c",
                    color: "white",
                    border: "none",
                    padding: "9px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Manage Refunds ({pendingRefunds.length})
                </button>
                <button
                  onClick={handleAutoAssign}
                  style={{
                    background: "#1b3a6b",
                    color: "white",
                    border: "none",
                    padding: "9px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Auto Assign No.
                </button>
              </div>
            </div>
            {renderTable(todayList, false)}
          </>
        )}

        {/* TAB 2: APPOINTMENT HISTORY */}
        {activeTab === "history" && (
          <>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 14,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Search patient, appointment ID..."
                style={{ ...S.input, flex: 1, minWidth: 180 }}
              />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={S.input}
                title="From appointment date"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={S.input}
                title="To appointment date"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={S.input}
              >
                <option value="ALL">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="PENDING">Pending</option>
                <option value="REFUND_PENDING">Refunds Pending</option>
                <option value="REFUNDED">Refunded</option>
              </select>
              <button
                onClick={() => {
                  setActiveTab("refunds");
                  setSearch("");
                }}
                style={{
                  background: "#ea580c",
                  color: "white",
                  border: "none",
                  padding: "9px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Manage Refunds ({pendingRefunds.length})
              </button>
            </div>
            {renderTable(historyList, true)}
          </>
        )}

        {/* TAB 3: PENDING PATIENT REFUNDS MANAGEMENT */}
        {activeTab === "refunds" && (
          <div style={{ spaceY: 16 }}>
            {/* Refund Header Stats Banner */}
            <div
              style={{
                background: "white",
                borderRadius: 12,
                padding: "18px 24px",
                border: "1px solid #e2e8f0",
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#1e293b",
                    marginBottom: 4,
                  }}
                >
                  Pending Patient Refunds
                </h2>
                <p style={{ fontSize: 13, color: "#64748b" }}>
                  Authorized manual bank refund transfers for cancelled shifts and appointments
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 10,
                    padding: "8px 16px",
                    textAlign: "right",
                  }}
                >
                  <span style={{ fontSize: 11, color: "#166534", fontWeight: 600, display: "block" }}>
                    Total Pending Refund Value
                  </span>
                  <span style={{ fontSize: 18, color: "#14532d", fontWeight: 800 }}>
                    LKR {Number(totalPendingRefundAmount).toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <button
                  onClick={fetchData}
                  disabled={refundsLoading}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#475569",
                  }}
                  title="Refresh refund list"
                >
                  <RefreshCw size={14} className={refundsLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Sub-Filters and Search */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setRefundSubFilter("ALL")}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 20,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: refundSubFilter === "ALL" ? "#0d7490" : "#e2e8f0",
                    color: refundSubFilter === "ALL" ? "white" : "#475569",
                  }}
                >
                  All Pending ({pendingRefunds.length})
                </button>
                <button
                  onClick={() => setRefundSubFilter("READY")}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 20,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: refundSubFilter === "READY" ? "#059669" : "#e2e8f0",
                    color: refundSubFilter === "READY" ? "white" : "#475569",
                  }}
                >
                  Ready for Transfer ({readyForTransferCount})
                </button>
                <button
                  onClick={() => setRefundSubFilter("AWAITING_DETAILS")}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 20,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: refundSubFilter === "AWAITING_DETAILS" ? "#d97706" : "#e2e8f0",
                    color: refundSubFilter === "AWAITING_DETAILS" ? "white" : "#475569",
                  }}
                >
                  Awaiting Bank Details ({awaitingBankDetailsCount})
                </button>
              </div>

              <div style={{ flex: 1, maxWidth: 350 }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search patient, appointment #, bank..."
                  style={{ ...S.input, width: "100%" }}
                />
              </div>
            </div>

            {/* Error Banner if loading failed */}
            {refundsError && (
              <div
                style={{
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  color: "#be123c",
                  padding: "12px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{refundsError}</span>
                <button
                  onClick={fetchData}
                  style={{
                    background: "#be123c",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Pending Refunds Dedicated Table */}
            <div
              style={{
                background: "white",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#0d7490", color: "white" }}>
                    <th style={S.th}>Appt Number</th>
                    <th style={S.th}>Patient</th>
                    <th style={S.th}>Doctor</th>
                    <th style={S.th}>Date & Time</th>
                    <th style={S.th}>Original Fee</th>
                    <th style={S.th}>Refund Amount</th>
                    <th style={S.th}>Patient Bank Details</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {refundsLoading ? (
                    <tr>
                      <td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                        Loading pending refunds...
                      </td>
                    </tr>
                  ) : searchedPendingRefunds.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 4 }}>
                          No Pending Refunds Found
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                          {search || refundSubFilter !== "ALL"
                            ? "No pending refunds match your search or filter."
                            : "All patient refunds for this hospital are either completed or up to date."}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    searchedPendingRefunds.map((refItem) => {
                      const isReady = refItem.refundStatus === "AWAITING_PROCESSING";
                      return (
                        <tr key={refItem.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          {/* Appt Number */}
                          <td style={{ ...S.td, fontWeight: 700, color: "#1b3a6b" }}>
                            {refItem.appointmentNumber || (refItem.id ? `#${refItem.id.slice(-6).toUpperCase()}` : "—")}
                          </td>

                          {/* Patient */}
                          <td style={S.td}>
                            <div style={{ fontWeight: 600, color: "#1e293b" }}>
                              {refItem.patientName || "—"}
                            </div>
                            <div style={{ color: "#94a3b8", fontSize: 11 }}>
                              {refItem.patientId || ""}
                            </div>
                          </td>

                          {/* Doctor */}
                          <td style={S.td}>
                            <div style={{ fontWeight: 600, color: "#1e293b" }}>
                              {getDoctorName(refItem.doctorId)}
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td style={S.td}>
                            <div style={{ color: "#334155" }}>{refItem.date || "—"}</div>
                            <div style={{ color: "#94a3b8", fontSize: 11 }}>{refItem.time || "—"}</div>
                          </td>

                          {/* Original Fee */}
                          <td style={S.td}>
                            LKR {Number(refItem.amount || 0).toFixed(2)}
                          </td>

                          {/* Refund Amount */}
                          <td style={S.td}>
                            <div style={{ fontWeight: 800, color: "#047857", fontSize: 13 }}>
                              LKR {Number(refItem.refundAmount || 0).toFixed(2)}
                            </div>
                            <div style={{ color: "#64748b", fontSize: 11 }}>
                              {refItem.refundPercentage || 0}% of fee
                            </div>
                          </td>

                          {/* Bank details preview */}
                          <td style={S.td}>
                            {isReady ? (
                              <div>
                                <div style={{ fontWeight: 600, color: "#1e293b" }}>
                                  {refItem.bankName}
                                  {refItem.bankBranchName ? ` · ${refItem.bankBranchName}` : ""}
                                </div>
                                <div style={{ fontFamily: "monospace", fontSize: 11, color: "#0d7490" }}>
                                  Acc: {refItem.bankAccountNumber || refItem.maskedBankAccountNumber || "Submitted"}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: "#d97706", fontSize: 11, fontStyle: "italic" }}>
                                Awaiting patient submission
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td style={S.td}>
                            {isReady ? (
                              <span
                                style={{
                                  background: "#ecfdf5",
                                  color: "#047857",
                                  border: "1px solid #a7f3d0",
                                  padding: "3px 8px",
                                  borderRadius: 5,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  display: "inline-block",
                                }}
                              >
                                Ready to Transfer
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: "#fef3c7",
                                  color: "#b45309",
                                  border: "1px solid #fde68a",
                                  padding: "3px 8px",
                                  borderRadius: 5,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  display: "inline-block",
                                }}
                              >
                                Details Pending
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td style={{ ...S.td, minWidth: 120 }}>
                            <button
                              onClick={() => handleOpenRefundModal(refItem)}
                              style={{
                                background: isReady ? "#059669" : "#d97706",
                                color: "white",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                width: "100%",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                              }}
                            >
                              {isReady ? "Process Refund" : "View Details"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MANUAL REFUND PROCESSING & CONFIRMATION MODAL */}
        {/* ========================================================= */}
        {refundModalOpen && selectedRefund && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 16,
                maxWidth: 580,
                width: "100%",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                maxHeight: "92vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  background:
                    selectedRefund.refundStatus === "REFUNDED"
                      ? "linear-gradient(135deg, #f0fdf4, #e2e8f0)"
                      : selectedRefund.refundStatus === "AWAITING_PROCESSING"
                      ? "linear-gradient(135deg, #ecfdf5, #f0fdf4)"
                      : "linear-gradient(135deg, #fffbeb, #fef3c7)",
                  borderBottom: "1px solid #e2e8f0",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background:
                        selectedRefund.refundStatus === "REFUNDED"
                          ? "#dcfce7"
                          : selectedRefund.refundStatus === "AWAITING_PROCESSING"
                          ? "#d1fae5"
                          : "#fef3c7",
                      color:
                        selectedRefund.refundStatus === "REFUNDED"
                          ? "#15803d"
                          : selectedRefund.refundStatus === "AWAITING_PROCESSING"
                          ? "#047857"
                          : "#b45309",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selectedRefund.refundStatus === "REFUNDED" ? (
                      <CheckCircle2 size={20} />
                    ) : selectedRefund.refundStatus === "AWAITING_PROCESSING" ? (
                      <CreditCard size={20} />
                    ) : (
                      <Clock size={20} />
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      {selectedRefund.refundStatus === "REFUNDED"
                        ? "Completed Refund Record"
                        : selectedRefund.refundStatus === "AWAITING_PROCESSING"
                        ? "Manual Bank Refund Transfer"
                        : "Refund Details (Awaiting Patient Bank Details)"}
                    </h3>
                    <p style={{ fontSize: 12, color: "#64748b", margin: 0, marginTop: 2 }}>
                      Appt #{selectedRefund.appointmentNumber || selectedRefund.id} · {selectedRefund.patientName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRefundModalOpen(false);
                    setSelectedRefund(null);
                  }}
                  disabled={confirmingTransfer}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: 6,
                    borderRadius: 6,
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, spaceY: 16 }}>
                {/* Error Banner */}
                {refundError && (
                  <div
                    style={{
                      background: "#fff1f2",
                      border: "1px solid #fecdd3",
                      color: "#be123c",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 14,
                    }}
                  >
                    {refundError}
                  </div>
                )}

                {/* Refund Amount & Policy Box */}
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 12,
                    padding: "14px 18px",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #dcfce7",
                      paddingBottom: 10,
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>
                      Amount Hospital Must Refund:
                    </span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#14532d" }}>
                      LKR {Number(selectedRefund.refundAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 8,
                      fontSize: 11,
                      color: "#334155",
                    }}
                  >
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Original Payment</span>
                      <strong>LKR {Number(selectedRefund.amount || 0).toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Refund Percentage</span>
                      <strong>{selectedRefund.refundPercentage || 0}%</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Doctor</span>
                      <strong>{getDoctorName(selectedRefund.doctorId)}</strong>
                    </div>
                  </div>
                </div>

                {/* PATIENT BANK DETAILS DISPLAY */}
                <div
                  style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "16px 18px",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#0f172a",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Building size={14} color="#0d7490" />
                      Patient Bank Details
                    </span>
                    {selectedRefund.refundStatus === "AWAITING_PROCESSING" && (
                      <span
                        style={{
                          background: "#ecfdf5",
                          color: "#047857",
                          padding: "2px 8px",
                          borderRadius: 10,
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        Verified by Hospital
                      </span>
                    )}
                  </div>

                  {loadingRefundModal ? (
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: 8,
                        padding: "16px",
                        textAlign: "center",
                        color: "#0d7490",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />
                      <span>Retrieving verified bank details...</span>
                    </div>
                  ) : !selectedHasBankDetails ? (
                    /* Bank details not submitted yet */
                    <div
                      style={{
                        background: "#fffbeb",
                        border: "1px solid #fef3c7",
                        borderRadius: 8,
                        padding: "12px 14px",
                        fontSize: 12,
                        color: "#92400e",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, marginBottom: 4 }}>
                        <AlertCircle size={15} color="#d97706" />
                        Patient Has Not Submitted Bank Details
                      </div>
                      <p style={{ margin: 0, fontSize: 11, lineHeight: "1.4" }}>
                        The patient has been notified to provide their bank details in Patient Portal → My Appointments → Previous.
                        Once submitted, the patient's bank account details will appear here and the hospital can proceed with the transfer.
                      </p>
                    </div>
                  ) : (
                    /* Bank details are present */
                    <div style={{ spaceY: 10 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 12,
                          fontSize: 12,
                          marginBottom: 12,
                        }}
                      >
                        <div>
                          <span style={{ fontSize: 10, textTransform: "uppercase", color: "#64748b", display: "block" }}>
                            Account Holder Name
                          </span>
                          <strong style={{ fontSize: 13, color: "#0f172a" }}>
                            {selectedRefund.bankAccountHolderName || "—"}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: 10, textTransform: "uppercase", color: "#64748b", display: "block" }}>
                            Bank Name
                          </span>
                          <strong style={{ fontSize: 13, color: "#0f172a" }}>
                            {selectedRefund.bankName || "—"}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: 10, textTransform: "uppercase", color: "#64748b", display: "block" }}>
                            Branch Name
                          </span>
                          <strong style={{ fontSize: 13, color: "#0f172a" }}>
                            {selectedRefund.bankBranchName || "—"}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: 10, textTransform: "uppercase", color: "#64748b", display: "block" }}>
                            Submitted At
                          </span>
                          <span style={{ color: "#334155", fontSize: 12 }}>
                            {selectedRefund.bankDetailsSubmittedAt
                              ? new Date(selectedRefund.bankDetailsSubmittedAt).toLocaleDateString("en-GB")
                              : "Recently"}
                          </span>
                        </div>
                      </div>

                      {/* Full Unmasked Account Number Box (For Authorized Hospital Only) */}
                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1.5px dashed #0d7490",
                          borderRadius: 8,
                          padding: "10px 14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: 10, textTransform: "uppercase", color: "#0d7490", fontWeight: 700, display: "block" }}>
                            Bank Account Number (Manual Transfer Target)
                          </span>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 16,
                              fontWeight: 800,
                              color: "#0f172a",
                              letterSpacing: "1px",
                            }}
                          >
                            {selectedRefund.bankAccountNumber || selectedRefund.maskedBankAccountNumber}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyAccountNumber(
                              selectedRefund.bankAccountNumber || selectedRefund.maskedBankAccountNumber
                            )
                          }
                          style={{
                            background: copiedAccount ? "#dcfce7" : "white",
                            border: copiedAccount ? "1px solid #16a34a" : "1px solid #cbd5e1",
                            color: copiedAccount ? "#16a34a" : "#475569",
                            padding: "6px 12px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {copiedAccount ? <Check size={13} /> : <Copy size={13} />}
                          {copiedAccount ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Already Refunded State Details */}
                {selectedRefund.refundStatus === "REFUNDED" ? (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 10,
                      padding: "14px",
                      fontSize: 12,
                      color: "#166534",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      Refund Confirmed and Completed
                    </div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      <div>Transfer Reference: <strong>{selectedRefund.refundTransactionRef || "—"}</strong></div>
                      <div>Confirmed By: <strong>{selectedRefund.refundConfirmedBy || user?.name || "Hospital"}</strong></div>
                      <div>
                        Date:{" "}
                        <strong>
                          {selectedRefund.refundedAt
                            ? new Date(selectedRefund.refundedAt).toLocaleString("en-GB")
                            : "Recorded"}
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Manual Transfer Instructions & Confirmation Form */
                  <form onSubmit={handleConfirmRefundSubmit} style={{ spaceY: 14 }}>
                    {/* Manual Transfer Notice */}
                    <div
                      style={{
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        borderRadius: 10,
                        padding: "12px 14px",
                        fontSize: 11,
                        color: "#9a3412",
                        marginBottom: 14,
                        lineHeight: "1.4",
                      }}
                    >
                      <strong style={{ display: "block", marginBottom: 3, fontSize: 12 }}>
                        ⚠️ Manual Bank Transfer Required Outside CDCM
                      </strong>
                      The hospital administrator must log in to your bank's corporate banking portal (or issue a manual bank slip) to transfer <strong>LKR {Number(selectedRefund.refundAmount || 0).toFixed(2)}</strong> directly to the patient's account above. CDCM does not perform automatic fund debit.
                    </div>

                    {/* Transaction Reference & Notes */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                        Bank Transaction / Transfer Reference (Optional)
                      </label>
                      <input
                        type="text"
                        value={transferForm.transactionRef}
                        onChange={(e) =>
                          setTransferForm({ ...transferForm, transactionRef: e.target.value })
                        }
                        placeholder="e.g., TXN-94830129 or Cheque #10293"
                        disabled={!selectedHasBankDetails || loadingRefundModal}
                        style={{
                          ...S.input,
                          width: "100%",
                          boxSizing: "border-box",
                          fontFamily: "monospace",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                        Administrative Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={transferForm.notes}
                        onChange={(e) =>
                          setTransferForm({ ...transferForm, notes: e.target.value })
                        }
                        placeholder="e.g., Processed via corporate online banking portal."
                        disabled={!selectedHasBankDetails || loadingRefundModal}
                        style={{
                          ...S.input,
                          width: "100%",
                          boxSizing: "border-box",
                          resize: "none",
                        }}
                      />
                    </div>

                    {/* Confirmation Checkbox */}
                    {selectedHasBankDetails && (
                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          borderRadius: 8,
                          padding: "10px 12px",
                          marginBottom: 14,
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                            fontSize: 12,
                            color: "#1e293b",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={transferForm.confirmedCheck}
                            onChange={(e) =>
                              setTransferForm({
                                ...transferForm,
                                confirmedCheck: e.target.checked,
                              })
                            }
                            style={{ marginTop: 2, cursor: "pointer" }}
                          />
                          <span>
                            I confirm that the hospital has successfully executed and completed the manual bank transfer of LKR {Number(selectedRefund.refundAmount || 0).toFixed(2)} to {selectedRefund.bankAccountHolderName} outside the CDCM system.
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 10,
                        borderTop: "1px solid #e2e8f0",
                        paddingTop: 14,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setRefundModalOpen(false);
                          setSelectedRefund(null);
                        }}
                        disabled={confirmingTransfer}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          color: "#475569",
                          borderRadius: 8,
                          padding: "9px 16px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>

                      {!selectedHasBankDetails ? (
                        <button
                          type="button"
                          disabled
                          style={{
                            background: "#cbd5e1",
                            color: "#64748b",
                            border: "none",
                            borderRadius: 8,
                            padding: "9px 18px",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "not-allowed",
                          }}
                          title="Patient bank details required before confirming transfer"
                        >
                          {loadingRefundModal ? "Loading Details..." : "Awaiting Bank Details"}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={!transferForm.confirmedCheck || confirmingTransfer || loadingRefundModal}
                          style={{
                            background:
                              !transferForm.confirmedCheck || confirmingTransfer || loadingRefundModal
                                ? "#94a3b8"
                                : "#059669",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: "9px 20px",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor:
                              !transferForm.confirmedCheck || confirmingTransfer
                                ? "not-allowed"
                                : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {confirmingTransfer ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              Recording Transfer...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} />
                              Confirm Successful Refund
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentManagement;