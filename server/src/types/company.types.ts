export type Company = {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  branding: {
    primary_color: string;
    secondary_color: string;
    logo_url: string | null;
    favicon_url: string | null;
    company_url: string | null;
    email_template: string | null;
    portal_theme: 'light' | 'dark';
  };
};

export type CreateCompanyDTO = Omit<Company, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCompanyDTO = Partial<CreateCompanyDTO>;
