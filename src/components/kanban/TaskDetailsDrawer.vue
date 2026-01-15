<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="isOpen" class="drawer-overlay" @click="handleOverlayClick">
        <div class="drawer-panel" @click.stop>
          <div class="drawer-header">
            <div class="header-badges">
              <div class="type-badge" :class="getTypeBadgeClass(localTask.type)">
                {{ localTask.type || 'task' }}
              </div>
            </div>
            <button @click="$emit('close')" class="close-btn">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="drawer-content">
            <div class="title-section">
              <input
                v-if="isEditingTitle"
                v-model="localTask.title"
                @blur="saveTitle"
                @keyup.enter="saveTitle"
                @keyup.escape="cancelTitleEdit"
                class="title-input"
                ref="titleInput"
              />
              <h2 v-else @click="startEditTitle" class="task-title-editable">
                {{ localTask.title }}
              </h2>
            </div>

            <div class="fields-grid">
              <div class="field-row">
                <label class="field-label">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Assignee
                </label>
                <select v-model="localTask.assignee_id" class="field-select">
                  <option :value="null">Unassigned</option>
                  <option v-for="member in projectMembers" :key="member.id" :value="member.id">
                    {{ member.name || member.email }}
                  </option>
                </select>
              </div>

              <div class="field-row">
                <label class="field-label">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Due Date
                </label>
                <input
                  :value="formatDateForInput(localTask.due_date)"
                  @input="localTask.due_date = $event.target.value"
                  type="date"
                  class="field-input"
                  :class="getDueDateClass(localTask.due_date)"
                />
              </div>

              <div class="field-row">
                <label class="field-label">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                  Priority
                </label>
                <select v-model="localTask.priority" class="field-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div v-if="milestones && milestones.length > 0" class="field-row">
                <label class="field-label">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Milestone
                </label>
                <select v-model="localTask.milestone_id" class="field-select">
                  <option :value="null">No Milestone</option>
                  <option v-for="milestone in milestones" :key="milestone.id" :value="milestone.id">
                    {{ milestone.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <h3 class="section-title">Description</h3>
              </div>
              <textarea
                v-model="localTask.description"
                placeholder="Add a description..."
                class="description-textarea"
                rows="6"
              />
            </div>
          </div>

          <div class="drawer-footer">
            <button @click="handleDelete" class="delete-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            
            <button 
              @click="handleSaveAll" 
              class="save-btn" 
              :disabled="!canSave"
            >
              <span v-if="isSaving" class="spinner-small"></span>
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  task: { type: Object, required: true },
  projectMembers: { type: Array, default: () => [] },
  milestones: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'update', 'delete']);

const localTask = ref({ ...props.task });
const isEditingTitle = ref(false);
const titleInput = ref(null);

const isSaving = ref(false);

const canSave = computed(() => {
  return hasChanges.value && !isSaving.value;
});

const hasChanges = computed(() => {
  return JSON.stringify(localTask.value) !== JSON.stringify(props.task);
});

watch(() => props.task, (newTask) => {
  if (newTask) localTask.value = { ...newTask };
}, { deep: true, immediate: true });

const formatDateForInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

const getTypeBadgeClass = (type) => {
  const map = { bug: 'type-bug', feature: 'type-feature', improvement: 'type-improvement' };
  return map[type] || 'type-task';
};

const getDueDateClass = (date) => {
  if (!date) return '';
  const diff = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
  return diff < 0 ? 'overdue' : diff < 3 ? 'due-soon' : '';
};

const startEditTitle = () => {
  isEditingTitle.value = true;
  nextTick(() => titleInput.value?.focus());
};

const saveTitle = () => {
  isEditingTitle.value = false;
};

const cancelTitleEdit = () => {
  localTask.value.title = props.task.title;
  isEditingTitle.value = false;
};

const handleSaveAll = async () => {
  if (!canSave.value) return;

  isSaving.value = true;
  
  try {
    emit('update', {
      taskId: localTask.value.id,
      updates: { ...localTask.value }
    });
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this task?')) {
    emit('delete', localTask.value);
  }
};

const handleOverlayClick = () => {
  emit('close');
};
</script>

<style scoped>
/* Overlay */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

/* Drawer Panel */
.drawer-panel {
  width: 100%;
  max-width: 600px;
  background: #1e293b;
  border-left: 1px solid #334155;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.4);
}

/* Header */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
}

.header-badges {
  display: flex;
  gap: 0.5rem;
}

.type-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.type-bug { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.type-feature { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
.type-improvement { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.type-task { background: rgba(100, 116, 139, 0.2); color: #94a3b8; }

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(71, 85, 105, 0.3);
  color: #e2e8f0;
}

/* Content */
.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.drawer-content::-webkit-scrollbar {
  width: 8px;
}

.drawer-content::-webkit-scrollbar-track {
  background: transparent;
}

.drawer-content::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

/* Title */
.title-section {
  margin-bottom: 1.5rem;
}

.task-title-editable {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
  line-height: 1.3;
  cursor: text;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.task-title-editable:hover {
  background: rgba(71, 85, 105, 0.2);
}

.title-input {
  width: 100%;
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
  background: rgba(71, 85, 105, 0.3);
  border: 2px solid #3b82f6;
  border-radius: 0.375rem;
  padding: 0.5rem;
  outline: none;
}

/* Fields Grid */
.fields-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.field-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 1rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
}

.field-input,
.field-select {
  padding: 0.5rem 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid #334155;
  border-radius: 0.375rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.field-input:focus,
.field-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(15, 23, 42, 0.8);
}

.field-input.overdue {
  border-color: #ef4444;
  color: #fca5a5;
}

.field-input.due-today {
  border-color: #f59e0b;
  color: #fbbf24;
}

.field-input.due-soon {
  border-color: #eab308;
  color: #fde047;
}

/* Section */
.section {
  margin-bottom: 2rem;
}

.section-header {
  margin-bottom: 0.75rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comment-badge {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
}

/* Description */
.description-textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.2s;
}

.description-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(15, 23, 42, 0.8);
}

.description-textarea::placeholder {
  color: #64748b;
}

/* Activity */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
}

.activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #cbd5e1;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.activity-user {
  font-weight: 600;
  color: #e2e8f0;
}

.activity-time {
  color: #64748b;
  font-size: 0.75rem;
}

/* Comments */
.comment-input-wrapper {
  position: relative;
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  padding-right: 5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(15, 23, 42, 0.8);
}

.comment-btn {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  padding: 0.375rem 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.comment-btn:hover:not(:disabled) {
  background: #2563eb;
}

.comment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-hint {
  margin-top: 0.5rem;
  color: #64748b;
  font-size: 0.75rem;
}

/* Footer */
.drawer-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #334155;
  flex-shrink: 0;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #fca5a5;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .drawer-panel {
    max-width: 100%;
  }

  .field-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
.drawer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #334155;
  background: #1e293b;
}

.save-btn {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 600;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #64748b;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
}
.save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>