<template>
  <v-dialog v-model="show" persistent max-width="800px" class="user-info-modal">
    <v-card class="modal-card">
      <!-- Header -->
      <v-card-title class="modal-header">
        <div class="header-content">
          <h2>👋 ¡Bienvenido a De Una!</h2>
          <p class="subtitle">Completa tu información para comenzar</p>
        </div>
      </v-card-title>

      <!-- Progress indicator -->
      <div class="progress-container">
        <v-progress-linear :model-value="progressPercentage" color="turquesa" height="4" class="progress-bar" />
        <p class="progress-text">{{ progressPercentage }}% completado</p>
      </div>

      <!-- Loading overlay -->
      <v-overlay v-if="submitting" contained class="loading-overlay">
        <div class="loading-content">
          <v-progress-circular indeterminate color="turquesa" size="64" class="loading-spinner" />
          <p class="loading-text">{{ loadingMessage }}</p>
        </div>
      </v-overlay>

      <!-- Form content -->
      <v-card-text class="modal-content">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
          <!-- Información Personal -->
          <div class="form-section">
            <h3 class="section-title">👤 Información Personal</h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.nombre" label="Nombre *" :rules="[rules.required]" variant="outlined"
                  density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.apellido" label="Apellido *" :rules="[rules.required]" variant="outlined"
                  density="comfortable" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.rut" :label="`${getIdConfig(geoData.pais || 'CL').idName} *`"
                  :rules="[rules.required, rules.rut]" variant="outlined" density="comfortable"
                  :hint="`Formato: ${getIdConfig(geoData.pais || 'CL').format}`" @input="formatRut" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.telefono" label="Teléfono *" :rules="[rules.required, rules.phone]"
                  variant="outlined" density="comfortable" hint="Incluye código de país: +56912345678" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.fechaNacimiento" label="Fecha de Nacimiento *" type="date"
                  :rules="[rules.required, rules.age]" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="form.sexo" label="Sexo *" :items="sexOptions" :rules="[rules.required]"
                  variant="outlined" density="comfortable" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-text-field v-model="form.empresa" label="Nombre de Empresa (Opcional)" variant="outlined"
                  density="comfortable" hint="Si tienes un negocio o empresa" />
              </v-col>
            </v-row>
          </div>

          <!-- Información Geográfica -->
          <div class="form-section">
            <h3 class="section-title">🌍 Ubicación</h3>
            <GeoSelector v-model="geoData" :required="true" @update:modelValue="updateGeoData" />
          </div>

          <!-- Información de Seguridad -->
          <div class="form-section">
            <h3 class="section-title">🔒 Información de Seguridad</h3>
            <v-alert type="info" variant="tonal" class="security-info">
              <v-icon>mdi-shield-check</v-icon>
              <div>
                <strong>¿Por qué necesitamos esta información?</strong>
                <ul class="info-list">
                  <li>Tu RUT/ID nos ayuda a verificar tu identidad</li>
                  <li>Tu teléfono es necesario para notificaciones de seguridad</li>
                  <li>Tu ubicación nos permite cumplir con regulaciones locales</li>
                </ul>
              </div>
            </v-alert>
          </div>

          <!-- Términos y Condiciones -->
          <div class="form-section">
            <v-checkbox v-model="form.acceptTerms" :rules="[rules.required]" color="turquesa" class="terms-checkbox">
              <template #label>
                <span class="terms-text">
                  Acepto los
                  <a href="#" @click.prevent="showTerms = true" class="terms-link">
                    Términos y Condiciones
                  </a>
                  y la
                  <a href="#" @click.prevent="showPrivacy = true" class="terms-link">
                    Política de Privacidad
                  </a>
                  *
                </span>
              </template>
            </v-checkbox>
          </div>
        </v-form>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="modal-actions">
        <v-btn @click="postponeRegistration" variant="text" color="grey" class="postpone-btn" :disabled="submitting">
          <v-icon left>mdi-clock-outline</v-icon>
          Completar más tarde
        </v-btn>
        <v-spacer />
        <v-btn @click="handleSubmit" :disabled="!formValid || submitting" :loading="submitting" color="turquesa"
          variant="elevated" size="large" class="submit-btn">
          <v-icon left>mdi-check</v-icon>
          Completar Registro
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Terms Modal -->
    <v-dialog v-model="showTerms" max-width="600px">
      <v-card>
        <v-card-title>Términos y Condiciones</v-card-title>
        <v-card-text>
          <p>Aquí irían los términos y condiciones completos...</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showTerms = false" color="turquesa">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Privacy Modal -->
    <v-dialog v-model="showPrivacy" max-width="600px">
      <v-card>
        <v-card-title>Política de Privacidad</v-card-title>
        <v-card-text>
          <p>Aquí iría la política de privacidad completa...</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showPrivacy = false" color="turquesa">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import GeoSelector from '@/components/forms/GeoSelector.vue'
import { formatIdForDisplay, validateId, getIdConfig } from '@/services/idValidationService'
import { db } from '@/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'completed', 'error'])

// Store
const authStore = useAuthStore()

// Reactive data
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref(null)
const formValid = ref(false)
const submitting = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)

// Loading messages
const loadingMessages = [
  "Configurando tu cuenta en Maiko Studios...",
  "Validando tu información...",
  "Creando tu perfil personalizado...",
  "Un momento, estamos personalizando tu experiencia..."
]
const loadingMessage = ref(loadingMessages[0])

// Form data
const form = ref({
  nombre: '',
  apellido: '',
  rut: '',
  telefono: '',
  fechaNacimiento: '',
  sexo: '',
  empresa: '',
  acceptTerms: false
})

const geoData = ref({
  pais: '',
  region: '',
  provincia: '',
  comuna: ''
})

// Options
const sexOptions = [
  { title: 'Masculino', value: 'masculino' },
  { title: 'Femenino', value: 'femenino' },
  { title: 'Otro', value: 'otro' },
  { title: 'Prefiero no decir', value: 'no_especifica' }
]

// Validation rules
const rules = {
  required: (value) => !!value || 'Este campo es obligatorio',
  rut: (value) => {
    if (!value) return true
    // Usar servicio de validación
    const country = geoData.value.pais || 'CL'
    return validateId(value, country) || `Formato de ${getIdConfig(country).idName} inválido`
  },
  phone: (value) => {
    if (!value) return true
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(value) || 'Formato de teléfono inválido'
  },
  age: (value) => {
    if (!value) return true
    const birthDate = new Date(value)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    return age >= 18 || 'Debes ser mayor de 18 años'
  }
}

// Computed
const progressPercentage = computed(() => {
  const fields = [
    form.value.nombre,
    form.value.apellido,
    form.value.rut,
    form.value.telefono,
    form.value.fechaNacimiento,
    form.value.sexo,
    geoData.value.pais,
    geoData.value.region,
    geoData.value.comuna,
    form.value.acceptTerms
  ]

  const completedFields = fields.filter(field => !!field).length
  return Math.round((completedFields / fields.length) * 100)
})

// Methods
const formatRut = () => {
  // Usar servicio de formateo según país
  const country = geoData.value.pais || 'CL'
  form.value.rut = formatIdForDisplay(form.value.rut, country)
}

const updateGeoData = (newGeoData) => {
  geoData.value = newGeoData
}

// ✅ NUEVA: Función para formatear fechas de Firestore para inputs HTML
const formatDateForInput = (date) => {
  if (!date) return ''

  let dateObj = date
  if (date.toDate) {
    // Es un Timestamp de Firestore
    dateObj = date.toDate()
  } else if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (date instanceof Date) {
    dateObj = date
  } else {
    return ''
  }

  // Convertir a formato yyyy-MM-dd para input type="date"
  return dateObj.toISOString().split('T')[0]
}

const handleSubmit = async () => {
  // ✅ Validaciones defensivas
  if (!formRef.value) {
    console.warn('⚠️ FormRef no está disponible')
    return
  }

  if (!formValid.value) {
    await nextTick()
    try {
      formRef.value?.validate()
    } catch (error) {
      console.warn('⚠️ Error validando formulario:', error)
    }
    return
  }

  submitting.value = true

  // Simular mensajes de carga
  let messageIndex = 0
  const messageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessages.length
    loadingMessage.value = loadingMessages[messageIndex]
  }, 1500)

  try {
    console.log('📝 Enviando información del usuario:', {
      ...form.value,
      ...geoData.value
    })

    // ✅ SOLUCIÓN TEMPORAL: Actualizar directamente en Firestore
    // TODO: Cambiar a Cloud Function cuando se resuelva CORS

    const userData = {
      ...form.value,
      ...geoData.value,
      onboardingCompleted: true,
      updatedAt: serverTimestamp()
    }

    // Actualizar documento del usuario directamente
    await updateDoc(doc(db, 'users', authStore.user.uid), userData)

    console.log('✅ Onboarding completado exitosamente (método directo)')
    emit('completed', userData)

  } catch (error) {
    console.error('❌ Error completando onboarding:', error)

    // Extraer mensaje de error más específico
    let errorMessage = 'Error al guardar la información'

    if (error.code === 'functions/unauthenticated') {
      errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.'
    } else if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message || 'Datos inválidos. Verifica la información ingresada.'
    } else if (error.message) {
      errorMessage = error.message
    }

    emit('error', { message: errorMessage, code: error.code })
  } finally {
    clearInterval(messageInterval)
    submitting.value = false
  }
}

// Pre-fill form with Google data
watch(() => authStore.user, (user) => {
  if (user && user.displayName) {
    const nameParts = user.displayName.split(' ')
    form.value.nombre = nameParts[0] || ''
    form.value.apellido = nameParts.slice(1).join(' ') || ''
  }
}, { immediate: true })

// ✅ NUEVO: Cargar datos existentes del usuario
const loadExistingUserData = async () => {
  if (authStore.userInfo) {
    const userInfo = authStore.userInfo

    // Cargar datos personales
    form.value.nombre = userInfo.nombre || ''
    form.value.apellido = userInfo.apellido || ''
    form.value.rut = userInfo.rut || ''
    form.value.telefono = userInfo.telefono || ''

    // ✅ CORREGIR: Convertir Timestamp a formato yyyy-MM-dd para input date
    form.value.fechaNacimiento = formatDateForInput(userInfo.fechaNacimiento) || ''

    form.value.sexo = userInfo.sexo || ''
    form.value.empresa = userInfo.empresa || ''

    // Cargar datos geográficos
    geoData.value.pais = userInfo.pais || ''
    geoData.value.region = userInfo.region || ''
    geoData.value.provincia = userInfo.provincia || ''
    geoData.value.comuna = userInfo.comuna || ''

    console.log('✅ Datos existentes cargados:', userInfo)
  }
}

// ✅ NUEVO: Función para cerrar sesión y permitir completar más tarde
const postponeRegistration = async () => {
  try {
    await authStore.logout()
    show.value = false
    // Redirigir al home
    window.location.href = '/'
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

// ✅ NUEVO: Watcher para manejar cambios de visibilidad del modal
watch(show, (newValue) => {
  if (newValue) {
    // Modal se está abriendo
    nextTick(() => {
      loadExistingUserData()
    })
  }
}, { immediate: false })

// Cargar datos existentes al montar el componente
onMounted(() => {
  // ✅ Usar nextTick para asegurar que el DOM esté listo
  nextTick(() => {
    loadExistingUserData()
  })
})

// Exponer funciones para uso en template
defineExpose({
  postponeRegistration
})
</script>

<style scoped>
.user-info-modal .modal-card {
  background: var(--color-surface);
  color: var(--color-text);
}

.modal-header {
  background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
  color: white;
  padding: 2rem;
}

.header-content h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.subtitle {
  opacity: 0.9;
  font-size: 1.1rem;
}

.progress-container {
  padding: 1rem 2rem 0;
}

.progress-text {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.modal-content {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  color: var(--color-turquesa);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.security-info {
  margin: 1rem 0;
}

.info-list {
  margin: 0.5rem 0 0 1rem;
}

.terms-checkbox {
  margin-top: 1rem;
}

.terms-text {
  font-size: 0.9rem;
}

.terms-link {
  color: var(--color-turquesa);
  text-decoration: underline;
}

.modal-actions {
  padding: 1.5rem 2rem;
  background: var(--color-surface-variant);
}

.submit-btn {
  min-width: 200px;
}

.loading-overlay {
  background: rgba(18, 18, 18, 0.9);
  backdrop-filter: blur(4px);
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1.1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    padding: 1rem;
    max-height: 70vh;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .header-content h2 {
    font-size: 1.5rem;
  }

  .postpone-btn {
    font-size: 0.9rem;
  }

  .modal-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .modal-actions .v-btn {
    width: 100%;
  }
}

.postpone-btn {
  opacity: 0.8;
  transition: all 0.3s ease;
}

.postpone-btn:hover {
  opacity: 1;
  background: rgba(158, 158, 158, 0.1);
}
</style>
