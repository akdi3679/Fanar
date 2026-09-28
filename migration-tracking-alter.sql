-- Ensure visitors table exists with all tracking columns
CREATE TABLE IF NOT EXISTS visitors (
  id VARCHAR(36) PRIMARY KEY,
  session_id TEXT, user_agent TEXT, ip_address TEXT, country TEXT, city TEXT,
  referrer TEXT, landing_page TEXT, current_page TEXT,
  time_on_page INTEGER, time_on_site INTEGER,
  device_type TEXT, browser_name TEXT, browser_version TEXT,
  os_name TEXT, os_version TEXT,
  screen_width INTEGER, screen_height INTEGER, screen_color_depth INTEGER,
  language TEXT, timezone TEXT,
  is_first_visit BOOLEAN DEFAULT FALSE, visit_count INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS landing_page TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS current_page TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS time_on_page INTEGER;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS time_on_site INTEGER;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS browser_name TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS browser_version TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS os_name TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS os_version TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS screen_width INTEGER;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS screen_height INTEGER;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS screen_color_depth INTEGER;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS is_first_visit BOOLEAN DEFAULT FALSE;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Ensure page_views table exists with all columns
CREATE TABLE IF NOT EXISTS page_views (
  id VARCHAR(36) PRIMARY KEY,
  session_id TEXT NOT NULL,
  visitor_id VARCHAR(36) REFERENCES visitors(id),
  page TEXT NOT NULL, referrer TEXT,
  time_on_page INTEGER, scroll_depth INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(36);
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS time_on_page INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS scroll_depth INTEGER;