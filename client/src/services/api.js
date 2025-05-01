// client/src/services/api.js

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export async function loginRequest(email, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }

  const { access_token } = await res.json();
  return access_token;
}
