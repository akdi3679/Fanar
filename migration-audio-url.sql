-- Add audio_url column to briefs if missing (NOT visitors)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'briefs' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE briefs ADD COLUMN audio_url TEXT;
  END IF;
END $$;