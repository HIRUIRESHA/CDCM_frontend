import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle, Phone, MapPin, FileText, Calendar, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  
  // Single state object for all fields (Patient + Doctor)
  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Patient Specific
    dateOfBirth: '',
    nicOrPassport: '',
    contactNumber: '',
    residentialAddress: '',
    // Doctor Specific
    phone: '',
    specialization: '',
    medicalLicenseNumber: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    let endpoint = '';
    let payload = {};

    // --- 1. CONSTRUCT PAYLOAD BASED ON ROLE ---
    if (role === 'patient') {
      endpoint = 'register/patient';
      // Match fields in PatientRegisterRequest.java
      payload = {
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth, // Ensure YYYY-MM-DD
        nicOrPassport: formData.nicOrPassport,
        contactNumber: formData.contactNumber,
        residentialAddress: formData.residentialAddress,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };
    } else {
      endpoint = 'register/doctor';
      // Match fields in Doctor.java
      payload = {
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone, // Doctor uses 'phone', Patient uses 'contactNumber'
        specialization: formData.specialization,
        medicalLicenseNumber: formData.medicalLicenseNumber,
        email: formData.email,
        password: formData.password
      };
    }

    // --- 2. SEND TO BACKEND ---
    const result = await register(endpoint, payload);

    if (result.success) {
      alert("Registration successful! Please login.");
      navigate('/login');
    } else {
      setError(result.message || "Registration failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-2xl">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 mb-4">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-2">Join us to manage your healthcare journey</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Role Selector */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button 
            type="button"
            onClick={() => setRole('patient')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              role === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            I am a Patient
          </button>
          <button 
            type="button"
            onClick={() => setRole('doctor')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              role === 'doctor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            I am a Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- COMMON FIELDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Title */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <select name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Dr">Dr</option>
                    <option value="Prof">Prof</option>
                </select>
            </div>
            {/* First Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" name="firstName" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
            </div>
            {/* Last Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" name="lastName" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          {/* --- PATIENT SPECIFIC FIELDS --- */}
          {role === 'patient' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="date" name="dateOfBirth" required className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.dateOfBirth} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIC or Passport</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" name="nicOrPassport" required className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="NIC / Passport" value={formData.nicOrPassport} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="tel" name="contactNumber" required className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="07XXXXXXXX" value={formData.contactNumber} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" name="residentialAddress" required className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="123 Street, City" value={formData.residentialAddress} onChange={handleChange} />
                        </div>
                    </div>
                </div>
            </>
          )}

          {/* --- DOCTOR SPECIFIC FIELDS --- */}
          {role === 'doctor' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="tel" name="phone" required className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="07XXXXXXXX" value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select name="specialization" required className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.specialization} onChange={handleChange}>
                                <option value="">Select Specialization</option>
                                <option value="Cardiologist">Cardiologist</option>
                                <option value="Dermatologist">Dermatologist</option>
                                <option value="Neurologist">Neurologist</option>
                                <option value="Pediatrician">Pediatrician</option>
                                <option value="General Physician">General Physician</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical License Number</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" name="medicalLicenseNumber" required className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="License #" value={formData.medicalLicenseNumber} onChange={handleChange} />
                    </div>
                </div>
            </>
          )}

          {/* --- LOGIN CREDENTIALS --- */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">Login Credentials</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="email" name="email" required className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="name@example.com" value={formData.email} onChange={handleChange} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="password" name="password" required className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="password" name="confirmPassword" required className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white py-3 rounded-lg font-medium transition-colors mt-6 disabled:opacity-70 ${role === 'doctor' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Creating Account...' : `Register as ${role === 'patient' ? 'Patient' : 'Doctor'}`}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;