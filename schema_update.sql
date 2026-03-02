-- 1. User Inquiries Table (1:1 Inquiry Center)
CREATE TABLE IF NOT EXISTS user_inquiries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'answered'
  response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Site Documents Table (Guidelines & Terms)
CREATE TABLE IF NOT EXISTS site_docs (
  type TEXT PRIMARY KEY, -- 'guidelines', 'terms'
  content TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Content
INSERT OR IGNORE INTO site_docs (type, content) VALUES 
('guidelines', '<h1>이용 가이드</h1><p>필리핀 JTV 협회 서비스 이용 가이드입니다.</p>'),
('terms', '<h1>이용 약관</h1><p>서비스 이용 약관입니다. 본 서비스를 이용함으로써 귀하는 본 약관에 동의하게 됩니다.</p>');
