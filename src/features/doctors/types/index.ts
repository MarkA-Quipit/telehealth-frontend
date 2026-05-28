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
  // computed stats
  averageRating: number | null;
  reviewCount: number;
  completedConsultationsCount: number;
}

export interface Review {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  patient: {
    firstName: string;
    lastName: string;
    profilePictureUrl: string | null;
  };
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

export interface TimeSlot {
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0=Sun … 6=Sat
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  isAvailable: boolean;
}

export interface BlockedSlot {
  id: string;
  doctorId: string;
  blockedDate: string; // "YYYY-MM-DD"
  startTime: string;   // "HH:MM"
  endTime: string;     // "HH:MM"
  reason: string | null;
  createdAt: string;
}

export interface AvailabilityInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BlockSlotInput {
  blockedDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
}