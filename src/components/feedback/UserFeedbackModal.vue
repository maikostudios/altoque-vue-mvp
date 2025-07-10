<template>
  <v-dialog v-model="show" max-width="600px" persistent>
    <v-card class="feedback-modal">
      <!-- Header -->
      <v-card-title class="modal-header">
        <div class="header-content">
          <v-icon size="32" color="turquesa">mdi-message-text</v-icon>
          <div>
            <h2>Enviar Comentarios</h2>
            <p class="header-subtitle">Tu opinión nos ayuda a mejorar</p>
          </div>
        </div>
        <v-btn @click="show = false" icon variant="text" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="modal-content">
        <v-form ref="feedbackForm" v-model="formValid">
          <!-- Tipo de Feedback -->
          <div class="form-section">
            <h3 class="section-title">
              <v-icon left color="turquesa">mdi-tag</v-icon>
              Tipo de Comentario
            </h3>

            <v-radio-group v-model="feedback.type" :rules="[rules.required]">
              <v-radio v-for="type in feedbackTypes" :key="type.value" :label="type.label" :value="type.value"
                color="turquesa">
                <template #label>
                  <div class="radio-label">
                    <v-icon :color="type.color" size="small">{{ type.icon }}</v-icon>
                    <span>{{ type.label }}</span>
                    <span class="type-description">{{ type.description }}</span>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </div>

          <!-- Título -->
          <div class="form-section">
            <h3 class="section-title">
              <v-icon left color="turquesa">mdi-format-title</v-icon>
              Título
            </h3>

            <v-text-field v-model="feedback.title" :rules="[rules.required, rules.minLength(5)]"
              label="Título del comentario" placeholder="Describe brevemente tu comentario" variant="outlined"
              color="turquesa" maxlength="100" counter />
          </div>

          <!-- Mensaje -->
          <div class="form-section">
            <h3 class="section-title">
              <v-icon left color="turquesa">mdi-message-text-outline</v-icon>
              Mensaje
            </h3>

            <v-textarea v-model="feedback.message" :rules="[rules.required, rules.minLength(10)]"
              label="Describe tu comentario en detalle"
              placeholder="Cuéntanos más sobre tu experiencia, sugerencia o problema..." variant="outlined"
              color="turquesa" rows="4" maxlength="1000" counter />
          </div>

          <!-- Información del Usuario (opcional) -->
          <div class="form-section">
            <h3 class="section-title">
              <v-icon left color="turquesa">mdi-account-circle</v-icon>
              Información de Contacto (Opcional)
            </h3>

            <v-text-field v-model="feedback.contactEmail" :rules="[rules.email]" label="Email de contacto"
              placeholder="Si quieres que te contactemos" variant="outlined" color="turquesa" type="email" />
          </div>

          <!-- Prioridad -->
          <div class="form-section" v-if="feedback.type === 'error' || feedback.type === 'bug'">
            <h3 class="section-title">
              <v-icon left color="warning">mdi-alert</v-icon>
              Prioridad
            </h3>

            <v-select v-model="feedback.priority" :items="priorityOptions" label="Nivel de prioridad" variant="outlined"
              color="turquesa" />
          </div>

          <!-- Información del Sistema -->
          <div class="system-info">
            <v-expansion-panels variant="accordion">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon left>mdi-information</v-icon>
                  Información del Sistema (Automática)
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="info-grid">
                    <div class="info-item">
                      <strong>Navegador:</strong> {{ systemInfo.browser }}
                    </div>
                    <div class="info-item">
                      <strong>Dispositivo:</strong> {{ systemInfo.device }}
                    </div>
                    <div class="info-item">
                      <strong>Resolución:</strong> {{ systemInfo.viewport }}
                    </div>
                    <div class="info-item">
                      <strong>Página actual:</strong> {{ systemInfo.currentPage }}
                    </div>
                    <div class="info-item">
                      <strong>Fecha:</strong> {{ systemInfo.timestamp }}
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-form>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="modal-actions">
        <v-btn @click="show = false" variant="outlined">
          Cancelar
        </v-btn>

        <v-spacer />

        <v-btn @click="submitFeedback" :loading="submitting" :disabled="!formValid" color="turquesa" variant="elevated">
          <v-icon left>mdi-send</v-icon>
          Enviar Comentario
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'feedback-sent'])

// Stores
const authStore = useAuthStore()

// Reactive data
const feedbackForm = ref(null)
const formValid = ref(false)
const submitting = ref(false)

const feedback = ref({
  type: '',
  title: '',
  message: '',
  contactEmail: '',
  priority: 'medium'
})

const systemInfo = ref({
  browser: '',
  device: '',
  viewport: '',
  currentPage: '',
  timestamp: ''
})

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Configuration
const feedbackTypes = [
  {
    value: 'suggestion',
    label: 'Sugerencia',
    description: 'Ideas para mejorar la aplicación',
    icon: 'mdi-lightbulb',
    color: 'warning'
  },
  {
    value: 'bug',
    label: 'Error/Bug',
    description: 'Algo no funciona como debería',
    icon: 'mdi-bug',
    color: 'error'
  },
  {
    value: 'question',
    label: 'Pregunta',
    description: 'Necesitas ayuda o tienes dudas',
    icon: 'mdi-help-circle',
    color: 'info'
  },
  {
    value: 'compliment',
    label: 'Felicitación',
    description: 'Algo que te gustó mucho',
    icon: 'mdi-heart',
    color: 'success'
  },
  {
    value: 'feature',
    label: 'Nueva Función',
    description: 'Solicitar una función nueva',
    icon: 'mdi-plus-circle',
    color: 'turquesa'
  }
]

const priorityOptions = [
  { title: 'Baja - No es urgente', value: 'low' },
  { title: 'Media - Moderadamente importante', value: 'medium' },
  { title: 'Alta - Necesita atención pronto', value: 'high' },
  { title: 'Crítica - Bloquea el uso de la app', value: 'critical' }
]

// Validation rules
const rules = {
  required: value => !!value || 'Este campo es requerido',
  minLength: (min) => value => (value && value.length >= min) || `Mínimo ${min} caracteres`,
  email: value => {
    if (!value) return true // Optional field
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email inválido'
  }
}

// Methods
const collectSystemInfo = () => {
  systemInfo.value = {
    browser: navigator.userAgent,
    device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Móvil' : 'Escritorio',
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    currentPage: window.location.pathname,
    timestamp: new Date().toLocaleString('es-CL')
  }
}

const submitFeedback = async () => {
  if (!formValid.value) return

  submitting.value = true

  try {
    const feedbackData = {
      // Datos del feedback
      type: feedback.value.type,
      title: feedback.value.title,
      message: feedback.value.message,
      priority: feedback.value.priority || 'medium',

      // Información del usuario
      user_id: authStore.user?.uid || null,
      user_email: authStore.user?.email || null,
      contact_email: feedback.value.contactEmail || null,

      // Información del sistema
      system_info: systemInfo.value,

      // Metadatos
      status: 'open',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),

      // Información adicional
      app_version: '1.0.0', // TODO: Obtener de package.json
      environment: process.env.NODE_ENV || 'development'
    }

    // Guardar en Firestore
    await addDoc(collection(db, 'feedback'), feedbackData)

    // Mostrar mensaje de éxito
    emit('feedback-sent', {
      type: 'success',
      message: '¡Gracias por tu comentario! Lo revisaremos pronto.'
    })

    // Limpiar formulario
    resetForm()
    show.value = false

  } catch (error) {
    console.error('Error enviando feedback:', error)

    emit('feedback-sent', {
      type: 'error',
      message: 'Error al enviar el comentario. Por favor, inténtalo de nuevo.'
    })
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  feedback.value = {
    type: '',
    title: '',
    message: '',
    contactEmail: '',
    priority: 'medium'
  }

  if (feedbackForm.value) {
    feedbackForm.value.reset()
  }
}

// Lifecycle
onMounted(() => {
  collectSystemInfo()

  // Pre-llenar email si el usuario está autenticado
  if (authStore.user?.email) {
    feedback.value.contactEmail = authStore.user.email
  }
})
</script>

<style scoped>
.feedback-modal {
  background: var(--color-surface);
  color: var(--color-text);
}

.modal-header {
  background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
  color: white;
  padding: 1.5rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.header-content h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

.modal-content {
  padding: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-direction: column;
  align-items: flex-start;
}

.type-description {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

.system-info {
  margin-top: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.info-item {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.info-item strong {
  color: var(--color-text);
}

.modal-actions {
  padding: 1.5rem;
  background: var(--color-surface-variant);
}

/* Responsive */
@media (max-width: 600px) {
  .modal-content {
    padding: 1rem;
  }

  .modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-actions .v-btn {
    width: 100%;
  }
}
</style>
