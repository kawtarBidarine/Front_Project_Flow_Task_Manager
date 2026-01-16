import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from './user';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref([]);
  const currentProject = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Computed
  const activeProjects = computed(() => 
    projects.value.filter(p => p.status === 'active')
  );

  const completedProjects = computed(() => 
    projects.value.filter(p => p.status === 'completed')
  );

  // Helper: Get auth headers
  const getHeaders = () => {
    const userStore = useUserStore();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userStore.token}`
    };
  };

  // Check if current user is admin for a project
  const isProjectAdmin = (projectId) => {
    const userStore = useUserStore();
    
    // System admin can do everything
    if (userStore.user?.role === 'admin') {
      return true;
    }
    
    // Check project-specific role
    const project = projects.value.find(p => p.id === projectId);
    if (!project) return false;
    
    return project.user_role === 'owner' || project.user_role === 'admin';
  };

  // Fetch all projects
  async function fetchProjects() {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/projects`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch projects');
      }

      const data = await response.json();
      projects.value = data.projects;
      return { success: true };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Fetch single project
  async function fetchProject(projectId) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch project');
      }

      const data = await response.json();
      currentProject.value = data.project;
      return { success: true, project: data.project };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Create project
  async function createProject(projectData) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create project');
      }

      const data = await response.json();
      await fetchProjects(); // Refresh list
      return { success: true, id: data.id };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Update project
  async function updateProject(projectId, updates) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update project');
      }

      await fetchProjects(); // Refresh list
      return { success: true };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Delete project
  async function deleteProject(projectId) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete project');
      }

      projects.value = projects.value.filter(p => p.id !== projectId);
      return { success: true };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Add member (admin only)
  async function addMember(projectId, email, role = 'member') {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/members`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, role })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add member');
      }

      return { success: true, member: data.member };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Remove member (admin only)
  async function removeMember(projectId, userId) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove member');
      }

      return { success: true };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Update member role (admin only)
  async function updateMemberRole(projectId, userId, role) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/members/${userId}/role`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ role })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update member role');
      }

      return { success: true };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Get project members
  async function fetchProjectMembers(projectId) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/members`, {
        headers: getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch members');
      }

      return { success: true, members: data.members };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  function $reset() {
  projects.value = [];
  currentProject.value = null;
  loading.value = false;
  error.value = null;
}

  return {
    // State
    projects,
    currentProject,
    loading,
    error,

    // Computed
    activeProjects,
    completedProjects,

    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    updateMemberRole,
    fetchProjectMembers,
    isProjectAdmin,
    $reset
  };
});