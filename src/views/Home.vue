<template>
  <div class="home-page">
    <!-- Welcome Section -->
    <section class="welcome-section">
      <div class="welcome-content">
        <h1 class="text-3xl font-bold text-white mb-2">
          Welcome back, {{ userName }}
        </h1>
        <p class="text-slate-400 text-lg">
          Here's what's happening with your projects today
        </p>
      </div>
      <div class="quick-actions">
        <button @click="isModalOpen = true" class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          New Task
        </button>
        <button class="btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
          </svg>
          Import Project
        </button>
      </div>
    </section>

    <!-- Stats Grid -->
    <section class="stats-grid">
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :change="stat.change"
        :icon="stat.icon"
        :color="stat.color"
      />
    </section>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Tasks Overview -->
      <div class="card tasks-overview">
        <div class="card-header">
          <h2 class="card-title">Task Overview</h2>
          <button @click="goToTasks" class="text-blue-400 hover:text-blue-300 text-sm font-medium">
            View All →
          </button>
        </div>
        <div class="task-progress">
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: completionPercentage + '%' }"></div>
          </div>
          <div class="progress-stats">
            <span class="text-white font-semibold">{{ completedTasks }} of {{ totalTasks }} tasks completed</span>
            <span class="text-slate-400">{{ completionPercentage }}%</span>
          </div>
        </div>
        <div class="task-categories">
          <div 
            v-for="category in taskCategories" 
            :key="category.name"
            class="category-item"
          >
            <div class="flex items-center gap-2">
              <div :class="['w-3 h-3 rounded-full', category.color]"></div>
              <span class="text-slate-300">{{ category.name }}</span>
            </div>
            <span class="text-white font-semibold">{{ category.count }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card recent-activity">
        <div class="card-header">
          <h2 class="card-title">Recent Activity</h2>
        </div>
        <div class="activity-list">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="activity-item"
          >
            <div :class="['activity-icon', activity.iconBg]">
              <component :is="activity.icon" />
            </div>
            <div class="activity-content">
              <p class="text-white text-sm">{{ activity.title }}</p>
              <p class="text-slate-400 text-xs">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Deadlines -->
      <div class="card upcoming-deadlines">
        <div class="card-header">
          <h2 class="card-title">Upcoming Deadlines</h2>
        </div>
        <div class="deadlines-list">
          <div 
            v-for="deadline in upcomingDeadlines" 
            :key="deadline.id"
            class="deadline-item"
          >
            <div class="deadline-date">
              <span class="text-2xl font-bold text-white">{{ deadline.day }}</span>
              <span class="text-xs text-slate-400">{{ deadline.month }}</span>
            </div>
            <div class="deadline-content">
              <h4 class="text-white font-medium text-sm">{{ deadline.task }}</h4>
              <p class="text-slate-400 text-xs">{{ deadline.project }}</p>
            </div>
            <div :class="['priority-badge', deadline.priorityClass]">
              {{ deadline.priority }}
            </div>
          </div>
        </div>
      </div>

      <!-- Team Members -->
      <div class="card team-members">
        <div class="card-header">
          <h2 class="card-title">Team Members</h2>
          <button class="text-blue-400 hover:text-blue-300 text-sm font-medium">
            View All →
          </button>
        </div>
        <div class="members-grid">
          <div 
            v-for="member in teamMembers" 
            :key="member.id"
            class="member-card"
          >
            <div class="member-avatar">
              <img :src="member.avatar" :alt="member.name" />
              <div :class="['status-dot', member.online ? 'online' : 'offline']"></div>
            </div>
            <h4 class="text-white text-sm font-medium mt-2">{{ member.name }}</h4>
            <p class="text-slate-400 text-xs">{{ member.role }}</p>
            <div class="member-tasks">
              <span class="text-slate-300 text-xs">{{ member.activeTasks }} active tasks</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Projects -->
      <div class="card recent-projects">
        <div class="card-header">
          <h2 class="card-title">Recent Projects</h2>
          <button class="text-blue-400 hover:text-blue-300 text-sm font-medium">
            See All →
          </button>
        </div>
        <div class="projects-list">
          <div 
            v-for="project in recentProjects" 
            :key="project.id"
            class="project-item"
          >
            <div class="project-info">
              <div :class="['project-icon', project.iconBg]">
                {{ project.icon }}
              </div>
              <div>
                <h4 class="text-white font-medium text-sm">{{ project.name }}</h4>
                <p class="text-slate-400 text-xs">{{ project.description }}</p>
              </div>
            </div>
            <div class="project-progress-mini">
              <div class="progress-mini-bar">
                <div class="progress-mini-fill" :style="{ width: project.progress + '%' }"></div>
              </div>
              <span class="text-xs text-slate-400">{{ project.progress }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Chart -->
      <div class="card productivity-chart">
        <div class="card-header">
          <h2 class="card-title">Productivity This Week</h2>
          <select class="chart-select">
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </div>
        <div class="chart-container">
          <div class="chart-bars">
            <div 
              v-for="day in weeklyData" 
              :key="day.label"
              class="chart-bar-wrapper"
            >
              <div class="chart-bar-bg">
                <div 
                  class="chart-bar-fill"
                  :style="{ height: day.percentage + '%' }"
                ></div>
              </div>
              <span class="chart-label">{{ day.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TaskModal 
      :isOpen="isModalOpen" 
      @close="isModalOpen = false" 
      @save="addNewTask" 
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import TaskModal from '../components/kanban/TaskModal.vue';

const router = useRouter();
const userName = ref('Kawtar Bidarine');

const isModalOpen = ref(false);

const addNewTask = (taskData) => {
  console.log('Task saved:', taskData);
  isModalOpen.value = false;
};

const stats = ref([
  {
    label: 'Total Tasks',
    value: '48',
    change: '+12%',
    icon: 'tasks',
    color: 'bg-blue-500'
  },
  {
    label: 'In Progress',
    value: '12',
    change: '+5%',
    icon: 'progress',
    color: 'bg-amber-500'
  },
  {
    label: 'Completed',
    value: '32',
    change: '+18%',
    icon: 'check',
    color: 'bg-emerald-500'
  },
  {
    label: 'Overdue',
    value: '4',
    change: '-2%',
    icon: 'alert',
    color: 'bg-red-500'
  }
]);

const totalTasks = ref(48);
const completedTasks = ref(32);
const completionPercentage = computed(() => 
  Math.round((completedTasks.value / totalTasks.value) * 100)
);

const taskCategories = ref([
  { name: 'Backlog', count: 8, color: 'bg-slate-500' },
  { name: 'To Do', count: 16, color: 'bg-blue-500' },
  { name: 'In Progress', count: 12, color: 'bg-amber-500' },
  { name: 'Done', count: 32, color: 'bg-emerald-500' }
]);

const recentActivities = ref([
  {
    id: 1,
    title: 'Task "Design UI mockups" completed',
    time: '2 minutes ago',
    icon: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
    iconBg: 'bg-emerald-500/20 text-emerald-400'
  },
  {
    id: 2,
    title: 'New comment on "API Integration"',
    time: '15 minutes ago',
    icon: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
    iconBg: 'bg-blue-500/20 text-blue-400'
  },
  {
    id: 3,
    title: 'Sarah added you to "ERP Integration"',
    time: '1 hour ago',
    icon: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    iconBg: 'bg-purple-500/20 text-purple-400'
  },
  {
    id: 4,
    title: 'Deadline approaching for "Q4 Report"',
    time: '3 hours ago',
    icon: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
    iconBg: 'bg-amber-500/20 text-amber-400'
  }
]);

// Upcoming deadlines
const upcomingDeadlines = ref([
  {
    id: 1,
    day: '15',
    month: 'JAN',
    task: 'Complete API Documentation',
    project: 'Backend Development',
    priority: 'High',
    priorityClass: 'priority-high'
  },
  {
    id: 2,
    day: '18',
    month: 'JAN',
    task: 'Review Pull Requests',
    project: 'Code Review Sprint',
    priority: 'Medium',
    priorityClass: 'priority-medium'
  },
  {
    id: 3,
    day: '22',
    month: 'JAN',
    task: 'Client Presentation',
    project: 'Zoho Projects',
    priority: 'High',
    priorityClass: 'priority-high'
  }
]);

// Team members
const teamMembers = ref([
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Product Designer',
    avatar: 'https://i.pravatar.cc/150?img=1',
    online: true,
    activeTasks: 5
  },
  {
    id: 2,
    name: 'Mike Johnson',
    role: 'Frontend Dev',
    avatar: 'https://i.pravatar.cc/150?img=12',
    online: true,
    activeTasks: 8
  },
  {
    id: 3,
    name: 'Emily Davis',
    role: 'Backend Dev',
    avatar: 'https://i.pravatar.cc/150?img=5',
    online: false,
    activeTasks: 3
  },
  {
    id: 4,
    name: 'Alex Kumar',
    role: 'QA Engineer',
    avatar: 'https://i.pravatar.cc/150?img=13',
    online: true,
    activeTasks: 6
  }
]);

// Recent projects
const recentProjects = ref([
  {
    id: 1,
    name: 'Zoho Projects Deployment',
    description: 'Cloud migration and setup',
    icon: '🚀',
    iconBg: 'bg-blue-500/20',
    progress: 75
  },
  {
    id: 2,
    name: 'ERP Phase VI Integration',
    description: 'Enterprise resource planning',
    icon: '⚙️',
    iconBg: 'bg-purple-500/20',
    progress: 45
  },
  {
    id: 3,
    name: 'Framework Redesign',
    description: 'UI/UX modernization',
    icon: '🎨',
    iconBg: 'bg-pink-500/20',
    progress: 60
  }
]);

// Weekly productivity data
const weeklyData = ref([
  { label: 'Mon', tasks: 8, percentage: 80 },
  { label: 'Tue', tasks: 12, percentage: 100 },
  { label: 'Wed', tasks: 6, percentage: 60 },
  { label: 'Thu', tasks: 10, percentage: 85 },
  { label: 'Fri', tasks: 9, percentage: 75 },
  { label: 'Sat', tasks: 3, percentage: 30 },
  { label: 'Sun', tasks: 2, percentage: 20 }
]);

const goToTasks = () => {
  router.push('/Tasks');
};
</script>

<script>
// StatCard Component
const StatCard = {
  name: 'StatCard',
  template: `
    <div class="stat-card">
      <div class="stat-header">
        <div :class="['stat-icon', color]">
          <component :is="iconComponent" />
        </div>
        <span :class="['stat-change', change.startsWith('+') ? 'positive' : 'negative']">
          {{ change }}
        </span>
      </div>
      <h3 class="stat-value">{{ value }}</h3>
      <p class="stat-label">{{ label }}</p>
    </div>
  `,
  props: {
    label: String,
    value: String,
    change: String,
    icon: String,
    color: String
  },
  computed: {
    iconComponent() {
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

export default {
  components: { StatCard }
};
</script>

<style scoped>
.home-page {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #334155;
}

.welcome-content h1 {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quick-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(59, 130, 246, 0.5);
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #1e293b;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: 1px solid #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #334155;
  border-color: #475569;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
  border-color: #475569;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.stat-change.positive {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.stat-change.negative {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.875rem;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

.card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s;
}

.card:hover {
  border-color: #475569;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}

/* Tasks Overview */
.tasks-overview {
  grid-column: span 6;
}

.task-progress {
  margin-bottom: 1.5rem;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #334155;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 9999px;
  transition: width 0.5s ease;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-categories {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(51, 65, 85, 0.3);
  border-radius: 0.5rem;
}

/* Recent Activity */
.recent-activity {
  grid-column: span 6;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(51, 65, 85, 0.2);
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.activity-item:hover {
  background: rgba(51, 65, 85, 0.4);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

/* Upcoming Deadlines */
.upcoming-deadlines {
  grid-column: span 6;
}

.deadlines-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.deadline-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: rgba(51, 65, 85, 0.2);
  border-radius: 0.75rem;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.deadline-item:hover {
  background: rgba(51, 65, 85, 0.4);
  border-color: #475569;
}

.deadline-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #334155;
  border-radius: 0.75rem;
}

.deadline-content {
  flex: 1;
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.priority-high {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.priority-medium {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

/* Team Members */
.team-members {
  grid-column: span 6;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.member-card {
  padding: 1rem;
  background: rgba(51, 65, 85, 0.2);
  border-radius: 0.75rem;
  text-align: center;
  transition: all 0.2s;
}

.member-card:hover {
  background: rgba(51, 65, 85, 0.4);
  transform: translateY(-2px);
}

.member-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #334155;
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #0f172a;
}

.status-dot.online {
  background: #10b981;
}

.status-dot.offline {
  background: #6b7280;
}

.member-tasks {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #334155;
}

/* Recent Projects */
.recent-projects {
  grid-column: span 6;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-item {
  padding: 1rem;
  background: rgba(51, 65, 85, 0.2);
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.project-item:hover {
  background: rgba(51, 65, 85, 0.4);
}

.project-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.project-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;

justify-content: center;
font-size: 1.25rem;
}
.project-progress-mini {
display: flex;
align-items: center;
gap: 0.5rem;
}
.progress-mini-bar {
flex: 1;
height: 6px;
background: #334155;
border-radius: 9999px;
overflow: hidden;
}
.progress-mini-fill {
height: 100%;
background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
border-radius: 9999px;
transition: width 0.5s ease;
}
/* Productivity Chart */
.productivity-chart {
grid-column: span 6;
}
.chart-select {
background: #334155;
color: white;
border: 1px solid #475569;
border-radius: 0.375rem;
padding: 0.375rem 0.75rem;
font-size: 0.875rem;
cursor: pointer;
outline: none;
}
.chart-container {
height: 200px;
}
.chart-bars {
display: flex;
align-items: flex-end;
justify-content: space-around;
height: 180px;
gap: 0.5rem;
}
.chart-bar-wrapper {
flex: 1;
display: flex;
flex-direction: column;
align-items: center;
gap: 0.5rem;
}
.chart-bar-bg {
width: 100%;
height: 150px;
background: #334155;
border-radius: 0.5rem;
overflow: hidden;
display: flex;
align-items: flex-end;
}
.chart-bar-fill {
width: 100%;
background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
border-radius: 0.5rem 0.5rem 0 0;
transition: height 0.5s ease;
}
.chart-label {
font-size: 0.75rem;
color: #94a3b8;
font-weight: 500;
}
/* Responsive */
@media (max-width: 1200px) {
.tasks-overview,
.recent-activity,
.upcoming-deadlines,
.team-members,
.recent-projects,
.productivity-chart {
grid-column: span 12;
}
}
@media (max-width: 768px) {
.home-page {
padding: 1rem;
}
.welcome-section {
flex-direction: column;
align-items: flex-start;
gap: 1rem;
}
.members-grid {
grid-template-columns: 1fr;
}
.quick-actions {
width: 100%;
}
.btn-primary,
.btn-secondary {
flex: 1;
}

.project-progress-mini {
display: flex;
align-items: center;
gap: 0.5rem;
}
.progress-mini-bar {
flex: 1;
height: 6px;
background: #334155;
border-radius: 9999px;
overflow: hidden;
}
.progress-mini-fill {
height: 100%;
background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
border-radius: 9999px;
transition: width 0.5s ease;
}
/* Productivity Chart */
.productivity-chart {
grid-column: span 6;
}
.chart-select {
background: #334155;
color: white;
border: 1px solid #475569;
border-radius: 0.375rem;
padding: 0.375rem 0.75rem;
font-size: 0.875rem;
cursor: pointer;
outline: none;
}
.chart-container {
height: 200px;
}
.chart-bars {
display: flex;
align-items: flex-end;
justify-content: space-around;
height: 180px;
gap: 0.5rem;
}
.chart-bar-wrapper {
flex: 1;
display: flex;
flex-direction: column;
align-items: center;
gap: 0.5rem;
}
.chart-bar-bg {
width: 100%;
height: 150px;
background: #334155;
border-radius: 0.5rem;
overflow: hidden;
display: flex;
align-items: flex-end;
}
.chart-bar-fill {
width: 100%;
background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
border-radius: 0.5rem 0.5rem 0 0;
transition: height 0.5s ease;
}
.chart-label {
font-size: 0.75rem;
color: #94a3b8;
font-weight: 500;
}
}
/* Responsive */
@media (max-width: 1200px) {
.tasks-overview,
.recent-activity,
.upcoming-deadlines,
.team-members,
.recent-projects,
.productivity-chart {
grid-column: span 12;
}
}
@media (max-width: 768px) {
.home-page {
padding: 1rem;
}
.welcome-section {
flex-direction: column;
align-items: flex-start;
gap: 1rem;
}
.members-grid {
grid-template-columns: 1fr;
}
.quick-actions {
width: 100%;
}
.btn-primary,
.btn-secondary {
flex: 1;
}
}
</style>