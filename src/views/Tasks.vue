
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useKanbanStore } from '../stores/kanban';
import { useProjectStore } from '../stores/project';
import KanbanBoard from '../components/kanban/KanbanBoard.vue';

const route = useRoute();
const kanbanStore = useKanbanStore();
const projectStore = useProjectStore();

// Filter state
const filters = ref({
  priority: '',
  type: '',
  assignee: '',
  search: ''
});

const showFilters = ref(false);

// Computed: Filtered columns based on active filters
const filteredColumns = computed(() => {
  const columns = kanbanStore.columns;
  
  // If no filters active, return all columns
  if (!filters.value.priority && !filters.value.type && !filters.value.assignee && !filters.value.search) {
    return columns;
  }

  // Create filtered columns
  const filtered = {};
  
  Object.keys(columns).forEach(columnId => {
    const column = columns[columnId];
    
    filtered[columnId] = {
      ...column,
      tasks: column.tasks.filter(task => {
        // Priority filter
        if (filters.value.priority && task.priority !== filters.value.priority) {
          return false;
        }
        
        // Type filter
        if (filters.value.type && task.type !== filters.value.type) {
          return false;
        }
        
        // Assignee filter
        if (filters.value.assignee) {
          if (filters.value.assignee === 'me' && task.assignee_id !== kanbanStore.userStore?.user?.id) {
            return false;
          } else if (filters.value.assignee !== 'me' && task.assignee_id !== filters.value.assignee) {
            return false;
          }
        }
        
        // Search filter (searches in title and description)
        if (filters.value.search) {
          const searchLower = filters.value.search.toLowerCase();
          const titleMatch = task.title?.toLowerCase().includes(searchLower);
          const descMatch = task.description?.toLowerCase().includes(searchLower);
          
          if (!titleMatch && !descMatch) {
            return false;
          }
        }
        
        return true;
      })
    };
  });
  
  return filtered;
});

// Clear all filters
function clearFilters() {
  filters.value = {
    priority: '',
    type: '',
    assignee: '',
    search: ''
  };
}

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.priority) count++;
  if (filters.value.type) count++;
  if (filters.value.assignee) count++;
  if (filters.value.search) count++;
  return count;
});

// Load board
async function loadBoard() {
  const projectId = route.params.projectId;
  if (projectId) {
    await projectStore.fetchProject(projectId);
    await kanbanStore.fetchTasks(projectId);
  }
}

onMounted(() => {
  loadBoard();
});

watch(() => route.params.projectId, (newId) => {
  if (newId) {
    loadBoard();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- Header with Filters -->
    <div class="mb-6 space-y-4">
      <!-- Top Bar -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 3v18"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white">{{ projectStore.currentProject?.name || 'Sample Project' }}</h1>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span class="text-sm text-slate-400">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Add Task Button -->
          <button 
            @click="kanbanStore.toggleAddTask('backlog')"
            class="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Add task
          </button>

          <!-- Filter Button -->
          <button 
            @click="showFilters = !showFilters"
            class="relative flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filter
            <span v-if="activeFilterCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {{ activeFilterCount }}
            </span>
          </button>

          <!-- Search Input -->
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search tasks..."
              class="w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Refresh Button -->
          <button 
            @click="loadBoard"
            class="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Filter Panel (Expandable) -->
      <div v-if="showFilters" class="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wider">Filters</h3>
          <button 
            @click="clearFilters"
            class="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Priority Filter -->
          <div>
            <label class="block text-xs text-slate-400 uppercase tracking-wider mb-2">Priority</label>
            <select
              v-model="filters.priority"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <!-- Type Filter -->
          <div>
            <label class="block text-xs text-slate-400 uppercase tracking-wider mb-2">Type</label>
            <select
              v-model="filters.type"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="improvement">Improvement</option>
              <option value="story">Story</option>
            </select>
          </div>

          <!-- Assignee Filter -->
          <div>
            <label class="block text-xs text-slate-400 uppercase tracking-wider mb-2">Assignee</label>
            <select
              v-model="filters.assignee"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="">All Assignees</option>
              <option value="me">Assigned to Me</option>
              <!-- Add more team members dynamically if needed -->
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Pass filtered columns to KanbanBoard -->
    <KanbanBoard :filtered-columns="filteredColumns" />
  </div>
</template>