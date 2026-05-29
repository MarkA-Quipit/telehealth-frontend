import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3000';

const mockAppointment = {
  id: 'appt-1',
  patientId: 'patient-1',
  doctorId: 'doctor-1',
  scheduledAt: new Date(Date.now() + 86400000).toISOString(),
  endsAt: new Date(Date.now() + 86400000 + 1800000).toISOString(),
  status: 'pending',
  jitsiRoomName: 'telehealth-appt-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const appointmentsHandlers = [
  http.get(`${BASE}/api/appointments`, () =>
    HttpResponse.json({
      success: true,
      data: { items: [mockAppointment], total: 1, page: 1, limit: 10 },
    }),
  ),

  http.get(`${BASE}/api/appointments/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { ...mockAppointment, id: params.id },
    }),
  ),

  http.post(`${BASE}/api/appointments`, () =>
    HttpResponse.json({ success: true, data: mockAppointment }, { status: 201 }),
  ),

  http.patch(`${BASE}/api/appointments/:id/status`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { ...mockAppointment, id: params.id, status: 'confirmed' },
    }),
  ),

  http.delete(`${BASE}/api/appointments/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { ...mockAppointment, id: params.id, status: 'cancelled' },
    }),
  ),

  http.patch(`${BASE}/api/appointments/:id/reschedule`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { ...mockAppointment, id: params.id },
    }),
  ),

  http.get(`${BASE}/api/appointments/patients/search`, () =>
    HttpResponse.json({
      success: true,
      data: { items: [], total: 0, page: 1, limit: 10 },
    }),
  ),

  http.get(`${BASE}/api/appointments/:id/chat`, () =>
    HttpResponse.json({ success: true, data: [] }),
  ),
];
