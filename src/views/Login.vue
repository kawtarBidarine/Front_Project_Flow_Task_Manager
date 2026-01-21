<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    </div>

    <div class="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative z-10 animate-fadeIn">
      <div class="text-center mb-8">
        <div class="inline-block animate-bounce-subtle mb-4">
          <img src="/logo.png" alt="Logo" class="w-32 mx-auto">
        </div>
        <h1 class="text-3xl font-bold text-white mb-2 animate-slideDown">Welcome Back</h1>
        <p class="text-slate-400 text-sm animate-slideDown" style="animation-delay: 0.1s;">Please enter your details to sign in</p>
      </div>

      <div v-if="userStore.error" class="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl text-sm animate-shake">
        {{ userStore.error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="animate-slideUp" style="animation-delay: 0.2s;">
          <label class="block text-xs font-semibold text-slate-400 uppercase mb-2">Email Address</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors z-10">
              <Mail :size="18" />
            </div>
            <input 
              v-model="email" 
              type="email" 
              class="auth-input pl-12" 
              placeholder="name@company.com" 
              required 
              :disabled="userStore.loading"
            />
          </div>
        </div>
        
        <div class="animate-slideUp" style="animation-delay: 0.3s;">
          <label class="block text-xs font-semibold text-slate-400 uppercase mb-2">Password</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors z-10">
              <Lock :size="18" />
            </div>
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              class="auth-input pl-12 pr-12" 
              placeholder="••••••••" 
              required 
              :disabled="userStore.loading"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-400 transition-colors z-10"
              :disabled="userStore.loading"
            >
              <Eye v-if="!showPassword" :size="18" />
              <EyeOff v-else :size="18" />
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="userStore.loading" 
          class="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] animate-slideUp relative overflow-hidden group"
          style="animation-delay: 0.4s;"
        >
          <span class="relative z-10 flex items-center justify-center gap-2">
            <LogIn v-if="!userStore.loading" :size="20" />
            <Loader2 v-else :size="20" class="animate-spin" />
            {{ userStore.loading ? 'Authenticating...' : 'Sign In' }}
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-300 opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </button>

        <div class="text-slate-400 mx-auto mt-4 text-center animate-slideUp bg-slate-900/50 rounded-lg p-4 border border-slate-700/50" style="animation-delay: 0.5s;">
          <div class="text-xs mb-3">
            <strong class="text-slate-300">Demo credentials:</strong>
          </div>
          <div class="flex flex-col gap-2">
            <button
              type="button"
              @click="copyDemoCredentials"
              class="flex items-center justify-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors"
            >
              <Copy :size="14" />
              {{ copied ? 'Credentials Copied!' : 'Copy & Fill Credentials' }}
            </button>
            <div class="text-xs text-slate-500">
              Email: bidarine@demo.com | Pass: bidarine/demo
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff, Copy } from 'lucide-vue-next';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const copied = ref(false);
const router = useRouter();
const userStore = useUserStore();

const handleLogin = async () => {
  const result = await userStore.login(email.value, password.value);
  
  if (result.success) {
    router.push('/dashboard');
  }
};

const copyDemoCredentials = () => {
  email.value = 'bidarine@demo.com';
  password.value = 'bidarine/demo';
  copied.value = true;
  
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

<style scoped>
.auth-input {
  @apply w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-slideDown {
  animation: slideDown 0.6s ease-out forwards;
  opacity: 0;
}

.animate-slideUp {
  animation: slideUp 0.6s ease-out forwards;
  opacity: 0;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

.animate-bounce-subtle {
  animation: bounce-subtle 3s ease-in-out infinite;
}
</style>