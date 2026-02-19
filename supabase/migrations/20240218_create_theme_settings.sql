-- Theme settings table for colors, fonts, and design customization
CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Color settings
  primary_color VARCHAR(7) DEFAULT '#FFFFFF',
  secondary_color VARCHAR(7) DEFAULT '#000000',
  accent_color VARCHAR(7) DEFAULT '#FFFFFF',
  background_color VARCHAR(7) DEFAULT '#000000',
  text_color VARCHAR(7) DEFAULT '#FFFFFF',
  text_muted_color VARCHAR(7) DEFAULT '#999999',
  border_color VARCHAR(7) DEFAULT '#333333',

  -- Font settings
  heading_font VARCHAR(255) DEFAULT 'Giants',
  body_font VARCHAR(255) DEFAULT 'Polar Vortex',
  accent_font VARCHAR(255) DEFAULT 'Jamday',

  -- Custom fonts (stored as JSON array of font objects)
  custom_fonts JSONB DEFAULT '[]'::jsonb,

  -- Button styles
  button_style VARCHAR(50) DEFAULT 'solid',
  button_radius VARCHAR(20) DEFAULT '0px',

  -- Additional styling
  card_radius VARCHAR(20) DEFAULT '0px',
  image_radius VARCHAR(20) DEFAULT '0px',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only allow one row for theme settings (singleton pattern)
CREATE UNIQUE INDEX IF NOT EXISTS theme_settings_singleton ON theme_settings ((true));

-- Insert default settings
INSERT INTO theme_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

-- Public can read theme settings (needed to apply theme on frontend)
CREATE POLICY "Anyone can view theme settings"
  ON theme_settings FOR SELECT
  USING (true);

-- Only authenticated users can update theme settings
CREATE POLICY "Authenticated users can update theme settings"
  ON theme_settings FOR UPDATE
  USING (auth.role() = 'authenticated');
