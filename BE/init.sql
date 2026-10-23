-- =====================================================================
-- BookLeaf Author Support Portal - 001_init.sql
-- Source of truth for the schema. Prisma models are generated from this
-- with `prisma db pull`. Never use `prisma migrate` on this database.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS bookleaf
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bookleaf;

-- ---------------------------------------------------------------------
-- 1. users : everyone who can log in
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email          VARCHAR(191)    NOT NULL,
  password_hash  VARCHAR(255)    NOT NULL,
  name           VARCHAR(120)    NOT NULL,
  role           ENUM('AUTHOR','ADMIN','SUPER_ADMIN') NOT NULL DEFAULT 'AUTHOR',
  is_active      TINYINT(1)      NOT NULL DEFAULT 1,
  last_login_at  DATETIME        NULL,
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_active (role, is_active)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. author_profiles : 1:1 extension of users for authors
-- ---------------------------------------------------------------------
CREATE TABLE author_profiles (
  user_id              BIGINT UNSIGNED NOT NULL,
  author_code          VARCHAR(20)     NOT NULL,          -- AUTH001
  phone                VARCHAR(25)     NULL,
  city                 VARCHAR(80)     NULL,
  joined_date          DATE            NULL,
  bank_details_linked  TINYINT(1)      NOT NULL DEFAULT 1,
  created_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_author_profiles_code (author_code),
  CONSTRAINT fk_author_profiles_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. books
-- ---------------------------------------------------------------------
CREATE TABLE books (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  book_code         VARCHAR(20)     NOT NULL,             -- BK001
  author_id         BIGINT UNSIGNED NOT NULL,
  title             VARCHAR(255)    NOT NULL,
  isbn              VARCHAR(32)     NOT NULL,             -- string: seed values are placeholders
  genre             VARCHAR(120)    NULL,
  publication_date  DATE            NULL,                 -- NULL while in production
  status            ENUM('MANUSCRIPT_RECEIVED','EDITING','COVER_DESIGN','TYPESETTING',
                         'PROOFREADING','ISBN_ASSIGNMENT','PRINTING',
                         'DISTRIBUTION_SETUP','PUBLISHED_LIVE')
                    NOT NULL DEFAULT 'MANUSCRIPT_RECEIVED',
  mrp               DECIMAL(10,2)   NULL,                 -- NULL while in production
  royalty_per_copy  DECIMAL(10,2)   NULL,
  copies_sold       INT UNSIGNED    NOT NULL DEFAULT 0,
  royalty_earned    DECIMAL(12,2)   NOT NULL DEFAULT 0,
  royalty_paid      DECIMAL(12,2)   NOT NULL DEFAULT 0,
  royalty_pending   DECIMAL(12,2)   NOT NULL DEFAULT 0,
  last_payout_date  DATE            NULL,                 -- NULL = never paid
  print_partner     ENUM('IN_HOUSE','REPRO_INDIA','EPITOME_BOOKS') NULL,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_books_code (book_code),
  UNIQUE KEY uq_books_isbn (isbn),
  KEY idx_books_author_status (author_id, status),
  CONSTRAINT fk_books_author
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT chk_books_royalty_balance
    CHECK (royalty_paid + royalty_pending = royalty_earned)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. book_platforms : normalised "available_on"
-- ---------------------------------------------------------------------
CREATE TABLE book_platforms (
  book_id   BIGINT UNSIGNED NOT NULL,
  platform  ENUM('AMAZON_INDIA','FLIPKART','AMAZON_US','AMAZON_UK','BOOKLEAF_STORE') NOT NULL,
  PRIMARY KEY (book_id, platform),
  CONSTRAINT fk_book_platforms_book
    FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. tickets : core table
-- ---------------------------------------------------------------------
CREATE TABLE tickets (
  id                     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ticket_code            VARCHAR(20)     NULL,            -- TKT-000123, set by app after insert
  author_id              BIGINT UNSIGNED NOT NULL,
  book_id                BIGINT UNSIGNED NULL,            -- NULL = General / Account Level
  subject                VARCHAR(200)    NOT NULL,
  description            TEXT            NOT NULL,        -- the author's first message

  status                 ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',

  -- Final values (what the queue and the author see) + AI suggestion + override flag
  category               ENUM('ROYALTY_PAYMENTS','ISBN_METADATA','PRINTING_QUALITY',
                              'DISTRIBUTION_AVAILABILITY','BOOK_STATUS_PRODUCTION','GENERAL_INQUIRY')
                         NOT NULL DEFAULT 'GENERAL_INQUIRY',
  ai_category            ENUM('ROYALTY_PAYMENTS','ISBN_METADATA','PRINTING_QUALITY',
                              'DISTRIBUTION_AVAILABILITY','BOOK_STATUS_PRODUCTION','GENERAL_INQUIRY')
                         NULL,
  category_overridden    TINYINT(1)      NOT NULL DEFAULT 0,

  -- Declared CRITICAL..LOW so ORDER BY priority returns most urgent first
  priority               ENUM('CRITICAL','HIGH','MEDIUM','LOW') NOT NULL DEFAULT 'MEDIUM',
  ai_priority            ENUM('CRITICAL','HIGH','MEDIUM','LOW') NULL,
  priority_overridden    TINYINT(1)      NOT NULL DEFAULT 0,

  -- AI processing state
  ai_status              ENUM('PENDING','DONE','FAILED') NOT NULL DEFAULT 'PENDING',
  ai_reason              VARCHAR(500)    NULL,
  ai_draft               TEXT            NULL,
  ai_draft_generated_at  DATETIME        NULL,

  assigned_to_id         BIGINT UNSIGNED NULL,

  first_response_at      DATETIME        NULL,
  resolved_at            DATETIME        NULL,
  closed_at              DATETIME        NULL,
  last_activity_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_tickets_code (ticket_code),
  KEY idx_tickets_queue (status, priority, created_at),     -- admin queue
  KEY idx_tickets_author_created (author_id, created_at),   -- My Tickets
  KEY idx_tickets_assignee_status (assigned_to_id, status), -- assigned to me
  KEY idx_tickets_category (category),
  KEY idx_tickets_book (book_id),
  KEY idx_tickets_last_activity (last_activity_at),
  CONSTRAINT fk_tickets_author
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_tickets_book
    FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_assignee
    FOREIGN KEY (assigned_to_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. ticket_messages : author-visible conversation (replies only)
-- ---------------------------------------------------------------------
CREATE TABLE ticket_messages (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ticket_id        BIGINT UNSIGNED NOT NULL,
  sender_id        BIGINT UNSIGNED NOT NULL,
  sender_role      ENUM('AUTHOR','ADMIN') NOT NULL,
  body             TEXT            NOT NULL,
  was_ai_drafted   TINYINT(1)      NOT NULL DEFAULT 0,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_ticket_created (ticket_id, created_at),
  CONSTRAINT fk_messages_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. internal_notes : admin-only, never exposed to author endpoints
-- ---------------------------------------------------------------------
CREATE TABLE internal_notes (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ticket_id   BIGINT UNSIGNED NOT NULL,
  admin_id    BIGINT UNSIGNED NOT NULL,
  body        TEXT            NOT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notes_ticket_created (ticket_id, created_at),
  CONSTRAINT fk_notes_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_admin
    FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. notifications : persistent in-app bell
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  type        ENUM('TICKET_CREATED','TICKET_REPLY','TICKET_STATUS_CHANGED',
                   'TICKET_ASSIGNED','AI_FAILED') NOT NULL,
  title       VARCHAR(160)    NOT NULL,
  body        VARCHAR(500)    NULL,
  ticket_id   BIGINT UNSIGNED NULL,
  is_read     TINYINT(1)      NOT NULL DEFAULT 0,
  read_at     DATETIME        NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user_read_created (user_id, is_read, created_at),
  KEY idx_notifications_ticket (ticket_id),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. ai_usage_logs : cost and reliability evidence
-- ---------------------------------------------------------------------
CREATE TABLE ai_usage_logs (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ticket_id           BIGINT UNSIGNED NULL,
  type                ENUM('CLASSIFY','DRAFT') NOT NULL,
  provider            VARCHAR(30)     NOT NULL,           -- gemini | gpt
  model               VARCHAR(60)     NOT NULL,
  prompt_tokens       INT UNSIGNED    NULL,
  completion_tokens   INT UNSIGNED    NULL,
  latency_ms          INT UNSIGNED    NULL,
  success             TINYINT(1)      NOT NULL,
  error_message       VARCHAR(500)    NULL,
  created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ai_logs_ticket (ticket_id),
  KEY idx_ai_logs_created (created_at),
  CONSTRAINT fk_ai_logs_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE SET NULL
) ENGINE=InnoDB;