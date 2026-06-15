import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Me = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  lineUserId?: string | null;
};

type AuthState = { user: Me | null; loading: boolean; refresh: () => Promise<void> };

const AuthCtx = createContext<AuthState>({ user: null, loading: true, refresh: async () => {} });

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const r = await fetch('/api/me', { credentials: 'include' });
      setUser(r.ok ? ((await r.json()) as Me) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return <AuthCtx.Provider value={{ user, loading, refresh }}>{children}</AuthCtx.Provider>;
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}
