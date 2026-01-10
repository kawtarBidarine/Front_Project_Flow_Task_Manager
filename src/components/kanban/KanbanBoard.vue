<template>
  <div>
    <div v-if="loading" class="text-center p-8 text-xl text-slate-400">
      Loading board data...
    </div>
    <div v-else class="kanban-board-grid">
      <KanbanColumn
        v-for="(column, columnId) in columns"
        :key="columnId"
        :column-id="columnId"
        :column="column"
        :show-add-task="showAddTask === columnId"
        @toggle-add-task="toggleAddTask"
        @add-task="addTask"
        @delete-task="deleteTask"
        @drag-start="handleDragStart"
        @drag-over="handleDragOver"
        @drag-leave="handleDragLeave"
        @drop="handleDrop"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import KanbanColumn from './KanbanColumn.vue';
import { useKanbanBoard } from '../../composables/useKanbanBoard';

const {
  columns,
  loading,
  showAddTask,
  toggleAddTask,
  addTask,
  deleteTask,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  loadBoardState
} = useKanbanBoard();

onMounted(() => {
  loadBoardState();
});
</script>

<style scoped>
.kanban-board-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(300px, 1fr));
  gap: 1rem;
  padding: 0.5rem;
  min-height: 100%;
}

@media (max-width: 1024px) {
  .kanban-board-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}
</style>