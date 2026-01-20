import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout'; // <--- Import the new layout

// Public Pages
import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import FindDoctor from "./pages/public/FindDoctor";

// Private Dashboard Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/Appointment';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import DoctorManagement from './pages/hospital/DoctorManagement';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAccountPage from './pages/doctor/Account';
import DoctorSchedulePage from './pages/doctor/Schedule';
import AddHospital from './pages/admin/AddHospital';

// Placeholder for missing pages
const Placeholder = ({ title }) => <h1 className="text-2xl p-4">{title} Page</h1>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* GROUP 1: PUBLIC ROUTES (Uses Navbar & Footer) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-doctor" element={<FindDoctor />} />
          </Route>


          {/* GROUP 2: PROTECTED DASHBOARD ROUTES (Uses Sidebar) */}
          <Route element={<DashboardLayout />}>
            
            {/* PATIENT */}
            <Route path="patient">
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="find-doctor" element={<Placeholder title="Find Doctor" />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="records" element={<Placeholder title="Medical Records" />} />
              <Route path="payments" element={<Placeholder title="Payments" />} />
            </Route>

            {/* HOSPITAL */}
            <Route path="hospital">
              <Route path="dashboard" element={<HospitalDashboard />} />
              <Route path="doctors" element={<DoctorManagement />} />
              <Route path="staff" element={<Placeholder title="Manage Staff" />} />
            </Route>

            {/* DOCTOR */}
            <Route path="doctor">
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="schedule" element={<DoctorSchedulePage />} />
              <Route path="account" element={<DoctorAccountPage />} />
              <Route path="video-conference" element={<Placeholder title="Video Conference" />} />
              <Route path="feedback" element={<Placeholder title="Feedback" />} />
              <Route path="notifications" element={<Placeholder title="Notifications" />} />
              <Route path="messages" element={<Placeholder title="Messages" />} />
            </Route>

            {/* ADMIN */}
            <Route path="admin">
              <Route path="dashboard" element={<Placeholder title="Admin Dashboard" />} />
              <Route path="add-hospital" element={<AddHospital />} />
            </Route>

          </Route>

          {/* Catch-all: Redirect unknown links to Home */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;