import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '@/services/api';
import * as authService from '@/services/authService';
import { storage } from '@/services/storage';
import { showAlert } from '@/utils/dialogs';
import type { AuthUser } from '@/types';

const TOKEN_KEY = 'mural_token';
const USER_KEY = 'mural_user';

interface AuthContextValue {
  /** Usuário logado (professor ou aluno), ou null. */
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Professores podem criar/editar posts e gerenciar professores e alunos. */
  isTeacher: boolean;
  /** true enquanto a sessão salva no aparelho está sendo restaurada. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isValidUser(value: unknown): value is AuthUser {
  const user = value as AuthUser | null;
  return (
    !!user && typeof user.id === 'string' && (user.role === 'teacher' || user.role === 'student')
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await Promise.all([storage.removeItem(TOKEN_KEY), storage.removeItem(USER_KEY)]);
  }, []);

  // Restaura a sessão salva ao abrir o app
  useEffect(() => {
    async function restore() {
      try {
        const [token, storedUser] = await Promise.all([
          storage.getItem(TOKEN_KEY),
          storage.getItem(USER_KEY),
        ]);
        const parsed: unknown = storedUser ? JSON.parse(storedUser) : null;

        if (token && isValidUser(parsed)) {
          setAuthToken(token);
          setUser(parsed);
        }
      } catch {
        // Dado corrompido: começa deslogado
        await logout();
      } finally {
        setIsLoading(false);
      }
    }

    restore();
  }, [logout]);

  // Token expirado/inválido (401 da API): encerra a sessão automaticamente
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      showAlert('Sessão expirada', 'Entre novamente para continuar.');
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    await Promise.all([
      storage.setItem(TOKEN_KEY, result.token),
      storage.setItem(USER_KEY, JSON.stringify(result.user)),
    ]);
    setAuthToken(result.token);
    setUser(result.user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isTeacher: user?.role === 'teacher',
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider');
  }

  return context;
}
