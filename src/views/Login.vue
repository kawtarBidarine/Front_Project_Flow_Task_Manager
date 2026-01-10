<template>
  <div class="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
    <div class="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
      <div class="text-center mb-8">
        <img src="/logo.png" alt="Logo" class="w-32 mx-auto mb-4">
        <h1 class="text-2xl font-bold text-white">Welcome Back</h1>
        <p class="text-slate-400 text-sm">Please enter your details to sign in</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase mb-2">Email Address</label>
          <input v-model="email" type="email" class="auth-input" placeholder="name@company.com" required />
        </div>
        
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase mb-2">Password</label>
          <input v-model="password" type="password" class="auth-input" placeholder="••••••••" required />
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50">
          {{ loading ? 'Authenticating...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  setTimeout(() => {
    localStorage.setItem('user_token', 'fake-jwt-token');
    router.push('/dashboard');
    loading.value = false;
  }, 1000);
};
</script>

<style scoped>
.auth-input {
  @apply w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition;
}
</style>