<template>
  <div class="min-h-screen from-slate-900 via-slate-800 to-slate-900 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">Project Members</h1>
            <p class="text-slate-400">Manage team members and their roles</p>
          </div>
          <button
            @click="showAddModal = true"
            class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Member
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-blue-500/20 rounded-lg">
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-slate-400">Total Members</p>
                <p class="text-2xl font-bold text-white">{{ members.length }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-purple-500/20 rounded-lg">
                <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-slate-400">Admins</p>
                <p class="text-2xl font-bold text-white">
                  {{ members.filter(m => m.project_role === 'admin').length }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-emerald-500/20 rounded-lg">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-slate-400">Active</p>
                <p class="text-2xl font-bold text-white">{{ members.length }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center gap-3">
        <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <p class="text-emerald-400 font-medium">{{ successMessage }}</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
        <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-400 font-medium">{{ error }}</p>
        <button @click="error = null" class="ml-auto">
          <svg class="w-5 h-5 text-red-400 hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search members by name or email..."
            class="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Members List -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else class="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Member
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
              <tr 
                v-for="member in sortedMembers" 
                :key="member.id"
                class="hover:bg-slate-700/30 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img
                      :src="member.avatar || generateAvatar(member.name, member.email)"
                      :alt="member.name"
                      class="w-10 h-10 rounded-full ring-2 ring-slate-700"
                    />
                    <div>
                      <p class="font-semibold text-white">{{ member.name || 'Unknown' }}</p>
                      <p class="text-sm text-slate-400">{{ member.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span :class="getRoleBadgeClass(member.project_role)">
                    <component :is="getRoleIcon(member.project_role)" class="w-3.5 h-3.5" />
                    {{ formatRole(member.project_role) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm text-slate-300">
                    {{ formatDate(member.joined_at) }}
                  </p>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <template v-if="member.project_role !== 'owner' && canManageMembers">
                      <button
                        @click="handleUpdateRole(member)"
                        class="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
                        :title="member.project_role === 'member' ? 'Promote to Admin' : 'Demote to Member'"
                      >
                        {{ member.project_role === 'member' ? 'Make Admin' : 'Make Member' }}
                      </button>
                      <button
                        @click="confirmRemoveMember(member)"
                        class="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                        title="Remove member"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </template>
                    <template v-else-if="member.project_role === 'owner'">
                      <span class="px-3 py-1.5 text-xs text-slate-500 italic">
                        Project Owner
                      </span>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="sortedMembers.length === 0" class="py-12 text-center">
            <svg class="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p class="text-slate-400">No members found</p>
          </div>
        </div>
      </div>

      <!-- Add Member Modal -->
      <teleport to="body">
        <transition name="modal">
          <div v-if="showAddModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeAddModal">
            <div class="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl" @click.stop>
              <div class="p-6 border-b border-slate-700">
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-bold text-white">Add Team Member</h3>
                  <button @click="closeAddModal" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form @submit.prevent="handleAddMember" class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      v-model="newMemberEmail"
                      type="email"
                      placeholder="member@example.com"
                      class="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      autofocus
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    Role
                  </label>
                  <select
                    v-model="newMemberRole"
                    class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="member">Member - Can view and edit</option>
                    <option value="admin">Admin - Full project access</option>
                  </select>
                </div>

                <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p class="text-sm text-blue-300">
                    💡 The user must already have an account. They'll be added to this project immediately.
                  </p>
                </div>

                <div class="pt-2 flex gap-3">
                  <button
                    type="button"
                    @click="closeAddModal"
                    class="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    :disabled="addingMember"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="addingMember || !newMemberEmail.trim()"
                    class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <template v-if="addingMember">
                      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </template>
                    <template v-else>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Add Member
                    </template>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </transition>
      </teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const projectStore = useProjectStore();
const userStore = useUserStore();

// State
const members = ref([]);
const loading = ref(false);
const error = ref(null);
const successMessage = ref('');
const showAddModal = ref(false);
const searchQuery = ref('');
const newMemberEmail = ref('');
const newMemberRole = ref('member');
const addingMember = ref(false);

// Computed
const projectId = computed(() => route.params.id);

const canManageMembers = computed(() => {
  return projectStore.isProjectAdmin(projectId.value);
});

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value;
  
  const query = searchQuery.value.toLowerCase();
  return members.value.filter(member =>
    member.name?.toLowerCase().includes(query) ||
    member.email?.toLowerCase().includes(query)
  );
});

const sortedMembers = computed(() => {
  const roleOrder = { owner: 0, admin: 1, member: 2 };
  return [...filteredMembers.value].sort((a, b) => {
    return roleOrder[a.project_role] - roleOrder[b.project_role];
  });
});

// Methods
const fetchMembers = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const result = await projectStore.fetchProjectMembers(projectId.value);
    if (result.success) {
      members.value = result.members;
    } else {
      error.value = result.error || 'Failed to fetch members';
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleAddMember = async () => {
  if (!newMemberEmail.value.trim()) {
    error.value = 'Email is required';
    return;
  }

  addingMember.value = true;
  error.value = null;

  try {
    const result = await projectStore.addMember(
      projectId.value,
      newMemberEmail.value,
      newMemberRole.value
    );

    if (result.success) {
      successMessage.value = `Successfully added ${newMemberEmail.value} to the project`;
      setTimeout(() => { successMessage.value = ''; }, 3000);
      closeAddModal();
      await fetchMembers();
    } else {
      error.value = result.error || 'Failed to add member';
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    addingMember.value = false;
  }
};

const handleUpdateRole = async (member) => {
  const newRole = member.project_role === 'member' ? 'admin' : 'member';
  
  try {
    const result = await projectStore.updateMemberRole(
      projectId.value,
      member.id,
      newRole
    );

    if (result.success) {
      successMessage.value = `${member.name}'s role updated to ${newRole}`;
      setTimeout(() => { successMessage.value = ''; }, 3000);
      await fetchMembers();
    } else {
      error.value = result.error || 'Failed to update role';
    }
  } catch (err) {
    error.value = err.message;
  }
};

const confirmRemoveMember = async (member) => {
  if (!confirm(`Are you sure you want to remove ${member.name} from this project?`)) {
    return;
  }

  try {
    const result = await projectStore.removeMember(projectId.value, member.id);

    if (result.success) {
      successMessage.value = `${member.name} has been removed from the project`;
      setTimeout(() => { successMessage.value = ''; }, 3000);
      await fetchMembers();
    } else {
      error.value = result.error || 'Failed to remove member';
    }
  } catch (err) {
    error.value = err.message;
  }
};

const closeAddModal = () => {
  showAddModal.value = false;
  newMemberEmail.value = '';
  newMemberRole.value = 'member';
  error.value = null;
};

const generateAvatar = (name, email) => {
  const displayName = name || email || 'User';
  const colors = [
    { bg: '3b82f6', text: 'fff' },
    { bg: '8b5cf6', text: 'fff' },
    { bg: 'ec4899', text: 'fff' },
    { bg: 'f59e0b', text: 'fff' },
    { bg: '10b981', text: 'fff' },
    { bg: '06b6d4', text: 'fff' },
    { bg: 'ef4444', text: 'fff' },
    { bg: '6366f1', text: 'fff' }
  ];
  
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const color = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${color.bg}&color=${color.text}&size=128&bold=true`;
};

const getRoleBadgeClass = (role) => {
  const classes = {
    owner: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border text-amber-400 bg-amber-400/20 border-amber-400/30',
    admin: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border text-purple-400 bg-purple-400/20 border-purple-400/30',
    member: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border text-blue-400 bg-blue-400/20 border-blue-400/30'
  };
  return classes[role] || classes.member;
};

const getRoleIcon = (role) => {
  const icons = {
    owner: () => h('svg', { class: 'w-3.5 h-3.5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' })
    ]),
    admin: () => h('svg', { class: 'w-3.5 h-3.5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
    ]),
    member: () => h('svg', { class: 'w-3.5 h-3.5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
    ])
  };
  return icons[role] || icons.member;
};

const formatRole = (role) => {
  const labels = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member'
  };
  return labels[role] || 'Member';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Lifecycle
onMounted(() => {
  fetchMembers();
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>