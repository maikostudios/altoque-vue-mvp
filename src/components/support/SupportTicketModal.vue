<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>🎫 Crear Ticket de Soporte</h3>
        <button @click="closeModal" class="close-btn" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <form @submit.prevent="submitTicket" class="ticket-form">
        <div class="form-group">
          <label for="asunto" class="form-label">
            Asunto *
          </label>
          <select id="asunto" v-model="form.asunto" class="form-select" required>
            <option value="">Selecciona un asunto</option>
            <option v-for="subject in ticketSubjects" :key="subject.value" :value="subject.value">
              {{ subject.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="prioridad" class="form-label">
            Prioridad
          </label>
          <select id="prioridad" v-model="form.prioridad" class="form-select">
            <option value="baja">🟢 Baja - No es urgente</option>
            <option value="media">🟡 Media - Necesito ayuda pronto</option>
            <option value="alta">🔴 Alta - Es urgente</option>
          </select>
        </div>

        <div class="form-group">
          <label for="mensaje" class="form-label">
            Describe tu problema *
          </label>
          <textarea id="mensaje" v-model="form.mensaje" class="form-textarea" rows="6"
            placeholder="Describe detalladamente tu problema para que podamos ayudarte mejor..." required
            maxlength="1000"></textarea>
          <div class="character-count">
            {{ form.mensaje.length }}/1000 caracteres
          </div>
        </div>

        <!-- Información adicional -->
        <div class="info-section">
          <h4>📋 Información del ticket</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Usuario:</span>
              <span class="info-value">{{ userInfo.nombre }} {{ userInfo.apellido }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ userInfo.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Plan:</span>
              <span class="info-value">{{ userInfo.tipoPlan || 'Gratuito' }}</span>
            </div>
          </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
          <i class="bi bi-exclamation-triangle"></i>
          {{ error }}
        </div>

        <!-- Botones -->
        <div class="modal-actions">
          <button type="button" @click="closeModal" class="btn btn-ghost" :disabled="submitting">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="submitting || !isFormValid">
            <span v-if="submitting">
              <i class="bi bi-arrow-clockwise spin"></i>
              Enviando...
            </span>
            <span v-else>
              <i class="bi bi-send"></i>
              Enviar Ticket
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSupportStore, TICKET_SUBJECTS } from '@/store/support'
import { useAuthStore } from '@/store/auth'

const emit = defineEmits(['close', 'ticket-created'])

const supportStore = useSupportStore()
const authStore = useAuthStore()

const form = ref({
  asunto: '',
  prioridad: 'media',
  mensaje: ''
})

const error = ref('')
const submitting = computed(() => supportStore.submitting)
const ticketSubjects = TICKET_SUBJECTS

// Props del usuario (se pueden pasar desde el componente padre)
const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

// Computed
const isFormValid = computed(() => {
  return form.value.asunto &&
    form.value.mensaje.trim().length >= 10 &&
    form.value.mensaje.length <= 1000
})

// Methods
const closeModal = () => {
  emit('close')
}

const submitTicket = async () => {
  if (!isFormValid.value) {
    error.value = 'Por favor completa todos los campos requeridos'
    return
  }

  error.value = ''

  try {
    const ticketData = {
      userId: authStore.user.uid,
      userEmail: authStore.user.email,
      userName: `${props.userInfo.nombre || ''} ${props.userInfo.apellido || ''}`.trim(),
      asunto: form.value.asunto,
      prioridad: form.value.prioridad,
      mensaje: form.value.mensaje.trim()
    }

    const result = await supportStore.createTicket(ticketData)

    if (result.success) {
      // Mostrar mensaje de éxito
      emit('ticket-created', {
        ticketId: result.ticketId,
        message: `Ticket #${result.ticketId} creado exitosamente`
      })

      // Limpiar formulario
      form.value = {
        asunto: '',
        prioridad: 'media',
        mensaje: ''
      }

      closeModal()
    } else {
      error.value = result.error || 'Error al crear el ticket'
    }

  } catch (err) {
    console.error('Error creando ticket:', err)
    error.value = 'Error inesperado al crear el ticket'
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.ticket-form {
  padding: 24px;
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

.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #00cccc;
  box-shadow: 0 0 0 3px rgba(0, 204, 204, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  line-height: 1.5;
}

.character-count {
  text-align: right;
  color: #888;
  font-size: 0.8rem;
  margin-top: 4px;
}

.info-section {
  background: rgba(0, 204, 204, 0.05);
  border: 1px solid rgba(0, 204, 204, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-section h4 {
  margin: 0 0 12px 0;
  color: #00cccc;
  font-size: 0.9rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: #888;
  font-size: 0.8rem;
}

.info-value {
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 500;
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
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }

  .modal-header {
    padding: 20px 20px 0;
  }

  .ticket-form {
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
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
