const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

export async function askBot(message: string, platform = 'web') {
  const res = await fetch(`${API_BASE}/api/bots/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, platform, userRef: 'demo-user' }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Bot request failed');
  return json.response as string;
}
