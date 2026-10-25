import React, { useState, useEffect} from "react";
import { useAuth } from "../../context/AuthContext";
import { showSuccess, showError, showConfirm } from "../../utils/alert";

const AssignDoctor = () => {

  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);

  const hospitalId = user?.id;

  const filterAvailableDoctors = (doctorList, currentHospitalId) => {
    if (!Array.isArray(doctorList) || !currentHospitalId) {
      return [];
    }

    return doctorList.filter((doc) => {
      // If doctor has no hospitals array or it is empty, doctor is available
      if (!doc || !Array.isArray(doc.hospitals) || doc.hospitals.length === 0) {
        return true;
      }

      // Check if already assigned to the currently authenticated hospital
      const isAssignedToCurrent = doc.hospitals.some(
        (hId) => String(hId) === String(currentHospitalId)
      );

      return !isAssignedToCurrent;
    });
  };

  useEffect(() => {
    if (!hospitalId) return;

    const loadDoctors = async () => {
      try {
        const res = await fetch(
          `https://cdcm-backend.onrender.com/api/hospital/doctors/search?keyword=`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load doctors");
        }

        const data = await res.json();
        setDoctors(filterAvailableDoctors(data, hospitalId));
      } catch (error) {
        console.error("Error loading doctors:", error);
      }
    };

    loadDoctors();
  }, [hospitalId, token]);

  const handleSearch = async (value) => {
    setSearch(value);

    if (!hospitalId) return;

    try {
      const res = await fetch(
        `https://cdcm-backend.onrender.com/api/hospital/doctors/search?keyword=${encodeURIComponent(value)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to search doctors");
      }

      const data = await res.json();
      setDoctors(filterAvailableDoctors(data, hospitalId));
    } catch (error) {
      console.error("Error searching doctors:", error);
    }
  };

  const assignDoctor = async (doctorId) => {
    if (!hospitalId) {
      await showError("Hospital information not found. Please log in again.");
      return;
    }

    const confirmed = await showConfirm(
      "Do you want to assign this doctor to your hospital?",
      "Assign Doctor?",
      "Yes, Assign"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `https://cdcm-backend.onrender.com/api/hospital/doctors/${doctorId}/assign/${hospitalId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        await showError(
          "Failed to assign doctor."
        );
        return;
      }

      setDoctors((prev) =>
        prev.filter((doc) => doc.id !== doctorId)
      );

      await showSuccess(
        "Doctor assigned successfully!"
      );

    } catch (error) {
      console.error(error);

      await showError(
        "Failed to assign doctor. Please try again."
      );
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