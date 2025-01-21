import { User, CreateUserDTO, UpdateUserDTO } from '../../types/user.types';

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCompanyId(companyId: number): Promise<User[]>;
  findByTeamId(teamId: number): Promise<User[]>;
  update(id: number, data: UpdateUserDTO): Promise<User>;
  archive(id: number): Promise<void>;
  delete(id: number): Promise<void>;
} 