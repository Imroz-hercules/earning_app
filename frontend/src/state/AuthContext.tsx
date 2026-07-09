import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authApi, type AuthResponse, setToken } from "../lib/api";
import type { AdminProfile, Role, UserProfile } from "../types";

type AuthState = {
  token: string | null;
  role: Role | null;
  profile: UserProfile | AdminProfile | null;
  loading: boolean;
  login: (email: string, password: string, admin?: boolean) => Promise<Role>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

function applyAuth(response: AuthResponse, setState: (state: Partial<AuthState>) => void) {
  setToken(response.access_token);
  setState({
    token: response.access_token,
    role: response.role,
    profile: response.profile,
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokenState, setTokenState] = useState<string | null>(() => window.localStorage.getItem("taskhub_token"));
  const [role, setRole] = useState<Role | null>(null);
  const [profile, setProfile] = useState<UserProfile | AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const setState = (state: Partial<AuthState>) => {
    if ("token" in state) setTokenState(state.token ?? null);
    if ("role" in state) setRole(state.role ?? null);
    if ("profile" in state) setProfile(state.profile ?? null);
  };

  const refresh = async () => {
    const stored = window.localStorage.getItem("taskhub_token");
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const result = await authApi.me();
      setTokenState(stored);
      setRole(result.role);
      setProfile(result.profile);
    } catch {
      setToken(null);
      setState({ token: null, role: null, profile: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token: tokenState,
      role,
      profile,
      loading,
      login: async (email, password, admin = false) => {
        const response = admin
          ? await authApi.adminLogin({ email, password })
          : await authApi.login({ email, password });
        applyAuth(response, setState);
        return response.role;
      },
      register: async (data) => {
        const response = await authApi.register(data);
        applyAuth(response, setState);
      },
      logout: () => {
        setToken(null);
        setState({ token: null, role: null, profile: null });
      },
      refresh,
    }),
    [tokenState, role, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
