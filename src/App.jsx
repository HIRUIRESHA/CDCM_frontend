import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';

// Public Pages
import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import FindDoctor from "./pages/public/FindDoctor";
import Profile from "./pages/Profile"; // <--- 1. IMPORT THIS

// Private Dashboard Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/Appointment';
import MedicalHistory from './pages/patient/MedicalHistory';
import Messages from './pages/patient/Messages';
import MyDoctors from './pages/patient/MyDoctors';
import DoctorFeedback from './pages/patient/DoctorFeedback';
import Notification from './pages/patient/Notification';
import Payment from './pages/patient/Payment';
import Reports from './pages/patient/Reports';
import Settings from './pages/patient/Settings';
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";



import HospitalDashboard from './pages/hospital/HospitalDashboard';
import AssignedDoctors from './pages/hospital/AssignedDoctors';
import AssignDoctor from './pages/hospital/AssignDoctor';
import Appointment from './pages/hospital/Appointment';
import Analytics from './pages/hospital/Analytics';
import Emergency from './pages/hospital/Emergency';
import Laboratory from './pages/hospital/Laboratory';
import Notifications from './pages/hospital/Notifications';
import PatientManagement from './pages/hospital/patientManagement';
import Schedule from './pages/hospital/Schedule';
import AddSchedule from './pages/hospital/AddSchedule';
import UploadReport from './pages/hospital/UploadReport';
import AddLabTest from './pages/hospital/AddLabTest';

import DoctorManagement from './pages/hospital/DoctorManagement';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAccountPage from './pages/doctor/Account';
import DoctorSchedulePage from './pages/doctor/Schedule';
import MyPatientsPage from './pages/doctor/MyPatients';
import DoctorMessagesPage from './pages/doctor/Messages';
import DoctorNotificationsPage from './pages/doctor/Notifications';
import DoctorVideoConferencePage from './pages/doctor/VideoConference';
import UpdateMedicalHistory from "./pages/doctor/UpdateMedicalHistory";

import AddHospital from './pages/admin/AddHospital';
import ManageHospitals from './pages/admin/ManageHospitals';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import Dashboard from './pages/admin/Dashboard';


// Placeholder for missing pages
const Placeholder = ({ title }) => <h1 className="text-2xl p-4">{title} Page</h1>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* GROUP 1: PUBLIC ROUTES */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/find-doctor" element={<FindDoctor />} />
             <Route path="/forgot-password" element={<ForgotPassword />} />
             <Route path="/reset-password/:token" element={<ResetPassword />} />
             <Route path="/doctor/account/:id" element={<DoctorAccountPage />} />
             

          </Route>


          {/* GROUP 2: PROTECTED DASHBOARD ROUTES */}
          <Route path="/upload-report/:id" element={<UploadReport />} />
          <Route element={<DashboardLayout />}>
            
            {/* 2. ADD PROFILE ROUTE HERE */}
            <Route path="/profile" element={<Profile />} />

            {/* PATIENT */}
           <Route path="patient">
             <Route path="dashboard" element={<PatientDashboard />} />
             <Route path="find-doctor" element={<Placeholder title="Find Doctor" />} />
             <Route path="appointments" element={<PatientAppointments />} />
             <Route path="records" element={<Placeholder title="Medical Records" />} />
             <Route path="payments" element={<Payment />} />
             <Route path="medical-history" element={<MedicalHistory />} />
             <Route path="messages" element={<Messages />} />
             <Route path="my-doctors" element={<MyDoctors />} />
             <Route path="add-feedback" element={<DoctorFeedback />} />
             <Route path="notifications" element={<Notification />} />  
             <Route path="reports" element={<Reports />} />
             <Route path="settings" element={<Settings />} />
            
           </Route>


            {/* HOSPITAL */}
            <Route path="hospital">
              <Route path="dashboard" element={<HospitalDashboard />} />
              <Route path="doctors" element={<DoctorManagement />} />
              <Route path="assigned-doctors" element={<AssignedDoctors />} />
              <Route path="assign-doctor" element={<AssignDoctor />} />
              <Route path="staff" element={<Placeholder title="Manage Staff" />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="appointment" element={<Appointment />} />
              <Route path="emergency" element={<Emergency />} />
              <Route path="laboratory" element={<Laboratory />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="patients" element={<PatientManagement />} />
              <Route path="schedule" element={<Schedule />} />
            <Route path="schedule/add" element={<AddSchedule />} />
            <Route path="addLabTest" element={<AddLabTest />} />
            <Route path="upload-report/:id" element={<UploadReport />} />
            </Route>

           <Route path="doctor">
             <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="schedule" element={<DoctorSchedulePage />} />
              <Route path="account" element={<DoctorAccountPage />} />
              <Route path="video-conference" element={<DoctorVideoConferencePage />} />
              <Route path="mypatients" element={<MyPatientsPage />} />
              <Route path="notifications" element={<DoctorNotificationsPage />} />
              <Route path="messages" element={<DoctorMessagesPage />} />
              <Route path="update-history/:patientId" element={<UpdateMedicalHistory />} />
          </Route>


            {/* ADMIN */}
            <Route path="admin">
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="add-hospital" element={<AddHospital />} />
              <Route path="manage-hospitals" element={<ManageHospitals />} />
              <Route path="manage-doctors" element={<ManageDoctors />} />
              <Route path="manage-patients" element={<ManagePatients />} />
            </Route>

          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;