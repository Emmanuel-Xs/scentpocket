import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'

export const tierEnum = pgEnum('tier', [
  'pocket',
  'arabian_gems',
  'designer',
  'niche',
])
export const genderEnum = pgEnum('gender', ['men', 'women', 'unisex'])
export const occasionEnum = pgEnum('occasion', [
  'office',
  'owambe',
  'date_night',
  'everyday',
])
export const scentFamilyEnum = pgEnum('scent_family', [
  'fresh',
  'woody',
  'amber',
  'floral',
  'gourmand',
])
export const longevityEnum = pgEnum('longevity', [
  'short',
  'moderate',
  'long',
  'very_long',
])
export const projectionEnum = pgEnum('projection', [
  'soft',
  'moderate',
  'strong',
])
export const roleEnum = pgEnum('role', ['customer', 'admin', 'owner'])
export const orderStatusEnum = pgEnum('order_status', [
  'placed',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
])
export const deliveryZoneEnum = pgEnum('delivery_zone', [
  'lagos_mainland',
  'lagos_island',
  'outside_lagos',
])
export const paymentMethodEnum = pgEnum('payment_method', [
  'pay_on_delivery',
  'paystack',
])
export const emailProviderEnum = pgEnum('email_provider', ['mailgun', 'smtp'])

const id = () => uuid('id').primaryKey().defaultRandom()
const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
const tstz = (name: string) => timestamp(name, { withTimezone: true })

// RLS is enabled on every table with no policies: only the server (Drizzle,
// connecting as the table owner) can read or write. Never add policies here.

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // equals auth.users.id
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  role: roleEnum('role').notNull().default('customer'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}).enableRLS()

export const products = pgTable(
  'products',
  {
    id: id(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    brand: text('brand').notNull(),
    description: text('description').notNull(),
    tier: tierEnum('tier').notNull(),
    gender: genderEnum('gender').notNull(),
    family: scentFamilyEnum('family').notNull(),
    occasions: occasionEnum('occasions')
      .array()
      .notNull()
      .default(sql`'{}'`),
    topNotes: text('top_notes')
      .array()
      .notNull()
      .default(sql`'{}'`),
    heartNotes: text('heart_notes')
      .array()
      .notNull()
      .default(sql`'{}'`),
    baseNotes: text('base_notes')
      .array()
      .notNull()
      .default(sql`'{}'`),
    longevity: longevityEnum('longevity').notNull(),
    projection: projectionEnum('projection').notNull(),
    inspiredById: uuid('inspired_by_id').references(
      (): AnyPgColumn => products.id,
      {
        onDelete: 'set null',
      },
    ),
    isActive: boolean('is_active').notNull().default(true),
    featuredRank: integer('featured_rank'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('products_tier_active_idx').on(t.tier, t.isActive)],
).enableRLS()

export const productImages = pgTable(
  'product_images',
  {
    id: id(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    path: text('path').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    blurDataUrl: text('blur_data_url').notNull(),
    alt: text('alt').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index('product_images_product_idx').on(t.productId)],
).enableRLS()

export const productVariants = pgTable(
  'product_variants',
  {
    id: id(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    sizeMl: integer('size_ml').notNull(),
    priceKobo: integer('price_kobo').notNull(),
    stock: integer('stock').notNull(),
    sku: text('sku').notNull().unique(),
    position: integer('position').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('product_variants_product_idx').on(t.productId),
    check('product_variants_price_positive', sql`${t.priceKobo} > 0`),
    check('product_variants_stock_nonneg', sql`${t.stock} >= 0`),
  ],
).enableRLS()

export const orders = pgTable(
  'orders',
  {
    id: id(),
    ref: text('ref').notNull().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id),
    status: orderStatusEnum('status').notNull().default('placed'),
    paymentMethod: paymentMethodEnum('payment_method')
      .notNull()
      .default('pay_on_delivery'),
    paymentRef: text('payment_ref'),
    customerName: text('customer_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    addressLine: text('address_line').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    deliveryZone: deliveryZoneEnum('delivery_zone').notNull(),
    subtotalKobo: integer('subtotal_kobo').notNull(),
    deliveryFeeKobo: integer('delivery_fee_kobo').notNull(),
    totalKobo: integer('total_kobo').notNull(),
    emailProvider: emailProviderEnum('email_provider'),
    emailSentAt: tstz('email_sent_at'),
    emailError: text('email_error'),
    idempotencyKey: text('idempotency_key').unique(),
    confirmedAt: tstz('confirmed_at'),
    shippedAt: tstz('shipped_at'),
    deliveredAt: tstz('delivered_at'),
    cancelledAt: tstz('cancelled_at'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('orders_user_created_idx').on(t.userId, t.createdAt.desc()),
    index('orders_status_idx').on(t.status),
  ],
).enableRLS()

export const orderItems = pgTable(
  'order_items',
  {
    id: id(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'restrict' }),
    productName: text('product_name').notNull(),
    variantLabel: text('variant_label').notNull(),
    imagePath: text('image_path').notNull(),
    unitPriceKobo: integer('unit_price_kobo').notNull(),
    qty: integer('qty').notNull(),
    lineTotalKobo: integer('line_total_kobo').notNull(),
  },
  (t) => [index('order_items_order_idx').on(t.orderId)],
).enableRLS()

/**
 * The signed in user's server side cart. Only variant and quantity are stored; prices and stock
 * are always read from product_variants. Shared by the web app and the mobile app.
 */
export const cartItems = pgTable(
  'cart_items',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique('cart_items_user_variant_unique').on(t.userId, t.variantId),
    check('cart_items_quantity_positive', sql`${t.quantity} > 0`),
  ],
).enableRLS()
