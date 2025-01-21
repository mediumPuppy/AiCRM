-- Add function to automatically delete expired API keys
CREATE OR REPLACE FUNCTION delete_expired_api_keys()
RETURNS trigger AS $$
BEGIN
  DELETE FROM api_keys
  WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run every minute
CREATE OR REPLACE TRIGGER cleanup_expired_api_keys
AFTER INSERT OR UPDATE ON api_keys
EXECUTE PROCEDURE delete_expired_api_keys();

-- Add index for expiration queries
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at); 