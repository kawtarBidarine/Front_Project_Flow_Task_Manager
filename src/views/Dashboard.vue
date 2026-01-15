<template>
  <div class="p-4 md:p-8 max-w-[1400px] mx-auto">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Project Overview</h1>
        <p class="text-slate-400 mt-1">Welcome back, {{ userName }}! Here's your workspace at a glance.</p>
      </div>
      
      <div v-if="!loading && !error" class="flex items-center gap-3 bg-slate-800/40 px-4 py-2 rounded-full border border-slate-700/50">
        <div class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
        <span class="text-xs font-mono text-slate-400">
          Auto-sync in {{ refreshCountdown }}s <span class="mx-1 text-slate-600">|</span> Updated {{ lastUpdated }}
        </span>
      </div>
    </div>

    <div v-if="loading && !stats.my_active_tasks" class="flex flex-col items-center justify-center h-64 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p class="text-slate-400 animate-pulse">Fetching latest metrics...</p>
    </div>

    <div v-else-if="error" class="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 mb-8 text-center">
      <div class="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <p class="text-red-400 font-medium">{{ error }}</p>
      <button @click="loadDashboard" class="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold">
        Reconnect
      </button>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Active Tasks"
          :value="stats.my_active_tasks.toString()"
          :trend="calculateTrend(stats.my_active_tasks, previousStats?.my_active_tasks)"
          :trendUp="stats.my_active_tasks >= (previousStats?.my_active_tasks || 0)"
          iconBg="bg-blue-500/20"
          iconColor="text-blue-400"
          icon="clipboard"
        />
        <StatCard
          label="In Progress"
          :value="stats.in_progress_count.toString()"
          :trend="calculateTrend(stats.in_progress_count, previousStats?.in_progress_count)"
          :trendUp="stats.in_progress_count >= (previousStats?.in_progress_count || 0)"
          iconBg="bg-amber-500/20"
          iconColor="text-amber-400"
          icon="clock"
        />
        <StatCard
          label="Done Today"
          :value="stats.completed_today.toString()"
          :trend="calculateTrend(stats.completed_today, previousStats?.completed_today)"
          :trendUp="true"
          iconBg="bg-emerald-500/20"
          iconColor="text-emerald-400"
          icon="check"
        />
        <StatCard
          label="My Projects"
          :value="stats.my_projects.toString()"
          :trend="calculateTrend(stats.my_projects, previousStats?.my_projects)"
          :trendUp="stats.my_projects >= (previousStats?.my_projects || 0)"
          iconBg="bg-purple-500/20"
          iconColor="text-purple-400"
          icon="folder"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-white font-bold text-lg">Task Distribution</h3>
          </div>
          
          <div class="h-[300px] w-full">
            <Bar :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
            <h3 class="text-white font-bold text-lg mb-6">Quick Navigation</h3>
            <div class="space-y-4">
              <button @click="$router.push('/my-tasks')" class="w-full group bg-slate-800/50 hover:bg-blue-500/10 border border-slate-700 hover:border-blue-500/50 p-4 rounded-2xl transition-all duration-300 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>
                  </div>
                  <span class="text-slate-200 font-semibold group-hover:text-blue-400">My Tasks</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="text-slate-600 group-hover:text-blue-400 transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              
              <button @click="$router.push('/projects')" class="w-full group bg-slate-800/50 hover:bg-purple-500/10 border border-slate-700 hover:border-purple-500/50 p-4 rounded-2xl transition-all duration-300 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <span class="text-slate-200 font-semibold group-hover:text-purple-400">Browse Projects</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="text-slate-600 group-hover:text-purple-400 transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <div class="mt-8 pt-8 border-t border-slate-700/50 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                  <span class="text-slate-400 text-sm">Overdue</span>
                </div>
                <span class="text-white font-bold">{{ stats.overdue_tasks }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span class="text-slate-400 text-sm">Success Rate</span>
                </div>
                <span class="text-white font-bold">{{ completionRate }}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div class="h-full bg-emerald-500 transition-all duration-1000" :style="{ width: completionRate + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import { Bar } from 'vue-chartjs';
import { 
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale 
} from 'chart.js';

// Register ChartJS
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const router = useRouter();
const userStore = useUserStore();
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

// State
const stats = ref({
  my_active_tasks: 0,
  overdue_tasks: 0,
  my_projects: 0,
  completed_today: 0,
  backlog_count: 0,
  todo_count: 0,
  in_progress_count: 0
});
const previousStats = ref(null);
const loading = ref(true);
const error = ref(null);
const lastUpdated = ref('');
const refreshCountdown = ref(60);
let refreshInterval = null;
let countdownInterval = null;

// Computed
const userName = computed(() => userStore.userName || 'User');

const completionRate = computed(() => {
  const total = stats.value.my_active_tasks + stats.value.completed_today;
  return total === 0 ? 0 : Math.round((stats.value.completed_today / total) * 100);
});

// Chart Data Definition
const chartData = computed(() => ({
  labels: ['Backlog', 'To Do', 'In Progress', 'Done'],
  datasets: [{
    label: 'Tasks',
    backgroundColor: ['#64748b', '#3b82f6', '#f59e0b', '#10b981'],
    borderRadius: 12,
    data: [
      stats.value.backlog_count,
      stats.value.todo_count,
      stats.value.in_progress_count,
      stats.value.completed_today
    ]
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#f8fafc',
      padding: 12,
      cornerRadius: 12,
      displayColors: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(51, 65, 85, 0.3)', drawBorder: false },
      ticks: { color: '#64748b', font: { size: 11 }, stepSize: 1 }
    },
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8', font: { size: 11, weight: '600' } }
    }
  }
};

// Methods
function calculateTrend(current, previous) {
  if (!previous || previous === 0) return '0%';
  const diff = current - previous;
  return Math.abs(Math.round((diff / previous) * 100)) + '%';
}

async function loadDashboard() {
  if (!stats.value.my_active_tasks) loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to load dashboard');

    if (stats.value.my_active_tasks > 0) {
      previousStats.value = { ...stats.value };
    }

    const s = data.stats || data;
    stats.value = {
      my_active_tasks: Number(s.my_active_tasks || 0),
      overdue_tasks: Number(s.overdue_tasks || 0),
      my_projects: Number(s.my_projects || 0),
      completed_today: Number(s.completed_today || 0),
      backlog_count: Number(s.backlog_count || 0),
      todo_count: Number(s.todo_count || 0),
      in_progress_count: Number(s.in_progress_count || 0)
    };

    lastUpdated.value = new Date().toLocaleTimeString();
    refreshCountdown.value = 60;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function startAutoRefresh() {
  refreshInterval = setInterval(loadDashboard, 60000);
  countdownInterval = setInterval(() => {
    refreshCountdown.value--;
    if (refreshCountdown.value <= 0) refreshCountdown.value = 60;
  }, 1000);
}

onMounted(() => {
  loadDashboard();
  startAutoRefresh();
});

onUnmounted(() => {
  clearInterval(refreshInterval);
  clearInterval(countdownInterval);
});
</script>

<script>
// Separate component for StatCard
const StatCard = {
  name: 'StatCard',
  props: ['label', 'value', 'trend', 'trendUp', 'iconBg', 'iconColor', 'icon'],
  template: `
    <div class="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-300">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-slate-400 text-xs uppercase font-semibold tracking-wider">{{ label }}</p>
          <h3 class="text-2xl font-bold text-white mt-1">{{ value }}</h3>
        </div>
        <div :class="iconBg" class="p-2 rounded-lg">
          <component :is="iconComponent" class="w-5 h-5" :class="iconColor" />
        </div>
      </div>
      <div class="mt-4 flex items-center text-xs">
        <span :class="trendUp ? 'text-emerald-400' : 'text-rose-400'" class="font-medium mr-2">
          {{ trendUp ? '↑' : '↓' }} {{ trend }}
        </span>
        <span class="text-slate-500">vs last update</span>
      </div>
    </div>
  `,
  computed: {
    iconComponent() {
      const icons = {
        clipboard: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>' },
        clock: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
        check: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' },
        folder: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>' }
      };
      return icons[this.icon] || icons.clipboard;
    }
  }
};

export default {
  components: { StatCard }
};
</script>