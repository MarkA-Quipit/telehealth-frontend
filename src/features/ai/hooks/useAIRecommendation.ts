import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { recommend, getAiHistory } from '../api/ai.api';

export function useAIRecommendation() {
  return useMutation({
    mutationFn: (symptoms: string) => recommend(symptoms),
  });
}

export function useAiHistory() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: QUERY_KEYS.ai.history(),
    queryFn: getAiHistory,
    enabled: !!user,
  });
}
