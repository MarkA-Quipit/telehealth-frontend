import api from '@/shared/lib/api';
import type { DoctorWithUser, DoctorFilters, UpdateDoctorDto, PaginatedDoctors, TimeSlot } from '../types';

export async function listDoctors(filters: DoctorFilters): Promise<PaginatedDoctors> {
  const params = new URLSearchParams();
  if (filters.specialization) params.set('specialization', filters.specialization);
  if (filters.search) params.set('search', filters.search);
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