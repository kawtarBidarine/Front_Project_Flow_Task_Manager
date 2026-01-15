<template>
  <div class="profile-page">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p class="text-slate-400">Manage your account settings and preferences</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Profile Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Avatar Section -->
        <div class="lg:col-span-1">
          <div class="card">
            <div class="text-center">
              <div class="inline-block relative">
                <img 
                  :src="avatarUrl" 
                  :alt="profile.name || profile.email"
                  class="w-32 h-32 rounded-full border-4 border-slate-700 object-cover mx-auto"
                />
                <button 
                  @click="showAvatarUrlInput = !showAvatarUrlInput"
                  class="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                  </svg>
                </button>
              </div>
              
              <div v-if="showAvatarUrlInput" class="mt-4">
                <input 
                  v-model="editableProfile.avatar"
                  type="url"
                  placeholder="Enter avatar URL"
                  class="input-field"
                />
                <p class="text-xs text-slate-400 mt-2">Or leave blank for default</p>
              </div>

              <h2 class="text-xl font-bold text-white mt-4">{{ profile.name || 'No name set' }}</h2>
              <p class="text-slate-400 text-sm">{{ profile.email }}</p>
              <div class="mt-2">
                <span class="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                  {{ profile.role || 'Member' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="card mt-6">
            <h3 class="text-white font-semibold mb-4">Account Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-slate-400 text-sm">Member since</span>
                <span class="text-white text-sm font-medium">{{ formatDate(profile.created_at) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400 text-sm">Last login</span>
                <span class="text-white text-sm font-medium">{{ formatDate(profile.last_login) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="lg:col-span-2">
          <div class="card">
            <h3 class="text-white font-semibold text-lg mb-6">Personal Information</h3>
            
            <form @submit.prevent="updateProfile" class="space-y-6">
              <!-- Name -->
              <div>
                <label class="label">Full Name</label>
                <input 
                  v-model="editableProfile.name"
                  type="text"
                  placeholder="Enter your full name"
                  class="input-field"
                />
              </div>

              <!-- Email (Read-only) -->
              <div>
                <label class="label">Email Address</label>
                <input 
                  :value="profile.email"
                  type="email"
                  disabled
                  class="input-field opacity-50 cursor-not-allowed"
                />
                <p class="text-xs text-slate-400 mt-1">Email cannot be changed</p>
              </div>

              <!-- Bio -->
              <div>
                <label class="label">Bio</label>
                <textarea 
                  v-model="editableProfile.bio"
                  placeholder="Tell us about yourself..."
                  rows="4"
                  class="input-field"
                ></textarea>
              </div>

              <!-- Department -->
              <div>
                <label class="label">Department</label>
                <input 
                  v-model="editableProfile.department"
                  type="text"
                  placeholder="e.g., Engineering, Marketing"
                  class="input-field"
                />
              </div>

              <!-- Phone -->
              <div>
                <label class="label">Phone Number</label>
                <input 
                  v-model="editableProfile.phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  class="input-field"
                />
              </div>

              <!-- Timezone -->
              <div>
                <label class="label">Timezone</label>
                <select v-model="editableProfile.timezone" class="input-field">
                  <option value="">Select timezone</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Australia/Sydney">Sydney (AEDT)</option>
                </select>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                {{ error }}
              </div>

              <!-- Success Message -->
              <div v-if="success" class="bg-emerald-500/10 border border-emerald-500 text-emerald-400 px-4 py-3 rounded-lg text-sm">
                Profile updated successfully!
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                <button 
                  type="submit"
                  :disabled="saving"
                  class="btn-primary flex-1"
                >
                  <span v-if="!saving">Save Changes</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                </button>
                <button 
                  type="button"
                  @click="resetForm"
                  class="btn-secondary"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

// State
const loading = ref(true);
const saving = ref(false);
const error = ref(null);
const success = ref(false);
const showAvatarUrlInput = ref(false);
const profile = ref({
  id: '',
  email: '',
  name: '',
  bio: '',
  avatar: '',
  role: '',
  department: '',
  phone: '',
  timezone: '',
  created_at: '',
  last_login: ''
});
const editableProfile = ref({
  name: '',
  bio: '',
  avatar: '',
  department: '',
  phone: '',
  timezone: ''
});

// Computed
const avatarUrl = computed(() => {
  if (editableProfile.value.avatar) {
    return editableProfile.value.avatar;
  }
  const name = profile.value.name || profile.value.email || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128`;
});

// Methods
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userStore.token}`
});

async function loadProfile() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to load profile');
    }

    const data = await response.json();
    profile.value = data.user;
    
    // Populate editable fields
    editableProfile.value = {
      name: data.user.name || '',
      bio: data.user.bio || '',
      avatar: data.user.avatar || '',
      department: data.user.department || '',
      phone: data.user.phone || '',
      timezone: data.user.timezone || ''
    };
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function updateProfile() {
  saving.value = true;
  error.value = null;
  success.value = false;

  try {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(editableProfile.value)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to update profile');
    }

    success.value = true;
    await loadProfile(); // Reload profile
    
    // Update user store
    await userStore.fetchUserProfile();

    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = false;
    }, 3000);
  } catch (err) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
}

function resetForm() {
  editableProfile.value = {
    name: profile.value.name || '',
    bio: profile.value.bio || '',
    avatar: profile.value.avatar || '',
    department: profile.value.department || '',
    phone: profile.value.phone || '',
    timezone: profile.value.timezone || ''
  };
  error.value = null;
  success.value = false;
  showAvatarUrlInput.value = false;
}

function formatDate(dateStr) {
  if (!dateStr) return 'Not available';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Lifecycle
onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.profile-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
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

.input-field::placeholder {
  color: #64748b;
}

.btn-primary {
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
  transform: none;
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

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }
}
</style>