import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import doc1 from '../../assets/doc1.png';
import doc2 from '../../assets/doc2.png';
import doc3 from '../../assets/doc3.png';
import {
  Stethoscope,
  Calendar,
  Video,
  FileText,
  Activity,
  CreditCard,
  Bell,
  Star,
  Building2,
  ShieldCheck,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  UserCheck,
  Sparkles,
  ChevronRight,
  MessageSquare,
  HeartPulse,
  Pill,
  ClipboardList,
  Workflow,
  Layers,
  Lock,
  Zap,
  Check
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  // Preserved existing search states
  const [doctorName, setDoctorName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  const [date, setDate] = useState('');

  // Real backend data states for lower supporting sections
  const [doctorsList, setDoctorsList] = useState([]);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [specializationsList, setSpecializationsList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Preserved existing search handler
  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to FindDoctor page with query params
    navigate(
      `/find-doctor?doctor=${doctorName}&specialization=${specialization}&hospital=${hospital}&date=${date}`
    );
  };

  // Fetch real backend data for supporting sections
  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        const [docsRes, hospsRes, specsRes] = await Promise.allSettled([
          fetch("https://cdcm-backend.onrender.com/api/hospital/doctors/assigned-all"),
          fetch("https://cdcm-backend.onrender.com/api/hospital/doctors/all-hospitals"),
          fetch("https://cdcm-backend.onrender.com/api/hospital/doctors/specializations"),
        ]);

        let docs = [];
        if (docsRes.status === "fulfilled" && docsRes.value.ok) {
          const dData = await docsRes.value.json();
          docs = Array.isArray(dData) ? dData : [];
        } else {
          try {
            const fallbackRes = await fetch("https://cdcm-backend.onrender.com/api/hospital/doctors/search");
            if (fallbackRes.ok) {
              const fbData = await fallbackRes.json();
              docs = Array.isArray(fbData) ? fbData : [];
            }
          } catch (e) {
            console.warn("Fallback doctors fetch notice:", e);
          }
        }

        let hosps = [];
        if (hospsRes.status === "fulfilled" && hospsRes.value.ok) {
          const hData = await hospsRes.value.json();
          hosps = Array.isArray(hData) ? hData : [];
        }

        let specs = [];
        if (specsRes.status === "fulfilled" && specsRes.value.ok) {
          const sData = await specsRes.value.json();
          specs = Array.isArray(sData) ? sData : [];
        }

        if (isMounted) {
          setDoctorsList(docs);
          setHospitalsList(hosps);
          setSpecializationsList(specs);
        }
      } catch (err) {
        console.error("Error loading home page supporting data:", err);
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getHospitalName = (doc) => {
    if (!doc.hospitals || doc.hospitals.length === 0) return "Independent Practice";
    const hospitalId = doc.hospitals[0];
    const found = hospitalsList.find((h) => h.id === hospitalId || h.name === hospitalId);
    return found ? found.name : "Partner Hospital";
  };

  return (
    <div className="bg-gray-50 text-slate-800">

      {/* ========================================================= */}
      {/* 1. HERO SECTION (PRESERVED EXACTLY AS IS) */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-r from-gray-400 to-gray-300 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 mb-4">
                FINDING HEALTHCARE
              </h1>
              <p className="text-gray-700 mb-8 leading-relaxed text-sm sm:text-base">
                Discover best doctors and clinics worldwide for immediate care. With just a few clicks, connect 
                with qualified healthcare professionals, ensuring you receive the treatment you need when you need it most. 
                Our platform streamlines the process, offering a seamless experience for all your health needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => navigate('/find-doctor')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition font-medium cursor-pointer text-center"
                >
                  Explore by Nearby
                </button>
                <button
                  onClick={() => navigate('/find-doctor')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition font-medium cursor-pointer text-center"
                >
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

      {/* ========================================================= */}
      {/* 2. FIND YOUR DOCTOR SEARCH SECTION (PRESERVED EXACTLY AS IS) */}
      {/* ========================================================= */}
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
                  className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl hover:scale-[1.02] transition transform font-semibold flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
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

      {/* ========================================================= */}
      {/* 1. ABOUT CDCM - SHORT INTRODUCTION */}
      {/* ========================================================= */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-2xl relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen Healthcare Platform
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Modern Healthcare, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Seamlessly Connected</span>
              </h2>
              <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
                <strong className="text-white font-semibold">CDCM (Centralized Doctor & Channeling Management)</strong> is an all-in-one digital healthcare ecosystem designed to eliminate clinical bottlenecks. We seamlessly connect patients, medical specialists, and partner hospitals into a unified digital workflow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full lg:w-auto relative z-10 shrink-0">
              <button
                onClick={() => navigate('/find-doctor')}
                className="px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Find a Doctor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm border border-white/20 transition cursor-pointer text-center"
              >
                Register Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. MAIN SECTION: OUR SERVICES (CREATIVE BENTO-STYLE GRID) */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200/80 mb-3">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Our Services & Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Everything You Need for Your <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600">
                Healthcare Journey
              </span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
              Explore the fully integrated digital medical services available in the CDCM system.
            </p>
          </div>

          {/* Creative Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Service 1: Find Doctors & Appointment Booking (Hero Bento Card - Spans 2 Cols) */}
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-9 shadow-xl relative overflow-hidden flex flex-col justify-between group border border-blue-800/40">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                    Core Channeling
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                  Find Doctors & Channel Appointments
                </h3>
                <p className="text-blue-100/85 text-sm sm:text-base leading-relaxed max-w-xl">
                  Discover doctors by medical specialization, partner hospital, and real-time availability. Select available schedules and instantly reserve your appointment queue number without phone calls or delays.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-5 text-xs text-blue-200 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time Slot Sync
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Queue Number Tokens
                  </span>
                </div>
                <button
                  onClick={() => navigate('/find-doctor')}
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Search Doctors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Service 2: Video Consultation */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Video Consultation</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Online Care</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Access available online doctor consultations from home via secure, high-definition video conferencing rooms.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
                <span>Virtual Telemedicine</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 3: Secure Payments */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-cyan-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Secure Payments</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">PayHere</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Complete appointment payments through the integrated PayHere payment system with automated instant verification.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700">
                <span>Encrypted Checkout</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 4: Medical Records */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Medical Records</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Health Vault</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Access available healthcare records, doctor notes, diagnosis summaries, and medical histories securely in one central vault.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Confidential & Protected</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 5: Prescriptions */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-rose-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Pill className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Prescriptions</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Digital Rx</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  View and verify digital prescriptions and medication instructions provided directly through the CDCM system.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
                <span>Doctor Issued</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 6: Lab Reports */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Lab Reports</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">Diagnostics</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Access available laboratory test reports, track investigative statuses, and securely download diagnostic documents.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>Lab Test Integration</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 7: Messaging */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Messaging</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Live Chat</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Communicate through the system's dedicated messaging functionality for direct, real-time doctor-patient interactions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                <span>Secure Clinical Chat</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 8: Notifications */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Alerts</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Receive important appointment confirmations, schedule updates, payment receipts, and healthcare alerts instantly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Real-Time Updates</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SMALL "HOW IT WORKS" SECTION */}
      {/* ========================================================= */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 mb-2">
              Simple Journey Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Your seamless healthcare process from discovery to care management.
            </p>
          </div>

          {/* 6 Step Visual Flow */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-white transition flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white text-xs font-bold flex items-center justify-center mb-3 shadow-xs">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Find a Doctor</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Search by specialty, hospital, or name.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                Discovery
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-white transition flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-800 text-white text-xs font-bold flex items-center justify-center mb-3 shadow-xs">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Choose Schedule</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Pick a physical clinic or video slot.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                Availability
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-white transition flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white text-xs font-bold flex items-center justify-center mb-3 shadow-xs">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Book</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Reserve your appointment queue number.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                Queue Token
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-white transition flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-indigo-800 text-white text-xs font-bold flex items-center justify-center mb-3 shadow-xs">
                  4
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Pay</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Confirm securely with PayHere checkout.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                Fast Checkout
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-white transition flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white text-xs font-bold flex items-center justify-center mb-3 shadow-xs">
                  5
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Consult</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Meet in-clinic or join secure video call.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-bold text-cyan-700 uppercase tracking-wider">
                Consultation
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-white transition flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center justify-center mb-3 shadow-xs">
                  6
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Manage Care</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  View prescriptions, history & lab tests.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Digital Health
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. COMPACT SUPPORTING SECTION (REAL DOCTORS & HOSPITALS) */}
      {/* ========================================================= */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Doctors Preview */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    Healthcare Professionals
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">Available Doctors</h3>
                </div>
                <button
                  onClick={() => navigate('/find-doctor')}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {loadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : doctorsList.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Search doctors using the form above.</p>
              ) : (
                <div className="space-y-3">
                  {doctorsList.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => navigate('/find-doctor')}
                      className="p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={doc.profileImage || doc1}
                          alt={`${doc.firstName} ${doc.lastName}`}
                          className="w-11 h-11 rounded-xl object-cover border border-blue-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {doc.title || "Dr."} {doc.firstName} {doc.lastName}
                          </p>
                          <p className="text-[11px] text-blue-600 font-semibold truncate">
                            {doc.specialization || "Medical Specialist"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                        Channel →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hospitals Preview */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Partner Institutions
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">Connected Hospitals</h3>
                </div>
                <button
                  onClick={() => navigate('/find-doctor')}
                  className="text-xs font-bold text-slate-700 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {loadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : hospitalsList.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Partner hospitals available via search.</p>
              ) : (
                <div className="space-y-3">
                  {hospitalsList.slice(0, 3).map((hosp) => (
                    <div
                      key={hosp.id}
                      onClick={() => navigate(`/find-doctor?hospital=${hosp.id}`)}
                      className="p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{hosp.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{hosp.location || hosp.address || "Sri Lanka"}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">
                        Explore →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. CALL TO ACTION BANNER */}
      {/* ========================================================= */}
      {/* <section className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-5">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
            Ready to Simplify Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Healthcare Journey?</span>
          </h2>
          <p className="text-blue-200/90 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Find doctors, schedule clinic visits or video consultations, and manage records in one unified place.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3.5">
            <button
              onClick={() => navigate('/find-doctor')}
              className="px-7 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Channel a Doctor Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs border border-white/20 transition cursor-pointer text-center"
            >
              Create Free Patient Account
            </button>
          </div>
        </div>
      </section> */}

    </div>
  );
};

export default HomePage;
