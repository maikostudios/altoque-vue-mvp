<template>
  <div class="support-view">
    <div class="support-container">
      <!-- Header -->
      <div class="support-header">
        <h1>🎫 Centro de Soporte</h1>
        <p>Gestiona tus tickets de soporte y obtén ayuda</p>
        <div class="header-actions">
          <router-link to="/ayuda" class="btn btn-ghost">
            <i class="bi bi-question-circle"></i>
            Ver FAQs
          </router-link>
          <button @click="showCreateModal = true" class="btn btn-primary">
            <i class="bi bi-plus-lg"></i>
            Nuevo Ticket
          </button>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon">📨</div>
          <div class="stat-content">
            <h3>Total de Tickets</h3>
            <p class="stat-number">{{ tickets.length }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>Tickets Abiertos</h3>
            <p class="stat-number">{{ openTicketsCount }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>Tickets Cerrados</h3>
            <p class="stat-number">{{ closedTicketsCount }}</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-row">
          <select v-model="statusFilter" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="recibido">Recibido</option>
            <option value="en_proceso">En proceso</option>
            <option value="respondido">Respondido</option>
            <option value="cerrado">Cerrado</option>
          </select>
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar tickets..."
              class="search-input"
            >
          </div>
        </div>
      </div>

      <!-- Lista de tickets -->
      <div class="tickets-section">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando tickets...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredTickets.length === 0" class="empty-state">
          <div class="empty-icon">🎫</div>
          <h3>{{ tickets.length === 0 ? 'No tienes tickets aún' : 'No se encontraron tickets' }}</h3>
          <p>{{ tickets.length === 0 ? 'Crea tu primer ticket de soporte para obtener ayuda' : 'Intenta cambiar los filtros de búsqueda' }}</p>
          <button v-if="tickets.length === 0" @click="showCreateModal = true" class="btn btn-primary">
            Crear Primer Ticket
          </button>
        </div>

        <!-- Tabla de tickets -->
        <div v-else class="tickets-table-container">
          <table class="tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asunto</th>
                <th>Estado</th>
                <th>Fecha de Creación</th>
                <th>Última Actualización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-row">
                <td class="ticket-id">
                  <span class="ticket-number">{{ ticket.ticketId }}</span>
                </td>
                <td class="ticket-subject">
                  <div class="subject-content">
                    <h4>{{ getSubjectLabel(ticket.asunto) }}</h4>
                    <p class="ticket-preview">{{ truncateText(ticket.mensaje, 60) }}</p>
                  </div>
                </td>
                <td class="ticket-status">
                  <span 
                    class="status-badge" 
                    :class="getStatusClass(ticket.estado)"
                  >
                    {{ getStatusInfo(ticket.estado).icon }} {{ getStatusInfo(ticket.estado).label }}
                  </span>
                </td>
                <td class="ticket-date">
                  {{ formatDate(ticket.fechaCreacion) }}
                </td>
                <td class="ticket-updated">
                  {{ formatDate(ticket.fechaActualizacion) }}
                </td>
                <td class="ticket-actions">
                  <button 
                    @click="viewTicket(ticket)" 
                    class="btn-icon view"
                    title="Ver detalles"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal crear ticket -->
      <SupportTicketModal 
        v-if="showCreateModal"
        :user-info="userInfo"
        @close="showCreateModal = false"
        @ticket-created="onTicketCreated"
      />

      <!-- Modal ver ticket -->
      <div v-if="showViewModal && selectedTicket" class="modal-overlay" @click="closeViewModal">
        <div class="modal-content large" @click.stop>
          <div class="modal-header">
            <h3>🎫 Ticket {{ selectedTicket.ticketId }}</h3>
            <button @click="closeViewModal" class="close-btn">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <div class="ticket-details">
            <div class="ticket-info-grid">
              <div class="info-item">
                <span class="info-label">Estado:</span>
                <span 
                  class="status-badge" 
                  :class="getStatusClass(selectedTicket.estado)"
                >
                  {{ getStatusInfo(selectedTicket.estado).icon }} {{ getStatusInfo(selectedTicket.estado).label }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Asunto:</span>
                <span class="info-value">{{ getSubjectLabel(selectedTicket.asunto) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Creado:</span>
                <span class="info-value">{{ formatDate(selectedTicket.fechaCreacion) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Actualizado:</span>
                <span class="info-value">{{ formatDate(selectedTicket.fechaActualizacion) }}</span>
              </div>
            </div>
            
            <div class="ticket-message">
              <h4>Mensaje:</h4>
              <div class="message-content">{{ selectedTicket.mensaje }}</div>
            </div>
            
            <div v-if="selectedTicket.comentarioAdmin" class="admin-response">
              <h4>Respuesta del soporte:</h4>
              <div class="response-content">{{ selectedTicket.comentarioAdmin }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notificación de éxito -->
      <div v-if="successMessage" class="success-notification">
        <i class="bi bi-check-circle"></i>
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupportStore, TICKET_SUBJECTS, TICKET_STATUSES } from '@/store/support'
import { useAuthStore } from '@/store/auth'
import SupportTicketModal from '@/components/support/SupportTicketModal.vue'

const supportStore = useSupportStore()
const authStore = useAuthStore()

const showCreateModal = ref(false)
const showViewModal = ref(false)
const selectedTicket = ref(null)
const statusFilter = ref('')
const searchQuery = ref('')
const successMessage = ref('')
const userInfo = ref({})

// Computed
const tickets = computed(() => supportStore.tickets)
const loading = computed(() => supportStore.loading)

const openTicketsCount = computed(() => 
  tickets.value.filter(t => ['recibido', 'en_proceso', 'respondido'].includes(t.estado)).length
)

const closedTicketsCount = computed(() => 
  tickets.value.filter(t => t.estado === 'cerrado').length
)

const filteredTickets = computed(() => {
  let filtered = tickets.value

  // Filtrar por estado
  if (statusFilter.value) {
    filtered = filtered.filter(ticket => ticket.estado === statusFilter.value)
  }

  // Filtrar por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(ticket => 
      ticket.ticketId.toLowerCase().includes(query) ||
      ticket.mensaje.toLowerCase().includes(query) ||
      getSubjectLabel(ticket.asunto).toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
const loadData = async () => {
  if (authStore.user) {
    await supportStore.loadUserTickets(authStore.user.uid)
    
    // Cargar info del usuario (simulado por ahora)
    userInfo.value = {
      nombre: 'Usuario',
      apellido: 'Demo',
      email: authStore.user.email,
      tipoPlan: 'Gratuito'
    }
  }
}

const getSubjectLabel = (value) => {
  const subject = TICKET_SUBJECTS.find(s => s.value === value)
  return subject ? subject.label : value
}

const getStatusInfo = (status) => {
  return TICKET_STATUSES[status] || { label: status, icon: '❓', color: 'gray' }
}

const getStatusClass = (status) => {
  const info = getStatusInfo(status)
  return `status-${info.color}`
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'No disponible'
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const viewTicket = (ticket) => {
  selectedTicket.value = ticket
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedTicket.value = null
}

const onTicketCreated = (data) => {
  successMessage.value = data.message
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
  
  // Recargar tickets
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
@import '@/styles/support-view.css';
</style>
