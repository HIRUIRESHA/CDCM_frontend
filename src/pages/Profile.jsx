import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  User,
  Stethoscope,
  Camera,
  AlertTriangle
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isHospital = user?.role === 'HOSPITAL';
  const isDoctor = user?.role === 'DOCTOR';
  const isPatient = user?.role === 'PATIENT';

  // Role-based profile endpoints
  const getProfileUrl = useCallback(() => {
    if (user?.role === 'PATIENT') {
      return `https://cdcm-backend.onrender.com/api/auth/patients/${user?.id}`;
    }
    if (user?.role === 'DOCTOR') {
      return `https://cdcm-backend.onrender.com/api/auth/doctors/${user?.id}`;
    }
    if (user?.role === 'HOSPITAL') {
      return 'https://cdcm-backend.onrender.com/api/hospitals/me';
    }
    return null;
  }, [user]);

  const baseUrl = getProfileUrl();

  // 1. Fetch User Data on Load
  const fetchProfile = useCallback(async () => {
    if (!baseUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      const res = await fetch(baseUrl, { headers });
      if (!res.ok) {
        throw new Error(`Profile request failed with status: ${res.status}`);
      }
      const data = await res.json();
      setFormData(data || {});
      setInitialData(data || {});
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Unable to load profile. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 2. Handle Image Upload to Backend -> Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const data = new FormData();
    data.append('file', file);

    const token = localStorage.getItem('token');

    try {
      const res = await fetch('https://cdcm-backend.onrender.com/api/upload', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: data
      });

      if (!res.ok) {
        throw new Error('Image upload failed');
      }

      const result = await res.json();

      setFormData((prev) => ({
        ...prev,
        profileImage: result.url
      }));
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // 3. Save Changes
  const handleSave = async () => {
    if (!baseUrl) return;

    const token = localStorage.getItem('token');

    // Build payload according to role
    let payload = formData;
    if (isHospital) {
      payload = {
        name: formData.name,
        contactNumber: formData.contactNumber,
        address: formData.address,
        managerName: formData.managerName,
        location: formData.location,
        profileImage: formData.profileImage
      };
    }

    try {
      const res = await fetch(baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Update failed with status: ${res.status}`);
      }

      const updated = await res.json();
      const finalData = { ...formData, ...updated };
      setFormData(finalData);
      setInitialData(finalData);
      setIsEditing(false);
      alert('Profile Updated Successfully!');

      // Update global context for Sidebar/Navbar
      if (isHospital) {
        updateUser({
          name: finalData.name || formData.name,
          profileImage: finalData.profileImage || formData.profileImage
        });

        // Sync local storage hospital record if present
        const storedHospital = JSON.parse(localStorage.getItem('hospital') || 'null');
        if (storedHospital) {
          localStorage.setItem(
            'hospital',
            JSON.stringify({
              ...storedHospital,
              name: finalData.name || formData.name,
              profileImage: finalData.profileImage || formData.profileImage
            })
          );
        }
      } else {
        updateUser({
          name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
          profileImage: formData.profileImage
        });
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-900 border-t-transparent mb-3"></div>
        <span className="text-gray-500 text-sm font-medium">Loading profile...</span>
      </div>
    );
  }

  if (error && Object.keys(formData).length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white shadow rounded-2xl p-8 border border-gray-100 text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Unable to Load Profile</h2>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button
            onClick={fetchProfile}
            className="bg-blue-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      <div className="bg-white shadow rounded-2xl p-6 md:p-8 border border-gray-100">
        
        {/* --- Profile Image & Identity Section --- */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 mb-4 group">
            <img 
              src={formData.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-sm"
            />
            
            {/* Overlay: Only visible when Editing */}
            {isEditing && (
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white mb-1" />
                <span className="text-white text-xs font-bold">Change</span>
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            )}
          </div>
          
          {uploading && <p className="text-blue-600 text-xs font-semibold mb-2 animate-pulse">Uploading image...</p>}

          {/* Role-Specific Identity Header */}
          {isHospital && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-blue-950">{formData.name || 'Hospital Facility'}</h1>
              <div className="mt-1.5 flex items-center justify-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-black tracking-wider uppercase rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  HOSPITAL
                </span>
                <span className="text-xs text-gray-500 font-medium">Healthcare Facility Profile</span>
              </div>
            </div>
          )}

          {isPatient && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-blue-950">
                {`${formData.title ? `${formData.title} ` : ''}${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Patient Name'}
              </h1>
              <div className="mt-1.5 flex items-center justify-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-black tracking-wider uppercase rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  PATIENT
                </span>
                <span className="text-xs text-gray-500 font-medium">Patient Profile</span>
              </div>
            </div>
          )}

          {isDoctor && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-blue-950">
                {`${formData.title ? `${formData.title} ` : ''}${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Doctor Name'}
              </h1>
              <div className="mt-1.5 flex items-center justify-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-black tracking-wider uppercase rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  DOCTOR
                </span>
                <span className="text-xs text-gray-500 font-medium">Medical Professional</span>
              </div>
            </div>
          )}
        </div>

        {/* --- Form Fields Sections --- */}

        {/* 1. HOSPITAL SPECIFIC PROFILE FIELDS */}
        {isHospital && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-900" />
                Hospital Information
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage registered hospital details and facility identity
              </p>
            </div>

            {!isEditing ? (
              /* Non-Editing View: Clean Information Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Hospital Name
                  </span>
                  <p className="text-sm font-bold text-slate-800">{formData.name || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </span>
                  <p className="text-sm font-semibold text-slate-700">{formData.email || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Contact Number
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{formData.contactNumber || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Facility License Number
                  </span>
                  <p className="text-sm font-mono font-semibold text-blue-900">{formData.licenseNumber || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Manager / Medical Director
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{formData.managerName || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Location / City
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{formData.location || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 md:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Physical Address
                  </span>
                  <p className="text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
                    {formData.address || '—'}
                  </p>
                </div>
              </div>
            ) : (
              /* Editing View: Editable Form Inputs */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Hospital Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter hospital name"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Email Address (Read Only)
                  </label>
                  <input 
                    type="email" 
                    disabled
                    value={formData.email || ''}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Contact Number
                  </label>
                  <input 
                    type="text" 
                    value={formData.contactNumber || ''}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    placeholder="e.g. +94 41 222 3344"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Facility License Number (Read Only)
                  </label>
                  <input 
                    type="text" 
                    disabled
                    value={formData.licenseNumber || ''}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-100 text-gray-500 font-mono cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Manager / Medical Director
                  </label>
                  <input 
                    type="text" 
                    value={formData.managerName || ''}
                    onChange={(e) => setFormData({...formData, managerName: e.target.value})}
                    placeholder="e.g. Dr. John Silva"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Location / City
                  </label>
                  <input 
                    type="text" 
                    value={formData.location || ''}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. Matara, Southern Province"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Physical Address
                  </label>
                  <textarea 
                    rows="2"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="e.g. No. 123, Hospital Road, Matara"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. PATIENT SPECIFIC PROFILE FIELDS */}
        {isPatient && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-900" />
                Personal Information
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your personal details, contact information, and residence
              </p>
            </div>

            {!isEditing ? (
              /* Non-Editing View: Clean Information Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Full Name
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {`${formData.title ? `${formData.title} ` : ''}${formData.firstName || ''} ${formData.lastName || ''}`.trim() || '—'}
                  </p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </span>
                  <p className="text-sm font-semibold text-slate-700">{formData.email || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    NIC / Passport
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{formData.nicOrPassport || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Date of Birth
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{formData.dateOfBirth || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Contact Number
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{formData.contactNumber || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Title
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{formData.title || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 md:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Residential Address
                  </span>
                  <p className="text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
                    {formData.residentialAddress || '—'}
                  </p>
                </div>
              </div>
            ) : (
              /* Editing View: Editable Form Inputs */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Title
                  </label>
                  <input 
                    type="text" 
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Mr., Mrs., Ms."
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Email Address (Read Only)
                  </label>
                  <input 
                    type="email" 
                    disabled
                    value={formData.email || ''}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Enter first name"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Enter last name"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    NIC or Passport
                  </label>
                  <input 
                    type="text" 
                    value={formData.nicOrPassport || ''}
                    onChange={(e) => setFormData({...formData, nicOrPassport: e.target.value})}
                    placeholder="e.g. 200012345678"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Date of Birth
                  </label>
                  <input 
                    type="date" 
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition cursor-pointer"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Contact Number
                  </label>
                  <input 
                    type="text" 
                    value={formData.contactNumber || ''}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    placeholder="e.g. +94 77 123 4567"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Residential Address
                  </label>
                  <textarea 
                    rows="2"
                    value={formData.residentialAddress || ''}
                    onChange={(e) => setFormData({...formData, residentialAddress: e.target.value})}
                    placeholder="e.g. No. 45, Temple Road, Colombo"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. DOCTOR SPECIFIC PROFILE FIELDS */}
        {isDoctor && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-900" />
                Professional Information
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your medical credentials, specialization, and contact details
              </p>
            </div>

            {!isEditing ? (
              /* Non-Editing View: Clean Information Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Full Name
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {`${formData.title ? `${formData.title} ` : ''}${formData.firstName || ''} ${formData.lastName || ''}`.trim() || '—'}
                  </p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </span>
                  <p className="text-sm font-semibold text-slate-700">{formData.email || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Phone Number
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{formData.phone || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Specialization
                  </span>
                  <p className="text-sm font-semibold text-blue-900">{formData.specialization || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Medical License Number
                  </span>
                  <p className="text-sm font-mono font-semibold text-blue-900">{formData.medicalLicenseNumber || '—'}</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Title
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{formData.title || '—'}</p>
                </div>
              </div>
            ) : (
              /* Editing View: Editable Form Inputs */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Title
                  </label>
                  <input 
                    type="text" 
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Dr., Prof."
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Email Address (Read Only)
                  </label>
                  <input 
                    type="email" 
                    disabled
                    value={formData.email || ''}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Enter first name"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Enter last name"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input 
                    type="text" 
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g. +94 71 234 5678"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Specialization
                  </label>
                  <input 
                    type="text" 
                    value={formData.specialization || ''}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    placeholder="e.g. Cardiologist, Neurologist"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Medical License Number
                  </label>
                  <input 
                    type="text" 
                    value={formData.medicalLicenseNumber || ''}
                    onChange={(e) => setFormData({...formData, medicalLicenseNumber: e.target.value})}
                    placeholder="e.g. SLMC-12345"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Action Buttons --- */}
        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
          {!isEditing ? (
            <button 
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-blue-900 text-white px-6 py-2.5 rounded-xl hover:bg-blue-800 transition font-bold text-sm shadow-sm cursor-pointer"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button 
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-bold text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={uploading}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition font-bold text-sm shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Save Changes
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;