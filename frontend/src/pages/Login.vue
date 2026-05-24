<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
      <h2 class="text-2xl font-bold text-center mb-2">YCKF Login</h2>
      <p class="mb-6 text-center text-sm text-gray-500">
        Admin and student access
      </p>

      <form @submit.prevent="loginUser">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Email</label>

          <input
            v-model="email"
            type="email"
            class="w-full border rounded-lg p-2"
            placeholder="admin@yckf.test"
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium mb-1">Password</label>

          <input
            v-model="password"
            type="password"
            class="w-full border rounded-lg p-2"
            placeholder="Password"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Login
        </button>
      </form>

      <p v-if="error" class="text-red-500 text-center mt-4">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const error = ref("");

const router = useRouter();

async function loginUser() {
  try {
    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      error.value = data.message || "Invalid login";
      return;
    }

    localStorage.setItem("yckf_token", data.token);
    localStorage.setItem("yckf_user", JSON.stringify(data.user));

    const role = data.user?.role;

    if (role === "student") {
      router.push("/student-dashboard");
    } else if (role === "secondary_admin") {
      router.push("/admin/courses");
    } else {
      router.push("/admin");
    }
  } catch (e) {
    error.value = "Network error. Try again.";
  }
}
</script>