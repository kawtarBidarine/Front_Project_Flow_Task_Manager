<template>
  <header class="header">
    <div class="flex items-center space-x-6">
      <router-link to="/" class="text-xl font-bold text-blue-400">
        <img src="/logo.png" alt="Logo" width="100">
      </router-link>
      
      <nav class="hidden sm:flex space-x-4 text-sm">
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link to="/tasks" class="nav-link">Tasks</router-link>
        <router-link to="/milestones" class="nav-link">Milestones</router-link>
        <router-link to="/reports" class="nav-link">Reports</router-link>
      </nav>
    </div>

    <div class="flex items-center space-x-4">
      <span class="text-xs text-slate-500 hidden md:inline">
        User ID: <span class="font-mono text-slate-300">{{ userId }}</span>
      </span>
      <button 
        @click="handleSubmitIssue"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md shadow-blue-900/50"
      >
        Submit Issue
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
const userId = ref('Kawtar Bidarine');

const handleSubmitIssue = () => {
  console.log('Submit issue clicked');
};
</script>

<style scoped>
.header {
  grid-column: 1 / -1;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Base style for all links */
.nav-link {
  @apply text-slate-300 hover:text-white transition pb-3 -mb-3 border-b-2 border-transparent;
}

/* Vue Router automatically applies this class 
  to the link that matches the current URL 
*/
.router-link-active {
  @apply text-white font-medium border-blue-400;
}
</style>