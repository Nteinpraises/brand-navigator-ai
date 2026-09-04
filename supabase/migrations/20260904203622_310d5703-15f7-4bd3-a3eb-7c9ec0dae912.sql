ALTER TABLE public.content_drafts
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS image_path text,
  ADD COLUMN IF NOT EXISTS linkedin_post_id text,
  ADD COLUMN IF NOT EXISTS linkedin_published_at timestamptz,
  ADD COLUMN IF NOT EXISTS day_theme text;

DROP POLICY IF EXISTS "Users read own post images" ON storage.objects;
CREATE POLICY "Users read own post images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users upload own post images" ON storage.objects;
CREATE POLICY "Users upload own post images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users update own post images" ON storage.objects;
CREATE POLICY "Users update own post images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users delete own post images" ON storage.objects;
CREATE POLICY "Users delete own post images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);