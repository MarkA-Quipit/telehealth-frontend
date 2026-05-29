import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../../features/auth/api/auth.api';
import type { AuthUser, LoginDto, RegisterDto } from '../../features/auth/types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login(dto: LoginDto): Promise<void>;
  register(dto: RegisterDto): Promise<void>;
  logout(): Promise<void>;
  isLoading: boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [token, setToken] = React.useState<string | null>(() =>
    localStorage.getItem('token'),
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate();

  // On mount: if a stored token exists, hydrate the user
  React.useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .getMe()
      .then(setUser)
      .catch(() => {
        // Token expired or invalid — clear it
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function storeAuth(accessToken: string, refreshToken: string, newUser: AuthUser) {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(accessToken);
    setUser(newUser);
  }

  function redirectByRole(roles: string[]) {
    navigate(roles.includes('doctor') ? '/doctor/dashboard' : '/patient/dashboard');
  }

  async function login(dto: LoginDto) {
    const result = await authApi.login(dto);
    storeAuth(result.accessToken, result.refreshToken, result.user);
    redirectByRole(result.user.roles);
  }

  async function register(dto: RegisterDto) {
    const result = await authApi.register(dto);
    storeAuth(result.accessToken, result.refreshToken, result.user);
    redirectByRole(result.user.roles);
  }

  async function logout() {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedRefreshToken) {
      try {
        await authApi.callLogout(storedRefreshToken);
      } catch {
        // best-effort revoke — clear locally regardless
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    navigate('/login');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
