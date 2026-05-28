import api from '@/shared/lib/api';
import type {
  DoctorWithUser,
  DoctorFilters,
  UpdateDoctorDto,
  PaginatedDoctors,
  TimeSlot,
  DoctorAvailability,
  BlockedSlot,
  AvailabilityInput,
  BlockSlotInput,
  Review,
} from '../types';

export async function listDoctors(filters: DoctorFilters): Promise<PaginatedDoctors> {
  const params = new URLSearchParams();
  if (filters.specialization) params.set('specialization', filters.specialization);
  if (filters.search) params.set('search', filters.search);
  if (filters.minFee != null) params.set('minFee', String(filters.minFee));
  if (filters.maxFee != null) params.set('maxFee', String(filters.maxFee));
  if (filters.minExperience != null) params.set('minExperience', String(filters.minExperience));
  if (filters.minRating != null) params.set('minRating', String(filters.minRating));
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const { data } = await api.get(`/api/doctors?${params.toString()}`);
  return data.data;
}

export async function getDoctorById(id: string): Promise<DoctorWithUser> {
  const { data } = await api.get(`/api/doctors/${id}`);
  return data.data;
}

export async function updateDoctor(id: string, dto: UpdateDoctorDto): Promise<DoctorWithUser> {
  const { data } = await api.put(`/api/doctors/${id}`, dto);
  return data.data;
}

export async function getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
  const { data } = await api.get(`/api/doctors/${doctorId}/slots?date=${date}`);
  return data.data;
}

export async function getAvailability(doctorId: string): Promise<DoctorAvailability[]> {
  const { data } = await api.get(`/api/doctors/${doctorId}/availability`);
  return data.data;
}

export async function setAvailability(
  doctorId: string,
  slots: AvailabilityInput[],
): Promise<DoctorAvailability[]> {
  const { data } = await api.put(`/api/doctors/${doctorId}/availability`, {
    availability: slots,
  });
  return data.data;
}

export async function getBlockedSlots(doctorId: string): Promise<BlockedSlot[]> {
  const { data } = await api.get(`/api/doctors/${doctorId}/blocked-slots`);
  return data.data;
}

export async function addBlockedSlot(
  doctorId: string,
  input: BlockSlotInput,
): Promise<BlockedSlot> {
  const { data } = await api.post(`/api/doctors/${doctorId}/blocked-slots`, input);
  return data.data;
}

export async function deleteBlockedSlot(doctorId: string, slotId: string): Promise<void> {
  await api.delete(`/api/doctors/${doctorId}/blocked-slots/${slotId}`);
}

export async function getSpecializations(): Promise<string[]> {
  const { data } = await api.get('/api/doctors/specializations');
  return data.data;
}

export async function getDoctorReviews(doctorId: string): Promise<Review[]> {
  const { data } = await api.get(`/api/doctors/${doctorId}/reviews`);
  return data.data;
}

export async function submitReview(
  doctorId: string,
  payload: { appointmentId: string; rating: number; comment?: string },
): Promise<Review> {
  const { data } = await api.post(`/api/doctors/${doctorId}/reviews`, payload);
  return data.data;
}