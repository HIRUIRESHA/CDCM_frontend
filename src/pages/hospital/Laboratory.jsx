import { useEffect, useState } from "react";
import {
  getTestCategories,
  addTestCategory,
  updateTestCategory,
  deleteTestCategory,
  getAllLabTests
} from "../../api/labApi";


import labBackground from "../../assets/lab.jpg"; 

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
      <div 
        className="h-full w-full flex flex-col justify-center items-center p-4 bg-cover bg-center bg-no-repeat relative overflow-hidden font-sans rounded-3xl"
        style={{ 
          backgroundImage: `url(${labBackground})` 
        }}
      >
       
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"></div>

        <div className="relative z-10 w-full max-w-4xl text-center px-2">
          
          {/*  time & date section */}
          <div className="mb-6 animate-in fade-in zoom-in duration-700">
            <h2 className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl mb-1">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
            <div className="flex items-center justify-center gap-2">
               <div className="h-[1px] w-8 bg-blue-500"></div>
               <p className="text-xs text-blue-400 font-bold uppercase tracking-[0.3em]">
                 {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
               </p>
               <div className="h-[1px] w-8 bg-blue-500"></div>
            </div>
          </div>

          
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[40px] shadow-2xl ring-1 ring-white/20">
            <div className="inline-flex p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl mb-4 border border-blue-400/30 shadow-inner">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-none">
              Laboratory <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Portal</span>
            </h1>

            
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-10">
              <button
                onClick={() => setView("manage")}
                className="group flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-[16px] font-extrabold text-sm transition-all hover:scale-105 active:scale-95 shadow-2xl hover:bg-blue-50"
              >
                <span className="text-lg transition-transform group-hover:rotate-12">⚙️</span>
                Manage Categories
              </button>

              <button
                onClick={() => setView("addTest")}
                className="group flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-[16px] font-extrabold text-sm transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/40"
              >
                <span className="text-lg transition-transform group-hover:scale-125">➕</span>
                Assign Lab Test
              </button>
            </div>

           
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 border-t border-white/10">
              <StatCard label="Categories" value={tests.length} color="border-blue-500/30" />
              <StatCard label="Pending" value={testCounts.pending} color="border-amber-500/30" dot="bg-amber-500 animate-pulse" />
              <StatCard label="In Progress" value={testCounts.inProgress} color="border-cyan-500/30" dot="bg-cyan-400 animate-bounce" />
              <StatCard label="Total Tests" value={testCounts.total} color="border-green-500/30" />
            </div>

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

function StatCard({ label, value, color, dot }) {
  return (
    <div className={`px-3 py-2 bg-white/5 border ${color} rounded-[16px] flex flex-col items-center gap-1 transition-all hover:bg-white/10`}>
      <span className="text-[8px] text-slate-400 font-black uppercase tracking-[0.1em]">{label}</span>
      <div className="flex items-center gap-1">
        {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>}
        <span className="text-lg font-black text-white">{value}</span>
      </div>
    </div>
  );
}