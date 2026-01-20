<template>
  <!-- Global Loading Screen -->
  <div v-if="isInitializing" class="loading-screen">
    <div class="loading-content">
      <div class="spinner"></div>
      <p class="loading-text">Loading...</p>
    </div>
  </div>

  <!-- App Content -->
  <div v-else>
    <div v-if="!$route.meta.hideShell && userStore.token" class="app-layout">
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
  </div>
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

const isInitializing = ref(true);

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
  if (!isMobile.value) {
    isSidebarOpen.value = false;
  }
};

onMounted(async () => {
  console.log('App initializing...');
  
  try {
    await userStore.initialize();
    
    if (userStore.token && !router.currentRoute.value.meta.hideShell) {
      await projectStore.fetchProjects().catch(err => {
        console.error('Failed to preload projects:', err);
      });
    }
  } catch (error) {
    console.error('App initialization error:', error);
  } finally {
    isInitializing.value = false;
  }

  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

watch(() => userStore.token, (newToken, oldToken) => {
  if (newToken && !oldToken) {
    projectStore.fetchProjects();
  } 
  else if (!newToken && oldToken) {
    projectStore.$reset();
  }
}, { immediate: false });

watch(() => router.currentRoute.value.path, () => {
  if (isMobile.value) {
    closeSidebar();
  }
});
</script>

<style scoped>
/* Loading Screen */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

/* App Layout */
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