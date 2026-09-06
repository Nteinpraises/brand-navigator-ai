ALTER TABLE public.content_drafts ADD COLUMN IF NOT EXISTS image_paths jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.content_drafts
SET image_paths = to_jsonb(ARRAY[image_path])
WHERE image_path IS NOT NULL AND (image_paths IS NULL OR jsonb_array_length(image_paths) = 0);