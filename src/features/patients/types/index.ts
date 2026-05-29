export interface Patient {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  weightKg?: string;
  heightCm?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
}

export interface PatientHistoryEntry {
  appointmentId: string;
  scheduledAt: string;
  notes: {
    chiefComplaint: string | null;
    diagnosis: string | null;
    notes: string | null;
    followUpDate: string | null;
  } | null;
  prescriptions: Array<{
    id: string;
    medicationName: string;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
    instructions: string | null;
  }>;
}

export interface PatientMedicalHistory {
  patient: Patient;
  consultationHistory: PatientHistoryEntry[];
}

export interface UpdatePatientDto {
  dateOfBirth?: string;
  weightKg?: number;
  heightCm?: number;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}