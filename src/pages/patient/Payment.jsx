import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  Receipt, 
  Building, 
  Calendar,
  AlertCircle
} from "lucide-react";

export default function Payment() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchPayments = async () => {
    if (!user || !user.id) return;

    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/payments/patient/${user.id}`);
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setError("Failed to load payment history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  // Calculations for summary stats
  const totalPaid = payments
    .filter((p) => p.isPaid || p.paymentStatus === "PAID")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const paidCount = payments.filter((p) => p.isPaid || p.paymentStatus === "PAID").length;
  const pendingCount = payments.filter((p) => !p.isPaid && p.paymentStatus !== "PAID").length;

  // Filtered payments
  const filteredPayments = payments.filter((p) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PAID" && (p.isPaid || p.paymentStatus === "PAID")) ||
      (statusFilter === "PENDING" && !p.isPaid && p.paymentStatus !== "PAID");

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      (p.transactionId && p.transactionId.toLowerCase().includes(searchLower)) ||
      (p.description && p.description.toLowerCase().includes(searchLower)) ||
      (p.doctorName && p.doctorName.toLowerCase().includes(searchLower)) ||
      (p.hospitalName && p.hospitalName.toLowerCase().includes(searchLower)) ||
      (p.appointmentNumber && p.appointmentNumber.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <CreditCard className="text-blue-600" size={32} />
            Payment History
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View all your consultation and service payment transactions.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-blue-600" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Paid */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Total Amount Paid
            </p>
            <h3 className="text-2xl font-black text-gray-900">
              LKR {totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt size={24} />
          </div>
        </div>

        {/* Successful Payments */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Successful Payments
            </p>
            <h3 className="text-2xl font-black text-green-600">{paidCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Pending Transactions
            </p>
            <h3 className="text-2xl font-black text-amber-500">{pendingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by doctor, hospital, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 w-full sm:w-auto">
          {["ALL", "PAID", "PENDING"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === status
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "ALL" ? "All Payments" : status === "PAID" ? "Completed" : "Pending"}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-sm">Loading your payment records...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Payment Records Found</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {searchTerm || statusFilter !== "ALL"
              ? "No payments match your current search and filter criteria."
              : "You haven't made any appointment or service payments yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Transaction / Reference</th>
                  <th className="py-4 px-6">Service / Details</th>
                  <th className="py-4 px-6">Hospital</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredPayments.map((p) => {
                  const isSuccess = p.isPaid || p.paymentStatus === "PAID";
                  return (
                    <tr key={p.id || p.transactionId} className="hover:bg-blue-50/40 transition-colors">
                      {/* Transaction ID */}
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-gray-900">
                        {p.transactionId || p.id || "—"}
                        {p.appointmentNumber && (
                          <span className="block text-[11px] font-sans text-blue-600 font-bold mt-0.5">
                            {p.appointmentNumber}
                          </span>
                        )}
                      </td>

                      {/* Service / Description */}
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900 leading-snug">{p.description || "Medical Service"}</p>
                        {p.doctorName && (
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            👨‍⚕️ {p.doctorName}
                          </p>
                        )}
                      </td>

                      {/* Hospital */}
                      <td className="py-4 px-6 text-gray-600 font-medium">
                        {p.hospitalName ? (
                          <span className="flex items-center gap-1.5 text-xs text-gray-700">
                            <Building size={14} className="text-gray-400" />
                            {p.hospitalName}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-6 text-xs text-gray-600">
                        <div className="flex items-center gap-1 font-semibold text-gray-800">
                          <Calendar size={13} className="text-blue-500" />
                          {p.date || "—"}
                        </div>
                        {p.time && <p className="text-gray-500 mt-0.5">{p.time}</p>}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 font-bold text-gray-900 text-sm">
                        LKR {(Number(p.amount) || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isSuccess
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {isSuccess ? (
                            <>
                              <CheckCircle2 size={12} />
                              Paid
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              Pending
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
