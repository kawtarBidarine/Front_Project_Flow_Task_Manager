<template>
  <div class="p-4 md:p-8 max-w-[1600px] mx-auto">
    <div v-if="initialLoading" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-slate-400">Loading your workspace...</p>
      </div>
    </div>

    <template v-else>
      <section class="flex flex-col md:flex-row justify-between md:items-center mb-8 pb-8 border-b border-slate-700 gap-4">
        <div class="welcome-content">
          <h1 class="text-3xl font-bold mb-2 welcome-text">
            Welcome back, {{ userName }}
          </h1>
          <p class="text-slate-400 text-lg">
            Here's what's happening with your projects today
          </p>
        </div>
        <div class="flex gap-3 w-full md:w-auto">
          <button @click="$router.push('/my-tasks')" class="btn-primary flex-1 md:flex-none justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            View My Tasks
          </button>
          <button @click="$router.push('/projects')" class="btn-secondary flex-1 md:flex-none justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Browse Projects
          </button>
        </div>
      </section>

      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Tasks" :value="dashboardStats.my_active_tasks.toString()" change="+12%" icon="tasks" color="bg-blue-500" />
        <StatCard label="In Progress" :value="dashboardStats.in_progress_count.toString()" change="+5%" icon="progress" color="bg-amber-500" />
        <StatCard label="Completed" :value="dashboardStats.completed_today.toString()" change="+18%" icon="check" color="bg-emerald-500" />
        <StatCard label="Overdue" :value="dashboardStats.overdue_tasks.toString()" change="-2%" icon="alert" color="bg-red-500" />
      </section>

      <div class="grid grid-cols-12 gap-6">
        <div class="card col-span-12 lg:col-span-6 flex flex-col">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-white">Completion Health</h2>
            <div class="text-xs text-slate-400 font-mono">Today</div>
          </div>
          <div class="flex flex-1 items-center justify-around flex-col sm:flex-row gap-6">
            <div class="h-[200px] w-[200px] relative">
              <Doughnut :data="doughnutData" :options="doughnutOptions" />
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span class="text-2xl font-bold text-white">{{ completionPercentage }}%</span>
                <span class="text-[10px] text-slate-500 uppercase font-bold">Done</span>
              </div>
            </div>
            <div class="flex-1 space-y-3 w-full">
              <div v-for="cat in taskCategories" :key="cat.name" class="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                <div class="flex items-center gap-3">
                  <div :class="['w-2 h-2 rounded-full', cat.color]"></div>
                  <span class="text-slate-300 text-sm">{{ cat.name }}</span>
                </div>
                <span class="text-white font-bold">{{ cat.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card col-span-12 lg:col-span-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-white">Task Distribution</h2>
          </div>
          <div class="h-[250px] w-full">
            <Bar :data="barData" :options="barOptions" />
          </div>
        </div>

        <div class="card col-span-12 lg:col-span-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-white">Your Recent Projects</h2>
          </div>
          <div v-if="projectsLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <div v-else-if="projects.length === 0" class="text-center py-8 text-slate-400">
            <p>No projects yet</p>
            <button @click="$router.push('/projects')" class="mt-2 text-blue-400 hover:text-blue-300">Create your first project →</button>
          </div>
          <div v-else class="flex flex-col gap-4">
            <div v-for="project in recentProjects" :key="project.id" @click="$router.push(`/projects/${project.id}/board`)" class="flex gap-3 p-3 bg-slate-800/20 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer">
              <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-400']">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div class="flex-1">
                <p class="text-white text-sm font-medium">{{ project.name }}</p>
                <p class="text-slate-400 text-xs">{{ project.task_count || 0 }} tasks · {{ project.member_count || 0 }} members</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card col-span-12 lg:col-span-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-white">My Upcoming Tasks</h2>
          </div>
          <div v-if="tasksLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <div v-else-if="upcomingTasks.length === 0" class="text-center py-8 text-slate-400">
            <p>No upcoming tasks</p>
          </div>
          <div v-else class="flex flex-col gap-4">
            <div v-for="task in upcomingTasks" :key="task.id" class="flex gap-4 items-center p-4 bg-slate-800/20 rounded-xl border border-transparent hover:bg-slate-800/40 hover:border-slate-600 transition-all">
              <div class="flex flex-col items-center justify-center w-[60px] h-[60px] bg-slate-700 rounded-xl shrink-0">
                <span class="text-2xl font-bold text-white">{{ formatDay(task.due_date) }}</span>
                <span class="text-xs text-slate-400">{{ formatMonth(task.due_date) }}</span>
              </div>
              <div class="flex-1">
                <h4 class="text-white font-medium text-sm">{{ task.title }}</h4>
                <p class="text-slate-400 text-xs">{{ task.project_name || 'No Project' }}</p>
              </div>
              <div :class="['px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', getPriorityClass(task.priority)]">
                {{ task.priority || 'medium' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { useProjectStore } from '../stores/project';
import { getUserAvatar } from '../utils/avatar';
import { Bar, Doughnut } from 'vue-chartjs';
import { 
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement 
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const userStore = useUserStore();
const projectStore = useProjectStore();
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

// State
const initialLoading = ref(true);
const projectsLoading = ref(false);
const tasksLoading = ref(false);
const dashboardStats = ref({
  my_active_tasks: 0, overdue_tasks: 0, my_projects: 0, completed_today: 0,
  backlog_count: 0, todo_count: 0, in_progress_count: 0
});
const projects = ref([]);
const myTasks = ref([]);

// Computed
const userName = computed(() => userStore.userName || 'User');
const recentProjects = computed(() => projects.value.slice(0, 4));
const upcomingTasks = computed(() => myTasks.value
  .filter(task => task.due_date && task.status !== 'done')
  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
  .slice(0, 4)
);

const completionPercentage = computed(() => {
  const total = (dashboardStats.value.my_active_tasks || 0) + (dashboardStats.value.completed_today || 0);
  return total === 0 ? 0 : Math.round((dashboardStats.value.completed_today / total) * 100);
});

const taskCategories = computed(() => [
  { name: 'Backlog', count: dashboardStats.value.backlog_count || 0, color: 'bg-slate-500' },
  { name: 'To Do', count: dashboardStats.value.todo_count || 0, color: 'bg-blue-500' },
  { name: 'Progress', count: dashboardStats.value.in_progress_count || 0, color: 'bg-amber-500' },
  { name: 'Done', count: dashboardStats.value.completed_today || 0, color: 'bg-emerald-500' }
]);

// CHART CONFIGURATIONS
const doughnutData = computed(() => ({
  labels: ['Incomplete', 'Done'],
  datasets: [{
    data: [dashboardStats.value.my_active_tasks, dashboardStats.value.completed_today],
    backgroundColor: ['#1e293b', '#10b981'],
    borderWidth: 0,
    cutout: '80%'
  }]
}));

const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

const barData = computed(() => ({
  labels: ['Backlog', 'To Do', 'Progress', 'Done'],
  datasets: [{
    label: 'Tasks',
    backgroundColor: ['#64748b', '#3b82f6', '#f59e0b', '#10b981'],
    borderRadius: 8,
    data: [
      dashboardStats.value.backlog_count,
      dashboardStats.value.todo_count,
      dashboardStats.value.in_progress_count,
      dashboardStats.value.completed_today
    ]
  }]
}));

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { grid: { color: '#334155' }, ticks: { color: '#64748b', stepSize: 1 } },
    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
  }
};

// Data Fetching
const getHeaders = () => ({ 'Authorization': `Bearer ${userStore.token}` });

async function loadAllData() {
  initialLoading.value = true;
  try {
    const [statsRes, tasksRes] = await Promise.all([
      fetch(`${API_URL}/dashboard/stats`, { headers: getHeaders() }),
      fetch(`${API_URL}/my-tasks`, { headers: getHeaders() }),
      projectStore.fetchProjects()
    ]);
    
    if (statsRes.ok) dashboardStats.value = (await statsRes.json()).stats;
    if (tasksRes.ok) myTasks.value = (await tasksRes.json()).tasks || [];
    projects.value = projectStore.projects;
  } catch (err) {
    console.error(err);
  } finally {
    initialLoading.value = false;
  }
}

const getPriorityClass = (p) => ({ high: 'priority-high', medium: 'priority-medium', low: 'priority-low' }[p] || 'priority-medium');
const formatDay = (d) => d ? new Date(d).getDate() : '--';
const formatMonth = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '---';

onMounted(loadAllData);
</script>

<script>
const StatCard = {
  props: ['label', 'value', 'change', 'icon', 'color'],
  template: `
    <div class="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div class="flex justify-between items-center mb-4">
        <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', color]">
          <component :is="iconComp" class="text-white" />
        </div>
        <span :class="['text-sm font-semibold px-2 py-1 rounded-md', change.startsWith('+') ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10']">{{ change }}</span>
      </div>
      <h3 class="text-3xl font-bold text-white mb-1">{{ value }}</h3>
      <p class="text-slate-400 text-sm font-medium">{{ label }}</p>
    </div>
  `,
  computed: {
    iconComp() {
      const icons = {
        tasks: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>' },
        progress: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
        check: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' },
        alert: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>' }
      };
      return icons[this.icon] || icons.tasks;
    }
  }
};

export default { components: { StatCard } };
</script>

<style scoped>
.welcome-text { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.btn-primary { @apply flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
.btn-secondary { @apply flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold border border-slate-700 bg-slate-800 transition-all hover:bg-slate-700; }
.card { @apply bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 transition-all hover:border-slate-600 shadow-xl; }
.priority-high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.priority-medium { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.priority-low { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
</style>