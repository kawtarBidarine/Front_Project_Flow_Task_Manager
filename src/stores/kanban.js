import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from './user';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

export const useKanbanStore = defineStore('kanban', () => {
  const userStore = useUserStore();

  // State
  const tasks = ref([]);
  const currentProjectId = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const showAddTask = ref(null);
  const draggedTask = ref(null);
  const draggedFrom = ref(null);
  
  const mode = ref('project'); 
  const selectedProjectFilter = ref(null); 
  const availableProjects = ref([]); 

  // Column definitions
  const columnDefinitions = {
    backlog: { title: 'Backlog', color: 'bg-slate-500', status: 'backlog' },
    todo: { title: 'To Do', color: 'bg-blue-500', status: 'todo' },
    inProgress: { title: 'In Progress', color: 'bg-amber-500', status: 'in_progress' },
    done: { title: 'Done', color: 'bg-emerald-500', status: 'done' }
  };

  // Computed: Organize tasks into columns
  const columns = computed(() => {
    const cols = {};
    
    Object.keys(columnDefinitions).forEach(colId => {
      cols[colId] = {
        ...columnDefinitions[colId],
        tasks: tasks.value
          .filter(task => {
            const taskStatus = task.status || 'backlog';
            return columnDefinitions[colId].status === taskStatus;
          })
          .sort((a, b) => (a.position || 0) - (b.position || 0))
      };
    });
    
    return cols;
  });

  // Computed: Task counts per column
  const taskCounts = computed(() => {
    const counts = {};
    Object.keys(columnDefinitions).forEach(colId => {
      counts[colId] = columns.value[colId]?.tasks.length || 0;
    });
    return counts;
  });

  // Computed: Statistics
  const stats = computed(() => ({
    total: tasks.value.length,
    backlog: taskCounts.value.backlog || 0,
    todo: taskCounts.value.todo || 0,
    inProgress: taskCounts.value.inProgress || 0,
    done: taskCounts.value.done || 0,
    completionRate: tasks.value.length > 0 
      ? Math.round((taskCounts.value.done / tasks.value.length) * 100) 
      : 0
  }));

  // Helper: Get auth headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userStore.token}`
  });

  async function fetchMyTasks(projectFilter = null) {
    mode.value = 'my-tasks';
    selectedProjectFilter.value = projectFilter;
    loading.value = true;
    error.value = null;

    try {
      let url = `${API_URL}/my-tasks`;
      
      // Add project filter if specified
      if (projectFilter) {
        url += `?project_id=${projectFilter}`;
      }

      const response = await fetch(url, {
        headers: getHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch my tasks');
      }

      const data = await response.json();
      tasks.value = data.tasks || [];
      
      return { success: true };
    } catch (err) {
      error.value = err.message;
      console.error('Failed to fetch my tasks:', err);
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  async function fetchAvailableProjects() {
    try {
      const response = await fetch(`${API_URL}/my-projects`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      availableProjects.value = data.projects || [];
      
      return { success: true };
    } catch (err) {
      console.error('Failed to fetch available projects:', err);
      return { success: false, error: err.message };
    }
  }

  async function fetchTasks(projectId) {
    if (loading.value) return { success: true };
    if (!projectId) {
      error.value = 'Project ID is required';
      return { success: false, error: 'Project ID is required' };
    }

    mode.value = 'project';
    currentProjectId.value = projectId;
    selectedProjectFilter.value = null;
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
      console.error('Failed to fetch tasks:', err);
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  function toggleAddTask(columnId) {
    showAddTask.value = showAddTask.value === columnId ? null : columnId;
  }

  async function createTask(columnId, taskData) {
    if (mode.value === 'my-tasks' && !taskData.project_id) {
      error.value = 'Project ID is required';
      return { success: false, error: 'Project ID is required' };
    }

    const projectId = mode.value === 'project' 
      ? currentProjectId.value 
      : taskData.project_id;

    if (!projectId) {
      error.value = 'No project selected';
      return { success: false, error: 'No project selected' };
    }

    error.value = null;

    try {
      const status = columnDefinitions[columnId]?.status || 'backlog';
      const columnTasks = columns.value[columnId]?.tasks || [];
      const maxPosition = columnTasks.length > 0 
        ? Math.max(...columnTasks.map(t => t.position || 0))
        : 0;

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticTask = {
        id: tempId,
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        priority: taskData.priority || 'medium',
        status: status,
        position: maxPosition + 1,
        type: taskData.type || 'task',
        due_date: taskData.due_date || null,
        assignee_id: taskData.assignee_id || userStore.user?.id || null,
        assignee_name: taskData.assignee_name || userStore.userName || null,
        assignee_email: taskData.assignee_email || userStore.userEmail || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project_id: projectId,
        _isOptimistic: true 
      };

      tasks.value = [...tasks.value, optimisticTask];
      showAddTask.value = null;

      const newTask = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        priority: taskData.priority || 'medium',
        status: status,
        position: maxPosition + 1,
        type: taskData.type || 'task',
        due_date: taskData.due_date || null,
        assignee_id: taskData.assignee_id || userStore.user?.id || null
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
      
      const taskIndex = tasks.value.findIndex(t => t.id === tempId);
      if (taskIndex !== -1) {
        tasks.value = [
          ...tasks.value.slice(0, taskIndex),
          { ...data.task, _isOptimistic: false },
          ...tasks.value.slice(taskIndex + 1)
        ];
      } else {
        tasks.value = [...tasks.value, data.task];
      }
      
      return { success: true, id: data.id || data.task?.id };
    } catch (err) {
      error.value = err.message;
      console.error('Failed to create task:', err);
      
      tasks.value = tasks.value.filter(t => !t._isOptimistic);
      
      return { success: false, error: err.message };
    }
  }

  async function updateTask(taskId, updates) {
    if (loading.value) return; 

    try {
      const taskIndex = tasks.value.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = { ...tasks.value[taskIndex], ...updates };
      }
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      return { success: true };
    } catch (err) {
      console.error('Update failed:', err);
      return { success: false, error: err.message };
    }
  }

  async function deleteTask(taskId) {
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

  function startDrag(task, columnId) {
    draggedTask.value = task;
    draggedFrom.value = columnId;
  }

  async function dropTask(targetColumnId) {
    if (!draggedTask.value || !draggedFrom.value || draggedFrom.value === targetColumnId) {
      draggedTask.value = null;
      draggedFrom.value = null;
      return { success: true };
    }

    loading.value = true;
    error.value = null;

    try {
      const targetStatus = columnDefinitions[targetColumnId].status;
      const targetTasks = columns.value[targetColumnId].tasks;
      const newPosition = targetTasks.length;

      const updates = [{
        id: draggedTask.value.id,
        status: targetStatus,
        position: newPosition
      }];

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

      if (mode.value === 'my-tasks') {
        await fetchMyTasks(selectedProjectFilter.value);
      } else {
        await fetchTasks(currentProjectId.value);
      }

      draggedTask.value = null;
      draggedFrom.value = null;
      
      return { success: true };
    } catch (err) {
      error.value = err.message;
      console.error('Failed to drop task:', err);
      
      if (mode.value === 'my-tasks') {
        await fetchMyTasks(selectedProjectFilter.value);
      } else {
        await fetchTasks(currentProjectId.value);
      }
      
      draggedTask.value = null;
      draggedFrom.value = null;
      
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  function cancelDrag() {
    draggedTask.value = null;
    draggedFrom.value = null;
  }

  function clearBoard() {
    tasks.value = [];
    currentProjectId.value = null;
    showAddTask.value = null;
    draggedTask.value = null;
    draggedFrom.value = null;
    error.value = null;
    mode.value = 'project';
    selectedProjectFilter.value = null;
  }

  function $reset() {
  tasks.value = [];
  currentProjectId.value = null;
  showAddTask.value = null;
  draggedTask.value = null;
  draggedFrom.value = null;
  error.value = null;
  mode.value = 'project';
  selectedProjectFilter.value = null;
  availableProjects.value = [];
}

  return {
    // State
    tasks,
    currentProjectId,
    columns,
    loading,
    error,
    showAddTask,
    draggedTask,
    draggedFrom,
    columnDefinitions,
    mode,
    selectedProjectFilter,
    availableProjects,
    
    // Computed
    taskCounts,
    stats,
    
    // Actions
    fetchTasks,
    fetchMyTasks,
    fetchAvailableProjects,
    toggleAddTask,
    createTask,
    updateTask,
    deleteTask,
    startDrag,
    dropTask,
    cancelDrag,
    clearBoard,
    $reset
  };
});