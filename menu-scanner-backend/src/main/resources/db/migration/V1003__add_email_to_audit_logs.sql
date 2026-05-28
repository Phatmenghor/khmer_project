-- Add user_email column to audit_logs table for better tracking of registration and public endpoint usage
ALTER TABLE audit_logs
ADD COLUMN user_email VARCHAR(255);

-- Create index on user_email for faster lookups
CREATE INDEX idx_audit_logs_user_email ON audit_logs(user_email);
