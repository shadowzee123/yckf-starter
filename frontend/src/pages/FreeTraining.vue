<template>
  <SiteLayout>
    <section class="bg-emerald-950 text-white">
      <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p class="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">Free Training</p>
        <h1 class="mt-4 text-4xl font-black">Start learning cybersecurity for free</h1>
        <p class="mt-4 max-w-3xl leading-7 text-emerald-50">These courses support the foundation requirement for public cybersecurity education and beginner-friendly digital safety.</p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="grid gap-5 md:grid-cols-3">
        <article v-for="course in displayCourses" :key="course.title" class="rounded border border-slate-200 bg-white p-6">
          <p class="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{{ course.level }} / {{ course.lessonCount }} lessons</p>
          <h2 class="mt-3 text-xl font-black">{{ course.title }}</h2>
          <p class="mt-3 leading-7 text-slate-600">{{ course.summary }}</p>
          <button class="mt-5 rounded bg-slate-950 px-4 py-2 text-sm font-bold text-white">Enroll Free</button>
        </article>
      </div>
      <p v-if="error" class="mt-5 rounded bg-amber-50 p-3 text-sm font-bold text-amber-900">{{ error }}</p>
    </section>
  </SiteLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import SiteLayout from '../components/SiteLayout.vue';
import { freeCourses } from '../data/siteContent';
import { fetchCourses, type ApiCourse } from '../services/courseService';

const apiCourses = ref<ApiCourse[]>([]);
const error = ref('');

const displayCourses = computed(() => {
  if (!apiCourses.value.length) {
    return freeCourses.map((course) => ({
      title: course.title,
      level: course.level,
      lessonCount: course.lessons,
      summary: course.summary,
    }));
  }

  return apiCourses.value
    .filter((course) => !course.isPremium)
    .map((course) => ({
      title: course.title,
      level: 'Free',
      lessonCount: course.lessons?.length || 0,
      summary: course.description || 'Free cybersecurity awareness course.',
    }));
});

onMounted(async () => {
  try {
    apiCourses.value = await fetchCourses();
  } catch {
    error.value = 'Showing sample courses because the backend is not reachable.';
  }
});
</script>
