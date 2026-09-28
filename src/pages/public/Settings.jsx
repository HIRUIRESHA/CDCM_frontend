import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Shield,
  Bell,
  Camera,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  Phone,
  Calendar,
  Save,
  RotateCcw,
  Loader2,
  Building,
  Briefcase,
  Award,
  Stethoscope,
  MapPin,
  FileBadge,
  Eye,
  EyeOff,
  Building2,
  Plus,
  Trash2,
} from "lucide-react";
import api from "../../api/api";

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const token = localStorage.getItem("token");
  const role = user?.role ? user.role.toUpperCase() : "PATIENT";

  // Active Tab
  const [activeTab, setActiveTab] = useState("profile");

 
  // 1. PATIENT STATE
 
  const [patientData, setPatientData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    nicOrPassport: "",
    dateOfBirth: "",
    residentialAddress: "",
    profileImage: "",
  });
  const [initialPatientData, setInitialPatientData] = useState(null);

 
  // 2. DOCTOR STATE
 
  const [doctorPersonalData, setDoctorPersonalData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    medicalLicenseNumber: "",
    profileImage: "",
  });
  const [initialDoctorPersonalData, setInitialDoctorPersonalData] = useState(null);

  const [doctorAccountData, setDoctorAccountData] = useState({
    specialization: "",
    experience: "",
    qualifications: [],
    hospitals: [],
  });
  const [initialDoctorAccountData, setInitialDoctorAccountData] = useState(null);
  const [allHospitalsList, setAllHospitalsList] = useState([]);
  const [newQualificationInput, setNewQualificationInput] = useState("");

 
  // 3. HOSPITAL STATE

  const [hospitalData, setHospitalData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    licenseNumber: "",
    managerName: "",
    location: "",
    profileImage: "",
  });
  const [initialHospitalData, setInitialHospitalData] = useState(null);

  
  // COMMON LOADING & MESSAGE STATES

  const [dataLoading, setDataLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  // Notification Preferences State (Connected to backend MongoDB)
  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailVideoLinks: true,
    emailReports: true,
    smsUrgentAlerts: true,
    smsPaymentReceipts: false,
    inAppMessages: true,
    inAppSystemUpdates: true,
  });
  const [initialNotifications, setInitialNotifications] = useState(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsSaving, setNotificationsSaving] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({ type: "", text: "" });

 
  // FETCH USER DATA ON MOUNT
  
  useEffect(() => {
    let isMounted = true;

    const fetchAllUserData = async () => {
      setDataLoading(true);
      setProfileMessage({ type: "", text: "" });

      try {
        if (role === "PATIENT" && user?.id) {
          const res = await api.get(`/api/auth/patients/${user.id}`);
          if (isMounted && res.data) {
            const data = res.data;
            const mapped = {
              title: data.title || "",
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || user?.email || "",
              contactNumber: data.contactNumber || "",
              nicOrPassport: data.nicOrPassport || "",
              dateOfBirth: data.dateOfBirth || "",
              residentialAddress: data.residentialAddress || "",
              profileImage: data.profileImage || user?.profileImage || "",
            };
            setPatientData(mapped);
            setInitialPatientData(mapped);
          }
        } else if (role === "DOCTOR" && user?.id) {
          const [profileRes, accountRes, hospitalsRes] = await Promise.all([
            api.get(`/api/auth/doctors/${user.id}`).catch(() => ({ data: {} })),
            api.get(`/api/auth/doctors/${user.id}/account`).catch(() => ({ data: {} })),
            api.get(`/api/hospitals/all`).catch(() => ({ data: [] })),
          ]);

          if (isMounted) {
            const pData = profileRes.data || {};
            const aData = accountRes.data || {};

            const mappedPersonal = {
              title: pData.title || "",
              firstName: pData.firstName || "",
              lastName: pData.lastName || "",
              email: pData.email || user?.email || "",
              phone: pData.phone || "",
              specialization: pData.specialization || "",
              medicalLicenseNumber: pData.medicalLicenseNumber || "",
              profileImage: pData.profileImage || user?.profileImage || "",
            };

            const mappedAccount = {
              specialization: aData.specialization || pData.specialization || "",
              experience: aData.experience || "",
              qualifications: Array.isArray(aData.qualifications)
                ? aData.qualifications
                : [],
              hospitals: Array.isArray(aData.hospitals) ? aData.hospitals : [],
            };

            setDoctorPersonalData(mappedPersonal);
            setInitialDoctorPersonalData(mappedPersonal);
            setDoctorAccountData(mappedAccount);
            setInitialDoctorAccountData(mappedAccount);
            setAllHospitalsList(Array.isArray(hospitalsRes.data) ? hospitalsRes.data : []);
          }
        } else if (role === "HOSPITAL") {
          const res = await api.get("/api/hospitals/me");
          if (isMounted && res.data) {
            const data = res.data;
            const mapped = {
              name: data.name || "",
              email: data.email || user?.email || "",
              contactNumber: data.contactNumber || "",
              address: data.address || "",
              licenseNumber: data.licenseNumber || "",
              managerName: data.managerName || "",
              location: data.location || "",
              profileImage: data.profileImage || user?.profileImage || "",
            };
            setHospitalData(mapped);
            setInitialHospitalData(mapped);
          }
        }

        // Fetch Notification Preferences from Backend
        try {
          const notifRes = await api.get("/api/notifications/preferences");
          if (isMounted && notifRes.data) {
            const pref = {
              emailAppointments: notifRes.data.emailAppointments ?? true,
              emailVideoLinks: notifRes.data.emailVideoLinks ?? true,
              emailReports: notifRes.data.emailReports ?? true,
              smsUrgentAlerts: notifRes.data.smsUrgentAlerts ?? true,
              smsPaymentReceipts: notifRes.data.smsPaymentReceipts ?? false,
              inAppMessages: notifRes.data.inAppMessages ?? true,
              inAppSystemUpdates: notifRes.data.inAppSystemUpdates ?? true,
            };
            setNotifications(pref);
            setInitialNotifications(pref);
          }
        } catch (notifErr) {
          console.warn("Could not load notification preferences:", notifErr);
        }
      } catch (err) {
        console.error("Failed to load settings data:", err);
        if (isMounted) {
          setProfileMessage({
            type: "error",
            text: "Failed to load account settings. Please refresh the page.",
          });
        }
      } finally {
        if (isMounted) setDataLoading(false);
      }
    };

    if (user) {
      fetchAllUserData();
    } else {
      setDataLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user, role, token]);

 
  // IMAGE UPLOAD HANDLER (CLOUDINARY / BACKEND)
 
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileMessage({
        type: "error",
        text: "Please upload a valid image file (PNG, JPG, JPEG).",
      });
      return;
    }

    try {
      setUploadingImage(true);
      setProfileMessage({ type: "", text: "" });

      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = res.data?.url || res.data?.fileUrl || "";
      if (!imageUrl) {
        throw new Error("No image URL returned from upload.");
      }

      if (role === "PATIENT") {
        setPatientData((prev) => ({ ...prev, profileImage: imageUrl }));
      } else if (role === "DOCTOR") {
        setDoctorPersonalData((prev) => ({ ...prev, profileImage: imageUrl }));
      } else if (role === "HOSPITAL") {
        setHospitalData((prev) => ({ ...prev, profileImage: imageUrl }));
      }

      setProfileMessage({
        type: "success",
        text: "Photo uploaded successfully! Make sure to click 'Save Changes' to update your account.",
      });
    } catch (err) {
      console.error("Image upload error:", err);
      setProfileMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to upload image. Please try again.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  
  // SAVE PROFILE CHANGES (PATIENT / DOCTOR / HOSPITAL)

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: "", text: "" });

    try {
      if (role === "PATIENT") {
        if (!patientData.firstName?.trim() || !patientData.lastName?.trim()) {
          throw new Error("First name and last name are required.");
        }

        const res = await api.put(`/api/auth/patients/${user.id}`, patientData);
        setInitialPatientData({ ...patientData });

        const fullName = `${patientData.firstName} ${patientData.lastName}`.trim();
        updateUser({
          name: fullName || user?.name,
          profileImage: patientData.profileImage,
        });

        setProfileMessage({
          type: "success",
          text: "Patient profile updated successfully!",
        });
      } else if (role === "DOCTOR") {
        if (!doctorPersonalData.firstName?.trim() || !doctorPersonalData.lastName?.trim()) {
          throw new Error("First name and last name are required.");
        }

        // 1. Update personal doctor profile
        await api.put(`/api/auth/doctors/${user.id}`, {
          title: doctorPersonalData.title,
          firstName: doctorPersonalData.firstName,
          lastName: doctorPersonalData.lastName,
          phone: doctorPersonalData.phone,
          specialization: doctorAccountData.specialization || doctorPersonalData.specialization,
          medicalLicenseNumber: doctorPersonalData.medicalLicenseNumber,
          profileImage: doctorPersonalData.profileImage,
        });

        // 2. Update professional account details
        await api.put(`/api/auth/doctors/${user.id}/account`, {
          specialization: doctorAccountData.specialization || doctorPersonalData.specialization,
          experience: doctorAccountData.experience,
          qualifications: doctorAccountData.qualifications,
          hospitals: doctorAccountData.hospitals,
        });

        setInitialDoctorPersonalData({ ...doctorPersonalData });
        setInitialDoctorAccountData({ ...doctorAccountData });

        const fullName = `${doctorPersonalData.title ? doctorPersonalData.title + " " : ""}${doctorPersonalData.firstName} ${doctorPersonalData.lastName}`.trim();
        updateUser({
          name: fullName || user?.name,
          profileImage: doctorPersonalData.profileImage,
        });

        setProfileMessage({
          type: "success",
          text: "Doctor profile & professional details updated successfully!",
        });
      } else if (role === "HOSPITAL") {
        if (!hospitalData.name?.trim()) {
          throw new Error("Hospital name is required.");
        }
        if (!hospitalData.contactNumber?.trim()) {
          throw new Error("Contact number is required.");
        }

        const res = await api.put("/api/hospitals/me", {
          name: hospitalData.name,
          contactNumber: hospitalData.contactNumber,
          address: hospitalData.address,
          managerName: hospitalData.managerName,
          location: hospitalData.location,
          profileImage: hospitalData.profileImage,
        });

        setInitialHospitalData({ ...hospitalData });

        updateUser({
          name: hospitalData.name,
          profileImage: hospitalData.profileImage,
        });

        const storedHospital = JSON.parse(localStorage.getItem("hospital") || "null");
        if (storedHospital) {
          localStorage.setItem(
            "hospital",
            JSON.stringify({
              ...storedHospital,
              name: hospitalData.name,
              profileImage: hospitalData.profileImage,
            })
          );
        }

        setProfileMessage({
          type: "success",
          text: "Hospital profile updated successfully!",
        });
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setProfileMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Discard Profile Changes
  const handleResetProfile = () => {
    if (role === "PATIENT" && initialPatientData) {
      setPatientData({ ...initialPatientData });
    } else if (role === "DOCTOR") {
      if (initialDoctorPersonalData) setDoctorPersonalData({ ...initialDoctorPersonalData });
      if (initialDoctorAccountData) setDoctorAccountData({ ...initialDoctorAccountData });
    } else if (role === "HOSPITAL" && initialHospitalData) {
      setHospitalData({ ...initialHospitalData });
    }
    setProfileMessage({ type: "", text: "" });
  };

 
  // CHANGE PASSWORD HANDLER
 
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (!passwordForm.currentPassword) {
      setPasswordMessage({
        type: "error",
        text: "Please enter your current password.",
      });
      return;
    }

    if (!passwordForm.newPassword) {
      setPasswordMessage({
        type: "error",
        text: "Please enter a new password.",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 6 characters long.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password and confirmation do not match.",
      });
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await api.post("/api/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordMessage({
        type: "success",
        text: res.data?.message || "Password updated successfully!",
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Password change error:", err);
      setPasswordMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to change password. Please verify your current password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

 
  // NOTIFICATION PREFERENCES SAVE HANDLER
 
  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setNotificationsSaving(true);
    setNotificationMessage({ type: "", text: "" });

    try {
      const res = await api.put("/api/notifications/preferences", notifications);
      if (res.data) {
        setNotifications(res.data);
        setInitialNotifications(res.data);
      }
      setNotificationMessage({
        type: "success",
        text: "Notification preferences saved successfully to your account!",
      });
    } catch (err) {
      console.error("Save notifications error:", err);
      setNotificationMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to save notification preferences. Please try again.",
      });
    } finally {
      setNotificationsSaving(false);
    }
  };

  // Doctor Qualification Helpers
  const handleAddQualification = () => {
    if (!newQualificationInput.trim()) return;
    setDoctorAccountData((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, newQualificationInput.trim()],
    }));
    setNewQualificationInput("");
  };

  const handleRemoveQualification = (indexToRemove) => {
    setDoctorAccountData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleToggleHospitalAffiliation = (hospitalId) => {
    setDoctorAccountData((prev) => {
      const current = prev.hospitals || [];
      if (current.includes(hospitalId)) {
        return { ...prev, hospitals: current.filter((id) => id !== hospitalId) };
      } else {
        return { ...prev, hospitals: [...current, hospitalId] };
      }
    });
  };

  // Tabs Definition
  const tabs = [
    {
      id: "profile",
      label:
        role === "HOSPITAL"
          ? "Hospital Information"
          : role === "DOCTOR"
          ? "Personal & Professional"
          : "Personal Profile",
      icon: role === "HOSPITAL" ? Building : role === "DOCTOR" ? Stethoscope : User,
    },
    { id: "account", label: "Account Overview", icon: Shield },
    { id: "password", label: "Change Password", icon: Lock },
    { id: "notifications", label: "Notification Preferences", icon: Bell },
  ];

  const currentAvatar =
    role === "PATIENT"
      ? patientData.profileImage
      : role === "DOCTOR"
      ? doctorPersonalData.profileImage
      : hospitalData.profileImage;

  const currentDisplayName =
    role === "PATIENT"
      ? `${patientData.firstName} ${patientData.lastName}`.trim() || user?.name || "Patient"
      : role === "DOCTOR"
      ? `${doctorPersonalData.title ? doctorPersonalData.title + " " : ""}${doctorPersonalData.firstName} ${doctorPersonalData.lastName}`.trim() || user?.name || "Doctor"
      : hospitalData.name || user?.name || "Hospital";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0a1647] tracking-tight">
              Settings & Account
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-[#0a1647] border border-blue-200">
              {role}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {role === "PATIENT" && "Manage your personal profile, account credentials, and health communication alerts."}
            {role === "DOCTOR" && "Manage your medical credentials, clinic affiliations, account security, and alert settings."}
            {role === "HOSPITAL" && "Configure hospital registry information, manager contacts, security, and alert preferences."}
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-300 shrink-0 bg-slate-200">
              <img
                src={
                  currentAvatar ||
                  user.profileImage ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800 leading-tight">
                {currentDisplayName}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {user.email}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Navigation Tabs */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setProfileMessage({ type: "", text: "" });
                    setPasswordMessage({ type: "", text: "" });
                    setNotificationMessage({ type: "", text: "" });
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    isActive
                      ? "bg-[#0a1647] text-white shadow-sm font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-blue-300" : "text-slate-400"}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Account Security Badge */}
          <div className="bg-gradient-to-br from-[#0a1647] to-[#1e2d5e] text-white rounded-2xl p-5 shadow-sm hidden lg:block">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-blue-200 font-semibold mb-2">
              <Shield size={14} />
              <span>Security & Status</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Authenticated securely with JWT encryption. Changes persist directly to the database.
            </p>
            <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Account Role:</span>
                <span className="font-bold text-white">{role}</span>
              </div>
              <div className="flex justify-between">
                <span>Verification:</span>
                <span className="font-semibold text-emerald-400">Verified</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content Panels */}
        <main className="lg:col-span-3">
         
          {/* TAB 1: PROFILE / PERSONAL / PROFESSIONAL SETTINGS */}
          
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {role === "HOSPITAL"
                    ? "Hospital Registry Information"
                    : role === "DOCTOR"
                    ? "Doctor Profile & Professional Credentials"
                    : "Patient Personal Information"}
                </h2>
                <p className="text-sm text-slate-500">
                  {role === "HOSPITAL"
                    ? "Manage your hospital name, location, license, and manager contact details."
                    : role === "DOCTOR"
                    ? "Update your medical specialization, experience, qualifications, and hospital affiliations."
                    : "Update your personal details, contact number, and residential address."}
                </p>
              </div>

              {profileMessage.text && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-xl text-sm ${
                    profileMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              {dataLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 size={32} className="animate-spin text-[#0a1647]" />
                  <p className="text-sm font-medium">Loading profile data...</p>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Upload Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200 shrink-0">
                      <img
                        src={
                          currentAvatar ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                        <Camera size={20} />
                        <span className="text-[10px] font-semibold mt-1">Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <h3 className="font-semibold text-slate-800 text-base">
                        {role === "HOSPITAL" ? "Hospital Logo / Photo" : "Profile Photo"}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Accepts JPG, PNG or JPEG. Uploads directly to Cloudinary storage.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                        <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition shadow-sm">
                          <Camera size={14} />
                          <span>{uploadingImage ? "Uploading..." : "Upload New Image"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ------------------------------------------------------------- */}
                  {/* PATIENT FORM FIELDS */}
                  {/* ------------------------------------------------------------- */}
                  {role === "PATIENT" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Title
                        </label>
                        <select
                          value={patientData.title}
                          onChange={(e) =>
                            setPatientData({ ...patientData, title: e.target.value })
                          }
                          className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] bg-white transition"
                        >
                          <option value="">Select Title</option>
                          <option value="Mr.">Mr.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Prof.">Prof.</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Email Address <span className="text-slate-400 font-normal">(Read Only)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={patientData.email}
                            disabled
                            className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-500 bg-slate-100 cursor-not-allowed pl-10"
                          />
                          <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={patientData.firstName}
                          onChange={(e) =>
                            setPatientData({ ...patientData, firstName: e.target.value })
                          }
                          placeholder="First Name"
                          className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={patientData.lastName}
                          onChange={(e) =>
                            setPatientData({ ...patientData, lastName: e.target.value })
                          }
                          placeholder="Last Name"
                          className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Contact Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={patientData.contactNumber}
                            onChange={(e) =>
                              setPatientData({ ...patientData, contactNumber: e.target.value })
                            }
                            placeholder="e.g. +94 77 123 4567"
                            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] pl-10 transition"
                          />
                          <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          NIC or Passport Number
                        </label>
                        <input
                          type="text"
                          value={patientData.nicOrPassport}
                          onChange={(e) =>
                            setPatientData({ ...patientData, nicOrPassport: e.target.value })
                          }
                          placeholder="e.g. 200012345678"
                          className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={patientData.dateOfBirth}
                            onChange={(e) =>
                              setPatientData({ ...patientData, dateOfBirth: e.target.value })
                            }
                            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] pl-10 transition"
                          />
                          <Calendar size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Residential Address
                        </label>
                        <textarea
                          rows={3}
                          value={patientData.residentialAddress}
                          onChange={(e) =>
                            setPatientData({ ...patientData, residentialAddress: e.target.value })
                          }
                          placeholder="Enter residential address..."
                          className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition resize-none"
                        />
                      </div>
                    </div>
                  )}

                 
                  {/* DOCTOR FORM FIELDS */}
                  
                  {role === "DOCTOR" && (
                    <div className="space-y-6">
                      {/* Personal Sub-section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Title
                          </label>
                          <select
                            value={doctorPersonalData.title}
                            onChange={(e) =>
                              setDoctorPersonalData({ ...doctorPersonalData, title: e.target.value })
                            }
                            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] bg-white transition"
                          >
                            <option value="Dr.">Dr.</option>
                            <option value="Prof.">Prof.</option>
                            <option value="Mr.">Mr.</option>
                            <option value="Ms.">Ms.</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Email Address <span className="text-slate-400 font-normal">(Read Only)</span>
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={doctorPersonalData.email}
                              disabled
                              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-500 bg-slate-100 cursor-not-allowed pl-10"
                            />
                            <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={doctorPersonalData.firstName}
                            onChange={(e) =>
                              setDoctorPersonalData({ ...doctorPersonalData, firstName: e.target.value })
                            }
                            placeholder="First Name"
                            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={doctorPersonalData.lastName}
                            onChange={(e) =>
                              setDoctorPersonalData({ ...doctorPersonalData, lastName: e.target.value })
                            }
                            placeholder="Last Name"
                            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Phone Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={doctorPersonalData.phone}
                              onChange={(e) =>
                                setDoctorPersonalData({ ...doctorPersonalData, phone: e.target.value })
                              }
                              placeholder="e.g. +94 77 123 4567"
                              className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] pl-10 transition"
                            />
                            <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Medical License Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={doctorPersonalData.medicalLicenseNumber}
                              onChange={(e) =>
                                setDoctorPersonalData({
                                  ...doctorPersonalData,
                                  medicalLicenseNumber: e.target.value,
                                })
                              }
                              placeholder="e.g. SLMC-12345"
                              className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] pl-10 transition"
                            />
                            <FileBadge size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      {/* Professional Sub-section */}
                      <div className="pt-4 border-t border-slate-200 space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Stethoscope size={16} className="text-[#0a1647]" />
                          <span>Professional Details & Qualifications</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              Medical Specialization
                            </label>
                            <input
                              type="text"
                              value={doctorAccountData.specialization || doctorPersonalData.specialization}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDoctorAccountData((p) => ({ ...p, specialization: val }));
                                setDoctorPersonalData((p) => ({ ...p, specialization: val }));
                              }}
                              placeholder="e.g. Cardiologist, Neurologist, General Physician"
                              className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              Clinical Experience
                            </label>
                            <input
                              type="text"
                              value={doctorAccountData.experience}
                              onChange={(e) =>
                                setDoctorAccountData({ ...doctorAccountData, experience: e.target.value })
                              }
                              placeholder="e.g. 10+ years in Cardiology & Internal Medicine"
                              className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition"
                            />
                          </div>
                        </div>

                        {/* Qualifications List Manager */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Academic & Medical Qualifications
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newQualificationInput}
                              onChange={(e) => setNewQualificationInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddQualification();
                                }
                              }}
                              placeholder="Add qualification (e.g. MBBS, MD - Cardiology, FRCS)..."
                              className="flex-1 border border-slate-300 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647]"
                            />
                            <button
                              type="button"
                              onClick={handleAddQualification}
                              className="px-4 py-2 bg-[#0a1647] hover:bg-[#132263] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                            >
                              <Plus size={14} />
                              <span>Add</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {doctorAccountData.qualifications?.length > 0 ? (
                              doctorAccountData.qualifications.map((qual, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-medium"
                                >
                                  <Award size={12} className="text-blue-700" />
                                  <span>{qual}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveQualification(idx)}
                                    className="ml-1 text-blue-400 hover:text-red-600 transition"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))
                            ) : (
                              <p className="text-xs text-slate-400 italic">No qualifications added yet.</p>
                            )}
                          </div>
                        </div>

                        {/* Hospital Affiliations Selection */}
                        <div className="space-y-2 pt-3">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Affiliated Hospitals & Medical Centers
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                            {allHospitalsList.length > 0 ? (
                              allHospitalsList.map((hosp) => {
                                const isSelected = doctorAccountData.hospitals?.includes(hosp.id);
                                return (
                                  <label
                                    key={hosp.id}
                                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                                      isSelected
                                        ? "bg-blue-50 border-[#0a1647] text-[#0a1647] font-semibold"
                                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleToggleHospitalAffiliation(hosp.id)}
                                      className="accent-[#0a1647] rounded cursor-pointer"
                                    />
                                    <Building2 size={14} className="shrink-0 text-slate-400" />
                                    <span className="truncate">{hosp.name}</span>
                                  </label>
                                );
                              })
                            ) : (
                              <p className="text-xs text-slate-400 col-span-full italic">
                                No registered hospitals found in directory.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                 
                  {/* HOSPITAL FORM FIELDS */}
                 
                  {role === "HOSPITAL" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Hospital Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={hospitalData.name}
                            onChange={(e) =>
                              setHospitalData({ ...hospitalData, name: e.target.value })
                            }
                            placeholder="Enter Hospital Name"
                            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] pl-10 transition"
                          />
                          <Building size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Registered Email <span className="text-slate-400 font-normal">(Read Only)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={hospitalData.email}
                            disabled
                            className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-500 bg-slate-100 cursor-not-allowed pl-10"
                          />
                          <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Contact Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={hospitalData.contactNumber}
                            onChange={(e) =>
                              setHospitalData({ ...hospitalData, contactNumber: e.target.value })
                            }
                            placeholder="e.g. +94 11 234 5678"
                            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] pl-10 transition"
                          />
                          <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Operating License Number <span className="text-slate-400 font-normal">(Read Only)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={hospitalData.licenseNumber}
                            disabled
                            className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-500 bg-slate-100 cursor-not-allowed pl-10"
                          />
                          <FileBadge size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Manager / Director Name
                        </label>
                        <input
                          type="text"
                          value={hospitalData.managerName}
                          onChange={(e) =>
                            setHospitalData({ ...hospitalData, managerName: e.target.value })
                          }
                          placeholder="e.g. Dr. John Doe"
                          className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          City / Location
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={hospitalData.location}
                            onChange={(e) =>
                              setHospitalData({ ...hospitalData, location: e.target.value })
                            }
                            placeholder="e.g. Colombo, Kandy, Galle"
                            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] pl-10 transition"
                          />
                          <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Full Hospital Address
                        </label>
                        <textarea
                          rows={3}
                          value={hospitalData.address}
                          onChange={(e) =>
                            setHospitalData({ ...hospitalData, address: e.target.value })
                          }
                          placeholder="Enter complete physical address of hospital premises..."
                          className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleResetProfile}
                      disabled={savingProfile}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={16} />
                      <span>Discard Changes</span>
                    </button>

                    <button
                      type="submit"
                      disabled={savingProfile || uploadingImage}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0a1647] hover:bg-[#132263] disabled:bg-slate-400 text-white text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          
          {/* TAB 2: ACCOUNT OVERVIEW */}
         
          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Account Overview & Credentials
                  </h2>
                  <p className="text-sm text-slate-500">
                    View authentication details, identity tokens, and verification status.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Account ID
                    </span>
                    <p className="text-sm font-bold text-slate-800 font-mono mt-1 truncate">
                      {user?.id || "N/A"}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Registered Email
                    </span>
                    <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                      {doctorPersonalData.email ||
                        patientData.email ||
                        hospitalData.email ||
                        user?.email ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Account Role
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm font-bold text-[#0a1647]">
                        {role}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Email Verification
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          user?.verified !== false
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <span
                        className={`text-sm font-bold ${
                          user?.verified !== false
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        {user?.verified !== false
                          ? "Verified & Active"
                          : "Pending Verification"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Session Security
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      Bearer JWT authorization token active. Secure API calls are verified via Spring Security filters.
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Session Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Active Login Session
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Log out from this device to terminate your current JWT authentication token.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="shrink-0 px-5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Shield size={14} />
                  <span>Log Out of Session</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CHANGE PASSWORD */}
          {/* ========================================================================= */}
          {activeTab === "password" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Change Password
                </h2>
                <p className="text-sm text-slate-500">
                  Update your password to keep your account secure. Changes are encrypted using BCrypt in MongoDB.
                </p>
              </div>

              {passwordMessage.text && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-xl text-sm ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      placeholder="Enter your current password"
                      className="w-full border border-slate-300 rounded-xl p-3 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      placeholder="Enter new password (min. 6 characters)"
                      className="w-full border border-slate-300 rounded-xl p-3 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Password must be at least 6 characters long.
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm your new password"
                      className="w-full border border-slate-300 rounded-xl p-3 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a1647] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#0a1647] hover:bg-[#132263] disabled:bg-slate-400 text-white text-sm font-semibold transition shadow-sm flex items-center gap-2"
                  >
                    {passwordSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

         
          {/* TAB 4: NOTIFICATION PREFERENCES */}
          
          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Notification & Communication Preferences
                </h2>
                <p className="text-sm text-slate-500">
                  Configure alerts and communication channels. Preferences are saved in your account profile.
                </p>
              </div>

              {notificationMessage.text && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-xl text-sm ${
                    notificationMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {notificationMessage.type === "success" ? (
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                  )}
                  <span>{notificationMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveNotifications} className="space-y-6">
                {/* Email Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={14} className="text-[#0a1647]" />
                    <span>Email Communications</span>
                  </h3>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    <label className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer">
                      <div className="pr-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {role === "HOSPITAL"
                            ? "Doctor Scheduling & Booking Notifications"
                            : role === "DOCTOR"
                            ? "Patient Appointment Bookings & Schedule Changes"
                            : "Appointment Confirmations & Reminders"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Receive email updates when consultations are booked, updated, or rescheduled.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailAppointments}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            emailAppointments: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-[#0a1647] rounded cursor-pointer shrink-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer">
                      <div className="pr-4">
                        <p className="text-sm font-semibold text-slate-800">
                          Video Consultation Links & Room Alerts
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Receive direct links and meeting notifications for video appointments.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailVideoLinks}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            emailVideoLinks: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-[#0a1647] rounded cursor-pointer shrink-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer">
                      <div className="pr-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {role === "HOSPITAL"
                            ? "Laboratory Reports & Test Category Updates"
                            : role === "DOCTOR"
                            ? "Diagnostic Lab Reports & Patient History Alerts"
                            : "Laboratory Reports & Diagnostic Test Results"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Receive notifications when lab reports or medical records are uploaded.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailReports}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            emailReports: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-[#0a1647] rounded cursor-pointer shrink-0"
                      />
                    </label>
                  </div>
                </div>

                {/* SMS Alerts Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Phone size={14} className="text-[#0a1647]" />
                    <span>SMS Alerts</span>
                  </h3>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    <label className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer">
                      <div className="pr-4">
                        <p className="text-sm font-semibold text-slate-800">
                          Urgent Schedule & Emergency Alerts
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Send instant SMS notifications for sudden schedule delays or emergency alerts.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.smsUrgentAlerts}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            smsUrgentAlerts: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-[#0a1647] rounded cursor-pointer shrink-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer">
                      <div className="pr-4">
                        <p className="text-sm font-semibold text-slate-800">
                          Payment Confirmations & Invoices
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Send SMS confirmation receipts for completed online payments.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.smsPaymentReceipts}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            smsPaymentReceipts: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-[#0a1647] rounded cursor-pointer shrink-0"
                      />
                    </label>
                  </div>
                </div>

                {/* In-App Alerts */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Bell size={14} className="text-[#0a1647]" />
                    <span>In-App Notifications</span>
                  </h3>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    <label className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer">
                      <div className="pr-4">
                        <p className="text-sm font-semibold text-slate-800">
                          Real-time Chat & Messages
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Show in-app notification badges when new messages are received.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.inAppMessages}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            inAppMessages: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-[#0a1647] rounded cursor-pointer shrink-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer">
                      <div className="pr-4">
                        <p className="text-sm font-semibold text-slate-800">
                          System Announcements & Updates
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Receive notifications about platform features and scheduled maintenance.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.inAppSystemUpdates}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            inAppSystemUpdates: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-[#0a1647] rounded cursor-pointer shrink-0"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={notificationsSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#0a1647] hover:bg-[#132263] disabled:bg-slate-400 text-white text-sm font-semibold transition shadow-sm flex items-center gap-2"
                  >
                    {notificationsSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving Preferences...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Preferences</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
