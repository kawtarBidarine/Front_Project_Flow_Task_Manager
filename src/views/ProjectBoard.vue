<template>
  <div class="project-board-page">
    <!-- Project Top Bar -->
    <div class="project-top-bar">
      <div class="top-left">
        <div class="project-icon">
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

      <div class="top-right">
        <!-- Project Members -->
        <div v-if="projectStore.currentProject?.members" class="member-stack">
          <div
            v-for="(member, index) in displayMembers"
            :key="member.id"
            class="avatar"
            :style="{ backgroundColor: getAvatarColor(member.name || member.email) }"
            :title="member.name || member.email"
          >
            {{ getInitials(member.name || member.email) }}
          </div>
          <div v-if="remainingMembersCount > 0" class="avatar-more">
            +{{ remainingMembersCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="page-header">
      <div class="header-left">
        <div class="add-task-group">
          <button @click="kanbanStore.toggleAddTask('backlog')" class="add-task-btn">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add task</span>
          </button>
        </div>
      </div>

      <div class="header-right">
        <!-- Filter Button -->
        <button 
          @click="showFilters = !showFilters" 
          class="action-item" 
          :class="{ 'active': showFilters }"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filter</span>
          <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
        </button>

        <div class="divider"></div>

        <!-- Search -->
        <div class="search-container action-item">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="filters.search"
            type="text" 
            placeholder="Search tasks..." 
            class="search-input"
          />
        </div>

        <!-- Refresh Button -->
        <button @click="refreshBoard" class="action-item" :disabled="kanbanStore.loading">
          <svg class="w-4 h-4" :class="{ 'spinning': kanbanStore.loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Filters Panel (Collapsible) -->
    <transition name="slide-down">
      <div v-if="showFilters" class="filters-panel">
        <div class="filter-group">
          <label>Priority</label>
          <select v-model="filters.priority" class="filter-select">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Type</label>
          <select v-model="filters.type" class="filter-select">
            <option value="">All Types</option>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="improvement">Improvement</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Assignee</label>
          <select v-model="filters.assignee" class="filter-select">
            <option value="">All Assignees</option>
            <option value="me">Assigned to Me</option>
          </select>
        </div>

        <div class="filter-actions">
          <button @click="clearFilters" class="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>
    </transition>

    <!-- Debug Info -->
    <div v-if="kanbanStore.error" class="error-banner">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ kanbanStore.error }}
    </div>

    <!-- Kanban Board -->
    <KanbanBoard :project-id="projectId" :filtered-columns="filteredColumns" />
  </div>
</template>
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

<style scoped>
.project-board-page {
  min-height: 100vh;
  padding: 0 1.5rem;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.75rem;
  color: #f87171;
  margin-bottom: 1rem;
}

/* Project Top Bar */
.project-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(71, 85, 105, 0.2);
  margin-bottom: 0.75rem;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.project-icon {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.project-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-left: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Top Right */
.top-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.member-stack {
  display: flex;
  align-items: center;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #1e293b;
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.avatar:first-child {
  margin-left: 0;
}

.avatar:hover {
  transform: translateY(-2px);
  z-index: 10;
}

.avatar-more {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(71, 85, 105, 0.5);
  border: 2px solid #1e293b;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
  color: #cbd5e1;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  margin-bottom: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
}

.add-task-group {
  display: flex;
  align-items: center;
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 0.5rem;
  background: rgba(30, 41, 59, 0.3);
}

.add-task-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.5rem;
}

.add-task-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

/* Header Right */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  position: relative;
}

.action-item:hover:not(:disabled) {
  color: #e2e8f0;
  background: rgba(71, 85, 105, 0.2);
}

.action-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-item.active {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
}

.filter-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 1rem;
  text-align: center;
}

.divider {
  width: 1px;
  height: 20px;
  background: rgba(71, 85, 105, 0.4);
  margin: 0 0.25rem;
}

/* Search */
.search-container {
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.3);
  margin-left: 0.5rem;
}

.search-input {
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 0.875rem;
  outline: none;
  width: 120px;
  transition: width 0.3s ease;
}

.search-input:focus {
  width: 200px;
}

.search-input::placeholder {
  color: #64748b;
}

/* Filters Panel */
.filters-panel {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 160px;
}

.filter-group label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
}

.filter-select {
  padding: 0.5rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #94a3b8;
}

.clear-filters-btn:hover {
  background: rgba(71, 85, 105, 0.2);
  color: #cbd5e1;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Transitions */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 1024px) {
  .project-top-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-right {
    width: 100%;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .project-board-page {
    padding: 0 1rem;
  }

  .action-item span:not(.filter-badge) {
    display: none;
  }
}
</style>