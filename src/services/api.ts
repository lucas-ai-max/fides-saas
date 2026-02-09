const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export type AuthUser = {
  id: string;
  email?: string;
  created_at: string;
  full_name?: string;
  /** Nome exibido (ex.: user_metadata do Supabase) */
  display_name?: string;
};

export type Session = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
};

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error ?? `Erro ${res.status}`);
  }
  return data as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: AuthUser; session: Session }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, name?: string) =>
      request<{ user: AuthUser; session: Session | null; message?: string }>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({ email, password, name }),
        }
      ),
    me: (token: string) =>
      request<AuthUser>("/api/auth/me", { method: "GET", token }),
    refresh: (refreshToken: string) =>
      request<{ session: Session }>("/api/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      }),
    logout: () =>
      request<{ message: string }>("/api/auth/logout", { method: "POST" }),
  },
};
