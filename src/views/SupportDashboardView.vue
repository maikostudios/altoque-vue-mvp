<template>
  <div class="support-dashboard">
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>🎧 Panel de Soporte</h1>
        <p>Gestiona tickets asignados y sin asignar</p>
        <div class="header-stats">
          <div class="stat-card">
            <span class="stat-number">{{ assignedTickets.length }}</span>
            <span class="stat-label">Mis Tickets</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ unassignedTickets.length }}</span>
            <span class="stat-label">Sin Asignar</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ urgentTickets.length }}</span>
            <span class="stat-label">Urgentes</span>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-row">
          <select v-model="activeTab" class="filter-select">
            <option value="assigned">Mis Tickets Asignados</option>
            <option value="unassigned">Tickets Sin Asignar</option>
            <option value="all">Todos los Tickets</option>
          </select>
          
          <select v-model="statusFilter" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="recibido">Recibido</option>
            <option value="en_proceso">En proceso</option>
            <option value="respondido">Respondido</option>
          </select>
          
          <select v-model="priorityFilter" class="filter-select">
            <option value="">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
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

      <!-- Lista de Tickets -->
      <div class="tickets-section">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando tickets...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredTickets.length === 0" class="empty-state">
          <div class="empty-icon">🎫</div>
          <h3>No hay tickets {{ activeTab === 'assigned' ? 'asignados' : activeTab === 'unassigned' ? 'sin asignar' : '' }}</h3>
          <p>{{ getEmptyMessage() }}</p>
        </div>

        <!-- Tabla de tickets -->
        <div v-else class="tickets-table-container">
          <table class="tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Asunto</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Días Pendientes</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-row">
                <td class="ticket-id">
                  <span class="ticket-number">{{ ticket.ticketId }}</span>
                </td>
                <td class="ticket-user">
                  <div class="user-info">
                    <h4>{{ ticket.userName }}</h4>
                    <p>{{ ticket.userEmail }}</p>
                  </div>
                </td>
                <td class="ticket-subject">
                  <div class="subject-content">
                    <h4>{{ getSubjectLabel(ticket.asunto) }}</h4>
                    <p class="ticket-preview">{{ truncateText(ticket.mensaje, 60) }}</p>
                  </div>
                </td>
                <td class="ticket-priority">
                  <span 
                    class="priority-badge" 
                    :class="getPriorityClass(ticket.prioridad)"
                  >
                    {{ getPriorityInfo(ticket.prioridad).icon }} {{ getPriorityInfo(ticket.prioridad).label }}
                  </span>
                </td>
                <td class="ticket-status">
                  <span 
                    class="status-badge" 
                    :class="getStatusClass(ticket.estado)"
                  >
                    {{ getStatusInfo(ticket.estado).icon }} {{ getStatusInfo(ticket.estado).label }}
                  </span>
                </td>
                <td class="ticket-days">
                  <span class="days-pending" :class="{ 'urgent': calculateDaysPending(ticket.fechaCreacion) > 5 }">
                    {{ calculateDaysPending(ticket.fechaCreacion) }} días
                  </span>
                </td>
                <td class="ticket-date">
                  {{ formatDate(ticket.fechaCreacion) }}
                </td>
                <td class="ticket-actions">
                  <button 
                    v-if="!ticket.asignadoA && activeTab === 'unassigned'"
                    @click="assignToMe(ticket)" 
                    class="btn-action assign"
                    title="Asignarme este ticket"
                  >
                    <i class="bi bi-person-plus"></i>
                  </button>
                  <button 
                    @click="viewTicket(ticket)" 
                    class="btn-action view"
                    title="Ver detalles"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button 
                    v-if="ticket.asignadoA === authStore.user.uid"
                    @click="respondTicket(ticket)" 
                    class="btn-action respond"
                    title="Responder"
                  >
                    <i class="bi bi-reply"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Ver Ticket -->
      <TicketDetailModal 
        v-if="showDetailModal && selectedTicket"
        :ticket="selectedTicket"
        :can-edit="true"
        @close="closeDetailModal"
        @ticket-updated="onTicketUpdated"
      />

      <!-- Modal Responder Ticket -->
      <TicketResponseModal 
        v-if="showResponseModal && selectedTicket"
        :ticket="selectedTicket"
        @close="closeResponseModal"
        @response-sent="onResponseSent"
      />

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
import { useSupportStore, TICKET_SUBJECTS, TICKET_STATUSES, TICKET_PRIORITIES } from '@/store/support'
import { useAuthStore } from '@/store/auth'
import TicketDetailModal from '@/components/support/TicketDetailModal.vue'
import TicketResponseModal from '@/components/support/TicketResponseModal.vue'

const supportStore = useSupportStore()
const authStore = useAuthStore()

const activeTab = ref('assigned')
const statusFilter = ref('')
const priorityFilter = ref('')
const searchQuery = ref('')
const showDetailModal = ref(false)
const showResponseModal = ref(false)
const selectedTicket = ref(null)
const successMessage = ref('')

// Computed
const loading = computed(() => supportStore.loading)
const allTickets = computed(() => supportStore.allTickets || [])

const assignedTickets = computed(() => 
  allTickets.value.filter(ticket => ticket.asignadoA === authStore.user?.uid)
)

const unassignedTickets = computed(() => 
  allTickets.value.filter(ticket => !ticket.asignadoA && ticket.estado === 'recibido')
)

const urgentTickets = computed(() => 
  allTickets.value.filter(ticket => 
    ticket.prioridad === 'alta' || calculateDaysPending(ticket.fechaCreacion) > 5
  )
)

const filteredTickets = computed(() => {
  let tickets = []
  
  // Seleccionar tickets según la pestaña activa
  switch (activeTab.value) {
    case 'assigned':
      tickets = assignedTickets.value
      break
    case 'unassigned':
      tickets = unassignedTickets.value
      break
    case 'all':
      tickets = allTickets.value
      break
  }

  // Aplicar filtros
  if (statusFilter.value) {
    tickets = tickets.filter(ticket => ticket.estado === statusFilter.value)
  }

  if (priorityFilter.value) {
    tickets = tickets.filter(ticket => ticket.prioridad === priorityFilter.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    tickets = tickets.filter(ticket => 
      ticket.ticketId.toLowerCase().includes(query) ||
      ticket.userName.toLowerCase().includes(query) ||
      ticket.mensaje.toLowerCase().includes(query) ||
      getSubjectLabel(ticket.asunto).toLowerCase().includes(query)
    )
  }

  // Ordenar por prioridad y días pendientes
  return tickets.sort((a, b) => {
    const priorityOrder = { alta: 3, media: 2, baja: 1 }
    const aPriority = priorityOrder[a.prioridad] || 1
    const bPriority = priorityOrder[b.prioridad] || 1
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority // Prioridad alta primero
    }
    
    // Si tienen la misma prioridad, ordenar por días pendientes
    const aDays = calculateDaysPending(a.fechaCreacion)
    const bDays = calculateDaysPending(b.fechaCreacion)
    return bDays - aDays // Más días pendientes primero
  })
})

// Methods
const loadData = async () => {
  if (authStore.user) {
    await supportStore.loadAllTickets() // Necesitamos crear este método
  }
}

const getSubjectLabel = (value) => {
  const subject = TICKET_SUBJECTS.find(s => s.value === value)
  return subject ? subject.label : value
}

const getStatusInfo = (status) => {
  return TICKET_STATUSES[status] || { label: status, icon: '❓', color: 'gray' }
}

const getPriorityInfo = (priority) => {
  return TICKET_PRIORITIES[priority] || { label: priority, icon: '⚪', color: 'gray' }
}

const getStatusClass = (status) => {
  const info = getStatusInfo(status)
  return `status-${info.color}`
}

const getPriorityClass = (priority) => {
  const info = getPriorityInfo(priority)
  return `priority-${info.color}`
}

const calculateDaysPending = (fechaCreacion) => {
  if (!fechaCreacion) return 0
  
  const createdDate = fechaCreacion.toDate ? fechaCreacion.toDate() : new Date(fechaCreacion)
  const now = new Date()
  const diffTime = Math.abs(now - createdDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
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

const getEmptyMessage = () => {
  switch (activeTab.value) {
    case 'assigned':
      return 'No tienes tickets asignados actualmente'
    case 'unassigned':
      return 'No hay tickets sin asignar en este momento'
    default:
      return 'No hay tickets disponibles'
  }
}

const assignToMe = async (ticket) => {
  try {
    await supportStore.assignTicket(ticket.id, authStore.user.uid)
    successMessage.value = `Ticket ${ticket.ticketId} asignado correctamente`
    setTimeout(() => successMessage.value = '', 3000)
    await loadData()
  } catch (error) {
    console.error('Error asignando ticket:', error)
  }
}

const viewTicket = (ticket) => {
  selectedTicket.value = ticket
  showDetailModal.value = true
}

const respondTicket = (ticket) => {
  selectedTicket.value = ticket
  showResponseModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedTicket.value = null
}

const closeResponseModal = () => {
  showResponseModal.value = false
  selectedTicket.value = null
}

const onTicketUpdated = async () => {
  await loadData()
  closeDetailModal()
}

const onResponseSent = async () => {
  await loadData()
  closeResponseModal()
  successMessage.value = 'Respuesta enviada correctamente'
  setTimeout(() => successMessage.value = '', 3000)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
@import '@/styles/support-dashboard.css';
</style>
