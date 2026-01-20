import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PatientSidebar, DoctorSidebar, HospitalSidebar, AdminSidebar } from '../components/Sidebar';

const DashboardLayout = () => {
    const { user } = useAuth();
    const location = useLocation();

    // 1. Security Check: If no user is logged in, redirect to login
    if (!user) {
        // Save the current location they were trying to go to, so we can send them back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Role-Based Sidebar Selection
    let SidebarComponent;
    switch (user.role) {
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
            // Fallback for unknown roles or errors
            return <div className="p-10 text-red-500">Error: Unauthorized Role</div>;
    }

    // 3. Render the Layout
    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            {/* The specific sidebar based on role */}
            <SidebarComponent />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Optional: You can add a top Navbar here if you want one */}
                {/* <Navbar user={user} /> */}

                {/* The specific page content renders here */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;