<template>
  <div class="h-screen bg-slate-900 p-4">
    <div class="h-full max-w-7xl mx-auto flex bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
      <!-- Sidebar -->
      <div class="w-80 border-r border-slate-700 bg-slate-900/50 hidden md:flex flex-col">
        <div class="p-4 border-b border-slate-700">
          <div class="relative">
            <svg class="absolute left-3 top-2.5 text-slate-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search chats..." 
              v-model="searchQuery"
              class="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
        </div>
        
        <div class="overflow-y-auto flex-1">
          <div 
            v-for="chat in filteredChats" 
            :key="chat.id"
            @click="switchChat(chat)"
            class="p-4 flex items-center gap-3 hover:bg-slate-700/30 cursor-pointer border-l-4 transition-colors"
            :class="chat.active ? 'border-blue-500 bg-slate-700/40' : 'border-transparent'"
          >
            <div class="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-blue-400">
              {{ chat.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline">
                <h4 class="text-sm font-medium text-white truncate">{{ chat.name }}</h4>
                <span class="text-[10px] text-slate-500">{{ chat.time }}</span>
              </div>
              <p class="text-xs text-slate-400 truncate">{{ chat.lastMsg }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col bg-slate-900/20">
        <!-- Header -->
        <div class="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/40">
          <h3 class="text-white font-semibold">
            {{ activeChat.name.includes('Project') ? '# ' : '' }}{{ activeChat.name }}
          </h3>
          <div class="text-xs text-slate-400">{{ onlineMembers }} member{{ onlineMembers > 1 ? 's' : '' }} online</div>
        </div>

        <!-- Messages -->
        <div class="flex-1 p-6 overflow-y-auto space-y-6" ref="messagesContainer">
          <div 
            v-for="msg in activeChat.messages" 
            :key="msg.id" 
            class="flex gap-3"
            :class="msg.isMe ? 'flex-row-reverse' : ''"
          >
            <div 
              v-if="!msg.isMe"
              class="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-blue-400"
            >
              {{ msg.sender ? msg.sender.charAt(0) : 'A' }}
            </div>
            <div class="flex flex-col gap-1">
              <span v-if="!msg.isMe" class="text-xs text-slate-500 px-1">{{ msg.sender }}</span>
              <div 
                class="max-w-md p-3 rounded-2xl text-sm shadow-sm"
                :class="msg.isMe 
                  ? 'bg-blue-600 text-white rounded-br-sm' 
                  : 'bg-slate-700 text-slate-200 rounded-bl-sm'"
              >
                {{ msg.text }}
              </div>
              <span class="text-[10px] text-slate-600 px-1">{{ msg.time }}</span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 bg-slate-800/40 border-t border-slate-700">
          <div class="relative">
            <input 
              type="text" 
              placeholder="Type a message..." 
              v-model="newMessage"
              @keypress.enter="handleSendMessage"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-blue-500" 
            />
            <button 
              @click="handleSendMessage"
              :disabled="!newMessage.trim()"
              class="absolute right-3 top-2 bg-blue-600 p-1.5 rounded-lg text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polyline points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const chats = ref([
  { 
    id: 1, 
    name: 'Project-General', 
    initials: 'PG', 
    lastMsg: 'Kawtar: I just updated the Kanban board', 
    time: '12:45', 
    active: true,
    messages: [
      { id: 1, text: "Hey team, how's the progress on the ERP integration?", isMe: false, sender: 'Alex', time: '10:30' },
      { id: 2, text: "Almost done with the backend connectors. Testing today.", isMe: true, sender: 'You', time: '10:32' },
      { id: 3, text: "Great! Let me know if you need help with the UI.", isMe: false, sender: 'Alex', time: '10:35' },
      { id: 4, text: "I just updated the Kanban board with the latest tasks.", isMe: false, sender: 'Kawtar', time: '12:45' }
    ]
  },
  { 
    id: 2, 
    name: 'Alex River', 
    initials: 'AR', 
    lastMsg: 'Can you check the login API?', 
    time: 'Yesterday', 
    active: false,
    messages: [
      { id: 1, text: "Can you check the login API?", isMe: false, sender: 'Alex', time: 'Yesterday' },
      { id: 2, text: "Sure, I'll take a look this afternoon.", isMe: true, sender: 'You', time: 'Yesterday' }
    ]
  },
  { 
    id: 3, 
    name: 'Sarah Chen', 
    initials: 'SC', 
    lastMsg: 'Thanks for the code review!', 
    time: '2 days ago', 
    active: false,
    messages: [
      { id: 1, text: "Could you review my PR when you have time?", isMe: false, sender: 'Sarah', time: '2 days ago' },
      { id: 2, text: "Left some comments on your PR!", isMe: true, sender: 'You', time: '2 days ago' },
      { id: 3, text: "Thanks for the code review!", isMe: false, sender: 'Sarah', time: '2 days ago' }
    ]
  }
]);

const activeChat = ref(chats.value[0]);
const newMessage = ref('');
const searchQuery = ref('');
const messagesContainer = ref(null);

const filteredChats = computed(() => {
  return chats.value.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const onlineMembers = computed(() => {
  return activeChat.value.name.includes('Project') ? 4 : 1;
});

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const handleSendMessage = () => {
  if (newMessage.value.trim()) {
    const newMsg = {
      id: activeChat.value.messages.length + 1,
      text: newMessage.value,
      isMe: true,
      sender: 'You',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    // Update the active chat's messages
    activeChat.value.messages.push(newMsg);
    activeChat.value.lastMsg = newMessage.value;
    activeChat.value.time = 'Just now';

    // Update the chat in the list
    const chatIndex = chats.value.findIndex(c => c.id === activeChat.value.id);
    if (chatIndex !== -1) {
      chats.value[chatIndex] = { ...activeChat.value };
    }

    newMessage.value = '';
    scrollToBottom();
  }
};

const switchChat = (chat) => {
  chats.value = chats.value.map(c => ({ ...c, active: c.id === chat.id }));
  activeChat.value = chat;
  scrollToBottom();
};

// Watch for message changes to auto-scroll
watch(() => activeChat.value.messages, () => {
  scrollToBottom();
}, { deep: true });
</script>

<style scoped>
/* Custom scrollbar for messages */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>