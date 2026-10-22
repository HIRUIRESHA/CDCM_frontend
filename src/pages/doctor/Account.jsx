import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Star,
  Stethoscope,
  Award,
  Briefcase,
  Building2,
  MessageSquare,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const linesToArray = (text) =>
  (text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const getHospitalId = (h) => (h ? String(h.id || h._id || "").trim() : "");

/**
 * Resolves doctor's stored affiliations against the available hospital directory.
 * - Matches by hospital identifier (id or _id).
 * - Matches legacy hospital names if there is a unique, unambiguous match.
 * - Identifies unresolved or deleted hospital records without modifying the DB.
 */
const resolveHospitalAffiliations = (rawAffiliations, hospitalsList) => {
  if (!Array.isArray(rawAffiliations) || !Array.isArray(hospitalsList)) {
    return { resolvedIds: [], resolvedHospitals: [], unresolvedCount: 0 };
  }

  const resolvedIds = [];
  const resolvedHospitals = [];
  let unresolvedCount = 0;

  rawAffiliations.forEach((item) => {
    if (item === null || item === undefined) return;
    const str = String(item).trim();
    if (!str) return;

    // 1. Try matching by hospital identifier
    const matchById = hospitalsList.find((h) => getHospitalId(h) === str);
    if (matchById) {
      const id = getHospitalId(matchById);
      if (!resolvedIds.includes(id)) {
        resolvedIds.push(id);
        resolvedHospitals.push(matchById);
      }
      return;
    }

    // 2. Try unique legacy hospital name match (case-insensitive exact match)
    const matchesByName = hospitalsList.filter(
      (h) => h.name && h.name.trim().toLowerCase() === str.toLowerCase()
    );
    if (matchesByName.length === 1) {
      const id = getHospitalId(matchesByName[0]);
      if (!resolvedIds.includes(id)) {
        resolvedIds.push(id);
        resolvedHospitals.push(matchesByName[0]);
      }
      return;
    }

    // 3. Unresolved: either a deleted hospital ID/name, ambiguous name, or invalid code
    unresolvedCount += 1;
  });

  return { resolvedIds, resolvedHospitals, unresolvedCount };
};

const DoctorAccountPage = () => {
  const { user } = useAuth();
  const { id } = useParams();

  const doctorId = id || user?.id;
  const isOwnProfile = user?.id === doctorId;

  const [qualificationsOpen, setQualificationsOpen] = useState(true);
  const [experienceOpen, setExperienceOpen] = useState(true);
  const [hospitalsOpen, setHospitalsOpen] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [doctorInfo, setDoctorInfo] = useState({
    name: "",
    profileImage: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    specialty: "",
    qualifications: [],
    experience: "",
    hospitals: [],
  });

  const [allHospitals, setAllHospitals] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    qualificationsText: "",
    experience: "",
    selectedHospitals: [],
  });

  const [hospitalSearch, setHospitalSearch] = useState("");

  // Filter and deduplicate available hospitals from active directory
  const availableHospitals = useMemo(() => {
    if (!Array.isArray(allHospitals)) return [];
    const seen = new Set();
    const list = [];
    for (const h of allHospitals) {
      if (!h || typeof h !== "object") continue;
      const hospId = getHospitalId(h);
      if (!hospId || seen.has(hospId)) continue;
      if (!h.name || typeof h.name !== "string" || !h.name.trim()) continue;
      seen.add(hospId);
      list.push(h);
    }
    return list;
  }, [allHospitals]);

  // Read-only resolved hospitals and unresolved count
  const {
    resolvedHospitals: validWorkingHospitals,
    unresolvedCount: unresolvedAffiliationsCount,
  } = useMemo(
    () => resolveHospitalAffiliations(doctorInfo.hospitals, availableHospitals),
    [doctorInfo.hospitals, availableHospitals]
  );

  // Filtered available hospitals for search in modal
  const filteredHospitals = useMemo(() => {
    if (!hospitalSearch.trim()) return availableHospitals;
    const query = hospitalSearch.trim().toLowerCase();
    return availableHospitals.filter(
      (h) =>
        (h.name && h.name.toLowerCase().includes(query)) ||
        (h.location && h.location.toLowerCase().includes(query))
    );
  }, [availableHospitals, hospitalSearch]);

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="bg-gradient-to-r from-[#1e2d5e] to-[#2d3e7a] px-6 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white tracking-wide">{title}</h2>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white text-xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto">{children}</div>
        </div>
      </div>
    );
  };

  const handleOpenEditModal = () => {
    const { resolvedIds } = resolveHospitalAffiliations(doctorInfo.hospitals, availableHospitals);
    setFormData({
      qualificationsText: (doctorInfo.qualifications || []).join("\n"),
      experience: doctorInfo.experience || "",
      selectedHospitals: resolvedIds,
    });
    setHospitalSearch("");
    setIsEditing(true);
  };

  const resetFormAndClose = () => {
    const { resolvedIds } = resolveHospitalAffiliations(doctorInfo.hospitals, availableHospitals);
    setFormData({
      qualificationsText: (doctorInfo.qualifications || []).join("\n"),
      experience: doctorInfo.experience || "",
      selectedHospitals: resolvedIds,
    });
    setHospitalSearch("");
    setIsEditing(false);
  };

  const handleToggleHospital = (hospitalId) => {
    const normId = String(hospitalId);
    setFormData((prev) => {
      const current = prev.selectedHospitals || [];
      const exists = current.includes(normId);
      const updated = exists
        ? current.filter((id) => id !== normId)
        : [...current, normId];
      return { ...prev, selectedHospitals: updated };
    });
  };

  useEffect(() => {
    if (!doctorId) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [accountRes, profileRes, hospListRes, feedbackRes] = await Promise.all([
          fetch(`https://cdcm-backend.onrender.com/api/auth/doctors/${doctorId}/account`),
          fetch(`https://cdcm-backend.onrender.com/api/auth/doctors/${doctorId}`),
          fetch(`https://cdcm-backend.onrender.com/api/hospital/doctors/all-hospitals`).catch(() => null),
          fetch(`https://cdcm-backend.onrender.com/api/feedback/doctor/${doctorId}`).catch(() => null),
        ]);

        if (!accountRes.ok || !profileRes.ok) throw new Error("Failed to fetch doctor account data");

        const accountData = await accountRes.json();
        const profileData = await profileRes.json();

        let hospListData = [];
        if (hospListRes && hospListRes.ok) {
          try {
            hospListData = await hospListRes.json();
          } catch (e) {
            console.error("Failed to parse hospital directory:", e);
          }
        }

        let feedbackData = [];
        if (feedbackRes && feedbackRes.ok) {
          try {
            feedbackData = await feedbackRes.json();
          } catch (e) {
            console.error("Failed to parse feedbacks:", e);
          }
        }

        const validHospitalsArray = Array.isArray(hospListData) ? hospListData : [];
        setAllHospitals(validHospitalsArray);
        setFeedbacks(Array.isArray(feedbackData) ? feedbackData : []);

        const combinedData = {
          name: `${profileData.title || ""} ${profileData.firstName || ""} ${profileData.lastName || ""}`.trim(),
          profileImage: profileData.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          specialty: profileData.specialization || "Specialty not assigned",
          qualifications: Array.isArray(accountData.qualifications) ? accountData.qualifications : [],
          experience: accountData.experience || "",
          hospitals: Array.isArray(accountData.hospitals) ? accountData.hospitals : [],
        };

        setDoctorInfo(combinedData);

        const available = validHospitalsArray.filter((h) => h && (h.id || h._id) && h.name);
        const { resolvedIds } = resolveHospitalAffiliations(combinedData.hospitals, available);

        setFormData({
          qualificationsText: combinedData.qualifications.join("\n"),
          experience: combinedData.experience,
          selectedHospitals: resolvedIds,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [doctorId]);

  const handleSaveAccount = async () => {
    if (!isOwnProfile) return;

    // Deduplicate and ensure every submitted ID belongs to availableHospitals
    const availableIdSet = new Set(availableHospitals.map((h) => getHospitalId(h)));
    const validHospitalIds = Array.from(new Set(formData.selectedHospitals || []))
      .map(String)
      .filter((id) => availableIdSet.has(id));

    const payload = {
      qualifications: linesToArray(formData.qualificationsText),
      experience: (formData.experience || "").trim(),
      hospitals: validHospitalIds,
    };

    try {
      setSaving(true);
      const res = await fetch(`https://cdcm-backend.onrender.com/api/auth/doctors/${doctorId}/account`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update account");

      setDoctorInfo((prev) => ({ ...prev, ...payload }));
      setFormData({
        qualificationsText: payload.qualifications.join("\n"),
        experience: payload.experience,
        selectedHospitals: payload.hospitals,
      });
      setIsEditing(false);
      alert("Account details updated!");
    } catch (e) {
      console.error(e);
      alert("Failed to update account details");
    } finally {
      setSaving(false);
    }
  };

  const sectionIcons = {
    Qualifications: <Award size={16} className="text-[#2d3e7a]" />,
    Experience: <Briefcase size={16} className="text-[#2d3e7a]" />,
    "Working Hospitals": <Building2 size={16} className="text-[#2d3e7a]" />,
    "Patient Feedback": <MessageSquare size={16} className="text-[#2d3e7a]" />,
  };

  const CollapsibleSection = ({ title, isOpen, setIsOpen, children }) => (
    <div className="mb-3 rounded-xl border border-slate-100 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 hover:bg-[#f0f3fb] text-slate-700 font-semibold py-3 px-4 flex items-center justify-between transition-colors group"
      >
        <div className="flex items-center gap-2">
          {sectionIcons[title]}
          <span className="text-xs tracking-widest uppercase font-bold text-slate-600">{title}</span>
        </div>
        <span className="text-slate-400 group-hover:text-[#2d3e7a] transition-colors">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {isOpen && (
        <div className="bg-white px-5 py-4">
          {children}
        </div>
      )}
    </div>
  );

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? "text-amber-400" : "text-slate-200"}
          fill={star <= rating ? "currentColor" : "currentColor"}
        />
      ))}
    </div>
  );

  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedbacks.length).toFixed(1)
      : null;

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2d3e7a] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium tracking-wide text-sm">Loading Profile...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top Banner */}
      <div className="relative bg-gradient-to-br from-[#1a2550] via-[#2d3e7a] to-[#3b52a5] overflow-hidden">
        <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute top-6 right-36 w-20 h-20 rounded-full bg-white/5" />

        <div className="relative max-w-5xl mx-auto px-3 py-7 flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-xl overflow-hidden ring-4 ring-white/30 shadow-xl">
              <img
                src={doctorInfo.profileImage}
                alt={doctorInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#3b52a5] rounded-full p-1.5 shadow-md border-2 border-white/30">
              <Stethoscope size={12} className="text-white" />
            </div>
          </div>

          {/* Name & specialty */}
          <div className="text-center sm:text-left">
            <p className="text-blue-200 text-xs uppercase tracking-[0.2em] font-semibold mb-1">
              Medical Professional
            </p>
            <h1 className="text-2xl font-bold text-white leading-tight">{doctorInfo.name}</h1>
            <div className="mt-2 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">{doctorInfo.specialty}</span>
            </div>
          </div>

          {/* Avg rating badge */}
          {avgRating && (
            <div className="sm:ml-auto flex flex-col items-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow">
              <span className="text-2xl font-bold text-white">{avgRating}</span>
              <div className="flex gap-0.5 mt-1">{renderStars(Math.round(parseFloat(avgRating)))}</div>
              <span className="text-blue-200 text-xs mt-0.5">{feedbacks.length} review{feedbacks.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-3 py-5">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Qualifications", value: (doctorInfo.qualifications || []).length, icon: <Award size={18} className="text-[#2d3e7a]" /> },
            { label: "Hospitals", value: validWorkingHospitals.length, icon: <Building2 size={18} className="text-[#2d3e7a]" /> },
            { label: "Reviews", value: feedbacks.length, icon: <MessageSquare size={18} className="text-[#2d3e7a]" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm border border-slate-100">
              <div className="bg-[#eef1fb] rounded-lg p-2">{stat.icon}</div>
              <div>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <CollapsibleSection title="Qualifications" isOpen={qualificationsOpen} setIsOpen={setQualificationsOpen}>
          {doctorInfo.qualifications?.length ? (
            <ul className="space-y-2">
              {doctorInfo.qualifications.map((qual, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2d3e7a] shrink-0" />
                  <span className="text-slate-700 text-sm leading-relaxed">{qual}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm italic">No qualifications added yet.</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Experience" isOpen={experienceOpen} setIsOpen={setExperienceOpen}>
          {doctorInfo.experience ? (
            <p className="text-slate-700 text-sm leading-relaxed">{doctorInfo.experience}</p>
          ) : (
            <p className="text-slate-400 text-sm italic">No experience added yet.</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Working Hospitals" isOpen={hospitalsOpen} setIsOpen={setHospitalsOpen}>
          {validWorkingHospitals.length > 0 ? (
            <ul className="space-y-2">
              {validWorkingHospitals.map((hospitalObj, i) => (
                <li
                  key={getHospitalId(hospitalObj) || i}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="bg-[#eef1fb] rounded-lg p-1.5">
                    <Building2 size={13} className="text-[#2d3e7a]" />
                  </div>
                  <span className="text-slate-700 text-sm font-medium">
                    {hospitalObj.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm italic">No active hospital affiliations.</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Patient Feedback" isOpen={feedbackOpen} setIsOpen={setFeedbackOpen}>
          {feedbacks.length > 0 ? (
            <div className="space-y-2.5">
              {feedbacks.map((fb, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2d3e7a] to-[#3b52a5] flex items-center justify-center text-white text-xs font-bold">
                        P
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Patient Review</span>
                    </div>
                    {renderStars(fb.rating)}
                  </div>
                  <p className="text-sm text-slate-500 italic leading-relaxed pl-8">"{fb.comment}"</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic">No feedback received yet.</p>
          )}
        </CollapsibleSection>

        {/* Action Buttons */}
        {isOwnProfile && (
          <div className="mt-5 flex gap-3">
            <button
              onClick={handleOpenEditModal}
              className="flex-1 bg-gradient-to-r from-[#1e2d5e] to-[#2d3e7a] hover:from-[#1a2550] hover:to-[#253470] text-white font-semibold mx-100 py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditing} title="Update Account Details" onClose={resetFormAndClose}>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Qualifications <span className="normal-case text-slate-400 font-normal">(one per line)</span>
            </label>
            <textarea
              rows={5}
              value={formData.qualificationsText}
              onChange={(e) => setFormData((p) => ({ ...p, qualificationsText: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2d3e7a] focus:border-transparent resize-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Experience
            </label>
            <textarea
              rows={3}
              value={formData.experience}
              onChange={(e) => setFormData((p) => ({ ...p, experience: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2d3e7a] focus:border-transparent resize-none transition"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                Working Hospitals
              </label>
              <span className="text-xs font-semibold text-[#2d3e7a] bg-[#eef1fb] px-2.5 py-0.5 rounded-full">
                {(formData.selectedHospitals || []).length} selected
              </span>
            </div>

            {/* Inactive / unresolved notice if doctor had affiliations to deleted or unknown hospitals */}
            {unresolvedAffiliationsCount > 0 && (
              <div className="mb-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <span className="font-bold">Notice:</span>
                <span>
                  {unresolvedAffiliationsCount} hospital affiliation{unresolvedAffiliationsCount > 1 ? "s are" : " is"} no longer active in the directory. Saving will update your profile with only active hospitals selected below.
                </span>
              </div>
            )}

            {/* Search filter if directory contains several hospitals */}
            {availableHospitals.length > 5 && (
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hospitals..."
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2d3e7a] text-slate-700 placeholder-slate-400"
                />
              </div>
            )}

            {/* Hospital Checkbox Selector Grid */}
            <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 max-h-52 overflow-y-auto">
              {availableHospitals.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3 text-center">
                  No registered hospitals found in directory.
                </p>
              ) : filteredHospitals.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3 text-center">
                  No hospitals match "{hospitalSearch}".
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredHospitals.map((hosp) => {
                    const hospId = getHospitalId(hosp);
                    const isSelected = (formData.selectedHospitals || []).includes(hospId);

                    return (
                      <label
                        key={hospId}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition select-none ${
                          isSelected
                            ? "bg-blue-50 border-[#2d3e7a] text-[#1e2d5e] font-semibold shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleHospital(hospId)}
                          className="accent-[#2d3e7a] w-4 h-4 rounded cursor-pointer shrink-0"
                        />
                        <Building2
                          size={14}
                          className={`shrink-0 ${isSelected ? "text-[#2d3e7a]" : "text-slate-400"}`}
                        />
                        <span className="truncate" title={hosp.name}>
                          {hosp.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={resetFormAndClose}
            className="px-5 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAccount}
            disabled={saving}
            className="px-5 py-2 bg-gradient-to-r from-[#1e2d5e] to-[#2d3e7a] hover:from-[#1a2550] hover:to-[#253470] text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition shadow-md"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorAccountPage;