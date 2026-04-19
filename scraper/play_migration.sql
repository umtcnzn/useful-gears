-- Migration: Add price game fields to products table
-- Run this in Supabase SQL Editor

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS price              numeric,
  ADD COLUMN IF NOT EXISTS image_url          text,
  ADD COLUMN IF NOT EXISTS amazon_product_url text;

-- Index for filtering products with prices (used by the /play game)
CREATE INDEX IF NOT EXISTS idx_products_price
  ON products (price)
  WHERE price IS NOT NULL;
