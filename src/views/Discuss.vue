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
        
        <!-- Loading State -->
        <div v-if="loadingChats" class="flex-1 flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        
        <!-- Chats List -->
        <div v-else class="overflow-y-auto flex-1">
          <div 
            v-for="chat in filteredChats" 
            :key="chat.id"
            @click="switchChat(chat)"
            class="p-4 flex items-center gap-3 hover:bg-slate-700/30 cursor-pointer border-l-4 transition-colors relative"
            :class="activeChat?.id === chat.id ? 'border-blue-500 bg-slate-700/40' : 'border-transparent'"
          >
            <div 
              class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white"
              :style="{ backgroundColor: chat.color || '#3b82f6' }"
            >
              {{ chat.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline">
                <h4 class="text-sm font-medium text-white truncate">{{ chat.name }}</h4>
                <span class="text-[10px] text-slate-500">{{ formatTime(chat.lastMessageTime) }}</span>
              </div>
              <p class="text-xs text-slate-400 truncate">
                <span v-if="chat.lastSender" class="font-medium">{{ chat.lastSender }}: </span>
                {{ chat.lastMessage }}
              </p>
            </div>
            
            <!-- Unread badge -->
            <div 
              v-if="chat.unreadCount > 0"
              class="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ chat.unreadCount > 9 ? '9+' : chat.unreadCount }}
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="filteredChats.length === 0" class="p-8 text-center text-slate-500">
            <p v-if="searchQuery">No chats found</p>
            <p v-else>No chats available</p>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col bg-slate-900/20">
        <!-- No Chat Selected -->
        <div v-if="!activeChat" class="flex-1 flex items-center justify-center">
          <div class="text-center text-slate-500">
            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-lg font-medium">Select a chat to start messaging</p>
          </div>
        </div>
        
        <!-- Active Chat -->
        <template v-else>
          <!-- Header -->
          <div class="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/40">
            <div>
              <h3 class="text-white font-semibold">
                {{ activeChat.name.includes('Project') || activeChat.type === 'project' ? '# ' : '' }}{{ activeChat.name }}
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ onlineMembers }} member{{ onlineMembers !== 1 ? 's' : '' }} online
              </p>
            </div>
            
            <button 
              @click="loadMessages()"
              :disabled="loadingMessages"
              class="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Refresh messages"
            >
              <svg 
                class="w-5 h-5 text-slate-400"
                :class="{ 'animate-spin': loadingMessages }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <!-- Messages -->
          <div class="flex-1 p-6 overflow-y-auto space-y-6" ref="messagesContainer">
            <!-- Loading Messages -->
            <div v-if="loadingMessages && messages.length === 0" class="flex items-center justify-center h-full">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            
            <!-- Messages List -->
            <div 
              v-for="msg in messages" 
              :key="msg.id" 
              class="flex gap-3"
              :class="msg.isMe ? 'flex-row-reverse' : ''"
            >
              <div 
                v-if="!msg.isMe"
                class="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-blue-400"
              >
                {{ msg.sender ? msg.sender.charAt(0).toUpperCase() : 'A' }}
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
            
            <!-- Empty Messages -->
            <div v-if="!loadingMessages && messages.length === 0" class="flex items-center justify-center h-full text-slate-500">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p>No messages yet. Start the conversation!</p>
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
                :disabled="sendingMessage"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" 
              />
              <button 
                @click="handleSendMessage"
                :disabled="!newMessage.trim() || sendingMessage"
                class="absolute right-3 top-2 bg-blue-600 p-1.5 rounded-lg text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg 
                  v-if="!sendingMessage"
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polyline points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.203.130:5000/api';

// State
const chats = ref([]);
const activeChat = ref(null);
const messages = ref([]);
const newMessage = ref('');
const searchQuery = ref('');
const messagesContainer = ref(null);

// Loading states
const loadingChats = ref(false);
const loadingMessages = ref(false);
const sendingMessage = ref(false);

// Online members count
const onlineMembers = ref(0);

// Auto-refresh interval
let refreshInterval = null;

// Computed
const filteredChats = computed(() => {
  return chats.value.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Helper: Get auth headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userStore.token}`
});

// Format time
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) return 'Just now';
  
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return days === 1 ? 'Yesterday' : `${days}d ago`;
  }
  
  // Default: show date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Scroll to bottom
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// Load all chats
const loadChats = async () => {
  loadingChats.value = true;
  
  try {
    const response = await fetch(`${API_URL}/chats`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to load chats');
    }
    
    const data = await response.json();
    chats.value = data.chats || [];
    
    // Auto-select first chat if none selected
    if (!activeChat.value && chats.value.length > 0) {
      await switchChat(chats.value[0]);
    }
    
  } catch (error) {
    console.error('Error loading chats:', error);
  } finally {
    loadingChats.value = false;
  }
};

// Load messages for active chat
const loadMessages = async () => {
  if (!activeChat.value) return;
  
  loadingMessages.value = true;
  
  try {
    const response = await fetch(`${API_URL}/chats/${activeChat.value.id}/messages`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to load messages');
    }
    
    const data = await response.json();
    messages.value = data.messages || [];
    
    // Load member info for online count
    await loadChatMembers();
    
    // Mark as read
    await markAsRead();
    
    scrollToBottom();
    
  } catch (error) {
    console.error('Error loading messages:', error);
  } finally {
    loadingMessages.value = false;
  }
};

// Load chat members
const loadChatMembers = async () => {
  if (!activeChat.value) return;
  
  try {
    const response = await fetch(`${API_URL}/chats/${activeChat.value.id}/members`, {
      headers: getHeaders()
    });
    
    if (!response.ok) return;
    
    const data = await response.json();
    onlineMembers.value = data.onlineCount || 0;
    
  } catch (error) {
    console.error('Error loading members:', error);
  }
};

// Send message
const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !activeChat.value || sendingMessage.value) return;
  
  sendingMessage.value = true;
  const messageText = newMessage.value.trim();
  
  try {
    const response = await fetch(`${API_URL}/chats/${activeChat.value.id}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message: messageText })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    const data = await response.json();
    
    // Add message to list
    messages.value.push(data.data);
    
    // Update chat's last message
    const chatIndex = chats.value.findIndex(c => c.id === activeChat.value.id);
    if (chatIndex !== -1) {
      chats.value[chatIndex].lastMessage = messageText;
      chats.value[chatIndex].lastSender = 'You';
      chats.value[chatIndex].lastMessageTime = new Date().toISOString();
    }
    
    newMessage.value = '';
    scrollToBottom();
    
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message. Please try again.');
  } finally {
    sendingMessage.value = false;
  }
};

// Switch chat
const switchChat = async (chat) => {
  activeChat.value = chat;
  messages.value = [];
  await loadMessages();
};

// Mark chat as read
const markAsRead = async () => {
  if (!activeChat.value) return;
  
  try {
    await fetch(`${API_URL}/chats/${activeChat.value.id}/mark-read`, {
      method: 'POST',
      headers: getHeaders()
    });
    
    // Update local unread count
    const chatIndex = chats.value.findIndex(c => c.id === activeChat.value.id);
    if (chatIndex !== -1) {
      chats.value[chatIndex].unreadCount = 0;
    }
    
  } catch (error) {
    console.error('Error marking as read:', error);
  }
};

// Auto-refresh messages
const startAutoRefresh = () => {
  refreshInterval = setInterval(async () => {
    if (activeChat.value && !sendingMessage.value) {
      const currentScrollPos = messagesContainer.value?.scrollTop || 0;
      const isAtBottom = messagesContainer.value 
        ? Math.abs(messagesContainer.value.scrollHeight - messagesContainer.value.scrollTop - messagesContainer.value.clientHeight) < 100
        : true;
      
      await loadMessages();
      
      // Only scroll to bottom if user was already at bottom
      if (!isAtBottom && messagesContainer.value) {
        messagesContainer.value.scrollTop = currentScrollPos;
      }
    }
    
    // Refresh chats list less frequently
    if (Math.random() < 0.2) { // 20% chance each interval
      await loadChats();
    }
  }, 5000); // Every 5 seconds
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Lifecycle
onMounted(async () => {
  await loadChats();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});

// Watch for message changes to auto-scroll
watch(() => messages.value.length, () => {
  scrollToBottom();
});
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