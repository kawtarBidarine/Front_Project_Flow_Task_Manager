<template>
  <div class="manage-members-page">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Manage Team Members</h1>
          <p class="text-slate-400">View and manage all users in your organization</p>
          <div v-if="stats" class="flex gap-4 mt-3 text-sm">
            <span class="text-slate-400">
              Total: <span class="text-white font-semibold">{{ stats.total_users }}</span>
            </span>
            <span class="text-slate-400">
              Admins: <span class="text-purple-400 font-semibold">{{ stats.admin_count }}</span>
            </span>
            <span class="text-slate-400">
              Members: <span class="text-blue-400 font-semibold">{{ stats.member_count }}</span>
            </span>
          </div>
        </div>
        <button @click="openAddModal" class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Add User
        </button>
      </div>

      <!-- Access Denied -->
      <div v-if="!isAdmin" class="card text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-red-400 mb-4">
          <circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/>
        </svg>
        <h2 class="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p class="text-slate-400 mb-4">You don't have permission to access this page.</p>
        <button @click="$router.push('/')" class="btn-secondary">
          Go to Dashboard
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Members Table -->
      <div v-else class="card">
        <!-- Search and Filter -->
        <div class="mb-6 flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or email..."
                class="input-field pl-10"
              />
            </div>
          </div>
          <select v-model="roleFilter" class="input-field w-full md:w-48">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>

        <!-- Members Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-700">
                <th class="text-left py-3 px-4 text-slate-400 font-semibold text-sm">User</th>
                <th class="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Email</th>
                <th class="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Role</th>
                <th class="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Department</th>
                <th class="text-left py-3 px-4 text-slate-400 font-semibold text-sm hidden md:table-cell">Projects</th>
                <th class="text-left py-3 px-4 text-slate-400 font-semibold text-sm hidden lg:table-cell">Last Login</th>
                <th class="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="member in filteredMembers" 
                :key="member.id"
                class="border-b border-slate-700/50 hover:bg-slate-800/30 transition"
              >
                <td class="py-4 px-4">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="member.avatar || userStore.generateAvatar(member.name, member.email)"
                      :alt="member.name || member.email"
                      class="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p class="text-white font-medium">{{ member.name || 'No name set' }}</p>
                      <p class="text-slate-400 text-xs">{{ member.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4 text-slate-300 hidden md:table-cell">{{ member.email }}</td>
                <td class="py-4 px-4">
                  <span :class="getRoleBadgeClass(member.role)" class="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    {{ member.role || 'member' }}
                  </span>
                </td>
                <td class="py-4 px-4 text-slate-300">{{ member.department || 'N/A' }}</td>
                <td class="py-4 px-4 text-slate-300 hidden md:table-cell">
                  <span class="inline-flex items-center gap-1">
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {{ member.projectCount || 0 }}
                  </span>
                </td>
                <td class="py-4 px-4 text-slate-300 text-sm hidden lg:table-cell">
                  {{ formatDate(member.lastLogin) }}
                </td>
                <td class="py-4 px-4">
                  <div class="flex gap-2">
                    <button 
                      @click="viewMember(member)"
                      class="text-blue-400 hover:text-blue-300 transition"
                      title="View Details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button 
                      @click="editMember(member)"
                      class="text-amber-400 hover:text-amber-300 transition"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                      </svg>
                    </button>
                    <button 
                      v-if="member.id !== userStore.user?.id"
                      @click="confirmDelete(member)"
                      class="text-red-400 hover:text-red-300 transition"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="filteredMembers.length === 0" class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-slate-600 mb-4">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            <p class="text-slate-400">No members found</p>
          </div>
        </div>

        <!-- Pagination Info -->
        <div class="mt-6 flex justify-between items-center text-sm">
          <p class="text-slate-400">
            Showing {{ filteredMembers.length }} of {{ allMembers.length }} users
          </p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Member Modal -->
    <div v-if="showAddModal || editingMember" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="text-xl font-bold text-white">
            {{ editingMember ? 'Edit User' : 'Add New User' }}
          </h3>
          <button @click="closeModal" class="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveMember" class="modal-body">
          <div class="space-y-4">
            <div>
              <label class="label">Email *</label>
              <input 
                v-model="memberForm.email"
                type="email"
                required
                :disabled="!!editingMember"
                placeholder="user@example.com"
                class="input-field"
              />
            </div>

            <div v-if="!editingMember">
              <label class="label">Password *</label>
              <input 
                v-model="memberForm.password"
                type="password"
                required
                minlength="6"
                placeholder="Minimum 6 characters"
                class="input-field"
              />
            </div>

            <div>
              <label class="label">Full Name</label>
              <input 
                v-model="memberForm.name"
                type="text"
                placeholder="John Doe"
                class="input-field"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Role</label>
                <select v-model="memberForm.role" class="input-field">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label class="label">Department</label>
                <input 
                  v-model="memberForm.department"
                  type="text"
                  placeholder="Engineering"
                  class="input-field"
                />
              </div>
            </div>

            <div>
              <label class="label">Phone</label>
              <input 
                v-model="memberForm.phone"
                type="tel"
                placeholder="+1 234 567 8900"
                class="input-field"
              />
            </div>

            <div v-if="modalError" class="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
              {{ modalError }}
            </div>

            <div v-if="modalSuccess" class="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm">
              {{ modalSuccess }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="modalSaving" class="btn-primary">
              <span v-if="!modalSaving">{{ editingMember ? 'Save Changes' : 'Create User' }}</span>
              <div v-else class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deletingMember" class="modal-overlay" @click.self="deletingMember = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="text-xl font-bold text-white">Confirm Delete</h3>
        </div>
        <div class="modal-body">
          <p class="text-slate-300 mb-4">
            Are you sure you want to delete <strong class="text-white">{{ deletingMember.name || deletingMember.email }}</strong>?
          </p>
          <p class="text-slate-400 text-sm mb-4">
            This will remove the user from all projects and delete all their data. This action cannot be undone.
          </p>
          <div v-if="modalError" class="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
            {{ modalError }}
          </div>
        </div>
        <div class="modal-footer">
          <button @click="deletingMember = null; modalError = null" class="btn-secondary">
            Cancel
          </button>
          <button @click="deleteMember" :disabled="modalSaving" class="btn-danger">
            <span v-if="!modalSaving">Delete User</span>
            <div v-else class="flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Deleting...</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- View Member Details Modal -->
    <div v-if="viewingMember" class="modal-overlay" @click.self="viewingMember = null">
      <div class="modal-content max-w-2xl">
        <div class="modal-header">
          <h3 class="text-xl font-bold text-white">User Details</h3>
          <button @click="viewingMember = null" class="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
            <img 
              :src="viewingMember.avatar || userStore.generateAvatar(viewingMember.name, viewingMember.email)"
              :alt="viewingMember.name"
              class="w-20 h-20 rounded-full"
            />
            <div>
              <h4 class="text-xl font-bold text-white">{{ viewingMember.name || 'No name set' }}</h4>
              <p class="text-slate-400">{{ viewingMember.email }}</p>
              <span :class="getRoleBadgeClass(viewingMember.role)" class="mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold">
                {{ viewingMember.role || 'member' }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-sm text-slate-400 mb-1">Department</p>
              <p class="text-white">{{ viewingMember.department || 'Not set' }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-400 mb-1">Phone</p>
              <p class="text-white">{{ viewingMember.phone || 'Not set' }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-400 mb-1">Joined</p>
              <p class="text-white">{{ formatDate(viewingMember.createdAt) }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-400 mb-1">Last Login</p>
              <p class="text-white">{{ formatDate(viewingMember.lastLogin) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-blue-400">{{ viewingMember.projectCount || 0 }}</p>
              <p class="text-xs text-slate-400 mt-1">Projects</p>
            </div>
            <div class="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-amber-400">{{ viewingMember.activeTasks || 0 }}</p>
              <p class="text-xs text-slate-400 mt-1">Active Tasks</p>
            </div>
            <div class="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-green-400">
                {{ viewingMember.completedTasks || 0 }}
              </p>
              <p class="text-xs text-slate-400 mt-1">Completed</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="viewingMember = null" class="btn-secondary">
            Close
          </button>
          <button @click="editMember(viewingMember); viewingMember = null" class="btn-primary">
            Edit User
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

// State
const loading = ref(true);
const allMembers = ref([]);
const stats = ref(null);
const searchQuery = ref('');
const roleFilter = ref('');
const showAddModal = ref(false);
const editingMember = ref(null);
const deletingMember = ref(null);
const viewingMember = ref(null);
const modalSaving = ref(false);
const modalError = ref(null);
const modalSuccess = ref(null);

const memberForm = ref({
  email: '',
  password: '',
  name: '',
  role: 'member',
  department: '',
  phone: ''
});

// Computed
const isAdmin = computed(() => userStore.user?.role === 'admin');

const filteredMembers = computed(() => {
  let filtered = allMembers.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(m => 
      (m.name?.toLowerCase().includes(query)) ||
      (m.email?.toLowerCase().includes(query))
    );
  }

  // Role filter
  if (roleFilter.value) {
    filtered = filtered.filter(m => m.role === roleFilter.value);
  }

  return filtered;
});

// Methods
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userStore.token}`
});

async function loadMembers() {
  if (!isAdmin.value) {
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to load users');
    }

    const data = await response.json();
    allMembers.value = data.users || [];
  } catch (err) {
    console.error('Failed to load members:', err);
    modalError.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      stats.value = data.stats;
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

function getRoleBadgeClass(role) {
  return role === 'admin' 
    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
}

function formatDate(dateStr) {
  if (!dateStr) return 'Never';
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

function openAddModal() {
  editingMember.value = null;
  memberForm.value = {
    email: '',
    password: '',
    name: '',
    role: 'member',
    department: '',
    phone: ''
  };
  showAddModal.value = true;
  modalError.value = null;
  modalSuccess.value = null;
}

function viewMember(member) {
  viewingMember.value = member;
}

function editMember(member) {
  editingMember.value = member;
  memberForm.value = {
    email: member.email,
    password: '',
    name: member.name || '',
    role: member.role || 'member',
    department: member.department || '',
    phone: member.phone || ''
  };
  showAddModal.value = false;
  modalError.value = null;
  modalSuccess.value = null;
}

function confirmDelete(member) {
  deletingMember.value = member;
  modalError.value = null;
}

async function saveMember() {
  modalSaving.value = true;
  modalError.value = null;
  modalSuccess.value = null;

  try {
    if (editingMember.value) {
      // Update existing member
      const response = await fetch(`${API_URL}/admin/users/${editingMember.value.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: memberForm.value.name,
          role: memberForm.value.role,
          department: memberForm.value.department,
          phone: memberForm.value.phone
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update user');
      }

      modalSuccess.value = 'User updated successfully!';
      setTimeout(() => {
        closeModal();
        loadMembers();
      }, 1500);
    } else {
      // Create new member
      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(memberForm.value)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create user');
      }

      modalSuccess.value = 'User created successfully!';
      setTimeout(() => {
        closeModal();
        loadMembers();
        loadStats();
      }, 1500);
    }
  } catch (err) {
    modalError.value = err.message;
  } finally {
    modalSaving.value = false;
  }
}

async function deleteMember() {
  modalSaving.value = true;
  modalError.value = null;

  try {
    const response = await fetch(`${API_URL}/admin/users/${deletingMember.value.id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete user');
    }

    deletingMember.value = null;
    await loadMembers();
    await loadStats();
  } catch (err) {
    modalError.value = err.message;
  } finally {
    modalSaving.value = false;
  }
}

function closeModal() {
  showAddModal.value = false;
  editingMember.value = null;
  memberForm.value = {
    email: '',
    password: '',
    name: '',
    role: 'member',
    department: '',
    phone: ''
  };
  modalError.value = null;
  modalSuccess.value = null;
}

// Lifecycle
onMounted(async () => {
  if (!isAdmin.value) {
    setTimeout(() => {
      router.push('/');
    }, 2000);
  } else {
    await loadMembers();
    await loadStats();
  }
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