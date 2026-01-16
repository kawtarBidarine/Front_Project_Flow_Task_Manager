<template>
  <div v-if="!$route.meta.hideShell" class="app-layout">
    <AppHeader />
    <AppSidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>

  <router-view v-else />
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useProjectStore } from '@/stores/project';
import AppHeader from './components/layout/AppHeader.vue';
import AppSidebar from './components/layout/AppSidebar.vue';

const router = useRouter();
const userStore = useUserStore();
const projectStore = useProjectStore();

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
</script>

<style scoped>
.app-layout {
  display: grid;
  grid-template-rows: 60px 1fr;
  grid-template-columns: 240px 1fr;
  height: 100vh;
  background: #0f172a;
  color: white;
}

.main-content {
  background: #0f172a;
  padding: 1rem;
  overflow-x: auto;
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .app-layout {
    grid-template-columns: 1fr;
  }
}
</style>