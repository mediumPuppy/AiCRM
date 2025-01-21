export type Team = {
  id: number;
  company_id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

export type CreateTeamDTO = Omit<Team, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTeamDTO = Partial<Omit<CreateTeamDTO, 'company_id'>>; 