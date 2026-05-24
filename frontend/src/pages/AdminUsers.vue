<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Admin — Users</h1>

    <div class="mb-4 flex gap-2">
      <button @click="logout" class="px-3 py-1 rounded bg-red-500 text-white">Logout</button>
      <button @click="reload" class="px-3 py-1 rounded bg-blue-600 text-white">Reload</button>
      <div v-if="token" class="ml-auto text-sm text-gray-600">Token: <span class="font-mono break-all">{{ tokenSnippet }}</span></div>
    </div>

    <div v-if="loading" class="py-8 text-center">Loading users…</div>

    <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>

    <table v-if="!loading && users.length" class="min-w-full bg-white rounded shadow overflow-hidden">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="p-3">Email</th>
          <th class="p-3">Name</th>
          <th class="p-3">Role</th>
          <th class="p-3">Created</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id" class="border-t">
          <td class="p-3 text-sm">{{ u.email }}</td>
          <td class="p-3 text-sm">{{ u.name || '-' }}</td>
          <td class="p-3 text-sm">{{ u.role?.name || '-' }}</td>
          <td class="p-3 text-sm">{{ formatDate(u.createdAt) }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && !users.length" class="text-gray-600">No users found.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

type Role = { id: string; name: string };
type User = { id: string; email: string; name?: string | null; role?: Role | null; createdAt: string };

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// get token from localStorage (store token on login)
const token = ref<string | null>(localStorage.getItem('yckf_token'));

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

const tokenSnippet = computed(() => (token.value ? token.value.slice(0, 24) + '...' : ''));

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(); } catch { return s; }
}

async function loadUsers() {
  error.value = null;
  if (!token.value) {
    error.value = 'No token found. Please login first (store token in localStorage as "yckf_token").';
    return;
  }

  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const txt = await res.text();
      // try to parse json message
      try {
        const j = JSON.parse(txt);
        error.value = j.message || `Request failed: ${res.status}`;
      } catch {
        error.value = `Request failed: ${res.status} — ${txt}`;
      }
      users.value = [];
    } else {
      const json = await res.json();
      users.value = Array.isArray(json) ? json : json.users || [];
    }
  } catch (e: any) {
    error.value = `Network error: ${e.message || e}`;
  } finally {
    loading.value = false;
  }
}

function logout() {
  localStorage.removeItem('yckf_token');
  token.value = null;
  users.value = [];
}

function reload() {
  loadUsers();
}

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
/* small nicety — Tailwind will handle most */
table { border-collapse: collapse; width: 100%; }
</style>
