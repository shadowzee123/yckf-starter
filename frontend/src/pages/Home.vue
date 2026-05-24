<template>
  <SiteLayout>
    <section class="relative overflow-hidden bg-slate-950 text-white">
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-35"></div>
      <div class="absolute inset-0 bg-slate-950/55"></div>
      <div class="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p class="text-sm font-black uppercase tracking-[0.3em] text-emerald-300">Young Cyber Knights Foundation</p>
          <h1 class="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Cybersecurity training and safer internet support for young people.
          </h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            A full-stack learning platform with free awareness courses, donation-supported premium training, student progress tracking, complaints support, and certificate verification.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <RouterLink to="/free-training" class="rounded bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950">
              Start Free Training
            </RouterLink>
            <RouterLink to="/premium-training" class="rounded border border-white/40 px-5 py-3 text-sm font-black text-white">
              View Premium Courses
            </RouterLink>
          </div>
        </div>
        <div class="grid gap-3">
          <div class="rounded border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p class="text-3xl font-black">3</p>
            <p class="mt-1 text-sm text-slate-200">Role levels: Student, Master Admin, Secondary Admin</p>
          </div>
          <div class="rounded border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p class="text-3xl font-black">GHS 50-100</p>
            <p class="mt-1 text-sm text-slate-200">Valid donation range for premium access</p>
          </div>
          <div class="rounded border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p class="text-3xl font-black">QR</p>
            <p class="mt-1 text-sm text-slate-200">Certificate generation and verification portal</p>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="grid gap-8 lg:grid-cols-3">
        <article class="feature-panel">
          <p class="eyebrow">Training</p>
          <h2>Free cybersecurity awareness</h2>
          <p>Beginner-friendly courses help students understand scams, phishing, privacy, and safe device habits.</p>
        </article>
        <article class="feature-panel">
          <p class="eyebrow">Premium</p>
          <h2>Donation-based skill tracks</h2>
          <p>Premium courses unlock only after validated donation payment and successful webhook confirmation.</p>
        </article>
        <article class="feature-panel">
          <p class="eyebrow">Support</p>
          <h2>Complaints and cyber help</h2>
          <p>Students can submit cyber complaints and reach WhatsApp or Telegram support from the site.</p>
        </article>
      </div>
    </section>
  </SiteLayout>
</template>

<script setup lang="ts">
import SiteLayout from '../components/SiteLayout.vue';
</script>

<style scoped>
.feature-panel {
  border: 1px solid rgb(226 232 240);
  border-radius: 0.5rem;
  background: white;
  padding: 1.5rem;
}

.feature-panel h2 {
  margin-top: 0.5rem;
  font-size: 1.25rem;
  font-weight: 900;
}

.feature-panel p:last-child {
  margin-top: 0.75rem;
  color: rgb(71 85 105);
  line-height: 1.6;
}

.eyebrow {
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(4 120 87);
}
</style>
