<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>👥 Asignar Ticket {{ ticket.ticketId }}</h3>
        <button @click="closeModal" class="close-btn" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="assignment-form">
        <!-- Información del ticket -->
        <div class="ticket-summary">
          <h4>📋 Información del Ticket</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Usuario:</span>
              <span class="summary-value">{{ ticket.userName }} ({{ ticket.userEmail }})</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Asunto:</span>
              <span class="summary-value">{{ getSubjectLabel(ticket.asunto) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Prioridad:</span>
              <span 
                class="priority-badge" 
                :class="getPriorityClass(ticket.prioridad)"
              >
                {{ getPriorityInfo(ticket.prioridad).icon }} {{ getPriorityInfo(ticket.prioridad).label }}
              </span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Estado Actual:</span>
              <span 
                class="status-badge" 
                :class="getStatusClass(ticket.estado)"
              >
                {{ getStatusInfo(ticket.estado).icon }} {{ getStatusInfo(ticket.estado).label }}
              </span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Días Pendientes:</span>
              <span class="days-pending" :class="{ 'urgent': daysPending > 5 }">
                {{ daysPending }} días
              </span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Asignado Actualmente:</span>
              <span class="summary-value">
                {{ ticket.asignadoA ? getAgentName(ticket.asignadoA) : 'Sin asignar' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Mensaje del ticket -->
        <div class="ticket-message">
          <h4>📝 Mensaje:</h4>
          <div class="message-content">{{ ticket.mensaje }}</div>
        </div>

        <!-- Selección de agente -->
        <div class="agent-selection">
          <h4>🎧 Seleccionar Agente de Soporte</h4>
          
          <!-- Filtros de agentes -->
          <div class="agent-filters">
            <select v-model="specialtyFilter" class="filter-select">
              <option value="">Todas las especialidades</option>
              <option value="tecnico">Soporte Técnico</option>
              <option value="cuentas">Gestión de Cuentas</option>
              <option value="pagos">Problemas de Pago</option>
              <option value="general">Soporte General</option>
            </select>
            
            <select v-model="shiftFilter" class="filter-select">
              <option value="">Todos los turnos</option>
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
              <option value="flexible">Flexible</option>
            </select>
            
            <div class="workload-info">
              <i class="bi bi-info-circle"></i>
              <span>Se muestran agentes ordenados por carga de trabajo</span>
            </div>
          </div>

          <!-- Lista de agentes -->
          <div v-if="filteredAgents.length > 0" class="agents-list">
            <div 
              v-for="agent in filteredAgents" 
              :key="agent.id"
              class="agent-option"
              :class="{ 'selected': selectedAgent?.id === agent.id }"
              @click="selectAgent(agent)"
            >
              <div class="agent-info">
                <div class="agent-header">
                  <h5>{{ agent.nombre }} {{ agent.apellido }}</h5>
                  <span 
                    class="workload-indicator" 
                    :class="getWorkloadClass(agent.ticketsAsignados || 0)"
                  >
                    {{ getWorkloadLabel(agent.ticketsAsignados || 0) }}
                  </span>
                </div>
                
                <div class="agent-details">
                  <span class="agent-specialty">{{ getSpecialtyLabel(agent.especialidad) }}</span>
                  <span class="agent-shift">{{ getShiftLabel(agent.turno) }}</span>
                </div>
                
                <div class="agent-stats">
                  <div class="stat-item">
                    <span class="stat-label">Tickets:</span>
                    <span class="stat-value">{{ agent.ticketsAsignados || 0 }}/{{ agent.maxTicketsDiarios || 20 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Resueltos:</span>
                    <span class="stat-value success">{{ agent.ticketsResueltos || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Calificación:</span>
                    <div class="rating">
                      <span class="rating-value">{{ (agent.calificacionPromedio || 0).toFixed(1) }}</span>
                      <div class="stars">
                        <i 
                          v-for="n in 5" 
                          :key="n"
                          class="bi"
                          :class="n <= Math.round(agent.calificacionPromedio || 0) ? 'bi-star-fill' : 'bi-star'"
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="selection-indicator">
                <i class="bi bi-check-circle-fill"></i>
              </div>
            </div>
          </div>

          <!-- No hay agentes disponibles -->
          <div v-else class="no-agents">
            <div class="no-agents-icon">🎧</div>
            <h4>No hay agentes disponibles</h4>
            <p>{{ getNoAgentsMessage() }}</p>
          </div>
        </div>

        <!-- Opciones adicionales -->
        <div class="assignment-options">
          <h4>⚙️ Opciones de Asignación</h4>
          
          <div class="options-grid">
            <label class="checkbox-option">
              <input type="checkbox" v-model="options.changeStatus">
              <span class="checkmark"></span>
              <span class="option-text">Cambiar estado a "En proceso"</span>
            </label>
            
            <label class="checkbox-option">
              <input type="checkbox" v-model="options.notifyAgent">
              <span class="checkmark"></span>
              <span class="option-text">Notificar al agente por email</span>
            </label>
            
            <label class="checkbox-option">
              <input type="checkbox" v-model="options.notifyUser">
              <span class="checkmark"></span>
              <span class="option-text">Notificar al usuario sobre la asignación</span>
            </label>
          </div>
        </div>

        <!-- Comentario de asignación -->
        <div class="assignment-comment">
          <label for="comment" class="form-label">
            💬 Comentario de Asignación (Opcional)
          </label>
          <textarea 
            id="comment"
            v-model="assignmentComment"
            class="form-textarea"
            rows="3"
            placeholder="Agregar instrucciones especiales o contexto para el agente..."
            maxlength="500"
          ></textarea>
          <div class="character-count">
            {{ assignmentComment.length }}/500 caracteres
          </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
          <i class="bi bi-exclamation-triangle"></i>
          {{ error }}
        </div>

        <!-- Botones -->
        <div class="modal-actions">
          <button 
            type="button" 
            @click="closeModal" 
            class="btn btn-ghost"
            :disabled="submitting"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            @click="assignTicket" 
            class="btn btn-primary"
            :disabled="submitting || !selectedAgent"
          >
            <span v-if="submitting">
              <i class="bi bi-arrow-clockwise spin"></i>
              Asignando...
            </span>
            <span v-else>
              <i class="bi bi-person-check"></i>
              Asignar Ticket
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { TICKET_SUBJECTS, TICKET_STATUSES, TICKET_PRIORITIES } from '@/store/support'

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  },
  agents: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'ticket-assigned'])

const selectedAgent = ref(null)
const specialtyFilter = ref('')
const shiftFilter = ref('')
const assignmentComment = ref('')
const error = ref('')
const submitting = ref(false)

const options = ref({
  changeStatus: true,
  notifyAgent: true,
  notifyUser: true
})

// Computed
const daysPending = computed(() => {
  if (!props.ticket.fechaCreacion) return 0
  
  const createdDate = props.ticket.fechaCreacion.toDate ? 
    props.ticket.fechaCreacion.toDate() : 
    new Date(props.ticket.fechaCreacion)
  const now = new Date()
  const diffTime = Math.abs(now - createdDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const filteredAgents = computed(() => {
  let filtered = props.agents.filter(agent => agent.estado === 'activo')

  // Filtro por especialidad
  if (specialtyFilter.value) {
    filtered = filtered.filter(agent => agent.especialidad === specialtyFilter.value)
  }

  // Filtro por turno
  if (shiftFilter.value) {
    filtered = filtered.filter(agent => agent.turno === shiftFilter.value)
  }

  // Ordenar por carga de trabajo (menos tickets primero)
  return filtered.sort((a, b) => {
    const aTickets = a.ticketsAsignados || 0
    const bTickets = b.ticketsAsignados || 0
    
    // Priorizar agentes con menos carga
    if (aTickets !== bTickets) {
      return aTickets - bTickets
    }
    
    // Si tienen la misma carga, ordenar por calificación
    const aRating = a.calificacionPromedio || 0
    const bRating = b.calificacionPromedio || 0
    return bRating - aRating
  })
})

// Methods
const closeModal = () => {
  emit('close')
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

const getAgentName = (agentId) => {
  const agent = props.agents.find(a => a.id === agentId)
  return agent ? `${agent.nombre} ${agent.apellido}` : 'Agente desconocido'
}

const getSpecialtyLabel = (specialty) => {
  const labels = {
    'tecnico': '🔧 Técnico',
    'cuentas': '👤 Cuentas',
    'pagos': '💳 Pagos',
    'general': '📋 General'
  }
  return labels[specialty] || specialty || 'Sin especialidad'
}

const getShiftLabel = (shift) => {
  const labels = {
    'mañana': '🌅 Mañana',
    'tarde': '🌆 Tarde',
    'noche': '🌙 Noche',
    'flexible': '🔄 Flexible'
  }
  return labels[shift] || shift || 'Sin turno'
}

const getWorkloadClass = (tickets) => {
  if (tickets >= 20) return 'high'
  if (tickets >= 15) return 'medium'
  return 'low'
}

const getWorkloadLabel = (tickets) => {
  if (tickets >= 20) return '🔴 Alta carga'
  if (tickets >= 15) return '🟡 Media carga'
  return '🟢 Baja carga'
}

const getNoAgentsMessage = () => {
  if (specialtyFilter.value || shiftFilter.value) {
    return 'No hay agentes disponibles con esos filtros'
  }
  return 'No hay agentes de soporte activos en el sistema'
}

const selectAgent = (agent) => {
  selectedAgent.value = agent
  error.value = ''
}

const assignTicket = async () => {
  if (!selectedAgent.value) {
    error.value = 'Debes seleccionar un agente'
    return
  }

  error.value = ''
  submitting.value = true

  try {
    const updateData = {
      asignadoA: selectedAgent.value.id,
      fechaAsignacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp()
    }

    // Cambiar estado si está marcado
    if (options.value.changeStatus) {
      updateData.estado = 'en_proceso'
    }

    // Agregar comentario si existe
    if (assignmentComment.value.trim()) {
      updateData.comentarioAsignacion = assignmentComment.value.trim()
    }

    await updateDoc(doc(db, 'tickets', props.ticket.id), updateData)

    // Actualizar contador de tickets del agente
    await updateDoc(doc(db, 'users', selectedAgent.value.id), {
      ticketsAsignados: (selectedAgent.value.ticketsAsignados || 0) + 1,
      fechaActualizacion: serverTimestamp()
    })

    console.log(`✅ Ticket ${props.ticket.ticketId} asignado a ${selectedAgent.value.nombre}`)
    
    emit('ticket-assigned', {
      ticketId: props.ticket.id,
      agentId: selectedAgent.value.id,
      agentName: `${selectedAgent.value.nombre} ${selectedAgent.value.apellido}`,
      options: options.value,
      comment: assignmentComment.value
    })

  } catch (err) {
    console.error('Error asignando ticket:', err)
    error.value = 'Error al asignar el ticket. Inténtalo de nuevo.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // Auto-seleccionar el agente con menos carga si hay disponibles
  if (filteredAgents.value.length > 0) {
    selectedAgent.value = filteredAgents.value[0]
  }
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
  max-width: 800px;
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
  font-size: 1.3rem;
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

.assignment-form {
  padding: 0 24px 24px;
}

.ticket-summary,
.ticket-message,
.agent-selection,
.assignment-options,
.assignment-comment {
  margin-bottom: 24px;
}

.ticket-summary h4,
.ticket-message h4,
.agent-selection h4,
.assignment-options h4,
.assignment-comment label {
  margin: 0 0 12px 0;
  color: #00cccc;
  font-size: 1rem;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2a2a2a;
  border-radius: 6px;
}

.summary-label {
  color: #888;
  font-size: 0.9rem;
}

.summary-value {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 500;
}

.priority-badge, .status-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.priority-red {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
}

.priority-yellow {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.priority-green {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
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

.days-pending {
  color: #888;
  font-weight: 500;
}

.days-pending.urgent {
  color: #ff4757;
  font-weight: bold;
}

.message-content {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 16px;
  color: #ccc;
  line-height: 1.6;
  white-space: pre-wrap;
}

.agent-filters {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
  min-width: 150px;
}

.workload-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #888;
  font-size: 0.8rem;
  margin-left: auto;
}

.agents-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.agent-option {
  background: #2a2a2a;
  border: 2px solid #444;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.agent-option:hover {
  background: #333;
  border-color: #00cccc;
}

.agent-option.selected {
  background: rgba(0, 204, 204, 0.1);
  border-color: #00cccc;
}

.agent-info {
  flex: 1;
}

.agent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.agent-header h5 {
  margin: 0;
  color: #ffffff;
  font-size: 1rem;
}

.workload-indicator {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.workload-indicator.low {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.workload-indicator.medium {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.workload-indicator.high {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
}

.agent-details {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.agent-specialty, .agent-shift {
  color: #888;
  font-size: 0.8rem;
}

.agent-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  color: #888;
  font-size: 0.8rem;
}

.stat-value {
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 500;
}

.stat-value.success {
  color: #28a745;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-value {
  color: #00cccc;
  font-weight: bold;
  font-size: 0.8rem;
}

.stars {
  color: #ffc107;
  font-size: 0.7rem;
}

.selection-indicator {
  color: #00cccc;
  font-size: 1.2rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.agent-option.selected .selection-indicator {
  opacity: 1;
}

.no-agents {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}

.no-agents-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.no-agents h4 {
  margin: 0 0 8px 0;
  color: #ffffff;
}

.no-agents p {
  margin: 0;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #ffffff;
}

.checkbox-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #00cccc;
}

.option-text {
  font-size: 0.9rem;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.form-textarea:focus {
  outline: none;
  border-color: #00cccc;
  box-shadow: 0 0 0 3px rgba(0, 204, 204, 0.1);
}

.character-count {
  text-align: right;
  color: #888;
  font-size: 0.8rem;
  margin-top: 4px;
}

.error-message {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  color: #ff4757;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  color: #888;
  border: 1px solid #444;
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.btn-primary {
  background: #00cccc;
  color: #121212;
}

.btn-primary:hover:not(:disabled) {
  background: #1c94e0;
  transform: translateY(-1px);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .agent-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .workload-info {
    margin-left: 0;
  }
  
  .agent-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .agent-details {
    flex-direction: column;
    gap: 4px;
  }
  
  .agent-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
