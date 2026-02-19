-- Add extended fields for sections
ALTER TABLE sections ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE sections ADD COLUMN IF NOT EXISTS cta_text TEXT;
ALTER TABLE sections ADD COLUMN IF NOT EXISTS cta_link TEXT;
