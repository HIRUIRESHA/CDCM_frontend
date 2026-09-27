import React, { useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Filter,
  Sparkles,
  Inbox
} from "lucide-react";

export default function HospitalNotifications() {
  const {
    notifications,
    loading,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications();

  const [filter, setFilter] = useState("ALL"); // ALL, UNREAD, READ

  const filtered = (notifications || []).filter((n) => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "READ") return n.read;
    return true;
  });

  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Bell size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Hospital Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time alerts for appointments, schedules, and doctor assignments
            </p>
          </div>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          disabled={unreadCount === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm self-start sm:self-center ${
            unreadCount > 0
              ? "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-teal-500/25 active:scale-95 cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          }`}
        >
          <CheckCheck size={16} />
          <span>Mark all as read</span>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-teal-700 text-[10px] font-black flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-slate-200/60 p-1.5 rounded-2xl">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === "ALL"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({(notifications || []).length})
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filter === "UNREAD"
                ? "bg-white text-rose-600 shadow-sm"
                : "text-slate-600 hover:text-rose-600"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter("READ")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === "READ"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl p-5 border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Inbox size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No notifications</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {filter === "UNREAD"
              ? "All your notifications have been marked as read."
              : "You have no notification alerts at this time."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const isUnread = !n.read;
            return (
              <div
                key={n.id}
                onClick={() => {
                  if (isUnread) markNotificationAsRead(n.id);
                }}
                className={`p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer relative group ${
                  isUnread
                    ? "bg-rose-50/20 border-rose-200 hover:bg-rose-50/40 shadow-sm"
                    : "bg-white border-slate-200/80 hover:bg-slate-50/60"
                }`}
              >
                {/* Left accent bar for unread */}
                {isUnread && (
                  <span className="absolute left-0 top-3 bottom-3 w-1.5 bg-rose-500 rounded-r-full" />
                )}

                {/* Notification Icon */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isUnread
                      ? "bg-rose-100 text-rose-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Bell size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm ${isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                        {n.title || "Notification"}
                      </h4>
                      {isUnread && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white">
                          Unread
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {formatTime(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>

                  {(n.date || n.time || n.doctorName) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {n.doctorName && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700">
                          {n.doctorName}
                        </span>
                      )}
                      {(n.date || n.time) && (
                        <span className="px-2.5 py-1 rounded-lg text-xs text-slate-600 bg-slate-100 flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          {n.date} {n.time && `• ${n.time}`}
                        </span>
                      )}
                      {n.scheduleType && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700">
                          {n.scheduleType}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Mark as read action */}
                {isUnread && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(n.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100/80 transition shrink-0 self-center"
                    title="Mark this notification as read"
                  >
                    <CheckCheck size={14} />
                    <span>Mark read</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}