<template>
  <v-card class="verified-badge-section" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon color="blue" class="mr-2">mdi-shield-check</v-icon>
      <span>Badge Verificado</span>
      <v-chip
        v-if="userInfo.verifiedBadge"
        color="success"
        variant="elevated"
        size="small"
        class="ml-2"
      >
        <v-icon left size="small">mdi-check-circle</v-icon>
        Verificado
      </v-chip>
    </v-card-title>

    <v-card-text>
      <!-- Descripción del Badge -->
      <div class="badge-description mb-4">
        <p class="text-body-1">
          <v-icon color="info" class="mr-1">mdi-information</v-icon>
          Obtén un badge de "Usuario Verificado" que aparecerá en tu perfil público y aumentará la credibilidad con tus clientes.
        </p>
        
        <v-alert
          v-if="!isPremium"
          type="warning"
          variant="tonal"
          class="mt-3"
        >
          <template #prepend>
            <v-icon>mdi-crown</v-icon>
          </template>
          <strong>Función Premium:</strong> El Badge Verificado está disponible solo para usuarios Premium debido a los costos de almacenamiento de documentos.
        </v-alert>
      </div>

      <!-- Estado actual -->
      <div class="current-status mb-4">
        <h4 class="text-h6 mb-2">Estado Actual:</h4>
        
        <v-chip
          :color="getStatusColor(verificationBadgeStatus)"
          variant="elevated"
          size="large"
          class="mb-2"
        >
          <v-icon left>{{ getStatusIcon(verificationBadgeStatus) }}</v-icon>
          {{ getStatusText(verificationBadgeStatus) }}
        </v-chip>

        <p class="text-body-2 text-medium-emphasis">
          {{ getStatusDescription(verificationBadgeStatus) }}
        </p>
      </div>

      <!-- Acciones según estado -->
      <div class="actions-section">
        <!-- Usuario no Premium -->
        <div v-if="!isPremium" class="upgrade-section">
          <v-btn
            color="primary"
            variant="elevated"
            size="large"
            @click="$emit('upgrade-to-premium')"
            block
          >
            <v-icon left>mdi-crown</v-icon>
            Actualizar a Premium
          </v-btn>
          <p class="text-caption text-center mt-2">
            Desbloquea el Badge Verificado y muchas más funciones
          </p>
        </div>

        <!-- Usuario Premium sin badge -->
        <div v-else-if="!userInfo.verifiedBadge" class="verification-section">
          <v-btn
            color="success"
            variant="elevated"
            size="large"
            @click="startVerificationProcess"
            :loading="uploading"
            block
          >
            <v-icon left>mdi-camera</v-icon>
            Iniciar Verificación
          </v-btn>
          <p class="text-caption text-center mt-2">
            Sube tu selfie y documento para obtener el badge
          </p>
        </div>

        <!-- Usuario Premium con badge -->
        <div v-else class="verified-section">
          <v-alert type="success" variant="tonal">
            <template #prepend>
              <v-icon>mdi-check-circle</v-icon>
            </template>
            <strong>¡Felicitaciones!</strong> Ya tienes el Badge Verificado. Aparece en tu perfil público como "Usuario Verificado ✓"
          </v-alert>
        </div>
      </div>
    </v-card-text>

    <!-- Modal de verificación -->
    <v-dialog v-model="showVerificationModal" max-width="600px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-shield-check</v-icon>
          Verificación de Identidad
        </v-card-title>

        <v-card-text>
          <v-stepper v-model="verificationStep" alt-labels>
            <v-stepper-header>
              <v-stepper-item
                :complete="verificationStep > 1"
                :value="1"
                title="Selfie"
                subtitle="Foto de tu rostro"
              />
              <v-divider />
              <v-stepper-item
                :complete="verificationStep > 2"
                :value="2"
                title="Documento"
                subtitle="Foto de tu ID"
              />
              <v-divider />
              <v-stepper-item
                :value="3"
                title="Envío"
                subtitle="Confirmar y enviar"
              />
            </v-stepper-header>

            <v-stepper-window>
              <!-- Paso 1: Selfie -->
              <v-stepper-window-item :value="1">
                <div class="text-center">
                  <v-icon size="64" color="primary" class="mb-4">mdi-camera-account</v-icon>
                  <h3 class="mb-3">Toma una selfie</h3>
                  <p class="mb-4">Asegúrate de que tu rostro esté bien iluminado y claramente visible</p>
                  
                  <v-file-input
                    v-model="selfieFile"
                    accept="image/*"
                    label="Seleccionar selfie"
                    prepend-icon="mdi-camera"
                    variant="outlined"
                    :rules="[rules.required, rules.imageFile]"
                    @change="previewSelfie"
                  />

                  <div v-if="selfiePreview" class="mt-3">
                    <img :src="selfiePreview" alt="Preview" class="preview-image" />
                  </div>
                </div>
              </v-stepper-window-item>

              <!-- Paso 2: Documento -->
              <v-stepper-window-item :value="2">
                <div class="text-center">
                  <v-icon size="64" color="primary" class="mb-4">mdi-card-account-details</v-icon>
                  <h3 class="mb-3">Foto de tu documento</h3>
                  <p class="mb-4">Toma una foto clara de tu {{ getDocumentType() }} por ambos lados</p>
                  
                  <v-file-input
                    v-model="documentFile"
                    accept="image/*"
                    label="Seleccionar documento"
                    prepend-icon="mdi-card-account-details"
                    variant="outlined"
                    :rules="[rules.required, rules.imageFile]"
                    @change="previewDocument"
                  />

                  <div v-if="documentPreview" class="mt-3">
                    <img :src="documentPreview" alt="Preview" class="preview-image" />
                  </div>
                </div>
              </v-stepper-window-item>

              <!-- Paso 3: Confirmación -->
              <v-stepper-window-item :value="3">
                <div class="text-center">
                  <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
                  <h3 class="mb-3">Confirmar y enviar</h3>
                  <p class="mb-4">Revisa que las imágenes sean claras y legibles antes de enviar</p>
                  
                  <div class="preview-grid">
                    <div class="preview-item">
                      <h4>Selfie</h4>
                      <img v-if="selfiePreview" :src="selfiePreview" alt="Selfie" class="preview-image-small" />
                    </div>
                    <div class="preview-item">
                      <h4>Documento</h4>
                      <img v-if="documentPreview" :src="documentPreview" alt="Documento" class="preview-image-small" />
                    </div>
                  </div>

                  <v-alert type="info" variant="tonal" class="mt-4">
                    <v-icon left>mdi-clock</v-icon>
                    La verificación puede tomar hasta 24-48 horas. Te notificaremos por email cuando esté lista.
                  </v-alert>
                </div>
              </v-stepper-window-item>
            </v-stepper-window>
          </v-stepper>
        </v-card-text>

        <v-card-actions>
          <v-btn @click="closeVerificationModal" variant="text">
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="verificationStep > 1"
            @click="verificationStep--"
            variant="text"
          >
            Anterior
          </v-btn>
          <v-btn
            v-if="verificationStep < 3"
            @click="nextStep"
            color="primary"
            :disabled="!canProceedToNextStep"
          >
            Siguiente
          </v-btn>
          <v-btn
            v-if="verificationStep === 3"
            @click="submitVerification"
            color="success"
            :loading="uploading"
            :disabled="!canSubmit"
          >
            Enviar Verificación
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getIdConfig } from '@/services/idValidationService'

// Props
const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['upgrade-to-premium', 'verification-submitted'])

// Reactive data
const showVerificationModal = ref(false)
const verificationStep = ref(1)
const uploading = ref(false)
const selfieFile = ref(null)
const documentFile = ref(null)
const selfiePreview = ref(null)
const documentPreview = ref(null)

// Computed
const isPremium = computed(() => {
  return props.userInfo.isPremium || props.userInfo.esPremium
})

const verificationBadgeStatus = computed(() => {
  if (!isPremium.value) return 'not_available'
  if (props.userInfo.verifiedBadge) return 'verified'
  if (props.userInfo.verificationBadgeStatus === 'pending') return 'pending'
  return 'not_started'
})

const canProceedToNextStep = computed(() => {
  if (verificationStep.value === 1) return selfieFile.value !== null
  if (verificationStep.value === 2) return documentFile.value !== null
  return true
})

const canSubmit = computed(() => {
  return selfieFile.value && documentFile.value && !uploading.value
})

// Validation rules
const rules = {
  required: (value) => !!value || 'Este campo es obligatorio',
  imageFile: (value) => {
    if (!value) return true
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    return validTypes.includes(value.type) || 'Solo se permiten archivos JPG, JPEG o PNG'
  }
}

// Methods
const getStatusColor = (status) => {
  const colors = {
    not_available: 'grey',
    not_started: 'info',
    pending: 'warning',
    verified: 'success'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    not_available: 'mdi-lock',
    not_started: 'mdi-shield-outline',
    pending: 'mdi-clock-outline',
    verified: 'mdi-shield-check'
  }
  return icons[status] || 'mdi-help-circle'
}

const getStatusText = (status) => {
  const texts = {
    not_available: 'No Disponible',
    not_started: 'No Iniciado',
    pending: 'En Revisión',
    verified: 'Verificado'
  }
  return texts[status] || 'Desconocido'
}

const getStatusDescription = (status) => {
  const descriptions = {
    not_available: 'Actualiza a Premium para acceder al Badge Verificado',
    not_started: 'Puedes iniciar el proceso de verificación cuando quieras',
    pending: 'Tu verificación está siendo revisada por nuestro equipo',
    verified: 'Tu identidad ha sido verificada y el badge aparece en tu perfil'
  }
  return descriptions[status] || ''
}

const getDocumentType = () => {
  const country = props.userInfo.pais || 'CL'
  return getIdConfig(country).idName
}

const startVerificationProcess = () => {
  showVerificationModal.value = true
  verificationStep.value = 1
}

const closeVerificationModal = () => {
  showVerificationModal.value = false
  verificationStep.value = 1
  selfieFile.value = null
  documentFile.value = null
  selfiePreview.value = null
  documentPreview.value = null
}

const nextStep = () => {
  if (canProceedToNextStep.value) {
    verificationStep.value++
  }
}

const previewSelfie = () => {
  if (selfieFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      selfiePreview.value = e.target.result
    }
    reader.readAsDataURL(selfieFile.value)
  }
}

const previewDocument = () => {
  if (documentFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      documentPreview.value = e.target.result
    }
    reader.readAsDataURL(documentFile.value)
  }
}

const submitVerification = async () => {
  try {
    uploading.value = true
    
    // Aquí iría la lógica para subir las imágenes y crear la solicitud de verificación
    // Por ahora simularemos el proceso
    
    console.log('📤 Enviando verificación de badge...')
    console.log('📸 Selfie:', selfieFile.value)
    console.log('📄 Documento:', documentFile.value)
    
    // Simular delay de subida
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    emit('verification-submitted', {
      selfie: selfieFile.value,
      document: documentFile.value,
      userInfo: props.userInfo
    })
    
    closeVerificationModal()
    
    // Mostrar mensaje de éxito
    alert('✅ Verificación enviada exitosamente. Te notificaremos por email cuando esté lista.')
    
  } catch (error) {
    console.error('❌ Error enviando verificación:', error)
    alert('❌ Error enviando verificación. Inténtalo nuevamente.')
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.verified-badge-section {
  margin-bottom: 1rem;
}

.badge-description {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 2px solid #ddd;
}

.preview-image-small {
  max-width: 100px;
  max-height: 100px;
  border-radius: 8px;
  border: 2px solid #ddd;
}

.preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
}

.preview-item {
  text-align: center;
}

.preview-item h4 {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}
</style>
