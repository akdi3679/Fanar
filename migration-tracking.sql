-- Ensure visitors table has all tracking columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='visitors') THEN
    CREATE TABLE visitors (
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
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='page_views') THEN
    CREATE TABLE page_views (
      id VARCHAR(36) PRIMARY KEY,
      session_id TEXT NOT NULL,
      visitor_id VARCHAR(36) REFERENCES visitors(id),
      page TEXT NOT NULL, referrer TEXT,
      time_on_page INTEGER, scroll_depth INTEGER,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  END IF;
END $$;