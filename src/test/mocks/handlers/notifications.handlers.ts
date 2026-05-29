import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3000';

const mockNotification = {
  id: 'notif-1',
  userId: 'user-1',
  type: 'appointment_booked',
  title: 'Appointment Booked',
  body: 'Your appointment has been booked.',
  isRead: false,
  createdAt: new Date().toISOString(),
};

export const notificationsHandlers = [
  http.get(`${BASE}/api/notifications`, () =>
    HttpResponse.json({
      success: true,
      data: { items: [mockNotification], total: 1, unreadCount: 1, page: 1, limit: 20 },
    }),
  ),

  http.patch(`${BASE}/api/notifications/:id/read`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { ...mockNotification, id: params.id, isRead: true },
    }),
  ),

  http.patch(`${BASE}/api/notifications/read-all`, () =>
    HttpResponse.json({ success: true, data: null }),
  ),

  http.delete(`${BASE}/api/notifications/:id`, () =>
    HttpResponse.json({ success: true, data: null }),
  ),
];
