<template>
  <v-dialog v-model="show" max-width="800px" persistent>
    <v-card class="user-details-modal">
      <!-- Header -->
      <v-card-title class="modal-header">
        <div class="header-content">
          <v-avatar size="48" class="mr-3">
            <v-img
              v-if="user?.photoURL"
              :src="user.photoURL"
              :alt="user.displayName"
            />
            <v-icon v-else size="32">mdi-account</v-icon>
          </v-avatar>
          <div>
            <h2>{{ user?.displayName || user?.nombre || 'Usuario sin nombre' }}</h2>
            <p class="user-email">{{ user?.email }}</p>
          </div>
        </div>
        <v-btn
          @click="show = false"
          icon
          variant="text"
          size="small"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="modal-content">
        <v-row>
          <!-- Información Personal -->
          <v-col cols="12" md="6">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon>mdi-account</v-icon>
                Información Personal
              </h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Nombre Completo:</span>
                  <span class="info-value">{{ getFullName() }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ getDocumentType() }}:</span>
                  <span class="info-value">{{ user?.rut || 'No especificado' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Teléfono:</span>
                  <span class="info-value">{{ user?.telefono || 'No especificado' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Fecha de Nacimiento:</span>
                  <span class="info-value">{{ formatDate(user?.fechaNacimiento) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Sexo:</span>
                  <span class="info-value">{{ formatGender(user?.sexo) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Empresa:</span>
                  <span class="info-value">{{ user?.empresa || 'No especificado' }}</span>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Información Geográfica -->
          <v-col cols="12" md="6">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon>mdi-map-marker</v-icon>
                Ubicación
              </h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">País:</span>
                  <span class="info-value">{{ user?.paisNombre || user?.pais || 'No especificado' }}</span>
                </div>
                <div class="info-item" v-if="user?.regionNombre">
                  <span class="info-label">Región:</span>
                  <span class="info-value">{{ user.regionNombre }}</span>
                </div>
                <div class="info-item" v-if="user?.provinciaNombre">
                  <span class="info-label">Provincia:</span>
                  <span class="info-value">{{ user.provinciaNombre }}</span>
                </div>
                <div class="info-item" v-if="user?.comunaNombre">
                  <span class="info-label">Comuna:</span>
                  <span class="info-value">{{ user.comunaNombre }}</span>
                </div>
                <div class="info-item" v-if="user?.city">
                  <span class="info-label">Ciudad:</span>
                  <span class="info-value">{{ user.city }}</span>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <!-- Estado de Cuenta -->
          <v-col cols="12" md="6">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon>mdi-shield-account</v-icon>
                Estado de Cuenta
              </h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Rol:</span>
                  <v-chip
                    :color="getRoleColor(user?.rol)"
                    variant="elevated"
                    size="small"
                  >
                    {{ formatRole(user?.rol) }}
                  </v-chip>
                </div>
                <div class="info-item">
                  <span class="info-label">Plan:</span>
                  <v-chip
                    :color="user?.isPremium ? 'warning' : 'default'"
                    variant="elevated"
                    size="small"
                  >
                    {{ user?.isPremium ? 'Premium' : 'Gratuito' }}
                  </v-chip>
                </div>
                <div class="info-item">
                  <span class="info-label">Onboarding:</span>
                  <v-chip
                    :color="user?.onboardingCompleted ? 'success' : 'warning'"
                    variant="elevated"
                    size="small"
                  >
                    {{ user?.onboardingCompleted ? 'Completado' : 'Pendiente' }}
                  </v-chip>
                </div>
                <div class="info-item">
                  <span class="info-label">Verificación ID:</span>
                  <v-chip
                    :color="getStatusColor(user?.idVerificationStatus)"
                    variant="elevated"
                    size="small"
                  >
                    <v-icon left size="small">{{ getStatusIcon(user?.idVerificationStatus) }}</v-icon>
                    {{ getStatusText(user?.idVerificationStatus) }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Fechas Importantes -->
          <v-col cols="12" md="6">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon>mdi-calendar</v-icon>
                Fechas Importantes
              </h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Registro:</span>
                  <span class="info-value">{{ formatDateTime(user?.createdAt) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Última Actualización:</span>
                  <span class="info-value">{{ formatDateTime(user?.updatedAt) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Último Acceso:</span>
                  <span class="info-value">{{ formatDateTime(user?.lastLoginAt) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Origen Registro:</span>
                  <v-chip
                    :color="user?.signUpSource === 'google' ? 'info' : 'default'"
                    variant="outlined"
                    size="small"
                  >
                    <v-icon left size="small">
                      {{ user?.signUpSource === 'google' ? 'mdi-google' : 'mdi-email' }}
                    </v-icon>
                    {{ user?.signUpSource === 'google' ? 'Google' : 'Email' }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="modal-actions">
        <v-spacer />
        
        <v-btn
          v-if="user?.idVerificationStatus === 'pending'"
          @click="$emit('reject', user)"
          color="error"
          variant="outlined"
        >
          <v-icon left>mdi-close</v-icon>
          Rechazar
        </v-btn>
        
        <v-btn
          v-if="user?.idVerificationStatus === 'pending'"
          @click="$emit('verify', user)"
          color="success"
          variant="elevated"
        >
          <v-icon left>mdi-check</v-icon>
          Verificar
        </v-btn>
        
        <v-btn
          @click="show = false"
          variant="outlined"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { getIdConfig } from '@/services/idValidationService'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'verify', 'reject'])

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const getFullName = () => {
  if (props.user?.nombre && props.user?.apellido) {
    return `${props.user.nombre} ${props.user.apellido}`
  }
  return props.user?.displayName || 'No especificado'
}

const getDocumentType = () => {
  return getIdConfig(props.user?.pais || 'CL').idName
}

const formatDate = (date) => {
  if (!date) return 'No especificado'
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString('es-CL')
  }
  return date.toDate ? date.toDate().toLocaleDateString('es-CL') : 'No especificado'
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return 'No especificado'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return `${date.toLocaleDateString('es-CL')} ${date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
}

const formatGender = (gender) => {
  const genders = {
    masculino: 'Masculino',
    femenino: 'Femenino',
    otro: 'Otro',
    no_especifica: 'Prefiere no decir'
  }
  return genders[gender] || 'No especificado'
}

const formatRole = (role) => {
  const roles = {
    admin: 'Administrador',
    vendedor: 'Vendedor',
    soporte: 'Soporte',
    usuario: 'Usuario'
  }
  return roles[role] || 'Usuario'
}

const getRoleColor = (role) => {
  const colors = {
    admin: 'error',
    vendedor: 'warning',
    soporte: 'info',
    usuario: 'success'
  }
  return colors[role] || 'default'
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    verified: 'success',
    rejected: 'error'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'mdi-clock-outline',
    verified: 'mdi-check-circle',
    rejected: 'mdi-close-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Pendiente',
    verified: 'Verificado',
    rejected: 'Rechazado'
  }
  return texts[status] || 'Desconocido'
}
</script>

<style scoped>
.user-details-modal {
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
  flex: 1;
}

.header-content h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-email {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

.modal-content {
  padding: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}

.info-section {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-turquesa);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-label {
  font-weight: 500;
  color: var(--color-text-secondary);
  min-width: 120px;
}

.info-value {
  color: var(--color-text);
  text-align: right;
  flex: 1;
}

.modal-actions {
  padding: 1.5rem;
  background: var(--color-surface-variant);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    padding: 1rem;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .info-value {
    text-align: left;
  }
}
</style>
