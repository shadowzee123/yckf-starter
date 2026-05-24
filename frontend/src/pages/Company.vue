<template>
  <SiteLayout>
    <section class="bg-white">
      <div class="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <img
          class="h-full min-h-80 w-full rounded object-cover"
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80"
          alt="Students learning together"
        />
        <div class="self-center">
          <p class="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">Company</p>
          <h1 class="mt-4 text-4xl font-black leading-tight text-slate-950">About Young Cyber Knights Foundation</h1>
          <p class="mt-5 text-lg leading-8 text-slate-600">
            YCKF is focused on practical cybersecurity education, youth digital safety, public awareness, and community cyber support.
          </p>
        </div>
      </div>
    </section>

    <section id="mission" class="border-y border-slate-200 bg-slate-100">
      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8">
        <div class="rounded bg-white p-6">
          <h2 class="text-2xl font-black">Mission</h2>
          <p class="mt-3 leading-7 text-slate-600">Equip young people with cybersecurity knowledge, ethical digital skills, and confidence to stay safe online.</p>
        </div>
        <div class="rounded bg-white p-6">
          <h2 class="text-2xl font-black">Vision</h2>
          <p class="mt-3 leading-7 text-slate-600">Build a resilient generation of cyber-aware learners who can protect themselves, families, schools, and communities.</p>
        </div>
      </div>
    </section>

    <section id="impact" class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-black">Impact Areas</h2>
      <div class="mt-8 grid gap-4 md:grid-cols-4">
        <div v-for="item in impact" :key="item" class="rounded border border-slate-200 bg-white p-5 font-bold text-slate-700">
          {{ item }}
        </div>
      </div>
    </section>
  </SiteLayout>
</template>

<script setup lang="ts">
import SiteLayout from '../components/SiteLayout.vue';

const impact = ['Cyber awareness', 'Youth training', 'Incident support', 'Certificate verification'];
</script>
