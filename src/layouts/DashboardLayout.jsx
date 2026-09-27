import React from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PatientSidebar, DoctorSidebar, HospitalSidebar, AdminSidebar } from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';

const DashboardLayout = () => {
    const { user } = useAuth();
    const hospital = JSON.parse(localStorage.getItem("hospital") || "null");
    const location = useLocation();

    // 1. Security Check: If no user is logged in, redirect to login
    if (!user && !hospital) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Role-Based Sidebar Selection
    const effectiveRole = user?.role?.toUpperCase() || (hospital ? 'HOSPITAL' : null);

    let SidebarComponent;
    switch (effectiveRole) {
        case 'PATIENT':
            SidebarComponent = PatientSidebar;
            break;
        case 'DOCTOR':
            SidebarComponent = DoctorSidebar;
            break;
        case 'HOSPITAL':
            SidebarComponent = HospitalSidebar;
            break;
        case 'ADMIN':
            SidebarComponent = AdminSidebar;
            break;
        default:
            return <div className="p-10 text-red-500">Error: Unauthorized Role</div>;
    }

    const displayName = user?.name || hospital?.name || 'User';

    // 3. Render the Layout
    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            {/* The specific sidebar based on role */}
            <SidebarComponent />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Modern Header with Notification Bell */}
                <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                            {effectiveRole || 'Portal'}
                        </span>
                        <h2 className="text-sm font-semibold text-slate-600 hidden sm:block">
                            Welcome back, <span className="font-bold text-slate-900">{displayName}</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3.5">
                        {/* Modern Notification Bell with Red Badge */}
                        <NotificationBell />

                        {/* User Profile Mini Badge */}
                        {user && (
                            <Link to="/profile" className="flex items-center gap-2 pl-3 border-l border-slate-200 hover:opacity-85 transition">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                                    <img
                                        src={user.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 hidden md:block">
                                    {displayName}
                                </span>
                            </Link>
                        )}
                    </div>
                </header>

                {/* The specific page content renders here */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;