<template>
  <div class="milestones-container">
    <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Project Roadmap</h1>
        <p class="text-slate-400 text-sm mt-1">Tracking major project phases and delivery goals.</p>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Project Filter -->
        <select 
          v-model="selectedProject"
          @change="loadMilestones"
          class="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option :value="null">All Projects</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>

        <!-- Add Milestone Button -->
        <button
          @click="openAddModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Milestone
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && milestones.length === 0" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && milestones.length === 0" class="text-center py-20">
      <svg class="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
      <p class="text-slate-400 text-lg mb-4">No milestones yet</p>
      <button
        @click="openAddModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Create Your First Milestone
      </button>
    </div>

    <!-- Timeline -->
    <div v-else class="relative">
      <div class="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-slate-700"></div>

      <div class="space-y-12">
        <div v-for="(milestone, index) in milestones" :key="milestone.id" class="relative pl-12 md:pl-20">
          
          <div 
            class="absolute left-0 md:left-4 top-0 w-8 h-8 rounded-full border-4 border-[#0f172a] flex items-center justify-center z-10"
            :class="getStatusColor(milestone.status)"
          >
            <div v-if="milestone.status === 'completed'" class="w-2 h-2 bg-white rounded-full"></div>
            <div v-else-if="milestone.status === 'active'" class="w-2 h-2 bg-white animate-pulse rounded-full"></div>
            <div v-else class="w-2 h-2 bg-slate-600 rounded-full"></div>
          </div>

          <div class="bg-slate-800/40 border border-slate-700 p-6 rounded-xl hover:border-slate-500 transition-colors group">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span 
                    class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded inline-block"
                    :class="getStatusBadgeColor(milestone.status)"
                  >
                    {{ milestone.status.replace('-', ' ') }}
                  </span>
                  <span v-if="milestone.projectName" class="text-xs text-slate-500">
                    {{ milestone.projectName }}
                  </span>
                </div>
                <h3 class="text-lg font-semibold text-white">{{ milestone.title }}</h3>
              </div>
              <div class="flex items-center gap-2">
                <div class="text-right mr-4">
                  <p class="text-xs text-slate-500 uppercase font-semibold">Target Date</p>
                  <p class="text-sm text-slate-300">{{ milestone.date || 'No date set' }}</p>
                </div>
                
                <!-- Actions (visible on hover) -->
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click="openEditModal(milestone)"
                    class="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Edit milestone"
                  >
                    <svg class="w-4 h-4 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteMilestone(milestone.id)"
                    class="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete milestone"
                  >
                    <svg class="w-4 h-4 text-slate-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <p class="text-slate-400 text-sm mb-6 leading-relaxed">
              {{ milestone.description || 'No description provided.' }}
            </p>

            <div class="space-y-2">
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-400">
                  Progress {{ milestone.completedTasks || 0 }}/{{ milestone.taskCount || 0 }} tasks
                </span>
                <span class="text-white font-medium">{{ milestone.progress }}%</span>
              </div>
              <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  class="h-full transition-all duration-1000" 
                  :class="milestone.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'"
                  :style="{ width: milestone.progress + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Milestone Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="closeModal">
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-white mb-4">
          {{ editingMilestone ? 'Edit Milestone' : 'Add Milestone' }}
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Milestone Title</label>
            <input
              v-model="milestoneForm.title"
              type="text"
              class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter milestone title"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              v-model="milestoneForm.description"
              class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
              rows="3"
              placeholder="Describe this milestone..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                v-model="milestoneForm.status"
                class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Project</label>
              <select
                v-model="milestoneForm.projectId"
                class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                :disabled="editingMilestone !== null"
              >
                <option :value="null">Select project</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Target Date</label>
            <input
              v-model="milestoneForm.dueDate"
              type="date"
              class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="flex gap-3 pt-2">
            <button
              @click="saveMilestone"
              :disabled="saving || !milestoneForm.title.trim() || !milestoneForm.projectId"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded font-medium transition-colors flex items-center justify-center"
            >
              <span v-if="!saving">{{ editingMilestone ? 'Update' : 'Create' }} Milestone</span>
              <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </button>
            <button
              @click="closeModal"
              :disabled="saving"
              class="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-2 rounded font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

// State
const milestones = ref([]);
const projects = ref([]);
const selectedProject = ref(null);
const showModal = ref(false);
const editingMilestone = ref(null);
const loading = ref(false);
const saving = ref(false);

const milestoneForm = ref({
  title: '',
  description: '',
  status: 'pending',
  dueDate: '',
  projectId: null
});

// Helper: Get auth headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userStore.token}`
});

// Load projects
const loadProjects = async () => {
  try {
    const response = await fetch(`${API_URL}/my-projects`, {
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to load projects');
    
    const data = await response.json();
    projects.value = data.projects || [];
  } catch (error) {
    console.error('Error loading projects:', error);
  }
};

// Load milestones
const loadMilestones = async () => {
  loading.value = true;
  
  try {
    let url = `${API_URL}/milestones`;
    
    if (selectedProject.value) {
      url += `?project_id=${selectedProject.value}`;
    }
    
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to load milestones');
    
    const data = await response.json();
    milestones.value = data.milestones || [];
  } catch (error) {
    console.error('Error loading milestones:', error);
  } finally {
    loading.value = false;
  }
};

// Open add modal
const openAddModal = () => {
  editingMilestone.value = null;
  milestoneForm.value = {
    title: '',
    description: '',
    status: 'pending',
    dueDate: '',
    projectId: selectedProject.value
  };
  showModal.value = true;
};

// Open edit modal
const openEditModal = (milestone) => {
  editingMilestone.value = milestone;
  milestoneForm.value = {
    title: milestone.title,
    description: milestone.description || '',
    status: milestone.status,
    dueDate: milestone.dueDate ? milestone.dueDate.split('T')[0] : '',
    projectId: milestone.projectId
  };
  showModal.value = true;
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  editingMilestone.value = null;
  milestoneForm.value = {
    title: '',
    description: '',
    status: 'pending',
    dueDate: '',
    projectId: null
  };
};

// Save milestone
const saveMilestone = async () => {
  if (!milestoneForm.value.title.trim() || !milestoneForm.value.projectId || saving.value) return;
  
  saving.value = true;
  
  try {
    const payload = {
      title: milestoneForm.value.title.trim(),
      description: milestoneForm.value.description.trim(),
      status: milestoneForm.value.status,
      dueDate: milestoneForm.value.dueDate || null
    };
    
    let response;
    
    if (editingMilestone.value) {
      // Update existing milestone
      response = await fetch(`${API_URL}/milestones/${editingMilestone.value.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
    } else {
      // Create new milestone
      response = await fetch(`${API_URL}/projects/${milestoneForm.value.projectId}/milestones`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save milestone');
    }
    
    await loadMilestones();
    closeModal();
  } catch (error) {
    console.error('Error saving milestone:', error);
    alert(error.message || 'Failed to save milestone. Please try again.');
  } finally {
    saving.value = false;
  }
};

// Delete milestone
const deleteMilestone = async (milestoneId) => {
  if (!confirm('Are you sure you want to delete this milestone? Tasks linked to it will be unlinked.')) return;
  
  try {
    const response = await fetch(`${API_URL}/milestones/${milestoneId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to delete milestone');
    
    milestones.value = milestones.value.filter(m => m.id !== milestoneId);
  } catch (error) {
    console.error('Error deleting milestone:', error);
    alert('Failed to delete milestone. Please try again.');
  }
};

// Status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    case 'active': return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
    case 'on-hold': return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    case 'cancelled': return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
    default: return 'bg-slate-700';
  }
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500/10 text-emerald-400';
    case 'active': return 'bg-blue-500/10 text-blue-400';
    case 'on-hold': return 'bg-amber-500/10 text-amber-400';
    case 'cancelled': return 'bg-red-500/10 text-red-400';
    default: return 'bg-slate-700 text-slate-400';
  }
};

// Lifecycle
onMounted(async () => {
  await loadProjects();
  await loadMilestones();
});
</script>

<style scoped>
.milestones-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  padding-bottom: 4rem;
}

@media (max-width: 768px) {
  .milestones-container {
    padding: 1rem;
  }
}
</style>