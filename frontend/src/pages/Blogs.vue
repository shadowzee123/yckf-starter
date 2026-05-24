<template>
  <SiteLayout>
    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p class="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">Blogs</p>
      <h1 class="mt-4 text-4xl font-black">Cybersecurity articles and awareness updates</h1>
      <div class="mt-8 grid gap-5 md:grid-cols-3">
        <article v-for="post in blogPosts" :key="post.title" class="rounded border border-slate-200 bg-white p-6">
          <p class="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{{ post.category }} / {{ post.date }}</p>
          <h2 class="mt-3 text-xl font-black">{{ post.title }}</h2>
          <p class="mt-3 leading-7 text-slate-600">{{ post.excerpt }}</p>
          <button class="mt-5 text-sm font-black text-emerald-700">Read article</button>
        </article>
      </div>
    </section>
  </SiteLayout>
</template>

<script setup lang="ts">
import SiteLayout from '../components/SiteLayout.vue';
import { blogPosts } from '../data/siteContent';
</script>
