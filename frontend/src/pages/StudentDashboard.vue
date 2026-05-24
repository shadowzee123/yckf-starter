<template>
  <SiteLayout>
    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">Student Dashboard</p>
          <h1 class="mt-3 text-4xl font-black">Training progress and certificates</h1>
        </div>
        <RouterLink to="/premium-training" class="rounded bg-emerald-700 px-4 py-3 text-sm font-black text-white">Unlock Premium</RouterLink>
      </div>

      <div class="mt-8 grid gap-5 md:grid-cols-3">
        <div class="rounded bg-white p-5 shadow-sm">
          <p class="text-sm font-bold text-slate-500">Enrolled courses</p>
          <p class="mt-2 text-3xl font-black">{{ stats.enrolledCourses }}</p>
        </div>
        <div class="rounded bg-white p-5 shadow-sm">
          <p class="text-sm font-bold text-slate-500">Average progress</p>
          <p class="mt-2 text-3xl font-black">{{ stats.averageProgress }}%</p>
        </div>
        <div class="rounded bg-white p-5 shadow-sm">
          <p class="text-sm font-bold text-slate-500">Certificates</p>
          <p class="mt-2 text-3xl font-black">{{ stats.certificates }}</p>
        </div>
      </div>

      <div class="mt-8 rounded border border-slate-200 bg-white">
        <div v-for="course in courses" :key="course.title" class="border-b border-slate-200 p-5 last:border-b-0">
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-lg font-black">{{ course.title }}</h2>
              <p class="text-sm text-slate-500">{{ course.status }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <a
                v-if="course.certificateCode"
                class="rounded bg-emerald-700 px-3 py-2 text-xs font-black text-white"
                :href="certificatePrintUrl(course.certificateCode)"
                target="_blank"
                rel="noreferrer"
              >
                Print Certificate
              </a>
              <RouterLink
                v-if="course.certificateCode"
                class="rounded border border-emerald-700 px-3 py-2 text-xs font-black text-emerald-700"
                :to="`/verify?code=${encodeURIComponent(course.certificateCode)}`"
              >
                Verify
              </RouterLink>
              <span class="text-sm font-black text-emerald-700">{{ course.progress }}%</span>
            </div>
          </div>
          <div class="mt-4 h-3 rounded bg-slate-100">
            <div class="h-3 rounded bg-emerald-600" :style="{ width: `${course.progress}%` }"></div>
          </div>
        </div>
      </div>
      <p v-if="error" class="mt-5 rounded bg-amber-50 p-3 text-sm font-bold text-amber-900">{{ error }}</p>
    </section>
  </SiteLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import SiteLayout from '../components/SiteLayout.vue';
import { fetchStudentDashboard, type StudentDashboardResponse } from '../services/courseService';

const fallbackCourses = [
  { title: 'Cyber Hygiene Basics', status: 'Free course', progress: 100, certificateCode: 'YCKF-CERT-DEMO-001' },
  { title: 'Phishing Awareness', status: 'Free course', progress: 55, certificateCode: '' },
  { title: 'Ethical Hacking Foundation', status: 'Premium unlocked', progress: 30, certificateCode: '' },
];

const dashboard = ref<StudentDashboardResponse | null>(null);
const error = ref('');
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

const stats = computed(() => dashboard.value?.stats || {
  enrolledCourses: fallbackCourses.length,
  averageProgress: 62,
  certificates: 1,
});

const courses = computed(() => {
  if (!dashboard.value) return fallbackCourses;

  return dashboard.value.enrollments.map((enrollment) => ({
    title: enrollment.course.title,
    status: enrollment.course.isPremium ? 'Premium unlocked' : 'Free course',
    progress: enrollment.progress,
    certificateCode: enrollment.certificate?.verifyCode || '',
  }));
});

function certificatePrintUrl(code: string) {
  return `${API_BASE}/api/certificates/${encodeURIComponent(code)}/print`;
}

onMounted(async () => {
  const token = localStorage.getItem('yckf_token');

  if (!token) {
    error.value = 'Showing sample dashboard. Login as student@yckf.test to load live student data.';
    return;
  }

  try {
    dashboard.value = await fetchStudentDashboard(token);
  } catch {
    error.value = 'Showing sample dashboard because live student data could not be loaded.';
  }
});
</script>
