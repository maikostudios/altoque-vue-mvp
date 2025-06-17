<template>
  <div class="notification-bell" ref="bellContainer">
    <!-- Botón de la campana -->
    <button 
      @click="toggleDropdown" 
      class="bell-button"
      :class="{ 'has-notifications': hasUnread }"
      aria-label="Notificaciones"
    >
      <i class="bi bi-bell"></i>
      <span v-if="unreadCount > 0" class="notification-badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown de notificaciones -->
    <div v-if="showDropdown" class="notifications-dropdown">
      <div class="dropdown-header">
        <h3>Notificaciones</h3>
        <button 
          v-if="hasUnread" 
          @click="markAllAsRead" 
          class="mark-all-read-btn"
        >
          Marcar todas como leídas
        </button>
      </div>

      <div class="notifications-content">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando notificaciones...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="notifications.length === 0" class="empty-state">
          <i class="bi bi-bell-slash"></i>
          <p>No tienes notificaciones</p>
        </div>

        <!-- Lista de notificaciones -->
        <div v-else class="notifications-list">
          <div 
            v-for="notification in notifications.slice(0, 10)" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.leida }"
            @click="markAsRead(notification.id)"
          >
            <div class="notification-icon">
              {{ notification.icono || '🔔' }}
            </div>
            <div class="notification-content">
              <h4>{{ notification.titulo }}</h4>
              <p>{{ notification.mensaje }}</p>
              <span class="notification-time">
                {{ formatTime(notification.fechaCreacion) }}
              </span>
            </div>
            <div v-if="!notification.leida" class="unread-indicator"></div>
          </div>
        </div>
      </div>

      <div class="dropdown-footer">
        <router-link to="/soporte" class="view-all-link" @click="closeDropdown">
          Ver todos los tickets
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '@/store/notifications'
import { useAuthStore } from '@/store/auth'

const notificationsStore = useNotificationsStore()
const authStore = useAuthStore()

const showDropdown = ref(false)
const bellContainer = ref(null)
let unsubscribeNotifications = null

// Computed properties
const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)
const hasUnread = computed(() => notificationsStore.hasUnread)
const loading = computed(() => notificationsStore.loading)

// Methods
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

const markAsRead = async (notificationId) => {
  await notificationsStore.markAsRead(notificationId)
}

const markAllAsRead = async () => {
  await notificationsStore.markAllAsRead(authStore.user.uid)
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Ahora'
  if (diffInMinutes < 60) return `${diffInMinutes}m`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
  return `${Math.floor(diffInMinutes / 1440)}d`
}

// Click outside to close dropdown
const handleClickOutside = (event) => {
  if (bellContainer.value && !bellContainer.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  // Inicializar listener de notificaciones
  if (authStore.user) {
    unsubscribeNotifications = notificationsStore.initNotificationsListener(authStore.user.uid)
  }
  
  // Agregar listener para cerrar dropdown al hacer click fuera
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Limpiar listeners
  if (unsubscribeNotifications) {
    unsubscribeNotifications()
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.notification-bell {
  position: relative;
  display: inline-block;
}

.bell-button {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.2rem;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.bell-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.bell-button.has-notifications {
  animation: bellShake 2s infinite;
}

@keyframes bellShake {
  0%, 50%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(-10deg); }
  20%, 40% { transform: rotate(10deg); }
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  max-height: 500px;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  padding: 16px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1.1rem;
}

.mark-all-read-btn {
  background: none;
  border: none;
  color: #00cccc;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.mark-all-read-btn:hover {
  background: rgba(0, 204, 204, 0.1);
}

.notifications-content {
  max-height: 350px;
  overflow-y: auto;
}

.loading-state, .empty-state {
  padding: 32px;
  text-align: center;
  color: #888;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #333;
  border-top: 2px solid #00cccc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notifications-list {
  padding: 8px 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.3s ease;
  position: relative;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.notification-item.unread {
  background: rgba(0, 204, 204, 0.05);
}

.notification-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h4 {
  margin: 0 0 4px 0;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
}

.notification-content p {
  margin: 0 0 4px 0;
  color: #ccc;
  font-size: 0.8rem;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-time {
  color: #888;
  font-size: 0.7rem;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: #00cccc;
  border-radius: 50%;
  flex-shrink: 0;
  margin-left: 8px;
  margin-top: 4px;
}

.dropdown-footer {
  padding: 12px 16px;
  border-top: 1px solid #333;
  text-align: center;
}

.view-all-link {
  color: #00cccc;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.view-all-link:hover {
  color: #1c94e0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .notifications-dropdown {
    width: 300px;
    right: -50px;
  }
}
</style>
