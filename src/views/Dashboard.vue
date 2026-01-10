<template>
  <div class="dashboard-container">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">Project Overview</h1>
      <p class="text-slate-400 text-sm">Welcome back, Kawtar! Here is what's happening today.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-slate-400 text-xs uppercase font-semibold tracking-wider">{{ stat.label }}</p>
            <h3 class="text-2xl font-bold text-white mt-1">{{ stat.value }}</h3>
          </div>
          <div :class="stat.iconBg" class="p-2 rounded-lg">
            <component :is="stat.icon" class="w-5 h-5" :class="stat.iconColor" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-xs">
          <span :class="stat.trendUp ? 'text-emerald-400' : 'text-rose-400'" class="font-medium mr-2">
            {{ stat.trendUp ? '↑' : '↓' }} {{ stat.trend }}
          </span>
          <span class="text-slate-500">vs last month</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 class="text-white font-semibold mb-4">Task Completion Trend</h3>
        <div class="h-64 flex items-end justify-between px-2 pt-4">
          <div v-for="bar in [40, 70, 45, 90, 65, 80, 95]" :key="bar" 
               class="w-8 bg-blue-500/20 hover:bg-blue-500 transition-all rounded-t-md" 
               :style="{ height: bar + '%' }">
          </div>
        </div>
        <div class="flex justify-between mt-4 text-xs text-slate-500 px-1">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>

      <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 class="text-white font-semibold mb-4">Recent Activity</h3>
        <div class="space-y-4">
          <div v-for="activity in activities" :key="activity.id" class="flex gap-3">
            <div class="w-2 h-2 rounded-full mt-2" :class="activity.color"></div>
            <div>
              <p class="text-sm text-slate-300">{{ activity.text }}</p>
              <span class="text-xs text-slate-500">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const stats = ref([
  { label: 'Total Tasks', value: '124', trend: '12%', trendUp: true, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-400' },
  { label: 'In Progress', value: '38', trend: '5%', trendUp: true, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
  { label: 'Completed', value: '82', trend: '2%', trendUp: false, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
  { label: 'Avg. Velocity', value: '4.2', trend: '18%', trendUp: true, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-400' }
]);

const activities = ref([
  { id: 1, text: 'Kawtar moved "Auth Logic" to Done', time: '2 mins ago', color: 'bg-emerald-500' },
  { id: 2, text: 'New issue reported in "Framework Redesign"', time: '1 hour ago', color: 'bg-rose-500' },
  { id: 3, text: 'ERP Phase VI updated by Admin', time: '3 hours ago', color: 'bg-blue-500' },
  { id: 4, text: 'Milestone "Phase 1" reached', time: 'Yesterday', color: 'bg-purple-500' }
]);
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  @apply bg-slate-800/50 border border-slate-700 p-5 rounded-xl hover:border-slate-500 transition-colors;
}
</style>