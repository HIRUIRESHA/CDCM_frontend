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

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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
    const res = await getAllLabTests(hospitalId);
    setLabTests(res.data);
  };

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
      status: "Pending",
      hospitalId: hospitalId
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

  const handleClear = () => {
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
  setShowPatientList(false);
  setShowCategoryList(false);
};

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLabTests(prev =>
        prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
      );

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
    return patients.find(p => p.id === id);
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
      (p?.firstName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p?.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p?.nicOrPassport?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (t?.testType?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-20 font-sans">

      
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
  type="button"
  onClick={() => {
    console.log("clicked");
    navigate("/hospital/laboratory");
  }}
  className="relative z-50 flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 font-semibold"
>
  ←
</button>
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
        
<div className="w-full">
  <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500" />

    <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-center gap-4">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">New Test Request</h3>
        <p className="text-xs text-slate-400 font-medium">Fill in patient and test details below</p>
      </div>
    </div>

    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* ── Column 1: Patient Search ── */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Patient</label>

          <div className="relative">
            <span className="absolute left-3 top-3.5 text-slate-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search patient…"
              value={patientSearch}
              onChange={(e) => { setPatientSearch(e.target.value); setShowPatientList(true); }}
              onFocus={() => setShowPatientList(true)}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
            />
            {showPatientList && (
              <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-2xl mt-2 shadow-2xl shadow-slate-200/80 z-50 max-h-52 overflow-y-auto">
                {patients.filter(p =>
                  `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
                  (p?.nicOrPassport || "").toLowerCase().includes(patientSearch.toLowerCase()) ||
                  (p?.email || "").toLowerCase().includes(patientSearch.toLowerCase())
                ).map(p => (
                  <div
                    key={p.id}
                    onClick={() => selectPatient(p)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <div className="font-bold text-slate-700 text-sm">{p.firstName} {p.lastName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">NIC: {p.nicOrPassport} · {p.email}</div>
                    <div className="text-[10px] text-blue-400 font-bold">ID: P-{p.id}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <span className="absolute left-3 top-3.5">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/>
              </svg>
            </span>
            <input
              value={form.patientName}
              placeholder="Patient name"
              readOnly
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-sm text-slate-500 outline-none cursor-default select-none"
            />
          </div>
        </div>

        {/* ── Column 2: Contact Info ── */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</label>

          <div className="relative">
            <span className="absolute left-3 top-3.5">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </span>
            <input
              value={form.email}
              placeholder="Email address"
              readOnly
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-sm text-slate-500 outline-none cursor-default"
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-3.5">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </span>
            <input
              value={form.contactNumber}
              placeholder="Contact number"
              readOnly
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-sm text-slate-500 outline-none cursor-default"
            />
          </div>
        </div>

        {/* ── Column 3: Test Type + Price ── */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Test Details</label>

          <div className="relative">
            <span className="absolute left-3 top-3.5">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search test type…"
              value={categorySearch}
              onChange={(e) => { setCategorySearch(e.target.value); setShowCategoryList(true); }}
              onFocus={() => setShowCategoryList(true)}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
            />
            {showCategoryList && (
              <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-2xl mt-2 shadow-2xl shadow-slate-200/80 z-50 max-h-52 overflow-y-auto">
                {categories.filter(c => c.testName.toLowerCase().includes(categorySearch.toLowerCase())).map(c => (
                  <div
                    key={c.id}
                    onClick={() => selectCategory(c)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <div className="font-bold text-slate-700 text-sm">{c.testName}</div>
                    <div className="text-[10px] text-blue-500 font-bold mt-0.5">Rs {c.price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price display */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
            <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Rs</span>
            <span className="text-lg font-black text-blue-700 tracking-tight">
              {form.price || <span className="text-slate-300 font-medium text-sm">0.00</span>}
            </span>
          </div>
        </div>

        {/* ── Column 4: Dates + Actions ── */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule</label>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1 ml-0.5 tracking-widest">Test Date</label>
              <input
                type="date"
                name="testDate"
                value={form.testDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1 ml-0.5 tracking-widest">Req. Date</label>
              <input
                type="date"
                name="requestedDate"
                value={form.requestedDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleClear}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl text-sm font-bold text-slate-500 transition-all border border-slate-200"
            >
              ✕ Clear
            </button>
            <button
              onClick={handleSubmit}
              className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-blue-200"
            >
              + Add Test
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>

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