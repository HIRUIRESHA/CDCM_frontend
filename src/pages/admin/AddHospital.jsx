import React, { useState } from 'react';
import { Building2, Mail, Lock, Phone, MapPin, FileBadge, User } from 'lucide-react';

const AddHospital = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
    licenseNumber: '',
    managerName: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Registering hospital...' });

    try {
      // Replace with your actual Backend URL
      const response = await fetch('http://localhost:8082/api/admin/register-hospital', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}` // Add this if you implemented JWT on frontend
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Hospital registered successfully!' });
        setFormData({ name: '', email: '', password: '', contactNumber: '', address: '', licenseNumber: '', managerName: '' });
      } else {
        const errorText = await response.text();
        setStatus({ type: 'error', message: errorText || 'Registration failed.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Hospital</h1>
        <p className="text-gray-500 text-sm">Register a new medical facility to the system.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        {status.message && (
          <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
            status.type === 'success' ? 'bg-green-50 text-green-700' : 
            status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Account Info */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Account Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField icon={<Mail size={18} />} label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
              <InputField icon={<Lock size={18} />} label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="border-t border-gray-100 my-6"></div>

          {/* Section 2: Hospital Info */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Facility Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField icon={<Building2 size={18} />} label="Hospital Name" name="name" type="text" value={formData.name} onChange={handleChange} required />
              <InputField icon={<Phone size={18} />} label="Contact Number" name="contactNumber" type="tel" value={formData.contactNumber} onChange={handleChange} required />
              <div className="md:col-span-2">
                <InputField icon={<MapPin size={18} />} label="Address" name="address" type="text" value={formData.address} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-6"></div>

          {/* Section 3: Legal & Management */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Legal & Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <InputField icon={<FileBadge size={18} />} label="License Number" name="licenseNumber" type="text" value={formData.licenseNumber} onChange={handleChange} required />
               <InputField icon={<User size={18} />} label="Manager Name" name="managerName" type="text" value={formData.managerName} onChange={handleChange} required />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
             <button type="submit" className="bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-md">
               Register Hospital
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// Reusable Input Component
const InputField = ({ label, name, type, value, onChange, icon, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  </div>
);

export default AddHospital;