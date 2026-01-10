<template>
  <div class="add-task-form">
    <input
      v-model="newTask.title"
      type="text"
      placeholder="Task title (required)"
      class="form-input"
      ref="titleInput"
      @keyup.enter="addTask"
    />
    <textarea
      v-model="newTask.description"
      placeholder="Description"
      class="form-textarea"
      rows="2"
    ></textarea>
    <select v-model="newTask.priority" class="form-select">
      <option value="low">Low Priority</option>
      <option value="medium">Medium Priority</option>
      <option value="high">High Priority</option>
    </select>
    <div class="flex gap-2">
      <button @click="addTask" class="btn-primary">
        Add Task
      </button>
      <button @click="$emit('cancel')" class="btn-secondary">
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

defineProps({
  columnId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['add-task', 'cancel']);

const titleInput = ref(null);
const newTask = ref({
  title: '',
  description: '',
  priority: 'medium'
});

const addTask = () => {
  if (!newTask.value.title.trim()) {
    titleInput.value?.focus();
    return;
  }
  
  emit('add-task', { ...newTask.value });
  newTask.value = { title: '', description: '', priority: 'medium' };
};

onMounted(() => {
  titleInput.value?.focus();
});
</script>

<style scoped>
.add-task-form {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(51, 65, 85, 0.5);
  border-radius: 0.5rem;
  border: 1px solid #475569;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.3);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  background: #1e293b;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid #475569;
  outline: none;
  transition: border-color 0.2s;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #64748b;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #3b82f6;
}

.form-textarea {
  resize: none;
}

.btn-primary {
  flex: 1;
  background: #2563eb;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.5);
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  padding: 0.375rem 0.75rem;
  background: #475569;
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: background 0.2s;
  border: none;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #64748b;
}
</style>