const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

export type DonationPayload = {
  courseId: string;
  amount: number;
  currency: 'GHS' | 'USD';
  provider?: string;
};

export async function createDemoDonation(token: string, payload: DonationPayload) {
  const res = await fetch(`${API_BASE}/api/payments/demo-donation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json: any = {};

  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { message: text };
  }

  if (!res.ok) {
    throw new Error(json.message || `Donation failed: ${res.status}`);
  }

  return json;
}
