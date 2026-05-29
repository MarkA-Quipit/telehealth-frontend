export { useAuthContext as useAuth } from '../../../app/providers/AuthProvider';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logoutAll as logoutAllApi } from '../api/auth.api';
import { useAuthContext } from '../../../app/providers/AuthProvider';

export function useLogoutAll() {
  const { logout } = useAuthContext();
  return useMutation({
    mutationFn: logoutAllApi,
    onSuccess: async () => {
      toast.success('Logged out from all devices');
      await logout();
    },
  });
}
