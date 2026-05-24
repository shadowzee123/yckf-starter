<template>
  <SiteLayout>
    <section class="bg-slate-950 text-white">
      <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p class="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">Complaints</p>
        <h1 class="mt-4 text-4xl font-black">Report a cyber safety concern</h1>
        <p class="mt-4 max-w-3xl leading-7 text-slate-300">Use this form to submit phishing, account compromise, online harassment, scam, or training support complaints.</p>
      </div>
    </section>

    <section class="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <form class="rounded border border-slate-200 bg-white p-6">
        <div class="grid gap-4 md:grid-cols-2">
          <input class="field" placeholder="Full name" />
          <input class="field" placeholder="Email or phone" />
        </div>
        <select class="field mt-4">
          <option>Phishing or scam</option>
          <option>Account compromise</option>
          <option>Online abuse</option>
          <option>Course or certificate support</option>
        </select>
        <textarea class="field mt-4 min-h-40" placeholder="Describe what happened"></textarea>
        <div class="mt-4 rounded bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          Your complaint will be logged for review. For urgent threats, contact local authorities immediately.
        </div>
        <button class="mt-5 rounded bg-emerald-700 px-5 py-3 text-sm font-black text-white" type="button">Submit Complaint</button>
      </form>
    </section>
  </SiteLayout>
</template>

<script setup lang="ts">
import SiteLayout from '../components/SiteLayout.vue';
</script>

<style scoped>
.field {
  width: 100%;
  border: 1px solid rgb(203 213 225);
  border-radius: 0.375rem;
  padding: 0.85rem 1rem;
  outline: none;
}
</style>
