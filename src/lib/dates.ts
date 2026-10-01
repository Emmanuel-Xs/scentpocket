const zone = 'Africa/Lagos'

/** 1 Oct, 10:42 (Lagos time, so server and browser always agree). */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: zone,
  })
}

/** 1 Oct 2026 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: zone,
  })
}
