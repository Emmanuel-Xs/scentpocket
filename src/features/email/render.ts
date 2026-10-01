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
  return { subject: `Your Scentpocket order ${order.ref}`, html, text }
}
