<template>
  <div class="reports-container">
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Analytics & Reports</h1>
        <p class="text-slate-400 text-sm">Real-time performance metrics for your active projects.</p>
      </div>
      <div class="flex gap-2">
        <button class="export-btn">Download PDF</button>
        <button class="export-btn bg-slate-700">Export CSV</button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      <div class="report-card">
        <h3 class="card-title">Task Distribution</h3>
        <div class="flex items-center justify-center py-6">
          <div class="relative w-32 h-32">
            <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" class="stroke-slate-700" stroke-width="3"></circle>
              <circle cx="18" cy="18" r="16" fill="none" class="stroke-emerald-500" stroke-width="3" stroke-dasharray="70, 100"></circle>
              <circle cx="18" cy="18" r="16" fill="none" class="stroke-blue-500" stroke-width="3" stroke-dasharray="30, 100" stroke-dashoffset="-70"></circle>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-xl font-bold text-white">82%</span>
              <span class="text-[10px] text-slate-500 uppercase">Efficiency</span>
            </div>
          </div>
        </div>
        <div class="space-y-2 mt-2">
          <div class="flex justify-between text-xs text-slate-300">
            <span class="flex items-center"><i class="w-2 h-2 bg-emerald-500 rounded-full mr-2"></i>Completed</span>
            <span>64</span>
          </div>
          <div class="flex justify-between text-xs text-slate-300">
            <span class="flex items-center"><i class="w-2 h-2 bg-blue-500 rounded-full mr-2"></i>In Progress</span>
            <span>22</span>
          </div>
        </div>
      </div>

      <div class="report-card lg:col-span-2">
        <h3 class="card-title">Weekly Productivity (Tasks Resolved)</h3>
        <div class="flex items-end justify-between h-48 mt-4 gap-2">
          <div v-for="day in productivityData" :key="day.label" class="flex-1 flex flex-col items-center">
            <div 
              class="w-full bg-blue-500/20 hover:bg-blue-500 transition-all rounded-t-sm relative group"
              :style="{ height: (day.value * 10) + '%' }"
            >
              <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                {{ day.value }} tasks
              </span>
            </div>
            <span class="text-[10px] text-slate-500 mt-2 uppercase tracking-tighter">{{ day.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="report-card">
      <h3 class="card-title mb-4">Workload Distribution</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-slate-500 text-xs uppercase border-b border-slate-700">
              <th class="pb-3 pl-2">Assignee</th>
              <th class="pb-3">Tasks</th>
              <th class="pb-3">Completion</th>
              <th class="pb-3">Status</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="user in teamData" :key="user.name" class="border-b border-slate-800/50 hover:bg-slate-700/20 transition">
              <td class="py-4 pl-2 font-medium text-slate-200">{{ user.name }}</td>
              <td class="py-4 text-slate-400">{{ user.tasks }} tasks</td>
              <td class="py-4 w-48">
                <div class="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-blue-400 h-full" :style="{ width: user.percentage + '%' }"></div>
                </div>
              </td>
              <td class="py-4">
                <span :class="user.tasks > 8 ? 'text-amber-400 bg-amber-400/10' : 'text-emerald-400 bg-emerald-400/10'" class="px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                  {{ user.tasks > 8 ? 'High Load' : 'Normal' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const productivityData = ref([
  { label: 'Mon', value: 4 },
  { label: 'Tue', value: 7 },
  { label: 'Wed', value: 5 },
  { label: 'Thu', value: 9 },
  { label: 'Fri', value: 6 },
  { label: 'Sat', value: 2 },
  { label: 'Sun', value: 1 },
]);

const teamData = ref([
  { name: 'Kawtar Bidarine', tasks: 12, percentage: 85 },
  { name: 'Alex River', tasks: 5, percentage: 40 },
  { name: 'Sarah Chen', tasks: 9, percentage: 70 },
  { name: 'Mike Ross', tasks: 3, percentage: 100 },
]);
</script>

<style scoped>
.report-card {
  @apply bg-slate-800/50 border border-slate-700 p-6 rounded-xl;
}

.card-title {
  @apply text-white font-semibold text-sm;
}

.export-btn {
  @apply bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition;
}
</style>