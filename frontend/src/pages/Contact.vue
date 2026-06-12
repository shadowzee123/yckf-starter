<template>
  <SiteLayout>
    <section class="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
      <div>
        <p class="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">Contact</p>
        <h1 class="mt-4 text-4xl font-black">Reach YCKF support</h1>
        <div class="mt-6 space-y-3 text-slate-600">
          <p><strong class="text-slate-950">WhatsApp:</strong> +233 505 313 578</p>
          <p><strong class="text-slate-950">Phone:</strong> +234 803 643 2743</p>
          <p><strong class="text-slate-950">Telegram:</strong> @YoungCyberKnightsBot</p>
          <p><strong class="text-slate-950">Email:</strong> yckfadmin@youngcyberknightsfoundation.org</p>
          <p><strong class="text-slate-950">Location:</strong> Post Office Box 3490, Kumasi, Ghana</p>
        </div>
        <div class="mt-6 flex flex-wrap gap-3">
          <a class="rounded bg-emerald-700 px-4 py-3 text-sm font-black text-white" href="https://wa.me/233505313578">Chat with us on WhatsApp</a>
          <a class="rounded bg-sky-600 px-4 py-3 text-sm font-black text-white" href="https://t.me/YoungCyberKnightsBot">Chat with us on Telegram</a>
        </div>
      </div>

      <form class="rounded border border-slate-200 bg-white p-6">
        <div class="grid gap-4 md:grid-cols-2">
          <input class="field" placeholder="Full name" />
          <input class="field" placeholder="Email address" />
        </div>
        <input class="field mt-4" placeholder="Subject" />
        <textarea class="field mt-4 min-h-36" placeholder="Message"></textarea>
        <button class="mt-4 rounded bg-slate-950 px-5 py-3 text-sm font-black text-white" type="button">Send Message</button>
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

.field:focus {
  border-color: rgb(5 150 105);
  box-shadow: 0 0 0 3px rgb(167 243 208);
}
</style>
