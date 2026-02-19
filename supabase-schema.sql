-- Forensic Wrld Database Schema
-- Run this in your Supabase SQL Editor

-- Sections table (for organizing content)
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- film, photography, social, etc
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media table (images and videos for sections)
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_slug TEXT NOT NULL REFERENCES sections(slug) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  is_upcoming BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merch table
CREATE TABLE IF NOT EXISTS merch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('preview', 'coming_soon')),
  image_url TEXT,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intakes table (form submissions)
CREATE TABLE IF NOT EXISTS intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch ENABLE ROW LEVEL SECURITY;
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read access, but only authenticated users can write
-- Sections: Public read
CREATE POLICY "Sections are viewable by everyone" ON sections
  FOR SELECT USING (true);

-- Media: Public read
CREATE POLICY "Media is viewable by everyone" ON media
  FOR SELECT USING (true);

-- Events: Public read
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

-- Merch: Public read
CREATE POLICY "Merch is viewable by everyone" ON merch
  FOR SELECT USING (true);

-- Intakes: Public insert (for form submissions), authenticated read
CREATE POLICY "Anyone can submit intakes" ON intakes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Intakes are viewable by authenticated users" ON intakes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default sections
INSERT INTO sections (slug, title, description, order_index) VALUES
  ('film', 'Film Campaigns', 'A small, sharp team that ships launch-ready video — from concept to final deliverables.', 1),
  ('photography', 'Photography', 'Clean black/white foundation with premium texture. Built for brands that want clarity and edge.', 2),
  ('social', 'Social Media Marketing', 'We connect brands with niche creators to generate leads & sales — without the corporate bloat.', 3),
  ('events', 'Events', 'Upcoming and past moments.', 4),
  ('mentorship', 'Consulting & Mentorship', 'Connect with professional mentors to define the next direction of your project or business.', 5),
  ('merch', 'Merch', 'View-only previews. No prices, no checkout, no purchases — just product cards and drop alerts.', 6)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SEO & SOCIAL SHARING SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Basic SEO
  site_title TEXT NOT NULL DEFAULT 'Forensic Wrld',
  site_description TEXT DEFAULT 'Creative agency for film, photography, and growth.',
  site_keywords TEXT DEFAULT 'creative agency, film, photography, branding, social marketing',

  -- Open Graph (Social Share)
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  og_type TEXT DEFAULT 'website',

  -- Twitter Card
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_handle TEXT,
  twitter_site TEXT,

  -- Favicon & Icons
  favicon_url TEXT,
  apple_touch_icon_url TEXT,

  -- Additional
  canonical_url TEXT,
  robots TEXT DEFAULT 'index, follow',
  google_analytics_id TEXT,
  google_site_verification TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read SEO settings" ON seo_settings
  FOR SELECT USING (true);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update SEO settings" ON seo_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert SEO settings" ON seo_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert default settings
INSERT INTO seo_settings (site_title, site_description)
VALUES ('Forensic Wrld', 'Creative agency for film, photography, and growth. Minimal, premium, and built for momentum.')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SOCIAL LINKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_name TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  show_in_header BOOLEAN DEFAULT false,
  show_in_footer BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read social links" ON social_links
  FOR SELECT USING (true);

-- Only authenticated users can manage
CREATE POLICY "Authenticated users can manage social links" ON social_links
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- BLOG POSTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  category TEXT,
  tags TEXT[],
  author_name TEXT DEFAULT 'Forensic Wrld',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts(status);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts(published_at DESC);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access for published posts
CREATE POLICY "Public can read published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Authenticated users can do everything
CREATE POLICY "Authenticated users can manage blog posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

