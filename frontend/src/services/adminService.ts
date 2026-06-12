import { apiUrl } from './api';

export async function fetchUsers(token: string) {
  const res = await fetch(apiUrl('/api/admin/users'), {
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
