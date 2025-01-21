import { Team } from '../../types/team.types';

export class TeamEntity implements Team {
  id: number;
  company_id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;

  constructor(data: Team) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.name = data.name;
    this.description = data.description;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
  }
} 