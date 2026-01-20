import { useState } from "react";

function FindDoctor() {
  const [search, setSearch] = useState("");

  // Dummy data (replace with API later)
  const doctors = [
    {
      id: 1,
      name: "Dr. Kalpanee",
      specialization: "Cardiologist",
      hospital: "Asiri Hospital, Colombo",
      appointments: [
        { date: "Oct 26, 2025", time: "12.00pm" },
        { date: "Oct 29, 2025", time: "4.00pm" },
      ],
    },
    {
      id: 2,
      name: "Dr. Thushai",
      specialization: "Cardiologist",
      hospital: "Asiri Hospital, Colombo",
      appointments: [
        { date: "Oct 26, 2025", time: "12.00pm" },
        { date: "Oct 29, 2025", time: "4.00pm" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HERO + SEARCH */}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-400 text-white">
        {/* Left */}
        <div className="flex items-center justify-center p-10">
          <h1 className="text-3xl md:text-4xl font-bold leading-snug">
            Smart <br />
            channeling for <br />
            a healthier <br />
            tomorrow.
          </h1>
        </div>

        {/* Right */}
        <div className="p-10 bg-gray-500">
          <h2 className="text-2xl font-bold mb-4">Find Your Doctor</h2>

          <input
            type="text"
            placeholder="Search doctor name"
            className="w-full mb-3 p-2 rounded text-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select className="w-full mb-3 p-2 rounded text-black">
            <option>Specialization</option>
            <option>Cardiologist</option>
            <option>Dermatologist</option>
          </select>

          <select className="w-full mb-3 p-2 rounded text-black">
            <option>Hospital</option>
            <option>Asiri Hospital</option>
            <option>Lanka Hospital</option>
          </select>

          <input
            type="date"
            className="w-full mb-4 p-2 rounded text-black"
          />

          <button className="w-full bg-blue-300 text-black py-2 rounded hover:bg-blue-200">
            🔍 Search
          </button>
        </div>
      </div>

      {/* RESULTS */}
      <div className="p-10">
        <h2 className="text-xl font-bold mb-1">Available Doctors</h2>
        <p className="text-sm mb-4">
          Found {doctors.length} doctors matching your criteria
        </p>

        <div className="space-y-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-indigo-200 p-4 rounded-lg shadow-md"
            >
              <div className="flex items-start gap-4">
                {/* Image Placeholder */}
                <div className="w-20 h-20 bg-gray-300 rounded" />

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{doc.name}</h3>
                  <p className="text-sm">{doc.specialization}</p>
                  <p className="text-sm mb-2">{doc.hospital}</p>

                  <button className="text-sm bg-green-200 px-3 py-1 rounded">
                    View Profile
                  </button>
                </div>

                {/* Appointments */}
                <div className="space-y-2">
                  {doc.appointments.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span>
                        {a.date} – {a.time}
                      </span>
                      <button className="bg-blue-900 text-white px-3 py-1 rounded">
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FindDoctor;
