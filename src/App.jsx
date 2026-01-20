import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Import your Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAccountPage from './pages/doctor/Account';
import DoctorSchedulePage from './pages/doctor/Schedule';
import PatientAppointments from './pages/patient/Appointment';
import DoctorManagement from './pages/hospital/DoctorManagement';
import AddHospital from './pages/admin/AddHospital';
// Placeholder components for missing pages (Create these later)

const Placeholder = ({ title }) => <h1 className="text-2xl p-4">{title} Page</h1>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* Public Routes (Login, Signup, etc.) */}
          <Route path="/" element={<div className="p-10">Login Page Placeholder</div>} />

          {/* PROTECTED DASHBOARD ROUTES */}
          <Route element={<DashboardLayout />}>
            
            {/* PATIENT ROUTES */}
            <Route path="patient">
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="find-doctor" element={<Placeholder title="Find Doctor" />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="records" element={<Placeholder title="Medical Records" />} />
              <Route path="payments" element={<Placeholder title="Payments" />} />
            </Route>

            {/* HOSPITAL ROUTES */}
            <Route path="hospital">
              <Route path="dashboard" element={<HospitalDashboard />} />
              <Route path="doctors" element={<DoctorManagement />} />
              <Route path="staff" element={<Placeholder title="Manage Staff" />} />
            </Route>

            {/* DOCTOR ROUTES */}
            <Route path="doctor">
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="schedule" element={<DoctorSchedulePage />} />
              <Route path="video-conference" element={<Placeholder title="Video Conference" />} />
              <Route path="account" element={<DoctorAccountPage />} />
              <Route path="feedback" element={<Placeholder title="Feedback" />} />
              <Route path="notifications" element={<Placeholder title="Notification" />} />
              <Route path="messages" element={<Placeholder title="Messages" />} />
            </Route>

            {/* ADMIN ROUTES */}
            <Route path="admin">
              <Route path="dashboard" element={<Placeholder title="Admin Dashboard" />} />
              <Route path="add-hospital" element={<AddHospital />} />
            </Route>

          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import FindDoctor from "./pages/public/FindDoctor";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        
        {/* Navbar on ALL pages */}
        <Navbar />

        {/* Page content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-doctor" element={<FindDoctor />} />
          </Routes>
        </main>

        {/* Footer on ALL pages */}
        <Footer />

      </div>
    </BrowserRouter>
  );
}

export default App;
