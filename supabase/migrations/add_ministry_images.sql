-- Add image and carousel fields to ministries table
-- Run this in your Supabase SQL Editor

-- Add image_url column
ALTER TABLE ministries 
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';

-- Add carousel_enabled column
ALTER TABLE ministries 
ADD COLUMN IF NOT EXISTS carousel_enabled BOOLEAN DEFAULT false;

-- Add carousel_images column (array of text for image URLs)
ALTER TABLE ministries 
ADD COLUMN IF NOT EXISTS carousel_images TEXT[] DEFAULT '{}';

-- Update existing rows to have empty array for carousel_images if NULL
UPDATE ministries 
SET carousel_images = '{}' 
WHERE carousel_images IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN ministries.image_url IS 'Main ministry image URL';
COMMENT ON COLUMN ministries.carousel_enabled IS 'Whether to show image carousel on ministries page';
COMMENT ON COLUMN ministries.carousel_images IS 'Array of image URLs for carousel display';
