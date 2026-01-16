<template>
  <div v-if="!$route.meta.hideShell" class="app-layout">
    <AppHeader @toggle-sidebar="toggleSidebar" :is-sidebar-open="isSidebarOpen" />
    
    <!-- Mobile Overlay -->
    <transition name="overlay">
      <div 
        v-if="isSidebarOpen && isMobile" 
        class="sidebar-overlay"
        @click="closeSidebar"
      ></div>
    </transition>
    
    <!-- Sidebar with mobile slide animation -->
    <transition name="sidebar-slide">
      <AppSidebar 
        v-show="!isMobile || isSidebarOpen"
        :class="{ 'sidebar-mobile': isMobile }"
        @close="closeSidebar"
      />
    </transition>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>

  <router-view v-else />
</template>

<script setup>
import { onMounted, watch, ref, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useProjectStore } from '@/stores/project';
import AppHeader from './components/layout/AppHeader.vue';
import AppSidebar from './components/layout/AppSidebar.vue';

const router = useRouter();
const userStore = useUserStore();
const projectStore = useProjectStore();

// Mobile sidebar state
const isSidebarOpen = ref(false);
const windowWidth = ref(window.innerWidth);

const isMobile = computed(() => windowWidth.value < 1024);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  // Close sidebar when switching to desktop
  if (!isMobile.value) {
    isSidebarOpen.value = false;
  }
};

onMounted(async () => {
  console.log('App initializing...');
  
  // Initialize user ONLY ONCE on app mount
  await userStore.initialize();
  
  // Preload projects if authenticated and not on login page
  if (userStore.token && !router.currentRoute.value.meta.hideShell) {
    projectStore.fetchProjects().catch(err => {
      console.error('Failed to preload projects:', err);
    });
  }

  // Add resize listener
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

// Watch for authentication changes
watch(() => userStore.token, (newToken, oldToken) => {
  // User just logged in
  if (newToken && !oldToken) {
    projectStore.fetchProjects();
  } 
  // User just logged out
  else if (!newToken && oldToken) {
    projectStore.$reset();
  }
}, { immediate: false });

// Close sidebar on route change (mobile)
watch(() => router.currentRoute.value.path, () => {
  if (isMobile.value) {
    closeSidebar();
  }
});
</script>

<style scoped>
.app-layout {
  display: grid;
  grid-template-rows: 60px 1fr;
  grid-template-columns: 240px 1fr;
  height: 100vh;
  background: #0f172a;
  color: white;
  position: relative;
}

.main-content {
  background: #0f172a;
  padding: 1rem;
  overflow-x: auto;
  overflow-y: auto;
}

/* Mobile Overlay */
.sidebar-overlay {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 998;
}

/* Mobile Sidebar */
.sidebar-mobile {
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  z-index: 999;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
}

/* Sidebar Slide Animation */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}

/* Overlay Fade Animation */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Tablet and Desktop */
@media (min-width: 1024px) {
  .app-layout {
    grid-template-columns: 240px 1fr;
  }
  
  .sidebar-mobile {
    position: static;
    width: auto;
    max-width: none;
    box-shadow: none;
  }
}

/* Mobile */
@media (max-width: 1023px) {
  .app-layout {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    padding: 0.75rem;
  }
}

/* Small Mobile */
@media (max-width: 640px) {
  .main-content {
    padding: 0.5rem;
  }
}
</style>