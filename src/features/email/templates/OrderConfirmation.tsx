import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import type { OrderDetail } from '#/features/orders/types'
import { DELIVERY_ZONE_ETA, DELIVERY_ZONE_LABELS } from '#/lib/config'
import { formatKobo } from '#/lib/money'

type Props = {
  order: OrderDetail
  /** Public site origin, no trailing slash. Links and image URLs are built from it. */
  siteUrl: string
}

const ink = '#1C1915'
const cream = '#FAF6EF'
const border = '#E7DFD2'
const muted = '#5E564C'
const text2 = '#4A433B'
const font = 'Arial, Helvetica, sans-serif'
const serif = "'Instrument Serif', Georgia, 'Times New Roman', serif"

/** Email clients handle JPEG best, so thumbnails go through the site's image CDN as 128px JPEGs. */
function thumb(siteUrl: string, imageUrl: string) {
  return `${siteUrl}/.netlify/images?url=${encodeURIComponent(imageUrl)}&w=128&fm=jpg`
}

function prettyPhone(phone: string) {
  const m = /^\+234(\d{3})(\d{3})(\d{4})$/.exec(phone)
  return m ? `+234 ${m[1]} ${m[2]} ${m[3]}` : phone
}

export function OrderConfirmation({ order, siteUrl }: Props) {
  const firstName = order.customerName.split(' ')[0]
  const receiptUrl = `${siteUrl}/account/orders/${order.ref}`
  const label = (zone: OrderDetail['deliveryZone']) =>
    DELIVERY_ZONE_LABELS[zone]

  return (
    <Html lang="en">
      <Head />
      <Preview>{`Thanks, ${firstName}. Order ${order.ref} is in. Pay on delivery.`}</Preview>
      <Body
        style={{
          margin: 0,
          backgroundColor: cream,
          fontFamily: font,
          color: ink,
        }}
      >
        <Container
          style={{ maxWidth: 600, margin: '0 auto', backgroundColor: cream }}
        >
          <Section style={{ padding: '28px 32px 8px' }}>
            <Link
              href={siteUrl}
              style={{
                fontFamily: serif,
                fontSize: 26,
                color: ink,
                textDecoration: 'none',
              }}
            >
              scentpocket
            </Link>
          </Section>

          <Section style={{ padding: '16px 32px 0' }}>
            <Heading
              as="h1"
              style={{
                margin: 0,
                fontFamily: serif,
                fontWeight: 400,
                fontSize: 40,
                lineHeight: '1.05',
                color: ink,
              }}
            >
              Thanks, {firstName}. Your order is in.
            </Heading>
            <Text
              style={{
                margin: '14px 0 0',
                fontSize: 15,
                lineHeight: '1.6',
                color: text2,
              }}
            >
              We&apos;ve got order{' '}
              <strong style={{ color: ink }}>{order.ref}</strong>. We&apos;ll
              call you before the rider leaves. Pay when it arrives.
            </Text>
          </Section>

          <Section style={{ padding: '24px 32px 0' }}>
            <Button
              href={receiptUrl}
              style={{
                backgroundColor: ink,
                color: cream,
                fontFamily: font,
                fontWeight: 600,
                fontSize: 15,
                padding: '14px 24px',
                borderRadius: 999,
                textDecoration: 'none',
              }}
            >
              View your order
            </Button>
          </Section>

          <Section style={{ padding: '28px 32px 0' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: `1px solid ${border}`,
                borderRadius: 18,
                padding: '8px 20px 18px',
              }}
            >
              {order.items.map((item) => (
                <Row
                  key={item.id}
                  style={{ borderBottom: `1px solid ${border}` }}
                >
                  <Column
                    width={64}
                    style={{ padding: '14px 0', verticalAlign: 'middle' }}
                  >
                    {item.imageUrl ? (
                      <Img
                        src={thumb(siteUrl, item.imageUrl)}
                        alt=""
                        width={52}
                        height={52}
                        style={{ borderRadius: 10, backgroundColor: '#F3EADD' }}
                      />
                    ) : null}
                  </Column>
                  <Column
                    style={{
                      padding: '14px 0',
                      verticalAlign: 'middle',
                      fontSize: 15,
                    }}
                  >
                    <strong>{item.productName}</strong>
                    <br />
                    <span style={{ color: muted, fontSize: 13 }}>
                      {item.variantLabel} · Qty {item.qty}
                    </span>
                  </Column>
                  <Column
                    align="right"
                    style={{
                      padding: '14px 0',
                      verticalAlign: 'middle',
                      fontWeight: 600,
                      fontSize: 15,
                    }}
                  >
                    {formatKobo(item.lineTotalKobo)}
                  </Column>
                </Row>
              ))}
              <Row style={{ paddingTop: 14 }}>
                <Column
                  style={{
                    paddingTop: 14,
                    fontSize: 15,
                    color: text2,
                    lineHeight: '1.8',
                  }}
                >
                  Subtotal
                  <br />
                  Delivery · {label(order.deliveryZone)}
                  <br />
                  <strong style={{ color: ink, fontSize: 17 }}>
                    Total · pay on delivery
                  </strong>
                </Column>
                <Column
                  align="right"
                  style={{
                    paddingTop: 14,
                    fontSize: 15,
                    color: ink,
                    lineHeight: '1.8',
                  }}
                >
                  {formatKobo(order.subtotalKobo)}
                  <br />
                  {order.deliveryFeeKobo === 0
                    ? 'Free'
                    : formatKobo(order.deliveryFeeKobo)}
                  <br />
                  <strong style={{ fontSize: 18 }}>
                    {formatKobo(order.totalKobo)}
                  </strong>
                </Column>
              </Row>
            </div>
          </Section>

          <Section style={{ padding: '20px 32px 0' }}>
            <Row>
              <Column
                style={{
                  width: '50%',
                  verticalAlign: 'top',
                  paddingRight: 10,
                  fontSize: 14,
                  lineHeight: '1.6',
                  color: text2,
                }}
              >
                <strong
                  style={{
                    color: ink,
                    fontSize: 12,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  Delivering to
                </strong>
                <br />
                {order.customerName}
                <br />
                {order.addressLine}, {order.city}, {order.state}
                <br />
                {prettyPhone(order.phone)}
              </Column>
              <Column
                style={{
                  width: '50%',
                  verticalAlign: 'top',
                  paddingLeft: 10,
                  fontSize: 14,
                  lineHeight: '1.6',
                  color: text2,
                }}
              >
                <strong
                  style={{
                    color: ink,
                    fontSize: 12,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  When
                </strong>
                <br />
                Usually {DELIVERY_ZONE_ETA[order.deliveryZone]}.
                <br />
                Have {formatKobo(order.totalKobo)} ready in cash or transfer.
              </Column>
            </Row>
          </Section>

          <Section style={{ padding: '28px 32px' }}>
            <Hr style={{ borderTop: `2px dashed ${border}`, margin: 0 }} />
            <Text
              style={{
                margin: '16px 0 0',
                fontSize: 12,
                lineHeight: '1.6',
                color: muted,
              }}
            >
              Scentpocket is a demo store built for HNG Internship. Nothing will
              be delivered or charged. Questions? Reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
