export interface User {
  id: string;
  email: string;
  roles: string[];
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  profilePictureUrl: string | null;
  patientId: string | null;
  doctorId: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}