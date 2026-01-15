<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <!-- 404 Animation -->
      <div class="error-code">
        <span class="digit">4</span>
        <span class="digit pulse">0</span>
        <span class="digit">4</span>
      </div>

      <!-- Error Icon -->
      <div class="error-icon">
        <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <!-- Error Messages -->
      <h1 class="error-title">{{ errorTitle }}</h1>
      <p class="error-description">{{ errorDescription }}</p>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="goBack" class="btn-secondary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
        
        <router-link to="/dashboard" class="btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go to Dashboard
        </router-link>
        
        <router-link to="/projects" class="btn-accent">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          View All Projects
        </router-link>
      </div>

      <!-- Helpful Links -->
      <div class="helpful-links">
        <p class="links-title">You might be looking for:</p>
        <div class="links-grid">
          <router-link to="/projects" class="link-card">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            All Projects
          </router-link>
          
          <router-link to="/my-tasks" class="link-card">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Tasks
          </router-link>
          
          <router-link to="/calendar" class="link-card">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar
          </router-link>
          
          <router-link to="/reports" class="link-card">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Reports
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Determine error type
const isProjectError = computed(() => {
  return route.path.includes('/projects/');
});

const errorTitle = computed(() => {
  if (isProjectError.value) {
    return 'Project Not Found';
  }
  return 'Page Not Found';
});

const errorDescription = computed(() => {
  if (isProjectError.value) {
    return 'The project you\'re looking for doesn\'t exist or you don\'t have access to it.';
  }
  return 'The page you\'re looking for doesn\'t exist or has been moved.';
});

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/dashboard');
  }
};
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.not-found-container {
  max-width: 600px;
  width: 100%;
  text-align: center;
}

/* 404 Code */
.error-code {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.digit {
  font-size: 8rem;
  font-weight: 900;
  color: #3b82f6;
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  line-height: 1;
}

.digit.pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

/* Error Icon */
.error-icon {
  color: #64748b;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

/* Error Text */
.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 1rem;
}

.error-description {
  font-size: 1.125rem;
  color: #94a3b8;
  margin-bottom: 3rem;
  line-height: 1.6;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.btn-primary,
.btn-secondary,
.btn-accent {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
  border: 1px solid rgba(71, 85, 105, 0.5);
}

.btn-secondary:hover {
  background: rgba(71, 85, 105, 0.5);
}

.btn-accent {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.btn-accent:hover {
  background: rgba(16, 185, 129, 0.3);
}

/* Helpful Links */
.helpful-links {
  padding-top: 3rem;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.links-title {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.75rem;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s;
}

.link-card:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .digit {
    font-size: 5rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-description {
    font-size: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary,
  .btn-accent {
    width: 100%;
    justify-content: center;
  }

  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>