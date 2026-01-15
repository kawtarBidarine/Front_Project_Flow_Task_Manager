<template>
  <div class="reports-container p-4 md:p-8 max-w-7xl mx-auto">
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Analytics & Reports</h1>
        <p class="text-slate-400 text-sm mt-1">Real-time performance metrics across your workspace.</p>
      </div>
      <div class="flex gap-3">
        <button @click="exportData('csv')" class="export-btn bg-slate-800 border border-slate-700 hover:bg-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export CSV
        </button>
        <button @click="window.print()" class="export-btn bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print PDF
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p class="text-slate-400 animate-pulse">Generating your reports...</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <div class="report-card">
          <div class="flex justify-between items-center mb-6">
            <h3 class="card-title">Task Distribution</h3>
            <span class="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Live</span>
          </div>
          <div class="h-64 relative">
            <Doughnut :data="doughnutData" :options="doughnutOptions" />
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-3xl font-bold text-white">{{ efficiency }}%</span>
              <span class="text-[10px] text-slate-500 uppercase tracking-widest">Efficiency</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-6">
            <div v-for="(val, key) in distributionStats" :key="key" class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <p class="text-slate-500 text-[10px] uppercase font-bold">{{ key.replace('_', ' ') }}</p>
              <p class="text-white text-xl font-bold">{{ val }}</p>
            </div>
          </div>
        </div>

        <div class="report-card lg:col-span-2">
          <div class="flex justify-between items-center mb-6">
            <h3 class="card-title">Weekly Productivity</h3>
            <div class="flex gap-2">
              <div class="flex items-center text-[10px] text-slate-400"><span class="w-2 h-2 bg-blue-500 rounded-full mr-1"></span> Completed Tasks</div>
            </div>
          </div>
          <div class="h-80">
            <Bar :data="barData" :options="barOptions" />
          </div>
        </div>
      </div>

      <div class="report-card">
        <div class="flex justify-between items-center mb-6">
          <h3 class="card-title">Team Workload Distribution</h3>
          <p class="text-xs text-slate-500">Based on active project assignments</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-700/50">
                <th class="pb-4 pl-2">Team Member</th>
                <th class="pb-4">Open Tasks</th>
                <th class="pb-4">Productivity Score</th>
                <th class="pb-4">Load Status</th>
              </tr>
            </thead>
            <tbody class="text-sm divide-y divide-slate-800/50">
              <tr v-for="member in teamData" :key="member.id" class="group hover:bg-slate-700/10 transition-colors">
                <td class="py-4 pl-2">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
                      {{ member.name.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-medium text-slate-200">{{ member.name }}</p>
                      <p class="text-[10px] text-slate-500">{{ member.role || 'Contributor' }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4">
                  <span class="text-slate-300 font-semibold">{{ member.tasks }}</span>
                  <span class="text-slate-500 text-xs ml-1">tasks</span>
                </td>
                <td class="py-4 w-64">
                  <div class="flex items-center gap-3">
                    <div class="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-blue-500 transition-all duration-1000" 
                        :style="{ width: member.percentage + '%' }"
                      ></div>
                    </div>
                    <span class="text-[11px] font-mono text-slate-400">{{ member.percentage }}%</span>
                  </div>
                </td>
                <td class="py-4">
                  <span 
                    :class="member.tasks > 10 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'" 
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border"
                  >
                    {{ member.tasks > 10 ? 'Overloaded' : 'Optimal' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { Doughnut, Bar } from 'vue-chartjs';
import { 
  Chart as ChartJS, Title, Tooltip, Legend, ArcElement, 
  BarElement, CategoryScale, LinearScale 
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

const userStore = useUserStore();
const loading = ref(true);
const distributionStats = ref({ backlog: 0, todo: 0, in_progress: 0, done: 0 });
const productivityStats = ref([]);
const teamData = ref([]);

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

// --- Computed Efficiency ---
const efficiency = computed(() => {
  const total = Object.values(distributionStats.value).reduce((a, b) => a + b, 0);
  return total ? Math.round((distributionStats.value.done / total) * 100) : 0;
});

// --- Chart Data Configurations ---
const doughnutData = computed(() => ({
  labels: ['Backlog', 'To Do', 'In Progress', 'Done'],
  datasets: [{
    data: [
      distributionStats.value.backlog,
      distributionStats.value.todo,
      distributionStats.value.in_progress,
      distributionStats.value.done
    ],
    backgroundColor: ['#64748b', '#3b82f6', '#f59e0b', '#10b981'],
    borderWidth: 0,
    hoverOffset: 10,
    cutout: '80%'
  }]
}));

const barData = computed(() => ({
  labels: productivityStats.value.map(d => d.label),
  datasets: [{
    label: 'Completed Tasks',
    data: productivityStats.value.map(d => d.value),
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    borderColor: '#3b82f6',
    borderWidth: 2,
    borderRadius: 6,
    hoverBackgroundColor: '#3b82f6'
  }]
}));

// --- Chart Options ---
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } }
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { 
      beginAtZero: true,
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#64748b', font: { size: 10 } }
    },
    x: { 
      grid: { display: false },
      ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } }
    }
  },
  plugins: { legend: { display: false } }
};

// --- Data Fetching ---
async function fetchAnalytics() {
  loading.value = true;
  try {
    const response = await fetch(`${API_URL}/analytics/reports`, {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    });
    
    if (!response.ok) throw new Error('Analytics failed');
    
    const data = await response.json();
    
    // Process distribution
    const dist = { backlog: 0, todo: 0, in_progress: 0, done: 0 };
    data.distribution.forEach(item => {
      if (dist.hasOwnProperty(item.status)) dist[item.status] = item.count;
    });
    distributionStats.value = dist;

    productivityStats.value = data.productivity;
    teamData.value = data.workload;
  } catch (err) {
    console.error('Error fetching analytics:', err);
  } finally {
    loading.value = false;
  }
}

const exportData = (format) => {
  console.log(`Exporting in ${format}...`);
  // Implementation for CSV export
};

onMounted(fetchAnalytics);
</script>

<style scoped>
.report-card {
  @apply bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm;
}

.card-title {
  @apply text-white font-bold text-base tracking-tight;
}

.export-btn {
  @apply inline-flex items-center text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95;
}

@media print {
  .export-btn, .mb-8 p { display: none; }
  .report-card { border: 1px solid #e2e8f0; background: white; color: black; }
  body { background: white; }
}
</style>