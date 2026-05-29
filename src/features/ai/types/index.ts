import type { DoctorWithUser } from '@/features/doctors/types';

export interface AIRecommendation {
  specialization: string;
  reason: string;
  doctors: DoctorWithUser[];
}

export interface RecommendationResult {
  recommendations: AIRecommendation[];
}

export interface AiHistoryEntry {
  id: string;
  userId: string;
  symptoms: string;
  recommendations: AIRecommendation[];
  createdAt: string;
}
