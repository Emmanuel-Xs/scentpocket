import { afterEach, describe, expect, it, vi } from 'vitest'
import { deliverEmail } from '#/features/email/deliver'
import { createMailgunProvider } from '#/features/email/mailgun'
import { renderOrderEmail } from '#/features/email/render'
import { createSmtpProvider } from '#/features/email/smtp'
import type { EmailMessage, EmailProvider } from '#/features/email/types'
import type { OrderDetail } from '#/features/orders/types'
import type { ServerEnv } from '#/lib/env'

const order: OrderDetail = {
  ref: 'SP-24F7K2',
  status: 'placed',
  paymentMethod: 'pay_on_delivery',
  customerName: 'Ada Obi',
  email: 'ada@example.com',
  phone: '+2348031234567',
  addressLine: '12 Ikorodu Road, Fadeyi',
  city: 'Yaba',
  state: 'Lagos',
  deliveryZone: 'lagos_mainland',
  subtotalKobo: 9_550_000,
  deliveryFeeKobo: 300_000,
  totalKobo: 9_850_000,
  createdAt: new Date('2026-10-01T09:42:00Z'),
  confirmedAt: null,
  shippedAt: null,
  deliveredAt: null,
  cancelledAt: null,
  emailProvider: null,
  emailSentAt: null,
  emailError: null,
  items: [
    {
      id: 'i1',
      productName: 'Khamrah EDP',
      variantLabel: '100ml EDP',
      imageUrl:
        'https://x.supabase.co/storage/v1/object/public/products/a.webp',
      image: null,
      unitPriceKobo: 4_200_000,
      qty: 2,
      lineTotalKobo: 8_400_000,
    },
    {
      id: 'i2',
      productName: 'Club de Nuit Untold',
      variantLabel: '250ml Body Spray',
      imageUrl: null,
      image: null,
      unitPriceKobo: 1_150_000,
      qty: 1,
      lineTotalKobo: 1_150_000,
    },
  ],
}

const message: EmailMessage = {
  to: 'ada@example.com',
  subject: 's',
  html: '<p>h</p>',
  text: 't',
}

const env = (over: Partial<ServerEnv>): ServerEnv =>
  ({
    SITE_URL: 'https://scentpocket.netlify.app',
    MAILGUN_API_BASE: 'https://api.mailgun.net',
    ...over,
  }) as ServerEnv

afterEach(() => vi.unstubAllGlobals())

describe('renderOrderEmail', () => {
  it('has the subject, first name, ref, items, totals and receipt link', async () => {
    const mail = await renderOrderEmail(
      order,
      'https://scentpocket.netlify.app/',
    )
    // React separates adjacent text nodes with comment markers; they are invisible in the email.
    const html = mail.html.replaceAll('<!-- -->', '')
    expect(mail.subject).toBe('Your Scentpocket order SP-24F7K2')
    for (const part of [
      'Thanks, Ada',
      'SP-24F7K2',
      'Khamrah EDP',
      '₦84,000',
      '₦95,500',
      '₦3,000',
      '₦98,500',
      '12 Ikorodu Road, Fadeyi, Yaba, Lagos',
      '+234 803 123 4567',
      'https://scentpocket.netlify.app/account/orders/SP-24F7K2',
    ]) {
      expect(html).toContain(part)
    }
  })

  it('serves thumbnails as small JPEGs through the image CDN with absolute urls', async () => {
    const { html } = await renderOrderEmail(
      order,
      'https://scentpocket.netlify.app',
    )
    expect(html).toContain(
      'https://scentpocket.netlify.app/.netlify/images?url=',
    )
    expect(html).toContain('fm=jpg')
  })

  it('shows the logo as an absolute PNG linked to the home page, with no SVG', async () => {
    const { html, text } = await renderOrderEmail(
      order,
      'https://scentpocket.com.ng/',
    )
    expect(html).toContain(
      'src="https://scentpocket.com.ng/email/scentpocket-email-logo.png"',
    )
    expect(html).toContain('href="https://scentpocket.com.ng"')
    expect(html).not.toContain('<svg')
    expect(text.startsWith('Scentpocket\n\nTHANKS, ADA')).toBe(true)
  })

  it('produces a readable plain text version without markup', async () => {
    const { text } = await renderOrderEmail(
      order,
      'https://scentpocket.netlify.app',
    )
    expect(text).toContain('SP-24F7K2')
    expect(text).not.toContain('<table')
  })

  it('shows free delivery instead of ₦0', async () => {
    const { html } = await renderOrderEmail(
      { ...order, deliveryFeeKobo: 0 },
      'https://s.test',
    )
    expect(html).toContain('Free')
  })
})

describe('deliverEmail', () => {
  const ok = (name: EmailProvider['name']): EmailProvider => ({
    name,
    send: vi.fn(),
  })
  const failing = (
    name: EmailProvider['name'],
    why: string,
  ): EmailProvider => ({
    name,
    send: vi.fn().mockRejectedValue(new Error(why)),
  })

  it('uses the first provider that works and does not try the rest', async () => {
    const second = ok('smtp')
    expect(await deliverEmail(message, [ok('mailgun'), second])).toEqual({
      ok: true,
      provider: 'mailgun',
    })
    expect(second.send).not.toHaveBeenCalled()
  })

  it('falls back to the next provider when the first fails', async () => {
    const result = await deliverEmail(message, [
      failing('mailgun', 'sandbox recipient'),
      ok('smtp'),
    ])
    expect(result).toEqual({ ok: true, provider: 'smtp' })
  })

  it('reports every failure when all providers fail, and never throws', async () => {
    const result = await deliverEmail(message, [
      failing('mailgun', 'a'),
      failing('smtp', 'b'),
    ])
    expect(result).toEqual({ ok: false, error: 'mailgun: a | smtp: b' })
  })

  it('says so when nothing is configured', async () => {
    expect(await deliverEmail(message, [])).toEqual({
      ok: false,
      error: 'No email provider is configured',
    })
  })

  it('truncates very long errors', async () => {
    const result = await deliverEmail(message, [
      failing('smtp', 'x'.repeat(2000)),
    ])
    expect(result.ok ? 0 : result.error.length).toBeLessThanOrEqual(500)
  })
})

describe('providers', () => {
  it('are null when not configured', () => {
    expect(createMailgunProvider(env({}))).toBeNull()
    expect(
      createMailgunProvider(env({ MAILGUN_API_KEY: 'k', MAILGUN_DOMAIN: 'd' })),
    ).toBeNull()
    expect(createSmtpProvider(env({}))).toBeNull()
    expect(createSmtpProvider(env({ SMTP_USER: 'u' }))).toBeNull()
  })

  it('mailgun posts to the domain with basic auth and the message fields', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{"id":"x"}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const provider = createMailgunProvider(
      env({
        MAILGUN_API_KEY: 'key-123',
        MAILGUN_DOMAIN: 'sandbox1.mailgun.org',
        MAILGUN_FROM: 'Scentpocket <postmaster@sandbox1.mailgun.org>',
      }),
    )
    await provider?.send(message)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.mailgun.net/v3/sandbox1.mailgun.org/messages')
    expect((init.headers as Record<string, string>).Authorization).toBe(
      `Basic ${Buffer.from('api:key-123').toString('base64')}`,
    )
    const body = init.body as FormData
    expect(body.get('to')).toBe('ada@example.com')
    expect(body.get('from')).toBe(
      'Scentpocket <postmaster@sandbox1.mailgun.org>',
    )
  })

  it('mailgun turns a non 2xx response into an error (so smtp can take over)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('Sandbox subdomains are for test purposes only', {
          status: 403,
        }),
      ),
    )
    const provider = createMailgunProvider(
      env({ MAILGUN_API_KEY: 'k', MAILGUN_DOMAIN: 'd', MAILGUN_FROM: 'f' }),
    )
    await expect(provider?.send(message)).rejects.toThrow('Mailgun 403')
  })
})
