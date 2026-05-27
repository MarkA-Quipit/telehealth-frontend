import api from '@/shared/lib/api';
import type { RecommendationResult } from '../types';

export async function recommend(symptoms: string): Promise<RecommendationResult> {
  const { data } = await api.post('/api/ai/recommend', { symptoms });
  return data.data;
}
