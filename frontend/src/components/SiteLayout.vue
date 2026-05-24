<template>
  <div class="min-h-screen bg-slate-50 text-slate-950">
    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <RouterLink to="/" class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded bg-emerald-700 text-sm font-black text-white">
            YK
          </span>
          <span>
            <span class="block text-sm font-black uppercase tracking-wide text-slate-950">YCKF</span>
            <span class="block text-xs font-medium text-slate-500">Young Cyber Knights Foundation</span>
          </span>
        </RouterLink>

        <button
          class="rounded border border-slate-300 px-3 py-2 text-sm font-semibold md:hidden"
          type="button"
          @click="menuOpen = !menuOpen"
        >
          Menu
        </button>

        <div
          class="absolute left-0 right-0 top-full border-b border-slate-200 bg-white px-4 py-4 shadow-sm md:static md:flex md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none"
          :class="menuOpen ? 'block' : 'hidden md:flex'"
        >
          <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-link">
            {{ item.label }}
          </RouterLink>

          <div class="group relative">
            <button class="nav-link flex w-full items-center justify-between gap-2" type="button">
              Company
              <span class="text-xs">v</span>
            </button>
            <div class="rounded border border-slate-200 bg-white shadow-lg md:absolute md:right-0 md:top-full md:hidden md:min-w-56 md:group-hover:block">
              <RouterLink to="/company" class="dropdown-link">About YCKF</RouterLink>
              <a href="/company#mission" class="dropdown-link">Mission & Vision</a>
              <a href="/company#impact" class="dropdown-link">Impact Areas</a>
            </div>
          </div>

          <RouterLink to="/student-dashboard" class="nav-link">Dashboard</RouterLink>
          <RouterLink to="/login" class="mt-3 inline-flex rounded bg-emerald-700 px-4 py-2 text-sm font-bold text-white md:ml-2 md:mt-0">
            Admin Login
          </RouterLink>
        </div>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <footer class="border-t border-slate-200 bg-slate-950 text-white">
      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        <div class="md:col-span-2">
          <p class="text-lg font-black">Young Cyber Knights Foundation</p>
          <p class="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Cybersecurity education, safe internet awareness, practical training, and youth-focused digital resilience.
          </p>
        </div>
        <div>
          <p class="font-bold">Contact</p>
          <p class="mt-3 text-sm text-slate-300">Post Office Box 3490, Kumasi, Ghana</p>
          <p class="mt-1 text-sm text-slate-300">+233 505 313 578</p>
        </div>
        <div>
          <p class="font-bold">Quick Actions</p>
          <div class="mt-3 flex flex-col gap-2 text-sm text-slate-300">
            <RouterLink to="/complaints">Submit Complaint</RouterLink>
            <RouterLink to="/premium-training">Premium Training</RouterLink>
            <RouterLink to="/verify">Verify Certificate</RouterLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const menuOpen = ref(false);

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/free-training', label: 'Free Training' },
  { to: '/premium-training', label: 'Premium Training' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/contact', label: 'Contact' },
  { to: '/complaints', label: 'Complaints' },
  { to: '/bot-support', label: 'Bots' },
];
</script>

<style scoped>
.nav-link {
  display: block;
  border-radius: 0.375rem;
  padding: 0.6rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: rgb(51 65 85);
}

.nav-link:hover,
.router-link-active.nav-link {
  background: rgb(240 253 244);
  color: rgb(21 128 61);
}

.dropdown-link {
  display: block;
  padding: 0.7rem 0.9rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: rgb(51 65 85);
}

.dropdown-link:hover {
  background: rgb(240 253 244);
  color: rgb(21 128 61);
}
</style>
