CREATE TABLE IF NOT EXISTS agent_metrics (
  id SERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL,
  ticket_id INT REFERENCES tickets(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NULL,
  success BOOLEAN,
  latency_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 