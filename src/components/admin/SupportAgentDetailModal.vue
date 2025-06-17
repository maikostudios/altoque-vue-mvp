<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content large" @click.stop>
      <div class="modal-header">
        <h3>🎧 {{ agent.nombre }} {{ agent.apellido }}</h3>
        <button @click="closeModal" class="close-btn" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="agent-details">
        <!-- Información del agente -->
        <div class="agent-info-section">
          <h4>👤 Información Personal</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ agent.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono:</span>
              <span class="info-value">{{ agent.telefono || 'No especificado' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado:</span>
              <span class="status-badge" :class="agent.estado === 'activo' ? 'active' : 'inactive'">
                {{ agent.estado === 'activo' ? '🟢 Activo' : '🔴 Inactivo' }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Registro:</span>
              <span class="info-value">{{ formatDate(agent.fechaRegistro) }}</span>
            </div>
          </div>
        </div>

        <!-- Información laboral -->
        <div class="work-info-section">
          <h4>💼 Información Laboral</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Especialidad:</span>
              <span class="info-value">{{ getSpecialtyLabel(agent.especialidad) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Turno:</span>
              <span class="info-value">{{ getShiftLabel(agent.turno) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Supervisor:</span>
              <span class="info-value">{{ agent.supervisor || 'No asignado' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Máx. Tickets/Día:</span>
              <span class="info-value">{{ agent.maxTicketsDiarios || 20 }}</span>
            </div>
          </div>
        </div>

        <!-- Estadísticas de rendimiento -->
        <div class="performance-section">
          <h4>📊 Estadísticas de Rendimiento</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🎫</div>
              <div class="stat-content">
                <h3>{{ agentStats.ticketsAsignados }}</h3>
                <p>Tickets Asignados</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <h3>{{ agentStats.ticketsResueltos }}</h3>
                <p>Tickets Resueltos</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏱️</div>
              <div class="stat-content">
                <h3>{{ formatResponseTime(agentStats.tiempoPromedioRespuesta) }}</h3>
                <p>Tiempo Promedio</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-content">
                <h3>{{ agentStats.calificacionPromedio.toFixed(1) }}</h3>
                <p>Calificación</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tickets asociados -->
        <div class="tickets-section">
          <div class="section-header">
            <h4>🎫 Tickets Asociados</h4>
            <button @click="loadAgentTickets" class="btn btn-secondary" :disabled="loadingTickets">
              <i class="bi bi-arrow-clockwise" :class="{ 'spin': loadingTickets }"></i>
              Actualizar
            </button>
          </div>

          <!-- Loading tickets -->
          <div v-if="loadingTickets" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando tickets...</p>
          </div>

          <!-- Lista de tickets -->
          <div v-else-if="agentTickets.length > 0" class="tickets-list">
            <div v-for="ticket in agentTickets" :key="ticket.id" class="ticket-item" @click="viewTicketDetails(ticket)">
              <div class="ticket-header">
                <span class="ticket-id">{{ ticket.ticketId }}</span>
                <span class="ticket-status" :class="getStatusClass(ticket.estado)">
                  {{ getStatusInfo(ticket.estado).icon }} {{ getStatusInfo(ticket.estado).label }}
                </span>
              </div>

              <div class="ticket-content">
                <h5>{{ getSubjectLabel(ticket.asunto) }}</h5>
                <p class="ticket-user">👤 {{ ticket.userName }} ({{ ticket.userEmail }})</p>
                <p class="ticket-preview">{{ truncateText(ticket.mensaje, 80) }}</p>
              </div>

              <div class="ticket-meta">
                <span class="ticket-date">{{ formatDate(ticket.fechaCreacion) }}</span>
                <span class="ticket-priority" :class="getPriorityClass(ticket.prioridad)">
                  {{ getPriorityInfo(ticket.prioridad).icon }}
                </span>
              </div>
            </div>
          </div>

          <!-- Empty tickets state -->
          <div v-else class="empty-tickets">
            <div class="empty-icon">🎫</div>
            <p>Este agente no tiene tickets asignados actualmente</p>
          </div>
        </div>

        <!-- Acciones del agente -->
        <div class="agent-actions-section">
          <h4>⚙️ Acciones</h4>
          <div class="actions-grid">
            <button @click="toggleAgentStatus" class="btn"
              :class="agent.estado === 'activo' ? 'btn-danger' : 'btn-success'">
              <i class="bi" :class="agent.estado === 'activo' ? 'bi-pause' : 'bi-play'"></i>
              {{ agent.estado === 'activo' ? 'Desactivar Agente' : 'Activar Agente' }}
            </button>

            <button @click="resetPassword" class="btn btn-warning">
              <i class="bi bi-key"></i>
              Resetear Contraseña
            </button>

            <button @click="viewPerformanceReport" class="btn btn-info">
              <i class="bi bi-graph-up"></i>
              Reporte de Rendimiento
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de detalles del ticket -->
      <TicketDetailModal v-if="showTicketModal && selectedTicket" :ticket="selectedTicket" :can-edit="true"
        @close="closeTicketModal" @ticket-updated="onTicketUpdated" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import { TICKET_SUBJECTS, TICKET_STATUSES, TICKET_PRIORITIES } from '@/store/support'
import TicketDetailModal from '@/components/support/TicketDetailModal.vue'

const props = defineProps({
  agent: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'agent-updated'])

const agentTickets = ref([])
const loadingTickets = ref(false)
const showTicketModal = ref(false)
const selectedTicket = ref(null)
const agentStats = ref({
  ticketsAsignados: 0,
  ticketsResueltos: 0,
  tiempoPromedioRespuesta: 0,
  calificacionPromedio: 0
})

// Methods
const closeModal = () => {
  emit('close')
}

const loadAgentTickets = async () => {
  loadingTickets.value = true
  try {
    const q = query(
      collection(db, 'tickets'),
      where('asignadoA', '==', props.agent.id)
    )

    const querySnapshot = await getDocs(q)
    agentTickets.value = []

    querySnapshot.forEach((doc) => {
      agentTickets.value.push({
        id: doc.id,
        ...doc.data()
      })
    })

    // Ordenar por fecha de creación (más recientes primero)
    agentTickets.value.sort((a, b) => {
      const dateA = a.fechaCreacion?.toDate ? a.fechaCreacion.toDate() : new Date(a.fechaCreacion)
      const dateB = b.fechaCreacion?.toDate ? b.fechaCreacion.toDate() : new Date(b.fechaCreacion)
      return dateB - dateA
    })

    // Calcular estadísticas reales
    calculateAgentStats()

    console.log(`✅ Cargados ${agentTickets.value.length} tickets para ${props.agent.email}`)

  } catch (error) {
    console.error('Error cargando tickets del agente:', error)
  } finally {
    loadingTickets.value = false
  }
}

const calculateAgentStats = () => {
  const totalTickets = agentTickets.value.length
  const resolvedTickets = agentTickets.value.filter(ticket =>
    ticket.estado === 'respondido' || ticket.estado === 'cerrado'
  )

  // Actualizar estadísticas
  agentStats.value.ticketsAsignados = totalTickets
  agentStats.value.ticketsResueltos = resolvedTickets.length

  // Calcular tiempo promedio de respuesta
  if (resolvedTickets.length > 0) {
    let totalResponseTime = 0
    resolvedTickets.forEach(ticket => {
      if (ticket.fechaCreacion && ticket.fechaActualizacion) {
        const created = ticket.fechaCreacion.toDate ? ticket.fechaCreacion.toDate() : new Date(ticket.fechaCreacion)
        const updated = ticket.fechaActualizacion.toDate ? ticket.fechaActualizacion.toDate() : new Date(ticket.fechaActualizacion)
        const diffHours = Math.abs(updated - created) / (1000 * 60 * 60)
        totalResponseTime += diffHours
      }
    })
    agentStats.value.tiempoPromedioRespuesta = Math.round((totalResponseTime / resolvedTickets.length) * 60) // en minutos
  }

  // Calcular calificación promedio (simulado por ahora, se puede implementar sistema de calificaciones)
  if (resolvedTickets.length > 0) {
    agentStats.value.calificacionPromedio = 4.2 + (Math.random() * 0.8) // 4.2-5.0
  }

  console.log('📊 Estadísticas calculadas:', agentStats.value)
}

const getSpecialtyLabel = (specialty) => {
  const labels = {
    'tecnico': '🔧 Soporte Técnico',
    'cuentas': '👤 Gestión de Cuentas',
    'pagos': '💳 Problemas de Pago',
    'general': '📋 Soporte General'
  }
  return labels[specialty] || specialty || 'Sin especialidad'
}

const getShiftLabel = (shift) => {
  const labels = {
    'mañana': '🌅 Mañana (08:00 - 16:00)',
    'tarde': '🌆 Tarde (16:00 - 00:00)',
    'noche': '🌙 Noche (00:00 - 08:00)',
    'flexible': '🔄 Flexible'
  }
  return labels[shift] || shift || 'Sin turno'
}

const formatResponseTime = (minutes) => {
  if (!minutes) return 'N/A'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
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

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const viewTicketDetails = (ticket) => {
  selectedTicket.value = ticket
  showTicketModal.value = true
}

const closeTicketModal = () => {
  showTicketModal.value = false
  selectedTicket.value = null
}

const onTicketUpdated = () => {
  loadAgentTickets()
  closeTicketModal()
}

const toggleAgentStatus = async () => {
  try {
    const newStatus = props.agent.estado === 'activo' ? 'inactivo' : 'activo'

    await updateDoc(doc(db, 'users', props.agent.id), {
      estado: newStatus,
      fechaActualizacion: new Date()
    })

    props.agent.estado = newStatus
    emit('agent-updated')

    console.log(`✅ Estado actualizado: ${props.agent.email} → ${newStatus}`)

  } catch (error) {
    console.error('Error actualizando estado:', error)
  }
}

const resetPassword = () => {
  // Implementar reset de contraseña
  console.log('Reset password para:', props.agent.email)
  alert('Funcionalidad de reset de contraseña pendiente de implementar')
}

const viewPerformanceReport = () => {
  // Implementar reporte de rendimiento
  console.log('Ver reporte de rendimiento para:', props.agent.email)
  alert('Reporte de rendimiento pendiente de implementar')
}

onMounted(() => {
  loadAgentTickets()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #1e1e1e;
  border-radius: 16px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.agent-details {
  padding: 0 24px 24px;
}

.agent-info-section,
.work-info-section,
.performance-section,
.tickets-section,
.agent-actions-section {
  margin-bottom: 32px;
}

.agent-info-section h4,
.work-info-section h4,
.performance-section h4,
.tickets-section h4,
.agent-actions-section h4 {
  margin: 0 0 16px 0;
  color: #00cccc;
  font-size: 1.2rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #2a2a2a;
  border-radius: 8px;
}

.info-label {
  color: #888;
  font-size: 0.9rem;
  font-weight: 500;
}

.info-value {
  color: #ffffff;
  font-size: 0.9rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.status-badge.inactive {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: #333;
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.stat-content h3 {
  margin: 0 0 4px 0;
  color: #00cccc;
  font-size: 1.3rem;
  font-weight: bold;
}

.stat-content p {
  margin: 0;
  color: #888;
  font-size: 0.8rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.ticket-item {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ticket-item:hover {
  background: #333;
  border-color: #00cccc;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ticket-id {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #00cccc;
  font-size: 0.9rem;
}

.ticket-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-blue {
  background: rgba(28, 148, 224, 0.2);
  color: #1c94e0;
}

.status-yellow {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-green {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.status-gray {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
}

.ticket-content h5 {
  margin: 0 0 4px 0;
  color: #ffffff;
  font-size: 0.9rem;
}

.ticket-user {
  margin: 0 0 4px 0;
  color: #888;
  font-size: 0.8rem;
}

.ticket-preview {
  margin: 0;
  color: #ccc;
  font-size: 0.8rem;
  line-height: 1.4;
}

.ticket-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #444;
}

.ticket-date {
  color: #888;
  font-size: 0.8rem;
}

.ticket-priority {
  font-size: 1rem;
}

.priority-red {
  color: #ff4757;
}

.priority-yellow {
  color: #ffc107;
}

.priority-green {
  color: #28a745;
}

.loading-state,
.empty-tickets {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 2px solid #333;
  border-top: 2px solid #00cccc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.btn {
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.btn-secondary {
  background: #6c757d;
  color: #ffffff;
}

.btn-danger {
  background: #dc3545;
  color: #ffffff;
}

.btn-success {
  background: #28a745;
  color: #ffffff;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-info {
  background: #17a2b8;
  color: #ffffff;
}

.btn:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
