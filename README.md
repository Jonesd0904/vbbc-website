# Victory Bible Baptist Church Website

A modern, fast website built with Next.js 14, Tailwind CSS, and Supabase.

## Features

- 🚀 **Fast & Modern** - Built with Next.js 14 App Router
- 📱 **Fully Responsive** - Looks great on all devices
- 🎨 **Beautiful Design** - Navy & gold color scheme with smooth animations
- 📺 **Livestream** - Facebook Live & YouTube integration
- 🎤 **Sermon Archive** - Searchable sermon database with Supabase
- ✉️ **Contact Form** - Ready for Formspree integration
- 🆓 **Free Hosting** - Deploy on Vercel for free

## Pages

- Home
- About Us
- What We Believe
- Ministries
- Staff
- Sermons (with search & filter)
- Livestream (Facebook & YouTube)
- Contact
- How to Know God

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup (for Sermon Database)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → API and copy your URL and anon key

### 2. Create the Database Tables

Run this SQL in the Supabase SQL Editor:

```sql
-- Sermons table
CREATE TABLE sermons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  speaker TEXT NOT NULL,
  date DATE NOT NULL,
  series TEXT,
  scripture TEXT,
  description TEXT,
  youtube_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site content table (for general settings)
CREATE TABLE site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service times table
CREATE TABLE service_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day TEXT NOT NULL,
  label TEXT NOT NULL,
  time TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- Staff table
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0
);

-- Ministries table
CREATE TABLE ministries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'users',
  order_index INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON sermons FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON site_content FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON service_times FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON staff FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ministries FOR SELECT USING (true);

-- Allow public write (for admin dashboard - in production use auth)
CREATE POLICY "Allow public write" ON sermons FOR ALL USING (true);
CREATE POLICY "Allow public write" ON site_content FOR ALL USING (true);
CREATE POLICY "Allow public write" ON service_times FOR ALL USING (true);
CREATE POLICY "Allow public write" ON staff FOR ALL USING (true);
CREATE POLICY "Allow public write" ON ministries FOR ALL USING (true);
```

### 3. Add Environment Variables

Add your Supabase credentials to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vbbc-website.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your repository
4. Add your environment variables in the Vercel dashboard
5. Click "Deploy"

Your site will be live at `your-project.vercel.app`!

## Customization

### Update Church Information

Edit the content in each page file under `src/app/`:
- Service times
- Address and phone
- Pastor bios
- Ministry descriptions

### Update Social Links

Edit `src/components/Footer.tsx` and `src/app/livestream/page.tsx`:
- Facebook page URL
- YouTube channel URL

### Update Livestream Embeds

Edit `src/app/livestream/page.tsx`:
1. Replace the Facebook embed with your church's Facebook Live URL
2. Replace the YouTube channel ID with your church's channel

### Add Your Logo

Replace the SVG logo in `src/components/Navbar.tsx` with your church logo.

### Contact Form

To make the contact form work:
1. Sign up at [formspree.io](https://formspree.io)
2. Create a form
3. Update `src/app/contact/page.tsx` with your Formspree endpoint

## Admin Dashboard

The site includes a simple admin dashboard at `/admin` where you can update:

- **General Info** - Church name, address, phone, social links
- **Service Times** - Days, labels, and times
- **Staff** - Names, roles, and bios
- **Ministries** - Names and descriptions
- **Scripture** - Hero verse and Rock Solid section verse
- **Livestream** - Facebook Live and YouTube settings

**Default Password:** `vbbc2024`

> ⚠️ Change the password in `/src/app/admin/page.tsx` before deploying to production!

## Managing Sermons

You can add sermons directly in the Supabase dashboard:
1. Go to your Supabase project
2. Click on "Table Editor"
3. Select the "sermons" table
4. Click "Insert row" to add a new sermon

Or use the Supabase API to create an admin panel.

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Supabase](https://supabase.com/) - Database
- [Lucide React](https://lucide.dev/) - Icons
- [Vercel](https://vercel.com/) - Hosting

## Support

For help with this website, contact the developer or refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

Built with ❤️ for Victory Bible Baptist Church
