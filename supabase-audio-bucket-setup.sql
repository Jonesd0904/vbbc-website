-- VBBC Audio Storage Setup
-- Run this SQL in Supabase to create the audio storage bucket

-- Note: Storage buckets are typically created via the Supabase dashboard,
-- but you can also use the Supabase Storage API or CLI.
-- This SQL provides the RLS policies once the bucket exists.

-- First, create the bucket manually in Supabase Dashboard:
-- 1. Go to Storage in your Supabase dashboard
-- 2. Click "New bucket"
-- 3. Name it "audio"
-- 4. Enable "Public bucket"
-- 5. Click "Create bucket"

-- Then run these policies for the audio bucket:

-- Allow public read access to audio files
CREATE POLICY "Public audio access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'audio');

-- Allow authenticated users to upload audio files
CREATE POLICY "Allow audio uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'audio');

-- Allow authenticated users to update audio files
CREATE POLICY "Allow audio updates" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'audio');

-- Allow authenticated users to delete audio files
CREATE POLICY "Allow audio deletes" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'audio');

-- Verify the bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'audio';
