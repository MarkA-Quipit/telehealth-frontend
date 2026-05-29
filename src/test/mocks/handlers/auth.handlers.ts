import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3000';

export const authHandlers = [
  http.post(`${BASE}/api/auth/login`, () =>
    HttpResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: { id: 'user-1', email: 'patient@test.com', roles: ['patient'], createdAt: new Date().toISOString(), lastLoginAt: null },
      },
    }),
  ),

  http.post(`${BASE}/api/auth/register`, () =>
    HttpResponse.json(
      {
        success: true,
        message: 'Registered successfully',
        data: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          user: { id: 'user-1', email: 'new@test.com', roles: ['patient'], createdAt: new Date().toISOString(), lastLoginAt: null },
        },
      },
      { status: 201 },
    ),
  ),

  http.get(`${BASE}/api/auth/me`, () =>
    HttpResponse.json({
      success: true,
      message: 'User retrieved',
      data: { id: 'user-1', email: 'patient@test.com', roles: ['patient'] },
    }),
  ),

  http.post(`${BASE}/api/auth/refresh`, () =>
    HttpResponse.json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken: 'new-access-token' },
    }),
  ),

  http.post(`${BASE}/api/auth/logout`, () =>
    HttpResponse.json({ success: true, message: 'Logged out', data: null }),
  ),
];
