import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, Calendar, AlertCircle, ExternalLink, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { unreadCount, notifications, loading, markNotificationAsRead, markAllNotificationsAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL or UNREAD
  const dropdownRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine notification page route based on user role
  const getNotificationPage = () => {
    const role = user?.role?.toUpperCase();
    if (role === 'DOCTOR') return '/doctor/notifications';
    if (role === 'HOSPITAL') return '/hospital/notifications';
    return '/patient/notifications';
  };

  const displayedNotifications = (notifications || []).filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  }).slice(0, 8); // show up to 8 in quick dropdown

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* BELL TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-slate-900 transition shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        aria-label="Notifications"
      >
        <Bell size={20} className={unreadCount > 0 ? 'text-slate-800' : 'text-slate-500'} />

        {/* MODERN RED MARK / BADGE IF HAS UNREAD NOTIFICATIONS */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1">
            {/* Ping effect */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            {/* Solid badge with counter */}
            <span className="relative inline-flex items-center justify-center h-full w-full rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black border-2 border-white shadow-md shadow-rose-500/30">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* DROPDOWN POPOVER */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 px-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Bell size={16} className="text-teal-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Notifications</h3>
                <p className="text-[11px] text-slate-300">
                  {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'You are all caught up!'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="flex items-center gap-1.5 text-xs text-teal-300 hover:text-teal-200 font-semibold bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl transition"
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span>Mark all</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs">
            <div className="flex gap-1">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  filter === 'ALL'
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({(notifications || []).length})
              </button>
              <button
                onClick={() => setFilter('UNREAD')}
                className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  filter === 'UNREAD'
                    ? 'bg-white text-rose-600 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={14} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {displayedNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} />
                </div>
                <p className="text-xs font-semibold text-slate-600">No notifications found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {filter === 'UNREAD' ? 'You have read all your notifications.' : 'New notifications will show up here.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((n) => {
                const isUnread = !n.read;
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (isUnread) markNotificationAsRead(n.id);
                    }}
                    className={`p-3.5 px-4 transition flex gap-3 items-start cursor-pointer hover:bg-slate-50 relative ${
                      isUnread ? 'bg-rose-50/30' : 'bg-white'
                    }`}
                  >
                    {/* Unread Indicator Bar */}
                    {isUnread && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-r" />
                    )}

                    {/* Icon based on content */}
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                        isUnread
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Bell size={14} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {n.title || 'System Notification'}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                          <Clock size={10} />
                          {formatTime(n.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      {/* Date/Time badge if present */}
                      {(n.date || n.time) && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md w-fit">
                          <Calendar size={10} className="text-teal-600" />
                          <span>{n.date} {n.time && `at ${n.time}`}</span>
                        </div>
                      )}
                    </div>

                    {/* Mark Read checkmark button if unread */}
                    {isUnread && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(n.id);
                        }}
                        className="shrink-0 p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                        title="Mark as read"
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Link */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(getNotificationPage());
              }}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 transition inline-flex items-center gap-1.5"
            >
              <span>View all notifications</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
