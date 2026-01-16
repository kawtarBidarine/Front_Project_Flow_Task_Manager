<template>
  <aside class="sidebar">
    <!-- Mobile Close Button -->
    <div class="lg:hidden flex items-center justify-between p-4 border-b border-slate-700">
      <h2 class="text-lg font-bold text-blue-400">Menu</h2>
      <button 
        @click="$emit('close')"
        class="p-2 rounded-lg text-slate-300 hover:bg-slate-700 transition"
        aria-label="Close menu"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Scrollable Navigation Content -->
    <nav class="sidebar-content">
      <div>
        <h3 class="text-xs font-semibold uppercase text-slate-400 mb-2">Main</h3>
        <ul class="space-y-1 text-sm">
          <li v-for="item in mainItems" :key="item.label">
            <router-link 
              :to="item.path" 
              class="nav-item"
            >
              <img :src="item.icon" alt="" width="18" class="mr-2.5">
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="text-xs font-semibold uppercase text-slate-400 mb-2">Work Overview</h3>
        <ul class="space-y-1 text-sm">
          <li v-for="item in workItems" :key="item.label">
            <router-link 
              :to="item.path" 
              class="nav-item"
            >
              <img :src="item.icon" alt="" width="18" class="mr-2.5">
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Projects Section -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-xs font-semibold uppercase text-slate-400">My Projects</h3>
          <button 
            @click="showAddProjectModal = true"
            class="add-project-btn"
            title="Add new project"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="projectStore.loading" class="loading-projects">
          <div class="spinner-small"></div>
          <span class="text-xs text-slate-400">Loading...</span>
        </div>

        <!-- Projects List -->
        <ul v-else-if="projectStore.projects.length > 0" class="space-y-1 text-xs">
          <li v-for="project in projectStore.projects" :key="project.id">
            <router-link 
              :to="`/projects/${project.id}/board`"
              class="project-item"
              :class="{ 'active-project': isCurrentProject(project.id) }"
            >
              <div 
                class="project-color-dot" 
                :style="{ backgroundColor: project.color || '#3b82f6' }"
              ></div>
              <span class="project-name">{{ project.name }}</span>
              <span v-if="project.task_count > 0" class="task-count-badge">
                {{ project.task_count }}
              </span>
            </router-link>
          </li>
        </ul>

        <!-- Empty State -->
        <div v-else class="empty-projects">
          <p class="text-xs text-slate-500 mb-2">No projects yet</p>
          <button 
            @click="showAddProjectModal = true"
            class="create-first-project-btn"
          >
            Create Your First Project
          </button>
        </div>
      </div>
    </nav>

    <!-- Logout Button - Sticky at Bottom -->
    <div class="sidebar-footer">
      <!-- User Info -->
      <div class="user-info">
        <div class="user-avatar">
          {{ userStore.userName.charAt(0).toUpperCase() }}
        </div>
        <div class="user-details">
          <p class="user-name">{{ userStore.userName }}</p>
          <p class="user-email">{{ userStore.userEmail }}</p>
        </div>
      </div>
    </div>

    <!-- Add Project Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showAddProjectModal" class="modal-overlay" @click="closeModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">Create New Project</h3>
              <button @click="closeModal" class="modal-close">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleCreateProject" class="modal-body">
              <div class="form-group">
                <label class="form-label">Project Name *</label>
                <input
                  v-model="newProject.name"
                  type="text"
                  class="form-input"
                  placeholder="Enter project name..."
                  required
                  autofocus
                />
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea
                  v-model="newProject.description"
                  class="form-textarea"
                  placeholder="Enter project description..."
                  rows="3"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Priority</label>
                  <select v-model="newProject.priority" class="form-select">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Color</label>
                  <input
                    v-model="newProject.color"
                    type="color"
                    class="form-color"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Start Date</label>
                  <input
                    v-model="newProject.start_date"
                    type="date"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">End Date</label>
                  <input
                    v-model="newProject.end_date"
                    type="date"
                    class="form-input"
                  />
                </div>
              </div>

              <div v-if="projectStore.error" class="error-message">
                {{ projectStore.error }}
              </div>

              <div class="modal-actions">
                <button type="button" @click="closeModal" class="btn-secondary">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn-primary"
                  :disabled="projectStore.loading || !newProject.name.trim()"
                >
                  {{ projectStore.loading ? 'Creating...' : 'Create Project' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </teleport>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useProjectStore } from '@/stores/project';

defineEmits(['close']);

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const projectStore = useProjectStore();

const showAddProjectModal = ref(false);
const newProject = ref({
  name: '',
  description: '',
  priority: 'medium',
  color: '#3b82f6',
  start_date: '',
  end_date: ''
});

const mainItems = ref([
  { label: 'Home', icon: '/home.png', path: '/' },
  { label: 'Discuss', icon: '/conversation.png', path: '/discuss' },
  { label: 'Calendar', icon: '/calendar.png', path: '/calendar' },
  { label: 'Reports', icon: '/report.png', path: '/reports' }
]);

const workItems = ref([
  { label: 'All Projects', icon: '/checklist.png', path: '/projects' },
  { label: 'My Tasks', icon: '/report.png', path: '/my-tasks' },
  { label: 'Milestones', icon: '/flag.png', path: '/milestones' }
]);

// Check if current route is for this project
const isCurrentProject = (projectId) => {
  return route.params.projectId === projectId;
};

// Close modal and reset form
const closeModal = () => {
  showAddProjectModal.value = false;
  newProject.value = {
    name: '',
    description: '',
    priority: 'medium',
    color: '#3b82f6',
    start_date: '',
    end_date: ''
  };
};

// Handle project creation
const handleCreateProject = async () => {
  const result = await projectStore.createProject(newProject.value);
  
  if (result.success) {
    closeModal();
    // Navigate to the new project board
    router.push(`/projects/${result.id}/board`);
  }
};

// Load projects on mount
onMounted(() => {
  if (userStore.isAuthenticated && projectStore.projects.length === 0) {
    projectStore.fetchProjects();
  }
});
</script>

<style scoped>
.sidebar {
  background: #1e293b;
  border-right: 1px solid #334155;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

/* Navigation Items */
.nav-item {
  @apply flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition;
}

.router-link-active {
  @apply bg-blue-900/40 text-blue-400 font-medium;
}

/* Add Project Button */
.add-project-btn {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: none;
  border-radius: 0.375rem;
  padding: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-project-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: scale(1.1);
}

/* Loading State */
.loading-projects {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  justify-content: center;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Project Items */
.project-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: #cbd5e1;
  transition: all 0.2s;
  cursor: pointer;
}

.project-item:hover {
  background: rgba(71, 85, 105, 0.3);
  color: #e2e8f0;
}

.project-item.active-project {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  font-weight: 500;
}

.project-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.project-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-count-badge {
  background: rgba(71, 85, 105, 0.5);
  color: #cbd5e1;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 600;
  min-width: 1.25rem;
  text-align: center;
}

.project-item.active-project .task-count-badge {
  background: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

/* Empty State */
.empty-projects {
  padding: 1rem;
  text-align: center;
}

.create-first-project-btn {
  width: 100%;
  padding: 0.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: #60a5fa;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.create-first-project-btn:hover {
  background: rgba(59, 130, 246, 0.3);
}

/* Sticky Footer */
.sidebar-footer {
  border-top: 1px solid #334155;
  padding: 1rem;
  background: #1e293b;
  margin-top: auto;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 0.75rem;
  border: 1px solid #334155;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #334155;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e2e8f0;
}

.modal-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1;
}

.form-input,
.form-textarea,
.form-select {
  padding: 0.625rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(15, 23, 42, 0.95);
}

.form-color {
  height: 2.5rem;
  padding: 0.25rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  cursor: pointer;
}

.error-message {
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #f87171;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
}

.btn-secondary:hover {
  background: rgba(71, 85, 105, 0.5);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .modal-content {
    max-width: calc(100vw - 2rem);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }
}
</style>