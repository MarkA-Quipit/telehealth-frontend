import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/mocks/server';
import {
  useAppointments,
  useCreateAppointment,
  useUpdateStatus,
  usePatientSearch,
} from '../useAppointments';

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useAppointments', () => {
  it('fetches and returns items from the API', async () => {
    const { result } = renderHook(() => useAppointments(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(1);
    expect(result.current.data?.items[0].id).toBe('appt-1');
  });

  it('passes status filter as a query param', async () => {
    let capturedUrl = '';
    server.use(
      http.get('http://localhost:3000/api/appointments', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ success: true, data: { items: [], total: 0, page: 1, limit: 10 } });
      }),
    );

    const { result } = renderHook(() => useAppointments({ status: 'pending' }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('status=pending');
  });
});

describe('useCreateAppointment', () => {
  it('invalidates the appointments all-key on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useCreateAppointment(), { wrapper });

    result.current.mutate({
      doctorId: 'doctor-1',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalled();
  });
});

describe('useUpdateStatus', () => {
  it('invalidates both the detail and all-list keys on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useUpdateStatus(), { wrapper });

    result.current.mutate({ id: 'appt-1', dto: { status: 'confirmed' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledTimes(2);
  });
});

describe('usePatientSearch', () => {
  it('is disabled when q is less than 2 characters', () => {
    const { result } = renderHook(() => usePatientSearch({ q: 'a' }), {
      wrapper: makeWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });

  it('is enabled when q has at least 2 characters', async () => {
    const { result } = renderHook(() => usePatientSearch({ q: 'Jo' }), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('is enabled when bloodType is set even without q', async () => {
    const { result } = renderHook(() => usePatientSearch({ bloodType: 'O+' }), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
