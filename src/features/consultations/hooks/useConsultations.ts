import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { sendChatMessage, getChatHistory } from '../api/consultations.api';

export function useChatHistory(appointmentId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.appointments.chat(appointmentId ?? ''),
    queryFn: () => getChatHistory(appointmentId!),
    enabled: !!appointmentId,
  });
}

export function useSendChatMessage(appointmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => sendChatMessage(appointmentId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.chat(appointmentId) });
    },
  });
}
