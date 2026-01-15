<template>
  <div class="min-h-screen bg-slate-900 p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <button 
              @click="$router.back()" 
              class="text-slate-400 hover:text-white transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="text-3xl font-bold text-white">Project Members</h1>
          </div>
          <p class="text-slate-400 ml-9">Manage team members and their roles for this project</p>
          
          <!-- Project Info Badge -->
          <div v-if="currentProject" class="ml-9 mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <div 
              class="w-3 h-3 rounded-full" 
              :style="{ backgroundColor: currentProject.color || '#3b82f6' }"
            ></div>
            <span class="text-sm font-medium text-white">{{ currentProject.name }}</span>
            <span class="text-xs text-slate-400">•</span>
            <span class="text-xs text-slate-400">{{ members.length }} members</span>
          </div>
        </div>

        <!-- Add Member Button - Only for admins -->
        <button 
          v-if="canManageMembers"
          @click="openAddMemberModal" 
          class="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/50 hover:-translate-y-0.5"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Member
        </button>
      </div>

      <!-- Access Denied -->
      <div v-if="!hasAccess" class="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <h2 class="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p class="text-slate-400 mb-6">You don't have permission to view this project's members.</p>
        <button @click="$router.push('/projects')" class="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">
          Back to Projects
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Members List -->
      <div v-else class="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl overflow-hidden">
        <!-- Search Bar -->
        <div class="p-6 border-b border-slate-700">
          <div class="relative">
            <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search members by name or email..."
              class="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <!-- Members Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th class="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Member</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                <th v-if="canManageMembers" class="text-right py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
              <tr 
                v-for="member in filteredMembers" 
                :key="member.id"
                class="hover:bg-slate-800/50 transition group"
              >
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="member.avatar || generateAvatar(member.name, member.email)"
                      :alt="member.name || member.email"
                      class="w-10 h-10 rounded-full ring-2 ring-slate-700"
                    />
                    <div>
                      <p class="font-semibold text-white">{{ member.name || 'No name set' }}</p>
                      <p class="text-xs text-slate-400">{{ member.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-slate-300">{{ member.email }}</td>
                <td class="py-4 px-6">
                  <span 
                    :class="getRoleBadgeClass(member.role)"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  >
                    <svg v-if="member.role === 'owner'" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <svg v-else-if="member.role === 'admin'" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
                    </svg>
                    {{ formatRole(member.role) }}
                  </span>
                </td>
                <td class="py-4 px-6 text-sm text-slate-400">{{ formatDate(member.joined_at) }}</td>
                <td v-if="canManageMembers" class="py-4 px-6 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                    <!-- Change Role Button -->
                    <button 
                      v-if="member.role !== 'owner' && member.id !== userStore.user?.id"
                      @click="openChangeRoleModal(member)"
                      class="p-2 text-amber-400 hover:bg-amber-400/10 rounded-lg transition"
                      title="Change Role"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                      </svg>
                    </button>
                    
                    <!-- Remove Member Button -->
                    <button 
                      v-if="member.role !== 'owner' && member.id !== userStore.user?.id"
                      @click="confirmRemoveMember(member)"
                      class="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                      title="Remove Member"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>

                    <!-- Owner/You Badge -->
                    <span v-if="member.role === 'owner' || member.id === userStore.user?.id" class="text-xs text-slate-500 px-2">
                      {{ member.role === 'owner' ? '(Owner)' : '(You)' }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="filteredMembers.length === 0" class="text-center py-16">
            <svg class="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h3 class="text-lg font-semibold text-white mb-2">No members found</h3>
            <p class="text-slate-400">{{ searchQuery ? 'Try adjusting your search' : 'Add members to get started' }}</p>
          </div>
        </div>

        <!-- Footer Stats -->
        <div class="px-6 py-4 bg-slate-900/50 border-t border-slate-700">
          <p class="text-sm text-slate-400">
            Showing {{ filteredMembers.length }} of {{ members.length }} members
          </p>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeAddModal">
      <div class="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
        <div class="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h3 class="text-xl font-bold text-white">Add Team Member</h3>
          <button @click="closeAddModal" class="text-slate-400 hover:text-white transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="addMember" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
            <input 
              v-model="addMemberForm.email"
              type="email"
              required
              placeholder="member@example.com"
              class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            <p class="mt-2 text-xs text-slate-400">Enter the email of the user you want to add to this project</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-300 mb-2">Project Role</label>
            <select 
              v-model="addMemberForm.role"
              class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="member">Member - Can view and edit tasks</option>
              <option value="admin">Admin - Can manage members and settings</option>
            </select>
          </div>

          <div v-if="modalError" class="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span>{{ modalError }}</span>
          </div>

          <div v-if="modalSuccess" class="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>{{ modalSuccess }}</span>
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="button" 
              @click="closeAddModal" 
              class="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="modalSaving"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <div v-if="modalSaving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>{{ modalSaving ? 'Adding...' : 'Add Member' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Change Role Modal -->
    <div v-if="changingRoleMember" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="changingRoleMember = null">
      <div class="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
        <div class="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h3 class="text-xl font-bold text-white">Change Member Role</h3>
          <button @click="changingRoleMember = null" class="text-slate-400 hover:text-white transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-6">
          <div class="flex items-center gap-3 mb-6">
            <img 
              :src="changingRoleMember.avatar || generateAvatar(changingRoleMember.name, changingRoleMember.email)"
              :alt="changingRoleMember.name"
              class="w-12 h-12 rounded-full ring-2 ring-slate-700"
            />
            <div>
              <p class="font-semibold text-white">{{ changingRoleMember.name || 'No name set' }}</p>
              <p class="text-sm text-slate-400">{{ changingRoleMember.email }}</p>
            </div>
          </div>

          <label class="block text-sm font-semibold text-slate-300 mb-2">New Role</label>
          <select 
            v-model="changeRoleForm.role"
            class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition mb-4"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>

          <div v-if="modalError" class="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {{ modalError }}
          </div>

          <div class="flex gap-3">
            <button 
              @click="changingRoleMember = null; modalError = null" 
              class="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button 
              @click="updateMemberRole"
              :disabled="modalSaving"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <div v-if="modalSaving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>{{ modalSaving ? 'Updating...' : 'Update Role' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Remove Member Confirmation Modal -->
    <div v-if="removingMember" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="removingMember = null">
      <div class="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
        <div class="px-6 py-4 border-b border-slate-700">
          <h3 class="text-xl font-bold text-white">Remove Member</h3>
        </div>

        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <img 
              :src="removingMember.avatar || generateAvatar(removingMember.name, removingMember.email)"
              :alt="removingMember.name"
              class="w-12 h-12 rounded-full ring-2 ring-slate-700"
            />
            <div>
              <p class="font-semibold text-white">{{ removingMember.name || 'No name set' }}</p>
              <p class="text-sm text-slate-400">{{ removingMember.email }}</p>
            </div>
          </div>

          <div class="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 mb-4">
            <div class="flex gap-3">
              <svg class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div>
                <p class="font-semibold text-amber-400 mb-1">Are you sure?</p>
                <p class="text-sm text-slate-300">This will remove the member from this project and unassign all their tasks.</p>
              </div>
            </div>
          </div>

          <div v-if="modalError" class="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {{ modalError }}
          </div>

          <div class="flex gap-3">
            <button 
              @click="removingMember = null; modalError = null" 
              class="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button 
              @click="removeMember"
              :disabled="modalSaving"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <div v-if="modalSaving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>{{ modalSaving ? 'Removing...' : 'Remove Member' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../stores/project';
import { useUserStore } from '../stores/user';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const userStore = useUserStore();

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

// State
const loading = ref(true);
const members = ref([]);
const currentProject = ref(null);
const searchQuery = ref('');
const showAddModal = ref(false);
const changingRoleMember = ref(null);
const removingMember = ref(null);
const modalSaving = ref(false);
const modalError = ref(null);
const modalSuccess = ref(null);

const addMemberForm = ref({
  email: '',
  role: 'member'
});

const changeRoleForm = ref({
  role: 'member'
});

// Computed
const projectId = computed(() => route.params.id);

const hasAccess = computed(() => {
  if (!currentProject.value) return false;
  return true; // If we fetched the project, we have access
});

const canManageMembers = computed(() => {
  return projectStore.isProjectAdmin(projectId.value);
});

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value;
  
  const query = searchQuery.value.toLowerCase();
  return members.value.filter(m => 
    (m.name?.toLowerCase().includes(query)) ||
    (m.email?.toLowerCase().includes(query))
  );
});

// Methods
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userStore.token}`
});

function generateAvatar(name, email) {
  const text = (name || email || '?').charAt(0).toUpperCase();
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  const color = colors[Math.abs(text.charCodeAt(0) % colors.length)];
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <rect width="40" height="40" fill="${color}"/>
      <text x="20" y="20" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial" font-size="18" font-weight="bold">${text}</text>
    </svg>
  `)}`;
}

function getRoleBadgeClass(role) {
  if (role === 'owner') {
    return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
  } else if (role === 'admin') {
    return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
  }
  return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
}

function formatRole(role) {
  if (role === 'owner') return 'Owner';
  if (role === 'admin') return 'Admin';
  return 'Member';
}

function formatDate(dateStr) {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function loadProjectAndMembers() {
  loading.value = true;
  
  try {
    // Load project details (which includes members)
    const projectResponse = await fetch(`${API_URL}/projects/${projectId.value}`, {
      headers: getHeaders()
    });

    if (!projectResponse.ok) {
      throw new Error('Failed to load project');
    }

    const projectData = await projectResponse.json();
    currentProject.value = projectData.project;
    
    // Extract members from project data
    // The backend returns members as JSON aggregate, so we need to parse it
    if (projectData.project.members) {
      members.value = projectData.project.members;
    } else {
      members.value = [];
    }
  } catch (err) {
    console.error('Error loading project/members:', err);
    modalError.value = err.message;
  } finally {
    loading.value = false;
  }
}

function openAddMemberModal() {
  addMemberForm.value = {
    email: '',
    role: 'member'
  };
  showAddModal.value = true;
  modalError.value = null;
  modalSuccess.value = null;
}

function closeAddModal() {
  showAddModal.value = false;
  addMemberForm.value = {
    email: '',
    role: 'member'
  };
  modalError.value = null;
  modalSuccess.value = null;
}

async function addMember() {
  modalSaving.value = true;
  modalError.value = null;
  modalSuccess.value = null;

  try {
    const result = await projectStore.addMember(
      projectId.value,
      addMemberForm.value.email,
      addMemberForm.value.role
    );

    if (result.success) {
      modalSuccess.value = 'Member added successfully!';
      setTimeout(async () => {
        closeAddModal();
        await loadProjectAndMembers();
      }, 1500);
    } else {
      throw new Error(result.error || 'Failed to add member');
    }
  } catch (err) {
    modalError.value = err.message;
  } finally {
    modalSaving.value = false;
  }
}

function openChangeRoleModal(member) {
  changingRoleMember.value = member;
  changeRoleForm.value.role = member.role || 'member';
  modalError.value = null;
}

async function updateMemberRole() {
  modalSaving.value = true;
  modalError.value = null;

  try {
    const result = await projectStore.updateMemberRole(
      projectId.value,
      changingRoleMember.value.id,
      changeRoleForm.value.role
    );

    if (result.success) {
      changingRoleMember.value = null;
      await loadProjectAndMembers();
    } else {
      throw new Error(result.error || 'Failed to update role');
    }
  } catch (err) {
    modalError.value = err.message;
  } finally {
    modalSaving.value = false;
  }
}

function confirmRemoveMember(member) {
  removingMember.value = member;
  modalError.value = null;
}

async function removeMember() {
  modalSaving.value = true;
  modalError.value = null;

  try {
    const result = await projectStore.removeMember(
      projectId.value,
      removingMember.value.id
    );

    if (result.success) {
      removingMember.value = null;
      await loadProjectAndMembers();
    } else {
      throw new Error(result.error || 'Failed to remove member');
    }
  } catch (err) {
    modalError.value = err.message;
  } finally {
    modalSaving.value = false;
  }
}

// Lifecycle
onMounted(async () => {
  await loadProjectAndMembers();
});
</script>

<style scoped>
.manage-members-page {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
}

.card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
}

.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: white;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #1e293b;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(59, 130, 246, 0.5);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #1e293b;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: 1px solid #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #334155;
  border-color: #475569;
}

.btn-danger {
  background: #dc2626;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #334155;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .manage-members-page {
    padding: 1rem;
  }
}
</style>