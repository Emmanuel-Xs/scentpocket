import nodemailer from 'nodemailer'
import type { ServerEnv } from '#/lib/env'
import type { EmailProvider } from './types'

/** Gmail SMTP with an app password. Null when it is not configured. */
export function createSmtpProvider(env: ServerEnv): EmailProvider | null {
  const { SMTP_USER: user, SMTP_APP_PASSWORD: pass } = env
  if (!user || !pass) return null

  return {
    name: 'smtp',
    async send(message) {
      const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      })
      await transport.sendMail({
        from: `Scentpocket <${user}>`,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      })
    },
  }
}
