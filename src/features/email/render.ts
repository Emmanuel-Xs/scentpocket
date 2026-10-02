import { render } from '@react-email/render'
import type { OrderDetail } from '#/features/orders/types'
import { OrderConfirmation } from './templates/OrderConfirmation'

export type RenderedEmail = { subject: string; html: string; text: string }

/** The one place the confirmation is rendered, so the sent email and the receipt preview match. */
export async function renderOrderEmail(
  order: OrderDetail,
  siteUrl: string,
): Promise<RenderedEmail> {
  const element = OrderConfirmation({
    order,
    siteUrl: siteUrl.replace(/\/$/, ''),
  })
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ])
  // The logo image has no text, so the plain text would open with the bare home page link.
  const body = text.replace(/^https?:\/\/\S+\s*/, '')
  return {
    subject: `Your Scentpocket order ${order.ref}`,
    html,
    text: `Scentpocket\n\n${body}`,
  }
}
