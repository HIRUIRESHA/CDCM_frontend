import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Stethoscope, 
  Calendar, 
  Video, 
  CreditCard, 
  FileText, 
  Pill, 
  Activity, 
  MessageSquare, 
  Bell, 
  Lock,
  ArrowRight,
  HeartPulse
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-blue-950 to-[#0A0A4D] text-white border-t border-blue-900/60">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: CDCM Introduction */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:bg-blue-500 transition-colors">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                  <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                CDCM<span className="text-cyan-400">.</span>
              </span>
            </Link>
            
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm">
              Connecting patients, doctors, and healthcare services through one centralized platform.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-cyan-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Centralized Doctor & Channeling Management</span>
            </div>
          </div>

          {/* Column 2: Our Services */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
              <HeartPulse className="w-4 h-4" />
              Our Services
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/find-doctor" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Find Doctors</span>
                </Link>
              </li>
              <li>
                <Link to="/find-doctor" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Appointment Booking</span>
                </Link>
              </li>
              <li>
                <Link to="/find-doctor" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-2">
                  <Video className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Video Consultation</span>
                </Link>
              </li>
              <li>
                <span className="text-slate-300 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Secure Payments</span>
                </span>
              </li>
              <li>
                <span className="text-slate-300 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Medical Records</span>
                </span>
              </li>
              <li>
                <span className="text-slate-300 flex items-center gap-2">
                  <Pill className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Prescriptions</span>
                </span>
              </li>
              <li>
                <span className="text-slate-300 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Lab Reports</span>
                </span>
              </li>
              <li>
                <span className="text-slate-300 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Messaging & Notifications</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/find-doctor" className="text-slate-300 hover:text-white transition-colors">
                  Find Doctor
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-300 hover:text-white transition-colors">
                  Register as Patient
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="text-slate-300 hover:text-white transition-colors">
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform Security & Access */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Platform Overview
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              24/7 centralized digital healthcare access with encrypted patient records and verified channeling schedules.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Integrated Healthcare Portal</span>
              </div>
              <p className="text-[11px] text-slate-400">
                PayHere checkout & real-time doctor appointment sync.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 CDCM. All rights reserved.</p>
          <p className="text-slate-500 text-[11px]">
            Centralized Doctor & Channeling Management System
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;