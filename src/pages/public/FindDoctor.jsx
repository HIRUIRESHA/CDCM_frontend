import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function FindDoctor() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  // New state for specialization and hospital selections
  const [selectedSpec, setSelectedSpec] = useState("");
  const [selectedHosp, setSelectedHosp] = useState("");
  
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, specRes, hospRes] = await Promise.all([
          fetch("http://localhost:8082/api/hospital/doctors/assigned-all"),
          fetch("http://localhost:8082/api/hospital/doctors/specializations"),
          fetch("http://localhost:8082/api/hospital/doctors/all-hospitals")
        ]);

        const docs = await docRes.json();
        const specs = await specRes.json();
        const hosps = await hospRes.json();

        setDoctors(Array.isArray(docs) ? docs : []);
        setSpecializations(Array.isArray(specs) ? specs : []);
        setHospitals(Array.isArray(hosps) ? hosps : []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Updated Filter logic to handle Name, Specialization, and Hospital ID
  const filteredDoctors = doctors.filter((doc) => {
    // 1. Filter by Name
    const fullName = `${doc.title || ""} ${doc.firstName || ""} ${doc.lastName || ""}`.toLowerCase();
    const matchesName = fullName.includes(search.toLowerCase());

    // 2. Filter by Specialization
    const matchesSpec = selectedSpec === "" || doc.specialization === selectedSpec;

    // 3. Filter by Hospital (Checking if the selected hospital ID is in the doctor's hospital list)
    const matchesHosp = selectedHosp === "" || (doc.hospitals && doc.hospitals.includes(selectedHosp));

    return matchesName && matchesSpec && matchesHosp;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-400 text-white">
        <div className="flex items-center justify-center p-10">
          <h1 className="text-3xl md:text-4xl font-bold leading-snug">
            Smart <br /> channeling for <br /> a healthier <br /> tomorrow.
          </h1>
        </div>

        <div className="p-10 bg-gray-500">
          <h2 className="text-2xl font-bold mb-4">Find Your Doctor</h2>

          <input
            id="doctor-name-search"
            name="doctorSearch"
            type="text"
            placeholder="Search doctor name"
            className="w-full mb-3 p-2 rounded text-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* DYNAMIC SPECIALIZATION DROPDOWN with value binding */}
          <select 
            id="spec-select" 
            name="specialization" 
            className="w-full mb-3 p-2 rounded text-black"
            value={selectedSpec}
            onChange={(e) => setSelectedSpec(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((spec, index) => (
              <option key={index} value={spec}>{spec}</option>
            ))}
          </select>
          
          {/* DYNAMIC HOSPITAL DROPDOWN with value binding */}
          <select 
            id="hosp-select" 
            name="hospital" 
            className="w-full mb-3 p-2 rounded text-black"
            value={selectedHosp}
            onChange={(e) => setSelectedHosp(e.target.value)}
          >
            <option value="">All Hospitals</option>
            {hospitals.map((hosp) => (
              <option key={hosp.id} value={hosp.id}>{hosp.name}</option>
            ))}
          </select>

          <input
            id="appointment-date-picker"
            name="appointmentDate"
            type="date"
            className="w-full mb-4 p-2 rounded text-black"
          />

          <button className="w-full bg-blue-300 text-black py-2 rounded hover:bg-blue-200">
            🔍 Search
          </button>
        </div>
      </div>

      <div className="p-10">
        <h2 className="text-xl font-bold mb-1">Available Doctors</h2>
        
        {loading ? (
          <p className="text-sm">Loading doctors...</p>
        ) : (
          <>
            <p className="text-sm mb-4">
              Found {filteredDoctors.length} doctors matching your criteria
            </p>

            <div className="space-y-6">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc) => (
                  <div key={doc.id} className="bg-indigo-200 p-4 rounded-lg shadow-md">
                    <div className="flex items-start gap-4">
                      <img 
                        src={doc.profileImage || "https://via.placeholder.com/80"} 
                        alt="Doctor" 
                        className="w-20 h-20 bg-gray-300 rounded object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="font-bold text-lg">
                          {doc.title} {doc.firstName} {doc.lastName}
                        </h3>
                        <p className="text-sm">{doc.specialization}</p>
  
                        <div className="text-sm mb-2">
                          {doc.hospitals && doc.hospitals.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {doc.hospitals.map((hospitalId) => {
                                const hospitalObj = hospitals.find((h) => h.id === hospitalId);
                                return (
                                  <span key={hospitalId} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                                    {hospitalObj ? hospitalObj.name : "Unknown Hospital"}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">Independent</p>
                          )}
                        </div>

                        <button 
  onClick={() => navigate(`/doctor/account/${doc.id}`)}
  className="text-sm bg-green-200 px-3 py-1 rounded hover:bg-green-300"
>
  View Profile
</button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium">Contact</p>
                        <p className="text-xs text-gray-700">{doc.phone}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No doctors match your current filters.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FindDoctor;