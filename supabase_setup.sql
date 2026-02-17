-- 1. Create site_content table
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create gallery_assets table
CREATE TABLE IF NOT EXISTS public.gallery_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    filename TEXT,
    category TEXT NOT NULL DEFAULT 'photography',
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS (Row Level Security) - Optional but recommended for production
-- For simplicity in this demo, we'll allow all read access and protect write access.
ALTER TABLE public.site_content ENABLE CONTROL; -- Note: user needs to set up actual RLS policies

-- 4. Initial Seed Data
INSERT INTO public.site_content (key, value, type) VALUES 
('hero_title', 'READY TO MANIFEST?', 'text'),
('hero_subtitle', 'MANIFEST YOUR VISION THROUGH OUR COLLECTIVE.', 'text'),
('hero_video', '', 'video')
ON CONFLICT (key) DO NOTHING;

-- 5. Note on Storage:
-- You need to manually create a public bucket named 'media' in the Supabase Dashboard.
-- Go to Storage -> New Bucket -> Name: 'media' -> Public: ON.
