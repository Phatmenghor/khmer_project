-- ============================================================================
-- V9: Extract Personal Info, Employment, Telegram into dedicated tables
--     Add address_type to user_addresses (support CURRENT + PLACE_OF_BIRTH)
--     Remove Google OAuth columns
--     Remove notes, address (legacy string) from users
-- ============================================================================

-- ── user_profiles ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_profiles (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    version          BIGINT      NOT NULL DEFAULT 0,
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP,
    created_by       VARCHAR(255),
    updated_by       VARCHAR(255),
    is_deleted       BOOLEAN     NOT NULL DEFAULT false,
    deleted_at       TIMESTAMP,
    deleted_by       VARCHAR(255),

    user_id          UUID        NOT NULL UNIQUE,
    email            VARCHAR(255),
    first_name       VARCHAR(100),
    last_name        VARCHAR(100),
    nickname         VARCHAR(100),
    gender           VARCHAR(20),
    date_of_birth    DATE,
    phone_number     VARCHAR(50),
    profile_image_url TEXT,

    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Migrate existing data
INSERT INTO user_profiles (id, version, created_at, updated_at, created_by, is_deleted,
    user_id, email, first_name, last_name, nickname, gender, date_of_birth, phone_number, profile_image_url)
SELECT gen_random_uuid(), 0, NOW(), NOW(), 'migration', false,
    id, email, first_name, last_name, nickname, gender, date_of_birth, phone_number, profile_image_url
FROM users
WHERE is_deleted = false;

-- ── user_employments ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_employments (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    version          BIGINT      NOT NULL DEFAULT 0,
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP,
    created_by       VARCHAR(255),
    updated_by       VARCHAR(255),
    is_deleted       BOOLEAN     NOT NULL DEFAULT false,
    deleted_at       TIMESTAMP,
    deleted_by       VARCHAR(255),

    user_id          UUID        NOT NULL UNIQUE,
    employee_id      VARCHAR(50),
    position         VARCHAR(255),
    department       VARCHAR(255),
    employment_type  VARCHAR(30),
    join_date        DATE,
    leave_date       DATE,
    shift            VARCHAR(100),

    CONSTRAINT fk_employment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Migrate existing data (only users with at least one employment field set)
INSERT INTO user_employments (id, version, created_at, updated_at, created_by, is_deleted,
    user_id, employee_id, position, department, employment_type, join_date, leave_date, shift)
SELECT gen_random_uuid(), 0, NOW(), NOW(), 'migration', false,
    id, employee_id, position, department, employment_type, join_date, leave_date, shift
FROM users
WHERE is_deleted = false
  AND (employee_id IS NOT NULL OR position IS NOT NULL OR department IS NOT NULL
       OR employment_type IS NOT NULL OR join_date IS NOT NULL OR shift IS NOT NULL);

-- ── user_telegrams ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_telegrams (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    version             BIGINT      NOT NULL DEFAULT 0,
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP,
    created_by          VARCHAR(255),
    updated_by          VARCHAR(255),
    is_deleted          BOOLEAN     NOT NULL DEFAULT false,
    deleted_at          TIMESTAMP,
    deleted_by          VARCHAR(255),

    user_id             UUID        NOT NULL UNIQUE,
    telegram_id         BIGINT      UNIQUE,
    telegram_username   VARCHAR(255),
    telegram_first_name VARCHAR(255),
    telegram_last_name  VARCHAR(255),
    telegram_photo_url  TEXT,
    telegram_synced_at  TIMESTAMP,

    CONSTRAINT fk_telegram_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Migrate existing telegram data
INSERT INTO user_telegrams (id, version, created_at, updated_at, created_by, is_deleted,
    user_id, telegram_id, telegram_username, telegram_first_name, telegram_last_name, telegram_photo_url, telegram_synced_at)
SELECT gen_random_uuid(), 0, NOW(), NOW(), 'migration', false,
    id, telegram_id, telegram_username, telegram_first_name, telegram_last_name, telegram_photo_url, telegram_synced_at
FROM users
WHERE is_deleted = false AND telegram_id IS NOT NULL;

-- ── user_addresses: add address_type, drop UNIQUE constraint ─────────────────

ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS address_type VARCHAR(30);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'user_addresses' AND constraint_name = 'user_addresses_user_id_key'
    ) THEN
        ALTER TABLE user_addresses DROP CONSTRAINT user_addresses_user_id_key;
    END IF;
END $$;

-- ── Drop moved/removed columns from users ────────────────────────────────────

ALTER TABLE users
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS first_name,
    DROP COLUMN IF EXISTS last_name,
    DROP COLUMN IF EXISTS nickname,
    DROP COLUMN IF EXISTS gender,
    DROP COLUMN IF EXISTS date_of_birth,
    DROP COLUMN IF EXISTS phone_number,
    DROP COLUMN IF EXISTS profile_image_url,
    DROP COLUMN IF EXISTS employee_id,
    DROP COLUMN IF EXISTS position,
    DROP COLUMN IF EXISTS department,
    DROP COLUMN IF EXISTS employment_type,
    DROP COLUMN IF EXISTS join_date,
    DROP COLUMN IF EXISTS leave_date,
    DROP COLUMN IF EXISTS shift,
    DROP COLUMN IF EXISTS telegram_id,
    DROP COLUMN IF EXISTS telegram_username,
    DROP COLUMN IF EXISTS telegram_first_name,
    DROP COLUMN IF EXISTS telegram_last_name,
    DROP COLUMN IF EXISTS telegram_photo_url,
    DROP COLUMN IF EXISTS telegram_synced_at,
    DROP COLUMN IF EXISTS google_id,
    DROP COLUMN IF EXISTS google_email,
    DROP COLUMN IF EXISTS google_synced_at,
    DROP COLUMN IF EXISTS address,
    DROP COLUMN IF EXISTS notes;
