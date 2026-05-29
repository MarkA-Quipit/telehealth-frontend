import api from '@/shared/lib/api';

export interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  sentAt: string;
}

export async function sendChatMessage(appointmentId: string, message: string): Promise<ChatMessage> {
  const { data } = await api.post(`/api/appointments/${appointmentId}/chat`, { message });
  return data.data;
}

export async function getChatHistory(appointmentId: string): Promise<ChatMessage[]> {
  const { data } = await api.get(`/api/appointments/${appointmentId}/chat`);
  return data.data;
}
