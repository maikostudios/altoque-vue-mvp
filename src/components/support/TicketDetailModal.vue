<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content large" @click.stop>
      <div class="modal-header">
        <h3>🎫 Ticket {{ ticket.ticketId }}</h3>
        <button @click="closeModal" class="close-btn" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="ticket-details">
        <!-- Información del ticket -->
        <div class="ticket-info-grid">
          <div class="info-item">
            <span class="info-label">Estado:</span>
            <span 
              class="status-badge" 
              :class="getStatusClass(ticket.estado)"
            >
              {{ getStatusInfo(ticket.estado).icon }} {{ getStatusInfo(ticket.estado).label }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Prioridad:</span>
            <span 
              class="priority-badge" 
              :class="getPriorityClass(ticket.prioridad)"
            >
              {{ getPriorityInfo(ticket.prioridad).icon }} {{ getPriorityInfo(ticket.prioridad).label }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Usuario:</span>
            <span class="info-value">{{ ticket.userName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ ticket.userEmail }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Asunto:</span>
            <span class="info-value">{{ getSubjectLabel(ticket.asunto) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Creado:</span>
            <span class="info-value">{{ formatDate(ticket.fechaCreacion) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Actualizado:</span>
            <span class="info-value">{{ formatDate(ticket.fechaActualizacion) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Días Pendientes:</span>
            <span class="info-value" :class="{ 'urgent': daysPending > 5 }">
              {{ daysPending }} días
            </span>
          </div>
        </div>

        <!-- Mensaje original -->
        <div class="ticket-message">
          <h4>📝 Mensaje Original:</h4>
          <div class="message-content">{{ ticket.mensaje }}</div>
        </div>

        <!-- Respuesta del soporte -->
        <div v-if="ticket.respuesta" class="support-response">
          <h4>💬 Respuesta del Soporte:</h4>
          <div class="response-content">{{ ticket.respuesta }}</div>
        </div>

        <!-- Historial de comunicación -->
        <div v-if="ticket.historial && ticket.historial.length > 0" class="ticket-history">
          <h4>📋 Historial de Comunicación:</h4>
          <div class="history-list">
            <div 
              v-for="(entry, index) in ticket.historial" 
              :key="index"
              class="history-entry"
              :class="entry.autor"
            >
              <div class="history-header">
                <span class="history-user">{{ entry.usuario }}</span>
                <span class="history-date">{{ formatDate(entry.fecha) }}</span>
              </div>
              <div class="history-message">{{ entry.mensaje }}</div>
              <div v-if="entry.estado" class="history-status">
                Estado: {{ getStatusInfo(entry.estado).label }}
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones (solo para soporte) -->
        <div v-if="canEdit" class="ticket-actions-section">
          <h4>⚙️ Acciones:</h4>
          <div class="actions-grid">
            <div class="action-group">
              <label>Cambiar Estado:</label>
              <select v-model="newStatus" class="action-select">
                <option value="recibido">Recibido</option>
                <option value="en_proceso">En proceso</option>
                <option value="respondido">Respondido</option>
                <option value="cerrado">Cerrado</option>
              </select>
              <button @click="updateStatus" class="btn btn-secondary">
                Actualizar Estado
              </button>
            </div>
            
            <div v-if="!ticket.asignadoA" class="action-group">
              <button @click="assignToMe" class="btn btn-primary">
                <i class="bi bi-person-plus"></i>
                Asignarme este Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { TICKET_SUBJECTS, TICKET_STATUSES, TICKET_PRIORITIES } from '@/store/support'
import { useAuthStore } from '@/store/auth'

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'ticket-updated'])

const authStore = useAuthStore()
const newStatus = ref(props.ticket.estado)

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

const updateStatus = () => {
  // Implementar actualización de estado
  emit('ticket-updated', {
    action: 'status-change',
    ticketId: props.ticket.id,
    newStatus: newStatus.value
  })
}

const assignToMe = () => {
  // Implementar asignación
  emit('ticket-updated', {
    action: 'assign',
    ticketId: props.ticket.id,
    assignTo: authStore.user.uid
  })
}
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
  max-width: 900px;
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

.ticket-details {
  padding: 0 24px 24px;
}

.ticket-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
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

.info-value.urgent {
  color: #ff4757;
  font-weight: bold;
}

.priority-badge, .status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.priority-red {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.priority-yellow {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.priority-green {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.status-blue {
  background: rgba(28, 148, 224, 0.2);
  color: #1c94e0;
  border: 1px solid rgba(28, 148, 224, 0.3);
}

.status-yellow {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-green {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.status-gray {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.3);
}

.ticket-message, .support-response, .ticket-history, .ticket-actions-section {
  margin-bottom: 24px;
}

.ticket-message h4, .support-response h4, .ticket-history h4, .ticket-actions-section h4 {
  margin: 0 0 12px 0;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
}

.message-content, .response-content {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 16px;
  color: #ccc;
  line-height: 1.6;
  white-space: pre-wrap;
}

.support-response .response-content {
  background: rgba(0, 204, 204, 0.05);
  border-color: rgba(0, 204, 204, 0.2);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-entry {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 16px;
}

.history-entry.soporte {
  background: rgba(0, 204, 204, 0.05);
  border-color: rgba(0, 204, 204, 0.2);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-user {
  font-weight: 600;
  color: #ffffff;
}

.history-date {
  color: #888;
  font-size: 0.8rem;
}

.history-message {
  color: #ccc;
  line-height: 1.5;
  margin-bottom: 8px;
}

.history-status {
  color: #00cccc;
  font-size: 0.8rem;
  font-weight: 500;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-group label {
  color: #ffffff;
  font-weight: 500;
  font-size: 0.9rem;
}

.action-select {
  padding: 8px 12px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
}

.action-select:focus {
  outline: none;
  border-color: #00cccc;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.btn-primary {
  background: #00cccc;
  color: #121212;
}

.btn-primary:hover {
  background: #1c94e0;
}

.btn-secondary {
  background: #6c757d;
  color: #ffffff;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .ticket-info-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
