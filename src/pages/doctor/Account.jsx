import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2, User } from 'lucide-react';

const DoctorAccountPage = () => {
  const [qualificationsOpen, setQualificationsOpen] = useState(true);
  const [experienceOpen, setExperienceOpen] = useState(true);
  const [hospitalsOpen, setHospitalsOpen] = useState(true);

  const doctorInfo = {
    name: "Prof. Jayamini Edirisinghe",
    specialty: "Dermatologist",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    qualifications: [
      "MBBS - Bachelor of Medicine and Bachelor of Surgery",
      "MD / MSc in Dermatology, Venereology & Leprosy",
      "Diploma in Dermatology",
      "Specialized in Cosmetic & Clinical Dermatology",
      "Certified in Aesthetic Procedures (Laser, Botox, Fillers)",
      "Fellowship in Dermatologic Surgery / Cosmetology",
      "Member of Sri Lanka College of Dermatologists / American Academy of Dermatology"
    ],
    experience: "over 5 years in Dermatology practice",
    hospitals: [
      "Asiri Hospital Galle",
      "Co-Operative Hospital Matara",
      "Nawaloka Hospital Colombo"
    ]
  };

  const CollapsibleSection = ({ title, isOpen, setIsOpen, children }) => (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-between transition-colors"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="mt-3 bg-white p-4 rounded-lg border border-gray-200">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Profile Icon */}
      <div className="flex justify-end mb-6">
        <div className="bg-gray-800 p-3 rounded-full">
          <User size={24} className="text-white" />
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Doctor Info Header */}
        <div className="bg-[#2d3e7a] text-white text-center py-6">
          <h1 className="text-2xl font-bold">{doctorInfo.name}</h1>
          <p className="text-lg mt-1">{doctorInfo.specialty}</p>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Image */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <img
                  src={doctorInfo.image}
                  alt={doctorInfo.name}
                  className="w-full rounded-lg shadow-md object-cover aspect-square"
                />
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2">
              {/* Qualifications Section */}
              <CollapsibleSection
                title="Qualifications"
                isOpen={qualificationsOpen}
                setIsOpen={setQualificationsOpen}
              >
                <ul className="space-y-2">
                  {doctorInfo.qualifications.map((qual, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-[#2d3e7a] mr-2 mt-1">•</span>
                      <span className="text-gray-700 text-sm">{qual}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>

              {/* Experience Section */}
              <CollapsibleSection
                title="Experience"
                isOpen={experienceOpen}
                setIsOpen={setExperienceOpen}
              >
                <p className="text-gray-700">{doctorInfo.experience}</p>
              </CollapsibleSection>

              {/* Working Hospitals Section */}
              <CollapsibleSection
                title="Working Hospitals"
                isOpen={hospitalsOpen}
                setIsOpen={setHospitalsOpen}
              >
                <ul className="space-y-2">
                  {doctorInfo.hospitals.map((hospital, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-[#2d3e7a] mr-2 mt-1">•</span>
                      <span className="text-gray-700">{hospital}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Edit size={20} />
                  <span>Edit Account</span>
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Trash2 size={20} />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAccountPage;