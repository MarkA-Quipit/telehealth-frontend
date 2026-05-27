export interface DoctorWithUser {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  specialization: string;
  bio?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  consultationFee?: number; // integer centavos
  isAcceptingPatients: boolean;
  isVerified: boolean;
  profilePictureUrl?: string;
  phoneNumber?: string;
}

export interface DoctorFilters {
  specialization?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UpdateDoctorDto {
  specialization?: string;
  bio?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  isAcceptingPatients?: boolean;
}

export interface PaginatedDoctors {
  items: DoctorWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}