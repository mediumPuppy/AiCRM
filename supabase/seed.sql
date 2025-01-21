-- Companies
INSERT INTO public.companies (name, branding) VALUES
('Acme Corp', '{"primary_color": "#FF0000", "secondary_color": "#000000", "company_url": "acme.com"}'),
('TechStart Inc', '{"primary_color": "#0000FF", "secondary_color": "#FFFFFF", "company_url": "techstart.io"}'),
('DevShop LLC', '{"primary_color": "#00FF00", "secondary_color": "#333333", "company_url": "devshop.dev"}');

-- Users (passwords would be properly hashed in production)
INSERT INTO public.users (company_id, role, full_name, email, password, status) VALUES
(1, 'admin', 'John Admin', 'admin@acme.com', 'test123', 'active'),
(1, 'agent', 'Jane Agent', 'agent@acme.com', 'test123', 'active'),
(1, 'customer', 'Bob Customer', 'customer@gmail.com', 'test123', 'active'),
(2, 'admin', 'Tech Admin', 'admin@techstart.io', 'test123', 'active'),
(2, 'agent', 'Tech Agent', 'agent@techstart.io', 'test123', 'active');

-- Contacts
INSERT INTO public.contacts (company_id, full_name, email, phone, metadata, status) VALUES
(1, 'Alice Johnson', 'alice@gmail.com', '+1234567890', '{"source": "website", "interest": "high"}', 'active'),
(1, 'Bob Wilson', 'bob@outlook.com', '+1234567891', '{"source": "referral", "interest": "medium"}', 'active'),
(2, 'Carol Smith', 'carol@yahoo.com', '+1234567892', '{"source": "linkedin", "interest": "high"}', 'active'),
(2, 'Dave Brown', 'dave@gmail.com', '+1234567893', '{"source": "website", "interest": "low"}', 'archived');

-- Tickets
INSERT INTO public.tickets (company_id, contact_id, assigned_to, subject, description, status, priority) VALUES
(1, 1, 2, 'Cannot access dashboard', 'Getting 404 error when trying to access dashboard', 'open', 'high'),
(1, 2, 2, 'Feature request', 'Would like to see dark mode option', 'in_progress', 'normal'),
(2, 3, 5, 'Integration issue', 'API keys not working', 'open', 'urgent'),
(2, 4, 5, 'Billing question', 'Need clarification on latest invoice', 'closed', 'low');

-- Notes
INSERT INTO public.notes (company_id, user_id, target_type, target_id, note) VALUES
(1, 1, 'ticket', 1, 'Investigated - seems like cache issue'),
(1, 2, 'contact', 1, 'Very responsive customer'),
(2, 4, 'ticket', 3, 'Escalated to dev team');

-- Attachments
INSERT INTO public.attachments (company_id, target_type, target_id, file_name, file_size, content_type, storage_path) VALUES
(1, 'ticket', 1, 'screenshot.png', 1024, 'image/png', 'tickets/1/screenshot.png'),
(1, 'ticket', 2, 'specs.pdf', 2048, 'application/pdf', 'tickets/2/specs.pdf');

-- Articles
INSERT INTO public.articles (company_id, title, slug, content, status, author_id) VALUES
(1, 'Getting Started Guide', 'getting-started', 'Here is how to get started...', 'published', 1),
(1, 'API Documentation', 'api-docs', 'API endpoints and usage...', 'published', 1),
(2, 'Troubleshooting Guide', 'troubleshooting', 'Common issues and solutions...', 'draft', 4);

-- Chat Sessions
INSERT INTO public.chat_sessions (company_id, contact_id, agent_id, status) VALUES
(1, 1, 2, 'active'),
(1, 2, 2, 'closed'),
(2, 3, 5, 'archived');

-- Chat Messages
INSERT INTO public.chat_messages (company_id, session_id, sender_type, sender_id, message, message_type) VALUES
(1, 1, 'contact', 1, 'Hi, I need help with login', 'text'),
(1, 1, 'agent', 2, 'I can help you with that', 'text'),
(1, 2, 'contact', 2, 'Is anyone available?', 'text'),
(1, 2, 'agent', 2, 'Yes, how can I help?', 'text');

-- Webhooks
INSERT INTO public.webhooks (company_id, webhook_type, endpoint, secret, events) VALUES
(1, 'outgoing', 'https://webhook.acme.com/crm', 'secret123', ARRAY['contact.created', 'ticket.created']::webhook_event_type[]),
(2, 'outgoing', 'https://api.techstart.io/webhook', 'secret456', ARRAY['ticket.status_changed']::webhook_event_type[]);

-- API Keys
INSERT INTO public.api_keys (company_id, api_key, label) VALUES
(1, 'ak_test_123', 'Development API Key'),
(2, 'ak_test_456', 'Test Environment');

-- Custom Fields
INSERT INTO public.custom_fields (company_id, table_name, field_name, field_type) VALUES
(1, 'contacts', 'industry', 'TEXT'),
(1, 'tickets', 'priority_reason', 'TEXT'),
(2, 'contacts', 'company_size', 'NUMBER');

-- Custom Field Values
INSERT INTO public.custom_field_values (custom_field_id, record_id, value) VALUES
(1, 1, 'Technology'),
(1, 2, 'Retail'),
(2, 1, 'Production impact'),
(3, 3, '500');