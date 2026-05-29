import api from '@/shared/lib/api';
import type { RecommendationResult, AiHistoryEntry } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function recommend(symptoms: string): Promise<RecommendationResult> {
  const { data } = await api.post('/api/ai/recommend', { symptoms });
  return data.data;
}

export async function getAiHistory(): Promise<AiHistoryEntry[]> {
  const { data } = await api.get('/api/ai/history');
  return data.data;
}

export async function streamRecommendations(
  symptoms: string,
  onToken: (token: string) => void,
  onDone: (recommendations: RecommendationResult) => void,
): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/ai/recommend/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ symptoms }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split('\n').filter((l) => l.startsWith('data: '));
    for (const line of lines) {
      const payload = JSON.parse(line.replace('data: ', '')) as {
        token?: string;
        done?: boolean;
        recommendations?: RecommendationResult;
      };
      if (payload.token) onToken(payload.token);
      if (payload.done && payload.recommendations) onDone(payload.recommendations);
    }
  }
}
