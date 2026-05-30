export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface AppointmentDoctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  profilePictureUrl: string | null;
}

export interface AppointmentPatient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string | null;
}

export interface Appointment {
  id: string;
  status: AppointmentStatus;
  scheduledAt: string;
  endsAt: string;
  durationMinutes: number;
  jitsiRoomName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentWithDetails extends Appointment {
  reasonForVisit: string | null;
  cancellationReason: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  patientJoinedAt: string | null;
  doctorJoinedAt: string | null;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
}

export interface CreateAppointmentDto {
  doctorId: string;
  scheduledAt: string;       // ISO UTC string
  durationMinutes?: number;
  reasonForVisit?: string;
}

export interface UpdateStatusDto {
  status: 'confirmed' | 'completed';
}

export interface CancelAppointmentDto {
  cancellationReason?: string;
}

export interface ConsultationNote {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  chiefComplaint: string | null;
  diagnosis: string | null;
  notes: string | null;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  medicationName: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  createdAt: string;
}

export interface PaginatedAppointments {
  items: AppointmentWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppointmentFilters {
  status?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface PatientSearchResult {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string | null;
  sex: string | null;
  bloodType: string | null;
  allergies: string | null;
  currentMedications: string | null;
  pastMedicalConditions: string | null;
  familyMedicalHistory: string | null;
  profilePictureUrl: string | null;
  consultationCount: number;
}

export interface PaginatedPatientSearch {
  items: PatientSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PatientSearchFilters {
  q?: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  minConsultations?: number;
  maxConsultations?: number;
  minAge?: number;
  maxAge?: number;
  page?: number;
  limit?: number;
}
