-- Add audioUrl column to briefs (run this in Supabase SQL editor if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'briefs' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE briefs ADD COLUMN audio_url TEXT;
  END IF;
END $$;