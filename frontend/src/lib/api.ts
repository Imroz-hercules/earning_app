import type { AdminProfile, Role, UserProfile } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const TOKEN_KEY = "taskhub_token";

export type AuthResponse = {
  access_token: string;
  role: Role;
  profile: UserProfile | AdminProfile;
};

export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

export function absoluteFileUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL.replace(/\/api$/, "")}${url}`;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }
  return payload as T;
}

export const authApi = {
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    api<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    api<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  adminLogin: (data: { email: string; password: string }) =>
    api<AuthResponse>("/auth/admin/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => api<{ role: Role; profile: UserProfile | AdminProfile }>("/auth/me"),
};

