/**
 * WATCHDOG Timezone Utilities
 * Formats timestamps to Indian Standard Time (IST, UTC+5:30)
 */

const IST_OPTIONS = {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
};

const IST_SHORT_OPTIONS = {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
};

const IST_DATE_OPTIONS = {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: 'short',
  day: '2-digit'
};

/**
 * Format a timestamp to full IST datetime string
 * @param {string|Date} timestamp
 * @returns {string}
 */
export function toIST(timestamp) {
  if (!timestamp) return 'N/A';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleString('en-IN', IST_OPTIONS);
}

/**
 * Format a timestamp to IST time only (HH:MM AM/PM)
 * @param {string|Date} timestamp
 * @returns {string}
 */
export function toISTTime(timestamp) {
  if (!timestamp) return 'N/A';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleString('en-IN', IST_SHORT_OPTIONS);
}

/**
 * Format a timestamp to IST date only
 * @param {string|Date} timestamp
 * @returns {string}
 */
export function toISTDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleString('en-IN', IST_DATE_OPTIONS);
}

