export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'doctor';
  specialization?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  createdAt: string;
  lastLoginAt: string | null;
}
