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