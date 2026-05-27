import type { DoctorWithUser } from '@/features/doctors/types';

export interface AIRecommendation {
  specialization: string;
  reason: string;
  doctors: DoctorWithUser[];
}

export interface RecommendationResult {
  recommendations: AIRecommendation[];
}
