import { ref, computed } from 'vue';
import { useUserStore } from '../stores/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

export function useKanbanBoard(projectId) {
  const userStore = useUserStore();
  
  const loading = ref(false);
  const error = ref(null);
  const showAddTask = ref(null);
  const draggedTask = ref(null);
  const draggedFrom = ref(null);
  
  // Column structure - matches backend status values
  const columnDefinitions = {
    backlog: { title: 'Backlog', color: 'bg-slate-500', status: 'backlog' },
    todo: { title: 'To Do', color: 'bg-blue-500', status: 'todo' },
    inProgress: { title: 'In Progress', color: 'bg-amber-500', status: 'in_progress' },
    done: { title: 'Done', color: 'bg-emerald-500', status: 'done' }
  };

  const tasks = ref([]);
  
  // Computed: Organize tasks by column
  const columns = computed(() => {
    const cols = {};
    
    Object.keys(columnDefinitions).forEach(colId => {
      cols[colId] = {
        ...columnDefinitions[colId],
        tasks: tasks.value
          .filter(task => {
            // Map backend status to column
            const taskStatus = task.status || 'backlog';
            return columnDefinitions[colId].status === taskStatus;
          })
          .sort((a, b) => (a.position || 0) - (b.position || 0))
      };
    });
    
    return cols;
  });

  // Helper: Get auth headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userStore.token}`
  });

  // Fetch all tasks for the project
  async function loadBoardState() {
    if (!projectId) {
      error.value = 'Project ID is required';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch tasks');
      }

      const data = await response.json();
      tasks.value = data.tasks || [];
      
      return { success: true };
    } catch (err) {
      error.value = err.message;
      console.error('Failed to load board:', err);
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Toggle add task form
  const toggleAddTask = (columnId) => {
    showAddTask.value = showAddTask.value === columnId ? null : columnId;
  };

  // Add new task
  async function addTask({ columnId, task }) {
    if (!projectId) {
      error.value = 'Project ID is required';
      return { success: false, error: 'Project ID is required' };
    }

    loading.value = true;
    error.value = null;

    try {
      const status = columnDefinitions[columnId]?.status || 'backlog';
      
      // Get highest position in this column
      const columnTasks = columns.value[columnId]?.tasks || [];
      const maxPosition = columnTasks.length > 0 
        ? Math.max(...columnTasks.map(t => t.position || 0))
        : 0;

      const newTask = {
        title: task.title.trim(),
        description: task.description?.trim() || '',
        priority: task.priority || 'medium',
        status: status,
        position: maxPosition + 1,
        type: 'task',
        due_date: task.due_date || null,
        assignee_id: task.assignee_id || null
      };

      const response = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newTask)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create task');
      }

      const data = await response.json();
      
      // Reload board to get the new task with all fields
      await loadBoardState();
      
      showAddTask.value = null;
      
      return { success: true, id: data.id };
    } catch (err) {
      error.value = err.message;
      console.error('Failed to add task:', err);
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Delete task
  async function deleteTask({ columnId, taskId }) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete task');
      }

      // Remove from local state
      tasks.value = tasks.value.filter(t => t.id !== taskId);
      
      return { success: true };
    } catch (err) {
      error.value = err.message;
      console.error('Failed to delete task:', err);
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Update single task
  async function updateTask(taskId, updates) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update task');
      }

      // Update local state
      const taskIndex = tasks.value.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = { ...tasks.value[taskIndex], ...updates };
      }
      
      return { success: true };
    } catch (err) {
      error.value = err.message;
      console.error('Failed to update task:', err);
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Drag and drop handlers
  const handleDragStart = ({ task, columnId }) => {
    draggedTask.value = task;
    draggedFrom.value = columnId;
  };

  const handleDragOver = (columnId) => {
    // Can add visual feedback in component
  };

  const handleDragLeave = (columnId) => {
    // Can add visual feedback in component
  };

  // Handle drop - uses bulk update API
  async function handleDrop(targetColumnId) {
    if (!draggedTask.value || !draggedFrom.value || draggedFrom.value === targetColumnId) {
      draggedTask.value = null;
      draggedFrom.value = null;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const targetStatus = columnDefinitions[targetColumnId].status;
      const targetTasks = columns.value[targetColumnId].tasks;
      const newPosition = targetTasks.length;

      // Prepare bulk update
      const updates = [{
        id: draggedTask.value.id,
        status: targetStatus,
        position: newPosition
      }];

      // Reorder tasks in source column (optional but cleaner)
      const sourceTasks = columns.value[draggedFrom.value].tasks
        .filter(t => t.id !== draggedTask.value.id);
      
      sourceTasks.forEach((task, index) => {
        if (task.position !== index) {
          updates.push({
            id: task.id,
            status: task.status,
            position: index
          });
        }
      });

      const response = await fetch(`${API_URL}/tasks/bulk-update`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ updates })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to move task');
      }

      // Update local state
      const task = tasks.value.find(t => t.id === draggedTask.value.id);
      if (task) {
        task.status = targetStatus;
        task.position = newPosition;
      }

      // Optionally reload to ensure consistency
      await loadBoardState();

      draggedTask.value = null;
      draggedFrom.value = null;
      
      return { success: true };
    } catch (err) {
      error.value = err.message;
      console.error('Failed to drop task:', err);
      
      // Reload on error to restore correct state
      await loadBoardState();
      
      draggedTask.value = null;
      draggedFrom.value = null;
      
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Get task counts per column
  const taskCounts = computed(() => {
    const counts = {};
    Object.keys(columnDefinitions).forEach(colId => {
      counts[colId] = columns.value[colId]?.tasks.length || 0;
    });
    return counts;
  });

  return {
    // State
    columns,
    tasks,
    loading,
    error,
    showAddTask,
    taskCounts,
    
    // Actions
    loadBoardState,
    toggleAddTask,
    addTask,
    deleteTask,
    updateTask,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}