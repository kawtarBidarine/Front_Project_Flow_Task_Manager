import { ref, watch } from 'vue';
import { loadFromStorage, saveToStorage } from '../utils/storage';

export function useKanbanBoard() {
  const loading = ref(false);
  const showAddTask = ref(null);
  const draggedTask = ref(null);
  const draggedFrom = ref(null);

  const defaultColumns = {
    backlog: {
      title: 'Backlog',
      color: 'bg-slate-500',
      tasks: [
        { 
          id: 'task-1', 
          title: 'Research new technologies', 
          description: 'Explore latest frameworks and tools', 
          priority: 'medium', 
          date: '2025-10-15' 
        },
        { 
          id: 'task-2', 
          title: 'Update documentation', 
          description: 'Review and update project docs', 
          priority: 'low', 
          date: '2025-10-20' 
        }
      ]
    },
    todo: {
      title: 'To Do',
      color: 'bg-blue-500',
      tasks: [
        { 
          id: 'task-3', 
          title: 'Design user interface', 
          description: 'Create wireframes and mockups', 
          priority: 'high', 
          date: '2025-10-25' 
        },
        { 
          id: 'task-4', 
          title: 'Set up development environment', 
          description: 'Install and configure tools', 
          priority: 'medium', 
          date: '2025-10-18' 
        }
      ]
    },
    inProgress: {
      title: 'In Progress',
      color: 'bg-amber-500',
      tasks: [
        { 
          id: 'task-5', 
          title: 'Implement authentication', 
          description: 'Add login and registration features', 
          priority: 'high', 
          date: '2025-10-22' 
        }
      ]
    },
    done: {
      title: 'Done',
      color: 'bg-emerald-500',
      tasks: [
        { 
          id: 'task-6', 
          title: 'Project planning', 
          description: 'Define scope and requirements', 
          priority: 'medium', 
          date: '2025-10-10' 
        }
      ]
    }
  };

  const columns = ref({});

  const loadBoardState = () => {
    loading.value = true;
    const saved = loadFromStorage('kanban-board-data');
    columns.value = saved || defaultColumns;
    loading.value = false;
  };

  const saveBoardState = () => {
    saveToStorage('kanban-board-data', columns.value);
  };

  const toggleAddTask = (columnId) => {
    showAddTask.value = showAddTask.value === columnId ? null : columnId;
  };

  const addTask = ({ columnId, task }) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: task.title.trim(),
      description: task.description.trim(),
      priority: task.priority,
      date: new Date().toISOString().split('T')[0]
    };

    columns.value[columnId].tasks.push(newTask);
    showAddTask.value = null;
    saveBoardState();
  };

  const deleteTask = ({ columnId, taskId }) => {
    columns.value[columnId].tasks = columns.value[columnId].tasks.filter(
      t => t.id !== taskId
    );
    saveBoardState();
  };

  const handleDragStart = ({ task, columnId }) => {
    draggedTask.value = task;
    draggedFrom.value = columnId;
  };

  const handleDragOver = (columnId) => {
    // Visual feedback can be handled in component
  };

  const handleDragLeave = (columnId) => {
    // Visual feedback can be handled in component
  };

  const handleDrop = (targetColumnId) => {
    if (!draggedTask.value || !draggedFrom.value || draggedFrom.value === targetColumnId) {
      draggedTask.value = null;
      draggedFrom.value = null;
      return;
    }

    columns.value[draggedFrom.value].tasks = columns.value[draggedFrom.value].tasks.filter(
      t => t.id !== draggedTask.value.id
    );
    columns.value[targetColumnId].tasks.push(draggedTask.value);

    saveBoardState();
    draggedTask.value = null;
    draggedFrom.value = null;
  };

  watch(
    columns,
    () => {
      if (Object.keys(columns.value).length > 0) {
        saveBoardState();
      }
    },
    { deep: true }
  );

  return {
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
    loadBoardState,
    saveBoardState
  };
}
