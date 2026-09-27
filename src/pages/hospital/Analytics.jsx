import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Video,
  Building2,
  Stethoscope,
  Award,
  ArrowUpRight,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Search,
  FlaskConical,
  Percent,
  Sparkles
} from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('ALL'); // ALL, 30DAYS, THIS_MONTH
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, DOCTORS, REVENUE
  const [chartMetric, setChartMetric] = useState('REVENUE'); // REVENUE or APPOINTMENTS
  const [doctorSearch, setDoctorSearch] = useState('');

  const fetchAnalytics = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/hospitals/${user.id}/analytics`);
      setData(response.data);
    } catch (err) {
      console.error('Failed to load hospital analytics:', err);
      setError(err?.response?.data?.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.id]);

  const summary = data?.summary || {
    totalRevenue: 0,
    appointmentRevenue: 0,
    physicalRevenue: 0,
    videoRevenue: 0,
    labRevenue: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    pendingAppointments: 0,
    physicalAppointments: 0,
    videoAppointments: 0,
    activeDoctorsCount: 0,
    totalSchedules: 0,
    totalLabTests: 0,
    completedLabTests: 0,
    pendingLabTests: 0,
    cancellationRate: 0,
    completionRate: 0
  };

  const monthlyTrends = data?.monthlyTrends || [];
  const topDoctors = data?.topDoctors || [];
  const specialtyBreakdown = data?.specialtyBreakdown || [];
  const recentAppointments = data?.recentAppointments || [];
  const consultationBreakdown = data?.consultationBreakdown || {
    physical: 0,
    video: 0,
    physicalRevenue: 0,
    videoRevenue: 0
  };

  const formatLKR = (num) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  const filteredDoctors = topDoctors.filter((doc) =>
    doc.doctorName?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    doc.specialization?.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  // Highest value for bar chart scaling
  const maxMonthlyVal = Math.max(
    ...monthlyTrends.map((m) => (chartMetric === 'REVENUE' ? m.revenue : m.appointments)),
    chartMetric === 'REVENUE' ? 10000 : 5
  );

  const maxSpecialtyCount = Math.max(
    ...specialtyBreakdown.map((s) => s.count),
    1
  );

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 rounded-xl" />
            <div className="h-4 w-96 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm" />
          <div className="h-96 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/60 p-4 md:p-8 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Activity size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  Hospital Performance & Analytics
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Data
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Comprehensive financial and clinical metrics for {user?.name || 'Hospital'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition shadow-sm active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-medium transition shadow-md shadow-teal-600/20 active:scale-95"
          >
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ERROR NOTICE IF ANY */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="text-amber-600" size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="text-xs bg-amber-200/60 hover:bg-amber-200 px-3 py-1.5 rounded-xl font-semibold transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Total Revenue */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {formatLKR(summary.totalRevenue)}
            </h2>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {formatLKR(summary.appointmentRevenue)} appts
              </span>
              <span>•</span>
              <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                {formatLKR(summary.labRevenue)} labs
              </span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-100/40 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* 2. Total Appointments */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Appointments</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
              <Calendar size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {summary.totalAppointments}
            </h2>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 size={12} /> {summary.completedAppointments} Completed
              </span>
              <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {summary.confirmedAppointments} Confirmed
              </span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-teal-100/40 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* 3. Affiliated Doctors */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Medical Staff</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {summary.activeDoctorsCount}
            </h2>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {summary.totalSchedules} Schedules Hosted
              </span>
              <span>across {specialtyBreakdown.length} specialties</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-indigo-100/40 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* 4. Completion & Reliability */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fulfillment Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Percent size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                {summary.completionRate}%
              </h2>
              <span className="text-xs font-semibold text-slate-400">completed</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className={`font-semibold px-2 py-0.5 rounded-md ${
                summary.cancellationRate > 15 ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-100'
              }`}>
                {summary.cancellationRate}% Cancellation Rate
              </span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-amber-100/40 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* MAIN VISUALIZATION SECTION: MONTHLY TREND + CONSULTATION SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Trend Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="text-teal-600" size={20} />
                  Performance Growth Trends
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly breakdown of patient bookings and financial revenue
                </p>
              </div>

              {/* Metric Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl self-start">
                <button
                  onClick={() => setChartMetric('REVENUE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    chartMetric === 'REVENUE'
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Revenue (LKR)
                </button>
                <button
                  onClick={() => setChartMetric('APPOINTMENTS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    chartMetric === 'APPOINTMENTS'
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Bookings Count
                </button>
              </div>
            </div>

            {/* Visual Bar Chart */}
            {monthlyTrends.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <Activity size={32} className="mb-2 opacity-50" />
                <p className="text-sm">No appointment history available yet.</p>
              </div>
            ) : (
              <div className="h-64 flex items-end gap-3 sm:gap-6 pt-10 pb-4 border-b border-slate-100 overflow-x-auto">
                {monthlyTrends.map((item, idx) => {
                  const val = chartMetric === 'REVENUE' ? item.revenue : item.appointments;
                  const heightPercent = Math.max((val / maxMonthlyVal) * 100, 8);

                  return (
                    <div key={idx} className="flex-1 min-w-[50px] flex flex-col items-center gap-2 group relative">
                      {/* Hover Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-slate-900 text-white px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap shadow-lg">
                        <span className="font-semibold">
                          {chartMetric === 'REVENUE' ? formatLKR(val) : `${val} bookings`}
                        </span>
                      </div>

                      {/* Bar Fill */}
                      <div className="w-full bg-slate-100 rounded-2xl h-48 flex items-end p-1">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-xl transition-all duration-500 ${
                            chartMetric === 'REVENUE'
                              ? 'bg-gradient-to-t from-teal-600 to-emerald-400 group-hover:from-teal-500 group-hover:to-emerald-300'
                              : 'bg-gradient-to-t from-indigo-600 to-purple-400 group-hover:from-indigo-500 group-hover:to-purple-300'
                          }`}
                        />
                      </div>

                      {/* Label */}
                      <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-900">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Physical In-Hospital
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ml-2" /> Video Telemedicine
            </span>
            <span>Based on verified hospital patient records</span>
          </div>
        </div>

        {/* Right: Consultation Modality Breakdown & Diagnostics */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
              <PieChart className="text-teal-600" size={20} />
              Consultation Types
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              In-Hospital Channeling vs. Video Telemedicine
            </p>

            {/* Modality Split Bars */}
            <div className="space-y-5">
              {/* Physical */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Building2 size={16} className="text-teal-600" />
                    Physical Consultations
                  </span>
                  <span className="text-slate-900 font-bold">
                    {consultationBreakdown.physical} ({summary.totalAppointments > 0
                      ? Math.round((consultationBreakdown.physical / summary.totalAppointments) * 100)
                      : 0}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${
                        summary.totalAppointments > 0
                          ? (consultationBreakdown.physical / summary.totalAppointments) * 100
                          : 0
                      }%`
                    }}
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Revenue Generated</span>
                  <span className="font-semibold text-slate-700">{formatLKR(summary.physicalRevenue)}</span>
                </div>
              </div>

              {/* Video */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Video size={16} className="text-indigo-600" />
                    Video Telemedicine
                  </span>
                  <span className="text-slate-900 font-bold">
                    {consultationBreakdown.video} ({summary.totalAppointments > 0
                      ? Math.round((consultationBreakdown.video / summary.totalAppointments) * 100)
                      : 0}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${
                        summary.totalAppointments > 0
                          ? (consultationBreakdown.video / summary.totalAppointments) * 100
                          : 0
                      }%`
                    }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-700"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Revenue Generated</span>
                  <span className="font-semibold text-slate-700">{formatLKR(summary.videoRevenue)}</span>
                </div>
              </div>

              {/* Lab Diagnostic Highlight Card */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-indigo-50/70 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical size={18} className="text-purple-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                    Laboratory Diagnostics
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center mt-2">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100/80">
                    <p className="text-xs text-slate-500">Total Tests</p>
                    <p className="text-lg font-bold text-slate-800">{summary.totalLabTests}</p>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100/80">
                    <p className="text-xs text-slate-500">Lab Revenue</p>
                    <p className="text-lg font-bold text-purple-700">{formatLKR(summary.labRevenue)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Hospital Telehealth Enabled</span>
            <span className="font-semibold text-emerald-600">Active</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: TOP PERFORMING DOCTORS & SPECIALTY DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Doctors Table (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="text-amber-500" size={20} />
                Doctor Performance Leaderboard
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Physicians ranked by total patient appointments and revenue contribution
              </p>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter doctors..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition w-full sm:w-48"
              />
            </div>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No doctors found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Rank & Doctor</th>
                    <th className="pb-3">Specialty</th>
                    <th className="pb-3 text-center">Appointments</th>
                    <th className="pb-3 text-center">Completed</th>
                    <th className="pb-3 text-right pr-2">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredDoctors.map((doc, idx) => (
                    <tr key={doc.doctorId || idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-700'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-700'
                                : idx === 2
                                ? 'bg-amber-800/10 text-amber-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs overflow-hidden">
                            {doc.profileImage ? (
                              <img src={doc.profileImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              doc.doctorName?.charAt(0) || 'D'
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{doc.doctorName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          {doc.specialization}
                        </span>
                      </td>
                      <td className="py-3.5 text-center font-bold text-slate-800">
                        {doc.appointmentsCount}
                      </td>
                      <td className="py-3.5 text-center font-semibold text-emerald-600">
                        {doc.completedCount}
                      </td>
                      <td className="py-3.5 text-right pr-2 font-bold text-slate-900">
                        {formatLKR(doc.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Specialty Demand Breakdown (1 column) */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Stethoscope className="text-teal-600" size={20} />
            Specialty Demand
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Patient distribution across medical departments
          </p>

          {specialtyBreakdown.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No specialty data recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {specialtyBreakdown.map((spec, idx) => {
                const percent = Math.round((spec.count / maxSpecialtyCount) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{spec.specialty}</span>
                      <span className="text-slate-500 font-bold">{spec.count} visits</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-800 flex items-start gap-2.5">
            <Sparkles size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">
              <strong>Tip:</strong> Specialties with high demand indicate ideal opportunities to add new doctor schedules.
            </p>
          </div>
        </div>
      </div>

      {/* RECENT APPOINTMENT LOG */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="text-teal-600" size={20} />
              Recent Patient Appointments
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live chronological activity log of incoming and processed appointments
            </p>
          </div>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No recent appointments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Patient</th>
                  <th className="pb-3">Doctor</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 pl-2 font-semibold text-slate-900">
                      {appt.patientName}
                    </td>
                    <td className="py-3.5 text-slate-700 font-medium">
                      {appt.doctorName}
                    </td>
                    <td className="py-3.5 text-slate-500">
                      {appt.date} {appt.time && `at ${appt.time}`}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                          appt.consultationType === 'VIDEO'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-teal-50 text-teal-700'
                        }`}
                      >
                        {appt.consultationType === 'VIDEO' ? <Video size={12} /> : <Building2 size={12} />}
                        {appt.consultationType || 'PHYSICAL'}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                          appt.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : appt.status === 'PAID' || appt.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-700'
                            : appt.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {appt.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2 font-bold text-slate-900">
                      {formatLKR(appt.amount || 1500)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}