<template>
  <v-dialog v-model="show" max-width="800px" persistent>
    <v-card class="log-details-modal">
      <!-- Header -->
      <v-card-title class="modal-header">
        <div class="header-content">
          <v-icon size="32" :color="getSeverityColor(log?.eventSeverity)">
            {{ getSeverityIcon(log?.eventSeverity) }}
          </v-icon>
          <div>
            <h2>Detalles del Log de Auditoría</h2>
            <p class="log-type">{{ getTypeText(log?.type) }}</p>
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
        <v-row v-if="log">
          <!-- Información General -->
          <v-col cols="12" md="6">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon>mdi-information</v-icon>
                Información General
              </h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Tipo de Evento:</span>
                  <v-chip
                    :color="getTypeColor(log.type)"
                    variant="elevated"
                    size="small"
                  >
                    <v-icon left size="small">{{ getTypeIcon(log.type) }}</v-icon>
                    {{ getTypeText(log.type) }}
                  </v-chip>
                </div>
                <div class="info-item">
                  <span class="info-label">Severidad:</span>
                  <v-chip
                    :color="getSeverityColor(log.eventSeverity)"
                    variant="elevated"
                    size="small"
                  >
                    <v-icon left size="small">{{ getSeverityIcon(log.eventSeverity) }}</v-icon>
                    {{ getSeverityText(log.eventSeverity) }}
                  </v-chip>
                </div>
                <div class="info-item">
                  <span class="info-label">Fecha/Hora:</span>
                  <span class="info-value">{{ formatDateTime(log.timestamp) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">ID del Log:</span>
                  <span class="info-value monospace">{{ log.id }}</span>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Información del Responsable -->
          <v-col cols="12" md="6">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon>mdi-account-circle</v-icon>
                Responsable
              </h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">{{ log.responsibleEmail || 'Sistema' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">UID:</span>
                  <span class="info-value monospace">{{ log.responsibleUid || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Dirección IP:</span>
                  <span class="info-value monospace">{{ log.responsibleIpAddress || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">User Agent:</span>
                  <span class="info-value small">{{ log.responsibleUserAgent || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row v-if="log">
          <!-- Descripción del Evento -->
          <v-col cols="12">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon>mdi-text</v-icon>
                Descripción del Evento
              </h3>
              <div class="description-box">
                {{ log.eventDescription }}
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row v-if="log?.changeDetails">
          <!-- Detalles de Cambios -->
          <v-col cols="12">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon>mdi-delta</v-icon>
                Detalles de Cambios
              </h3>
              <div class="change-details">
                <v-expansion-panels variant="accordion">
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      <v-icon left>mdi-code-json</v-icon>
                      Ver Detalles Técnicos
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <pre class="json-display">{{ formatChangeDetails(log.changeDetails) }}</pre>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

                <!-- Cambios Formateados -->
                <div class="formatted-changes" v-if="formattedChanges.length > 0">
                  <h4>Cambios Realizados:</h4>
                  <v-list density="compact">
                    <v-list-item
                      v-for="change in formattedChanges"
                      :key="change.field"
                      :prepend-icon="change.icon"
                    >
                      <v-list-item-title>{{ change.description }}</v-list-item-title>
                      <v-list-item-subtitle v-if="change.oldValue && change.newValue">
                        <span class="old-value">{{ change.oldValue }}</span>
                        <v-icon size="small" class="mx-2">mdi-arrow-right</v-icon>
                        <span class="new-value">{{ change.newValue }}</span>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row v-if="log?.userId || log?.involvedEntityId">
          <!-- Entidades Involucradas -->
          <v-col cols="12">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon>mdi-account-group</v-icon>
                Entidades Involucradas
              </h3>
              <div class="info-grid">
                <div class="info-item" v-if="log.userId">
                  <span class="info-label">Usuario Afectado:</span>
                  <span class="info-value monospace">{{ log.userId }}</span>
                </div>
                <div class="info-item" v-if="log.involvedEntityId && log.involvedEntityId !== log.userId">
                  <span class="info-label">Entidad Involucrada:</span>
                  <span class="info-value monospace">{{ log.involvedEntityId }}</span>
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
          @click="copyLogId"
          variant="outlined"
          color="info"
        >
          <v-icon left>mdi-content-copy</v-icon>
          Copiar ID
        </v-btn>
        <v-btn
          @click="exportLogDetails"
          variant="outlined"
          color="success"
        >
          <v-icon left>mdi-download</v-icon>
          Exportar
        </v-btn>
        <v-btn
          @click="show = false"
          variant="elevated"
          color="primary"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  log: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formattedChanges = computed(() => {
  if (!props.log?.changeDetails) return []
  
  const changes = []
  const details = props.log.changeDetails
  
  // Cambios de rol
  if (details.oldRole && details.newRole) {
    changes.push({
      field: 'role',
      icon: 'mdi-account-switch',
      description: 'Cambio de rol',
      oldValue: details.oldRole,
      newValue: details.newRole
    })
  }
  
  // Cambios de plan
  if (details.oldPlan && details.newPlan) {
    changes.push({
      field: 'plan',
      icon: 'mdi-diamond',
      description: 'Cambio de plan',
      oldValue: details.oldPlan.planType || (details.oldPlan.isPremium ? 'Premium' : 'Gratuito'),
      newValue: details.newPlan.planType || (details.newPlan.isPremium ? 'Premium' : 'Gratuito')
    })
  }
  
  // Verificación de ID
  if (details.oldStatus && details.newStatus) {
    changes.push({
      field: 'verification',
      icon: 'mdi-shield-check',
      description: 'Estado de verificación',
      oldValue: details.oldStatus,
      newValue: details.newStatus
    })
  }
  
  // Usuario objetivo
  if (details.targetUserEmail) {
    changes.push({
      field: 'target',
      icon: 'mdi-account',
      description: `Usuario afectado: ${details.targetUserEmail}`,
      oldValue: null,
      newValue: null
    })
  }
  
  return changes
})

// Methods
const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return `${date.toLocaleDateString('es-CL')} ${date.toLocaleTimeString('es-CL')}`
}

const formatChangeDetails = (details) => {
  return JSON.stringify(details, null, 2)
}

const copyLogId = async () => {
  if (props.log?.id) {
    try {
      await navigator.clipboard.writeText(props.log.id)
      console.log('✅ ID del log copiado al portapapeles')
    } catch (error) {
      console.error('❌ Error copiando ID:', error)
    }
  }
}

const exportLogDetails = () => {
  if (!props.log) return
  
  const logData = {
    id: props.log.id,
    timestamp: formatDateTime(props.log.timestamp),
    type: props.log.type,
    severity: props.log.eventSeverity,
    description: props.log.eventDescription,
    responsible: {
      email: props.log.responsibleEmail,
      uid: props.log.responsibleUid,
      ip: props.log.responsibleIpAddress,
      userAgent: props.log.responsibleUserAgent
    },
    changeDetails: props.log.changeDetails,
    userId: props.log.userId,
    involvedEntityId: props.log.involvedEntityId
  }
  
  const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `log-${props.log.id}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  console.log('✅ Detalles del log exportados')
}

// Utility functions
const getTypeColor = (type) => {
  const colors = {
    role_change: 'warning',
    plan_change: 'info',
    id_verification: 'success',
    user_creation: 'primary',
    onboarding_completed: 'success',
    login: 'default',
    error: 'error'
  }
  return colors[type] || 'default'
}

const getTypeIcon = (type) => {
  const icons = {
    role_change: 'mdi-account-switch',
    plan_change: 'mdi-diamond',
    id_verification: 'mdi-shield-check',
    user_creation: 'mdi-account-plus',
    onboarding_completed: 'mdi-check-circle',
    login: 'mdi-login',
    error: 'mdi-alert-circle'
  }
  return icons[type] || 'mdi-information'
}

const getTypeText = (type) => {
  const texts = {
    role_change: 'Cambio de Rol',
    plan_change: 'Cambio de Plan',
    id_verification: 'Verificación de ID',
    user_creation: 'Creación de Usuario',
    onboarding_completed: 'Onboarding Completado',
    login: 'Inicio de Sesión',
    error: 'Error'
  }
  return texts[type] || type
}

const getSeverityColor = (severity) => {
  const colors = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    critical: 'red-darken-2'
  }
  return colors[severity] || 'default'
}

const getSeverityIcon = (severity) => {
  const icons = {
    info: 'mdi-information',
    warning: 'mdi-alert',
    error: 'mdi-alert-circle',
    critical: 'mdi-alert-octagon'
  }
  return icons[severity] || 'mdi-help-circle'
}

const getSeverityText = (severity) => {
  const texts = {
    info: 'Información',
    warning: 'Advertencia',
    error: 'Error',
    critical: 'Crítico'
  }
  return texts[severity] || severity
}
</script>

<style scoped>
.log-details-modal {
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

.log-type {
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

.info-value.monospace {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.info-value.small {
  font-size: 0.8rem;
  word-break: break-all;
}

.description-box {
  background: var(--color-surface-variant);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--color-turquesa);
  font-size: 1rem;
  line-height: 1.5;
}

.change-details {
  margin-top: 1rem;
}

.json-display {
  background: var(--color-surface-variant);
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  overflow-x: auto;
  white-space: pre-wrap;
  color: var(--color-text);
}

.formatted-changes {
  margin-top: 1rem;
}

.formatted-changes h4 {
  color: var(--color-turquesa);
  margin-bottom: 0.5rem;
}

.old-value {
  color: #f44336;
  text-decoration: line-through;
}

.new-value {
  color: #4caf50;
  font-weight: 500;
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
  
  .modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-actions .v-btn {
    width: 100%;
  }
}
</style>
