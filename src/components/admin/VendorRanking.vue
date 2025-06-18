<template>
  <div class="vendor-ranking">
    <!-- Header -->
    <div class="ranking-header">
      <div class="header-content">
        <h2>🏆 Ranking de Vendedores</h2>
        <p class="header-description">Clasificación basada en usuarios registrados este mes</p>
      </div>
      <div class="header-actions">
        <select v-model="selectedPeriod" @change="loadRanking" class="period-selector">
          <option value="mes">Este Mes</option>
          <option value="trimestre">Este Trimestre</option>
          <option value="año">Este Año</option>
          <option value="total">Total</option>
        </select>
        <button @click="loadRanking" class="btn-refresh" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i>
          Actualizar
        </button>
      </div>
    </div>

    <!-- Estadísticas del ranking -->
    <div class="ranking-stats" v-if="rankingStats">
      <div class="stat-item">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <span class="stat-number">{{ rankingStats.totalVendedores }}</span>
          <span class="stat-label">Vendedores Activos</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <span class="stat-number">{{ rankingStats.totalUsuariosRegistrados }}</span>
          <span class="stat-label">Usuarios Registrados</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <span class="stat-number">{{ rankingStats.promedioUsuariosPorVendedor }}</span>
          <span class="stat-label">Promedio por Vendedor</span>
        </div>
      </div>
      <div class="stat-item" v-if="rankingStats.vendedorTop">
        <div class="stat-icon">🥇</div>
        <div class="stat-content">
          <span class="stat-number">{{ rankingStats.vendedorTop.usuariosPeriodo }}</span>
          <span class="stat-label">Mejor Vendedor</span>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Calculando ranking...</p>
    </div>

    <!-- Ranking table -->
    <div v-else-if="ranking.length > 0" class="ranking-table-container">
      <table class="ranking-table">
        <thead>
          <tr>
            <th class="th-position">Posición</th>
            <th class="th-vendor">Vendedor</th>
            <th class="th-users">Usuarios</th>
            <th class="th-goal">Meta</th>
            <th class="th-progress">Progreso</th>
            <th class="th-percentage">% Meta</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vendor in ranking" :key="vendor.id" class="ranking-row">
            <td class="position-cell">
              <div class="position-badge" :class="getPositionClass(vendor.ranking)">
                <span class="position-number">{{ vendor.ranking }}</span>
                <span class="position-icon">{{ getPositionIcon(vendor.ranking) }}</span>
              </div>
            </td>
            <td class="vendor-cell">
              <div class="vendor-info">
                <div class="vendor-avatar">
                  <span>{{ vendor.nombre?.charAt(0) || '?' }}{{ vendor.apellido?.charAt(0) || '' }}</span>
                </div>
                <div class="vendor-details">
                  <h4>{{ vendor.nombre }} {{ vendor.apellido }}</h4>
                  <p>{{ vendor.email }}</p>
                </div>
              </div>
            </td>
            <td class="users-cell">
              <div class="users-info">
                <span class="users-period">{{ vendor.usuariosPeriodo }}</span>
                <span class="users-total">({{ vendor.usuariosRegistrados }} total)</span>
              </div>
            </td>
            <td class="goal-cell">
              <span class="goal-number">{{ vendor.metaMensual }}</span>
            </td>
            <td class="progress-cell">
              <div class="progress-bar-mini">
                <div class="progress-fill-mini" 
                     :style="{ width: Math.min(vendor.porcentajeMeta, 100) + '%' }">
                </div>
              </div>
            </td>
            <td class="percentage-cell">
              <span class="percentage-badge" :class="getPercentageClass(vendor.porcentajeMeta)">
                {{ vendor.porcentajeMeta }}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">🏆</div>
      <h3>No hay datos de ranking</h3>
      <p>No se encontraron vendedores con datos para mostrar el ranking.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { vendorRankingService } from '@/services/vendorRankingService.js'

const loading = ref(true)
const selectedPeriod = ref('mes')
const ranking = ref([])
const rankingStats = ref(null)

const loadRanking = async () => {
  try {
    loading.value = true
    
    // Cargar ranking y estadísticas
    const [rankingData, statsData] = await Promise.all([
      vendorRankingService.calculateVendorRanking(selectedPeriod.value),
      vendorRankingService.getRankingStats(selectedPeriod.value)
    ])
    
    ranking.value = rankingData
    rankingStats.value = statsData
    
    console.log(`✅ Ranking cargado: ${rankingData.length} vendedores`)
    
  } catch (error) {
    console.error('Error cargando ranking:', error)
    ranking.value = []
    rankingStats.value = null
  } finally {
    loading.value = false
  }
}

const getPositionClass = (position) => {
  if (position === 1) return 'gold'
  if (position === 2) return 'silver'
  if (position === 3) return 'bronze'
  return 'default'
}

const getPositionIcon = (position) => {
  if (position === 1) return '🥇'
  if (position === 2) return '🥈'
  if (position === 3) return '🥉'
  return ''
}

const getPercentageClass = (percentage) => {
  if (percentage >= 100) return 'excellent'
  if (percentage >= 80) return 'good'
  if (percentage >= 60) return 'average'
  return 'low'
}

onMounted(() => {
  loadRanking()
})
</script>

<style scoped>
.vendor-ranking {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h2 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
  font-size: 1.8rem;
  font-weight: 600;
}

.header-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.period-selector {
  padding: 0.5rem 1rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.9rem;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-refresh:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ranking-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.stat-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
  border-radius: 50%;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text);
  margin: 0;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-surface-variant);
  border-top: 4px solid var(--color-turquesa);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.ranking-table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-background);
}

.ranking-table th {
  background: var(--color-surface-variant);
  color: var(--color-text);
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--color-border);
}

.ranking-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.ranking-row:hover {
  background: rgba(0, 204, 204, 0.05);
}

.position-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  font-weight: bold;
  min-width: 60px;
  justify-content: center;
}

.position-badge.gold {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #92400e;
}

.position-badge.silver {
  background: linear-gradient(135deg, #c0c0c0, #e5e7eb);
  color: #374151;
}

.position-badge.bronze {
  background: linear-gradient(135deg, #cd7f32, #d97706);
  color: #92400e;
}

.position-badge.default {
  background: var(--color-surface-variant);
  color: var(--color-text);
}

.vendor-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.vendor-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.vendor-details h4 {
  margin: 0 0 0.25rem 0;
  color: var(--color-text);
  font-size: 1rem;
}

.vendor-details p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.users-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.users-period {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-text);
}

.users-total {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.goal-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.progress-bar-mini {
  width: 60px;
  height: 8px;
  background: var(--color-surface-variant);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.percentage-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.percentage-badge.excellent {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.percentage-badge.good {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.percentage-badge.average {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.percentage-badge.low {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .ranking-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .ranking-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ranking-table {
    font-size: 0.8rem;
  }
  
  .ranking-table th,
  .ranking-table td {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .ranking-stats {
    grid-template-columns: 1fr;
  }
}
</style>
