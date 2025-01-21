import { Company } from '../../types/company.types';

export class CompanyEntity implements Company {
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

  constructor(data: Company) {
    this.id = data.id;
    this.name = data.name;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
    this.branding = data.branding;
  }
}
