import api from '@/shared/lib/api';
import type { Patient, UpdatePatientDto, PatientMedicalHistory, PatientDocument } from '../types';

export async function getPatient(id: string): Promise<Patient> {
  const { data } = await api.get(`/api/patients/${id}`);
  return data.data;
}

export async function updatePatient(id: string, dto: UpdatePatientDto): Promise<Patient> {
  const { data } = await api.put(`/api/patients/${id}`, dto);
  return data.data;
}

export async function getPatientHistory(patientId: string): Promise<PatientMedicalHistory> {
  const { data } = await api.get(`/api/patients/${patientId}/history`);
  return data.data;
}

export async function getDocuments(patientId: string): Promise<PatientDocument[]> {
  const { data } = await api.get(`/api/patients/${patientId}/documents`);
  return data.data;
}

export async function uploadDocument(patientId: string, file: File): Promise<PatientDocument[]> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/api/patients/${patientId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}