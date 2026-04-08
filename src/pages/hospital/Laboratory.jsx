import { useEffect, useState } from "react";
import {
  getTestCategories,
  addTestCategory,
  updateTestCategory,
  deleteTestCategory,
  getAllLabTests
} from "../../api/labApi";

import TestCategory from "./TestCategory";
import AddLabTest from "./AddLabTest";

export default function Laboratory() {
  const hospitalId = localStorage.getItem("hospitalId");

  const [tests, setTests] = useState([]);
  const [testCounts, setTestCounts] = useState({ pending: 0, inProgress: 0, total: 0 });
  const [form, setForm] = useState({ testName: "", price: "" });
  const [editId, setEditId] = useState(null);
  const [view, setView] = useState("landing");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    load();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const load = async () => {
    try {
      const catRes = await getTestCategories(hospitalId);
      setTests(catRes.data || []);

      const testsRes = await getAllLabTests();
      const allTests = testsRes.data || [];
      
      setTestCounts({
        pending: allTests.filter(t => t.status === "Pending").length,
        inProgress: allTests.filter(t => t.status === "In Progress").length,
        total: allTests.length
      });
    } catch (error) {
      console.error("Error loading laboratory data:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await updateTestCategory(editId, form);
      } else {
        await addTestCategory(hospitalId, form);
      }
      setForm({ testName: "", price: "" });
      setEditId(null);
      load();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleEdit = (t) => {
    setForm({ testName: t.testName, price: t.price });
    setEditId(t.id);
    setView("manage");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      try {
        await deleteTestCategory(id);
        load();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  if (view === "addTest") return <AddLabTest onBack={() => setView("landing")} />;

  if (view === "landing") {
    return (
      <div className="min-h-full w-full bg-slate-50 p-6 font-sans">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Laboratory Portal</h1>
            <p className="text-slate-500 text-sm mt-1">Manage diagnostic categories and patient test assignments.</p>
          </div>
          
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-lg font-mono font-bold text-blue-600">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Stats Area */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Categories" value={tests.length} icon="📋" color="text-blue-600" />
            <StatCard label="Pending" value={testCounts.pending} icon="⏳" color="text-amber-600" />
            <StatCard label="In Progress" value={testCounts.inProgress} icon="🔬" color="text-cyan-600" />
            <StatCard label="Total Tests" value={testCounts.total} icon="📊" color="text-emerald-600" />
          </div>

          {/* Action Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <button
              onClick={() => setView("manage")}
              className="group flex flex-col items-center justify-center p-10 bg-white border-2 border-dashed border-slate-200 rounded-3xl hover:border-blue-400 hover:bg-blue-50/30 transition-all"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <h3 className="text-xl font-bold text-slate-800">Manage Categories</h3>
              <p className="text-slate-500 text-sm mt-2">Edit test names, pricing, and lab catalog</p>
            </button>

            <button
              onClick={() => setView("addTest")}
              className="group flex flex-col items-center justify-center p-10 bg-blue-600 rounded-3xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                ➕
              </div>
              <h3 className="text-xl font-bold text-white">Assign Lab Test</h3>
              <p className="text-blue-100 text-sm mt-2">Create new test orders for hospital patients</p>
            </button>
          </div>
          
        </div>
      </div>
    );
  }

  return (
    <TestCategory
      tests={tests}
      form={form}
      setForm={setForm}
      editId={editId}
      setEditId={setEditId}
      handleSave={handleSave}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      onBack={() => setView("landing")}
    />
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}