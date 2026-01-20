import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Adjust path if needed
import Footer from '../components/Footer'; // Adjust path if needed

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Navbar stays at the top */}
      <Navbar />

      {/* 2. Content changes based on the route (Home, Login, etc.) */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* 3. Footer stays at the bottom */}
      <Footer />
    </div>
  );
};

export default PublicLayout;