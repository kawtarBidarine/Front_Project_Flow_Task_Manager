import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useProjectStore } from './project';
import { useKanbanStore } from './kanban';   

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

// Helper function to generate avatar with consistent color based on name
function generateAvatar(name, email) {
  const displayName = name || email || 'User';
  
  // Generate consistent color from name
  const colors = [
    { bg: '3b82f6', text: 'fff' }, // Blue
    { bg: '8b5cf6', text: 'fff' }, // Purple
    { bg: 'ec4899', text: 'fff' }, // Pink
    { bg: 'f59e0b', text: 'fff' }, // Amber
    { bg: '10b981', text: 'fff' }, // Emerald
    { bg: '06b6d4', text: 'fff' }, // Cyan
    { bg: 'ef4444', text: 'fff' }, // Red
    { bg: '6366f1', text: 'fff' }, // Indigo
  ];
  
  // Generate hash from name for consistent color
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const color = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${color.bg}&color=${color.text}&size=128&bold=true`;
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref(null);
  const token = ref(localStorage.getItem('user_token') || null);
  const loading = ref(false);
  const error = ref(null);

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userName = computed(() => user.value?.name || user.value?.email || 'Guest');
  const userEmail = computed(() => user.value?.email || '');
  const userRole = computed(() => user.value?.role || 'member');
  const isAdmin = computed(() => user.value?.role === 'admin');
  
  const userAvatar = computed(() => {
    if (user.value?.avatar) {
      return user.value.avatar;
    }
    return generateAvatar(user.value?.name, user.value?.email);
  });

  // Actions
  async function login(email, password) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token FIRST
      token.value = data.token;
      localStorage.setItem('user_token', data.token);

      // Store basic user info from login response
      user.value = data.user;

      // Then try to fetch full profile (optional, won't fail login if it errors)
      try {
        await fetchUserProfile();
      } catch (profileErr) {
        console.warn('Could not fetch full profile, using login data:', profileErr);
      }

      return { success: true };
    } catch (err) {
      error.value = err.message;
      token.value = null;
      user.value = null;
      localStorage.removeItem('user_token');
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  async function register(email, password) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      token.value = data.token;
      localStorage.setItem('user_token', data.token);
      
      await fetchUserProfile();

      return { success: true };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserProfile() {
    if (!token.value) {
      console.warn('No token available for fetching profile');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        
        // CRITICAL: Throw specific error with status code
        const errorMsg = data.message || 'Failed to fetch profile';
        const error = new Error(errorMsg);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      user.value = data.user;
    
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      
      // Only logout on authentication errors (401, 403)
      if (err.status === 401 || err.status === 403 || err.message?.includes('expired')) {
        console.log('🚪 Token invalid or expired, logging out');
        logout();
      }
      
      throw err; // Re-throw so caller can handle it
    }
  }

  async function updateProfile(updates) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Update failed');
      }

      // Refresh profile after update
      await fetchUserProfile();
      return { success: true };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  async function initialize() {
    if (!token.value) {
      loading.value = false; 
      return;
    }

    loading.value = true;
    try {
      await fetchUserProfile();
    } catch (err) {
      console.error('Initialization failed:', err);
    } finally {
      loading.value = false;
    }
  }
function logout() {
  // Import the other stores
  const projectStore = useProjectStore();
  const kanbanStore = useKanbanStore();
  
  // Reset all stores
  user.value = null;
  token.value = null;
  localStorage.removeItem('user_token');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_id');
  
  // Clear other stores
  projectStore.$reset();
  kanbanStore.$reset();
}
  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userName,
    userEmail,
    userAvatar,
    userRole,
    isAdmin,
    login,
    register,
    fetchUserProfile,
    updateProfile,
    logout,
    initialize,
    generateAvatar,
  };
});