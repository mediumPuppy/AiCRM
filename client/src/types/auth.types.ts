export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  full_name: string;
  phone?: string; // Optional for client signup
}

export interface AuthResponse {
  token: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
    role: string;
    company_id: number;
  };
  contact?: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    company_id: number;
  };
} 