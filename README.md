# Forensic Wrld

Creative agency website with full admin CMS.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `ADMIN_EMAILS` - Comma-separated list of admin email addresses

### 2. Create Admin User

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication → Users → Add User**
3. Create a user with email/password
4. Add that email to `ADMIN_EMAILS` in your `.env.local`

### 3. Access Admin Panel

Go to `/admin/login` and sign in with your admin credentials.

## Admin Dashboard

The admin panel at `/admin` lets you manage:

| Section | What You Can Edit |
|---------|-------------------|
| **Site Content** | Hero text, section descriptions, background media |
| **Gallery** | Photos & videos for each section |
| **Events** | Events with dates, locations, registration links |
| **Merch** | Products with images, prices, external shop links |
| **Model Team** | Talent profiles with headshots |
| **Influencers** | Creator network with stats |
| **Intakes** | Client consultation requests |
| **Newsletter** | Subscribers + CSV export |
| **Outreach** | Email campaign tracking |
| **Social Links** | Header/footer links |
| **Settings** | Site name, social URLs, analytics |

## Deployment (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

## Tech Stack

- Next.js 16 + React 19
- TypeScript + Tailwind CSS 4
- Supabase (Database + Auth + Storage)
