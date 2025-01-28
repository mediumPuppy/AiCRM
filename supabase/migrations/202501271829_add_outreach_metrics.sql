-- Create outreach_metrics table
CREATE TABLE IF NOT EXISTS outreach_metrics (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT REFERENCES contacts(id) ON DELETE CASCADE,
  generation_time_ms DOUBLE PRECISION NOT NULL,
  instruction TEXT NOT NULL,
  accepted_on_first_try BOOLEAN,
  total_generations INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS outreach_metrics_contact_id_idx ON outreach_metrics(contact_id);
CREATE INDEX IF NOT EXISTS outreach_metrics_created_at_idx ON outreach_metrics(created_at);

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_outreach_metrics_updated_at ON outreach_metrics;
CREATE TRIGGER set_outreach_metrics_updated_at
  BEFORE UPDATE ON outreach_metrics
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp(); 