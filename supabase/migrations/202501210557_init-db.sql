-- Add all required extensions first
CREATE EXTENSION IF NOT EXISTS citext;    -- Case-insensitive text (for emails)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;    -- For gen_random_uuid() if preferred over uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS plpgsql;
/*
  Supabase-compatible Postgres migration file that sets up a CRM database
  fulfilling the requirements outlined below. This schema is designed for
  multi-tenant usage, webhook integrations, custom fields, API key management,
  and flexible role-based access. Comments explain how each part aligns with
  the requested features:

  Requirements Addressed:
  1) Typical CRM functionality (sales + support).
  2) Webhook enablement (sending/receiving).
  3) Integrations (email/chatbot potential).
  4) Multi-tenant data separation (company_id references).
  5) API key/token-based authentication (api_keys table).
  6) Table structures for users, companies, contacts, tickets, etc.
  7) Extendable custom fields (custom_fields / custom_field_values).
  8) Views or access levels (roles on users; references to company_id).
  9) Future AI fields (metadata columns, JSONB placeholders).
  10) Repository pattern friendly (clear normalization).
  11) Security & privacy (company_id references for data scoping).
  12) Public SDK alignment (logical, documented schema for external devs).
*/

-- start directly with type definitions
CREATE TYPE webhook_event_type AS ENUM (
    'contact.created',
    'contact.updated',
    'contact.archived',
    'ticket.created',
    'ticket.updated',
    'ticket.status_changed',
    'ticket.assigned'
);

-- Additional useful enums
CREATE TYPE user_status_type AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending'
);

CREATE TYPE ticket_status_type AS ENUM (
    'open',
    'in_progress',
    'waiting',
    'resolved',
    'closed'
);

-- Add to the type definitions section
CREATE TYPE chat_message_type AS ENUM (
    'text',
    'image',
    'file',
    'system'
);

CREATE TYPE chat_session_status AS ENUM (
    'active',
    'closed',
    'archived'
);
-- ============================================================================
-- 1. Companies Table
--    - Represents a tenant or organization. 
--    - All data can be scoped by company_id to ensure separation of data.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  branding JSONB DEFAULT jsonb_build_object(
    'primary_color', '#000000',
    'secondary_color', '#ffffff',
    'accent_color', '#007AFF',
    'logo_url', null,
    'favicon_url', null,
    'company_url', null,
    'email_template', null,
    'portal_theme', 'light',
    'font_family', 'Inter',
    'border_radius', '8px',
    'button_style', 'rounded',
    'navigation_style', 'sidebar',
    'card_style', 'flat',
    'loading_animation', 'pulse',
    'custom_css', null,
    'layout_density', 'comfortable'
  )
);

-- Trigger to update 'updated_at' on row changes (optional).
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at
BEFORE UPDATE
ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Add teams structure
CREATE TABLE IF NOT EXISTS public.teams (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- ============================================================================
-- 2. Users Table
--    - Users belong to a company and have a role (customer, agent, admin).
--    - The structure supports multiple roles. 
--      Relationship: many users can belong to one company.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer','agent','admin')),
    full_name TEXT NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    -- For demonstration, password stored as text. Use secure hashing in practice.
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ,
    status user_status_type DEFAULT 'active',  -- Use the enum
    team_id BIGINT REFERENCES public.teams(id) ON DELETE SET NULL,
    last_login_ip INET  -- Add INET field for IP tracking
);

CREATE TRIGGER users_updated_at
BEFORE UPDATE
ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- 3. Contacts (or Leads) Table
--    - Stores prospective or current customer contact info for sales/support.
--    - Also scoped by company_id for multi-tenant separation.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email CITEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Optional JSONB field that can later be used to store AI-driven or other metadata
  metadata JSONB,
  archived_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  portal_enabled BOOLEAN DEFAULT false,
  portal_email CITEXT,
  portal_username CITEXT,
  portal_password TEXT,
  last_portal_login TIMESTAMPTZ
);

CREATE TRIGGER contacts_updated_at
BEFORE UPDATE
ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- 4. Tickets (or Support Cases) Table
--    - Core of support workflow. Links to contact and can be assigned to a user.
--    - Scoped by company.  
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id BIGINT REFERENCES public.contacts(id) ON DELETE SET NULL,
  assigned_to BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status ticket_status_type NOT NULL DEFAULT 'open',  -- Use enum instead of TEXT CHECK
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at  TIMESTAMPTZ,
  metadata JSONB
);

CREATE TRIGGER tickets_updated_at
BEFORE UPDATE
ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- 5. Notes Table (Optional for Extended CRM):
--    - For either sales or support tasks, an internal note-taking mechanism.
--    - The target_type / target_id pattern allows referencing tickets, contacts, etc.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL, -- e.g. 'ticket', 'contact'
  target_id BIGINT NOT NULL, -- references target_type's id
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER notes_updated_at
BEFORE UPDATE
ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- 10. Attachments Table
--    - Stores file attachments for tickets and notes
--    - Uses target_type/target_id pattern similar to notes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.attachments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('ticket', 'note', 'article', 'chat_message')),
    target_id BIGINT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    content_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER attachments_updated_at
BEFORE UPDATE
ON public.attachments
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- 11. Knowledge Base Articles
--    - Stores help articles and FAQs for self-service
--    - Supports versioning through revision tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.articles (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    revision INTEGER NOT NULL DEFAULT 1,
    author_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    metadata JSONB,
    UNIQUE(company_id, slug)
);

CREATE TRIGGER articles_updated_at
BEFORE UPDATE
ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- 12. Portal Sessions
--    - Manages authenticated sessions for customer portal access
--    - Links to contacts table for portal users
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.portal_sessions (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    contact_id BIGINT NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET  -- Already using INET
);

CREATE TRIGGER portal_sessions_updated_at
BEFORE UPDATE
ON public.portal_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- 6. Webhooks Table
--    - Stores endpoint information to allow sending or receiving webhooks.
--    - Could be used for notifications or integrations with external services.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.webhooks (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  webhook_type TEXT NOT NULL, -- e.g. 'incoming','outgoing'
  endpoint TEXT NOT NULL,
  secret TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  events webhook_event_type[] NOT NULL DEFAULT '{}'
);

CREATE TRIGGER webhooks_updated_at
BEFORE UPDATE
ON public.webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- 7. API Keys
--    - Facilitates token-based or API key-based authentication with regular rotation.
--    - Each company can manage multiple keys.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  api_key TEXT UNIQUE NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Optional expiry or last rotation
  expires_at TIMESTAMPTZ
);

CREATE TRIGGER api_keys_updated_at
BEFORE UPDATE
ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- 8. Custom Fields
--    - Mechanism for adding custom fields without altering the core schema.
--    - "table_name" references which table the custom field is for (e.g. "contacts").
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,     -- e.g. 'contacts', 'tickets', 'users'
  field_name TEXT NOT NULL,     -- e.g. 'preferred_language'
  field_type TEXT NOT NULL,     -- e.g. 'TEXT', 'BOOLEAN', 'NUMBER'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER custom_fields_updated_at
BEFORE UPDATE
ON public.custom_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- 9. Custom Field Values
--    - Holds the actual values for custom fields defined in "custom_fields".
--    - "record_id" references the item in the target table (contacts, tickets, etc.).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.custom_field_values (
  id BIGSERIAL PRIMARY KEY,
  custom_field_id BIGINT NOT NULL REFERENCES public.custom_fields(id) ON DELETE CASCADE,
  record_id BIGINT NOT NULL, -- references row in the target table_name
  value TEXT,                -- store as text, convert as needed in the app layer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER custom_field_values_updated_at
BEFORE UPDATE
ON public.custom_field_values
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Add compound unique constraint for custom fields
ALTER TABLE public.custom_fields 
ADD CONSTRAINT unique_custom_field_per_company 
UNIQUE (company_id, table_name, field_name);

-- Add tags system
CREATE TABLE IF NOT EXISTS public.tags (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, name)
);

CREATE TABLE IF NOT EXISTS public.taggables (
    tag_id BIGINT REFERENCES public.tags(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'ticket')),
    entity_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (tag_id, entity_type, entity_id)
);

-- ============================================================================
-- 13. Chat Sessions
--    - Manages live chat conversations between contacts and agents
--    - Scoped by company_id for multi-tenant separation
--    - Links to contacts and agents for proper relationship tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    contact_id BIGINT REFERENCES public.contacts(id) ON DELETE SET NULL,
    agent_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    ticket_id BIGINT REFERENCES public.tickets(id) ON DELETE SET NULL,
    status chat_session_status NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ
);

CREATE TRIGGER chat_sessions_updated_at
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- 14. Chat Messages
--    - Stores individual messages within chat sessions
--    - Real-time enabled for instant message delivery
--    - Tracks message status and type
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    session_id BIGINT NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('contact', 'agent', 'system')),
    sender_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    message_type chat_message_type NOT NULL DEFAULT 'text',
    metadata JSONB DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Add indexes for foreign keys and commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_users_team ON public.users(team_id);
CREATE INDEX IF NOT EXISTS idx_taggables_lookup ON public.taggables(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts (email);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_tickets_company_id ON public.tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status_company ON public.tickets(company_id, status);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_lookup ON public.custom_field_values(custom_field_id, record_id);
CREATE INDEX IF NOT EXISTS idx_attachments_target ON public.attachments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_attachments_company_id ON public.attachments(company_id);
CREATE INDEX IF NOT EXISTS idx_articles_company_status ON public.articles(company_id, status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(company_id, slug);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_token ON public.portal_sessions(token);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_contact ON public.portal_sessions(contact_id);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_expires ON public.portal_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_company ON public.chat_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_contact ON public.chat_sessions(contact_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent ON public.chat_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON public.chat_sessions(company_id, status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_company ON public.chat_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timeline ON public.chat_messages(company_id, created_at DESC);
-- Add these indexes
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(company_id, priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(company_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_subject_description ON public.tickets USING gin(to_tsvector('english', subject || ' ' || description));
-- Add chat tables to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;