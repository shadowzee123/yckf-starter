const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function fetchUsers(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }

  return res.json();
}
