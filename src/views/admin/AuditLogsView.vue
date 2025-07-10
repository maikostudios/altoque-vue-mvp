<template>
  <div class="audit-logs-view">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        <v-icon class="title-icon">mdi-shield-search</v-icon>
        Panel de Auditoría
      </h1>
      <p class="page-subtitle">
        Registro completo de todas las acciones críticas del sistema
      </p>
    </div>

    <!-- Vistas Predefinidas -->
    <v-card class="predefined-views-card mb-6">
      <v-card-title>
        <v-icon>mdi-view-dashboard</v-icon>
        Vistas Rápidas
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="2" v-for="view in predefinedViews" :key="view.key">
            <v-btn @click="applyPredefinedView(view)" :color="activeView === view.key ? 'turquesa' : 'default'"
              :variant="activeView === view.key ? 'elevated' : 'outlined'" block size="small">
              <v-icon left size="small">{{ view.icon }}</v-icon>
              {{ view.name }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Filtros Avanzados -->
    <v-card class="filters-card mb-6">
      <v-card-title>
        <v-icon>mdi-filter-cog</v-icon>
        Filtros Avanzados
        <v-spacer />
        <v-btn @click="clearAllFilters" variant="outlined" size="small">
          <v-icon left>mdi-filter-remove</v-icon>
          Limpiar
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <!-- Tipo de Evento -->
          <v-col cols="12" md="3">
            <v-select v-model="filters.type" :items="eventTypes" label="Tipo de Evento" variant="outlined"
              density="comfortable" clearable multiple chips />
          </v-col>

          <!-- Usuario Afectado -->
          <v-col cols="12" md="3">
            <v-autocomplete v-model="filters.userId" :items="userOptions" label="Usuario Afectado" variant="outlined"
              density="comfortable" clearable :loading="loadingUsers" item-title="label" item-value="value" />
          </v-col>

          <!-- Responsable -->
          <v-col cols="12" md="3">
            <v-autocomplete v-model="filters.responsibleUid" :items="adminOptions" label="Responsable"
              variant="outlined" density="comfortable" clearable :loading="loadingAdmins" item-title="label"
              item-value="value" />
          </v-col>

          <!-- Severidad -->
          <v-col cols="12" md="3">
            <v-select v-model="filters.severity" :items="severityOptions" label="Severidad" variant="outlined"
              density="comfortable" clearable multiple chips />
          </v-col>
        </v-row>

        <v-row>
          <!-- Fecha Desde -->
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.dateFrom" label="Desde" type="datetime-local" variant="outlined"
              density="comfortable" />
          </v-col>

          <!-- Fecha Hasta -->
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.dateTo" label="Hasta" type="datetime-local" variant="outlined"
              density="comfortable" />
          </v-col>

          <!-- Búsqueda Libre -->
          <v-col cols="12" md="4">
            <v-text-field v-model="filters.search" label="Búsqueda libre" variant="outlined" density="comfortable"
              prepend-inner-icon="mdi-magnify" clearable hint="Buscar en descripción, email, IP, etc." />
          </v-col>

          <!-- Aplicar Filtros -->
          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn @click="loadLogs" color="turquesa" variant="elevated" block :loading="loading">
              <v-icon left>mdi-filter-check</v-icon>
              Aplicar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Estadísticas Rápidas -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card info">
          <v-card-text>
            <div class="stat-content">
              <v-icon class="stat-icon">mdi-information</v-icon>
              <div>
                <div class="stat-number">{{ stats.info }}</div>
                <div class="stat-label">Información</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card warning">
          <v-card-text>
            <div class="stat-content">
              <v-icon class="stat-icon">mdi-alert</v-icon>
              <div>
                <div class="stat-number">{{ stats.warning }}</div>
                <div class="stat-label">Advertencias</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card error">
          <v-card-text>
            <div class="stat-content">
              <v-icon class="stat-icon">mdi-alert-circle</v-icon>
              <div>
                <div class="stat-number">{{ stats.error }}</div>
                <div class="stat-label">Errores</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card total">
          <v-card-text>
            <div class="stat-content">
              <v-icon class="stat-icon">mdi-chart-line</v-icon>
              <div>
                <div class="stat-number">{{ stats.total }}</div>
                <div class="stat-label">Total</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de Logs -->
    <v-card class="logs-table-card">
      <v-card-title>
        <v-icon>mdi-format-list-bulleted</v-icon>
        Logs de Auditoría
        <v-spacer />
        <v-btn @click="exportToCSV" color="success" variant="outlined" :disabled="logs.length === 0"
          :loading="exporting">
          <v-icon left>mdi-download</v-icon>
          Exportar CSV
        </v-btn>
      </v-card-title>

      <v-data-table :headers="tableHeaders" :items="logs" :loading="loading" :items-per-page="itemsPerPage"
        :server-items-length="totalItems" @update:options="handleTableUpdate" class="audit-table">
        <!-- Timestamp -->
        <template #item.timestamp="{ item }">
          <div class="timestamp-cell">
            <div class="date">{{ formatDate(item.timestamp) }}</div>
            <div class="time">{{ formatTime(item.timestamp) }}</div>
          </div>
        </template>

        <!-- Tipo -->
        <template #item.type="{ item }">
          <v-chip :color="getTypeColor(item.type)" variant="elevated" size="small">
            <v-icon left size="small">{{ getTypeIcon(item.type) }}</v-icon>
            {{ getTypeText(item.type) }}
          </v-chip>
        </template>

        <!-- Severidad -->
        <template #item.eventSeverity="{ item }">
          <v-chip :color="getSeverityColor(item.eventSeverity)" variant="elevated" size="small">
            <v-icon left size="small">{{ getSeverityIcon(item.eventSeverity) }}</v-icon>
            {{ getSeverityText(item.eventSeverity) }}
          </v-chip>
        </template>

        <!-- Responsable -->
        <template #item.responsible="{ item }">
          <div class="responsible-cell">
            <div class="email">{{ item.responsibleEmail || 'Sistema' }}</div>
            <div class="ip" v-if="item.responsibleIpAddress">
              IP: {{ item.responsibleIpAddress }}
            </div>
          </div>
        </template>

        <!-- Descripción -->
        <template #item.eventDescription="{ item }">
          <div class="description-cell">
            <div class="description">{{ item.eventDescription }}</div>
            <v-btn v-if="item.changeDetails" @click="showDetails(item)" size="x-small" variant="text" color="info">
              Ver detalles
            </v-btn>
          </div>
        </template>

        <!-- Loading -->
        <template #loading>
          <div class="loading-container">
            <v-progress-circular indeterminate color="turquesa" />
            <p>Cargando logs de auditoría...</p>
          </div>
        </template>

        <!-- No data -->
        <template #no-data>
          <div class="no-data-container">
            <v-icon size="64" color="grey">mdi-file-search</v-icon>
            <h3>No hay logs disponibles</h3>
            <p>No se encontraron logs que coincidan con los filtros aplicados.</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal de Detalles -->
    <LogDetailsModal v-model="showDetailsModal" :log="selectedLog" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import LogDetailsModal from '@/components/admin/LogDetailsModal.vue'
import { auditService, PREDEFINED_VIEWS, EVENT_TYPES, SEVERITY_LEVELS } from '@/services/auditService'

// Reactive data
const loading = ref(false)
const exporting = ref(false)
const loadingUsers = ref(false)
const loadingAdmins = ref(false)
const logs = ref([])
const userOptions = ref([])
const adminOptions = ref([])
const selectedLog = ref(null)
const showDetailsModal = ref(false)
const activeView = ref('')
const totalItems = ref(0)
const itemsPerPage = ref(25)
const lastDoc = ref(null)

// Filtros
const filters = ref({
  type: [],
  userId: '',
  responsibleUid: '',
  severity: [],
  dateFrom: '',
  dateTo: '',
  search: ''
})

// ✅ USAR CONSTANTES DEL SERVICIO
const predefinedViews = Object.values(PREDEFINED_VIEWS)
const eventTypes = EVENT_TYPES
const severityOptions = SEVERITY_LEVELS

// Headers de la tabla
const tableHeaders = [
  { title: 'Fecha/Hora', key: 'timestamp', sortable: true, width: '150px' },
  { title: 'Tipo', key: 'type', sortable: true, width: '120px' },
  { title: 'Severidad', key: 'eventSeverity', sortable: true, width: '100px' },
  { title: 'Responsable', key: 'responsible', sortable: false, width: '200px' },
  { title: 'Descripción', key: 'eventDescription', sortable: false }
]

// Computed
const stats = computed(() => {
  const info = logs.value.filter(log => log.eventSeverity === 'info').length
  const warning = logs.value.filter(log => log.eventSeverity === 'warning').length
  const error = logs.value.filter(log => log.eventSeverity === 'error').length

  return {
    info,
    warning,
    error,
    total: logs.value.length
  }
})

// ✅ METHODS USANDO SERVICIO DE AUDITORÍA
const loadLogs = async (options = {}) => {
  loading.value = true
  try {
    console.log('📊 Cargando logs de auditoría...')

    const pagination = {
      limit: itemsPerPage.value,
      lastDoc: options.page > 1 ? lastDoc.value : null
    }

    const result = await auditService.getLogs(filters.value, pagination)

    logs.value = options.page > 1 ? [...logs.value, ...result.logs] : result.logs
    lastDoc.value = result.lastDoc
    totalItems.value = result.total

    console.log(`✅ ${result.logs.length} logs cargados`)

  } catch (error) {
    console.error('❌ Error cargando logs:', error)
  } finally {
    loading.value = false
  }
}

const loadUserOptions = async () => {
  loadingUsers.value = true
  try {
    userOptions.value = await auditService.getUserOptions()
  } catch (error) {
    console.error('❌ Error cargando usuarios:', error)
  } finally {
    loadingUsers.value = false
  }
}

const loadAdminOptions = async () => {
  loadingAdmins.value = true
  try {
    adminOptions.value = await auditService.getAdminOptions()
  } catch (error) {
    console.error('❌ Error cargando admins:', error)
  } finally {
    loadingAdmins.value = false
  }
}

const applyPredefinedView = (view) => {
  activeView.value = view.key

  // Limpiar filtros actuales
  clearAllFilters()

  // Aplicar filtros de la vista
  Object.assign(filters.value, view.filters)

  // Cargar logs
  loadLogs()
}

const clearAllFilters = () => {
  filters.value = {
    type: [],
    userId: '',
    responsibleUid: '',
    severity: [],
    dateFrom: '',
    dateTo: '',
    search: ''
  }
  activeView.value = ''
}

const handleTableUpdate = (options) => {
  loadLogs(options)
}

const showDetails = (log) => {
  selectedLog.value = log
  showDetailsModal.value = true
}

const exportToCSV = () => {
  exporting.value = true

  try {
    auditService.exportToCSV(logs.value)
    console.log('✅ Logs exportados a CSV')

  } catch (error) {
    console.error('❌ Error exportando CSV:', error)
  } finally {
    exporting.value = false
  }
}

// ✅ UTILITY FUNCTIONS USANDO CONSTANTES DEL SERVICIO
const getTypeColor = (type) => {
  const eventType = EVENT_TYPES.find(et => et.value === type)
  return eventType?.color || 'default'
}

const getTypeIcon = (type) => {
  const eventType = EVENT_TYPES.find(et => et.value === type)
  return eventType?.icon || 'mdi-information'
}

const getTypeText = (type) => {
  const eventType = EVENT_TYPES.find(et => et.value === type)
  return eventType?.title || type
}

const getSeverityColor = (severity) => {
  const severityLevel = SEVERITY_LEVELS.find(sl => sl.value === severity)
  return severityLevel?.color || 'default'
}

const getSeverityIcon = (severity) => {
  const severityLevel = SEVERITY_LEVELS.find(sl => sl.value === severity)
  return severityLevel?.icon || 'mdi-help-circle'
}

const getSeverityText = (severity) => {
  const severityLevel = SEVERITY_LEVELS.find(sl => sl.value === severity)
  return severityLevel?.title || severity
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('es-CL')
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

const formatDateTime = (timestamp) => {
  return auditService.formatDateTime(timestamp)
}

// Lifecycle
onMounted(() => {
  loadLogs()
  loadUserOptions()
  loadAdminOptions()
})
</script>

<style scoped>
.audit-logs-view {
  padding: 1.5rem;
  max-width: 100%;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.title-icon {
  color: var(--color-turquesa);
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.predefined-views-card,
.filters-card,
.logs-table-card {
  background: var(--color-surface);
}

.stat-card {
  background: var(--color-surface);
  border-left: 4px solid var(--color-turquesa);
}

.stat-card.info {
  border-left-color: #2196f3;
}

.stat-card.warning {
  border-left-color: #ff9800;
}

.stat-card.error {
  border-left-color: #f44336;
}

.stat-card.total {
  border-left-color: var(--color-azul);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  color: var(--color-turquesa);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.timestamp-cell {
  text-align: center;
}

.date {
  font-weight: 500;
  color: var(--color-text);
}

.time {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.responsible-cell .email {
  font-weight: 500;
  color: var(--color-text);
}

.responsible-cell .ip {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.description-cell .description {
  margin-bottom: 0.25rem;
}

.loading-container,
.no-data-container {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.audit-table {
  background: var(--color-surface);
}

/* Responsive */
@media (max-width: 768px) {
  .audit-logs-view {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style>
