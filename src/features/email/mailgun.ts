import type { ServerEnv } from '#/lib/env'
import type { EmailProvider } from './types'

const TIMEOUT_MS = 8000

/** Mailgun HTTP API. Null when it is not configured, so the caller can fall back. */
export function createMailgunProvider(env: ServerEnv): EmailProvider | null {
  const {
    MAILGUN_API_KEY: key,
    MAILGUN_DOMAIN: domain,
    MAILGUN_FROM: from,
  } = env
  if (!key || !domain || !from) return null

  return {
    name: 'mailgun',
    async send(message) {
      const body = new FormData()
      body.set('from', from)
      body.set('to', message.to)
      body.set('subject', message.subject)
      body.set('text', message.text)
      body.set('html', message.html)

      const res = await fetch(`${env.MAILGUN_API_BASE}/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${key}`).toString('base64')}`,
        },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!res.ok) {
        const detail = (await res.text()).slice(0, 200)
        throw new Error(`Mailgun ${res.status}: ${detail}`)
      }
    },
  }
}
