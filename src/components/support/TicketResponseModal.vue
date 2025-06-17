<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>💬 Responder Ticket {{ ticket.ticketId }}</h3>
        <button @click="closeModal" class="close-btn" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="response-form">
        <!-- Información del ticket -->
        <div class="ticket-summary">
          <div class="summary-item">
            <span class="summary-label">Usuario:</span>
            <span class="summary-value">{{ ticket.userName }} ({{ ticket.userEmail }})</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Asunto:</span>
            <span class="summary-value">{{ getSubjectLabel(ticket.asunto) }}</span>
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
        </div>

        <!-- Mensaje original -->
        <div class="original-message">
          <h4>📝 Mensaje Original:</h4>
          <div class="message-content">{{ ticket.mensaje }}</div>
        </div>

        <!-- Formulario de respuesta -->
        <form @submit.prevent="submitResponse">
          <div class="form-group">
            <label for="response" class="form-label">
              Tu Respuesta *
            </label>
            <textarea 
              id="response"
              v-model="form.response"
              class="form-textarea"
              rows="8"
              placeholder="Escribe tu respuesta detallada al usuario..."
              required
              maxlength="2000"
            ></textarea>
            <div class="character-count">
              {{ form.response.length }}/2000 caracteres
            </div>
          </div>

          <div class="form-group">
            <label for="newStatus" class="form-label">
              Cambiar Estado a:
            </label>
            <select 
              id="newStatus" 
              v-model="form.newStatus" 
              class="form-select"
            >
              <option value="en_proceso">En proceso</option>
              <option value="respondido">Respondido</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="form.sendEmail"
                class="form-checkbox"
              >
              <span class="checkbox-text">
                Enviar email de notificación al usuario
              </span>
            </label>
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
              type="submit" 
              class="btn btn-primary"
              :disabled="submitting || !isFormValid"
            >
              <span v-if="submitting">
                <i class="bi bi-arrow-clockwise spin"></i>
                Enviando...
              </span>
              <span v-else>
                <i class="bi bi-send"></i>
                Enviar Respuesta
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSupportStore, TICKET_SUBJECTS, TICKET_STATUSES } from '@/store/support'
import { useAuthStore } from '@/store/auth'

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'response-sent'])

const supportStore = useSupportStore()
const authStore = useAuthStore()

const form = ref({
  response: '',
  newStatus: 'respondido',
  sendEmail: true
})

const error = ref('')
const submitting = ref(false)

// Computed
const isFormValid = computed(() => {
  return form.value.response.trim().length >= 10 && 
         form.value.response.length <= 2000
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

const getStatusClass = (status) => {
  const info = getStatusInfo(status)
  return `status-${info.color}`
}

const submitResponse = async () => {
  if (!isFormValid.value) {
    error.value = 'Por favor escribe una respuesta válida (mínimo 10 caracteres)'
    return
  }

  error.value = ''
  submitting.value = true

  try {
    const result = await supportStore.respondToTicket(
      props.ticket.id,
      form.value.response.trim(),
      authStore.user.uid
    )

    if (result.success) {
      emit('response-sent', {
        ticketId: props.ticket.id,
        response: form.value.response,
        newStatus: form.value.newStatus,
        sendEmail: form.value.sendEmail
      })
      
      // Limpiar formulario
      form.value = {
        response: '',
        newStatus: 'respondido',
        sendEmail: true
      }
    } else {
      error.value = result.error || 'Error al enviar la respuesta'
    }

  } catch (err) {
    console.error('Error enviando respuesta:', err)
    error.value = 'Error inesperado al enviar la respuesta'
  } finally {
    submitting.value = false
  }
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
  max-width: 700px;
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

.response-form {
  padding: 0 24px 24px;
}

.ticket-summary {
  background: rgba(0, 204, 204, 0.05);
  border: 1px solid rgba(0, 204, 204, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  color: #888;
  font-size: 0.9rem;
  font-weight: 500;
}

.summary-value {
  color: #ffffff;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
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

.original-message {
  margin-bottom: 24px;
}

.original-message h4 {
  margin: 0 0 12px 0;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
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

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #ffffff;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-textarea, .form-select {
  width: 100%;
  padding: 12px 16px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

.form-textarea:focus, .form-select:focus {
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #00cccc;
}

.checkbox-text {
  color: #ffffff;
  font-size: 0.9rem;
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
  
  .modal-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
