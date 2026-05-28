import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listDoctors, getDoctorById, updateDoctor, getDoctorReviews } from '../api/doctors.api';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { DoctorFilters, UpdateDoctorDto } from '../types';

export function useDoctors(filters: DoctorFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.doctors.all(filters),
    queryFn: () => listDoctors(filters),
  });
}

export function useDoctor(id?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.doctors.detail(id ?? ''),
    queryFn: () => getDoctorById(id!),
    enabled: !!id,
  });
}

export function useDoctorReviews(doctorId?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.doctors.reviews(doctorId ?? ''),
    queryFn: () => getDoctorReviews(doctorId!),
    enabled: !!doctorId,
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDoctorDto }) =>
      updateDoctor(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doctors.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doctors.all() });
    },
  });
}