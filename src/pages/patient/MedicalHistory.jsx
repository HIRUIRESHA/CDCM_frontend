import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
    <line x1="5" y1="1.5" x2="5" y2="4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="11" y1="1.5" x2="11" y2="4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="1.5" y1="7" x2="14.5" y2="7" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 16 16"
    fill="none"
    className={`transition-transform duration-300 ease-in-out ${open ? "rotate-180" : "rotate-0"}`}
  >
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Row = ({ label, value }) => (
  <tr className="border-b border-[#1a2a6b] last:border-b-0">
    <td className="w-52 px-4 py-3 text-sm text-gray-500 bg-gray-50 border-r border-[#1a2a6b] align-top whitespace-nowrap font-medium">
      {label}
    </td>
    <td className="px-4 py-3 text-sm text-gray-800 bg-white align-top wrap-break-word">
      {value || "—"}
    </td>
  </tr>
);

const RecordCard = ({ record }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="w-full border-2 border-[#1a2a6b] rounded-sm overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors duration-150 text-left ${
          open ? "border-b-2 border-[#1a2a6b]" : ""
        }`}
      >
        <span className="text-gray-500">
          <CalendarIcon />
        </span>
        <span className="flex-1 text-sm font-bold text-gray-800 tracking-wide uppercase">
          Date: {record.dateOfVisit}
        </span>
        <span className="text-gray-500">
          <ChevronIcon open={open} />
        </span>
      </button>

      {/* Collapsible Table Body */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <table className="w-full border-collapse table-fixed">
          <tbody>
            <Row label="Condition / Diagnosis" value={record.conditions} />
            <Row label="Doctor Name"           value={record.doctorName} />
            <Row label="Hospital / Clinic"     value={record.hospitalName} />
            <Row label="Date of Visit"         value={record.dateOfVisit} />
            <Row label="Treatment / Procedure" value={record.treatment} />
            <Row label="Prescribed Medication" value={record.medications} />
            <Row label="Allergies"             value={record.allergies} />
            <Row label="Follow-up Required"    value={record.followUp} />
            <Row label="Required Lab Tests"    value={record.requiredLabTests} />
            <Row label="Notes"                 value={record.notes} />
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MedicalHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:8082/api/medical-records/patient/${user.id}`
        );
        setHistory(res.data);
      } catch (err) {
        console.error("Error loading history:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1a2a6b]"></div>
        <span className="ml-3 text-gray-500 text-sm font-medium">
          Loading Medical Records...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white p-6 md:p-10">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
        {history.length > 0 && (
          <span className="text-xs font-semibold text-[#1a2a6b] bg-blue-50 border border-[#1a2a6b] px-3 py-1 rounded-full">
            {history.length} {history.length === 1 ? "Visit" : "Visits"} Found
          </span>
        )}
      </div>

      {/* Records */}
      {history.length === 0 ? (
        <div className="w-full border-2 border-dashed border-gray-300 rounded-sm p-12 text-center">
          <p className="text-gray-400 text-sm">
            No medical history records available yet.
          </p>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {history.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;