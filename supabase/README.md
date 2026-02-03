# Fixing the Giving Page Not Showing Issue

## The Problem
The admin dashboard can save the giving settings, but the frontend doesn't display them. This is caused by **Row Level Security (RLS) policies** in Supabase blocking public read access.

## The Solution
Run the SQL script to enable public read access for all content tables.

## Steps to Fix:

### 1. Go to Supabase SQL Editor
1. Open your Supabase project: https://supabase.com/dashboard/project/vjgxldrlflqqeztbbniw
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the Fix Script
1. Copy the entire contents of `supabase/fix_rls_policies.sql`
2. Paste it into the SQL Editor
3. Click **Run** (or press Ctrl+Enter)
4. You should see a success message

### 3. Verify the Fix
After running the SQL:
1. Visit: https://vbbc-website.vercel.app/api/test-content
2. You should see your giving settings in the JSON response
3. Visit: https://vbbc-website.vercel.app/giving
4. The giving form should now appear if you enabled it in admin

## What This Does
The SQL script:
- Enables Row Level Security (RLS) on all content tables
- Creates policies that allow **anyone** to READ content (necessary for public website)
- Creates policies that allow **authenticated users** to WRITE content (for admin)

## Alternative: Quick Test via Supabase Dashboard
If you want to test without running SQL:

1. Go to **Database** → **Tables** → `site_content`
2. Click **RLS** tab
3. Click **New Policy**
4. Choose **Enable read access for all users**
5. Save

Repeat for other tables: `service_times`, `staff`, `ministries`, `sermons`, `events`

## Still Not Working?
If it still doesn't work after running the SQL:

1. Clear your browser cache
2. Try the test API: `/api/test-content`
3. Check browser console (F12) for errors
4. Let me know what you see in the debug output!
