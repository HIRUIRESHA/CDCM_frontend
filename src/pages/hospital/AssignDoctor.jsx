import React, { useState, useEffect} from "react";
import { useAuth } from "../../context/AuthContext";

const AssignDoctor = () => {

  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {

  const loadDoctors = async () => {

    const res = await fetch(
      `http://localhost:8082/api/hospital/doctors/search?keyword=`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();
    setDoctors(data);

  };

  loadDoctors();

}, []);

  const handleSearch = async (value) => {

    setSearch(value);

    const res = await fetch(
      `http://localhost:8082/api/hospital/doctors/search?keyword=${value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();
    setDoctors(data);

  };

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
      alert("Assignment failed");
      return;
    }

    alert("Doctor assigned successfully");

    // remove doctor from current list
    setDoctors(prev => prev.filter(doc => doc.id !== doctorId));

  } catch (error) {
    console.error(error);
  }

};

  return (

    <div className="max-w-7xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">Assign Doctors</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search doctors..."
        className="border px-4 py-2 rounded-lg w-full"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {doctors.map(doc => (

          <div key={doc.id} className="p-6 bg-white rounded-xl border">

            <h3 className="font-bold">
              {doc.title} {doc.firstName} {doc.lastName}
            </h3>

            <p className="text-sm text-gray-500">
              {doc.specialization}
            </p>

            <button
              onClick={() => assignDoctor(doc.id)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Assign
            </button>

          </div>

        ))}

      </div>

    </div>

  );

};

export default AssignDoctor;