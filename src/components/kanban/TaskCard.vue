<template>
  <div
    :id="task.id"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    class="task-card group"
    :class="{ 'dragging': isDragging }"
  >
    <!-- Task Header -->
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-start gap-2 flex-1">
        <div class="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/>
            <circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>
          </svg>
        </div>
        <h3 class="font-medium text-white text-sm leading-snug">{{ task.title }}</h3>
      </div>
      <button
        @click="$emit('delete', task.id)"
        class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-0.5 rounded-full"
        :aria-label="'Delete task: ' + task.title"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </button>
    </div>

    <!-- Task Description -->
    <p v-if="task.description" class="text-slate-400 text-xs mb-3 ml-6">
      {{ task.description }}
    </p>

    <!-- Task Footer -->
    <div class="flex items-center justify-between ml-6 mt-2">
      <!-- Priority Badge -->
      <div :class="['flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border', priorityClass]">
        <component :is="priorityIconComponent" />
        <span class="capitalize">{{ task.priority }}</span>
      </div>
      
      <!-- Date -->
      <div class="flex items-center gap-1 text-slate-500 text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
          <line x1="16" x2="16" y1="2" y2="6"/>
          <line x1="8" x2="8" y1="2" y2="6"/>
          <line x1="3" x2="21" y1="10" y2="10"/>
        </svg>
        <span>{{ task.date }}</span>
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

const emit = defineEmits(['delete', 'drag-start']);

const isDragging = ref(false);

const priorityClass = computed(() => {
  const classes = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-green-100 text-green-700 border-green-300'
  };
  return classes[props.task.priority] || 'bg-gray-100 text-gray-700 border-gray-300';
});

const priorityIconComponent = computed(() => {
  const icons = {
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
  return icons[props.task.priority] || icons.medium;
});

const onDragStart = () => {
  isDragging.value = true;
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