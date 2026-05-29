import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/mocks/server';
import {
  listAppointments,
  getAppointment,
  createAppointment,
  updateStatus,
  cancelAppointment,
  rescheduleAppointment,
  searchPatients,
} from '../appointments.api';

beforeEach(() => localStorage.clear());

describe('listAppointments', () => {
  it('returns paginated items', async () => {
    const result = await listAppointments();
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('passes status filter as a query param', async () => {
    let url = '';
    server.use(
      http.get('http://localhost:3000/api/appointments', ({ request }) => {
        url = request.url;
        return HttpResponse.json({ success: true, data: { items: [], total: 0, page: 1, limit: 10 } });
      }),
    );
    await listAppointments({ status: 'confirmed' });
    expect(url).toContain('status=confirmed');
  });
});

describe('getAppointment', () => {
  it('makes a GET request to /api/appointments/:id', async () => {
    let capturedPath = '';
    server.use(
      http.get('http://localhost:3000/api/appointments/:id', ({ params }) => {
        capturedPath = params.id as string;
        return HttpResponse.json({ success: true, data: { id: params.id } });
      }),
    );
    await getAppointment('appt-99');
    expect(capturedPath).toBe('appt-99');
  });
});

describe('createAppointment', () => {
  it('makes a POST request and returns the appointment', async () => {
    const result = await createAppointment({
      doctorId: 'doctor-1',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(result.id).toBeDefined();
  });
});

describe('updateStatus', () => {
  it('makes a PATCH request to /api/appointments/:id/status', async () => {
    let method = '';
    server.use(
      http.patch('http://localhost:3000/api/appointments/:id/status', ({ request }) => {
        method = request.method;
        return HttpResponse.json({ success: true, data: { id: 'appt-1', status: 'confirmed' } });
      }),
    );
    await updateStatus('appt-1', { status: 'confirmed' });
    expect(method).toBe('PATCH');
  });
});

describe('cancelAppointment', () => {
  it('makes a DELETE request to /api/appointments/:id', async () => {
    let method = '';
    server.use(
      http.delete('http://localhost:3000/api/appointments/:id', ({ request }) => {
        method = request.method;
        return HttpResponse.json({ success: true, data: { id: 'appt-1', status: 'cancelled' } });
      }),
    );
    await cancelAppointment('appt-1', {});
    expect(method).toBe('DELETE');
  });
});

describe('rescheduleAppointment', () => {
  it('makes a PATCH request to /api/appointments/:id/reschedule', async () => {
    let url = '';
    server.use(
      http.patch('http://localhost:3000/api/appointments/:id/reschedule', ({ request }) => {
        url = request.url;
        return HttpResponse.json({ success: true, data: { id: 'appt-1' } });
      }),
    );
    await rescheduleAppointment('appt-1', { newScheduledAt: new Date(Date.now() + 86400000).toISOString() });
    expect(url).toContain('/reschedule');
  });
});

describe('searchPatients', () => {
  it('passes all filter params in the query string', async () => {
    let url = '';
    server.use(
      http.get('http://localhost:3000/api/appointments/patients/search', ({ request }) => {
        url = request.url;
        return HttpResponse.json({ success: true, data: { items: [], total: 0, page: 1, limit: 10 } });
      }),
    );
    await searchPatients({ q: 'John', bloodType: 'O+', minConsultations: 3 });
    expect(url).toContain('q=John');
    expect(url).toContain('bloodType=O%2B');
    expect(url).toContain('minConsultations=3');
  });
});
