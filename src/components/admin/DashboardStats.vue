<template>
    <div class="dashboard-stats">
        <h2>📊 Dashboard de Estadísticas</h2>

        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
            <p>⏳ Cargando estadísticas...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-state">
            <p>❌ {{ error }}</p>
            <button @click="loadStats" class="retry-btn">🔄 Reintentar</button>
        </div>

        <!-- Stats content -->
        <div v-else class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                    <h3>Usuarios Totales</h3>
                    <p class="stat-number">{{ stats.totalUsers }}</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">💳</div>
                <div class="stat-content">
                    <h3>Tarjetas Registradas</h3>
                    <p class="stat-number">{{ stats.totalTarjetas }}</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">👁️</div>
                <div class="stat-content">
                    <h3>Visitas a Datos</h3>
                    <p class="stat-number">{{ stats.visitasDatosTransferencia }}</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">📋</div>
                <div class="stat-content">
                    <h3>Datos Copiados</h3>
                    <p class="stat-number">{{ stats.datosCopiadosTotal }}</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-content">
                    <h3>Saldo Total</h3>
                    <p class="stat-number">{{ formatCurrency(stats.revenue) }}</p>
                </div>
            </div>
        </div>

        <div class="recent-activity">
            <h3>Actividad Reciente</h3>
            <div class="activity-list">
                <div class="activity-item">
                    <span class="activity-time">Hace 2 horas</span>
                    <span class="activity-text">Nuevo usuario registrado</span>
                </div>
                <div class="activity-item">
                    <span class="activity-time">Hace 4 horas</span>
                    <span class="activity-text">Cuenta bancaria agregada</span>
                </div>
                <div class="activity-item">
                    <span class="activity-time">Hace 1 día</span>
                    <span class="activity-text">Transacción completada</span>
                </div>
            </div>
        </div>

        <!-- ✅ NUEVO: Estado de Seguridad -->
        <div class="security-section">
            <SecurityStatus />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { bankAccountService } from '@/services/bankAccountService'
import { metricsService } from '@/services/metricsService'
import SecurityStatus from '@/components/admin/SecurityStatus.vue'

const stats = ref({
    totalUsers: 0,
    totalTarjetas: 0,
    visitasDatosTransferencia: 0,
    datosCopiadosTotal: 0,
    revenue: 0
})

const loading = ref(true)
const error = ref(null)

const loadStats = async () => {
    try {
        loading.value = true
        error.value = null

        // Cargar métricas globales del nuevo servicio
        const globalMetrics = await metricsService.getGlobalMetrics()

        // Cargar estadísticas de cuentas bancarias para el saldo
        const bankStats = await bankAccountService.getBankAccountStats()

        stats.value = {
            totalUsers: globalMetrics.totalUsuarios || 0,
            totalTarjetas: globalMetrics.totalTarjetas || 0,
            visitasDatosTransferencia: globalMetrics.visitasDatosTransferencia || 0,
            datosCopiadosTotal: globalMetrics.datosCopiadosTotal || 0,
            revenue: bankStats.saldoTotal || 0
        }
    } catch (err) {
        console.error('Error cargando estadísticas:', err)
        error.value = 'Error cargando estadísticas'

        // Datos de fallback
        stats.value = {
            totalUsers: 0,
            totalTarjetas: 0,
            visitasDatosTransferencia: 0,
            datosCopiadosTotal: 0,
            revenue: 0
        }
    } finally {
        loading.value = false
    }
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(amount || 0)
}

onMounted(() => {
    loadStats()
})
</script>

<style scoped>
.dashboard-stats {
    padding: 2rem;
}

.dashboard-stats h2 {
    margin-bottom: 2rem;
    color: #2c3e50;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.stat-card {
    background: var(--color-surface);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: box-shadow 0.2s ease;
}

.stat-card:hover {
    box-shadow: var(--shadow-lg);
}

.stat-icon {
    font-size: 2.5rem;
    background: var(--color-turquesa);
    color: var(--color-text);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-content h3 {
    margin: 0 0 0.5rem 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
}

.stat-number {
    margin: 0;
    font-size: 2rem;
    font-weight: bold;
    color: var(--color-text);
}

.recent-activity {
    background: var(--color-surface);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
}

.recent-activity h3 {
    margin: 0 0 1rem 0;
    color: var(--color-text);
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.activity-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--color-surface-variant);
    border-radius: 4px;
}

.activity-time {
    color: var(--color-text-secondary);
    font-size: 0.8rem;
}

.activity-text {
    color: var(--color-text);
}

.loading-state,
.error-state {
    text-align: center;
    padding: 2rem;
    background: var(--color-surface);
    border-radius: 8px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
    margin: 2rem 0;
}

.loading-state p {
    color: var(--color-turquesa);
    font-size: 1.1rem;
    margin: 0;
}

.error-state p {
    color: var(--color-error);
    font-size: 1.1rem;
    margin: 0 0 1rem 0;
}

.retry-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s ease;
}

.retry-btn:hover {
    background: #2980b9;
}

/* ✅ NUEVO: Estilos para sección de seguridad */
.security-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>