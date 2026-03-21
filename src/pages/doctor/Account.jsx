import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Edit, Trash2, Star } from "lucide-react"; // Added Star icon
import { useAuth } from "../../context/AuthContext";

const DoctorAccountPage = () => {
  const { user } = useAuth();
  const { id } = useParams();

  const doctorId = id || user?.id;
  const isOwnProfile = user?.id === doctorId;

  const [qualificationsOpen, setQualificationsOpen] = useState(true);
  const [experienceOpen, setExperienceOpen] = useState(true);
  const [hospitalsOpen, setHospitalsOpen] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(true); // State for feedback section

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
  const [feedbacks, setFeedbacks] = useState([]); // State to store patient feedback
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    qualificationsText: "",
    experience: "",
    hospitalsText: "",
  });

  const linesToArray = (text) =>
    text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">×</button>
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
        
        // Added the fetch call for feedback assuming you have this endpoint
        const [accountRes, profileRes, hospListRes, feedbackRes] = await Promise.all([
          fetch(`http://localhost:8082/api/auth/doctors/${doctorId}/account`),
          fetch(`http://localhost:8082/api/auth/doctors/${doctorId}`),
          fetch(`http://localhost:8082/api/hospital/doctors/all-hospitals`),
          fetch(`http://localhost:8082/api/feedback/doctor/${doctorId}`) // 👈 New Feedback Fetch
        ]);

        if (!accountRes.ok || !profileRes.ok || !hospListRes.ok) throw new Error("Failed to fetch data");

        const accountData = await accountRes.json();
        const profileData = await profileRes.json();
        const hospListData = await hospListRes.json();
        
        // Handle feedback data gracefully if the endpoint doesn't exist yet
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

      setDoctorInfo(prev => ({ ...prev, ...payload }));
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

  // Helper function to render stars
  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={16} fill={star <= rating ? "currentColor" : "none"} strokeWidth={1.5} />
        ))}
      </div>
    );
  };

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#2d3e7a] text-white text-center py-6">
          <h1 className="text-2xl font-bold">{doctorInfo.name}</h1>
          <p className="text-lg mt-1">{doctorInfo.specialty}</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <img
                  src={doctorInfo.profileImage}
                  alt={doctorInfo.name}
                  className="w-full rounded-lg shadow-md object-cover aspect-square"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <CollapsibleSection title="Qualifications" isOpen={qualificationsOpen} setIsOpen={setQualificationsOpen}>
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

              <CollapsibleSection title="Experience" isOpen={experienceOpen} setIsOpen={setExperienceOpen}>
                <p className="text-gray-700">{doctorInfo.experience || "No experience added yet."}</p>
              </CollapsibleSection>

              <CollapsibleSection title="Working Hospitals" isOpen={hospitalsOpen} setIsOpen={setHospitalsOpen}>
                {doctorInfo.hospitals?.length ? (
                  <ul className="space-y-2">
                    {doctorInfo.hospitals.map((hospitalId, index) => {
                      const hospitalObj = allHospitals.find(h => h.id === hospitalId);
                      return (
                        <li key={index} className="flex items-start">
                          <span className="text-[#2d3e7a] mr-2 mt-1">•</span>
                          <span className="text-gray-700">
                            {hospitalObj ? hospitalObj.name : hospitalId}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No hospitals added yet.</p>
                )}
              </CollapsibleSection>

              {/* NEW FEEDBACK SECTION */}
              <CollapsibleSection title="Patient Feedback" isOpen={feedbackOpen} setIsOpen={setFeedbackOpen}>
                {feedbacks.length > 0 ? (
                  <div className="space-y-4">
                    {feedbacks.map((fb, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Patient Review</span>
                          {renderStars(fb.rating)}
                        </div>
                        <p className="text-sm text-gray-600 italic">"{fb.comment}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No feedback received yet.</p>
                )}
              </CollapsibleSection>

              {isOwnProfile && (
                <div className="mt-8 flex gap-4">
                  <button onClick={() => setIsEditing(true)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Edit size={20} /> <span>Edit Account</span>
                  </button>
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Trash2 size={20} /> <span>Delete Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal Logic Remains the same... */}
      <Modal isOpen={isEditing} title="Update Account Details" onClose={resetFormAndClose}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Qualifications (one per line)</label>
            <textarea rows={5} value={formData.qualificationsText} onChange={(e) => setFormData(p => ({ ...p, qualificationsText: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Experience</label>
            <textarea rows={3} value={formData.experience} onChange={(e) => setFormData(p => ({ ...p, experience: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Working Hospitals (one per line)</label>
            <textarea rows={4} value={formData.hospitalsText} onChange={(e) => setFormData(p => ({ ...p, hospitalsText: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded p-2" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={resetFormAndClose} className="px-5 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSaveAccount} disabled={saving} className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorAccountPage;