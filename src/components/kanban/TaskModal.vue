<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-white">Create New Task</h2>
            <button @click="$emit('close')" class="text-slate-400 hover:text-white text-2xl">&times;</button>
          </div>

          <form @submit.prevent="handleSave" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase mb-1">Task Title</label>
              <input v-model="form.title" type="text" placeholder="What needs to be done?" class="form-input" required />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase mb-1">Priority</label>
                <select v-model="form.priority" class="form-input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase mb-1">Due Date</label>
                <input v-model="form.dueDate" type="date" class="form-input" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase mb-1">Description</label>
              <textarea v-model="form.description" rows="3" class="form-input" placeholder="Add more details..."></textarea>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="$emit('close')" class="px-4 py-2 text-slate-300 hover:text-white">Cancel</button>
              <button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition">
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive } from 'vue';

defineProps({ isOpen: Boolean });
const emit = defineEmits(['close', 'save']);

const form = reactive({
  title: '',
  priority: 'medium',
  dueDate: '',
  description: ''
});

const handleSave = () => {
  emit('save', { ...form, id: Date.now() });
  form.title = '';
  form.description = '';
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: #1e293b;
  border: 1px solid #334155;
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.form-input {
  @apply w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition;
}

/* Vue Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>