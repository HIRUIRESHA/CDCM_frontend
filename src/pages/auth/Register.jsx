import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import back3 from "../../assets/back3.webp";


const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: role selection, 2: phone/email, 3: OTP, 4: details
  const [role, setRole] = useState(''); // 'patient' or 'doctor'
  const [contactMethod, setContactMethod] = useState('phone'); // 'phone' or 'email'
  const [countryCode, setCountryCode] = useState('+94');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [timer, setTimer] = useState(60);

  const [formData, setFormData] = useState({
    // Common fields
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Patient specific
    dateOfBirth: '',
    idType: 'NIC', // 'NIC' or 'Passport'
    idNumber: '',
    residential: '',
    
    // Doctor specific
    specialization: '',
    medicalLicenseNumber: '',
    experience: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 4) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const endpoint = role === 'patient' 
        ? 'http://localhost:8080/api/auth/register/patient'
        : 'http://localhost:8080/api/auth/register/doctor';

      // Example API call
      console.log('Registration data:', { role, ...formData });
      
      // const response = await fetch(endpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();
      // navigate('/login');
      
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleNext = () => {
    if (step === 1 && !role) {
      alert('Please select a role');
      return;
    }
    if (step === 2) {
      // Send OTP
      console.log('Sending OTP to:', contactMethod === 'phone' ? countryCode + formData.phone : formData.email);
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Step 1: Role Selection (hidden, goes directly to step 2)
  const renderRoleSelection = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Select Your Role</h2>
      <div className="space-y-4">
        <button
          onClick={() => { setRole('patient'); setStep(2); }}
          className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
        >
          Register as Patient
        </button>
        <button
          onClick={() => { setRole('doctor'); setStep(2); }}
          className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg"
        >
          Register as Doctor
        </button>
      </div>
    </div>
  );

  // Step 2: Phone/Email Input
  const renderContactInput = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 text-center">Sign up</h2>
      <p className="text-center text-gray-600 mb-6">
        Please select your country then enter <span className="font-semibold">your phone number or email</span><br />
        so we can verify you.
      </p>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Mobile Number or Email</label>
        
        {contactMethod === 'phone' ? (
          <div className="space-y-3">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="+94">Sri Lanka (+94)</option>
              <option value="+1">USA (+1)</option>
              <option value="+44">UK (+44)</option>
              <option value="+91">India (+91)</option>
            </select>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+94"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        ) : (
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="enter your email"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <span className="w-6 h-6 flex items-center justify-center border-2 border-gray-600 rounded-full">←</span>
          <span>Back</span>
        </button>
        <button
          onClick={handleNext}
          className="flex items-center space-x-2 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          <span>Next</span>
          <span className="w-6 h-6 flex items-center justify-center border-2 border-white rounded-full">→</span>
        </button>
      </div>
    </div>
  );

  // Step 3: OTP Verification
  const renderOtpVerification = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 text-center">Verify Code</h2>
      <p className="text-center text-gray-600 mb-6">
        Check your SMS inbox, we have sent you the code at{' '}
        <span className="font-semibold">
          {contactMethod === 'phone' ? `${countryCode} ${formData.phone}` : formData.email}
        </span>
      </p>

      <div className="flex justify-center space-x-3 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            className="w-14 h-14 text-center text-2xl font-bold bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-blue-600 mb-2">({Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')})</p>
        <p className="text-gray-600 text-sm">This session will end in 60 seconds.</p>
        <p className="text-sm mt-2">
          Didn't receive a code?{' '}
          <button className="text-blue-600 hover:text-blue-700 font-semibold">
            Resend Code
          </button>
        </p>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <span className="w-6 h-6 flex items-center justify-center border-2 border-gray-600 rounded-full">←</span>
          <span>Back</span>
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Step 4: Personal Details (Patient)
  const renderPatientDetails = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Personal Details</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Title</label>
          <select
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Title required</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Miss">Miss</option>
            <option value="Dr">Dr</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* First Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter your first name"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Last Name */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter your last name"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* ID Type Selection */}
        <div className="col-span-2">
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="idType"
                value="NIC"
                checked={formData.idType === 'NIC'}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700 font-medium">NIC</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="idType"
                value="Passport"
                checked={formData.idType === 'Passport'}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700 font-medium">Passport</span>
            </label>
          </div>
        </div>

        {/* ID Number */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-medium mb-2">
            {formData.idType === 'NIC' ? 'NIC Number' : 'Passport Number'}
          </label>
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            placeholder={`Enter your ${formData.idType} number`}
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Birth Day */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Birth Day</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Contact Number */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Contact Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your contact number"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Residential Address */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Residential Address</label>
          <input
            type="text"
            name="residential"
            value={formData.residential}
            onChange={handleChange}
            placeholder="Enter your address"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <span className="w-6 h-6 flex items-center justify-center border-2 border-gray-600 rounded-full">←</span>
          <span>Back</span>
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
        >
          Submit
        </button>
      </div>
    </form>
  );

  // Step 4: Personal Details (Doctor)
  const renderDoctorDetails = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Doctor Registration</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Title</label>
          <select
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Title required</option>
            <option value="Dr">Dr</option>
            <option value="Prof">Prof</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* First Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Specialization */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Specialization</label>
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Specialization</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Neurology">Neurology</option>
            <option value="General Practice">General Practice</option>
          </select>
        </div>

        {/* Medical License Number */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Medical License Number</label>
          <input
            type="text"
            name="medicalLicenseNumber"
            value={formData.medicalLicenseNumber}
            onChange={handleChange}
            placeholder="Enter license number"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

       

        {/* Email */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <span className="w-6 h-6 flex items-center justify-center border-2 border-gray-600 rounded-full">←</span>
          <span>Back</span>
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
        >
          Submit
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100  relative overflow-hidden py-8">
      {/* Background */}
        <div
  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: `url(${back3})` }}
></div>


      

      {/* Top Navigation */}
     

      {/* Form Card */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4">
        {step === 1 && renderRoleSelection()}
        {step === 2 && renderContactInput()}
        {step === 3 && renderOtpVerification()}
        {step === 4 && role === 'patient' && renderPatientDetails()}
        {step === 4 && role === 'doctor' && renderDoctorDetails()}
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        <div className={`w-3 h-3 rounded-full ${step >= 4 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
      </div>
    </div>
  );
};

export default Register;