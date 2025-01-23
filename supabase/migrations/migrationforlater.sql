-- THIS MIGRATION IS INCOMPLETE AND SHOULD BE COMPLETED LATER


-- Create private schema for internal tables
CREATE SCHEMA IF NOT EXISTS private;

-- Move only the truly internal/sensitive tables to private schema
ALTER TABLE public.api_keys SET SCHEMA private;
ALTER TABLE public.webhooks SET SCHEMA private;
ALTER TABLE public.portal_sessions SET SCHEMA private;
ALTER TABLE public.custom_fields SET SCHEMA private;
ALTER TABLE public.custom_field_values SET SCHEMA private;

-- Add comments to document public API endpoints
COMMENT ON TABLE public.companies IS 'Company settings and configuration';
COMMENT ON TABLE public.teams IS 'Team organization within a company';
COMMENT ON TABLE public.users IS 'Company users and agents';
COMMENT ON TABLE public.contacts IS 'Customer contact information';
COMMENT ON TABLE public.tickets IS 'Support tickets';
COMMENT ON TABLE public.notes IS 'Notes on tickets and contacts';
COMMENT ON TABLE public.tags IS 'Custom tags for organizing tickets and contacts';
COMMENT ON TABLE public.taggables IS 'Relationships between tags and entities';
COMMENT ON TABLE public.articles IS 'Knowledge base articles';
COMMENT ON TABLE public.chat_sessions IS 'Customer chat sessions';
COMMENT ON TABLE public.chat_messages IS 'Messages within chat sessions';

-- Enable RLS on all public tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taggables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (you'll need to adjust these based on your exact needs)
CREATE POLICY "Companies can view their own data"
ON public.companies FOR SELECT
USING (id = auth.jwt() ->> 'company_id');

CREATE POLICY "Companies can manage their own tags"
ON public.tags FOR ALL
USING (company_id = auth.jwt() ->> 'company_id');

CREATE POLICY "Companies can add notes to their tickets"
ON public.notes FOR ALL
USING (company_id = auth.jwt() ->> 'company_id');

-- Add these indexes
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(company_id, priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(company_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_subject_description ON public.tickets USING gin(to_tsvector('english', subject || ' ' || description));

ALTER TABLE public.chat_sessions
ADD COLUMN last_message_at TIMESTAMPTZ;