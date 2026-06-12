<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Admin - Users</h1>

    <div class="mb-4 flex gap-2">
      <button @click="logout" class="px-3 py-1 rounded bg-red-500 text-white">Logout</button>
      <button @click="reload" class="px-3 py-1 rounded bg-blue-600 text-white">Reload</button>
      <RouterLink to="/admin/courses" class="px-3 py-1 rounded bg-emerald-700 text-white">Courses</RouterLink>
      <div v-if="token" class="ml-auto text-sm text-gray-600">
        Token: <span class="font-mono break-all">{{ tokenSnippet }}</span>
      </div>
    </div>

    <div v-if="loading" class="py-8 text-center">Loading users...</div>

    <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>

    <table v-if="!loading && users.length" class="min-w-full bg-white rounded shadow overflow-hidden">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="p-3">Email</th>
          <th class="p-3">Name</th>
          <th class="p-3">Role</th>
          <th class="p-3">Created</th>
          <th class="p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id" class="border-t">
          <td class="p-3 text-sm">{{ u.email }}</td>
          <td class="p-3 text-sm">{{ u.name || '-' }}</td>
          <td class="p-3 text-sm">
            <span
              class="px-2 py-1 rounded text-xs font-semibold"
              :class="
                u.role?.name === 'master_admin'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              "
            >
              {{ u.role?.name || '-' }}
            </span>
          </td>
          <td class="p-3 text-sm">{{ formatDate(u.createdAt) }}</td>
          <td class="p-3 flex gap-2">
            <button class="px-2 py-1 text-xs rounded bg-yellow-500 text-white">
              Edit
            </button>
            <button
              @click="deleteUser(u.id)"
              class="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && !users.length" class="text-gray-600">No users found.</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

type Role = { id: string; name: string };
type User = { id: string; email: string; name?: string | null; role?: Role | null; createdAt: string };

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const token = ref<string | null>(localStorage.getItem('yckf_token'));

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';
const tokenSnippet = computed(() => (token.value ? token.value.slice(0, 24) + '...' : ''));

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

async function loadUsers() {
  error.value = null;

  if (!token.value) {
    error.value = 'No token found. Please login first.';
    return;
  }

  loading.value = true;

  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const txt = await res.text();

      try {
        const json = JSON.parse(txt);
        error.value = json.message || `Request failed: ${res.status}`;
      } catch {
        error.value = `Request failed: ${res.status} - ${txt}`;
      }

      users.value = [];
      return;
    }

    users.value = await res.json();
  } catch (e: any) {
    error.value = `Network error: ${e.message || e}`;
  } finally {
    loading.value = false;
  }
}

function logout() {
  localStorage.removeItem('yckf_token');
  localStorage.removeItem('yckf_user');
  token.value = null;
  users.value = [];
}

function reload() {
  loadUsers();
}

async function deleteUser(id: string) {
  const confirmed = confirm('Are you sure you want to delete this user?');

  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      let message = 'Failed to delete user';

      try {
        message = JSON.parse(text).message || message;
      } catch {
        if (text) message = text;
      }

      throw new Error(message);
    }

    users.value = users.value.filter((u) => u.id !== id);
  } catch (e: any) {
    alert(e.message || 'Error deleting user');
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}
</style>
