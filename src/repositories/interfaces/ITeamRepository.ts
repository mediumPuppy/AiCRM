import { Team, CreateTeamDTO, UpdateTeamDTO } from '../../types/team.types';

export interface ITeamRepository {
  create(data: CreateTeamDTO): Promise<Team>;
  findById(id: number): Promise<Team | null>;
  findByCompanyId(companyId: number): Promise<Team[]>;
  update(id: number, data: UpdateTeamDTO): Promise<Team>;
  delete(id: number): Promise<void>;
} 