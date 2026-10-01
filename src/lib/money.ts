/** Money is integer kobo everywhere. Format only at the edge, with these helpers. */

/** 4200000 -> "₦42,000". Shows kobo only when there are some (₦1,250.50). */
export function formatKobo(kobo: number): string {
  const naira = kobo / 100
  const whole = Number.isInteger(naira)
  return `₦${naira.toLocaleString('en-NG', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`
}
