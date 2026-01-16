<template>
  <header class="header">
    <div class="flex items-center space-x-4">
      <!-- Mobile Menu Button -->
      <button 
        @click="$emit('toggle-sidebar')"
        class="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-700 transition"
        aria-label="Toggle menu"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <!-- Logo -->
      <router-link to="/" class="text-xl font-bold text-blue-400">
        <img src="/logo.png" alt="Logo" width="100" class="h-8 w-auto">
      </router-link>
      
      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex space-x-4 text-sm">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link to="/projects" class="nav-link">Projects</router-link>
        <router-link to="/my-tasks" class="nav-link">My Tasks</router-link>
        <router-link to="/milestones" class="nav-link">Milestones</router-link>
        <router-link to="/reports" class="nav-link">Reports</router-link>
      </nav>
    </div>

    <div class="flex items-center space-x-3 md:space-x-4">
      <!-- Project Context (shows when on a project page) -->
      <div v-if="currentProject" class="project-context hidden xl:flex">
        <div 
          class="project-color-indicator" 
          :style="{ backgroundColor: currentProject.color || '#3b82f6' }"
        ></div>
        <div class="project-info">
          <span class="project-label">Current Project:</span>
          <span class="project-name">{{ currentProject.name }}</span>
        </div>
      </div>

      <!-- Profile Dropdown -->
      <div class="profile-dropdown" ref="dropdownRef">
        <button @click="toggleDropdown" class="profile-trigger">
          <img 
            :src="userAvatar" 
            :alt="userStore.userName"
            class="w-8 h-8 rounded-full border-2 border-slate-600 hover:border-blue-400 transition"
          />
          <span class="hidden sm:inline text-sm font-medium text-slate-300">
            {{ userStore.userName }}
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
            class="hidden sm:block text-slate-400"
            :class="{ 'rotate-180': isDropdownOpen }"
            style="transition: transform 0.2s"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <transition name="dropdown">
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <!-- User Info -->
            <div class="dropdown-header">
              <img 
                :src="userAvatar" 
                :alt="userStore.userName"
                class="w-12 h-12 rounded-full border-2 border-blue-500"
              />
              <div class="ml-3 min-w-0 flex-1">
                <p class="text-white font-semibold truncate">{{ userStore.userName }}</p>
                <p class="text-slate-400 text-xs truncate">{{ userStore.userEmail }}</p>
              </div>
            </div>

            <div class="dropdown-divider"></div>

            <!-- Menu Items -->
            <router-link to="/profile" class="dropdown-item" @click="closeDropdown">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span>My Profile</span>
            </router-link>

            <!-- Admin Only -->
            <router-link 
              v-if="isAdmin" 
              to="/manage-members" 
              class="dropdown-item" 
              @click="closeDropdown"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Manage Members</span>
              <span class="admin-badge">Admin</span>
            </router-link>

            <div class="dropdown-divider"></div>

            <!-- Logout -->
            <button @click="handleLogout" class="dropdown-item text-red-400 hover:bg-red-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useProjectStore } from '@/stores/project';

defineEmits(['toggle-sidebar']);

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const projectStore = useProjectStore();

// State
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

// Computed
const currentProject = computed(() => {
  const projectId = route.params.projectId;
  if (!projectId) return null;
  
  if (projectStore.currentProject?.id === projectId) {
    return projectStore.currentProject;
  }
  
  return projectStore.projects.find(p => p.id === projectId) || null;
});

const isAdmin = computed(() => userStore.user?.role === 'admin');

const userAvatar = computed(() => {
  if (userStore.user?.avatar) {
    return userStore.user.avatar;
  }
  const name = userStore.userName || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128`;
});

// Methods
function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function closeDropdown() {
  isDropdownOpen.value = false;
}

function handleLogout() {
  userStore.logout();
  router.push('/login');
  closeDropdown();
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown();
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.header {
  grid-column: 1 / -1;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 100;
}

/* Project Context */
.project-context {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid #334155;
  border-radius: 0.75rem;
}

.project-color-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.project-label {
  font-size: 0.625rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.project-name {
  font-size: 0.875rem;
  color: #e2e8f0;
  font-weight: 600;
}

/* Profile Dropdown */
.profile-dropdown {
  position: relative;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-trigger:hover {
  background: rgba(15, 23, 42, 0.9);
  border-color: #475569;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 280px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.05);
}

.dropdown-divider {
  height: 1px;
  background: #334155;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #e2e8f0;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background: rgba(59, 130, 246, 0.1);
  color: white;
}

.admin-badge {
  margin-left: auto;
  padding: 0.125rem 0.5rem;
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Navigation Links */
.nav-link {
  @apply text-slate-300 hover:text-white transition pb-3 -mb-3 border-b-2 border-transparent;
}

.router-link-active {
  @apply text-white font-medium border-blue-400;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .header {
    padding: 0.5rem 0.75rem;
  }

  .dropdown-menu {
    width: calc(100vw - 2rem);
    max-width: 280px;
  }

  .profile-trigger {
    padding: 0.25rem 0.375rem;
  }
}
</style>