import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import doc1 from '../../assets/doc1.png';
import doc2 from '../../assets/doc2.png';
import doc3 from '../../assets/doc3.png';




const HomePage = () => {
  const navigate = useNavigate();

  const [doctorName, setDoctorName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to FindDoctor page with query params
    navigate(
      `/find-doctor?doctor=${doctorName}&specialization=${specialization}&hospital=${hospital}&date=${date}`
    );
  };

  return (
    <div className="bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-400 to-gray-300 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl font-bold text-blue-600 mb-4">
                FINDING HEALTHCARE
              </h1>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Discover best doctors and clinics worldwide for immediate care. With just a few clicks, connect 
                with qualified healthcare professionals, ensuring you receive the treatment you need when you need it most. 
                Our platform streamlines the process, offering a seamless experience for all your health needs.
              </p>
              <div className="flex space-x-4">
                <button className="px-8 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition font-medium">
                  Explore by Nearby
                </button>
                <button className="px-8 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition font-medium">
                  More Than 50.000+
                </button>
              </div>
            </div>

            {/* Right Content - Doctor Images */}
            <div className="relative flex gap-4">
  <img 
    src={doc1}
    alt="Doctor 1" 
    className="rounded-lg shadow-xl object-cover h-68 w-1/2"
  />
  <img 
    src={doc2}
    alt="Doctor 2" 
    className="rounded-lg shadow-xl object-cover h-68 w-1/2"
  />
</div>


          </div>
        </div>
      </section>

      {/* Find Your Doctor Section */}
<section className="py-20 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

      {/* Left - Doctor Image */}
      <div className="relative">
        <div className="absolute -inset-4 bg-blue-500/20 rounded-3xl blur-xl"></div>
        <img 
          src={doc3}
          alt="Medical Professionals" 
          className="relative rounded-3xl shadow-2xl object-cover w-full h-[420px]"
        />
      </div>

      {/* Right - Search Form */}
      <div className="relative bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-gray-200">
        <h2 className="text-4xl font-bold text-gray-800 mb-10">
          Find Your <span className="text-blue-600">Doctor</span>
        </h2>
        
        <form onSubmit={handleSearch} className="space-y-6">

          {/* Doctor Name */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Doctor name
            </label>
            <input
              type="text"
              placeholder="Search doctor name"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Specialization
            </label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Select Specialization</option>
              <option value="cardiology">Cardiology</option>
              <option value="dermatology">Dermatology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="orthopedics">Orthopedics</option>
              <option value="neurology">Neurology</option>
            </select>
          </div>

          {/* Hospital */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Hospital
            </label>
            <select
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Select hospital</option>
              <option value="general">General Hospital</option>
              <option value="central">Central Hospital</option>
              <option value="private">Private Hospital</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Date
            </label>
            <input
              type="text"
              placeholder="MM/DD/YYYY"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl hover:scale-[1.02] transition transform font-semibold flex items-center justify-center space-x-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search Doctor</span>
          </button>

        </form>
      </div>

    </div>
  </div>
</section>


      {/* Quality Healthcare Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Providing Quality <span className="text-blue-600">Healthcare</span> For A
          </h2>
          <h2 className="text-4xl font-bold mb-12">
            <span className="text-green-500">Brighter</span> And <span className="text-green-600">Healthy</span> Future
          </h2>

          {/* Features Grid */}
          <div className="flex gap-6 overflow-x-auto pb-4">

  {/* E-Research */}
  <div className="min-w-[260px] bg-orange-400 p-6 rounded-lg text-left shadow-lg">
    <div className="text-white mb-2">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    </div>
    <h3 className="font-bold text-white text-lg mb-1">E-Research</h3>
    <p className="text-white text-sm">24-72 hours</p>
  </div>

  {/* E-Medical */}
  <div className="min-w-[260px] bg-orange-400 p-6 rounded-lg text-left shadow-lg">
    <div className="text-white mb-2">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 00-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
      </svg>
    </div>
    <h3 className="font-bold text-white text-lg mb-1">E-Medical</h3>
    <p className="text-white text-sm">History Access</p>
  </div>

  {/* Consultation */}
  <div className="min-w-[260px] bg-white p-6 rounded-lg text-left border-2 border-gray-300 shadow-lg">
    <div className="text-blue-600 mb-2">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
    <h3 className="font-bold text-gray-800 text-lg mb-1">Consultation</h3>
    <p className="text-gray-600 text-sm">Booking</p>
  </div>

  {/* Health Advice */}
  <div className="min-w-[260px] bg-white p-6 rounded-lg text-left border-2 border-gray-300 shadow-lg">
    <div className="text-blue-600 mb-2">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
      </svg>
    </div>
    <h3 className="font-bold text-gray-800 text-lg mb-1">Health Advice</h3>
    <p className="text-gray-600 text-sm">Consultation</p>
  </div>

  {/* Message Service */}
  <div className="min-w-[260px] bg-white p-6 rounded-lg text-left border-2 border-gray-300 shadow-lg">
    <div className="text-blue-600 mb-2">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    </div>
    <h3 className="font-bold text-gray-800 text-lg mb-1">Message Service</h3>
  </div>

</div>


          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-500 text-white p-8 rounded-lg">
              <h3 className="text-4xl font-bold mb-2">94.82%</h3>
              <p className="text-lg">Patient Satisfaction Rating</p>
            </div>
            <div className="bg-blue-500 text-white p-8 rounded-lg">
              <h3 className="text-4xl font-bold mb-2">0.00%</h3>
              <p className="text-lg">Rate of Patient Falls</p>
            </div>
            <div className="bg-blue-500 text-white p-8 rounded-lg">
              <h3 className="text-4xl font-bold mb-2">97.50%</h3>
              <p className="text-lg">Compliance to Correct Patient Identification</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
