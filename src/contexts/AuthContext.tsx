import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, type AuthUser, type Session } from "@/services/api";

const STORAGE_KEY = "fides_session";

function loadSession(): { user: AuthUser; session: Session } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { user: AuthUser; session: Session };
  } catch {
    return null;
  }
}

function saveSession(data: { user: AuthUser; session: Session } | null) {
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

type AuthState = {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<{ message?: string } | void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    const stored = loadSession();
    if (!stored?.session?.access_token) {
      setState((s) => ({ ...s, loading: false, user: null, session: null, isAuthenticated: false }));
      return;
    }
    try {
      const user = await api.auth.me(stored.session.access_token);
      setState((s) => ({
        ...s,
        user,
        session: stored.session,
        isAuthenticated: true,
        loading: false,
      }));
    } catch {
      try {
        const refreshed = await api.auth.refresh(stored.session.refresh_token);
        const user = await api.auth.me(refreshed.session.access_token);
        const next = { user, session: refreshed.session };
        saveSession(next);
        setState({
          user,
          session: refreshed.session,
          loading: false,
          isAuthenticated: true,
        });
      } catch {
        saveSession(null);
        setState((s) => ({
          ...s,
          user: null,
          session: null,
          isAuthenticated: false,
          loading: false,
        }));
      }
    }
  }, []);

  useEffect(() => {
    const stored = loadSession();
    if (!stored) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    setState((s) => ({
      ...s,
      user: stored.user,
      session: stored.session,
      isAuthenticated: true,
    }));
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    saveSession(data);
    setState({
      user: data.user,
      session: data.session,
      loading: false,
      isAuthenticated: true,
    });
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const data = await api.auth.register(email, password, name);
      if (data.session) {
        saveSession({ user: data.user, session: data.session });
        setState({
          user: data.user,
          session: data.session,
          loading: false,
          isAuthenticated: true,
        });
      } else {
        setState((s) => ({ ...s, loading: false }));
        return { message: data.message };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    saveSession(null);
    setState({
      user: null,
      session: null,
      loading: false,
      isAuthenticated: false,
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshUser,
    }),
    [state, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
