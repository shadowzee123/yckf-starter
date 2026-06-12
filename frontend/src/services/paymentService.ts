import { apiUrl } from './api';

export async function createDemoDonation(token: string, payload: { courseId: string; amount: number; currency: 'GHS' | 'USD' }) {
  const res = await fetch(apiUrl('/api/payments/demo-donation'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, provider: 'demo' }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Donation failed');
  return json;
}
