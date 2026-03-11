import React from "react";
import { useNavigate } from "react-router-dom";

const DoctorManagement = () => {

  const navigate = useNavigate();

  return (

    <div className="max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">Doctor Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="p-6 bg-white rounded-xl border shadow">
          <h2 className="font-semibold text-lg mb-2">Assigned Doctors</h2>
          <p className="text-sm text-gray-500 mb-4">
            View doctors assigned to this hospital
          </p>

          <button
            onClick={() => navigate("/hospital/assigned-doctors")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            View Assigned Doctors
          </button>
        </div>

        <div className="p-6 bg-white rounded-xl border shadow">
          <h2 className="font-semibold text-lg mb-2">Assign Doctors</h2>
          <p className="text-sm text-gray-500 mb-4">
            Search registered doctors and assign them
          </p>

          <button
            onClick={() => navigate("/hospital/assign-doctor")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Assign Doctor
          </button>
        </div>

      </div>

    </div>
  );
};

export default DoctorManagement;