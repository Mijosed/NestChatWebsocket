const API_URL = 'http://localhost:3000';

export async function register(email: string, username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? 'Register failed');
  }

  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? 'Login failed');
  }

  const data = await res.json();
  localStorage.setItem('access_token', data.access_token);
  document.cookie = `access_token=${data.access_token}; path=/`;
  return data;
}

export function getToken() {
  return localStorage.getItem('access_token');
}

export function logout() {
  localStorage.removeItem('access_token');
  document.cookie = 'access_token=; path=/; max-age=0';
}

async function apiFetch(path: string, options?: RequestInit) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message ?? 'Request failed');
  }
  return res.json();
}

export function getMe() {
  return apiFetch('/user/me');
}

export function updateMe(data: { username?: string; color?: string }) {
  return apiFetch('/user/me', { method: 'PATCH', body: JSON.stringify(data) });
}

export function getUsers() {
  return apiFetch('/user');
}

export function getRooms() {
  return apiFetch('/room');
}

export function createRoom(name: string) {
  return apiFetch('/room', { method: 'POST', body: JSON.stringify({ name }) });
}

export function getRoomMessages(roomId: string) {
  return apiFetch(`/room/${roomId}/messages`);
}

export function addRoomMember(roomId: string, userId: string, hasHistory: boolean) {
  return apiFetch(`/room/${roomId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId, hasHistory }),
  });
}
