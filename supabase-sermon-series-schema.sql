-- VBBC Sermon Series Table Schema
-- Run this SQL in your Supabase SQL Editor to create/update the sermon_series table

-- Create sermon_series table (if not exists)
CREATE TABLE IF NOT EXISTS sermon_series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  scripture_ref VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering (if not exists)
CREATE INDEX IF NOT EXISTS idx_sermon_series_order ON sermon_series(order_index);

-- Enable Row Level Security
ALTER TABLE sermon_series ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access" ON sermon_series;
DROP POLICY IF EXISTS "Allow authenticated insert" ON sermon_series;
DROP POLICY IF EXISTS "Allow authenticated update" ON sermon_series;
DROP POLICY IF EXISTS "Allow authenticated delete" ON sermon_series;

-- Create policies
CREATE POLICY "Allow public read access" ON sermon_series
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON sermon_series
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON sermon_series
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete" ON sermon_series
  FOR DELETE USING (true);

-- Insert default sermon series (matching the original VBBC website)
-- Using ON CONFLICT to handle duplicates
INSERT INTO sermon_series (name, description, scripture_ref, image_url, order_index) VALUES
  ('Rock Solid', 'For their rock is not as our Rock... Building your life on the solid foundation of God''s Word.', 'Deuteronomy 32:31', '/images/series/rock-solid.svg', 1),
  ('Galatians', 'A study through the book of Galatians - Freedom in Christ.', 'Galatians', '/images/series/galatians.svg', 2),
  ('Ephesians', 'Exploring the riches of God''s grace in the book of Ephesians.', 'Ephesians', '/images/series/ephesians.svg', 3),
  ('Faith Building Series', 'Messages designed to strengthen and build your faith in God.', NULL, '/images/series/faith-building.svg', 4),
  ('The Truth About Salvation', 'Understanding the true gospel of Jesus Christ and the gift of salvation.', NULL, '/images/series/salvation.svg', 5),
  ('First Peter', 'A verse-by-verse study through 1 Peter - Hope in the midst of trials.', '1 Peter', '/images/series/first-peter.svg', 6),
  ('Second Peter', 'Growing in grace and knowledge through 2 Peter.', '2 Peter', '/images/series/second-peter.svg', 7),
  ('Acts of the Apostles', 'The birth and growth of the early church in the book of Acts.', 'Acts', '/images/series/acts.svg', 8),
  ('The Gospel of John', 'That ye might believe - A journey through the Gospel of John.', 'John', '/images/series/gospel-of-john.svg', 9),
  ('End Times Prophecy', 'Understanding Bible prophecy and the end times.', NULL, '/images/series/end-times.svg', 10),
  ('How to Share Christ', 'Equipping believers to share the gospel effectively.', NULL, '/images/series/share-christ.svg', 11),
  ('The Life of Elijah', 'Lessons from the life of the prophet Elijah.', '1 Kings 17-19', '/images/series/elijah.svg', 12),
  ('Colossians', 'Christ the preeminent one - A study in Colossians.', 'Colossians', '/images/series/colossians.svg', 13),
  ('Philippians', 'Joy in the Lord - A journey through Philippians.', 'Philippians', '/images/series/philippians.svg', 14),
  ('Stand-Alone Messages', 'Individual messages not part of a specific series.', NULL, '/images/series/standalone.svg', 99)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  scripture_ref = EXCLUDED.scripture_ref,
  image_url = EXCLUDED.image_url,
  order_index = EXCLUDED.order_index;

-- Verify tables
SELECT 'sermon_series table created/updated successfully' as status;
SELECT COUNT(*) as series_count FROM sermon_series;
