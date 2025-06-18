<template>
  <div class="ticket-management">
    <!-- Header mejorado -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">🎫 Gestión de Tickets</h1>
          <p class="page-description">Administra todos los tickets del sistema y asigna agentes de soporte</p>
        </div>
        <div class="header-actions">
          <button @click="loadAllTickets" class="btn-refresh" :disabled="loading">
            <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i>
            <span class="btn-text">Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Stats cards mejoradas -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <span class="stat-number">{{ allTickets.length }}</span>
            <span class="stat-label">Total Tickets</span>
          </div>
        </div>
        <div class="stat-card unassigned">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <span class="stat-number">{{ unassignedTickets.length }}</span>
            <span class="stat-label">Sin Asignar</span>
          </div>
        </div>
        <div class="stat-card urgent">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <span class="stat-number">{{ urgentTickets.length }}</span>
            <span class="stat-label">Urgentes</span>
          </div>
        </div>
        <div class="stat-card overdue">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <span class="stat-number">{{ overdueTickets.length }}</span>
            <span class="stat-label">Vencidos</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros mejorados -->
    <div class="filters-section">
      <div class="filters-container">
        <!-- Filtros principales -->
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Estado</label>
            <select v-model="statusFilter" class="filter-select">
              <option value="">Todos los estados</option>
              <option value="recibido">📥 Recibido</option>
              <option value="en_proceso">⚙️ En proceso</option>
              <option value="respondido">💬 Respondido</option>
              <option value="cerrado">✅ Cerrado</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Prioridad</label>
            <select v-model="priorityFilter" class="filter-select">
              <option value="">Todas las prioridades</option>
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Media</option>
              <option value="baja">🟢 Baja</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Asignación</label>
            <select v-model="assignmentFilter" class="filter-select">
              <option value="">Todos</option>
              <option value="unassigned">⚠️ Sin asignar</option>
              <option value="assigned">👥 Asignados</option>
              <option value="self">👤 Asignados a mí</option>
            </select>
          </div>
        </div>

        <!-- Búsqueda -->
        <div class="search-container">
          <div class="search-box">
            <i class="bi bi-search search-icon"></i>
            <input v-model="searchQuery" type="text" placeholder="Buscar por ID, usuario, asunto o mensaje..."
              class="search-input">
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando tickets...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredTickets.length === 0" class="empty-state">
      <div class="empty-icon">🎫</div>
      <h3>No hay tickets</h3>
      <p>{{ getEmptyMessage() }}</p>
    </div>

    <!-- Contenedor de tickets responsive -->
    <div v-else class="tickets-container">
      <!-- Vista de tabla para desktop -->
      <div class="tickets-table-view">
        <div class="table-container">
          <table class="tickets-table">
            <thead>
              <tr>
                <th class="th-id">ID</th>
                <th class="th-user">Usuario</th>
                <th class="th-subject">Asunto</th>
                <th class="th-priority">Prioridad</th>
                <th class="th-status">Estado</th>
                <th class="th-assigned">Asignado</th>
                <th class="th-days">Días</th>
                <th class="th-date">Fecha</th>
                <th class="th-actions">Acciones</th>
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
                  <span class="priority-badge" :class="getPriorityClass(ticket.prioridad)">
                    {{ getPriorityInfo(ticket.prioridad).icon }} {{ getPriorityInfo(ticket.prioridad).label }}
                  </span>
                </td>
                <td class="ticket-status">
                  <span class="status-badge" :class="getStatusClass(ticket.estado)">
                    {{ getStatusInfo(ticket.estado).icon }} {{ getStatusInfo(ticket.estado).label }}
                  </span>
                </td>
                <td class="ticket-assigned">
                  <div v-if="ticket.asignadoA" class="assigned-info">
                    <span class="agent-name">{{ getAgentName(ticket.asignadoA) }}</span>
                    <span class="assignment-date">{{ formatDate(ticket.fechaAsignacion) }}</span>
                  </div>
                  <span v-else class="unassigned">Sin asignar</span>
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
                  <!-- Asignarse a sí mismo -->
                  <button v-if="!ticket.asignadoA" @click="assignToSelf(ticket)" class="btn-action assign-self"
                    title="Asignarme este ticket">
                    <i class="bi bi-person-check"></i>
                  </button>

                  <!-- Asignar a agente -->
                  <button @click="showAssignModal(ticket)" class="btn-action assign" title="Asignar a agente">
                    <i class="bi bi-people"></i>
                  </button>

                  <!-- Ver detalles -->
                  <button @click="viewTicket(ticket)" class="btn-action view" title="Ver detalles">
                    <i class="bi bi-eye"></i>
                  </button>

                  <!-- Responder (si está asignado al admin) -->
                  <button v-if="ticket.asignadoA === authStore.user.uid" @click="respondTicket(ticket)"
                    class="btn-action respond" title="Responder">
                    <i class="bi bi-reply"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Vista de tarjetas para móviles -->
      <div class="tickets-cards-view">
        <div class="tickets-grid">
          <div v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-card">
            <!-- Header de la tarjeta -->
            <div class="card-header">
              <div class="ticket-id-badge">
                <span class="ticket-number">{{ ticket.ticketId }}</span>
              </div>
              <div class="priority-status">
                <span class="priority-badge" :class="getPriorityClass(ticket.prioridad)">
                  {{ getPriorityInfo(ticket.prioridad).icon }} {{ getPriorityInfo(ticket.prioridad).label }}
                </span>
                <span class="status-badge" :class="getStatusClass(ticket.estado)">
                  {{ getStatusInfo(ticket.estado).icon }} {{ getStatusInfo(ticket.estado).label }}
                </span>
              </div>
            </div>

            <!-- Contenido de la tarjeta -->
            <div class="card-content">
              <div class="user-section">
                <h4 class="user-name">{{ ticket.userName }}</h4>
                <p class="user-email">{{ ticket.userEmail }}</p>
              </div>

              <div class="subject-section">
                <h3 class="subject-title">{{ getSubjectLabel(ticket.asunto) }}</h3>
                <p class="message-preview">{{ truncateText(ticket.mensaje, 100) }}</p>
              </div>

              <div class="meta-info">
                <div class="meta-item">
                  <span class="meta-label">Asignado a:</span>
                  <span class="meta-value">
                    {{ ticket.asignadoA ? getAgentName(ticket.asignadoA) : 'Sin asignar' }}
                  </span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Días pendientes:</span>
                  <span class="meta-value" :class="{ 'urgent': calculateDaysPending(ticket.fechaCreacion) > 5 }">
                    {{ calculateDaysPending(ticket.fechaCreacion) }} días
                  </span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Fecha:</span>
                  <span class="meta-value">{{ formatDate(ticket.fechaCreacion) }}</span>
                </div>
              </div>
            </div>

            <!-- Acciones de la tarjeta -->
            <div class="card-actions">
              <button v-if="!ticket.asignadoA" @click="assignToSelf(ticket)" class="action-btn primary">
                <i class="bi bi-person-check"></i>
                Asignarme
              </button>

              <button @click="showAssignModal(ticket)" class="action-btn secondary">
                <i class="bi bi-people"></i>
                Asignar
              </button>

              <button @click="viewTicket(ticket)" class="action-btn info">
                <i class="bi bi-eye"></i>
                Ver
              </button>

              <button v-if="ticket.asignadoA === authStore.user.uid" @click="respondTicket(ticket)"
                class="action-btn success">
                <i class="bi bi-reply"></i>
                Responder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <TicketAssignmentModal v-if="showAssignmentModal && selectedTicket" :ticket="selectedTicket" :agents="supportAgents"
      @close="closeAssignmentModal" @ticket-assigned="onTicketAssigned" />

    <TicketDetailModal v-if="showDetailModal && selectedTicket" :ticket="selectedTicket" :can-edit="true"
      @close="closeDetailModal" @ticket-updated="onTicketUpdated" />

    <TicketResponseModal v-if="showResponseModal && selectedTicket" :ticket="selectedTicket" @close="closeResponseModal"
      @response-sent="onResponseSent" />

    <!-- Notificación de éxito -->
    <div v-if="successMessage" class="success-notification">
      <i class="bi bi-check-circle"></i>
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { TICKET_SUBJECTS, TICKET_STATUSES, TICKET_PRIORITIES } from '@/store/support'
import { useAuthStore } from '@/store/auth'
import TicketDetailModal from '@/components/support/TicketDetailModal.vue'
import TicketResponseModal from '@/components/support/TicketResponseModal.vue'
import TicketAssignmentModal from './TicketAssignmentModal.vue'

const authStore = useAuthStore()

const allTickets = ref([])
const supportAgents = ref([])
const loading = ref(false)
const statusFilter = ref('')
const priorityFilter = ref('')
const assignmentFilter = ref('')
const searchQuery = ref('')
const showDetailModal = ref(false)
const showResponseModal = ref(false)
const showAssignmentModal = ref(false)
const selectedTicket = ref(null)
const successMessage = ref('')

// Computed
const filteredTickets = computed(() => {
  let tickets = allTickets.value

  // Aplicar filtros
  if (statusFilter.value) {
    tickets = tickets.filter(ticket => ticket.estado === statusFilter.value)
  }

  if (priorityFilter.value) {
    tickets = tickets.filter(ticket => ticket.prioridad === priorityFilter.value)
  }

  if (assignmentFilter.value) {
    switch (assignmentFilter.value) {
      case 'unassigned':
        tickets = tickets.filter(ticket => !ticket.asignadoA)
        break
      case 'assigned':
        tickets = tickets.filter(ticket => ticket.asignadoA)
        break
      case 'self':
        tickets = tickets.filter(ticket => ticket.asignadoA === authStore.user?.uid)
        break
    }
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
      return bPriority - aPriority
    }

    const aDays = calculateDaysPending(a.fechaCreacion)
    const bDays = calculateDaysPending(b.fechaCreacion)
    return bDays - aDays
  })
})

const unassignedTickets = computed(() =>
  allTickets.value.filter(ticket => !ticket.asignadoA)
)

const urgentTickets = computed(() =>
  allTickets.value.filter(ticket =>
    ticket.prioridad === 'alta' || calculateDaysPending(ticket.fechaCreacion) > 5
  )
)

const overdueTickets = computed(() =>
  allTickets.value.filter(ticket => calculateDaysPending(ticket.fechaCreacion) > 7)
)

// Methods
const loadAllTickets = async () => {
  loading.value = true
  try {
    const querySnapshot = await getDocs(collection(db, 'tickets'))
    allTickets.value = []

    querySnapshot.forEach((doc) => {
      allTickets.value.push({
        id: doc.id,
        ...doc.data()
      })
    })

    console.log(`✅ Cargados ${allTickets.value.length} tickets`)

  } catch (error) {
    console.error('Error cargando tickets:', error)
  } finally {
    loading.value = false
  }
}

const loadSupportAgents = async () => {
  try {
    const q = query(
      collection(db, 'users'),
      where('rol', '==', 'soporte'),
      where('estado', '==', 'activo')
    )

    const querySnapshot = await getDocs(q)
    supportAgents.value = []

    querySnapshot.forEach((doc) => {
      supportAgents.value.push({
        id: doc.id,
        ...doc.data()
      })
    })

    console.log(`✅ Cargados ${supportAgents.value.length} agentes de soporte`)

  } catch (error) {
    console.error('Error cargando agentes:', error)
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

const getAgentName = (agentId) => {
  const agent = supportAgents.value.find(a => a.id === agentId)
  return agent ? `${agent.nombre} ${agent.apellido}` : 'Agente desconocido'
}

const getEmptyMessage = () => {
  if (searchQuery.value.trim()) return 'No se encontraron tickets con ese criterio'
  if (statusFilter.value || priorityFilter.value || assignmentFilter.value) return 'No hay tickets con esos filtros'
  return 'No hay tickets en el sistema'
}

const assignToSelf = async (ticket) => {
  try {
    await updateDoc(doc(db, 'tickets', ticket.id), {
      asignadoA: authStore.user.uid,
      fechaAsignacion: serverTimestamp(),
      estado: 'en_proceso',
      fechaActualizacion: serverTimestamp()
    })

    successMessage.value = `Ticket ${ticket.ticketId} asignado a ti`
    setTimeout(() => successMessage.value = '', 3000)
    await loadAllTickets()

  } catch (error) {
    console.error('Error asignando ticket:', error)
  }
}

const showAssignModal = (ticket) => {
  selectedTicket.value = ticket
  showAssignmentModal.value = true
}

const viewTicket = (ticket) => {
  selectedTicket.value = ticket
  showDetailModal.value = true
}

const respondTicket = (ticket) => {
  selectedTicket.value = ticket
  showResponseModal.value = true
}

const closeAssignmentModal = () => {
  showAssignmentModal.value = false
  selectedTicket.value = null
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedTicket.value = null
}

const closeResponseModal = () => {
  showResponseModal.value = false
  selectedTicket.value = null
}

const onTicketAssigned = async () => {
  await loadAllTickets()
  closeAssignmentModal()
  successMessage.value = 'Ticket asignado correctamente'
  setTimeout(() => successMessage.value = '', 3000)
}

const onTicketUpdated = async () => {
  await loadAllTickets()
  closeDetailModal()
}

const onResponseSent = async () => {
  await loadAllTickets()
  closeResponseModal()
  successMessage.value = 'Respuesta enviada correctamente'
  setTimeout(() => successMessage.value = '', 3000)
}

onMounted(() => {
  loadAllTickets()
  loadSupportAgents()
})
</script>

<style scoped>
/* Variables CSS */
:root {
  --primary-color: #00cccc;
  --secondary-color: #1c94e0;
  --background-dark: #121212;
  --surface-dark: #1e1e1e;
  --surface-variant: #2a2a2a;
  --border-color: #333;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --text-muted: #888888;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --border-radius: 12px;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Layout principal */
.ticket-management {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem;
  background: var(--background-dark);
  min-height: 100vh;
}

/* Header mejorado */
.header-section {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--background-dark);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-refresh .bi-arrow-clockwise.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Stats cards mejoradas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(145deg, var(--surface-dark), var(--surface-variant));
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

.stat-card.total::before {
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.stat-card.unassigned::before {
  background: linear-gradient(90deg, var(--warning-color), #f97316);
}

.stat-card.urgent::before {
  background: linear-gradient(90deg, var(--error-color), #dc2626);
}

.stat-card.overdue::before {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filtros mejorados */
.filters-section {
  background: var(--surface-dark);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.filters-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 0.75rem 1rem;
  background: var(--surface-variant);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 204, 204, 0.1);
}

.search-container {
  grid-column: 1 / -1;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: var(--surface-variant);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 204, 204, 0.1);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.clear-search:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

/* Contenedor responsive */
.tickets-container {
  background: var(--surface-dark);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin: 0;
  width: 100%;
}

/* Vista de tabla (desktop) */
.tickets-table-view {
  display: block;
  width: 100%;
}

.table-container {
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
  table-layout: fixed;
}

.tickets-table th {
  background: var(--surface-variant);
  color: var(--text-primary);
  padding: 0.75rem 0.5rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.8rem;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tickets-table td {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Anchos específicos para columnas */
.th-id,
.ticket-id {
  width: 8%;
}

.th-user,
.ticket-user {
  width: 12%;
}

.th-subject,
.ticket-subject {
  width: 25%;
}

.th-priority,
.ticket-priority {
  width: 8%;
}

.th-status,
.ticket-status {
  width: 10%;
}

.th-assigned,
.ticket-assigned {
  width: 12%;
}

.th-days,
.ticket-days {
  width: 6%;
}

.th-date,
.ticket-date {
  width: 9%;
}

.th-actions,
.ticket-actions {
  width: 10%;
}

.ticket-row:hover {
  background: rgba(0, 204, 204, 0.05);
}

.ticket-number {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: var(--primary-color);
  font-size: 0.75rem;
  background: rgba(0, 204, 204, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  display: inline-block;
  white-space: nowrap;
}

.user-info h4 {
  margin: 0 0 0.2rem 0;
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subject-content h4 {
  margin: 0 0 0.2rem 0;
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-preview {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.7rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Badges */
.priority-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.priority-red {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.priority-yellow {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.priority-green {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-blue {
  background: rgba(28, 148, 224, 0.2);
  color: #7dd3fc;
  border: 1px solid rgba(28, 148, 224, 0.3);
}

.status-yellow {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-green {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-gray {
  background: rgba(107, 114, 128, 0.2);
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.assigned-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.agent-name {
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.assignment-date {
  color: var(--text-muted);
  font-size: 0.65rem;
  white-space: nowrap;
}

.unassigned {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-style: italic;
}

.days-pending {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.days-pending.urgent {
  color: var(--error-color);
  font-weight: bold;
}

.ticket-date {
  color: var(--text-muted);
  font-size: 0.75rem;
  white-space: nowrap;
}

/* Acciones de tabla */
.ticket-actions {
  display: flex;
  gap: 0.3rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--surface-variant);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.btn-action:hover {
  background: var(--primary-color);
  color: var(--background-dark);
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.btn-action.assign-self {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--background-dark);
  border: none;
}

.btn-action.assign-self:hover {
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
}

/* Vista de tarjetas (móvil) */
.tickets-cards-view {
  display: none;
}

.tickets-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

.ticket-card {
  background: var(--surface-variant);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.ticket-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 1rem 0.5rem 1rem;
  gap: 1rem;
}

.ticket-id-badge {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--background-dark);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.priority-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.card-content {
  padding: 0 1rem 1rem 1rem;
}

.user-section {
  margin-bottom: 1rem;
}

.user-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.user-email {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
}

.subject-section {
  margin-bottom: 1rem;
}

.subject-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 0.5rem 0;
}

.message-preview {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.meta-item:last-child {
  border-bottom: none;
}

.meta-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

.meta-value {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.meta-value.urgent {
  color: var(--error-color);
}

/* Acciones de tarjetas */
.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid var(--border-color);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-dark);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--background-dark);
  border: none;
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
}

.action-btn.secondary {
  border-color: var(--warning-color);
  color: var(--warning-color);
}

.action-btn.secondary:hover {
  background: var(--warning-color);
  color: var(--background-dark);
}

.action-btn.info {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.action-btn.info:hover {
  background: var(--secondary-color);
  color: var(--background-dark);
}

.action-btn.success {
  border-color: var(--success-color);
  color: var(--success-color);
}

.action-btn.success:hover {
  background: var(--success-color);
  color: var(--background-dark);
}

/* Notificación de éxito */
.success-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, var(--success-color), #059669);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design - Mobile First */
@media (min-width: 1200px) {
  .tickets-table {
    min-width: 1100px;
  }

  .th-subject,
  .ticket-subject {
    width: 30%;
  }

  .th-user,
  .ticket-user {
    width: 15%;
  }

  .th-assigned,
  .ticket-assigned {
    width: 15%;
  }
}

@media (max-width: 1199px) and (min-width: 769px) {
  .tickets-table {
    min-width: 900px;
  }

  .th-subject,
  .ticket-subject {
    width: 20%;
  }

  .th-user,
  .ticket-user {
    width: 10%;
  }

  .th-assigned,
  .ticket-assigned {
    width: 10%;
  }

  .th-date,
  .ticket-date {
    width: 8%;
  }
}

@media (max-width: 768px) {
  .tickets-table-view {
    display: none;
  }

  .tickets-cards-view {
    display: block;
  }
}

@media (max-width: 768px) {
  .ticket-management {
    padding: 0.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .btn-refresh .btn-text {
    display: none;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .search-container {
    grid-column: 1;
  }

  .card-actions {
    flex-wrap: wrap;
  }

  .action-btn {
    min-width: calc(50% - 0.25rem);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .priority-status {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .action-btn {
    min-width: 100%;
    margin-bottom: 0.5rem;
  }

  .action-btn:last-child {
    margin-bottom: 0;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Tema de alto contraste */
@media (prefers-contrast: high) {
  :root {
    --border-color: #666;
    --text-muted: #ccc;
  }
}
</style>
