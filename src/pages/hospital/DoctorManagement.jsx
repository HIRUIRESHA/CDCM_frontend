import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DoctorManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:8082/api/hospital/doctors/hospital/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  const removeDoctor = async (doctorId) => {
    try {
      const res = await fetch(
        `http://localhost:8082/api/hospital/doctors/${doctorId}/remove/${user.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) { alert("Failed to remove doctor"); return; }
      alert("Doctor removed successfully");
      setDoctors((prev) => prev.filter((doc) => doc.id !== doctorId));
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = doctors.filter((d) => {
    const fullName = `${d.title} ${d.firstName} ${d.lastName}`.toLowerCase();
    const spec = (d.specialization || "").toLowerCase();
    const term = search.toLowerCase();
    return fullName.includes(term) || spec.includes(term);
  });

  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter((d) => d.availability === "Available").length;
  const onLeave = doctors.filter((d) => d.availability === "On Leave").length;

  return (
    <div style={{ background: "#f0f4f8", minHeight: "100vh", padding: "28px" }}>
      <div style={{
        maxWidth: 960, margin: "0 auto", background: "white",
        borderRadius: 14, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.08)"
      }}>

        {/* Header */}
       {/* Header */}
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
  <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1a1a2e" }}>Doctor Management</h1>
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: "#1b3a6b" }}>
      Asiri <span style={{ color: "#0099b0" }}>Hospital</span>
    </div>
    {/* Two buttons side by side */}
    <div style={{ display: "flex", gap: 10 }}>
      <button
        onClick={() => navigate("/hospital/assigned-doctors")}
        style={{
          background: "white", color: "#0099b0", border: "2px solid #0099b0",
          padding: "9px 16px", borderRadius: 8, fontSize: 13,
          fontWeight: 600, cursor: "pointer"
        }}
      >
        Assigned Doctors
      </button>
      <button
        onClick={() => navigate("/hospital/assign-doctor")}
        style={{
          background: "#0099b0", color: "white", border: "none",
          padding: "9px 16px", borderRadius: 8, fontSize: 13,
          fontWeight: 600, cursor: "pointer"
        }}
      >
        + Add New Doctor
      </button>
    </div>
  </div>
</div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Doctors", value: totalDoctors },
            { label: "Active Doctors", value: activeDoctors },
            { label: "On Leave", value: onLeave },
          ].map(({ label, value }) => (
            <div key={label} style={{
              border: "1px solid #e2e8f0", borderRadius: 12,
              padding: 20, textAlign: "center"
            }}>
              <div style={{ fontSize: 13, color: "#0099b0", fontWeight: 600, marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#1b3a6b" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Search doctors by name or specialization..."
            style={{
              flex: 1, border: "1px solid #cbd5e1", borderRadius: 8,
              padding: "10px 14px", fontSize: 14, color: "#64748b", outline: "none"
            }}
          />
          <button style={{
            background: "#0d7490", color: "white", border: "none",
            padding: "10px 18px", borderRadius: 8, fontSize: 14, cursor: "pointer"
          }}>
            Filter ▼
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Loading doctors...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
            {search ? "No doctors match your search." : "No doctors assigned yet."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#0d7490", color: "white" }}>
                  {["Profile", "Availability", "Today Appointments", "Day Off", "Floor", "Room", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: "1px solid #e2e8f0" }}>

                    {/* Profile */}
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: "50%",
                          background: "#b0c4de", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, color: "#1b3a6b", fontSize: 15
                        }}>
                          {doc.firstName?.[0]}{doc.lastName?.[0]}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>
                            {doc.title} {doc.firstName} {doc.lastName}
                          </div>
                          <div>ID: {doc.id}</div>
                          <div>{doc.qualification || "—"}</div>
                          <div>{doc.specialization} · {doc.designation || "—"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Availability */}
                    <td style={{ padding: 12 }}>
                      <span style={{
                        background: doc.availability === "On Leave" ? "#fef9c3" : "#dcfce7",
                        color: doc.availability === "On Leave" ? "#92400e" : "#15803d",
                        padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600
                      }}>
                        {doc.availability === "On Leave" ? "🌙 On Leave" : "✅ Available"}
                      </span>
                    </td>

                    <td style={{ padding: 12 }}>{doc.todayAppointments ?? "—"}</td>
                    <td style={{ padding: 12 }}>{doc.dayOff || "—"}</td>
                    <td style={{ padding: 12 }}>{doc.floor || "—"}</td>
                    <td style={{ padding: 12 }}>{doc.room || "—"}</td>

                    {/* Actions */}
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <button
                          onClick={() => navigate(`/hospital/assigned-doctors/${doc.id}`)}
                          style={{
                            background: "#22c55e", color: "white", border: "none",
                            padding: "5px 12px", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer"
                          }}
                        >View</button>
                        <button
                          onClick={() => navigate(`/hospital/assign-doctor/${doc.id}`)}
                          style={{
                            background: "#3b82f6", color: "white", border: "none",
                            padding: "5px 12px", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer"
                          }}
                        >Edit</button>
                        <button
                          onClick={() => removeDoctor(doc.id)}
                          style={{
                            background: "#ef4444", color: "white", border: "none",
                            padding: "5px 12px", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer"
                          }}
                        >Delete</button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorManagement;