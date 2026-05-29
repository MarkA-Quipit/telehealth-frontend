import api from '@/shared/lib/api';
import type { RecommendationResult, AiHistoryEntry } from '../types';

export async function recommend(symptoms: string): Promise<RecommendationResult> {
  const { data } = await api.post('/api/ai/recommend', { symptoms });
  return data.data;
}

export async function getAiHistory(): Promise<AiHistoryEntry[]> {
  const { data } = await api.get('/api/ai/history');
  return data.data;
}
