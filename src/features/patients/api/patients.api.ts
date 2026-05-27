import api from '@/shared/lib/api';
import type { Patient, UpdatePatientDto } from '../types';

export async function getPatient(id: string): Promise<Patient> {
  const { data } = await api.get(`/api/patients/${id}`);
  return data.data;
}

export async function updatePatient(id: string, dto: UpdatePatientDto): Promise<Patient> {
  const { data } = await api.put(`/api/patients/${id}`, dto);
  return data.data;
}