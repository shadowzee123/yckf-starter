import React, { useEffect, useState } from 'react';

const BACKEND_URL = ((import.meta as any).env?.VITE_BACKEND_URL as string) || 'http://localhost:4000';

type User = {
  id: string;
  email: string;
  name?: string | null;
  role?: { name: string } | string | null;
  createdAt?: string;
};

export default function App() {
  const [email, setEmail] = useState('admin@yckf.test');
  const [password, setPassword] = useState('Admin#1234');
  const [token, setToken] = useState<string | null>(localStorage.getItem('yckf_token'));
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token) localStorage.setItem('yckf_token', token);
  }, [token]);

  async function login() {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const body = await res.json();
      if (!res.ok) {
        setMsg(body?.message || 'Login failed');
      } else {
        setToken(body.token);
        setUser(body.user || null);
        setMsg('Login successful');
      }
    } catch (e: any) {
      setMsg('Network error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail('admin@yckf.test');
    setPassword('Admin#1234');
  }

  async function fetchUsers() {
    setMsg(null);
    setLoading(true);
    try {
      const auth = token || localStorage.getItem('yckf_token');
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${auth}` }
      });
      if (!res.ok) {
        const b = await res.text();
        setMsg(`Error fetching users: ${res.status} ${b}`);
        setUsers(null);
      } else {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e: any) {
      setMsg('Network error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('yckf_token');
    setToken(null);
    setUser(null);
    setUsers(null);
    setMsg('Logged out');
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', fontFamily: 'system-ui, Arial, sans-serif' }}>
      <h1>YCKF Frontend — Admin tester</h1>
      <section style={{ marginBottom: 18, padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
        <h2>Login</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
          <button onClick={login} disabled={loading}>Login</button>
          <button onClick={fillDemo}>Fill demo</button>
          <button onClick={logout}>Logout</button>
        </div>
        <div>
          <strong>Token:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 8 }}>{token ?? '— none —'}</pre>
        </div>
        <div style={{ color: 'crimson' }}>{msg}</div>
      </section>

      <section style={{ marginBottom: 18, padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
        <h2>Admin API</h2>
        <div style={{ marginBottom: 8 }}>
          <button onClick={fetchUsers} disabled={loading}>Fetch /api/admin/users</button>
        </div>
        {users && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Role</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>{u.email}</td>
                  <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>{u.name ?? ''}</td>
                  <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>{(u.role && (typeof u.role === 'string' ? u.role : (u.role as any).name)) ?? ''}</td>
                  <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>{u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer style={{ color: '#666', fontSize: 13 }}>
        Backend URL: <code>{BACKEND_URL}</code>. If your backend runs on another host/port, change the variable at the top of <code>src/App.tsx</code>.
      </footer>
    </div>
  );
}
