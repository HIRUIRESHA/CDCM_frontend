import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { 
    LayoutDashboard, Calendar, FileText, CreditCard, Users, LogOut, Settings,UserCog,Microscope,AlertCircle,BarChart3,Bell,FileBarChart,MessageSquare,User,MessageCircle,Video,Building
} from 'lucide-react';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

// Helper Component for Sidebar Links
const SidebarLink = ({ to, icon, label, badge }) => {
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
            <div className="relative flex items-center justify-center shrink-0">
                {icon}
                {badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0a1647] animate-pulse" />
                )}
            </div>
            <span className="flex-1">{label}</span>
            {badge > 0 && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full shadow-sm shadow-rose-500/30">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
};

// --- UPDATED SIDEBAR CONTAINER ---
const SidebarContainer = ({ children, title, titleColor = "text-white" }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const effectiveRole = (
        user?.role ||
        localStorage.getItem("userRole") ||
        JSON.parse(localStorage.getItem("hospital") || "null")?.role ||
        (location.pathname.startsWith("/doctor")
            ? "DOCTOR"
            : location.pathname.startsWith("/hospital")
            ? "HOSPITAL"
            : location.pathname.startsWith("/patient")
            ? "PATIENT"
            : "")
    )?.toUpperCase();

    const settingsPath =
        effectiveRole === "PATIENT"
            ? "/patient/settings"
            : effectiveRole === "DOCTOR"
            ? "/doctor/settings"
            : effectiveRole === "HOSPITAL"
            ? "/hospital/settings"
            : "/settings";

    return (
        <aside className="w-64 bg-[#0a1647] flex flex-col h-screen sticky top-0">
            
            {/* Header: Added justify-between to push items to edges */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-[#1a2557]">
                
                {/* Left Side: Logo & Title */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shrink-0">
                        <span className="text-[#0a1647] font-bold text-lg">H</span>
                    </div>
                    <span className={`text-xl font-semibold ${titleColor}`}>{title}</span>
                </div>

                {/* Right Side: Profile Icon (Clickable) */}
                {user && (
                    <Link to="/profile" title="View Profile">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-500 hover:border-white transition-colors cursor-pointer">
                            <img 
                                src={user.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </Link>
                )}
            </div>
            
            {/* Navigation items */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {children}
            </nav>
            
            {/* Settings and Logout at bottom */}
            <div className="p-4 border-t border-[#1a2557] space-y-1">
                <SidebarLink 
                    to={settingsPath} 
                    icon={<Settings size={20} />} 
                    label="Settings" 
                />
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
// ---------------------------------

// PATIENT SIDEBAR
export const PatientSidebar = () => {
    const { unreadCount } = useNotifications();
    return (
      <SidebarContainer title="HealthRoute" titleColor="text-white">
        <SidebarLink to="/patient/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <SidebarLink to="/patient/appointments" icon={<Calendar size={20} />} label="My Appointment" />
        <SidebarLink to="/patient/medical-history" icon={<FileText size={20} />} label="Medical History" />
        <SidebarLink to="/patient/my-doctors" icon={<UserCog size={20} />} label="My Doctors" />
        <SidebarLink to="/patient/reports" icon={<FileBarChart size={20} />} label="Reports" />
        <SidebarLink to="/patient/messages" icon={<MessageSquare size={20} />} label="Messages" />
        <SidebarLink to="/patient/notifications" icon={<Bell size={20} />} label="Notification" badge={unreadCount} />
        <SidebarLink to="/patient/payment" icon={<CreditCard size={20} />} label="Payment" />
      </SidebarContainer>
    );
};

// DOCTOR SIDEBAR
export const DoctorSidebar = () => {
    const { unreadCount } = useNotifications();
    return (
      <SidebarContainer title="HealthRoute" titleColor="text-white">
        <SidebarLink to="/doctor/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <SidebarLink to="/doctor/account" icon={<User size={20} />} label="Account" />
        <SidebarLink to="/doctor/schedule" icon={<Calendar size={20} />} label="My Schedule" />
        <SidebarLink to="/doctor/mypatients" icon={<MessageCircle size={20} />} label="My Patients" />
        <SidebarLink to="/doctor/messages" icon={<MessageSquare size={20} />} label="Messages" />
        <SidebarLink to="/doctor/notifications" icon={<Bell size={20} />} label="Notification" badge={unreadCount} />
        <SidebarLink to="/doctor/video-conference" icon={<Video size={20} />} label="Video Conference" />
      </SidebarContainer>
    );
};

// HOSPITAL SIDEBAR
export const HospitalSidebar = () => {
    const { unreadCount } = useNotifications();
    return (
         <SidebarContainer title="HealthRoute" titleColor="text-white">
            <SidebarLink to="/hospital/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <SidebarLink to="/hospital/patients" icon={<Users size={20} />} label="Patient Management" />
            <SidebarLink to="/hospital/appointment" icon={<Calendar size={20} />} label="Appointment" />
            <SidebarLink to="/hospital/doctors" icon={<UserCog size={20} />} label="Doctor Management" />
            <SidebarLink to="/hospital/laboratory" icon={<Microscope size={20} />} label="Laboratory" />
            <SidebarLink to="/hospital/emergency" icon={<AlertCircle size={20} />} label="Emergency" />
            <SidebarLink to="/hospital/analytics" icon={<BarChart3 size={20} />} label="Analytics" />
            <SidebarLink to="/hospital/notifications" icon={<Bell size={20} />} label="Notifications" badge={unreadCount} />
            <SidebarLink to="/hospital/schedule" icon={<Calendar size={20} />} label="Schedule" />
        </SidebarContainer>
    );
};

// ADMIN SIDEBAR
export const AdminSidebar = () => (
  <SidebarContainer title="CDCMS Admin" titleColor="text-red-600">
    <SidebarLink to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
    <SidebarLink to="/admin/add-hospital" icon={<PlusCircle size={20} />} label="Add Hospital" />
    <SidebarLink to="/admin/manage-hospitals" icon={<Building size={20} />} label="Manage Hospitals" />
    <SidebarLink to="/admin/manage-doctors" icon={<User size={20} />} label="Manage Doctors" />
    <SidebarLink to="/admin/manage-patients" icon={<Users size={20} />} label="Manage Patients" />

  </SidebarContainer>
);