-- AlterTable: Add Shiprocket tracking fields to orders
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "shiprocket_order_id" VARCHAR(60),
  ADD COLUMN IF NOT EXISTS "awb_code"            VARCHAR(60),
  ADD COLUMN IF NOT EXISTS "courier_name"        VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "tracking_url"        TEXT;
