<template>
  <v-card class="security-status-card">
    <v-card-title>
      <v-icon class="title-icon">mdi-shield-check</v-icon>
      Estado de Seguridad
      <v-spacer />
      <v-btn
        @click="runSecurityTests"
        :loading="testing"
        color="turquesa"
        variant="outlined"
        size="small"
      >
        <v-icon left>mdi-play</v-icon>
        Ejecutar Tests
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Indicadores de Estado -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <div class="status-indicator">
            <v-icon 
              :color="getStatusColor(securityStatus.cloudFunctions)" 
              size="32"
            >
              {{ getStatusIcon(securityStatus.cloudFunctions) }}
            </v-icon>
            <div class="status-text">
              <div class="status-label">Cloud Functions</div>
              <div class="status-value">{{ getStatusText(securityStatus.cloudFunctions) }}</div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <div class="status-indicator">
            <v-icon 
              :color="getStatusColor(securityStatus.auditLogs)" 
              size="32"
            >
              {{ getStatusIcon(securityStatus.auditLogs) }}
            </v-icon>
            <div class="status-text">
              <div class="status-label">Logs de Auditoría</div>
              <div class="status-value">{{ getStatusText(securityStatus.auditLogs) }}</div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <div class="status-indicator">
            <v-icon 
              :color="getStatusColor(securityStatus.permissions)" 
              size="32"
            >
              {{ getStatusIcon(securityStatus.permissions) }}
            </v-icon>
            <div class="status-text">
              <div class="status-label">Permisos</div>
              <div class="status-value">{{ getStatusText(securityStatus.permissions) }}</div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <div class="status-indicator">
            <v-icon 
              :color="getStatusColor(securityStatus.dataIntegrity)" 
              size="32"
            >
              {{ getStatusIcon(securityStatus.dataIntegrity) }}
            </v-icon>
            <div class="status-text">
              <div class="status-label">Integridad</div>
              <div class="status-value">{{ getStatusText(securityStatus.dataIntegrity) }}</div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Último Reporte -->
      <v-divider class="mb-4" />
      
      <div v-if="lastReport" class="last-report">
        <h4 class="report-title">
          <v-icon left>mdi-file-document</v-icon>
          Último Reporte de Seguridad
        </h4>
        
        <v-row>
          <v-col cols="12" md="6">
            <div class="report-stats">
              <div class="stat-item">
                <span class="stat-label">Fecha:</span>
                <span class="stat-value">{{ formatDateTime(lastReport.timestamp) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Tests Totales:</span>
                <span class="stat-value">{{ lastReport.totalTests }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Exitosos:</span>
                <span class="stat-value success">{{ lastReport.passed }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Fallidos:</span>
                <span class="stat-value error">{{ lastReport.failed }}</span>
              </div>
            </div>
          </v-col>
          
          <v-col cols="12" md="6">
            <div class="report-chart">
              <v-progress-circular
                :model-value="getSuccessPercentage()"
                :color="getSuccessPercentage() >= 80 ? 'success' : getSuccessPercentage() >= 60 ? 'warning' : 'error'"
                size="80"
                width="8"
              >
                {{ getSuccessPercentage() }}%
              </v-progress-circular>
              <div class="chart-label">Éxito General</div>
            </div>
          </v-col>
        </v-row>

        <!-- Detalles de Tests -->
        <v-expansion-panels v-if="lastReport.results" class="mt-4">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon left>mdi-format-list-bulleted</v-icon>
              Ver Detalles de Tests ({{ lastReport.results.length }})
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list density="compact">
                <v-list-item
                  v-for="result in lastReport.results"
                  :key="result.test"
                  :prepend-icon="getTestStatusIcon(result.status)"
                >
                  <v-list-item-title>{{ result.test }}</v-list-item-title>
                  <v-list-item-subtitle>{{ result.message }}</v-list-item-subtitle>
                  <template #append>
                    <v-chip
                      :color="getTestStatusColor(result.status)"
                      size="small"
                      variant="elevated"
                    >
                      {{ result.status }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <!-- Sin Reporte -->
      <div v-else class="no-report">
        <v-icon size="48" color="grey">mdi-shield-alert</v-icon>
        <h4>No hay reportes de seguridad</h4>
        <p>Ejecuta los tests de seguridad para generar un reporte.</p>
      </div>

      <!-- Recomendaciones -->
      <v-alert
        v-if="securityRecommendations.length > 0"
        type="warning"
        variant="tonal"
        class="mt-4"
      >
        <v-icon>mdi-lightbulb</v-icon>
        <strong>Recomendaciones de Seguridad:</strong>
        <ul class="mt-2">
          <li v-for="recommendation in securityRecommendations" :key="recommendation">
            {{ recommendation }}
          </li>
        </ul>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { securityTester } from '@/utils/securityTester'

// Reactive data
const testing = ref(false)
const lastReport = ref(null)
const securityStatus = ref({
  cloudFunctions: 'unknown',
  auditLogs: 'unknown',
  permissions: 'unknown',
  dataIntegrity: 'unknown'
})

// Computed
const securityRecommendations = computed(() => {
  const recommendations = []
  
  if (securityStatus.value.cloudFunctions !== 'secure') {
    recommendations.push('Revisar configuración de Cloud Functions')
  }
  
  if (securityStatus.value.auditLogs !== 'secure') {
    recommendations.push('Verificar completitud de logs de auditoría')
  }
  
  if (securityStatus.value.permissions !== 'secure') {
    recommendations.push('Auditar permisos de usuarios administrativos')
  }
  
  if (securityStatus.value.dataIntegrity !== 'secure') {
    recommendations.push('Verificar integridad de datos críticos')
  }
  
  return recommendations
})

// Methods
const runSecurityTests = async () => {
  testing.value = true
  
  try {
    console.log('🧪 Ejecutando tests de seguridad...')
    
    const report = await securityTester.runAllTests()
    lastReport.value = report
    
    // Actualizar estado basado en resultados
    updateSecurityStatus(report)
    
    // Guardar reporte en localStorage para persistencia
    localStorage.setItem('lastSecurityReport', JSON.stringify(report))
    
    console.log('✅ Tests de seguridad completados')
    
  } catch (error) {
    console.error('❌ Error ejecutando tests de seguridad:', error)
  } finally {
    testing.value = false
  }
}

const updateSecurityStatus = (report) => {
  const successRate = report.totalTests > 0 ? (report.passed / report.totalTests) * 100 : 0
  
  // Determinar estado general
  let generalStatus = 'unknown'
  if (successRate >= 90) {
    generalStatus = 'secure'
  } else if (successRate >= 70) {
    generalStatus = 'warning'
  } else {
    generalStatus = 'critical'
  }
  
  // Actualizar estados específicos basado en tipos de tests
  securityStatus.value = {
    cloudFunctions: getTestCategoryStatus(report.results, ['updateUserRole', 'updateUserPlan']),
    auditLogs: getTestCategoryStatus(report.results, ['logging', 'audit']),
    permissions: getTestCategoryStatus(report.results, ['permissions', 'access']),
    dataIntegrity: getTestCategoryStatus(report.results, ['integrity', 'validation'])
  }
}

const getTestCategoryStatus = (results, keywords) => {
  const categoryTests = results.filter(result => 
    keywords.some(keyword => result.test.toLowerCase().includes(keyword))
  )
  
  if (categoryTests.length === 0) return 'unknown'
  
  const passedTests = categoryTests.filter(test => test.status === 'PASS').length
  const successRate = (passedTests / categoryTests.length) * 100
  
  if (successRate >= 90) return 'secure'
  if (successRate >= 70) return 'warning'
  return 'critical'
}

const getSuccessPercentage = () => {
  if (!lastReport.value || lastReport.value.totalTests === 0) return 0
  return Math.round((lastReport.value.passed / lastReport.value.totalTests) * 100)
}

const getStatusColor = (status) => {
  const colors = {
    secure: 'success',
    warning: 'warning',
    critical: 'error',
    unknown: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    secure: 'mdi-shield-check',
    warning: 'mdi-shield-alert',
    critical: 'mdi-shield-remove',
    unknown: 'mdi-shield-question'
  }
  return icons[status] || 'mdi-shield-question'
}

const getStatusText = (status) => {
  const texts = {
    secure: 'Seguro',
    warning: 'Advertencia',
    critical: 'Crítico',
    unknown: 'Desconocido'
  }
  return texts[status] || 'Desconocido'
}

const getTestStatusColor = (status) => {
  const colors = {
    PASS: 'success',
    FAIL: 'error',
    ERROR: 'error',
    MANUAL: 'warning',
    PARTIAL: 'info'
  }
  return colors[status] || 'default'
}

const getTestStatusIcon = (status) => {
  const icons = {
    PASS: 'mdi-check-circle',
    FAIL: 'mdi-close-circle',
    ERROR: 'mdi-alert-circle',
    MANUAL: 'mdi-hand-pointing-right',
    PARTIAL: 'mdi-minus-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp).toLocaleString('es-CL')
}

const loadLastReport = () => {
  try {
    const saved = localStorage.getItem('lastSecurityReport')
    if (saved) {
      lastReport.value = JSON.parse(saved)
      updateSecurityStatus(lastReport.value)
    }
  } catch (error) {
    console.error('❌ Error cargando último reporte:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadLastReport()
})
</script>

<style scoped>
.security-status-card {
  background: var(--color-surface);
  color: var(--color-text);
}

.title-icon {
  color: var(--color-turquesa);
  margin-right: 0.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-surface-variant);
  border-radius: 8px;
  border-left: 4px solid var(--color-turquesa);
}

.status-text {
  flex: 1;
}

.status-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.status-value {
  font-weight: 600;
  color: var(--color-text);
}

.last-report {
  margin-top: 1rem;
}

.report-title {
  color: var(--color-turquesa);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.report-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--color-text);
}

.stat-value.success {
  color: #4caf50;
}

.stat-value.error {
  color: #f44336;
}

.report-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.chart-label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.no-report {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.no-report h4 {
  margin: 1rem 0 0.5rem 0;
  color: var(--color-text);
}

/* Responsive */
@media (max-width: 768px) {
  .status-indicator {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .report-chart {
    margin-top: 1rem;
  }
}
</style>
