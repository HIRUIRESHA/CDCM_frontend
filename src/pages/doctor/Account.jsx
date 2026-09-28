import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Edit, Trash2, Star, Stethoscope, Award, Briefcase, Building2, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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
    hospitalsText: "",
  });

  const linesToArray = (text) =>
    text.split("\n").map((l) => l.trim()).filter(Boolean);

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#1e2d5e] to-[#2d3e7a] px-6 py-4">
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
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

  const resetFormAndClose = () => {
    setFormData({
      qualificationsText: doctorInfo.qualifications.join("\n"),
      experience: doctorInfo.experience,
      hospitalsText: doctorInfo.hospitals.join("\n"),
    });
    setIsEditing(false);
  };

  useEffect(() => {
    if (!doctorId) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [accountRes, profileRes, hospListRes, feedbackRes] = await Promise.all([
          fetch(`http://localhost:8082/api/auth/doctors/${doctorId}/account`),
          fetch(`http://localhost:8082/api/auth/doctors/${doctorId}`),
          fetch(`http://localhost:8082/api/hospital/doctors/all-hospitals`),
          fetch(`http://localhost:8082/api/feedback/doctor/${doctorId}`),
        ]);

        if (!accountRes.ok || !profileRes.ok || !hospListRes.ok) throw new Error("Failed to fetch data");

        const accountData = await accountRes.json();
        const profileData = await profileRes.json();
        const hospListData = await hospListRes.json();

        let feedbackData = [];
        if (feedbackRes.ok) {
          feedbackData = await feedbackRes.json();
        }

        setAllHospitals(hospListData);
        setFeedbacks(feedbackData);

        const combinedData = {
          name: `${profileData.title} ${profileData.firstName} ${profileData.lastName}`,
          profileImage: profileData.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          specialty: profileData.specialization || "Specialty not assigned",
          qualifications: Array.isArray(accountData.qualifications) ? accountData.qualifications : [],
          experience: accountData.experience || "",
          hospitals: Array.isArray(accountData.hospitals) ? accountData.hospitals : [],
        };

        setDoctorInfo(combinedData);
        setFormData({
          qualificationsText: combinedData.qualifications.join("\n"),
          experience: combinedData.experience,
          hospitalsText: combinedData.hospitals.join("\n"),
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

    const payload = {
      qualifications: linesToArray(formData.qualificationsText),
      experience: formData.experience.trim(),
      hospitals: linesToArray(formData.hospitalsText),
    };

    try {
      setSaving(true);
      const res = await fetch(`http://localhost:8082/api/auth/doctors/${doctorId}/account`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update account");

      setDoctorInfo((prev) => ({ ...prev, ...payload }));
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
            { label: "Qualifications", value: doctorInfo.qualifications.length, icon: <Award size={18} className="text-[#2d3e7a]" /> },
            { label: "Hospitals", value: doctorInfo.hospitals.length, icon: <Building2 size={18} className="text-[#2d3e7a]" /> },
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
          {doctorInfo.hospitals?.length ? (
            <ul className="space-y-2">
              {doctorInfo.hospitals.map((hospitalId, i) => {
                const hospitalObj = allHospitals.find((h) => h.id === hospitalId);
                return (
                  <li key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="bg-[#eef1fb] rounded-lg p-1.5">
                      <Building2 size={13} className="text-[#2d3e7a]" />
                    </div>
                    <span className="text-slate-700 text-sm font-medium">
                      {hospitalObj ? hospitalObj.name : hospitalId}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm italic">No hospitals added yet.</p>
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
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-gradient-to-r from-[#1e2d5e] to-[#2d3e7a] hover:from-[#1a2550] hover:to-[#253470] text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
            <button className="flex-1 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border border-red-100 hover:border-red-200 shadow-sm">
              <Trash2 size={16} />
              <span>Delete Account</span>
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
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Working Hospitals <span className="normal-case text-slate-400 font-normal">(one per line)</span>
            </label>
            <textarea
              rows={4}
              value={formData.hospitalsText}
              onChange={(e) => setFormData((p) => ({ ...p, hospitalsText: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2d3e7a] focus:border-transparent resize-none transition"
            />
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