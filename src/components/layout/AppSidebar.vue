<template>
  <aside class="sidebar">
    <nav class="space-y-6">
      <div>
        <h3 class="text-xs font-semibold uppercase text-slate-400 mb-2">Main</h3>
        <ul class="space-y-1 text-sm">
          <li v-for="item in mainItems" :key="item.label">
            <router-link 
              :to="item.path" 
              class="nav-item"
            >
              <img :src="item.icon" alt="" width="18" class="mr-2.5">
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="text-xs font-semibold uppercase text-slate-400 mb-2">Work Overview</h3>
        <ul class="space-y-1 text-sm">
          <li v-for="item in workItems" :key="item.label">
            <router-link 
              :to="item.path" 
              class="nav-item"
            >
              <img :src="item.icon" alt="" width="18" class="mr-2.5">
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="text-xs font-semibold uppercase text-slate-400 mb-2">Recent Projects</h3>
        <ul class="space-y-1 text-xs">
          <li v-for="project in recentProjects" :key="project">
            <a 
              href="#" 
              class="block px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
            >
              {{ project }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue';

const mainItems = ref([
  { label: 'Home', icon: '/home.png', path: '/' },
  { label: 'Discuss', icon: '/conversation.png', path: '/discuss' },
  { label: 'Calendar', icon: '/calendar.png', path: '/calendar' },
  { label: 'Reports', icon: '/report.png', path: '/reports' }
]);

const workItems = ref([
  { label: 'Tasks', icon: '/checklist.png', path: '/tasks' },
  { label: 'Issues', icon: '/report.png', path: '/issues' },
  { label: 'Milestones', icon: '/flag.png', path: '/milestones' }
]);

const recentProjects = ref([
  'Zoho Projects Deployment',
  'ERP Phase VI Integration',
  'Framework Redesign'
]);
</script>

<style scoped>
.sidebar {
  background: #1e293b;
  border-right: 1px solid #334155;
  padding: 1rem;
  overflow-y: auto;
}

/* Base style for nav items */
.nav-item {
  @apply flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition;
}

/* Automatic Active State from Vue Router */
.router-link-active {
  @apply bg-blue-900/40 text-blue-400 font-medium;
}

@media (max-width: 1024px) {
  .sidebar {
    display: none;
  }
}
</style>