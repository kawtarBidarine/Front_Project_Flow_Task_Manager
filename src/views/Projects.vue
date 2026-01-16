<template>
  <div class="projects-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <div>
          <h1 class="page-title">All Projects</h1>
          <p class="page-subtitle">Manage and organize your projects</p>
        </div>
      </div>

      <div class="header-actions">
        <div class="view-toggle">
          <button 
            @click="viewMode = 'grid'" 
            class="view-btn"
            :class="{ active: viewMode === 'grid' }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button 
            @click="viewMode = 'list'" 
            class="view-btn"
            :class="{ active: viewMode === 'list' }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <button @click="showCreateModal = true" class="create-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Project</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <div class="search-box">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search projects..."
          class="search-input"
        />
      </div>

      <div class="filter-group">
        <select v-model="filterStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="archived">Archived</option>
        </select>

        <select v-model="filterPriority" class="filter-select">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <button 
          v-if="hasActiveFilters" 
          @click="clearFilters" 
          class="clear-btn"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="projectStore.loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Loading projects...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="projectStore.error" class="error-container">
      <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="error-text">{{ projectStore.error }}</p>
      <button @click="loadProjects" class="retry-btn">Try Again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredProjects.length === 0 && !searchQuery" class="empty-container">
      <div class="empty-icon">
        <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="empty-title">No projects yet</h3>
      <p class="empty-subtitle">Create your first project to get started</p>
      <button @click="showCreateModal = true" class="empty-create-btn">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create First Project
      </button>
    </div>

    <!-- No Results State -->
    <div v-else-if="filteredProjects.length === 0 && searchQuery" class="empty-container">
      <div class="empty-icon">
        <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 class="empty-title">No projects found</h3>
      <p class="empty-subtitle">Try adjusting your search or filters</p>
    </div>

    <!-- Projects Grid View -->
    <div v-else-if="viewMode === 'grid'" class="projects-grid">
      <div 
        v-for="project in filteredProjects" 
        :key="project.id"
        class="project-card"
        @click="openProject(project.id)"
      >
        <div class="project-card-header">
          <div 
            class="project-color-indicator" 
            :style="{ backgroundColor: project.color || '#3b82f6' }"
          ></div>
          <div class="project-menu">
            <button 
              @click.stop="toggleDropdown(project.id)" 
              class="menu-btn"
              :class="{ 'active': activeDropdown === project.id }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <transition name="dropdown">
              <div 
                v-if="activeDropdown === project.id" 
                v-click-outside="() => closeDropdown()"
                class="dropdown-menu"
              >
                <button 
                  v-if="canManageProject(project)"
                  @click.stop="editProject(project)" 
                  class="dropdown-item"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Project
                </button>
                
                <button 
                  v-if="canManageProject(project)"
                  @click.stop="manageMembers(project)" 
                  class="dropdown-item"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Manage Members
                </button>

                <div v-if="canManageProject(project)" class="dropdown-divider"></div>

                <button 
                  @click.stop="viewProject(project.id)" 
                  class="dropdown-item"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </button>

                <template v-if="canManageProject(project)">
                  <div class="dropdown-divider"></div>
                  
                  <button 
                    @click.stop="confirmDeleteProject(project)" 
                    class="dropdown-item danger"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Project
                  </button>
                </template>
              </div>
            </transition>
          </div>
        </div>

        <div class="project-card-body">
          <h3 class="project-name">{{ project.name }}</h3>
          <p class="project-description">
            {{ project.description || 'No description provided' }}
          </p>

          <div class="project-stats">
            <div class="stat-item">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>{{ project.task_count || 0 }} tasks</span>
            </div>

            <div class="stat-item">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>{{ project.member_count || 0 }} members</span>
            </div>
          </div>

          <div class="project-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: calculateProgress(project) + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ calculateProgress(project) }}% complete</span>
          </div>
        </div>

        <div class="project-card-footer">
          <div class="project-badges">
            <span 
              class="status-badge" 
              :class="`status-${project.status || 'active'}`"
            >
              {{ formatStatus(project.status) }}
            </span>
            <span 
              class="priority-badge" 
              :class="`priority-${project.priority || 'medium'}`"
            >
              {{ formatPriority(project.priority) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Projects List View -->
    <div v-else class="projects-list">
      <div 
        v-for="project in filteredProjects" 
        :key="project.id"
        class="project-list-item"
        @click="openProject(project.id)"
      >
        <div 
          class="project-color-dot" 
          :style="{ backgroundColor: project.color || '#3b82f6' }"
        ></div>

        <div class="project-info">
          <h3 class="project-name">{{ project.name }}</h3>
          <p class="project-description">{{ project.description || 'No description' }}</p>
        </div>

        <div class="project-meta">
          <span 
            class="status-badge" 
            :class="`status-${project.status || 'active'}`"
          >
            {{ formatStatus(project.status) }}
          </span>
          <span 
            class="priority-badge" 
            :class="`priority-${project.priority || 'medium'}`"
          >
            {{ formatPriority(project.priority) }}
          </span>
        </div>

        <div class="project-stats-list">
          <div class="stat-item">
            <span class="stat-value">{{ project.task_count || 0 }}</span>
            <span class="stat-label">Tasks</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ project.member_count || 0 }}</span>
            <span class="stat-label">Members</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ calculateProgress(project) }}%</span>
            <span class="stat-label">Progress</span>
          </div>
        </div>

        <div class="list-menu-wrapper">
          <button 
            @click.stop="toggleDropdown(project.id)" 
            class="list-menu-btn"
            :class="{ 'active': activeDropdown === project.id }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <transition name="dropdown">
            <div 
              v-if="activeDropdown === project.id" 
              v-click-outside="() => closeDropdown()"
              class="dropdown-menu"
            >
              <button 
                v-if="canManageProject(project)"
                @click.stop="editProject(project)" 
                class="dropdown-item"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Project
              </button>
              
              <button 
                v-if="canManageProject(project)"
                @click.stop="manageMembers(project)" 
                class="dropdown-item"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Manage Members
              </button>

              <div v-if="canManageProject(project)" class="dropdown-divider"></div>

              <button 
                @click.stop="viewProject(project.id)" 
                class="dropdown-item"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>

              <template v-if="canManageProject(project)">
                <div class="dropdown-divider"></div>
                
                <button 
                  @click.stop="confirmDeleteProject(project)" 
                  class="dropdown-item danger"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Project
                </button>
              </template>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Create/Edit Project Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">
                {{ editingProject ? 'Edit Project' : 'Create New Project' }}
              </h3>
              <button @click="closeModal" class="modal-close">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleSubmit" class="modal-body">
              <div class="form-group">
                <label class="form-label">Project Name *</label>
                <input
                  v-model="formData.name"
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
                  v-model="formData.description"
                  class="form-textarea"
                  placeholder="Enter project description..."
                  rows="3"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select v-model="formData.status" class="form-select">
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Priority</label>
                  <select v-model="formData.priority" class="form-select">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Start Date</label>
                  <input
                    v-model="formData.start_date"
                    type="date"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">End Date</label>
                  <input
                    v-model="formData.end_date"
                    type="date"
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Color</label>
                <div class="color-picker">
                  <input
                    v-model="formData.color"
                    type="color"
                    class="form-color"
                  />
                  <span class="color-value">{{ formData.color }}</span>
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
                  :disabled="projectStore.loading || !formData.name.trim()"
                >
                  {{ projectStore.loading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Delete Confirmation Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
          <div class="modal-content modal-small" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">Delete Project</h3>
              <button @click="showDeleteModal = false" class="modal-close">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <div class="delete-warning">
                <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="warning-text">
                  Are you sure you want to delete <strong>{{ projectToDelete?.name }}</strong>? This action cannot be undone.
                </p>
              </div>

              <div class="modal-actions">
                <button @click="showDeleteModal = false" class="btn-secondary">
                  Cancel
                </button>
                <button 
                  @click="confirmDelete" 
                  class="btn-danger"
                  :disabled="projectStore.loading"
                >
                  {{ projectStore.loading ? 'Deleting...' : 'Delete Project' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '../stores/project';
import { useUserStore } from '../stores/user';

const router = useRouter();
const projectStore = useProjectStore();
const userStore = useUserStore();

// State
const viewMode = ref('list');
const searchQuery = ref('');
const filterStatus = ref('');
const filterPriority = ref('');
const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const editingProject = ref(null);
const projectToDelete = ref(null);

const formData = ref({
  name: '',
  description: '',
  status: 'active',
  priority: 'medium',
  color: '#3b82f6',
  start_date: '',
  end_date: ''
});

const activeDropdown = ref(null);

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};

const canManageProject = (project) => {
  // System admin can manage all projects
  if (userStore.isAdmin) {
    return true;
  }
  
  // Check project-specific role
  return project.user_role === 'owner' || project.user_role === 'admin';
};

const toggleDropdown = (projectId) => {
  if (activeDropdown.value === projectId) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = projectId;
  }
};

const closeDropdown = () => {
  activeDropdown.value = null;
};

const editProject = (project) => {
  editingProject.value = project;
  formData.value = {
    name: project.name,
    description: project.description || '',
    status: project.status || 'active',
    priority: project.priority || 'medium',
    color: project.color || '#3b82f6',
    start_date: project.start_date || '',
    end_date: project.end_date || ''
  };
  showCreateModal.value = true;
  activeDropdown.value = null;
};

const manageMembers = (project) => {
  router.push(`/projects/${project.id}/members`);
  activeDropdown.value = null;
};

const viewProject = (projectId) => {
  router.push(`/projects/${projectId}/board`);
  activeDropdown.value = null;
};

const confirmDeleteProject = (project) => {
  projectToDelete.value = project;
  showDeleteModal.value = true;
  activeDropdown.value = null;
};

// Computed
const filteredProjects = computed(() => {
  let projects = projectStore.projects || [];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    projects = projects.filter(p => 
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  }

  // Status filter
  if (filterStatus.value) {
    projects = projects.filter(p => p.status === filterStatus.value);
  }

  // Priority filter
  if (filterPriority.value) {
    projects = projects.filter(p => p.priority === filterPriority.value);
  }

  return projects;
});

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterStatus.value || filterPriority.value;
});

// Methods
const loadProjects = async () => {
  await projectStore.fetchProjects();
};

const calculateProgress = (project) => {
  if (!project.task_count || project.task_count === 0) return 0;
  const completed = project.completed_tasks || 0;
  return Math.round((completed / project.task_count) * 100);
};

const formatStatus = (status) => {
  const statusMap = {
    active: 'Active',
    completed: 'Completed',
    on_hold: 'On Hold',
    archived: 'Archived'
  };
  return statusMap[status] || 'Active';
};

const formatPriority = (priority) => {
  const priorityMap = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  };
  return priorityMap[priority] || 'Medium';
};

const clearFilters = () => {
  searchQuery.value = '';
  filterStatus.value = '';
  filterPriority.value = '';
};

const openProject = (projectId) => {
  router.push(`/projects/${projectId}/board`);
};


const closeModal = () => {
  showCreateModal.value = false;
  editingProject.value = null;
  formData.value = {
    name: '',
    description: '',
    status: 'active',
    priority: 'medium',
    color: '#3b82f6',
    start_date: '',
    end_date: ''
  };
};

const handleSubmit = async () => {
  if (editingProject.value) {
    const result = await projectStore.updateProject(editingProject.value.id, formData.value);
    if (result.success) {
      closeModal();
    }
  } else {
    const result = await projectStore.createProject(formData.value);
    if (result.success) {
      closeModal();
      // Optionally navigate to the new project
      // router.push(`/projects/${result.id}/board`);
    }
  }
};

const deleteProject = (projectId) => {
  projectToDelete.value = projectId;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (projectToDelete.value) {
    const result = await projectStore.deleteProject(projectToDelete.value);
    if (result.success) {
      showDeleteModal.value = false;
      projectToDelete.value = null;
    }
  }
};

// Lifecycle
onMounted(() => {
  loadProjects();
});
</script>

<style scoped>

.projects-page {
  min-height: 100vh;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.page-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0.25rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.view-toggle {
  display: flex;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.view-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn:hover {
  color: #cbd5e1;
}

.view-btn.active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

/* Filters Bar */
.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(30, 41, 59, 0.95);
}

.search-input::placeholder {
  color: #64748b;
}

.filter-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.filter-select {
  padding: 0.75rem 1rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.clear-btn {
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #f87171;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Loading & Error States */
.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 1rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.error-icon {
  width: 4rem;
  height: 4rem;
  color: #f87171;
  margin-bottom: 1rem;
}

.error-text {
  color: #f87171;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.625rem 1.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: #60a5fa;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
}

.empty-icon {
  color: #475569;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #cbd5e1;
  margin: 0 0 0.5rem 0;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1.5rem 0;
}

.empty-create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-4px);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.2);
}

.project-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.2);
}

.project-color-indicator {
  width: 4px;
  height: 2rem;
  border-radius: 2px;
}

.project-menu {
  margin-left: auto;
}

.menu-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-btn:hover {
  background: rgba(71, 85, 105, 0.3);
  color: #94a3b8;
}

.project-card-body {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.project-description {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 2.5rem;
}

.project-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #cbd5e1;
}

.stat-icon {
  width: 1rem;
  height: 1rem;
  color: #64748b;
}

.project-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: auto;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: rgba(71, 85, 105, 0.3);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #94a3b8;
  text-align: right;
}

.project-card-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(71, 85, 105, 0.2);
}

.project-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-badge,
.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-active {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-completed {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-on_hold {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.status-archived {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.priority-low {
  background: rgba(148, 163, 184, 0.2);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.priority-medium {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.priority-high {
  background: rgba(251, 146, 60, 0.2);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.3);
}

.priority-urgent {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Projects List */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.project-list-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.project-list-item:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(15, 23, 42, 0.8);
  transform: translateX(4px);
}

.project-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.project-info {
  flex: 1;
  min-width: 0;
}

.project-meta {
  display: flex;
  gap: 0.5rem;
}

.project-stats-list {
  display: flex;
  gap: 2rem;
}

.project-stats-list .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #e2e8f0;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.list-menu-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.list-menu-btn:hover {
  background: rgba(71, 85, 105, 0.3);
  color: #94a3b8;
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-small {
  max-width: 400px;
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
  margin: 0;
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
  padding: 0.75rem 1rem;
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

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.form-color {
  width: 4rem;
  height: 2.5rem;
  padding: 0.25rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  cursor: pointer;
}

.color-value {
  font-size: 0.875rem;
  color: #94a3b8;
  font-family: monospace;
}

.error-message {
  padding: 0.875rem 1rem;
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
.btn-secondary,
.btn-danger {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
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

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Delete Warning */
.delete-warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.75rem;
}

.warning-icon {
  width: 3rem;
  height: 3rem;
  color: #f87171;
}

.warning-text {
  color: #cbd5e1;
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .projects-page {
    padding: 1rem;
  }

  .filters-bar {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
    flex-wrap: wrap;
  }

  .filter-select {
    flex: 1;
    min-width: 120px;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .project-list-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .project-stats-list {
    width: 100%;
    justify-content: space-around;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .page-title {
    font-size: 1.5rem;
  }

  .create-btn span {
    display: none;
  }

  .view-toggle {
    display: none;
  }
}
/* Dropdown Menu Styles */
.project-menu,
.list-menu-wrapper {
  position: relative;
}

.menu-btn.active,
.list-menu-btn.active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  min-width: 200px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1000;
}

.dropdown-item:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.dropdown-item.danger {
  color: #f87171;
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.dropdown-divider {
  height: 1px;
  background: #334155;
  margin: 0.25rem 0;
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>