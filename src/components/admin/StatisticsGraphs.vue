<template>
    <div class="statistics-graphs">
        <div class="stats-header">
            <div class="header-content">
                <h2>📊 Estadísticas Detalladas</h2>
                <p>Análisis completo de datos y tendencias del sistema</p>
            </div>
            <div class="period-selector">
                <select v-model="selectedPeriod" @change="loadStats">
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="90">Últimos 90 días</option>
                    <option value="365">Último año</option>
                </select>
            </div>
        </div>

        <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando estadísticas...</p>
        </div>

        <div v-else class="graphs-grid">
            <!-- Bancos por Región -->
            <div class="graph-card">
                <h3>🏦 Bancos Preferidos por Región</h3>
                <div class="region-banks-chart">
                    <div v-if="Object.keys(adminStats.banksByRegion).length === 0" class="no-data">
                        <p>No hay datos de bancos por región aún</p>
                    </div>
                    <div v-else class="regions-container">
                        <div v-for="(banks, region) in adminStats.banksByRegion" :key="region" class="region-section">
                            <h4 class="region-title">{{ region }}</h4>
                            <div class="banks-list">
                                <div v-for="(count, bank) in banks" :key="bank" class="bank-item">
                                    <span class="bank-name">{{ bank }}</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill"
                                            :style="{ width: getBankPercentageInRegion(count, banks) + '%' }"></div>
                                    </div>
                                    <span class="bank-count">{{ count }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Visitas por Región -->
            <div class="graph-card">
                <h3>📍 Visitas por Región</h3>
                <div class="region-visits-chart">
                    <div v-if="adminStats.visitsByRegion.length === 0" class="no-data">
                        <p>No hay datos de visitas por región aún</p>
                    </div>
                    <div v-else class="visits-container">
                        <div v-for="(regionData, index) in adminStats.visitsByRegion.slice(0, 10)" :key="index"
                            class="region-visit-item">
                            <span class="region-name">{{ regionData.region }}</span>
                            <div class="progress-bar">
                                <div class="progress-fill"
                                    :style="{ width: getVisitPercentage(regionData.count, adminStats.visitsByRegion) + '%' }">
                                </div>
                            </div>
                            <span class="visit-count">{{ regionData.count }} visitas</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumen de Dispositivos Globales -->
            <div class="graph-card">
                <h3>📱 Dispositivos Más Usados</h3>
                <div class="global-devices-chart">
                    <div v-if="globalDeviceStats.length === 0" class="no-data">
                        <p>No hay datos de dispositivos aún</p>
                    </div>
                    <div v-else class="devices-container">
                        <div v-for="(device, index) in globalDeviceStats" :key="index" class="device-item">
                            <span class="device-icon">{{ getDeviceIcon(device.device) }}</span>
                            <span class="device-name">{{ getDeviceName(device.device) }}</span>
                            <span class="device-percentage">{{ device.percentage }}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bancos Más Populares Globalmente -->
            <div class="graph-card">
                <h3>🏆 Bancos Más Populares</h3>
                <div class="global-banks-chart">
                    <div v-if="globalBankStats.length === 0" class="no-data">
                        <p>No hay datos de bancos aún</p>
                    </div>
                    <div v-else class="banks-container">
                        <div v-for="(bank, index) in globalBankStats.slice(0, 8)" :key="index" class="bank-item">
                            <span class="bank-name">{{ bank.bank }}</span>
                            <div class="progress-bar">
                                <div class="progress-fill"
                                    :style="{ width: getBankGlobalPercentage(bank.count, globalBankStats) + '%' }">
                                </div>
                            </div>
                            <span class="bank-count">{{ bank.count }} usos</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { analyticsService } from '@/services/analyticsService'

defineEmits(['showNotification'])

// Estado reactivo
const loading = ref(true)
const selectedPeriod = ref(30)
const adminStats = ref({
    banksByRegion: {},
    visitsByRegion: []
})
const globalDeviceStats = ref([])
const globalBankStats = ref([])

// Cargar estadísticas
const loadStats = async () => {
    try {
        loading.value = true

        // Cargar estadísticas de admin
        const stats = await analyticsService.getAdminCompleteStats(selectedPeriod.value)
        adminStats.value = stats

        // Cargar estadísticas globales de dispositivos y bancos
        await loadGlobalStats()

        console.log('📊 Estadísticas de admin cargadas:', {
            adminStats: adminStats.value,
            globalDeviceStats: globalDeviceStats.value,
            globalBankStats: globalBankStats.value
        })
    } catch (error) {
        console.error('Error cargando estadísticas de admin:', error)
    } finally {
        loading.value = false
    }
}

// Cargar estadísticas globales
const loadGlobalStats = async () => {
    try {
        // Simular estadísticas globales de dispositivos
        // En una implementación real, esto vendría del analyticsService
        globalDeviceStats.value = [
            { device: 'mobile', count: 150, percentage: 65 },
            { device: 'desktop', count: 70, percentage: 30 },
            { device: 'tablet', count: 12, percentage: 5 }
        ]

        // Simular estadísticas globales de bancos
        // En una implementación real, esto vendría del analyticsService
        globalBankStats.value = [
            { bank: 'Banco de Chile', count: 45 },
            { bank: 'Banco Santander', count: 38 },
            { bank: 'Banco Estado', count: 32 },
            { bank: 'Banco BCI', count: 28 },
            { bank: 'Banco Falabella', count: 22 },
            { bank: 'Banco Security', count: 18 },
            { bank: 'Banco Itaú', count: 15 },
            { bank: 'Banco Scotiabank', count: 12 }
        ]
    } catch (error) {
        console.error('Error cargando estadísticas globales:', error)
    }
}

// Funciones auxiliares para cálculos
const getBankPercentageInRegion = (count, regionBanks) => {
    const totalInRegion = Object.values(regionBanks).reduce((sum, c) => sum + c, 0)
    if (totalInRegion === 0) return 0
    return Math.round((count / totalInRegion) * 100)
}

const getVisitPercentage = (count, allVisits) => {
    if (!allVisits || allVisits.length === 0) return 0
    const maxVisits = Math.max(...allVisits.map(v => v.count))
    if (maxVisits === 0) return 0
    return Math.round((count / maxVisits) * 100)
}

const getBankGlobalPercentage = (count, allBanks) => {
    if (!allBanks || allBanks.length === 0) return 0
    const totalCount = allBanks.reduce((sum, bank) => sum + bank.count, 0)
    if (totalCount === 0) return 0
    return Math.round((count / totalCount) * 100)
}

const getDeviceIcon = (device) => {
    const icons = {
        'mobile': '📱',
        'desktop': '💻',
        'tablet': '📟'
    }
    return icons[device.toLowerCase()] || '🖥️'
}

const getDeviceName = (device) => {
    const names = {
        'mobile': 'Móvil',
        'desktop': 'Escritorio',
        'tablet': 'Tablet'
    }
    return names[device.toLowerCase()] || device
}

// Cargar datos al montar el componente
onMounted(() => {
    loadStats()
})
</script>

<style scoped>
.statistics-graphs {
    padding: 2rem;
}

.stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e9ecef;
}

.header-content h2 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
    font-size: 1.8rem;
}

.header-content p {
    margin: 0;
    color: #6c757d;
    font-size: 1rem;
}

.period-selector select {
    padding: 0.5rem 1rem;
    border: 2px solid #dee2e6;
    border-radius: 6px;
    background: white;
    color: #495057;
    font-size: 0.9rem;
    cursor: pointer;
    transition: border-color 0.3s ease;
}

.period-selector select:focus {
    outline: none;
    border-color: #00cccc;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: #6c757d;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #00cccc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.graphs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
    gap: 2rem;
}

.graph-card {
    background: var(--color-surface);
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
    transition: box-shadow 0.2s ease;
}

.graph-card:hover {
    box-shadow: var(--shadow-lg);
}

.graph-card h3 {
    margin: 0 0 1.5rem 0;
    color: var(--color-text);
    font-size: 1.2rem;
    font-weight: 600;
    border-bottom: 2px solid var(--color-border);
    padding-bottom: 0.5rem;
}

.no-data {
    text-align: center;
    color: var(--color-text-muted);
    font-style: italic;
    padding: 3rem;
    background: var(--color-surface-variant);
    border-radius: 8px;
    border: 2px dashed var(--color-border);
}

/* Estilos para bancos por región */
.regions-container {
    max-height: 400px;
    overflow-y: auto;
}

.region-section {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--color-surface-variant);
    border-radius: 8px;
    border-left: 4px solid var(--color-turquesa);
}

.region-title {
    margin: 0 0 1rem 0;
    color: var(--color-text);
    font-size: 1rem;
    font-weight: 600;
}

.banks-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* Estilos para visitas por región */
.visits-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
}

.region-visit-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--color-surface-variant);
    border-radius: 6px;
    transition: background-color 0.2s ease;
}

.region-visit-item:hover {
    background: var(--color-surface);
}

.region-name {
    min-width: 150px;
    font-weight: 500;
    color: var(--color-text);
}

.visit-count {
    min-width: 80px;
    text-align: right;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
}

/* Estilos comunes para items */
.bank-item,
.device-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--color-surface);
    border-radius: 6px;
    border: 1px solid var(--color-border);
    transition: background-color 0.2s ease, border-color 0.2s ease;
}

.bank-item:hover,
.device-item:hover {
    background: var(--color-surface-variant);
    border-color: var(--color-turquesa);
}

.bank-name,
.device-name {
    min-width: 120px;
    font-weight: 500;
    color: var(--color-text);
}

.bank-count {
    min-width: 60px;
    text-align: right;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
}

.device-icon {
    font-size: 1.2rem;
}

.device-percentage {
    min-width: 50px;
    text-align: right;
    font-weight: 600;
    color: var(--color-turquesa);
}

.progress-bar {
    flex: 1;
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00cccc, #1c94e0);
    border-radius: 4px;
    transition: width 0.5s ease;
}

/* Contenedores específicos */
.devices-container,
.banks-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 350px;
    overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
    .statistics-graphs {
        padding: 1rem;
    }

    .stats-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

    .graphs-grid {
        grid-template-columns: 1fr;
    }

    .region-visit-item,
    .bank-item,
    .device-item {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
    }

    .progress-bar {
        order: 2;
        margin: 0.5rem 0;
    }
}
</style>