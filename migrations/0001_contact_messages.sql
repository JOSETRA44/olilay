-- Contact form submissions. Applied with: npm run db:migrate:local / db:migrate:remote
CREATE TABLE IF NOT EXISTS contact_messages (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  organization TEXT,
  topic        TEXT NOT NULL,
  message      TEXT NOT NULL,
  locale       TEXT NOT NULL DEFAULT 'es',
  consent      INTEGER NOT NULL DEFAULT 1,
  received_at  TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'new' -- new | replied | archived
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_received_at ON contact_messages (received_at DESC);
