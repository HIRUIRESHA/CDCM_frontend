import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Building2,
  FileText,
  Pill,
  AlertCircle,
  Clock,
  FlaskConical,
  Activity,
  ClipboardList,
  Search,
  RotateCcw,
  X
} from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "Unknown Date";
  try {
    if (typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return dateString;
  }
};

const RecordCard = ({ record, visitNumber, isExpanded, onToggle }) => {
  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        isExpanded
          ? "border-blue-300 shadow-md ring-2 ring-blue-50/50"
          : "border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="p-5 md:p-6">
        {/* Top bar: Date & Visit Badge */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-[#1a2a6b]" />
            <span className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wide">
              {formatDate(record.dateOfVisit)}
            </span>
          </div>
          <span className="text-xs font-bold text-[#1a2a6b] bg-blue-50/80 border border-blue-200/60 px-2.5 py-1 rounded-full">
            Visit #{visitNumber}
          </span>
        </div>

        {/* Diagnosis / Condition Title */}
        <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight mb-4 break-words">
          {record.conditions || "General Consultation / Clinical Visit"}
        </h3>

        {/* Doctor and Hospital Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Doctor
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 truncate">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{record.doctorName || "—"}</span>
            </div>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Hospital
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 truncate">
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{record.hospitalName || "—"}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onToggle}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isExpanded
                ? "bg-[#1a2a6b] text-white shadow-xs hover:bg-[#152255]"
                : "bg-blue-50 text-[#1a2a6b] border border-blue-200/60 hover:bg-blue-100/80"
            }`}
          >
            <span>{isExpanded ? "Hide Details" : "View Details"}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Expanded Clinical Details */}
        {isExpanded && (
          <div className="border-t border-slate-100 mt-5 pt-5 space-y-4">
            <div className="flex items-center gap-2 pb-1">
              <FileText className="w-4 h-4 text-[#1a2a6b]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a2a6b]">
                Clinical Details
              </h4>
            </div>

            {/* Condition / Diagnosis */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
                Condition / Diagnosis
              </span>
              <p className="text-sm font-semibold text-slate-900 break-words leading-relaxed">
                {record.conditions || "—"}
              </p>
            </div>

            {/* Doctor, Hospital & Date metadata row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Doctor Name
                </span>
                <span className="font-semibold text-slate-800 break-words">
                  {record.doctorName || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Hospital / Clinic
                </span>
                <span className="font-semibold text-slate-800 break-words">
                  {record.hospitalName || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Date of Visit
                </span>
                <span className="font-semibold text-slate-800">
                  {record.dateOfVisit || "—"}
                </span>
              </div>
            </div>

            {/* 2-column responsive details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Treatment / Procedure */}
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Treatment / Procedure
                  </span>
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-line break-words leading-relaxed">
                  {record.treatment || "—"}
                </p>
              </div>

              {/* Prescribed Medication */}
              <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200/60">
                <div className="flex items-center gap-1.5 mb-1">
                  <Pill className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Prescribed Medication
                  </span>
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-line break-words leading-relaxed font-mono">
                  {record.medications || "—"}
                </p>
              </div>

              {/* Allergies */}
              <div className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-200/60">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                    Allergies
                  </span>
                </div>
                <p className="text-xs font-semibold text-rose-900 break-words">
                  {record.allergies || "None"}
                </p>
              </div>

              {/* Follow-up Required */}
              <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/60">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Follow-up Required
                  </span>
                </div>
                <p className="text-xs font-bold text-amber-900 break-words">
                  {record.followUp || "No"}
                </p>
              </div>

              {/* Required Lab Tests */}
              <div className="p-3.5 bg-purple-50/40 rounded-xl border border-purple-200/60 md:col-span-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                    Required Lab Tests
                  </span>
                </div>
                <p className="text-xs text-purple-900 break-words">
                  {record.requiredLabTests || "—"}
                </p>
              </div>

              {/* Notes */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 md:col-span-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Notes
                  </span>
                </div>
                <p className="text-xs text-slate-700 italic break-words leading-relaxed">
                  {record.notes || "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MedicalHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRecordKey, setExpandedRecordKey] = useState(null);

  // Search & date filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://cdcm-backend.onrender.com/api/medical-records/patient/${user.id}`
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

  // Reset / Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedDate("");
    setExpandedRecordKey(null);
  };

  const isFiltered = Boolean(searchTerm.trim() || selectedDate);

  // Map each record with a stable key and original chronological visit number
  const recordsWithMeta = useMemo(() => {
    return (history || []).map((record, index) => ({
      ...record,
      originalVisitNumber: history.length - index,
      stableKey: record.id || `record-${index}`
    }));
  }, [history]);

  // Derived filtered records list (pure local filtering without mutating original state)
  const filteredHistory = useMemo(() => {
    return recordsWithMeta.filter((record) => {
      // 1. Doctor or Hospital case-insensitive partial match
      const term = searchTerm.trim().toLowerCase();
      const doctorMatch =
        record.doctorName &&
        record.doctorName.toLowerCase().includes(term);
      const hospitalMatch =
        record.hospitalName &&
        record.hospitalName.toLowerCase().includes(term);
      const matchesSearch = !term || Boolean(doctorMatch || hospitalMatch);

      // 2. Date match
      const matchesDate = !selectedDate || (
        record.dateOfVisit && record.dateOfVisit.startsWith(selectedDate)
      );

      return matchesSearch && matchesDate;
    });
  }, [recordsWithMeta, searchTerm, selectedDate]);

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
    <div className="w-full min-h-screen bg-slate-50/60 p-2 md:p-5">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
            <p className="text-xs text-gray-500 mt-1">
              Your personal health dossier, consultation records, and prescriptions
            </p>
          </div>
          {history.length > 0 && (
            <div className="flex items-center gap-2">
              {isFiltered && (
                <span className="hidden sm:inline-flex text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                  {filteredHistory.length} {filteredHistory.length === 1 ? "Matching Visit" : "Matching Visits"}
                </span>
              )}
              <span className="text-xs font-semibold text-[#1a2a6b] bg-blue-50 border border-[#1a2a6b] px-3 py-1 rounded-full shrink-0">
                {history.length} {history.length === 1 ? "Visit" : "Visits"} Found
              </span>
            </div>
          )}
        </div>

        {/* Filter Section */}
        {history.length > 0 && (
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* 1. Doctor / Hospital Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setExpandedRecordKey(null);
                  }}
                  placeholder="Search doctor or hospital..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs md:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#1a2a6b] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setExpandedRecordKey(null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2. Date Filter */}
              <div className="relative w-full md:w-56">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setExpandedRecordKey(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs md:text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-[#1a2a6b] focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
                  title="Filter by visit date"
                />
              </div>

              {/* 3. Clear / Reset Filter Button */}
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={!isFiltered}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all shrink-0 ${
                  isFiltered
                    ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900 cursor-pointer shadow-xs"
                    : "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed opacity-60"
                }`}
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            {/* Filter Summary Text when active */}
            {isFiltered && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Showing <strong className="text-slate-800 font-bold">{filteredHistory.length}</strong> matching {filteredHistory.length === 1 ? "visit" : "visits"}
                  {searchTerm && (
                    <span> for "<strong className="text-slate-700">{searchTerm}</strong>"</span>
                  )}
                  {selectedDate && (
                    <span> on <strong className="text-slate-700">{formatDate(selectedDate)}</strong></span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-blue-700 font-bold hover:underline cursor-pointer"
                >
                  Reset all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Records */}
        {history.length === 0 ? (
          <div className="w-full bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold text-sm">
              No medical history records available yet.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Clinical visit records and prescriptions documented by your doctors will appear here.
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-800 font-bold text-sm">
              No medical history records match your search.
            </p>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              We couldn't find any clinical records matching your search terms or selected date.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 bg-blue-50 text-[#1a2a6b] font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors border border-blue-200/60 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="w-full space-y-4">
            {filteredHistory.map((record) => (
              <RecordCard
                key={record.stableKey}
                record={record}
                visitNumber={record.originalVisitNumber}
                isExpanded={expandedRecordKey === record.stableKey}
                onToggle={() =>
                  setExpandedRecordKey((prev) =>
                    prev === record.stableKey ? null : record.stableKey
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;