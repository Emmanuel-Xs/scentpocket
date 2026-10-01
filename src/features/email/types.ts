export type EmailMessage = {
  to: string
  subject: string
  html: string
  text: string
}

export type EmailProvider = {
  name: 'mailgun' | 'smtp'
  send: (message: EmailMessage) => Promise<void>
}

export type DeliveryResult =
  { ok: true; provider: EmailProvider['name'] } | { ok: false; error: string }
