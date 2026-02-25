import { useEffect, useState } from "react";
import api from "../../api/api";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Fingerprint, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  RefreshCw,
  MoreHorizontal
} from "lucide-react"; // npm i lucide-react

export default function ManagePatients() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/patients");
      setData(res.data);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Are you sure you want to delete this patient record? This cannot be undone.")) return;
    try {
      await api.delete(`/api/admin/patients/${id}`);
      setData(data.filter(p => p.id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed");
    }
  };

  useEffect(() => { load(); }, []);

  const filteredData = data.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nicOrPassport.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Navigation / Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Registry</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-700 text-sm font-bold">
                {data.length} Total
              </span>
            </div>
            <p className="text-slate-500 mt-1 font-medium">Monitor and manage patient accounts and verification status.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search name or NIC/Passport..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none w-full md:w-80 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={load}
              className="p-2.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-600 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 space-y-4">
               {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-slate-100 rounded-full" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Patient Info</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Contact Details</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">ID Document</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.map((p) => (
                    <tr key={p.id} className="hover:bg-teal-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-inner">
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-800 tracking-tight">
                              {p.title} {p.firstName} {p.lastName}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                              PID-{p.id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail size={14} className="text-slate-300" /> {p.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={14} className="text-slate-300" /> {p.contactNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                          <Fingerprint size={15} className="text-slate-400" />
                          {p.nicOrPassport}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.verified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                            <ShieldCheck size={14} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                            <ShieldAlert size={14} /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                            <MoreHorizontal size={18} />
                          </button>
                          <button
                            onClick={() => remove(p.id)}
                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredData.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={40} />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">No patients found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}