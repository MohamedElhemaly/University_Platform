-- Fix Supabase Storage access for activity images stored under:
-- lecture-materials/activities/*
--
-- Run this in the Supabase SQL editor for the same project used in production.

CREATE POLICY "Users view activity images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lecture-materials' AND
    name LIKE 'activities/%'
  );

CREATE POLICY "Authenticated users upload activity images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lecture-materials' AND
    name LIKE 'activities/%' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users delete activity images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'lecture-materials' AND
    name LIKE 'activities/%' AND
    auth.role() = 'authenticated'
  );
