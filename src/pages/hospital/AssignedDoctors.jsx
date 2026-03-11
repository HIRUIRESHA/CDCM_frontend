import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const AssignedDoctors = () => {

  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {

    if (!user) return;

    fetch(`http://localhost:8082/api/hospital/doctors/hospital/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setDoctors(data));

  }, [user]);

  const removeDoctor = async (doctorId) => {

  try {

    const res = await fetch(
      `http://localhost:8082/api/hospital/doctors/${doctorId}/remove/${user.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      alert("Failed to remove doctor");
      return;
    }

    alert("Doctor removed successfully");

    // update UI
    setDoctors(prev => prev.filter(doc => doc.id !== doctorId));

  } catch (error) {
    console.error(error);
  }

};

  return (

    <div className="max-w-7xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Assigned Doctors
      </h1>

      {doctors.length === 0 ? (
        <p>No doctors assigned yet.</p>
      ) : (
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
  onClick={() => removeDoctor(doc.id)}
  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg"
>
  Remove
</button>

            </div>

          ))}

        </div>
      )}

    </div>

  );

};

export default AssignedDoctors;