-- =============================================================================
-- Automatic Database Initialization Script for Khmer Project
-- Executed on container startup if data directory is empty
-- =============================================================================

CREATE DATABASE resource_storage_service;
CREATE DATABASE e_menu_platform;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE resource_storage_service TO postgres;
GRANT ALL PRIVILEGES ON DATABASE e_menu_platform TO postgres;
