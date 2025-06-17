<template>
  <div class="ticket-management">
    <div class="header-section">
      <h2>🎫 Gestión de Tickets</h2>
      <p>Administra todos los tickets del sistema y asigna agentes de soporte</p>
      
      <div class="header-stats">
        <div class="stat-card">
          <span class="stat-number">{{ allTickets.length }}</span>
          <span class="stat-label">Total Tickets</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ unassignedTickets.length }}</span>
          <span class="stat-label">Sin Asignar</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ urgentTickets.length }}</span>
          <span class="stat-label">Urgentes</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ overdueTickets.length }}</span>
          <span class="stat-label">Vencidos</span>
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
        
        <select v-model="priorityFilter" class="filter-select">
          <option value="">Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        
        <select v-model="assignmentFilter" class="filter-select">
          <option value="">Todos</option>
          <option value="unassigned">Sin asignar</option>
          <option value="assigned">Asignados</option>
          <option value="self">Asignados a mí</option>
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
        
        <button @click="loadAllTickets" class="btn btn-secondary" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i>
          Actualizar
        </button>
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
            <th>Asignado a</th>
            <th>Días Pendientes</th>
            <th>Fecha Creación</th>
            <th>Acciones Admin</th>
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
              <button 
                v-if="!ticket.asignadoA"
                @click="assignToSelf(ticket)" 
                class="btn-action assign-self"
                title="Asignarme este ticket"
              >
                <i class="bi bi-person-check"></i>
              </button>
              
              <!-- Asignar a agente -->
              <button 
                @click="showAssignModal(ticket)" 
                class="btn-action assign"
                title="Asignar a agente"
              >
                <i class="bi bi-people"></i>
              </button>
              
              <!-- Ver detalles -->
              <button 
                @click="viewTicket(ticket)" 
                class="btn-action view"
                title="Ver detalles"
              >
                <i class="bi bi-eye"></i>
              </button>
              
              <!-- Responder (si está asignado al admin) -->
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

    <!-- Modal de asignación -->
    <TicketAssignmentModal 
      v-if="showAssignmentModal && selectedTicket"
      :ticket="selectedTicket"
      :agents="supportAgents"
      @close="closeAssignmentModal"
      @ticket-assigned="onTicketAssigned"
    />

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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useSupportStore, TICKET_SUBJECTS, TICKET_STATUSES, TICKET_PRIORITIES } from '@/store/support'
import { useAuthStore } from '@/store/auth'
import TicketDetailModal from '@/components/support/TicketDetailModal.vue'
import TicketResponseModal from '@/components/support/TicketResponseModal.vue'
import TicketAssignmentModal from './TicketAssignmentModal.vue'

const supportStore = useSupportStore()
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
@import '@/styles/support-dashboard.css';

.ticket-management {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.header-section h2 {
  font-size: 2.5rem;
  margin-bottom: 12px;
  color: #00cccc;
}

.header-section p {
  font-size: 1.1rem;
  color: #ccc;
  margin-bottom: 24px;
}

.header-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.stat-card {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: #333;
  transform: translateY(-2px);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #00cccc;
  margin-bottom: 8px;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #ccc;
}

.ticket-assigned {
  text-align: center;
}

.assigned-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.agent-name {
  color: #00cccc;
  font-weight: 500;
  font-size: 0.9rem;
}

.assignment-date {
  color: #888;
  font-size: 0.8rem;
}

.unassigned {
  color: #888;
  font-style: italic;
  font-size: 0.9rem;
}

.btn-action.assign-self {
  background: linear-gradient(135deg, #00cccc, #1c94e0);
  color: #121212;
  border: none;
}

.btn-action.assign-self:hover {
  background: linear-gradient(135deg, #1c94e0, #00cccc);
  transform: translateY(-1px);
}

.btn-action.assign:hover {
  color: #ffc107;
  border-color: #ffc107;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .header-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tickets-table {
    min-width: 1200px;
  }
}
</style>
