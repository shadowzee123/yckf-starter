<template>
  <SiteLayout>
    <section class="bg-white">
      <div class="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <p class="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">Premium Training</p>
          <h1 class="mt-4 text-4xl font-black leading-tight">Donation-based access to practical cybersecurity tracks</h1>
          <p class="mt-5 max-w-3xl leading-7 text-slate-600">
            Donations must be between GHS 50 and GHS 100, or the USD equivalent. Amounts below the minimum are denied and amounts above the maximum return an error.
          </p>
        </div>
        <div class="rounded bg-slate-950 p-6 text-white">
          <h2 class="text-xl font-black">Donation validator</h2>
          <div class="mt-5 grid gap-3">
            <label class="text-sm font-bold" for="currency">Currency</label>
            <select id="currency" v-model="currency" class="rounded border border-white/20 bg-slate-900 p-3">
              <option value="GHS">GHS</option>
              <option value="USD">USD</option>
            </select>
            <label class="text-sm font-bold" for="amount">Amount</label>
            <input id="amount" v-model.number="amount" class="rounded border border-white/20 bg-slate-900 p-3" type="number" min="0" />
          </div>
          <p class="mt-5 rounded p-3 text-sm font-bold" :class="validationClass">{{ validationMessage }}</p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="grid gap-5 md:grid-cols-3">
        <article v-for="course in displayCourses" :key="course.title" class="rounded border border-slate-200 bg-white p-6">
          <p class="text-sm font-black text-emerald-700">{{ course.price }}</p>
          <h2 class="mt-3 text-xl font-black">{{ course.title }}</h2>
          <p class="mt-1 text-sm font-bold text-slate-500">{{ course.duration }}</p>
          <p class="mt-3 leading-7 text-slate-600">{{ course.summary }}</p>
          <button
            class="mt-5 rounded bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            :disabled="unlockingId === course.id"
            @click="unlockCourse(course)"
          >
            {{ unlockingId === course.id ? 'Processing...' : 'Donate & Enroll' }}
          </button>
        </article>
      </div>
      <p v-if="error" class="mt-5 rounded bg-amber-50 p-3 text-sm font-bold text-amber-900">{{ error }}</p>
      <p v-if="success" class="mt-5 rounded bg-emerald-50 p-3 text-sm font-bold text-emerald-900">{{ success }}</p>
    </section>
  </SiteLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import SiteLayout from '../components/SiteLayout.vue';
import { premiumCourses } from '../data/siteContent';
import { fetchCourses, type ApiCourse } from '../services/courseService';
import { createDemoDonation } from '../services/paymentService';

const currency = ref<'GHS' | 'USD'>('GHS');
const amount = ref(50);
const apiCourses = ref<ApiCourse[]>([]);
const error = ref('');
const success = ref('');
const unlockingId = ref('');

const ghsValue = computed(() => (currency.value === 'GHS' ? amount.value : amount.value * 10));

const validationMessage = computed(() => {
  if (ghsValue.value < 50) return 'Denied: donation is below the minimum required for premium access.';
  if (ghsValue.value > 100) return 'Error: donation is above the allowed range.';
  return 'Valid: this donation unlocks premium course access after successful payment.';
});

const validationClass = computed(() => {
  if (ghsValue.value < 50) return 'bg-red-100 text-red-800';
  if (ghsValue.value > 100) return 'bg-amber-100 text-amber-900';
  return 'bg-emerald-100 text-emerald-900';
});

const displayCourses = computed(() => {
  if (!apiCourses.value.length) return premiumCourses;

  return apiCourses.value
    .filter((course) => course.isPremium)
    .map((course) => ({
      id: course.id,
      title: course.title,
      price: 'GHS 50-100 / USD 5-10',
      duration: `${course.lessons?.length || 0} lessons`,
      summary: course.description || 'Premium cybersecurity training track.',
    }));
});

async function unlockCourse(course: any) {
  error.value = '';
  success.value = '';

  if (!course.id) {
    error.value = 'Start the backend to unlock live premium courses.';
    return;
  }

  const token = localStorage.getItem('yckf_token');
  if (!token) {
    error.value = 'Please login as student@yckf.test before donating.';
    return;
  }

  unlockingId.value = course.id;

  try {
    await createDemoDonation(token, {
      courseId: course.id,
      amount: amount.value,
      currency: currency.value,
      provider: 'demo',
    });

    success.value = `${course.title} unlocked. Open your student dashboard to see the enrollment.`;
  } catch (err: any) {
    error.value = err.message || 'Donation could not be processed.';
  } finally {
    unlockingId.value = '';
  }
}

onMounted(async () => {
  try {
    apiCourses.value = await fetchCourses();
  } catch {
    error.value = 'Showing sample premium courses because the backend is not reachable.';
  }
});
</script>
