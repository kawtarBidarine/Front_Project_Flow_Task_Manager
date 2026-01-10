<template>
  <div class="issues-container">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Issue Tracking</h1>
        <p class="text-slate-400 text-sm">Manage bugs and technical debt reported by the team.</p>
      </div>
      <button class="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
        Report Bug
      </button>
    </div>

    <div class="bg-slate-800/50 border border-slate-700 p-4 rounded-xl mb-6 flex gap-4">
      <input type="text" placeholder="Search issues..." class="search-input" />
      <select class="filter-select">
        <option>All Status</option>
        <option>Open</option>
        <option>In Review</option>
        <option>Resolved</option>
      </select>
    </div>

    <div class="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-700/30 text-slate-400 text-xs uppercase">
          <tr>
            <th class="px-6 py-4">Issue</th>
            <th class="px-6 py-4">Priority</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4">Reporter</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700">
          <tr v-for="issue in issues" :key="issue.id" class="hover:bg-slate-700/20 transition cursor-pointer">
            <td class="px-6 py-4">
              <div class="text-white font-medium">#{{ issue.id }} {{ issue.title }}</div>
              <div class="text-xs text-slate-500">Updated {{ issue.updatedAt }}</div>
            </td>
            <td class="px-6 py-4">
              <span :class="priorityClass(issue.priority)" class="px-2 py-1 rounded text-[10px] font-bold uppercase">
                {{ issue.priority }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="flex items-center text-slate-300 text-sm">
                <span class="w-2 h-2 rounded-full mr-2" :class="statusColor(issue.status)"></span>
                {{ issue.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-slate-400 text-sm">{{ issue.reporter }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const issues = ref([
  { id: 1024, title: 'Login API timeout on mobile', priority: 'high', status: 'Open', reporter: 'Alex River', updatedAt: '2h ago' },
  { id: 1025, title: 'Sidebar toggle flickering', priority: 'medium', status: 'In Review', reporter: 'Sarah Chen', updatedAt: '5h ago' },
  { id: 1026, title: 'Missing CSS variables in dark mode', priority: 'low', status: 'Resolved', reporter: 'Kawtar B.', updatedAt: 'Yesterday' }
]);

const priorityClass = (p) => {
  if (p === 'high') return 'bg-rose-500/10 text-rose-400';
  if (p === 'medium') return 'bg-amber-500/10 text-amber-400';
  return 'bg-blue-500/10 text-blue-400';
};

const statusColor = (s) => {
  if (s === 'Open') return 'bg-rose-500';
  if (s === 'In Review') return 'bg-amber-500';
  return 'bg-emerald-500';
};
</script>

<style scoped>
.search-input { @apply bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white flex-1 focus:outline-none focus:border-blue-500; }
.filter-select { @apply bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none; }
</style>