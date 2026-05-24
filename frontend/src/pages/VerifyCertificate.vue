<template>
  <SiteLayout>
    <section class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p class="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">Verify Certificate</p>
      <h1 class="mt-4 text-4xl font-black">Certificate verification portal</h1>
      <p class="mt-4 leading-7 text-slate-600">Enter a certificate code to verify student name, course, issue date, and QR-backed authenticity.</p>
      <form class="mt-8 rounded border border-slate-200 bg-white p-6" @submit.prevent="submitVerification">
        <label class="text-sm font-bold" for="code">Verification code</label>
        <input id="code" v-model="code" class="mt-2 w-full rounded border border-slate-300 p-3" placeholder="YCKF-CERT-DEMO-001" />
        <button class="mt-4 rounded bg-emerald-700 px-5 py-3 text-sm font-black text-white" type="submit">
          {{ loading ? 'Verifying...' : 'Verify' }}
        </button>
      </form>

      <div v-if="result" class="mt-6 rounded border p-5" :class="result.valid ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'">
        <p class="text-lg font-black" :class="result.valid ? 'text-emerald-900' : 'text-red-900'">
          {{ result.valid ? 'Certificate is valid' : 'Certificate not found' }}
        </p>
        <div v-if="result.valid" class="mt-3 space-y-1 text-sm text-slate-700">
          <p><strong>Student:</strong> {{ result.student?.name || result.student?.email }}</p>
          <p><strong>Course:</strong> {{ result.course?.title }}</p>
          <p><strong>Code:</strong> {{ result.verifyCode }}</p>
        </div>
        <p v-else class="mt-2 text-sm text-red-800">{{ result.message }}</p>
      </div>
      <p v-if="error" class="mt-5 rounded bg-amber-50 p-3 text-sm font-bold text-amber-900">{{ error }}</p>
    </section>
  </SiteLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import SiteLayout from '../components/SiteLayout.vue';
import { verifyCertificate, type CertificateVerification } from '../services/courseService';

const code = ref('YCKF-CERT-DEMO-001');
const result = ref<CertificateVerification | null>(null);
const loading = ref(false);
const error = ref('');
const route = useRoute();

async function submitVerification() {
  if (!code.value.trim()) return;

  loading.value = true;
  error.value = '';

  try {
    result.value = await verifyCertificate(code.value.trim());
  } catch (err: any) {
    error.value = err.message || 'Verification failed.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const routeCode = route.query.code;
  if (typeof routeCode === 'string' && routeCode.trim()) {
    code.value = routeCode;
    submitVerification();
  }
});
</script>
