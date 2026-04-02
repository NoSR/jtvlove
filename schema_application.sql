-- ═══════════════════════════════════════════════════════
-- CCA 지원서 및 채용 제안 시스템 (Application & Job Offer)
-- ═══════════════════════════════════════════════════════

-- 22. CCA Applications Table (구직자 지원서)
CREATE TABLE IF NOT EXISTS cca_applications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  real_name TEXT,
  phone TEXT,
  email TEXT,
  age TEXT,
  body_size TEXT,
  languages TEXT,           -- JSON array string
  experience TEXT,
  introduction TEXT,
  image TEXT,
  pin TEXT NOT NULL,         -- 4-digit PIN for applicant status check
  status TEXT DEFAULT 'pending',  -- 'pending', 'reviewing', 'hired', 'rejected'
  venue_option TEXT,         -- 'registered', 'unregistered', 'unemployed'
  preferred_venue_id TEXT,   -- If registered venue selected
  preferred_venue_name TEXT, -- If unregistered venue typed
  pending_offers_count INTEGER DEFAULT 0,
  hired_venue_id TEXT,       -- Set when hired
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 23. CCA Job Offers Table (채용 제안)
CREATE TABLE IF NOT EXISTS cca_job_offers (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  venue_id TEXT NOT NULL,
  venue_name TEXT,
  message TEXT,              -- Optional message from venue admin
  status TEXT DEFAULT 'pending',  -- 'pending', 'accepted', 'rejected', 'expired'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  FOREIGN KEY (application_id) REFERENCES cca_applications(id),
  FOREIGN KEY (venue_id) REFERENCES venues(id)
);
