import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatient, updatePatient, getPatientHistory, getDocuments, uploadDocument } from '../api/patients.api';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { UpdatePatientDto } from '../types';

export function usePatient(id?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.patients.detail(id ?? ''),
    queryFn: () => getPatient(id!),
    enabled: !!id,
  });
}

export function usePatientHistory(patientId?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.patients.history(patientId ?? ''),
    queryFn: () => getPatientHistory(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDocuments(patientId?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.patients.documents(patientId ?? ''),
    queryFn: () => getDocuments(patientId!),
    enabled: !!patientId,
  });
}

export function useUploadDocument(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadDocument(patientId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patients.documents(patientId) });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePatientDto }) =>
      updatePatient(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patients.detail(data.id) });
    },
  });
}