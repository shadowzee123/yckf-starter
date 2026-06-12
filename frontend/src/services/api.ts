export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}
