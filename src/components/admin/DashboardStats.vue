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
                    <h3>Cuentas Bancarias</h3>
                    <p class="stat-number">{{ stats.bankAccounts }}</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">📈</div>
                <div class="stat-content">
                    <h3>Transacciones</h3>
                    <p class="stat-number">{{ stats.transactions }}</p>
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
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userService } from '@/services/userService'
import { bankAccountService } from '@/services/bankAccountService'

const stats = ref({
    totalUsers: 0,
    bankAccounts: 0,
    transactions: 0,
    revenue: 0
})

const loading = ref(true)
const error = ref(null)

const loadStats = async () => {
    try {
        loading.value = true
        error.value = null

        // Cargar estadísticas de usuarios
        const userStats = await userService.getUserStats()

        // Cargar estadísticas de cuentas bancarias
        const bankStats = await bankAccountService.getBankAccountStats()

        stats.value = {
            totalUsers: userStats.total,
            bankAccounts: bankStats.total,
            transactions: 0, // TODO: Implementar servicio de transacciones
            revenue: bankStats.saldoTotal
        }
    } catch (err) {
        console.error('Error cargando estadísticas:', err)
        error.value = 'Error cargando estadísticas'

        // Datos de fallback
        stats.value = {
            totalUsers: 0,
            bankAccounts: 0,
            transactions: 0,
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
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-icon {
    font-size: 2.5rem;
    background: #3498db;
    color: white;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-content h3 {
    margin: 0 0 0.5rem 0;
    color: #7f8c8d;
    font-size: 0.9rem;
    font-weight: 500;
}

.stat-number {
    margin: 0;
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
}

.recent-activity {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.recent-activity h3 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
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
    background: #f8f9fa;
    border-radius: 4px;
}

.activity-time {
    color: #7f8c8d;
    font-size: 0.8rem;
}

.activity-text {
    color: #2c3e50;
}

.loading-state,
.error-state {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin: 2rem 0;
}

.loading-state p {
    color: #3498db;
    font-size: 1.1rem;
    margin: 0;
}

.error-state p {
    color: #e74c3c;
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
</style>