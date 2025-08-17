CREATE TABLE IF NOT EXISTS channels (
  id VARCHAR(11) PRIMARY KEY,

  status TINYINT,   /* 1: PUBLISHED, 2: UNPUBLISHED, 3: DELETED */
  is_primary BOOLEAN UNIQUE,  /* True or NULL*/
  data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS channels_status on channels (status);
CREATE INDEX IF NOT EXISTS channels_is_primary on channels (is_primary);
CREATE INDEX IF NOT EXISTS channels_created_at on channels (created_at);
CREATE INDEX IF NOT EXISTS channels_updated_at on channels (updated_at);

CREATE TABLE IF NOT EXISTS items (
  id VARCHAR(11) PRIMARY KEY,
  status TINYINT, /* 1: PUBLISHED, 2: UNPUBLISHED, 3: DELETED */
  data TEXT,
  pub_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS items_pub_date on items (pub_date);
CREATE INDEX IF NOT EXISTS items_created_at on items (created_at);
CREATE INDEX IF NOT EXISTS items_updated_at on items (updated_at);
CREATE INDEX IF NOT EXISTS items_status on items (status);

CREATE TABLE IF NOT EXISTS settings (
  category VARCHAR(20) PRIMARY KEY,
  data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(11) PRIMARY KEY,
  item_id VARCHAR(11) NOT NULL,
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE INDEX IF NOT EXISTS comments_item_id on comments (item_id);
CREATE INDEX IF NOT EXISTS comments_status on comments (status);
CREATE INDEX IF NOT EXISTS comments_created_at on comments (created_at);
