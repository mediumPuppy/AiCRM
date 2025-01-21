-- Extend the existing branding JSONB with more options
ALTER TABLE companies 
ALTER COLUMN branding SET DEFAULT jsonb_build_object(
    'primary_color', '#000000',
    'secondary_color', '#ffffff',
    'accent_color', '#007AFF',
    'logo_url', null,
    'favicon_url', null,
    'company_url', null,
    'email_template', null,
    'portal_theme', 'light',
    -- New additions
    'font_family', 'Inter',
    'border_radius', '8px',
    'button_style', 'rounded', -- rounded, pill, square
    'navigation_style', 'sidebar', -- sidebar, top, minimal
    'card_style', 'flat', -- flat, raised, bordered
    'loading_animation', 'pulse', -- pulse, spinner, skeleton
    'custom_css', null,
    'layout_density', 'comfortable' -- comfortable, compact, spacious
);

