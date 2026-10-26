/**
 * Centralized Date and Time Utilities for CDCM
 * Configured specifically for Asia/Colombo (Sri Lanka time zone).
 */

export const SRI_LANKA_TIME_ZONE = 'Asia/Colombo';

/**
 * Parses and formats a single time string (e.g. "09:00", "14:30", "9:00 AM")
 * into standard 12-hour format with AM/PM (e.g. "09:00 AM", "02:30 PM").
 */
export function formatSingleTime(timeStr) {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  if (!trimmed) return '';

  // Check if it already has AM/PM
  const matchAmPm = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (matchAmPm) {
    let h = parseInt(matchAmPm[1], 10);
    const m = matchAmPm[2];
    const period = matchAmPm[3].toUpperCase();
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${m} ${period}`;
  }

  // Check 24-hour HH:mm or HH:mm:ss format
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const rawH = parseInt(match24[1], 10);
    const m = match24[2];
    if (rawH >= 0 && rawH < 24) {
      const period = rawH >= 12 ? 'PM' : 'AM';
      const h12 = rawH % 12 || 12;
      return `${String(h12).padStart(2, '0')}:${m} ${period}`;
    }
  }

  return trimmed;
}

/**
 * Formats a time string or range (e.g. "09:00 - 11:00", "23:30 - 00:30", "14:30")
 * into consistent 12-hour format with AM/PM.
 */
export function formatTimeRange(timeStr) {
  if (!timeStr) return '—';
  const trimmed = String(timeStr).trim();
  if (!trimmed || trimmed === '—' || trimmed === '--') return '—';

  // Check if it's a range (separated by ' - ', '-', ' – ', ' — ', or ' to ')
  const rangeSplitRegex = /\s*(?:–|—|-|to)\s*/i;
  // Make sure not to split a single negative number or weird token
  if (trimmed.includes(' - ') || trimmed.includes(' – ') || trimmed.includes(' — ') || /\bto\b/i.test(trimmed)) {
    const parts = trimmed.split(rangeSplitRegex);
    if (parts.length === 2 && parts[0] && parts[1]) {
      return `${formatSingleTime(parts[0])} - ${formatSingleTime(parts[1])}`;
    }
  }

  // Handle "HH:mm-HH:mm" without spaces
  const directRangeMatch = trimmed.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (directRangeMatch) {
    return `${formatSingleTime(directRangeMatch[1])} - ${formatSingleTime(directRangeMatch[2])}`;
  }

  // Otherwise, treat as single time
  return formatSingleTime(trimmed);
}

/**
 * Parses a time string (single or range start) into total minutes from midnight (0..1439).
 * Returns Infinity if unparseable, making it ideal for sorting.
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return Infinity;
  let s = String(timeStr).trim();

  // If it's a range, take the start time
  const rangeParts = s.split(/\s*(?:–|—|-|to)\s*/i);
  if (rangeParts.length > 1 && rangeParts[0]) {
    s = rangeParts[0].trim();
  }

  // Check for AM/PM
  const ampmMatch = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!ampmMatch) return Infinity;

  let h = parseInt(ampmMatch[1], 10);
  const m = parseInt(ampmMatch[2], 10);
  const period = ampmMatch[3]?.toUpperCase();

  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;

  return h * 60 + m;
}

/**
 * Normalizes an audit timestamp ISO string to ensure it is treated as a UTC instant
 * if no time zone offset is present.
 */
export function parseAuditInstant(isoString) {
  if (!isoString) return null;
  let str = String(isoString).trim();
  // If it has no Z and no timezone offset like +05:30 or -04:00, append Z
  if (!/[zZ]$/.test(str) && !/[+-]\d{2}(?::?\d{2})?$/.test(str)) {
    str += 'Z';
  }
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats an audit timestamp (like Notification.createdAt) in Asia/Colombo time.
 * Example: "Oct 24, 2026, 09:30 AM"
 */
export function formatNotificationTimestamp(isoString) {
  if (!isoString) return '';
  const date = parseAuditInstant(isoString);
  if (!date) return String(isoString);

  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: SRI_LANKA_TIME_ZONE,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

/**
 * Relative time formatter for notifications (e.g. "Just now", "5m ago", "2h ago", "Yesterday").
 * Calculates elapsed time against the UTC instant.
 */
export function formatNotificationRelativeTime(isoString) {
  if (!isoString) return '';
  const date = parseAuditInstant(isoString);
  if (!date) return String(isoString);

  try {
    const now = Date.now();
    const diffMs = now - date.getTime();
    if (diffMs < 0) return 'Just now';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';

    return new Intl.DateTimeFormat('en-US', {
      timeZone: SRI_LANKA_TIME_ZONE,
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * Returns today's date in Sri Lanka (Asia/Colombo) formatted as "YYYY-MM-DD".
 * This prevents early morning (00:00 - 05:30) date shift bugs from UTC toISOString().
 */
export function getSriLankaTodayDate() {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: SRI_LANKA_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    // Fallback
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

/**
 * Returns current minutes since midnight in Sri Lanka (0..1439).
 */
export function getSriLankaNowMinutes() {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: SRI_LANKA_TIME_ZONE,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(new Date());

    let hour = 0;
    let minute = 0;
    for (const part of parts) {
      if (part.type === 'hour') hour = parseInt(part.value, 10);
      if (part.type === 'minute') minute = parseInt(part.value, 10);
    }
    // Handle 24:00 edge case in some engines
    if (hour === 24) hour = 0;
    return hour * 60 + minute;
  } catch {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
}

/**
 * Checks if a schedule date and time have passed in Sri Lanka time.
 */
export function isSchedulePastInSriLanka(dateStr, timeStr) {
  if (!dateStr) return false;
  const cleanDate = String(dateStr).split('T')[0].trim();
  const today = getSriLankaTodayDate();

  if (cleanDate < today) return true;
  if (cleanDate > today) return false;

  // Same day: compare time
  if (!timeStr) return false;
  const scheduleMinutes = parseTimeToMinutes(timeStr);
  if (scheduleMinutes === Infinity) return false;

  const currentMinutes = getSriLankaNowMinutes();
  return scheduleMinutes <= currentMinutes;
}

/**
 * Safely parses a "YYYY-MM-DD" date string as a local calendar date
 * without timezone boundary shifting.
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const clean = String(dateStr).split('T')[0].trim();
  const parts = clean.split('-').map(Number);
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Safely formats a "YYYY-MM-DD" date string into a localized display date
 * without timezone boundary shifting.
 */
export function formatDisplayDate(dateStr, options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) {
  if (!dateStr) return 'Date not available';
  const d = parseLocalDate(dateStr);
  if (!d) return String(dateStr);
  return d.toLocaleDateString('en-US', options);
}
