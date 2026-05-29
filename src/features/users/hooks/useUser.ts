import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUser, updateUser, uploadAvatar, changePassword } from '../api/users.api';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { UpdateUserDto } from '../types';

export function useUser(id?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.users.detail(id ?? ''),
    queryFn: () => getUser(id!),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) =>
      updateUser(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.detail(data.id) });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, currentPassword, newPassword }: { id: string; currentPassword: string; newPassword: string }) =>
      changePassword(id, { currentPassword, newPassword }),
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadAvatar(id, file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.detail(data.id) });
    },
  });
}
