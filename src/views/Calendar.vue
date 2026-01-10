<template>
  <div class="min-h-screen bg-slate-900 p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-white">Project Calendar</h1>
          <p class="text-slate-400 text-sm">Schedule deadlines and track team availability.</p>
        </div>
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

      <div class="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
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
                class="px-2 py-1 rounded text-[10px] font-medium truncate flex justify-between items-center group/event"
                :class="eventColor(event.type)"
              >
                <span class="truncate">{{ event.title }}</span>
                <button
                  @click="deleteEvent(event.id)"
                  class="opacity-0 group-hover/event:opacity-100 ml-1 flex-shrink-0"
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

    <!-- Add Event Modal -->
    <div v-if="showAddEvent" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-white mb-4">Add Event</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Event Title</label>
            <input
              v-model="newEvent.title"
              type="text"
              class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter event title"
              @keyup.enter="saveEvent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Event Type</label>
            <select
              v-model="newEvent.type"
              class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="work">Work</option>
            </select>
          </div>
          <div class="flex gap-3 pt-2">
            <button
              @click="saveEvent"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition-colors"
            >
              Add Event
            </button>
            <button
              @click="showAddEvent = false"
              class="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-medium transition-colors"
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
import { ref, computed } from 'vue';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const currentDate = ref(new Date(2026, 0, 1)); // January 2026
const events = ref([
  { id: 1, date: '2026-01-01', title: 'New Year Kickoff', type: 'meeting' },
  { id: 2, date: '2026-01-05', title: 'Sprint Planning', type: 'work' },
  { id: 3, date: '2026-01-09', title: 'ERP Integration', type: 'deadline' },
  { id: 4, date: '2026-01-12', title: 'Review Meeting', type: 'meeting' },
]);
const showAddEvent = ref(false);
const selectedDate = ref(null);
const newEvent = ref({ title: '', type: 'meeting' });

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

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

const getEventsForDate = (date) => {
  const dateStr = date.toISOString().split('T')[0];
  return events.value.filter(event => event.date === dateStr);
};

const navigateMonth = (direction) => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(), 
    currentDate.value.getMonth() + direction, 
    1
  );
};

const handleAddEvent = (date) => {
  selectedDate.value = date;
  showAddEvent.value = true;
  newEvent.value = { title: '', type: 'meeting' };
};

const saveEvent = () => {
  if (newEvent.value.title.trim()) {
    const event = {
      id: Date.now(),
      date: selectedDate.value.toISOString().split('T')[0],
      title: newEvent.value.title,
      type: newEvent.value.type,
    };
    events.value.push(event);
    showAddEvent.value = false;
    newEvent.value = { title: '', type: 'meeting' };
  }
};

const deleteEvent = (eventId) => {
  events.value = events.value.filter(e => e.id !== eventId);
};

const eventColor = (type) => {
  switch (type) {
    case 'meeting': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    case 'deadline': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
    case 'work': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    default: return 'bg-slate-700 text-slate-300';
  }
};
</script>

<style scoped>
.nav-btn {
  @apply w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors;
}
</style>