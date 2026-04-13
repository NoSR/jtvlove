-- ============================================
-- CCA SNS Feed: Schema Updates (v2)
-- ============================================

-- 1. Gallery Likes 
CREATE TABLE IF NOT EXISTS gallery_likes (
  id TEXT PRIMARY KEY,
  gallery_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gallery_id) REFERENCES gallery(id) ON DELETE CASCADE,
  UNIQUE(gallery_id, visitor_id)
);

-- 2. Gallery Comments
CREATE TABLE IF NOT EXISTS gallery_comments (
  id TEXT PRIMARY KEY,
  gallery_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_id TEXT NOT NULL, -- Login required now!
  author_image TEXT, 
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gallery_id) REFERENCES gallery(id) ON DELETE CASCADE
);

-- 3. Gallery Comment Votes (Like / Dislike)
CREATE TABLE IF NOT EXISTS gallery_comment_votes (
  id TEXT PRIMARY KEY,
  comment_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK(vote_type IN ('like', 'dislike')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES gallery_comments(id) ON DELETE CASCADE,
  UNIQUE(comment_id, user_id)
);

-- 4. CCA Follows
CREATE TABLE IF NOT EXISTS cca_follows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  cca_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cca_id) REFERENCES ccas(id) ON DELETE CASCADE,
  UNIQUE(user_id, cca_id)
);
