<template>
  <v-dialog v-model="show" max-width="1200px" persistent>
    <v-card class="performance-dashboard">
      <!-- Header -->
      <v-card-title class="dashboard-header">
        <div class="header-content">
          <v-icon size="32" color="success">mdi-monitor-dashboard</v-icon>
          <div>
            <h2>Dashboard de Performance</h2>
            <p class="header-subtitle">Monitoreo en tiempo real - Etapa 6</p>
          </div>
        </div>
        <v-btn @click="show = false" icon variant="text" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="dashboard-content">
        <!-- Métricas Principales -->
        <div class="metrics-overview">
          <v-row>
            <v-col cols="12" md="3">
              <v-card class="metric-card performance">
                <v-card-text class="text-center">
                  <v-icon size="32" color="success">mdi-speedometer</v-icon>
                  <div class="metric-value">{{ performanceMetrics.avgLoadTime }}ms</div>
                  <div class="metric-label">Tiempo de Carga Promedio</div>
                  <div class="metric-trend" :class="getTrendClass(performanceMetrics.loadTimeTrend)">
                    <v-icon size="small">{{ getTrendIcon(performanceMetrics.loadTimeTrend) }}</v-icon>
                    {{ Math.abs(performanceMetrics.loadTimeTrend) }}%
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card class="metric-card errors">
                <v-card-text class="text-center">
                  <v-icon size="32" color="error">mdi-alert-circle</v-icon>
                  <div class="metric-value">{{ errorMetrics.totalErrors }}</div>
                  <div class="metric-label">Errores (24h)</div>
                  <div class="metric-trend" :class="getTrendClass(-errorMetrics.errorTrend)">
                    <v-icon size="small">{{ getTrendIcon(-errorMetrics.errorTrend) }}</v-icon>
                    {{ Math.abs(errorMetrics.errorTrend) }}%
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card class="metric-card budget">
                <v-card-text class="text-center">
                  <v-icon size="32" color="warning">mdi-currency-usd</v-icon>
                  <div class="metric-value">${{ budgetMetrics.currentSpend }}</div>
                  <div class="metric-label">Gasto Actual</div>
                  <div class="metric-progress">
                    <v-progress-linear :model-value="budgetMetrics.percentage"
                      :color="getBudgetColor(budgetMetrics.percentage)" height="6" />
                    <span class="progress-text">{{ budgetMetrics.percentage }}% del límite</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card class="metric-card users">
                <v-card-text class="text-center">
                  <v-icon size="32" color="info">mdi-account-group</v-icon>
                  <div class="metric-value">{{ userMetrics.activeUsers }}</div>
                  <div class="metric-label">Usuarios Activos</div>
                  <div class="metric-trend" :class="getTrendClass(userMetrics.userTrend)">
                    <v-icon size="small">{{ getTrendIcon(userMetrics.userTrend) }}</v-icon>
                    {{ Math.abs(userMetrics.userTrend) }}%
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Tabs de Monitoreo -->
        <v-tabs v-model="activeTab" class="monitoring-tabs">
          <v-tab value="performance">
            <v-icon left>mdi-speedometer</v-icon>
            Performance
          </v-tab>
          <v-tab value="errors">
            <v-icon left>mdi-bug</v-icon>
            Errores
          </v-tab>
          <v-tab value="budget">
            <v-icon left>mdi-chart-pie</v-icon>
            Presupuesto
          </v-tab>
          <v-tab value="users">
            <v-icon left>mdi-account-multiple</v-icon>
            Usuarios
          </v-tab>
          <v-tab value="ads">
            <v-icon left>mdi-advertisements</v-icon>
            Publicidad
          </v-tab>
        </v-tabs>

        <v-tabs-window v-model="activeTab" class="monitoring-content">
          <!-- Performance Tab -->
          <v-tabs-window-item value="performance">
            <div class="tab-content">
              <h3>
                <v-icon left color="success">mdi-speedometer</v-icon>
                Métricas de Performance
              </h3>

              <v-row>
                <v-col cols="12" md="6">
                  <v-card class="performance-chart">
                    <v-card-title>Tiempo de Carga por Página</v-card-title>
                    <v-card-text>
                      <div class="chart-placeholder">
                        <div v-for="page in performanceData.pages" :key="page.name" class="page-metric">
                          <div class="page-name">{{ page.name }}</div>
                          <div class="page-time">{{ page.avgTime }}ms</div>
                          <v-progress-linear :model-value="(page.avgTime / 3000) * 100"
                            :color="page.avgTime > 2000 ? 'error' : page.avgTime > 1000 ? 'warning' : 'success'"
                            height="8" />
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card class="performance-details">
                    <v-card-title>Detalles de Performance</v-card-title>
                    <v-card-text>
                      <div class="detail-grid">
                        <div class="detail-item">
                          <strong>DNS Lookup:</strong> {{ performanceData.dns }}ms
                        </div>
                        <div class="detail-item">
                          <strong>TCP Connect:</strong> {{ performanceData.tcp }}ms
                        </div>
                        <div class="detail-item">
                          <strong>Server Response:</strong> {{ performanceData.server }}ms
                        </div>
                        <div class="detail-item">
                          <strong>DOM Ready:</strong> {{ performanceData.domReady }}ms
                        </div>
                        <div class="detail-item">
                          <strong>Load Complete:</strong> {{ performanceData.loadComplete }}ms
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-tabs-window-item>

          <!-- Errors Tab -->
          <v-tabs-window-item value="errors">
            <div class="tab-content">
              <h3>
                <v-icon left color="error">mdi-bug</v-icon>
                Registro de Errores
              </h3>

              <v-data-table :headers="errorHeaders" :items="errorData" :loading="loadingErrors" class="error-table">
                <template #item.severity="{ item }">
                  <v-chip :color="getSeverityColor(item.severity)" size="small" variant="elevated">
                    {{ item.severity.toUpperCase() }}
                  </v-chip>
                </template>

                <template #item.timestamp="{ item }">
                  {{ formatTimestamp(item.timestamp) }}
                </template>

                <template #item.actions="{ item }">
                  <v-btn @click="viewErrorDetails(item)" icon size="small" variant="text">
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </div>
          </v-tabs-window-item>

          <!-- Budget Tab -->
          <v-tabs-window-item value="budget">
            <div class="tab-content">
              <h3>
                <v-icon left color="warning">mdi-chart-pie</v-icon>
                Monitoreo de Presupuesto
              </h3>

              <v-row>
                <v-col cols="12" md="6">
                  <v-card class="budget-breakdown">
                    <v-card-title>Uso por Servicio</v-card-title>
                    <v-card-text>
                      <div v-for="service in budgetData.services" :key="service.name" class="service-usage">
                        <div class="service-header">
                          <span class="service-name">{{ service.name }}</span>
                          <span class="service-cost">${{ service.cost }}</span>
                        </div>
                        <v-progress-linear :model-value="service.percentage"
                          :color="service.percentage > 80 ? 'error' : service.percentage > 60 ? 'warning' : 'success'"
                          height="12" />
                        <div class="service-details">
                          {{ service.usage }} / {{ service.limit }} ({{ service.percentage }}%)
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card class="budget-alerts">
                    <v-card-title>Alertas Recientes</v-card-title>
                    <v-card-text>
                      <div v-for="alert in budgetData.alerts" :key="alert.id" class="alert-item">
                        <v-alert :type="getAlertType(alert.severity)" variant="tonal" density="compact">
                          <div class="alert-content">
                            <strong>{{ alert.service }}</strong>
                            <p>{{ alert.message }}</p>
                            <small>{{ formatTimestamp(alert.timestamp) }}</small>
                          </div>
                        </v-alert>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-tabs-window-item>

          <!-- Users Tab -->
          <v-tabs-window-item value="users">
            <div class="tab-content">
              <h3>
                <v-icon left color="info">mdi-account-multiple</v-icon>
                Actividad de Usuarios
              </h3>

              <v-row>
                <v-col cols="12" md="8">
                  <v-card class="user-activity">
                    <v-card-title>Usuarios Activos por Hora</v-card-title>
                    <v-card-text>
                      <div class="activity-chart">
                        <!-- Placeholder para gráfico de actividad -->
                        <div class="chart-placeholder">
                          Gráfico de actividad de usuarios (últimas 24h)
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="4">
                  <v-card class="user-stats">
                    <v-card-title>Estadísticas</v-card-title>
                    <v-card-text>
                      <div class="stat-grid">
                        <div class="stat-item">
                          <div class="stat-value">{{ userData.totalUsers }}</div>
                          <div class="stat-label">Total Usuarios</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-value">{{ userData.premiumUsers }}</div>
                          <div class="stat-label">Usuarios Premium</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-value">{{ userData.newToday }}</div>
                          <div class="stat-label">Nuevos Hoy</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-value">{{ userData.conversionRate }}%</div>
                          <div class="stat-label">Tasa Conversión</div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-tabs-window-item>

          <!-- Ads Tab -->
          <v-tabs-window-item value="ads">
            <div class="tab-content">
              <h3>
                <v-icon left color="purple">mdi-advertisements</v-icon>
                Performance de Publicidad
              </h3>

              <v-row>
                <v-col cols="12" md="6">
                  <v-card class="ads-performance">
                    <v-card-title>Métricas de Anuncios</v-card-title>
                    <v-card-text>
                      <div class="ads-grid">
                        <div class="ads-metric">
                          <div class="metric-value">{{ adsData.impressions }}</div>
                          <div class="metric-label">Impresiones</div>
                        </div>
                        <div class="ads-metric">
                          <div class="metric-value">{{ adsData.clicks }}</div>
                          <div class="metric-label">Clicks</div>
                        </div>
                        <div class="ads-metric">
                          <div class="metric-value">{{ adsData.ctr }}%</div>
                          <div class="metric-label">CTR</div>
                        </div>
                        <div class="ads-metric">
                          <div class="metric-value">${{ adsData.revenue }}</div>
                          <div class="metric-label">Ingresos</div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card class="ads-breakdown">
                    <v-card-title>Por Tipo de Anuncio</v-card-title>
                    <v-card-text>
                      <div v-for="adType in adsData.byType" :key="adType.name" class="ad-type-item">
                        <div class="ad-type-header">
                          <span>{{ adType.name }}</span>
                          <span>{{ adType.ctr }}% CTR</span>
                        </div>
                        <div class="ad-type-stats">
                          <small>{{ adType.impressions }} impresiones • {{ adType.clicks }} clicks</small>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="dashboard-actions">
        <v-btn @click="refreshData" :loading="refreshing" color="primary" variant="elevated">
          <v-icon left>mdi-refresh</v-icon>
          Actualizar Datos
        </v-btn>

        <v-btn @click="exportReport" variant="outlined" color="info">
          <v-icon left>mdi-download</v-icon>
          Exportar Reporte
        </v-btn>

        <v-spacer />

        <v-btn @click="show = false" variant="outlined">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { performanceService } from '@/services/performanceService'
import { crashlyticsService } from '@/services/crashlyticsService'
import { budgetMonitoringService } from '@/services/budgetMonitoringService'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Reactive data
const activeTab = ref('performance')
const refreshing = ref(false)
const loadingErrors = ref(false)

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Mock data (en producción vendría de los servicios)
const performanceMetrics = ref({
  avgLoadTime: 1250,
  loadTimeTrend: -5.2
})

const errorMetrics = ref({
  totalErrors: 23,
  errorTrend: 12.5
})

const budgetMetrics = ref({
  currentSpend: 45.67,
  percentage: 68
})

const userMetrics = ref({
  activeUsers: 1247,
  userTrend: 8.3
})

// Data tables headers
const errorHeaders = [
  { title: 'Tipo', key: 'error_type' },
  { title: 'Severidad', key: 'severity' },
  { title: 'Mensaje', key: 'error_message' },
  { title: 'Timestamp', key: 'timestamp' },
  { title: 'Acciones', key: 'actions', sortable: false }
]

// Mock data
const performanceData = ref({
  pages: [
    { name: 'Dashboard', avgTime: 1200 },
    { name: 'Landing Pública', avgTime: 850 },
    { name: 'Login', avgTime: 650 }
  ],
  dns: 45,
  tcp: 120,
  server: 380,
  domReady: 950,
  loadComplete: 1250
})

const errorData = ref([
  {
    error_type: 'network_error',
    severity: 'medium',
    error_message: 'Connection timeout',
    timestamp: new Date()
  }
])

const budgetData = ref({
  services: [
    { name: 'Firestore', cost: 15.30, percentage: 45, usage: '45K', limit: '100K' },
    { name: 'Cloud Functions', cost: 8.20, percentage: 25, usage: '250K', limit: '1M' },
    { name: 'Hosting', cost: 2.15, percentage: 15, usage: '1.5GB', limit: '10GB' }
  ],
  alerts: [
    {
      id: 1,
      service: 'Firestore',
      severity: 'MEDIUM',
      message: '50% del límite alcanzado',
      timestamp: new Date()
    }
  ]
})

const userData = ref({
  totalUsers: 1247,
  premiumUsers: 89,
  newToday: 23,
  conversionRate: 7.1
})

const adsData = ref({
  impressions: 15420,
  clicks: 234,
  ctr: 1.52,
  revenue: 45.67,
  byType: [
    { name: 'Maiko Studios', impressions: 8500, clicks: 127, ctr: 1.49 },
    { name: 'AdSense', impressions: 6920, clicks: 107, ctr: 1.55 }
  ]
})

// Methods
const getTrendClass = (trend) => ({
  'trend-up': trend > 0,
  'trend-down': trend < 0,
  'trend-neutral': trend === 0
})

const getTrendIcon = (trend) => {
  if (trend > 0) return 'mdi-trending-up'
  if (trend < 0) return 'mdi-trending-down'
  return 'mdi-trending-neutral'
}

const getBudgetColor = (percentage) => {
  if (percentage > 80) return 'error'
  if (percentage > 60) return 'warning'
  return 'success'
}

const getSeverityColor = (severity) => {
  const colors = {
    low: 'info',
    medium: 'warning',
    high: 'error',
    critical: 'error'
  }
  return colors[severity] || 'grey'
}

const getAlertType = (severity) => {
  const types = {
    LOW: 'info',
    MEDIUM: 'warning',
    HIGH: 'error',
    CRITICAL: 'error'
  }
  return types[severity] || 'info'
}

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('es-CL')
}

const viewErrorDetails = (error) => {
  console.log('View error details:', error)
  // TODO: Implementar modal de detalles
}

const refreshData = async () => {
  refreshing.value = true

  try {
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Aquí se cargarían los datos reales de los servicios
    console.log('Data refreshed')

  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    refreshing.value = false
  }
}

const exportReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    performance: performanceMetrics.value,
    errors: errorMetrics.value,
    budget: budgetMetrics.value,
    users: userMetrics.value,
    ads: adsData.value
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json'
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.performance-dashboard {
  background: var(--color-surface);
  color: var(--color-text);
}

.dashboard-header {
  background: linear-gradient(135deg, var(--color-success), var(--color-turquesa));
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

.dashboard-content {
  padding: 2rem;
  max-height: 80vh;
  overflow-y: auto;
}

.metrics-overview {
  margin-bottom: 2rem;
}

.metric-card {
  background: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0.5rem 0;
}

.metric-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.trend-up {
  color: var(--color-success);
}

.trend-down {
  color: var(--color-error);
}

.trend-neutral {
  color: var(--color-text-secondary);
}

.metric-progress {
  margin-top: 0.5rem;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
  display: block;
}

.monitoring-tabs {
  margin-bottom: 1rem;
}

.monitoring-content {
  min-height: 400px;
}

.tab-content h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.chart-placeholder {
  background: var(--color-surface-variant);
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-metric {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.page-name {
  min-width: 120px;
  font-weight: 500;
}

.page-time {
  min-width: 80px;
  font-weight: 600;
  color: var(--color-text);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.detail-item {
  padding: 0.5rem;
  background: var(--color-surface);
  border-radius: 6px;
  font-size: 0.9rem;
}

.service-usage {
  margin-bottom: 1.5rem;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.service-name {
  font-weight: 600;
  color: var(--color-text);
}

.service-cost {
  font-weight: 600;
  color: var(--color-success);
}

.service-details {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

.alert-item {
  margin-bottom: 1rem;
}

.alert-content p {
  margin: 0.25rem 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--color-surface);
  border-radius: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.25rem;
}

.ads-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.ads-metric {
  text-align: center;
  padding: 1rem;
  background: var(--color-surface);
  border-radius: 8px;
}

.ad-type-item {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--color-surface);
  border-radius: 8px;
}

.ad-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.ad-type-stats {
  color: var(--color-text-secondary);
}

.dashboard-actions {
  padding: 1.5rem;
  background: var(--color-surface-variant);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 1rem;
  }

  .ads-grid {
    grid-template-columns: 1fr;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .dashboard-actions .v-btn {
    width: 100%;
  }
}
</style>
