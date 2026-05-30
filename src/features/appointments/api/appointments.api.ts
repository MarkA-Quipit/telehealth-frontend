import api from '@/shared/lib/api';
import type {
  Appointment,
  AppointmentWithDetails,
  CreateAppointmentDto,
  UpdateStatusDto,
  CancelAppointmentDto,
  ConsultationNote,
  Prescription,
  PaginatedAppointments,
  AppointmentFilters,
  PaginatedPatientSearch,
  PatientSearchFilters,
} from '../types';

export async function createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
  const { data } = await api.post('/api/appointments', dto);
  return data.data;
}

export async function listAppointments(filters?: AppointmentFilters): Promise<PaginatedAppointments> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  const { data } = await api.get(`/api/appointments?${params.toString()}`);
  return data.data;
}

export async function getAppointment(id: string): Promise<AppointmentWithDetails> {
  const { data } = await api.get(`/api/appointments/${id}`);
  return data.data;
}

export async function updateStatus(id: string, dto: UpdateStatusDto): Promise<Appointment> {
  const { data } = await api.patch(`/api/appointments/${id}/status`, dto);
  return data.data;
}

export async function cancelAppointment(id: string, dto: CancelAppointmentDto): Promise<Appointment> {
  const { data } = await api.delete(`/api/appointments/${id}`, { data: dto });
  return data.data;
}

export async function getNotes(appointmentId: string): Promise<ConsultationNote | null> {
  const { data } = await api.get(`/api/appointments/${appointmentId}/notes`);
  return data.data;
}

export async function saveNotes(
  appointmentId: string,
  payload: Partial<Pick<ConsultationNote, 'chiefComplaint' | 'diagnosis' | 'notes' | 'followUpDate'>>,
): Promise<ConsultationNote> {
  const { data } = await api.post(`/api/appointments/${appointmentId}/notes`, payload);
  return data.data;
}

export async function getPrescriptions(appointmentId: string): Promise<Prescription[]> {
  const { data } = await api.get(`/api/appointments/${appointmentId}/prescriptions`);
  return data.data;
}

export async function addPrescription(
  appointmentId: string,
  payload: {
    medicationName: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  },
): Promise<Prescription> {
  const { data } = await api.post(`/api/appointments/${appointmentId}/prescriptions`, payload);
  return data.data;
}

export async function deletePrescription(appointmentId: string, prescriptionId: string): Promise<void> {
  await api.delete(`/api/appointments/${appointmentId}/prescriptions/${prescriptionId}`);
}

export async function searchPatients(
  filters: PatientSearchFilters,
): Promise<PaginatedPatientSearch> {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.bloodType) params.set('bloodType', filters.bloodType);
  if (filters.sex) params.set('sex', filters.sex);
  if (filters.minConsultations != null) params.set('minConsultations', String(filters.minConsultations));
  if (filters.maxConsultations != null) params.set('maxConsultations', String(filters.maxConsultations));
  if (filters.minAge != null) params.set('minAge', String(filters.minAge));
  if (filters.maxAge != null) params.set('maxAge', String(filters.maxAge));
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const { data } = await api.get(`/api/appointments/patients/search?${params.toString()}`);
  return data.data;
}

export async function rescheduleAppointment(
  id: string,
  dto: { newScheduledAt: string; durationMinutes?: number },
): Promise<AppointmentWithDetails> {
  const { data } = await api.patch(`/api/appointments/${id}/reschedule`, dto);
  return data.data;
}
