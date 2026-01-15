<template>
  <div class="kanban-board-container">
    <!-- Loading State -->
    <div v-if="kanbanStore.loading && kanbanStore.tasks.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p class="text-slate-400 mt-4">Loading board data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="kanbanStore.error && kanbanStore.tasks.length === 0" class="error-state">
      <div class="error-icon"></div>
      <p class="text-red-400 mb-4">{{ kanbanStore.error }}</p>
      <button 
        @click="retryLoad" 
        class="retry-button"
      >
        Retry
      </button>
    </div>

    <!-- Empty State - FIXED: Only show for project mode without a project -->
    <div v-else-if="mode !== 'my-tasks' && !kanbanStore.currentProjectId" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3 class="text-xl font-semibold text-slate-300 mb-2">No Project Selected</h3>
      <p class="text-slate-400">Please select a project to view its board</p>
    </div>

    <!-- Board Header with Stats - FIXED: Show for both modes when we have columns -->
    <div v-else-if="Object.keys(kanbanStore.columns).length > 0" class="board-content">
      <div class="board-header">
        <div class="board-stats">
          <div class="stat-card">
            <span class="stat-label">Total Tasks</span>
            <span class="stat-value">{{ kanbanStore.stats.total }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Completion</span>
            <span class="stat-value">{{ kanbanStore.stats.completionRate }}%</span>
          </div>
          <div class="stat-card backlog">
            <span class="stat-label">Backlog</span>
            <span class="stat-value">{{ kanbanStore.stats.backlog }}</span>
          </div>
          <div class="stat-card todo">
            <span class="stat-label">To Do</span>
            <span class="stat-value">{{ kanbanStore.stats.todo }}</span>
          </div>
          <div class="stat-card in-progress">
            <span class="stat-label">In Progress</span>
            <span class="stat-value">{{ kanbanStore.stats.inProgress }}</span>
          </div>
          <div class="stat-card done">
            <span class="stat-label">Done</span>
            <span class="stat-value">{{ kanbanStore.stats.done }}</span>
          </div>
        </div>
      </div>

      <!-- Kanban Columns -->
      <div class="kanban-board-grid">
        <KanbanColumn
          v-for="(column, columnId) in kanbanStore.columns"
          :key="columnId"
          :column-id="columnId"
          :column="column"
          :show-add-task="kanbanStore.showAddTask === columnId"
          :is-dragging="!!kanbanStore.draggedTask"
          @toggle-add-task="kanbanStore.toggleAddTask"
          @add-task="handleAddTask"
          @delete-task="handleDeleteTask"
          @task-click="handleTaskClick"
          @drag-start="handleDragStart"
          @drag-over="handleDragOver"
          @drag-leave="handleDragLeave"
          @drop="handleDrop"
        />
      </div>
    </div>

    <!-- Empty Board State -->
    <div v-else class="empty-board-state">
      <div class="empty-icon">📝</div>
      <h3 class="text-xl font-semibold text-slate-300 mb-2">No Tasks Yet</h3>
      <p class="text-slate-400 mb-4">
        {{ mode === 'my-tasks' ? 'You have no tasks assigned to you' : 'Start by adding your first task to any column' }}
      </p>
    </div>

    <!-- Task Details Drawer -->
    <TaskDetailsDrawer
      :is-open="showTaskDetails"
      :task="selectedTask"
      :project-members="projectMembers"
      :milestones="milestones"
      @close="showTaskDetails = false"
      @update="handleUpdateTask"
      @delete="handleDeleteTaskFromModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import KanbanColumn from './KanbanColumn.vue';
import TaskDetailsDrawer from './TaskDetailsDrawer.vue';
import { useKanbanStore } from '../../stores/kanban';
import { useProjectStore } from '../../stores/project';

const route = useRoute();
const kanbanStore = useKanbanStore();
const projectStore = useProjectStore();

// Task details modal state
const showTaskDetails = ref(false);
const selectedTask = ref({});

// ADDED: Accept mode prop
const props = defineProps({
  projectId: {
    type: String,
    default: null
  },
  mode: {
    type: String,
    default: 'project', // 'project' or 'my-tasks'
    validator: (value) => ['project', 'my-tasks'].includes(value)
  }
});

// Get project members and milestones
const projectMembers = computed(() => {
  return projectStore.currentProject?.members || [];
});

const milestones = computed(() => {
  // TODO: Fetch milestones from API
  return [];
});

// Load board data - FIXED: Handle both modes
const loadBoard = async () => {
  if (props.mode === 'my-tasks') {
    // In my-tasks mode, we don't need a project ID
    // The parent component handles calling fetchMyTasks
    return;
  }
  
  // Project mode - needs a project ID
  const projectId = props.projectId || route.params.projectId || route.query.projectId;
  
  if (!projectId) {
    console.warn('No project ID provided');
    return;
  }

  await kanbanStore.fetchTasks(projectId);
};

// Retry loading on error
const retryLoad = () => {
  kanbanStore.error = null;
  loadBoard();
};

// Handle add task with feedback
const handleAddTask = async ({ columnId, task }) => {
  const result = await kanbanStore.createTask(columnId, task);
  
  if (result.success) {
    console.log('Task created successfully');
  } else {
    console.error('Failed to create task:', result.error);
  }
};

// Handle delete task with confirmation
const handleDeleteTask = async ({ columnId, taskId }) => {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  const result = await kanbanStore.deleteTask(taskId);
  
  if (result.success) {
    console.log('Task deleted successfully');
  } else {
    console.error('Failed to delete task:', result.error);
  }
};

// Handle task click to open drawer
const handleTaskClick = (task) => {
  selectedTask.value = { ...task };
  showTaskDetails.value = true;
};

// Handle update task from drawer
const handleUpdateTask = async ({ taskId, updates }) => {
  await kanbanStore.updateTask(taskId, updates);
};

// Handle delete from modal
const handleDeleteTaskFromModal = async (task) => {
  if (confirm('Are you sure?')) {
    await kanbanStore.deleteTask(task.id);
    showTaskDetails.value = false;
  }
};

// Drag and drop handlers
const handleDragStart = ({ task, columnId }) => {
  kanbanStore.startDrag(task, columnId);
};

const handleDragOver = (columnId) => {
};

const handleDragLeave = (columnId) => {
};

const handleDrop = async ({ columnId }) => {
  const result = await kanbanStore.dropTask(columnId);
  
  if (!result.success && result.error) {
    console.error('Failed to move task:', result.error);
  } else {
    console.log('Task moved successfully');
  }
};

// Watch for project changes (only in project mode)
watch(
  () => props.projectId || route.params.projectId,
  (newProjectId) => {
    if (newProjectId && props.mode === 'project') {
      loadBoard();
    }
  }
);

// Lifecycle hooks
onMounted(() => {
  if (props.mode === 'project') {
    loadBoard();
  }
  // In my-tasks mode, the parent component handles the initial load
});

onUnmounted(() => {
  kanbanStore.cancelDrag();
});

// Auto-refresh every 30 seconds (optional) - FIXED: Handle both modes
let refreshInterval;
onMounted(() => {
  refreshInterval = setInterval(() => {
    if (!kanbanStore.loading) {
      if (props.mode === 'my-tasks') {
        kanbanStore.fetchMyTasks(kanbanStore.selectedProjectFilter);
      } else if (kanbanStore.currentProjectId) {
        kanbanStore.fetchTasks(kanbanStore.currentProjectId);
      }
    }
  }, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.kanban-board-container {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 120px);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.retry-button {
  padding: 0.5rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #2563eb;
}

.empty-state,
.empty-board-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.board-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.board-header {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.board-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 0.75rem;
  border: 1px solid rgba(71, 85, 105, 0.2);
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(71, 85, 105, 0.4);
}

.stat-card.backlog {
  border-left: 3px solid #64748b;
}

.stat-card.todo {
  border-left: 3px solid #3b82f6;
}

.stat-card.in-progress {
  border-left: 3px solid #f59e0b;
}

.stat-card.done {
  border-left: 3px solid #10b981;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
}

.kanban-board-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(300px, 1fr));
  gap: 1rem;
  padding: 0.5rem;
  min-height: 500px;
}

@media (max-width: 1536px) {
  .kanban-board-grid {
    grid-template-columns: repeat(4, minmax(280px, 1fr));
  }
}

@media (max-width: 1280px) {
  .kanban-board-grid {
    grid-template-columns: repeat(2, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .kanban-board-grid {
    grid-template-columns: 1fr;
  }
  
  .board-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

:deep(.kanban-column.drag-over) {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

:deep(.task-card.dragging) {
  opacity: 0.5;
  cursor: grabbing;
}
</style>