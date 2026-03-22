import { useEffect, useState } from "react";
import {
  getPatients,
  getTestCategories,
  addLabTest,
  getAllLabTests,
  updateLabTest,
  deleteLabTest 
} from "../../api/labApi";
import { useNavigate } from "react-router-dom";

export default function AddLabTest({ onBack }) {
  const hospitalId = localStorage.getItem("hospitalId");
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [labTests, setLabTests] = useState([]);
  
  // New States for Search and Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // New States for Searchable Selection in Form
  const [patientSearch, setPatientSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    email: "",
    contactNumber: "",
    testType: "",
    price: "",
    testDate: "",
    requestedDate: ""
  });

  useEffect(() => {
    loadPatients();
    loadCategories();
    loadLabTests();
  }, []);

  const loadPatients = async () => {
    const res = await getPatients();
    setPatients(res.data);
  };

  const loadCategories = async () => {
    const res = await getTestCategories(hospitalId);
    setCategories(res.data);
  };

  const loadLabTests = async () => {
    const res = await getAllLabTests();
    setLabTests(res.data);
  };

  // Search logic for Patient selection
  const selectPatient = (p) => {
    setForm({
      ...form,
      patientId: p.id,
      patientName: `${p.firstName} ${p.lastName}`,
      email: p.email,
      contactNumber: p.contactNumber
    });
    setPatientSearch(`${p.firstName} ${p.lastName}`);
    setShowPatientList(false);
  };

  // Search logic for Category selection
  const selectCategory = (c) => {
    setForm({
      ...form,
      testType: c.testName,
      price: c.price
    });
    setCategorySearch(c.testName);
    setShowCategoryList(false);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    await addLabTest({
      patientId: form.patientId,
      testType: form.testType,
      price: form.price,
      testDate: form.testDate,
      requestedDate: form.requestedDate,
      status: "Pending"
    });

    setForm({
      patientId: "",
      patientName: "",
      email: "",
      contactNumber: "",
      testType: "",
      price: "",
      testDate: "",
      requestedDate: ""
    });
    setPatientSearch("");
    setCategorySearch("");

    loadLabTests();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLabTests(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      await updateLabTest(id, { status: newStatus });
    } catch (error) {
      loadLabTests();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      await deleteLabTest(id);
      loadLabTests();
    }
  };

  const getPatient = (id) => {
    return patients.find(p => p.id == id);
  };

  const counts = {
    all: labTests.length,
    pending: labTests.filter(t => t.status === "Pending").length,
    inProgress: labTests.filter(t => t.status === "In Progress").length,
    completed: labTests.filter(t => t.status === "Completed").length,
  };

  const filteredTests = labTests.filter(t => {
    const p = getPatient(t.patientId);
    const matchesSearch = 
      p?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.testType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-20 font-sans">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"> ← </button>
          <div className="text-center">
            <h2 className="text-xl font-bold">Laboratory Management</h2>
            <p className="text-xs text-slate-500">Register and monitor lab tests</p>
          </div>
          <div className="flex gap-2">
             <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-100">Pending: {counts.pending}</div>
             <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100">In Progress: {counts.inProgress}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col gap-8">
        {/* FORM SECTION */}
        <div className="w-full">
          <div className="bg-white p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-6 text-slate-800 border-l-4 border-blue-600 pl-4">Add New Test Request</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Patient Searchable Selection */}
              <div className="space-y-4 relative">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search Patient Name..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setShowPatientList(true);
                    }}
                    onFocus={() => setShowPatientList(true)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-white font-medium"
                  />
                  {showPatientList && (
                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-2xl z-50 max-h-48 overflow-y-auto">
                      {patients.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase())).map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => selectPatient(p)}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 text-sm"
                        >
                          <div className="font-bold">{p.firstName} {p.lastName}</div>
                          <div className="text-[10px] text-slate-400">ID: P-{p.id}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input value={form.patientName} placeholder="Patient Name" readOnly className="w-full p-3 border border-slate-100 rounded-xl bg-slate-50 text-slate-500 outline-none" />
              </div>

              <div className="space-y-4">
                <input value={form.email} placeholder="Email Address" readOnly className="w-full p-3 border border-slate-100 rounded-xl bg-slate-50 text-slate-500 outline-none" />
                <input value={form.contactNumber} placeholder="Contact Number" readOnly className="w-full p-3 border border-slate-100 rounded-xl bg-slate-50 text-slate-500 outline-none" />
              </div>

              {/* Category Searchable Selection */}
              <div className="space-y-4 relative">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search Test Type..."
                    value={categorySearch}
                    onChange={(e) => {
                      setCategorySearch(e.target.value);
                      setShowCategoryList(true);
                    }}
                    onFocus={() => setShowCategoryList(true)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-white font-medium"
                  />
                  {showCategoryList && (
                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-2xl z-50 max-h-48 overflow-y-auto">
                      {categories.filter(c => c.testName.toLowerCase().includes(categorySearch.toLowerCase())).map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => selectCategory(c)}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 text-sm"
                        >
                          <div className="font-bold">{c.testName}</div>
                          <div className="text-[10px] text-blue-500">Rs {c.price}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-bold">Rs</span>
                  <input value={form.price} placeholder="0.00" readOnly className="w-full p-3 pl-10 border border-slate-100 rounded-xl bg-blue-50/50 text-blue-700 font-bold outline-none" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Test Date</label>
                    <input type="date" name="testDate" value={form.testDate} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-xl outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Req. Date</label>
                    <input type="date" name="requestedDate" value={form.requestedDate} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-xl outline-none text-sm" />
                  </div>
                </div>
                <button onClick={handleSubmit} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95"> Add Test Record </button>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
              <div className="flex gap-2">
                {["All", "Pending", "In Progress", "Completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      statusFilter === status 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {status} ({status === "All" ? counts.all : counts[status.charAt(0).toLowerCase() + status.slice(1).replace(" ", "")]})
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search patient or test..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="p-5">Test ID</th>
                  <th className="p-5">Patient Details</th>
                  <th className="p-5">Test Type</th>
                  <th className="p-5">Schedule</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((t) => {
                  const p = getPatient(t.patientId);
                  const isReported = t.reportText || t.reportUrl;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 font-bold text-blue-600">T-{t.id.slice(-5)}</td>
                      <td className="p-5">
                        <div className="text-[10px] font-bold text-slate-400">ID: P-{t.patientId}</div>
                        <div className="font-semibold text-slate-700">{p?.firstName} {p?.lastName}</div>
                        <div className="text-xs text-slate-500">{p?.gender} • {p?.age} yrs</div>
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100"> {t.testType} </span>
                        <div className="text-[10px] mt-1 text-slate-400 font-bold">Rs {t.price}</div>
                      </td>
                      <td className="p-5">
                        <div className="text-xs text-slate-600 font-medium">Test: {t.testDate}</div>
                        <div className="text-xs text-red-500 font-medium">Req: {t.requestedDate}</div>
                      </td>
                      <td className="p-5">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                          className={`p-1 px-2 rounded-lg text-xs font-bold ring-1 cursor-pointer outline-none ${
                            t.status === 'Completed' ? 'bg-green-50 text-green-600 ring-green-200' :
                            t.status === 'In Progress' ? 'bg-amber-50 text-amber-600 ring-amber-200' :
                            'bg-slate-100 text-slate-500 ring-slate-200'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="p-5">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => navigate(`/upload-report/${t.id}`)}
                            className={`px-3 py-2 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm ${
                              isReported ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                          >
                            {isReported ? "REPORTED" : "REPORT"}
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm"> DELETE </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredTests.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-medium">
              No matching test records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, dot }) {
  return (
    <div className={`px-6 py-4 bg-white/5 border ${color} rounded-[24px] flex flex-col items-center gap-1 transition-all hover:bg-white/10`}>
      <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{label}</span>
      <div className="flex items-center gap-2">
        {dot && <span className={`w-2 h-2 rounded-full ${dot}`}></span>}
        <span className="text-2xl font-black text-white">{value}</span>
      </div>
    </div>
  );
}