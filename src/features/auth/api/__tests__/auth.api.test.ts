import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/mocks/server';
import { login, register, getMe, callLogout, callRefreshToken } from '../auth.api';

describe('auth.api', () => {
  beforeEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  });

  describe('login', () => {
    it('returns accessToken, refreshToken, and user on success', async () => {
      const result = await login({ email: 'patient@test.com', password: 'pass' });
      expect(result.accessToken).toBe('test-access-token');
      expect(result.refreshToken).toBe('test-refresh-token');
      expect(result.user.email).toBe('patient@test.com');
    });

    it('rejects with the server error message on 401', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/login', () =>
          HttpResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 }),
        ),
      );

      await expect(login({ email: 'bad@test.com', password: 'bad' })).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });

  describe('register', () => {
    it('returns token pair and user on success', async () => {
      const result = await register({
        email: 'new@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'patient',
      });
      expect(result.accessToken).toBeDefined();
      expect(result.user).toBeDefined();
    });
  });

  describe('getMe', () => {
    it('attaches Authorization header from localStorage', async () => {
      localStorage.setItem('token', 'my-token');
      let capturedHeader = '';
      server.use(
        http.get('http://localhost:3000/api/auth/me', ({ request }) => {
          capturedHeader = request.headers.get('Authorization') ?? '';
          return HttpResponse.json({
            success: true,
            message: 'User retrieved',
            data: { id: 'user-1', email: 'patient@test.com', roles: ['patient'] },
          });
        }),
      );

      await getMe();
      expect(capturedHeader).toBe('Bearer my-token');
    });

    it('returns the user object', async () => {
      const user = await getMe();
      expect(user.email).toBe('patient@test.com');
    });
  });

  describe('callLogout', () => {
    it('calls POST /api/auth/logout', async () => {
      let called = false;
      server.use(
        http.post('http://localhost:3000/api/auth/logout', () => {
          called = true;
          return HttpResponse.json({ success: true, message: 'Logged out', data: null });
        }),
      );
      await callLogout('test-refresh-token');
      expect(called).toBe(true);
    });
  });

  describe('refresh token interceptor', () => {
    it('retries the original request after refreshing the token', async () => {
      localStorage.setItem('token', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      let meCallCount = 0;
      server.use(
        http.get('http://localhost:3000/api/auth/me', () => {
          meCallCount++;
          if (meCallCount === 1) {
            return HttpResponse.json(
              { success: false, message: 'Unauthorized' },
              { status: 401 },
            );
          }
          return HttpResponse.json({
            success: true,
            message: 'User retrieved',
            data: { id: 'u1', email: 'patient@test.com', roles: ['patient'] },
          });
        }),
        http.post('http://localhost:3000/api/auth/refresh', () =>
          HttpResponse.json({
            success: true,
            message: 'Token refreshed',
            data: { accessToken: 'new-access-token' },
          }),
        ),
      );

      const user = await getMe();
      expect(user.email).toBe('patient@test.com');
      expect(localStorage.getItem('token')).toBe('new-access-token');
    });

    it('rejects when there is no refresh token to use', async () => {
      localStorage.setItem('token', 'expired-token');
      // No refreshToken in localStorage

      server.use(
        http.get('http://localhost:3000/api/auth/me', () =>
          HttpResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }),
        ),
      );

      await expect(getMe()).rejects.toThrow();
    });
  });

  describe('callRefreshToken', () => {
    it('returns a new accessToken', async () => {
      const result = await callRefreshToken('my-refresh-token');
      expect(result.accessToken).toBe('new-access-token');
    });
  });
});
