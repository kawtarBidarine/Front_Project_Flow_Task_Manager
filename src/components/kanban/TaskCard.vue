<template>
  <div
    :id="task.id"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="$emit('click', task)"
    class="task-card bg-slate-900/80 rounded-lg p-3 border border-slate-700/50 cursor-pointer transition-all duration-200 group hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
    :class="{'dragging': isDragging }"
  >
    <!-- Task Header -->
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-start gap-2 flex-1 min-w-0">
        <div class="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/>
            <circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>
          </svg>
        </div>
        <h3 class="font-medium text-white text-sm leading-snug break-words">{{ task.title }}</h3>
      </div>
      <button
        @click.stop="$emit('delete', task.id)"
        class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-0.5 rounded hover:bg-red-500/10 flex-shrink-0"
        :aria-label="'Delete task: ' + task.title"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </button>
    </div>

    <!-- Task Description -->
    <p v-if="task.description" class="text-slate-400 text-xs mb-3 ml-6 break-words line-clamp-2">
      {{ task.description }}
    </p>

    <!-- Task Footer -->
    <div class="flex items-center justify-between ml-6 mt-2 gap-2">
      <!-- Priority Badge -->
      <div :class="['flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border', priorityClass]">
        <component :is="priorityIconComponent" />
        <span class="capitalize">{{ task.priority || 'medium' }}</span>
      </div>
      
      <!-- Date -->
      <div v-if="task.due_date" :class="['flex items-center gap-1 text-xs px-2 py-1 rounded', dueDateClass]">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
          <line x1="16" x2="16" y1="2" y2="6"/>
          <line x1="8" x2="8" y1="2" y2="6"/>
          <line x1="3" x2="21" y1="10" y2="10"/>
        </svg>
        <span>{{ formatDate(task.due_date) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  columnId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['delete', 'drag-start', 'click']);

const isDragging = ref(false);

// Priority styling
const priorityClass = computed(() => {
  const priority = props.task.priority || 'medium';
  const classes = {
    urgent: 'bg-red-500/10 text-red-400 border-red-500/30',
    high: 'bg-red-500/10 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/10 text-green-400 border-green-500/30'
  };
  return classes[priority] || classes.medium;
});

// Due date styling
const dueDateClass = computed(() => {
  if (!props.task.due_date) return '';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(props.task.due_date);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'bg-red-500/10 text-red-400 border border-red-500/30';
  if (diffDays === 0) return 'bg-orange-500/10 text-orange-400 border border-orange-500/30';
  if (diffDays <= 3) return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
  return 'text-slate-500';
});

// Format date
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Priority icon component
const priorityIconComponent = computed(() => {
  const priority = props.task.priority || 'medium';
  const icons = {
    urgent: {
      template: `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>`
    },
    high: {
      template: `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>`
    },
    medium: {
      template: `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>`
    },
    low: {
      template: `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
        </svg>`
    }
  };
  return icons[priority] || icons.medium;
});

const onDragStart = (event) => {
  isDragging.value = true;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', props.task.id);
  emit('drag-start', props.task);
};

const onDragEnd = () => {
  isDragging.value = false;
};
</script>

<style scoped>
.task-card {
  background: #1e293b;
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid rgba(51, 65, 85, 0.5);
  cursor: move;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}

.task-card:hover {
  border-color: #3b82f6;
}

.task-card.dragging {
  opacity: 0.5;
  border: 4px dashed #3b82f6;
}
</style>