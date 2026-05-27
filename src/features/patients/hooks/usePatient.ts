import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatient, updatePatient } from '../api/patients.api';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { UpdatePatientDto } from '../types';

export function usePatient(id?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.patients.detail(id ?? ''),
    queryFn: () => getPatient(id!),
    enabled: !!id,
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