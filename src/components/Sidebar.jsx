import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Calendar, 
    FileText, 
    CreditCard, 
    Users, 
    LogOut, 
    Settings, 
    UserCog, 
    Microscope, 
    AlertCircle, 
    BarChart3, 
    Bell, 
    FileBarChart, 
    MessageSquare, 
    User, 
    MessageCircle, 
    Video, 
    Building, 
    PlusCircle,
    Activity,
    Shield,
    HeartPulse,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

// --- NAVIGATION CONTEXT FOR RESPONSIVE CLOSING ---
const SidebarNavContext = React.createContext({ onClose: () => {} });

// --- SECTION HEADER COMPONENT ---
const SidebarSection = ({ title }) => (
    <div className="px-3 pt-4 pb-1.5 first:pt-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400/80 select-none">
            {title}
        </p>
    </div>
);

// --- MODERN SIDEBAR LINK ---
const SidebarLink = ({ to, icon, label, badge, tag, exact = false }) => {
    const location = useLocation();
    const { onClose } = React.useContext(SidebarNavContext);
    
    // Precise active detection
    const isActive = exact 
        ? location.pathname === to 
        : location.pathname === to || (
            to !== '/' && 
            !['/patient/dashboard', '/doctor/dashboard', '/hospital/dashboard', '/admin/dashboard'].includes(to) && 
            location.pathname.startsWith(to)
        );

    const handleClick = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <Link
            to={to}
            onClick={handleClick}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 select-none ${
                isActive
                    ? 'bg-gradient-to-r from-teal-500/20 via-teal-500/10 to-transparent text-white font-semibold shadow-sm border-l-[3px] border-teal-400 pl-[9px]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
        >
            {/* Left Icon with Hover and Active Dynamics */}
            <div className="relative flex items-center justify-center shrink-0">
                <span className={`transition-all duration-200 ${
                    isActive 
                        ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]' 
                        : 'text-slate-400 group-hover:text-teal-300 group-hover:scale-110'
                }`}>
                    {icon}
                </span>

                {/* Pulsing Alert Beacon on Notification */}
                {badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                )}
            </div>

            {/* Label */}
            <span className="flex-1 truncate tracking-tight">{label}</span>

            {/* Notification Count Badge */}
            {badge > 0 && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-black tracking-tight bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-sm shadow-rose-500/40 animate-pulse">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}

            {/* Feature Tag (e.g., 'Live', '24/7') */}
            {tag && !badge && (
                <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-teal-500/15 text-teal-300 rounded border border-teal-500/30">
                    {tag}
                </span>
            )}

            {/* Active item small glow pip */}
            {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 ml-auto shrink-0 shadow-[0_0_6px_rgba(45,212,191,0.8)]" />
            )}
        </Link>
    );
};

// --- SIDEBAR CONTAINER ---
const SidebarContainer = ({ 
    children, 
    title = "CDCM Health", 
    portalTag = "Portal", 
    brandGradient = "from-teal-400 via-cyan-500 to-blue-500",
    icon: BrandIcon = Activity,
    mobileOpen = false,
    onClose = () => {}
}) => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const hospital = JSON.parse(localStorage.getItem("hospital") || "null");

    const displayName = user?.name || hospital?.name || 'Healthcare User';
    const roleLabel = user?.role || (hospital ? 'Hospital Facility' : 'User');
    const avatarSrc = user?.profileImage || hospital?.profileImage || null;

    // Determine the current user's role
    const effectiveRole = (
        user?.role ||
        localStorage.getItem("userRole") ||
        hospital?.role ||
        (location.pathname.startsWith("/doctor")
            ? "DOCTOR"
            : location.pathname.startsWith("/hospital")
            ? "HOSPITAL"
            : location.pathname.startsWith("/patient")
            ? "PATIENT"
            : "")
    )?.toUpperCase();

    // Role-based Settings route
    const settingsPath =
        effectiveRole === "PATIENT"
            ? "/patient/settings"
            : effectiveRole === "DOCTOR"
            ? "/doctor/settings"
            : effectiveRole === "HOSPITAL"
            ? "/hospital/settings"
            : "/settings";

    const profileRoute =
        effectiveRole === 'PATIENT'
            ? '/patient/settings'
            : effectiveRole === 'DOCTOR'
            ? '/doctor/settings'
            : effectiveRole === 'HOSPITAL'
            ? '/hospital/settings'
            : '/settings';

    const handleLogout = () => {
        localStorage.removeItem('hospital');
        logout();
    };

    return (
        <SidebarNavContext.Provider value={{ onClose }}>
            {/* Mobile Backdrop Overlay */}
            {mobileOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen w-64 shrink-0
                bg-gradient-to-b from-[#090e1a] via-[#0d1527] to-[#070b14] 
                text-slate-300 flex flex-col z-50 
                border-r border-slate-800/80 shadow-2xl select-none
                transition-transform duration-300 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                
                {/* Header: Brand Identity & Portal Pill */}
                <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Glowing Logo Icon */}
                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr ${brandGradient} shadow-md shadow-teal-500/20 shrink-0 text-white font-black`}>
                            <BrandIcon size={20} className="text-white drop-shadow-sm" />
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
                        </div>
                        
                        {/* Brand Name & Dynamic Role Tag */}
                        <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-base tracking-tight text-white leading-none truncate">
                                {title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase truncate">
                                    {portalTag}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl lg:hidden transition cursor-pointer shrink-0"
                        aria-label="Close Navigation Sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>

            {/* Network / System Status Indicator */}
            <div className="mx-3 my-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300">CDCM Cloud</span>
                </div>
                <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                    Live
                </span>
            </div>
            
            {/* Scrollable Navigation Tree */}
            <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-800/80 hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent">
                {children}
            </nav>
            
            {/* Modern User Profile & Sign Out Footer */}
<div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">

    {/* Settings */}
    <SidebarLink
        to={settingsPath}
        icon={<Settings size={16} />}
        label="Settings"
    />

    {/* Profile Widget */}
    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-center gap-2.5 mb-2 shadow-sm">
        <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-tr from-teal-500/20 to-blue-500/20 border border-teal-500/30 flex items-center justify-center">
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt={displayName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-xs font-black text-teal-300">
                        {displayName.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>

            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
        </div>

        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate leading-tight">
                {displayName}
            </p>

            <p className="text-[10px] font-medium text-slate-400 truncate capitalize mt-0.5">
                {roleLabel}
            </p>
        </div>

        <Link
            to={profileRoute}
            title="Profile & Settings"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
        >
            <Settings size={15} />
        </Link>
    </div>

    {/* Logout Button */}
    <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
    >
        <LogOut size={14} />
        <span>Sign Out</span>
    </button>
</div>
            </div>
        </aside>
        </SidebarNavContext.Provider>
    );
};

// ==========================================
// 1. PATIENT SIDEBAR
// ==========================================
export const PatientSidebar = (props) => {
    const { unreadCount } = useNotifications();
    return (
        <SidebarContainer 
            title="CDCM Health" 
            portalTag="Patient Portal"
            brandGradient="from-teal-400 via-cyan-500 to-blue-500"
            icon={HeartPulse}
            {...props}
        >
            <SidebarSection title="Main Navigation" />
            <SidebarLink to="/patient/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <SidebarLink to="/patient/appointments" icon={<Calendar size={18} />} label="My Appointments" />
            <SidebarLink to="/patient/medical-history" icon={<FileText size={18} />} label="Medical History" />

            <SidebarSection title="Care & Records" />
            <SidebarLink to="/patient/my-doctors" icon={<UserCog size={18} />} label="My Doctors" />
            <SidebarLink to="/patient/reports" icon={<FileBarChart size={18} />} label="Lab Reports" />
            <SidebarLink to="/patient/messages" icon={<MessageSquare size={18} />} label="Messages" />

            <SidebarSection title="Communication & Billing" />
            <SidebarLink to="/patient/notifications" icon={<Bell size={18} />} label="Notifications" badge={unreadCount} />
            <SidebarLink to="/patient/payment" icon={<CreditCard size={18} />} label="Payments" />
            <SidebarLink to="/patient/settings" icon={<Settings size={18} />} label="Settings" />
        </SidebarContainer>
    );
};

// ==========================================
// 2. DOCTOR SIDEBAR
// ==========================================
export const DoctorSidebar = (props) => {
    const { unreadCount } = useNotifications();
    return (
        <SidebarContainer 
            title="CDCM Health" 
            portalTag="Doctor Console"
            brandGradient="from-cyan-500 via-blue-500 to-indigo-500"
            icon={Activity}
            {...props}
        >
            <SidebarSection title="Clinical Overview" />
            <SidebarLink to="/doctor/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <SidebarLink to="/doctor/schedule" icon={<Calendar size={18} />} label="My Schedule" />

            <SidebarSection title="Patient Care" />
            <SidebarLink to="/doctor/mypatients" icon={<MessageCircle size={18} />} label="My Patients" />
            <SidebarLink to="/doctor/video-conference" icon={<Video size={18} />} label="Video Conference" tag="Live" />

            <SidebarSection title="Communications & Account" />
            <SidebarLink to="/doctor/messages" icon={<MessageSquare size={18} />} label="Messages" />
            <SidebarLink to="/doctor/notifications" icon={<Bell size={18} />} label="Notifications" badge={unreadCount} />
            <SidebarLink to="/doctor/account" icon={<User size={18} />} label="Doctor Profile" />
        </SidebarContainer>
    );
};

// ==========================================
// 3. HOSPITAL SIDEBAR
// ==========================================
export const HospitalSidebar = (props) => {
    const { unreadCount } = useNotifications();
    return (
        <SidebarContainer 
            title="CDCM Health" 
            portalTag="Hospital Hub"
            brandGradient="from-emerald-400 via-teal-500 to-cyan-500"
            icon={Building}
            {...props}
        >
            <SidebarSection title="Overview & Insights" />
            <SidebarLink to="/hospital/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <SidebarLink to="/hospital/analytics" icon={<BarChart3 size={18} />} label="Hospital Analytics" />

            <SidebarSection title="Patient & Scheduling" />
            <SidebarLink to="/hospital/patients" icon={<Users size={18} />} label="Patient Directory" />
            <SidebarLink to="/hospital/appointment" icon={<Calendar size={18} />} label="Appointments" />
            <SidebarLink to="/hospital/schedule" icon={<Calendar size={18} />} label="Doctor Schedules" />

            <SidebarSection title="Medical & Clinical Services" />
            <SidebarLink to="/hospital/doctors" icon={<UserCog size={18} />} label="Doctor Management" />
            <SidebarLink to="/hospital/laboratory" icon={<Microscope size={18} />} label="Laboratory Tests" />
            <SidebarLink to="/hospital/emergency" icon={<AlertCircle size={18} />} label="Emergency Unit" tag="24/7" />

            <SidebarSection title="System & Updates" />
            <SidebarLink to="/hospital/notifications" icon={<Bell size={18} />} label="Notifications" badge={unreadCount} />
        </SidebarContainer>
    );
};

// ==========================================
// 4. ADMIN SIDEBAR
// ==========================================
export const AdminSidebar = (props) => (
    <SidebarContainer 
        title="CDCMS Admin" 
        portalTag="Super Admin"
        brandGradient="from-purple-500 via-indigo-500 to-blue-500"
        icon={Shield}
        {...props}
    >
        <SidebarSection title="System Overview" />
        <SidebarLink to="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />

        <SidebarSection title="Management Directory" />
        <SidebarLink to="/admin/manage-hospitals" icon={<Building size={18} />} label="Hospital Network" />
        <SidebarLink to="/admin/manage-doctors" icon={<UserCog size={18} />} label="Doctor Registry" />
        <SidebarLink to="/admin/manage-patients" icon={<Users size={18} />} label="Patient Database" />

        <SidebarSection title="System Provisioning" />
        <SidebarLink to="/admin/add-hospital" icon={<PlusCircle size={18} />} label="Add New Hospital" />
    </SidebarContainer>
);