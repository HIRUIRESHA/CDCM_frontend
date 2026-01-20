import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Calendar, FileText, CreditCard, Users, LogOut, Settings,UserCog,Microscope,AlertCircle,BarChart3,Bell,FileBarChart,MessageSquare,User,MessageCircle,Video
} from 'lucide-react';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// === Helper Component for Sidebar Links ===
const SidebarLink = ({ to, icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-white hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
};

// === Common Sidebar Container ===
const SidebarContainer = ({ children, title, titleColor = "text-white" }) => {
    const { logout } = useAuth();
    return (
        <aside className="w-64 bg-[#0a1647] flex flex-col h-screen sticky top-0">
            {/* Header with logo/title */}
            <div className="h-20 flex items-center px-6 border-b border-[#1a2557]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                        <span className="text-[#0a1647] font-bold text-lg">H</span>
                    </div>
                    <span className={`text-xl font-semibold ${titleColor}`}>{title}</span>
                </div>
            </div>
            
            {/* Navigation items */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {children}
            </nav>
            
            {/* Settings and Logout at bottom */}
            <div className="p-4 border-t border-[#1a2557] space-y-1">
                <button 
                    className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-sm font-medium text-white hover:bg-[#1a2557] transition-colors"
                >
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
                <button 
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-sm font-medium text-white hover:bg-[#1a2557] transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};


// =========================================
// 1. PATIENT SIDEBAR
// =========================================
export const PatientSidebar = () => {
    return (
      <SidebarContainer title="HealthRoute" titleColor="text-white">
    <SidebarLink to="/patient/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
    <SidebarLink to="/patient/appointments" icon={<Calendar size={20} />} label="My Appointment" />
    <SidebarLink to="/patient/medical-history" icon={<FileText size={20} />} label="Medical History" />
    <SidebarLink to="/patient/doctors" icon={<UserCog size={20} />} label="My Doctors" />
    <SidebarLink to="/patient/reports" icon={<FileBarChart size={20} />} label="Reports" />
    <SidebarLink to="/patient/messages" icon={<MessageSquare size={20} />} label="Messages" />
    <SidebarLink to="/patient/notifications" icon={<Bell size={20} />} label="Notification" />
    <SidebarLink to="/patient/payment" icon={<CreditCard size={20} />} label="Payment" />
</SidebarContainer>
    );
};

// =========================================
// 2. DOCTOR SIDEBAR
// =========================================
export const DoctorSidebar = () => {
    return (
      <SidebarContainer title="HealthRoute" titleColor="text-white">
    <SidebarLink to="/doctor/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
    <SidebarLink to="/doctor/account" icon={<User size={20} />} label="Account" />
    <SidebarLink to="/doctor/schedule" icon={<Calendar size={20} />} label="My Schedule" />
    <SidebarLink to="/doctor/feedback" icon={<MessageCircle size={20} />} label="Feedback" />
    <SidebarLink to="/doctor/messages" icon={<MessageSquare size={20} />} label="Messages" />
    <SidebarLink to="/doctor/notifications" icon={<Bell size={20} />} label="Notification" />
    <SidebarLink to="/doctor/video-conference" icon={<Video size={20} />} label="Video Conference" />
</SidebarContainer>
    );
};

// =========================================
// 3. HOSPITAL SIDEBAR
// =========================================
export const HospitalSidebar = () => {
    return (
         <SidebarContainer title="HealthRoute" titleColor="text-white">
    <SidebarLink to="/hospital/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
    <SidebarLink to="/hospital/patients" icon={<Users size={20} />} label="Patient Management" />
    <SidebarLink to="/hospital/appointments" icon={<Calendar size={20} />} label="Appointment" />
    <SidebarLink to="/hospital/doctors" icon={<UserCog size={20} />} label="Doctor Management" />
    <SidebarLink to="/hospital/laboratory" icon={<Microscope size={20} />} label="Laboratory" />
    <SidebarLink to="/hospital/emergency" icon={<AlertCircle size={20} />} label="Emergency" />
    <SidebarLink to="/hospital/analytics" icon={<BarChart3 size={20} />} label="Analytics" />
    <SidebarLink to="/hospital/notifications" icon={<Bell size={20} />} label="Notifications" />
</SidebarContainer>
    );
};

export const AdminSidebar = () => (
  <SidebarContainer title="CDCMS Admin" titleColor="text-red-600">
    <SidebarLink to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
    <SidebarLink to="/admin/add-hospital" icon={<PlusCircle size={20} />} label="Add Hospital" />
  </SidebarContainer>
);