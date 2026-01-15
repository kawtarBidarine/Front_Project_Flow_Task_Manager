<template>
  <div class="min-h-screen bg-slate-900 p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-white">Project Calendar</h1>
          <p class="text-slate-400 text-sm">Schedule deadlines and track team availability.</p>
        </div>
        <div class="flex items-center gap-4">
          <!-- Project Filter -->
          <select 
            v-model="selectedProject"
            @change="loadEvents"
            class="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option :value="null">All Projects</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
          
          <!-- Month Navigation -->
          <div class="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1">
            <button @click="navigateMonth(-1)" class="nav-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <span class="px-4 text-sm font-semibold text-white min-w-[140px] text-center">{{ monthYear }}</span>
            <button @click="navigateMonth(1)" class="nav-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && events.length === 0" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Calendar Grid -->
      <div v-else class="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div class="grid grid-cols-7 border-b border-slate-700 bg-slate-700/30">
          <div v-for="day in weekDays" :key="day" class="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {{ day }}
          </div>
        </div>

        <div class="grid grid-cols-7">
          <div 
            v-for="(dateObj, index) in calendarDays" 
            :key="index" 
            class="min-h-[120px] border-b border-r border-slate-700 p-2 transition-colors relative group"
            :class="[
              !dateObj.currentMonth ? 'bg-slate-900/40' : 'hover:bg-slate-700/20',
              index % 7 === 6 ? 'border-r-0' : ''
            ]"
          >
            <div class="flex justify-between items-start mb-2">
              <span 
                :class="[
                  'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                  isToday(dateObj.date) ? 'bg-blue-600 text-white' : 
                  dateObj.currentMonth ? 'text-slate-300' : 'text-slate-600'
                ]"
              >
                {{ dateObj.day }}
              </span>
              <button
                v-if="dateObj.currentMonth"
                @click="handleAddEvent(dateObj.date)"
                class="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>

            <div class="space-y-1">
              <div 
                v-for="event in getEventsForDate(dateObj.date)" 
                :key="event.id" 
                @click="handleEditEvent(event)"
                class="px-2 py-1 rounded text-[10px] font-medium truncate flex justify-between items-center group/event cursor-pointer"
                :class="eventColor(event.type)"
              >
                <span class="truncate">{{ event.title }}</span>
                <button
                  @click.stop="deleteEvent(event.id)"
                  class="opacity-0 group-hover/event:opacity-100 ml-1 flex-shrink-0 hover:scale-110 transition-transform"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Event Modal -->
    <div v-if="showEventModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="closeModal">
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-white mb-4">
          {{ editingEvent ? 'Edit Event' : 'Add Event' }}
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Event Title</label>
            <input
              v-model="eventForm.title"
              type="text"
              class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter event title"
              @keyup.enter="saveEvent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
            <textarea
              v-model="eventForm.description"
              class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
              rows="2"
              placeholder="Event description"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Event Type</label>
              <select
                v-model="eventForm.type"
                class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="work">Work Session</option>
                <option value="review">Review</option>
                <option value="milestone">Milestone</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Project (Optional)</label>
              <select
                v-model="eventForm.projectId"
                class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option :value="null">None</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
            <input
              v-model="eventForm.startTime"
              type="datetime-local"
              class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">End Time (Optional)</label>
            <input
              v-model="eventForm.endTime"
              type="datetime-local"
              class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="flex gap-3 pt-2">
            <button
              @click="saveEvent"
              :disabled="saving || !eventForm.title.trim()"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded font-medium transition-colors flex items-center justify-center"
            >
              <span v-if="!saving">{{ editingEvent ? 'Update' : 'Add' }} Event</span>
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
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// State
const currentDate = ref(new Date());
const events = ref([]);
const projects = ref([]);
const selectedProject = ref(null);
const showEventModal = ref(false);
const selectedDate = ref(null);
const editingEvent = ref(null);
const loading = ref(false);
const saving = ref(false);

const eventForm = ref({
  title: '',
  description: '',
  type: 'meeting',
  startTime: '',
  endTime: '',
  projectId: null
});

// Helper: Get auth headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userStore.token}`
});

// Format date to ISO string for datetime-local input
const formatDateTimeLocal = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Computed
const monthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  
  const firstDayOfWeek = firstDay.getDay();
  const lastDate = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();
  
  const days = [];
  
  // Previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevLastDate - i,
      currentMonth: false,
      date: new Date(year, month - 1, prevLastDate - i),
    });
  }
  
  // Current month days
  for (let i = 1; i <= lastDate; i++) {
    days.push({
      day: i,
      currentMonth: true,
      date: new Date(year, month, i),
    });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      currentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }
  
  return days;
});

// Methods
const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

const getEventsForDate = (date) => {
  const dateStr = date.toISOString().split('T')[0];
  return events.value.filter(event => {
    const eventDate = new Date(event.startTime).toISOString().split('T')[0];
    return eventDate === dateStr;
  });
};

const navigateMonth = (direction) => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(), 
    currentDate.value.getMonth() + direction, 
    1
  );
  loadEvents();
};

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

const loadEvents = async () => {
  loading.value = true;
  
  try {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    
    let url = `${API_URL}/calendar/events?start=${startDate}&end=${endDate}`;
    
    if (selectedProject.value) {
      url += `&project_id=${selectedProject.value}`;
    }
    
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to load events');
    
    const data = await response.json();
    events.value = data.events || [];
  } catch (error) {
    console.error('Error loading events:', error);
  } finally {
    loading.value = false;
  }
};

const handleAddEvent = (date) => {
  selectedDate.value = date;
  editingEvent.value = null;
  
  const dateTime = new Date(date);
  dateTime.setHours(9, 0, 0, 0); // Default to 9 AM
  
  eventForm.value = {
    title: '',
    description: '',
    type: 'meeting',
    startTime: formatDateTimeLocal(dateTime),
    endTime: '',
    projectId: selectedProject.value
  };
  
  showEventModal.value = true;
};

const handleEditEvent = (event) => {
  editingEvent.value = event;
  
  eventForm.value = {
    title: event.title,
    description: event.description || '',
    type: event.type,
    startTime: formatDateTimeLocal(event.startTime),
    endTime: event.endTime ? formatDateTimeLocal(event.endTime) : '',
    projectId: event.projectId
  };
  
  showEventModal.value = true;
};

const saveEvent = async () => {
  if (!eventForm.value.title.trim() || saving.value) return;
  
  saving.value = true;
  
  try {
    const payload = {
      title: eventForm.value.title.trim(),
      description: eventForm.value.description.trim(),
      type: eventForm.value.type,
      startTime: new Date(eventForm.value.startTime).toISOString(),
      endTime: eventForm.value.endTime ? new Date(eventForm.value.endTime).toISOString() : null,
      projectId: eventForm.value.projectId
    };
    
    let response;
    
    if (editingEvent.value) {
      // Update existing event
      response = await fetch(`${API_URL}/calendar/events/${editingEvent.value.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
    } else {
      // Create new event
      response = await fetch(`${API_URL}/calendar/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save event');
    }
    
    await loadEvents();
    closeModal();
  } catch (error) {
    console.error('Error saving event:', error);
    alert(error.message || 'Failed to save event. Please try again.');
  } finally {
    saving.value = false;
  }
};

const deleteEvent = async (eventId) => {
  if (!confirm('Are you sure you want to delete this event?')) return;
  
  try {
    const response = await fetch(`${API_URL}/calendar/events/${eventId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to delete event');
    
    events.value = events.value.filter(e => e.id !== eventId);
  } catch (error) {
    console.error('Error deleting event:', error);
    alert('Failed to delete event. Please try again.');
  }
};

const closeModal = () => {
  showEventModal.value = false;
  editingEvent.value = null;
  eventForm.value = {
    title: '',
    description: '',
    type: 'meeting',
    startTime: '',
    endTime: '',
    projectId: null
  };
};

const eventColor = (type) => {
  switch (type) {
    case 'meeting': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    case 'deadline': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
    case 'work': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'review': return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'milestone': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    default: return 'bg-slate-700 text-slate-300';
  }
};

// Lifecycle
onMounted(async () => {
  await loadProjects();
  await loadEvents();
});
</script>

<style scoped>
.nav-btn {
  @apply w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors;
}
</style>