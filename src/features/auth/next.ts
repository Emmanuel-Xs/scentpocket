/** Only same-site relative paths are allowed as a post sign in destination (no open redirect). */
export function safeNext(
  next: string | null | undefined,
  fallback = '/',
): string {
  if (!next) return fallback
  if (!next.startsWith('/')) return fallback
  if (next.startsWith('//') || next.startsWith('/\\')) return fallback
  if (/[\r\n]/.test(next)) return fallback
  return next
}
