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

