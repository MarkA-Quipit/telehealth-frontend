import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuthContext } from '../AuthProvider';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockGetMe = vi.fn();
const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockCallLogout = vi.fn();

vi.mock('../../../features/auth/api/auth.api', () => ({
  getMe: (...args: unknown[]) => mockGetMe(...args),
  login: (...args: unknown[]) => mockLogin(...args),
  register: (...args: unknown[]) => mockRegister(...args),
  callLogout: (...args: unknown[]) => mockCallLogout(...args),
}));

function Probe() {
  const ctx = useAuthContext();
  return (
    <div>
      <span data-testid="user">{ctx.user ? ctx.user.email : 'null'}</span>
      <span data-testid="loading">{String(ctx.isLoading)}</span>
      <button onClick={() => ctx.logout()}>Logout</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    mockNavigate.mockReset();
    mockGetMe.mockReset();
    mockLogin.mockReset();
    mockRegister.mockReset();
    mockCallLogout.mockReset();
  });

  it('sets isLoading=false immediately when no stored token', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(mockGetMe).not.toHaveBeenCalled();
  });

  it('hydrates user from stored token via getMe', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValue({ id: 'u1', email: 'pat@test.com', roles: ['patient'] });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('pat@test.com');
    });
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('clears token from localStorage when getMe returns 401', async () => {
    localStorage.setItem('token', 'bad-token');
    mockGetMe.mockRejectedValue(new Error('Unauthorized'));

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('navigates to patient dashboard after patient login', async () => {
    mockLogin.mockResolvedValue({
      accessToken: 'at',
      refreshToken: 'rt',
      user: { id: 'u1', email: 'pat@test.com', roles: ['patient'] },
    });

    let ctx!: ReturnType<typeof useAuthContext>;
    function Capturer() {
      ctx = useAuthContext();
      return null;
    }

    render(
      <MemoryRouter>
        <AuthProvider>
          <Capturer />
        </AuthProvider>
      </MemoryRouter>,
    );

    await act(async () => {
      await ctx.login({ email: 'pat@test.com', password: 'pass' });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard');
    expect(localStorage.getItem('token')).toBe('at');
  });

  it('navigates to doctor dashboard after doctor login', async () => {
    mockLogin.mockResolvedValue({
      accessToken: 'at',
      refreshToken: 'rt',
      user: { id: 'u2', email: 'doc@test.com', roles: ['doctor'] },
    });

    let ctx!: ReturnType<typeof useAuthContext>;
    function Capturer() {
      ctx = useAuthContext();
      return null;
    }

    render(
      <MemoryRouter>
        <AuthProvider>
          <Capturer />
        </AuthProvider>
      </MemoryRouter>,
    );

    await act(async () => {
      await ctx.login({ email: 'doc@test.com', password: 'pass' });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard');
  });

  it('logout clears tokens and navigates to /login', async () => {
    localStorage.setItem('token', 'at');
    localStorage.setItem('refreshToken', 'rt');
    mockGetMe.mockResolvedValue({ id: 'u1', email: 'pat@test.com', roles: ['patient'] });
    mockCallLogout.mockResolvedValue(undefined);

    renderProvider();
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('pat@test.com'));

    await act(async () => {
      screen.getByRole('button', { name: /logout/i }).click();
    });

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('throws when useAuthContext is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<MemoryRouter><Probe /></MemoryRouter>)).toThrow();
    spy.mockRestore();
  });
});
