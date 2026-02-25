import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  

  // Define API endpoint based on role
  const baseUrl = user?.role === 'PATIENT' 
    ? `http://localhost:8082/api/auth/patient/${user?.id}`
    : `http://localhost:8082/api/auth/doctors/${user?.id}`;

  // 1. Fetch User Data on Load
  useEffect(() => {
    if (user?.id) {
      fetch(baseUrl)
        .then(res => res.json())
        .then(data => {
            setFormData(data);
            setLoading(false);
        })
        .catch(err => console.error(err));
    }
  }, [user, baseUrl]);

  // 2. Handle Image Upload to Backend -> Cloudinary
 const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);

  const data = new FormData();
  data.append("file", file);

  const token = localStorage.getItem("token"); // 🔥 get JWT

  try {
    const res = await fetch('http://localhost:8082/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`  // 🔥 VERY IMPORTANT
      },
      body: data,
    });

    const result = await res.json();

    setFormData(prev => ({
      ...prev,
      profileImage: result.url
    }));

  } catch (err) {
    alert("Image upload failed");
  } finally {
    setUploading(false);
  }
};

  // 3. Save Changes (Send updated data + new image URL to DB)
  // 3. Save Changes (Send updated data + new image URL to DB)
 const handleSave = async () => {
  try {
    const res = await fetch(baseUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem("token")}`
  },
  body: JSON.stringify(formData)
});
    
    if (res.ok) {
      setIsEditing(false);
      alert("Profile Updated Successfully!");
      
      // Update global context for Sidebar/Navbar
      updateUser({
        name: `${formData.firstName} ${formData.lastName}`,
        profileImage: formData.profileImage
      });
    }
  } catch (err) {
    alert("Failed to update profile");
  }
};

  

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-white shadow rounded-lg p-6">
        
        {/* --- Profile Image Section --- */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 mb-4 group">
            {/* Display Image (or Default) */}
            <img 
              src={formData.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover border-4 border-gray-200"
            />
            
            {/* Overlay: Only visible when Editing */}
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-bold">Change</span>
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            )}
          </div>
          
          {uploading && <p className="text-blue-500 text-sm">Uploading image...</p>}
          <h1 className="text-2xl font-bold">{formData.firstName} {formData.lastName}</h1>
        </div>

        {/* --- Form Fields --- */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Common Fields */}
  <div>
    <label className="block text-sm font-medium text-gray-700">Title</label>
    <input 
      type="text" 
      disabled={!isEditing}
      value={formData.title || ''}
      onChange={(e) => setFormData({...formData, title: e.target.value})}
      className="mt-1 block w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700">Email (Read Only)</label>
    <input 
      type="email" 
      disabled
      value={formData.email || ''}
      className="mt-1 block w-full border border-gray-300 rounded p-2 bg-gray-100"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700">First Name</label>
    <input 
      type="text" 
      disabled={!isEditing}
      value={formData.firstName || ''}
      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
      className="mt-1 block w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700">Last Name</label>
    <input 
      type="text" 
      disabled={!isEditing}
      value={formData.lastName || ''}
      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
      className="mt-1 block w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"
    />
  </div>

  {/* Patient Specific Fields */}
  {user?.role === 'PATIENT' && (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">NIC or Passport</label>
        <input 
          type="text" 
          disabled={!isEditing}
          value={formData.nicOrPassport || ''}
          onChange={(e) => setFormData({...formData, nicOrPassport: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
        <input 
          type="date" 
          disabled={!isEditing}
          value={formData.dateOfBirth || ''}
          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
        <input 
          type="text" 
          disabled={!isEditing}
          value={formData.contactNumber || ''}
          onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Residential Address</label>
        <textarea 
          disabled={!isEditing}
          value={formData.residentialAddress || ''}
          onChange={(e) => setFormData({...formData, residentialAddress: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"
        />
      </div>
    </>
  )}

  {/* Doctor Specific Fields */}
  {user?.role === 'DOCTOR' && (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input 
          type="text" 
          disabled={!isEditing}
          value={formData.phone || ''}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Specialization</label>
        <input 
          type="text" 
          disabled={!isEditing}
          value={formData.specialization || ''}
          onChange={(e) => setFormData({...formData, specialization: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Medical License Number</label>
        <input 
          type="text" 
          disabled={!isEditing}
          value={formData.medicalLicenseNumber || ''}
          onChange={(e) => setFormData({...formData, medicalLicenseNumber: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"
        />
      </div>
    </>
  )}
</div>

        {/* --- Action Buttons --- */}
        <div className="mt-8 flex justify-end gap-4">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={uploading}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
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