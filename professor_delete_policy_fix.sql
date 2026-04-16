-- Allow admins to fully manage professor records and related cleanup tables.
-- Run this in the Supabase SQL editor for the same project used by the app.

DROP POLICY IF EXISTS "Admins can manage professors" ON professors;
CREATE POLICY "Admins can manage professors" ON professors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can delete all profiles" ON profiles;
CREATE POLICY "Admins can delete all profiles" ON profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage lecture questions" ON lecture_questions;
CREATE POLICY "Admins can manage lecture questions" ON lecture_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );
