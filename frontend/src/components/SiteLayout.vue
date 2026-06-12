<template>
  <div class="min-h-screen bg-slate-50 text-slate-950">
    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <RouterLink to="/" class="flex items-center gap-3 font-black">
          <span class="grid h-10 w-10 place-items-center rounded bg-emerald-700 text-white">YK</span>
          <span>YCKF</span>
        </RouterLink>
        <div class="hidden items-center gap-1 md:flex">
          <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-link">{{ item.label }}</RouterLink>
          <RouterLink to="/login" class="rounded bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Login</RouterLink>
        </div>
      </nav>
    </header>
    <main><slot /></main>
    <footer class="bg-slate-950 px-4 py-8 text-white">
      <div class="mx-auto max-w-7xl">
        <p class="font-black">Young Cyber Knights Foundation</p>
        <p class="mt-2 text-sm text-slate-300">Cybersecurity training, support, and certificate verification.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const navItems = [
  { to: '/', label: 'Home' },
  { to: '/company', label: 'Company' },
  { to: '/free-training', label: 'Free Training' },
  { to: '/premium-training', label: 'Premium' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/contact', label: 'Contact' },
  { to: '/complaints', label: 'Complaints' },
  { to: '/bot-support', label: 'Bots' },
];
</script>

<style scoped>
.nav-link {
  border-radius: 0.375rem;
  padding: 0.55rem 0.7rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: rgb(51 65 85);
}
.nav-link:hover,
.router-link-active.nav-link {
  background: rgb(240 253 244);
  color: rgb(21 128 61);
}
</style>
