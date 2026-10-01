CREATE TYPE "public"."delivery_zone" AS ENUM('lagos_mainland', 'lagos_island', 'outside_lagos');--> statement-breakpoint
CREATE TYPE "public"."email_provider" AS ENUM('mailgun', 'smtp');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('men', 'women', 'unisex');--> statement-breakpoint
CREATE TYPE "public"."longevity" AS ENUM('short', 'moderate', 'long', 'very_long');--> statement-breakpoint
CREATE TYPE "public"."occasion" AS ENUM('office', 'owambe', 'date_night', 'everyday');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('placed', 'confirmed', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('pay_on_delivery', 'paystack');--> statement-breakpoint
CREATE TYPE "public"."projection" AS ENUM('soft', 'moderate', 'strong');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('customer', 'admin', 'owner');--> statement-breakpoint
CREATE TYPE "public"."scent_family" AS ENUM('fresh', 'woody', 'amber', 'floral', 'gourmand');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('pocket', 'arabian_gems', 'designer', 'niche');--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"variant_label" text NOT NULL,
	"image_path" text NOT NULL,
	"unit_price_kobo" integer NOT NULL,
	"qty" integer NOT NULL,
	"line_total_kobo" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref" text NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'placed' NOT NULL,
	"payment_method" "payment_method" DEFAULT 'pay_on_delivery' NOT NULL,
	"payment_ref" text,
	"customer_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address_line" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"delivery_zone" "delivery_zone" NOT NULL,
	"subtotal_kobo" integer NOT NULL,
	"delivery_fee_kobo" integer NOT NULL,
	"total_kobo" integer NOT NULL,
	"email_provider" "email_provider",
	"email_sent_at" timestamp with time zone,
	"email_error" text,
	"idempotency_key" text,
	"confirmed_at" timestamp with time zone,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_ref_unique" UNIQUE("ref"),
	CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"path" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"blur_data_url" text NOT NULL,
	"alt" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"label" text NOT NULL,
	"size_ml" integer NOT NULL,
	"price_kobo" integer NOT NULL,
	"stock" integer NOT NULL,
	"sku" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku"),
	CONSTRAINT "product_variants_price_positive" CHECK ("product_variants"."price_kobo" > 0),
	CONSTRAINT "product_variants_stock_nonneg" CHECK ("product_variants"."stock" >= 0)
);
--> statement-breakpoint
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"brand" text NOT NULL,
	"description" text NOT NULL,
	"tier" "tier" NOT NULL,
	"gender" "gender" NOT NULL,
	"family" "scent_family" NOT NULL,
	"occasions" "occasion"[] DEFAULT '{}' NOT NULL,
	"top_notes" text[] DEFAULT '{}' NOT NULL,
	"heart_notes" text[] DEFAULT '{}' NOT NULL,
	"base_notes" text[] DEFAULT '{}' NOT NULL,
	"longevity" "longevity" NOT NULL,
	"projection" "projection" NOT NULL,
	"inspired_by_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"featured_rank" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"role" "role" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_inspired_by_id_products_id_fk" FOREIGN KEY ("inspired_by_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_user_created_idx" ON "orders" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_images_product_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variants_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "products_tier_active_idx" ON "products" USING btree ("tier","is_active");