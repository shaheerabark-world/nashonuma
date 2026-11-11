// Talks to the NashoNuma API (../nashonuma-api). Off unless VITE_API_URL is set,
// in which case the app keeps using localStorage only (tests, offline demo).
import type { Role } from '@/data/mock/app';

export const API_URL: string | undefined = (import.meta.env?.VITE_API_URL as string | undefined) || undefined;
export const apiEnabled = !!API_URL;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  initials: string;
  job: string;
  role: Role;
  phone: string | null;
}

const TOKEN_KEY = 'nn_token';
const USER_KEY = 'nn_user';

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

export const session = {
  token: (): string | null => read(TOKEN_KEY),
  user: (): SessionUser | null => {
    try {
      return JSON.parse(read(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  save(token: string, user: SessionUser) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* storage blocked: the session lasts until reload */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  }
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/** fetch with the Bearer token and JSON. A 401 ends the session and goes to /login. */
export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = session.token();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(API_URL + path, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body)
  });

  if (res.status === 401 && !path.startsWith('/auth/login')) {
    session.clear();
    if (location.pathname !== '/login') location.assign('/login');
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message || res.statusText;
    throw new ApiError(res.status, msg);
  }
  return data as T;
}

export async function login(email: string, password: string): Promise<SessionUser> {
  const out = await api<{ token: string; user: SessionUser }>('/auth/login', { method: 'POST', body: { email, password } });
  session.save(out.token, out.user);
  return out.user;
}

export function logout() {
  session.clear();
  location.assign('/login');
}
