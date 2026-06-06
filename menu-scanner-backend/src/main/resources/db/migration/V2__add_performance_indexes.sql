-- flyway:executeInTransaction=false
-- V2: Performance indexes for high-frequency query patterns.
-- Created CONCURRENTLY to avoid table locks in production (requires non-transactional execution).

-- Orders: pagination by business + status, customer history, cleanup job
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_business_status
    ON orders (business_id, status)
    WHERE is_deleted = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_created
    ON orders (customer_id, created_at DESC)
    WHERE is_deleted = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at
    ON orders (created_at DESC)
    WHERE is_deleted = false;

-- Order items: join from order detail queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id
    ON order_items (order_id);

-- Order status history: batch-load by order IDs (N+1 fix)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_status_history_order_id
    ON order_status_history (order_id, created_at ASC);

-- Users: login by email/phone (auth hot path)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email
    ON users (email)
    WHERE is_deleted = false;

-- Blacklisted tokens: JWT revocation check (auth hot path)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blacklisted_tokens_token_hash
    ON blacklisted_tokens (token);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blacklisted_tokens_expires_at
    ON blacklisted_tokens (expires_at);

-- Cart items: cart load per customer session
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_cart_id
    ON cart_items (cart_id);
