<template>
  <div class="bg-slate-900/90 rounded-lg p-4 mb-3 border border-slate-700/50 shadow-xl">
    <form @submit.prevent="handleSubmit" class="space-y-3">
      <!-- Title Input -->
      <div>
        <input
          v-model="form.title"
          type="text"
          placeholder="Task title..."
          class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
          autofocus
        />
      </div>

      <!-- Description Textarea -->
      <div>
        <textarea
          v-model="form.description"
          placeholder="Description (optional)..."
          rows="2"
          class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        ></textarea>
      </div>

      <!-- Assignee Dropdown -->
      <div>
        <label class="block text-xs text-slate-400 mb-1 ml-1">
          Assign to
          <span v-if="loadingMembers" class="ml-2 text-blue-400">(Loading...)</span>
        </label>
        <select
          v-model="form.assignee_id"
          class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          :disabled="loadingMembers"
        >
          <option value="">Unassigned</option>
          <option 
            v-for="member in projectMembers" 
            :key="member.id" 
            :value="member.id"
          >
            {{ member.name || member.email }} 
            <span v-if="member.project_role" class="text-slate-400">
              ({{ member.project_role }})
            </span>
          </option>
        </select>
      </div>

      <!-- Priority and Type Row -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs text-slate-400 mb-1 ml-1">Priority</label>
          <select
            v-model="form.priority"
            class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1 ml-1">Type</label>
          <select
            v-model="form.type"
            class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="improvement">Improvement</option>
            <option value="story">Story</option>
          </select>
        </div>
      </div>

      <!-- Due Date -->
      <div>
        <label class="block text-xs text-slate-400 mb-1 ml-1">Due Date</label>
        <input
          v-model="form.due_date"
          type="date"
          class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 pt-1">
        <button
          type="submit"
          class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loadingMembers"
        >
          Add Task
        </button>
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../../stores/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

const route = useRoute();
const userStore = useUserStore();

const props = defineProps({
  columnId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['add-task', 'cancel']);

// State
const form = ref({
  title: '',
  description: '',
  assignee_id: '',
  priority: 'medium',
  type: 'task',
  due_date: ''
});

const projectMembers = ref([]);
const loadingMembers = ref(false);

// Fetch project members
async function fetchProjectMembers() {
  const projectId = route.params.projectId;
  
  if (!projectId) {
    console.warn('No project ID available');
    return;
  }

  loadingMembers.value = true;

  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/members`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to fetch members');
    }

    const data = await response.json();
    projectMembers.value = data.members || [];
    
  } catch (error) {
    console.error('Failed to fetch project members:', error);
    projectMembers.value = [];
  } finally {
    loadingMembers.value = false;
  }
}

const handleSubmit = () => {
  if (!form.value.title.trim()) {
    return;
  }

  // Emit the task data
  emit('add-task', {
    ...form.value,
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    assignee_id: form.value.assignee_id || null // Ensure null if empty
  });

  // Reset form
  form.value = {
    title: '',
    description: '',
    assignee_id: '',
    priority: 'medium',
    type: 'task',
    due_date: ''
  };
};

// Load members when component mounts
onMounted(() => {
  fetchProjectMembers();
});

// Reload members if project changes
watch(() => route.params.projectId, (newProjectId) => {
  if (newProjectId) {
    fetchProjectMembers();
  }
});
</script>