import React, { useState, useEffect } from 'react';
import { Search, Stethoscope, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DoctorManagement = () => {

  const { user } = useAuth();

  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [searchDoctors, setSearchDoctors] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  // ================= LOAD ASSIGNED DOCTORS =================
  useEffect(() => {

  if (!user || !token) return;

  if (user.role === "HOSPITAL") {

    fetch(`http://localhost:8082/api/hospital/doctors/hospital/${user.id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      if (!res.ok) {
        console.error("Failed loading assigned doctors:", res.status);
        return null;
      }
      return res.json();
    })
    .then(data => {
      if (data) setAssignedDoctors(data);
    })
    .catch(err => console.error(err));

  }

}, [user, token]);



  // ================= SEARCH REGISTERED DOCTORS =================
  const handleSearch = async (value) => {

    setSearch(value);

    if (value.trim() === "") {
      setSearchDoctors([]);
      return;
    }

    const res = await fetch(
      `http://localhost:8082/api/hospital/doctors/search?keyword=${value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      console.error("Search failed:", res.status);
      return;
    }

    const data = await res.json();
    setSearchDoctors(data);

  };



  // ================= ASSIGN DOCTOR =================
  const assignDoctor = async (doctorId) => {

    try {

      const res = await fetch(
        `http://localhost:8082/api/hospital/doctors/${doctorId}/assign/${user.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        console.error("Assign failed:", res.status);
        return;
      }

      alert("Doctor Assigned Successfully!");

      // reload assigned doctors
      const reload = await fetch(
        `http://localhost:8082/api/hospital/doctors/hospital/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!reload.ok) return;

      const data = await reload.json();
      setAssignedDoctors(data);

      // remove from search results
      setSearchDoctors(prev => prev.filter(d => d.id !== doctorId));

    } catch (error) {
      console.error(error);
      alert("Assignment failed");
    }

  };



  // ================= DOCTOR CARD =================
  const DoctorCard = (doctor, showAssign = false) => (

    <div
      key={doctor.id}
      className="bg-white rounded-xl border shadow-sm p-6 flex flex-col items-center text-center"
    >

      {/* Profile Image */}
      <div className="mb-4">
        <img
          src={
            doctor.profileImage
              ? doctor.profileImage
              : `https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}`
          }
          alt={doctor.firstName}
          className="w-20 h-20 rounded-full object-cover border-4 border-blue-50"
        />
      </div>

      {/* Name */}
      <h3 className="text-lg font-bold text-gray-900">
        {doctor.title} {doctor.firstName} {doctor.lastName}
      </h3>

      {/* Specialization */}
      <div className="flex items-center gap-1 text-blue-600 text-sm mt-1 mb-4">
        <Stethoscope size={14} />
        {doctor.specialization}
      </div>

      {/* Contact */}
      <div className="w-full space-y-2 border-t pt-4 text-sm text-gray-500">
        <div className="flex items-center gap-2 justify-center">
          <Mail size={16} />
          {doctor.email}
        </div>
        <div className="flex items-center gap-2 justify-center">
          <Phone size={16} />
          {doctor.phone}
        </div>
      </div>

      {/* Assign Button */}
      {showAssign && (
        <div className="w-full mt-6">
          <button
            onClick={() => assignDoctor(doctor.id)}
            className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Assign
          </button>
        </div>
      )}

    </div>

  );



  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
        <p className="text-gray-500 text-sm">
          View assigned doctors and search new specialists.
        </p>
      </div>


      {/* Search */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search doctors by name or specialization..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>



      {/* Assigned Doctors */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Assigned Doctors</h2>

        {assignedDoctors.length === 0 ? (
          <p className="text-gray-500">No doctors assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedDoctors.map((doctor) => DoctorCard(doctor))}
          </div>
        )}
      </div>



      {/* Search Results */}
      {searchDoctors.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchDoctors.map((doctor) => DoctorCard(doctor, true))}
          </div>

        </div>
      )}

    </div>
  );

};

export default DoctorManagement;