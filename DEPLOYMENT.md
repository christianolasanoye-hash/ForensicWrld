# Forensic Wrld — Deployment Guide

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **GitHub Account**: For version control and Vercel deployment
3. **Vercel Account**: Free tier works perfectly

---

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: `forensic-wrld` (or your choice)
   - **Database Password**: Save this securely
   - **Region**: Choose closest to you
4. Wait ~2 minutes for project to initialize

### 1.2 Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase-schema.sql` from this repo
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify tables were created:
   - Go to **Table Editor**
   - You should see: `sections`, `media`, `events`, `merch`, `intakes`

### 1.3 Get API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.4 Set Up Storage (Optional, for media uploads)

1. Go to **Storage**
2. Create buckets:
   - `media/film`
   - `media/photo`
   - `media/events`
   - `media/merch`
3. Set policies:
   - **Public read** for all buckets
   - **Authenticated write** (for owner/admin later)

---

## Step 2: Local Development

### 2.1 Install Dependencies

```bash
cd wrld-studio
npm install
```

### 2.2 Set Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 2.3 Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Step 3: Deploy to Vercel

### 3.1 Push to GitHub

```bash
git add .
git commit -m "Initial commit: Forensic Wrld website"
git remote add origin https://github.com/yourusername/forensic-wrld.git
git push -u origin main
```

### 3.2 Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your GitHub repo
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `wrld-studio` (if repo is in subfolder)
   - **Environment Variables**:
     - `NEXT_PUBLIC_SUPABASE_URL` = (your Supabase URL)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your Supabase anon key)
5. Click **Deploy**

### 3.3 Custom Domain (Optional)

1. In Vercel project settings → **Domains**
2. Add your domain
3. Follow DNS instructions
4. SSL is automatic

---

## Step 4: Content Management (Owner Guide)

### 4.1 Adding Content via Supabase Studio

**No code required!** The owner can edit content directly in Supabase:

1. Go to [app.supabase.com](https://app.supabase.com) → Your project
2. Click **Table Editor**

#### Add Events:
- Open `events` table
- Click **Insert** → **Insert row**
- Fill: `title`, `date`, `location`, `is_upcoming` (true/false)
- Click **Save**

#### Add Merch:
- Open `merch` table
- Click **Insert** → **Insert row**
- Fill: `name`, `status` ("preview" or "coming_soon"), `image_url`
- Click **Save**

#### View Intake Submissions:
- Open `intakes` table
- See all form submissions
- Export to CSV if needed

### 4.2 Uploading Media

1. Go to **Storage** → Select bucket (e.g., `media/film`)
2. Click **Upload file**
3. Copy the public URL
4. Go to **Table Editor** → `media` table
5. Insert row:
   - `section_slug`: "film"
   - `type`: "image" or "video"
   - `url`: (paste the public URL)
   - `caption`: (optional)

---

## Step 5: Future Upgrades (Optional)

### Admin Dashboard
- Build a custom admin UI (Next.js route with auth)
- Use Supabase Auth for owner login
- Add role-based access control

### Email Notifications
- Set up Supabase Edge Functions
- Trigger on new intake submissions
- Send email via Resend/SendGrid

### Analytics
- Add Vercel Analytics (free)
- Or Google Analytics

### Payments
- Integrate Stripe for merch checkout
- Add booking payments for services

---

## Troubleshooting

### "Supabase environment variables are not set"
- Check `.env.local` (local) or Vercel environment variables (production)
- Ensure variable names match exactly (case-sensitive)

### "Failed to submit intake"
- Check Supabase RLS policies are set correctly
- Verify `intakes` table exists
- Check browser console for detailed errors

### Font not loading
- Verify `public/fonts/PolarVortex-raAA.ttf` exists
- Check font path in `app/layout.tsx`

---

## Support

For issues:
1. Check Supabase logs: **Logs** → **Postgres Logs**
2. Check Vercel logs: Project → **Deployments** → Click deployment → **Functions** tab
3. Check browser console for client-side errors

---

**Ready to launch!** 🚀

