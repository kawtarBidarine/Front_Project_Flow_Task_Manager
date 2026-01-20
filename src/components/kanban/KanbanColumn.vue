<template>
  <div
    :id="'column-' + columnId"
    class="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50 flex flex-col shadow-2xl transition-all duration-300"
    :class="{ 'border-blue-500 shadow-blue-500/30': isDragOver }"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
    @dragleave="onDragLeave"
  >
    <!-- Column Header -->
    <div class="flex items-center justify-between mb-4 flex-shrink-0">
      <div class="flex items-center gap-2">
        <div :class="['w-3 h-3 rounded-full', column.color]"></div>
        <h2 class="font-semibold text-white text-lg">{{ column.title }}</h2>
        <span class="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full font-mono">
          {{ column.tasks.length }}
        </span>
      </div>
      <button
        @click="$emit('toggle-add-task', columnId)"
        class="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700/50"
        :aria-label="'Add task to ' + column.title"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
      </button>
    </div>

    <!-- Add Task Form -->
    <AddTaskForm
      v-if="showAddTask"
      :column-id="columnId"
      @add-task="(task) => $emit('add-task', { columnId, task })"
      @cancel="$emit('toggle-add-task', null)"
    />

    <!-- Task List -->
    <div class="flex flex-col gap-3 overflow-y-auto pr-1 -mr-1 flex-grow scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
      <TaskCard
        v-for="task in column.tasks"
        :key="task.id"
        :task="task"
        :column-id="columnId"
        @click="handleTaskClick(task)"
        @delete="(taskId) => $emit('delete-task', { columnId, taskId })"
        @drag-start="handleDragStart"
      />
      
      <!-- Empty State -->
      <div v-if="column.tasks.length === 0 && !showAddTask" class="flex flex-col items-center justify-center py-8 text-slate-600">
        <p class="text-sm">No tasks</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TaskCard from './TaskCard.vue';
import AddTaskForm from './AddTaskForm.vue';

const props = defineProps({
  columnId: {
    type: String,
    required: true
  },
  column: {
    type: Object,
    required: true
  },
  showAddTask: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'toggle-add-task',
  'add-task',
  'delete-task',
  'drag-start',
  'drag-over',
  'drag-leave',
  'drop',
  'task-click'
]);

const isDragOver = ref(false);

const handleTaskClick = (task) => {
  emit('task-click', task);
};

const handleDragStart = (task) => {
  emit('drag-start', { task, columnId: props.columnId });
};

const onDragOver = (event) => {
  event.preventDefault();
  isDragOver.value = true;
  emit('drag-over', props.columnId);
};

const onDragLeave = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;
  
  if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
    isDragOver.value = false;
    emit('drag-leave', props.columnId);
  }
};

const onDrop = (event) => {
  event.preventDefault();
  isDragOver.value = false;
  emit('drop', { columnId: props.columnId });
};
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>