import React, { useState, useEffect } from 'react';
import { 
  Search, User, Mail, Phone, Calendar, MapPin, 
  ChevronLeft, ChevronRight, Eye, X, Loader, AlertCircle,
  UserCheck, UserX, FileText, Stethoscope, Clock, Activity,
  Calendar as CalendarIcon, FlaskConical, History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientManagement = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [labTests, setLabTests] = useState([]);
const [labLoading, setLabLoading] = useState(false);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const hospitalData = JSON.parse(localStorage.getItem('hospital'));
const hospitalId = hospitalData?.id;
const hospitalName = hospitalData?.name || 'Hospital';
  // Fetch patients with appointments for this hospital
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`http://localhost:8082/api/hospital/patients/hospital/${hospitalId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patients: ${response.status}`);
      }

      const data = await response.json();
      console.log('Patients data:', data);
      setPatients(data);
      setFilteredPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to patient details page
  const handleViewProfile = (patient) => {
    navigate(`/patient/${patient.id}`, { state: { patient } });
  };

  // Show appointment history modal
  const handleViewAppointments = (patient) => {
    setSelectedPatient(patient);
    setShowAppointmentModal(true);
  };

  const fetchLabTests = async (patientId) => {
  try {
    setLabLoading(true);

    const res = await fetch(
      `http://localhost:8082/api/lab/patient/${patientId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();
    console.log("Lab tests:", data);

    setLabTests(data);

  } catch (err) {
    console.error("Lab fetch error:", err);
  } finally {
    setLabLoading(false);
  }
};

  // Show laboratory history modal (to be implemented later)
  const handleViewLaboratory = (patient) => {
  setSelectedPatient(patient);
  setShowLabModal(true);
  fetchLabTests(patient.id); // 
};

  

  // Filter patients
  useEffect(() => {
    if (!patients.length) return;
    
    let filtered = [...patients];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.patientName?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.contactNumber?.includes(term)
      );
    }
    
    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [searchTerm, patients]);

  // Initial load 
  useEffect(() => {
    if (token ) {
      fetchPatients();
    } else {
      setError('Please login as a hospital administrator');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  // Get last visit date from appointments
  const getLastVisit = (appointments) => {
    if (!appointments || appointments.length === 0) return 'No visits';
    const dates = appointments.map(apt => new Date(apt.date));
    const latest = new Date(Math.max(...dates));
    return latest.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-500 text-sm">
            {hospitalName} | {filteredPatients.length} patients found
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Patient Cards - Matching Figma Design */}
      <div className="space-y-4">
        {currentPatients.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <p className="text-gray-500">No patients found</p>
          </div>
        ) : (
          currentPatients.map((patient) => (
            <div key={patient.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {patient.patientName?.charAt(0) || 'P'}
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 
                        onClick={() => handleViewProfile(patient)}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {patient.patientName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {patient.gender === 'Female' ? '👩' : '👨'} {patient.gender}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Patient ID:</span> {patient.patientId || patient.id?.slice(-5)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Phone size={14} />
                        <span>{patient.contactNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail size={14} />
                        <span>{patient.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>DOB: {patient.dateOfBirth || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0">
                    <div className="space-y-2">
                      <div className="text-right text-sm text-gray-500">
                        <span className="font-medium">Last Visit:</span> {getLastVisit(patient.appointments)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewAppointments(patient)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
                        >
                          <History size={16} />
                          Appointment History
                        </button>
                        <button
                          onClick={() => handleViewLaboratory(patient)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                        >
                          <FlaskConical size={16} />
                          Laboratory
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Appointment History Modal */}
      {showAppointmentModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Appointment History</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedPatient.patientName} | {selectedPatient.contactNumber}
                </p>
              </div>
              <button 
                onClick={() => setShowAppointmentModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedPatient.appointments?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Visits</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedPatient.appointments?.filter(a => a.status === 'COMPLETED').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedPatient.appointments?.filter(a => a.status === 'BOOKED').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(selectedPatient.appointments?.map(a => a.doctorName)).size || 0}
                  </div>
                  <div className="text-sm text-gray-600">Doctors Visited</div>
                </div>
              </div>

              {/* Appointments Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Details</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedPatient.appointments?.map((apt, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {apt.appointmentNumber || `A-${String(idx + 1).padStart(4, '0')}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{apt.doctorName}</div>
                          <div className="text-xs text-gray-500">{apt.doctorSpecialization || 'General'}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{apt.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{apt.time}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {apt.status || 'BOOKED'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-green-600">Paid</span>
                        </td>
                      </tr>
                    ))}
                    {(!selectedPatient.appointments || selectedPatient.appointments.length === 0) && (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No appointment history
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LABORATORY MODAL */}
{showLabModal && selectedPatient && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    
    <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">

      {/* HEADER */}
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Laboratory History</h2>
          <p className="text-sm text-gray-500">
            {selectedPatient.patientName} | {selectedPatient.contactNumber}
          </p>
        </div>

        <button
          onClick={() => setShowLabModal(false)}
          className="text-gray-400 hover:text-red-500 text-xl"
        >
          ✕
        </button>
      </div>

      {/* CONTENT (SCROLLABLE) */}
      <div className="p-6 overflow-y-auto flex-1">

        {labLoading ? (
          <p className="text-center text-gray-500">Loading...</p>

        ) : labTests.length === 0 ? (
          <p className="text-center text-gray-500">No lab tests found</p>

        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

              <div className="bg-gray-100 p-4 rounded-lg text-center shadow">
                <p className="text-sm text-gray-500">Total Tests</p>
                <p className="text-xl font-bold">{labTests.length}</p>
              </div>

              <div className="bg-green-100 p-4 rounded-lg text-center shadow">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-xl font-bold text-green-700">
                  {labTests.filter(t => t.status === "Completed").length}
                </p>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg text-center shadow">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold text-yellow-700">
                  {labTests.filter(t => t.status !== "Completed").length}
                </p>
              </div>

              <div className="bg-purple-100 p-4 rounded-lg text-center shadow">
                <p className="text-sm text-gray-500">Reports</p>
                <p className="text-xl font-bold text-purple-700">
                  {labTests.filter(t => t.reportStatus === "Uploaded").length}
                </p>
              </div>

            </div>

            {/* TABLE */}
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">

                <thead className="bg-blue-500 text-white sticky top-0">
                  <tr>
                    <th className="p-3">Test ID</th>
                    <th className="p-3">Test Details</th>
                    <th className="p-3">Requested Date</th>
                    <th className="p-3">Completed Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Report</th>
                  </tr>
                </thead>

                <tbody>
                  {labTests.map((test, index) => (
                    <tr key={test.id} className="border-t text-center">

                      <td className="p-3">A-{index + 1000}</td>

                      <td className="p-3">{test.testType}</td>

                      <td className="p-3">{test.requestedDate || "-"}</td>

                      <td className="p-3">
                        {test.status === "Completed" ? test.testDate : "-"}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-white text-xs ${
                          test.status === "Completed"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}>
                          {test.status}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-white text-xs ${
                          test.paid ? "bg-green-500" : "bg-gray-500"
                        }`}>
                          {test.paid ? "Paid" : "Unpaid"}
                        </span>
                      </td>

                      <td className="p-3">
                      {test.reportUrl ? (
                        <a
                          href={test.reportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">Not Available</span>
                      )}
                     </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </>
        )}

      </div>

      {/* FOOTER */}
      <div className="p-4 border-t flex justify-end">
        <button
          onClick={() => setShowLabModal(false)}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
};

export default PatientManagement;