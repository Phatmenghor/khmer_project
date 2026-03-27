-- ============================================================================
-- V8: Full User Profile - Employment, Address, Emergency Contacts, Documents, Educations
-- ============================================================================

-- ── New columns on users ─────────────────────────────────────────────────────

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS nickname         VARCHAR(100),
    ADD COLUMN IF NOT EXISTS gender           VARCHAR(20),
    ADD COLUMN IF NOT EXISTS date_of_birth    DATE,
    ADD COLUMN IF NOT EXISTS employee_id      VARCHAR(50),
    ADD COLUMN IF NOT EXISTS department       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS employment_type  VARCHAR(30),
    ADD COLUMN IF NOT EXISTS join_date        DATE,
    ADD COLUMN IF NOT EXISTS leave_date       DATE,
    ADD COLUMN IF NOT EXISTS shift            VARCHAR(255),
    ADD COLUMN IF NOT EXISTS remark           TEXT;

-- ── user_addresses ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_addresses (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    version     BIGINT      NOT NULL DEFAULT 0,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    created_by  VARCHAR(255),
    updated_by  VARCHAR(255),
    is_deleted  BOOLEAN     NOT NULL DEFAULT false,
    deleted_at  TIMESTAMP,
    deleted_by  VARCHAR(255),

    user_id     UUID        NOT NULL UNIQUE,
    house_no    VARCHAR(100),
    street      VARCHAR(255),
    village     VARCHAR(255),
    commune     VARCHAR(255),
    district    VARCHAR(255),
    province    VARCHAR(255),
    country     VARCHAR(100) DEFAULT 'Cambodia',

    CONSTRAINT fk_user_address_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── user_emergency_contacts ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_emergency_contacts (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    version      BIGINT      NOT NULL DEFAULT 0,
    created_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP,
    created_by   VARCHAR(255),
    updated_by   VARCHAR(255),
    is_deleted   BOOLEAN     NOT NULL DEFAULT false,
    deleted_at   TIMESTAMP,
    deleted_by   VARCHAR(255),

    user_id      UUID        NOT NULL,
    name         VARCHAR(255) NOT NULL,
    phone        VARCHAR(50),
    relationship VARCHAR(100),

    CONSTRAINT fk_emergency_contact_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── user_documents ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_documents (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    version    BIGINT      NOT NULL DEFAULT 0,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN     NOT NULL DEFAULT false,
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255),

    user_id    UUID        NOT NULL,
    type       VARCHAR(50),
    number     VARCHAR(100),
    file_url   TEXT,

    CONSTRAINT fk_document_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── user_educations ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_educations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    version         BIGINT      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP,
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    is_deleted      BOOLEAN     NOT NULL DEFAULT false,
    deleted_at      TIMESTAMP,
    deleted_by      VARCHAR(255),

    user_id         UUID        NOT NULL,
    level           VARCHAR(50),
    school_name     VARCHAR(255),
    field_of_study  VARCHAR(255),
    start_year      VARCHAR(4),
    end_year        VARCHAR(4),
    is_graduated    BOOLEAN     DEFAULT false,
    certificate_url TEXT,

    CONSTRAINT fk_education_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
