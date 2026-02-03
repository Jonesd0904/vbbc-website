-- Fix Row Level Security Policies for Public Reading
-- Run this in your Supabase SQL Editor to allow the frontend to read content

-- ============================================
-- SITE CONTENT TABLE
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to site_content" ON site_content;
DROP POLICY IF EXISTS "Allow anon read access to site_content" ON site_content;

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read site content
CREATE POLICY "Allow public read access to site_content"
ON site_content
FOR SELECT
TO anon, authenticated
USING (true);

-- Optionally, allow authenticated users to insert/update
-- (This allows admin to save without needing a service role key)
CREATE POLICY "Allow authenticated users to modify site_content"
ON site_content
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ============================================
-- SERVICE TIMES TABLE
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to service_times" ON service_times;

ALTER TABLE service_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to service_times"
ON service_times
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow authenticated users to modify service_times"
ON service_times
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ============================================
-- STAFF TABLE
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to staff" ON staff;

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to staff"
ON staff
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow authenticated users to modify staff"
ON staff
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ============================================
-- MINISTRIES TABLE
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to ministries" ON ministries;

ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to ministries"
ON ministries
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow authenticated users to modify ministries"
ON ministries
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ============================================
-- SERMONS TABLE (if exists)
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to sermons" ON sermons;

ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to sermons"
ON sermons
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow authenticated users to modify sermons"
ON sermons
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ============================================
-- EVENTS TABLE (if exists)
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to events" ON events;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to events"
ON events
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow authenticated users to modify events"
ON events
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('site_content', 'service_times', 'staff', 'ministries', 'sermons', 'events')
ORDER BY tablename, policyname;
