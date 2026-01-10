<template>
  <div class="milestones-container">
    <div class="mb-10">
      <h1 class="text-2xl font-bold text-white">Project Roadmap</h1>
      <p class="text-slate-400 text-sm mt-1">Tracking major project phases and delivery goals.</p>
    </div>

    <div class="relative">
      <div class="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-slate-700"></div>

      <div class="space-y-12">
        <div v-for="(milestone, index) in milestones" :key="milestone.id" class="relative pl-12 md:pl-20">
          
          <div 
            class="absolute left-0 md:left-4 top-0 w-8 h-8 rounded-full border-4 border-[#0f172a] flex items-center justify-center z-10"
            :class="getStatusColor(milestone.status)"
          >
            <div v-if="milestone.status === 'completed'" class="w-2 h-2 bg-white rounded-full"></div>
            <div v-else-if="milestone.status === 'active'" class="w-2 h-2 bg-white animate-pulse rounded-full"></div>
            <div v-else class="w-2 h-2 bg-slate-600 rounded-full"></div>
          </div>

          <div class="bg-slate-800/40 border border-slate-700 p-6 rounded-xl hover:border-slate-500 transition-colors">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <span 
                  class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2 inline-block"
                  :class="milestone.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : milestone.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-400'"
                >
                  {{ milestone.status.replace('-', ' ') }}
                </span>
                <h3 class="text-lg font-semibold text-white">{{ milestone.title }}</h3>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-500 uppercase font-semibold">Target Date</p>
                <p class="text-sm text-slate-300">{{ milestone.date }}</p>
              </div>
            </div>

            <p class="text-slate-400 text-sm mb-6 leading-relaxed">
              {{ milestone.description }}
            </p>

            <div class="space-y-2">
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-400">Phase Progress</span>
                <span class="text-white font-medium">{{ milestone.progress }}%</span>
              </div>
              <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  class="h-full transition-all duration-1000" 
                  :class="milestone.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'"
                  :style="{ width: milestone.progress + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const milestones = ref([
  {
    id: 1,
    title: 'Research & Discovery Phase',
    description: 'Stakeholder interviews, user persona creation, and competitive analysis. Finalizing the core requirements for the ERP integration.',
    date: 'Jan 15, 2026',
    status: 'completed',
    progress: 100
  },
  {
    id: 2,
    title: 'UI/UX Design Framework',
    description: 'Developing high-fidelity wireframes and the Design System. Setting up the Tailwind CSS configuration and core component library.',
    date: 'Feb 10, 2026',
    status: 'active',
    progress: 65
  },
  {
    id: 3,
    title: 'Backend API Integration',
    description: 'Connecting the frontend to the Node.js microservices. Implementing authentication and real-time task synchronization.',
    date: 'Mar 05, 2026',
    status: 'locked',
    progress: 0
  },
  {
    id: 4,
    title: 'User Acceptance Testing (UAT)',
    description: 'Internal testing with the QA team and final adjustments based on stakeholder feedback before the final deployment.',
    date: 'Apr 20, 2026',
    status: 'locked',
    progress: 0
  }
]);

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    case 'active': return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
    default: return 'bg-slate-700';
  }
};
</script>

<style scoped>
.milestones-container {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 4rem;
}
</style>