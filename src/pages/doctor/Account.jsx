import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DoctorAccountPage = () => {
  const { user } = useAuth();

  const [qualificationsOpen, setQualificationsOpen] = useState(true);
  const [experienceOpen, setExperienceOpen] = useState(true);
  const [hospitalsOpen, setHospitalsOpen] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Display-only doctor info (image comes from Profile.jsx)
  const profileImage =
    user?.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const displayName = user?.name || "Doctor";

  // Data fetched from backend (extra account details)
  const [doctorInfo, setDoctorInfo] = useState({
    specialty: "",
    qualifications: [],
    experience: "",
    hospitals: [],
  });

  // Form state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    specialty: "",
    qualificationsText: "",
    experience: "",
    hospitalsText: "",
  });

  // API base
  const accountUrl = user?.id
    ? `http://localhost:8082/api/auth/doctors/${user.id}/account`
    : null;

  // Helpers: convert multiline to array
  const linesToArray = (text) =>
    text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

  // Modal component
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Modal box */}
        <div className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

  const resetFormAndClose = () => {
    setFormData({
      specialty: doctorInfo.specialty,
      qualificationsText: doctorInfo.qualifications.join("\n"),
      experience: doctorInfo.experience,
      hospitalsText: doctorInfo.hospitals.join("\n"),
    });
    setIsEditing(false);
  };

  // Disable background scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isEditing ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isEditing]);

  // 1) Fetch doctor account data
  useEffect(() => {
    if (!accountUrl) return;

    const fetchAccount = async () => {
      try {
        setLoading(true);
        const res = await fetch(accountUrl);
        if (!res.ok) throw new Error("Failed to fetch doctor account data");

        const data = await res.json();

        // Normalize data
        const normalized = {
          specialty: data.specialty || "",
          qualifications: Array.isArray(data.qualifications) ? data.qualifications : [],
          experience: data.experience || "",
          hospitals: Array.isArray(data.hospitals) ? data.hospitals : [],
        };

        setDoctorInfo(normalized);

        // Prepare edit form fields
        setFormData({
          specialty: normalized.specialty,
          qualificationsText: normalized.qualifications.join("\n"),
          experience: normalized.experience,
          hospitalsText: normalized.hospitals.join("\n"),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [accountUrl]);

  // 2) Save (PUT) doctor account data
  const handleSaveAccount = async () => {
    if (!accountUrl) return;

    const payload = {
      specialty: formData.specialty.trim(),
      qualifications: linesToArray(formData.qualificationsText),
      experience: formData.experience.trim(),
      hospitals: linesToArray(formData.hospitalsText),
    };

    try {
      setSaving(true);
      const res = await fetch(accountUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update account");

      setDoctorInfo(payload);
      setIsEditing(false);
      alert("Account details updated!");
    } catch (e) {
      console.error(e);
      alert("Failed to update account details");
    } finally {
      setSaving(false);
    }
  };

  const CollapsibleSection = ({ title, isOpen, setIsOpen, children }) => (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-between transition-colors"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="mt-3 bg-white p-4 rounded-lg border border-gray-200">
          {children}
        </div>
      )}
    </div>
  );

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#2d3e7a] text-white text-center py-6">
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="text-lg mt-1">{doctorInfo.specialty || "Specialty not added"}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <img
                  src={profileImage}
                  alt={displayName}
                  className="w-full rounded-lg shadow-md object-cover aspect-square"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              <CollapsibleSection
                title="Qualifications"
                isOpen={qualificationsOpen}
                setIsOpen={setQualificationsOpen}
              >
                {doctorInfo.qualifications?.length ? (
                  <ul className="space-y-2">
                    {doctorInfo.qualifications.map((qual, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#2d3e7a] mr-2 mt-1">•</span>
                        <span className="text-gray-700 text-sm">{qual}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No qualifications added yet.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection
                title="Experience"
                isOpen={experienceOpen}
                setIsOpen={setExperienceOpen}
              >
                <p className="text-gray-700">
                  {doctorInfo.experience || "No experience added yet."}
                </p>
              </CollapsibleSection>

              <CollapsibleSection
                title="Working Hospitals"
                isOpen={hospitalsOpen}
                setIsOpen={setHospitalsOpen}
              >
                {doctorInfo.hospitals?.length ? (
                  <ul className="space-y-2">
                    {doctorInfo.hospitals.map((hospital, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#2d3e7a] mr-2 mt-1">•</span>
                        <span className="text-gray-700">{hospital}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No hospitals added yet.</p>
                )}
              </CollapsibleSection>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit size={20} />
                  <span>Edit Account</span>
                </button>

                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Trash2 size={20} />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL (New Box) */}
      <Modal
        isOpen={isEditing}
        title="Update Account Details"
        onClose={resetFormAndClose}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Specialty
            </label>
            <input
              type="text"
              value={formData.specialty}
              onChange={(e) =>
                setFormData((p) => ({ ...p, specialty: e.target.value }))
              }
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              placeholder="e.g., Dermatologist"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Qualifications (one per line)
            </label>
            <textarea
              rows={5}
              value={formData.qualificationsText}
              onChange={(e) =>
                setFormData((p) => ({ ...p, qualificationsText: e.target.value }))
              }
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              placeholder={`MBBS\nMD Dermatology\nDiploma in Dermatology`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Experience
            </label>
            <textarea
              rows={3}
              value={formData.experience}
              onChange={(e) =>
                setFormData((p) => ({ ...p, experience: e.target.value }))
              }
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              placeholder="e.g., Over 5 years in Dermatology practice"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Working Hospitals (one per line)
            </label>
            <textarea
              rows={4}
              value={formData.hospitalsText}
              onChange={(e) =>
                setFormData((p) => ({ ...p, hospitalsText: e.target.value }))
              }
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              placeholder={`Asiri Hospital Galle\nNawaloka Hospital Colombo`}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={resetFormAndClose}
            className="px-5 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveAccount}
            disabled={saving}
            className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorAccountPage;