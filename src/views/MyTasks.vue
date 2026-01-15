<template>
  <div class="my-tasks-container">
    <!-- Header with Filters -->
    <div class="header-section">
      <div class="title-area">
        <h1 class="page-title">My Tasks</h1>
        <p class="subtitle">All tasks assigned to you across all projects</p>
      </div>
      
     <div class="flex items-center gap-4 px-4 py-3 text-slate-400 font-medium">
  
  <div class="flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
    <span class="text-[15px]">Filter</span>
  </div>

  <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

  <div class="relative min-w-[200px]">
    <select 
      v-model="selectedProject" 
      @change="applyFilter"
      class="w-full bg-[#161d30]/50 border border-slate-800 rounded-xl py-2 pl-4 pr-10 text-slate-300 text-sm focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer transition-all"
    >
      <option :value="null">All Projects</option>
      <option v-for="project in availableProjects" :key="project.id" :value="project.id">
        {{ project.name }}
      </option>
    </select>
    
    <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

  <button 
    @click="refreshTasks" 
    class="ml-auto flex items-center gap-2 hover:text-slate-200 transition-colors"
    :disabled="loading"
  >
    <svg 
      class="w-4 h-4" 
      :class="{ 'animate-spin': loading }" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    <span class="text-[15px]">Refresh</span>
  </button>
</div>
    </div>

    <!-- Kanban Board -->
    <KanbanBoard mode="my-tasks" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useKanbanStore } from '../stores/kanban';
import KanbanBoard from '../components/kanban/KanbanBoard.vue';

const kanbanStore = useKanbanStore();

// Local state
const selectedProject = ref(null);

// Computed
const availableProjects = computed(() => kanbanStore.availableProjects);
const stats = computed(() => kanbanStore.stats);
const loading = computed(() => kanbanStore.loading);

// Apply filter
async function applyFilter() {
  await kanbanStore.fetchMyTasks(selectedProject.value);
}

// Refresh tasks
async function refreshTasks() {
  await kanbanStore.fetchMyTasks(selectedProject.value);
}

// Initialize
onMounted(async () => {
  // Fetch available projects for filter
  await kanbanStore.fetchAvailableProjects();
  
  // Fetch all my tasks initially
  await kanbanStore.fetchMyTasks(null);
});

// Watch for route changes to refresh
watch(() => selectedProject.value, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    applyFilter();
  }
});
</script>

<style scoped>
.my-tasks-container {
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.header-section {
  margin-bottom: 2rem;
}

.title-area {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #94a3b8;
  font-size: 1rem;
}

.filter-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #cbd5e1;
  font-weight: 500;
}

.filter-select {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 0.5rem;
  padding: 0.625rem 1rem;
  color: white;
  font-size: 0.95rem;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.filter-select:hover {
  border-color: #3b82f6;
  background: rgba(30, 41, 59, 0.8);
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.filter-select option {
  background: #1e293b;
  color: white;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: #60a5fa;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-end;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn.spinning svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .my-tasks-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    width: 100%;
  }

  .refresh-btn {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>