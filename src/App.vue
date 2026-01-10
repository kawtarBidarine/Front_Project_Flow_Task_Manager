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
import AppHeader from './components/layout/AppHeader.vue';
import AppSidebar from './components/layout/AppSidebar.vue';
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