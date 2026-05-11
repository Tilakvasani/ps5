-- Replace Shiprocket fields with BaseLinker field
ALTER TABLE "orders"
  DROP COLUMN IF EXISTS "shiprocket_order_id",
  DROP COLUMN IF EXISTS "awb_code",
  DROP COLUMN IF EXISTS "courier_name",
  DROP COLUMN IF EXISTS "tracking_url",
  ADD COLUMN IF NOT EXISTS "baselinker_order_id" VARCHAR(60);
