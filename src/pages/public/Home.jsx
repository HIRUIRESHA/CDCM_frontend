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
          fetch("http://localhost:8082/api/hospital/doctors/assigned-all"),
          fetch("http://localhost:8082/api/hospital/doctors/all-hospitals"),
          fetch("http://localhost:8082/api/hospital/doctors/specializations"),
        ]);

        let docs = [];
        if (docsRes.status === "fulfilled" && docsRes.value.ok) {
          const dData = await docsRes.value.json();
          docs = Array.isArray(dData) ? dData : [];
        } else {
          try {
            const fallbackRes = await fetch("http://localhost:8082/api/hospital/doctors/search");
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
              <h1 className="text-5xl font-bold text-blue-600 mb-4">
                FINDING HEALTHCARE
              </h1>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Discover best doctors and clinics worldwide for immediate care. With just a few clicks, connect 
                with qualified healthcare professionals, ensuring you receive the treatment you need when you need it most. 
                Our platform streamlines the process, offering a seamless experience for all your health needs.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/find-doctor')}
                  className="px-8 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition font-medium cursor-pointer"
                >
                  Explore by Nearby
                </button>
                <button
                  onClick={() => navigate('/find-doctor')}
                  className="px-8 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition font-medium cursor-pointer"
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
      {/* 1. CREATIVE "WHAT IS CDCM?" SECTION */}
      {/* ========================================================= */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Subtle background ambient glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Next-Gen Healthcare Technology Platform
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Your Healthcare Journey, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600">
                  Connected in One Place
                </span>
              </h2>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                <strong className="text-slate-900 font-semibold">CDCM (Centralized Doctor & Channeling Management)</strong> is an all-in-one digital health ecosystem engineered to eliminate clinical bottlenecks. We seamlessly connect patients, medical specialists, and hospitals into a single, unified digital workflow.
              </p>

              {/* Key Platform Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/40 transition">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Real-Time Doctor Channeling</span>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/40 transition">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Virtual Video Consultations</span>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/40 transition">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">PayHere Secure Checkout</span>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/40 transition">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Digital Health Records & Reports</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => navigate('/find-doctor')}
                  className="px-7 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-700/20 transition flex items-center gap-2 cursor-pointer group"
                >
                  <span>Explore Platform Services</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3.5 rounded-xl border border-slate-300 hover:border-blue-600 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 font-bold text-sm transition cursor-pointer"
                >
                  Join as Patient
                </button>
              </div>
            </div>

            {/* Right Interactive Ecosystem Graphic (5 Cols) */}
            <div className="lg:col-span-5 relative">
              <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-8 rounded-3xl text-white shadow-2xl border border-blue-900/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* Header of graphic */}
                <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono tracking-wider uppercase text-blue-200">CDCM Ecosystem Live</span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-white/10">
                    Central Hub
                  </span>
                </div>

                {/* Floating interconnected capability cards */}
                <div className="space-y-3 relative z-10">
                  
                  {/* Node 1: Patients */}
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/15 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/30 text-cyan-300 flex items-center justify-center font-bold">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Patients Portal</p>
                        <p className="text-[11px] text-blue-200/70">Search, book & view health vault</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      Active
                    </span>
                  </div>

                  {/* Node 2: Doctors */}
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/15 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Doctors Network</p>
                        <p className="text-[11px] text-blue-200/70">Manage schedules, queues & chats</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                      Verified
                    </span>
                  </div>

                  {/* Node 3: Hospitals */}
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/15 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Hospital Administration</p>
                        <p className="text-[11px] text-blue-200/70">Assign doctors & lab diagnostics</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-md">
                      Connected
                    </span>
                  </div>

                </div>

                {/* Bottom live connectivity badge */}
                <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-blue-200/80 relative z-10">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    256-Bit SSL Encrypted
                  </span>
                  <span className="font-semibold text-white">Zero Queue Fragmentation</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. MAIN FEATURE SECTION - OUR SERVICES (BENTO GRID LAYOUT) */}
      {/* ========================================================= */}
      <section className="py-24 bg-slate-50 border-t border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200/80 mb-3">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Comprehensive Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Everything You Need for a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-600">
                Better Healthcare Experience
              </span>
            </h2>
            <p className="text-slate-600 text-base mt-3 max-w-2xl mx-auto">
              Explore the real, operational digital healthcare services built directly into the CDCM system.
            </p>
          </div>

          {/* Bento-Style Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Feature 1 (Large Highlight Card) */}
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest">Core Channeling Service</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-3">
                  Find Your Doctor & Easy Appointment Booking
                </h3>
                <p className="text-blue-200/85 text-sm sm:text-base leading-relaxed max-w-xl">
                  Discover verified specialists by medical field, hospital location, and live calendar availability. Instantly lock in your reserved queue number with zero phone calls or guesswork.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 text-xs text-blue-200 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time Slot Sync
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Queue Number Issuance
                  </span>
                </div>
                <button
                  onClick={() => navigate('/find-doctor')}
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Channel Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Feature 2: Physical Appointments */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Physical In-Clinic Visits</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Book and manage in-person clinic consultations at partner hospitals with assigned queue tickets and token tracking.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>In-Hospital Consultations</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 3: Video Consultations */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Video Consultations</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Connect with specialized doctors virtually from home via secure, high-definition video conferencing rooms.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
                <span>Virtual Online Care</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 4: Secure Payments */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-cyan-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Secure Online Payments</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Seamlessly confirm appointments with instant automated verification powered by the PayHere payment gateway.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700">
                <span>PayHere Gateway Protected</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 5: Medical Records & History */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Digital Medical Records</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Access your encrypted clinical history, treatment records, diagnosis notes, and physician summaries anytime.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Centralized Health Vault</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 6: Prescriptions */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-rose-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Prescriptions Management</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  View and verify digital prescriptions and medication instructions issued directly by your consulting doctors.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
                <span>Verified Prescriptions</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 7: Lab Reports */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Laboratory Test Reports</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Schedule hospital lab investigations and download authenticated diagnostic test results securely.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>Hospital Lab Integration</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 8: Real-Time Notifications */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Live System Notifications</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Receive instant automated alerts for appointment payment confirmations, schedule changes, and lab reports.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Real-Time Push Alerts</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. "HOW CDCM MAKES HEALTHCARE EASIER" (CONNECTED TIMELINE) */}
      {/* ========================================================= */}
      <section className="py-24 bg-white border-t border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 mb-3">
              Step-By-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              How CDCM Makes <span className="text-blue-700">Healthcare Easier</span>
            </h2>
            <p className="text-slate-600 text-base mt-3">
              From discovering a specialist to post-consultation follow-up in 6 seamless steps.
            </p>
          </div>

          {/* Responsive 6-Step Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative flex flex-col justify-between hover:border-blue-400 hover:bg-white hover:shadow-lg transition group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-700 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                  01
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">Discover</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Find specialists by field, name, hospital, or date.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-blue-700">
                Doctor Search
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative flex flex-col justify-between hover:border-blue-400 hover:bg-white hover:shadow-lg transition group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-800 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                  02
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">Choose</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  View doctor profiles, hospital branches, and live schedules.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-blue-700">
                Verified Profile
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative flex flex-col justify-between hover:border-blue-400 hover:bg-white hover:shadow-lg transition group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                  03
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">Book</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Select a physical clinic session or video consultation slot.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-indigo-700">
                Queue Ticket
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative flex flex-col justify-between hover:border-blue-400 hover:bg-white hover:shadow-lg transition group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-800 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                  04
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">Pay</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Confirm booking instantly via PayHere secure gateway.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-indigo-700">
                Secure Checkout
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative flex flex-col justify-between hover:border-blue-400 hover:bg-white hover:shadow-lg transition group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-700 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                  05
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">Connect</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Attend in-clinic consultation or join HD video room.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-cyan-700">
                Consultation
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative flex flex-col justify-between hover:border-blue-400 hover:bg-white hover:shadow-lg transition group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                  06
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">Manage</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Review medical history, prescriptions, reports & alerts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-emerald-700">
                Digital Health
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. "ONE PLATFORM, MANY HEALTHCARE NEEDS" (CONNECTED JOURNEY MAP) */}
      {/* ========================================================= */}
      <section className="py-24 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-cyan-300 border border-white/10 mb-3">
              <Workflow className="w-3.5 h-3.5 text-cyan-400" />
              Unified Clinical Flow
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              One Platform, Many <span className="text-cyan-400">Healthcare Needs</span>
            </h2>
            <p className="text-blue-200/80 text-base mt-3 max-w-xl mx-auto">
              Your healthcare journey stays completely connected from discovery and booking to treatment and follow-up.
            </p>
          </div>

          {/* Interactive Connected Nodes Flow */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 items-center">
            
            {/* Node 1 */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center hover:bg-white/20 transition flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/30 text-blue-300 flex items-center justify-center mb-2.5">
                <Stethoscope className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Find Doctor</p>
              <span className="text-[10px] text-blue-200/60 mt-0.5">Search & Filter</span>
            </div>

            {/* Node 2 */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center hover:bg-white/20 transition flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center mb-2.5">
                <Award className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Doctor Profile</p>
              <span className="text-[10px] text-blue-200/60 mt-0.5">Credentials</span>
            </div>

            {/* Node 3 */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center hover:bg-white/20 transition flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-purple-500/30 text-purple-300 flex items-center justify-center mb-2.5">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Live Schedule</p>
              <span className="text-[10px] text-blue-200/60 mt-0.5">Time Slots</span>
            </div>

            {/* Node 4 */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center hover:bg-white/20 transition flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/30 text-cyan-300 flex items-center justify-center mb-2.5">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Appointment</p>
              <span className="text-[10px] text-blue-200/60 mt-0.5">Queue Number</span>
            </div>

            {/* Node 5 */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center hover:bg-white/20 transition flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center mb-2.5">
                <CreditCard className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">PayHere Pay</p>
              <span className="text-[10px] text-blue-200/60 mt-0.5">Instant Verify</span>
            </div>

            {/* Node 6 */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center hover:bg-white/20 transition flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-teal-500/30 text-teal-300 flex items-center justify-center mb-2.5">
                <Video className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Consultation</p>
              <span className="text-[10px] text-blue-200/60 mt-0.5">In-Person/HD</span>
            </div>

            {/* Node 7 */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center hover:bg-white/20 transition flex flex-col items-center col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-rose-500/30 text-rose-300 flex items-center justify-center mb-2.5">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Health Vault</p>
              <span className="text-[10px] text-blue-200/60 mt-0.5">Records & Tests</span>
            </div>

          </div>

          <div className="mt-12 text-center">
            <p className="text-xs sm:text-sm text-blue-200/70 font-light">
              ✦ All clinical interactions are securely encrypted and automatically synchronized with your patient dashboard.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. SMALL REAL DATA METRICS STRIP (SUPPORTING SECTION) */}
      {/* ========================================================= */}
      <section className="bg-slate-900 text-white py-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            
            {/* Real Stat 1 */}
            <div className="pt-3 md:pt-0 flex flex-col items-center">
              <p className="text-2xl sm:text-3xl font-black text-cyan-400">
                {loadingData ? "..." : (doctorsList.length > 0 ? `${doctorsList.length}+` : "Active")}
              </p>
              <p className="text-xs font-medium text-slate-400 mt-0.5 uppercase tracking-wider">
                Registered Doctors
              </p>
            </div>

            {/* Real Stat 2 */}
            <div className="pt-3 md:pt-0 flex flex-col items-center">
              <p className="text-2xl sm:text-3xl font-black text-cyan-400">
                {loadingData ? "..." : (hospitalsList.length > 0 ? `${hospitalsList.length}+` : "Partner")}
              </p>
              <p className="text-xs font-medium text-slate-400 mt-0.5 uppercase tracking-wider">
                Partner Hospitals
              </p>
            </div>

            {/* Real Stat 3 */}
            <div className="pt-3 md:pt-0 flex flex-col items-center">
              <p className="text-2xl sm:text-3xl font-black text-cyan-400">
                {loadingData ? "..." : (specializationsList.length > 0 ? `${specializationsList.length}+` : "Key")}
              </p>
              <p className="text-xs font-medium text-slate-400 mt-0.5 uppercase tracking-wider">
                Medical Specialties
              </p>
            </div>

            {/* Real Stat 4 */}
            <div className="pt-3 md:pt-0 flex flex-col items-center">
              <p className="text-2xl sm:text-3xl font-black text-cyan-400">
                24/7 Access
              </p>
              <p className="text-xs font-medium text-slate-400 mt-0.5 uppercase tracking-wider">
                Digital Health Platform
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. SMALL FEATURED DOCTORS SECTION (~3 COMPACT CARDS) */}
      {/* ========================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Supporting Medical Network
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Meet Our Healthcare Professionals
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Consult with verified medical specialists active across our platform.
              </p>
            </div>

            <button
              onClick={() => navigate('/find-doctor')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>Explore All Doctors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 animate-pulse h-32" />
              ))}
            </div>
          ) : doctorsList.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
              <p className="text-xs text-slate-500">Doctors directory available via search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctorsList.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-blue-300 transition flex items-center gap-4 group"
                >
                  <img
                    src={doc.profileImage || doc1}
                    alt={`${doc.firstName} ${doc.lastName}`}
                    className="w-16 h-16 rounded-xl object-cover border border-blue-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                      {doc.title || "Dr."} {doc.firstName} {doc.lastName}
                    </h4>
                    <p className="text-xs font-semibold text-blue-600 truncate">
                      {doc.specialization || "Medical Specialist"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {getHospitalName(doc)}
                    </p>
                    <button
                      onClick={() => navigate(`/doctor/account/${doc.id}`)}
                      className="mt-2 text-[11px] font-bold text-slate-700 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. SMALL HEALTHCARE NETWORK SECTION (COMPACT HOSPITALS) */}
      {/* ========================================================= */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-200/70 px-3 py-1 rounded-full">
                Affiliated Institutions
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Connected Healthcare Network
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                CDCM integrates with top hospital branches to provide seamless on-premise care.
              </p>
            </div>

            <button
              onClick={() => navigate('/find-doctor')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>View Partner Hospitals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse h-24" />
              ))}
            </div>
          ) : hospitalsList.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-slate-200 text-xs text-slate-500">
              Hospital partners connected via platform search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospitalsList.slice(0, 3).map((hosp) => (
                <div
                  key={hosp.id}
                  className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{hosp.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{hosp.location || hosp.address || "Sri Lanka"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/find-doctor?hospital=${hosp.id}`)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-800 shrink-0 cursor-pointer"
                  >
                    Channel →
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. WHY CHOOSE CDCM? SECTION */}
      {/* ========================================================= */}
      <section className="py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Patient-Centric Value
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Why Choose <span className="text-blue-700">CDCM?</span>
            </h2>
            <p className="text-slate-600 text-base mt-3 max-w-2xl mx-auto">
              Engineered from the ground up to solve fragmented appointment booking and clinical records management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Value 1: Convenient */}
            <div className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Convenient & Direct</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Manage all appointments, channeling tickets, and clinical communication from one unified online dashboard.
              </p>
            </div>

            {/* Value 2: Connected */}
            <div className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
                <Workflow className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Centralized & Connected</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Seamlessly bridges patients, doctors, and hospital administrators in real time with instant data synchronization.
              </p>
            </div>

            {/* Value 3: Accessible */}
            <div className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Accessible Everywhere</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Discover qualified specialists and reserve available appointments from any device, anywhere in Sri Lanka.
              </p>
            </div>

            {/* Value 4: Organized */}
            <div className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Organized Health Records</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Keep your doctor consultation notes, prescriptions, laboratory reports, and payment invoices unified in one secure vault.
              </p>
            </div>

            {/* Value 5: Digital */}
            <div className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Digital-First Healthcare</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Take advantage of integrated virtual video consultations, automated push notifications, and cashless PayHere checkout.
              </p>
            </div>

            {/* Value 6: Patient Focused */}
            <div className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Patient Focused & Transparent</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Designed to eliminate hours wasted in crowded hospital waiting rooms with upfront queue numbers and verified doctors.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. STRONG CALL-TO-ACTION SECTION */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-cyan-300 border border-white/15 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Transform Your Healthcare Journey
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-5">
            Take the Next Step in Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
              Healthcare Journey with CDCM
            </span>
          </h2>

          <p className="text-blue-200/90 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Find a doctor, explore available healthcare services, and manage appointments, payments, and medical records in one seamless platform.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/find-doctor')}
              className="px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl font-bold text-sm shadow-xl shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Find a Doctor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/find-doctor')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition border border-white/20 cursor-pointer"
            >
              Explore Our Services
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
