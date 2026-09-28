-- Manual SQL Migration for Fanar Studio
-- Run this in your Supabase/Postgres SQL editor

-- Create briefs table
CREATE TABLE IF NOT EXISTS briefs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  business_type TEXT,
  business_description TEXT,
  project_type TEXT,
  budget TEXT,
  timeline TEXT,
  language TEXT,
  
  -- Questionnaire answers (JSON)
  questionnaire JSONB,
  
  -- Visitor context
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  referrer TEXT,
  landing_page TEXT,
  time_on_site INTEGER,
  device_type TEXT,
  browser_name TEXT,
  os_name TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id SERIAL PRIMARY KEY,
  session_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  referrer TEXT,
  landing_page TEXT,
  current_page TEXT,
  time_on_page INTEGER,
  time_on_site INTEGER,
  device_type TEXT,
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  os_version TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  screen_color_depth INTEGER,
  language TEXT,
  timezone TEXT,
  is_first_visit BOOLEAN DEFAULT FALSE,
  visit_count INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  visitor_id INTEGER REFERENCES visitors(id),
  page TEXT NOT NULL,
  referrer TEXT,
  time_on_page INTEGER,
  scroll_depth INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON briefs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_briefs_email ON briefs(email);
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);

-- Update briefs table to add questionnaire if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'briefs' AND column_name = 'questionnaire'
  ) THEN
    ALTER TABLE briefs ADD COLUMN questionnaire JSONB;
  END IF;
END $$;

Write-Host "  ✓ SQL migration generated`n" -ForegroundColor Green