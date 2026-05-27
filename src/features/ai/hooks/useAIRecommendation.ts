import { useMutation } from '@tanstack/react-query';
import { recommend } from '../api/ai.api';

export function useAIRecommendation() {
  return useMutation({
    mutationFn: (symptoms: string) => recommend(symptoms),
  });
}
