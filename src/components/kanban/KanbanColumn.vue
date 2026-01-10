<template>
  <div
    :id="'column-' + columnId"
    class="column"
    :class="{ 'drag-over': isDragOver }"
    @dragover.prevent="onDragOver"
    @drop="onDrop"
    @dragleave="onDragLeave"
  >
    <!-- Column Header -->
    <div class="column-header">
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
    <div class="task-list">
      <TaskCard
        v-for="task in column.tasks"
        :key="task.id"
        :task="task"
        :column-id="columnId"
        @delete="(taskId) => $emit('delete-task', { columnId, taskId })"
        @drag-start="(task) => $emit('drag-start', { task, columnId })"
      />
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
  'drop'
]);

const isDragOver = ref(false);

const onDragOver = () => {
  isDragOver.value = true;
  emit('drag-over', props.columnId);
};

const onDragLeave = () => {
  isDragOver.value = false;
  emit('drag-leave', props.columnId);
};

const onDrop = () => {
  isDragOver.value = false;
  emit('drop', props.columnId);
};
</script>

<style scoped>
.column {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(51, 65, 85, 0.5);
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transition: all 0.3s;
}

.column.drag-over {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.task-list {
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  padding: 0.25rem;
  margin: -0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-grow: 1;
}
</style>