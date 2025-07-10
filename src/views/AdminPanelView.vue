<!-- filepath: d:\proyectosvuepersonal\maikostudiosWeb\altoque-vue-mvp\src\views\AdminPanelView.vue -->
<template>
    <div class="admin-panel">
        <SidebarMenu :currentView="currentView" @changeView="changeView" />
        <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
            <Suspense>
                <template #default>
                    <component :is="currentComponent" @show-notification="showNotification" />
                </template>
                <template #fallback>
                    <div class="component-loading">
                        <div class="loading-spinner"></div>
                        <p>Cargando componente...</p>
                    </div>
                </template>
            </Suspense>
        </div>

        <!-- Notificación -->
        <Notification v-if="notificationMessage" :message="notificationMessage" :type="notificationType"
            @close="notificationMessage = ''" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from "vue";
import SidebarMenu from '@/components/admin/SidebarMenu.vue'

// Componentes lazy-loaded para mejor rendimiento
import Notification from "../components/Notification.vue";

// ✅ ETAPA 6: Servicios de monitoreo para administradores
import { performanceService } from '@/services/performanceService'
import { crashlyticsService } from '@/services/crashlyticsService'
import { budgetMonitoringService } from '@/services/budgetMonitoringService'

// Lazy loading de componentes admin
const DashboardStats = defineAsyncComponent(() => import('@/components/admin/DashboardStats.vue'))
const UserManagement = defineAsyncComponent(() => import('@/components/admin/UserManagement.vue'))
const UsersList = defineAsyncComponent(() => import('@/components/admin/UsersList.vue'))
const SellerManagement = defineAsyncComponent(() => import('@/components/admin/SellerManagement.vue'))
const SupportManagement = defineAsyncComponent(() => import('@/components/admin/SupportManagement.vue'))
const SupportAgentsList = defineAsyncComponent(() => import('@/components/admin/SupportAgentsList.vue'))
const TicketManagement = defineAsyncComponent(() => import('@/components/admin/TicketManagement.vue'))
const BankAccountsManagement = defineAsyncComponent(() => import('@/components/admin/BankAccountsManagement.vue'))
const DemographicsData = defineAsyncComponent(() => import('@/components/admin/DemographicsData.vue'))
const StatisticsGraphs = defineAsyncComponent(() => import('@/components/admin/StatisticsGraphs.vue'))
const IdVerification = defineAsyncComponent(() => import('@/views/admin/IdVerificationView.vue'))
const AuditLogs = defineAsyncComponent(() => import('@/views/admin/AuditLogsView.vue'))
const Settings = defineAsyncComponent(() => import('@/components/admin/Settings.vue'))

const currentView = ref('dashboard')
const sidebarCollapsed = ref(false)

const viewsMap = {
    dashboard: DashboardStats,
    usuarios: UserManagement,
    lista: UsersList,
    vendedores: SellerManagement,
    soporte: SupportManagement,
    'lista-soporte': SupportAgentsList,
    'gestion-tickets': TicketManagement,
    'verificacion-ids': IdVerification,
    'audit-logs': AuditLogs,
    tarjetas: BankAccountsManagement,
    datos: DemographicsData,
    estadisticas: StatisticsGraphs,
    configuraciones: Settings,
}

const currentComponent = computed(() => viewsMap[currentView.value])

function changeView(view) {
    currentView.value = view
}

// Manejar el evento de toggle del sidebar
const handleSidebarToggle = (event) => {
    sidebarCollapsed.value = event.detail.collapsed
}

// Configurar listeners al montar
onMounted(() => {
    document.addEventListener('sidebar-toggle', handleSidebarToggle)
    // Cargar estado inicial del sidebar
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
        sidebarCollapsed.value = savedState === 'true'
    }

    // ✅ ETAPA 6: Inicializar servicios de monitoreo para administradores
    initializeAdminMonitoring()
})

// ✅ ETAPA 6: Función para inicializar monitoreo de administradores
const initializeAdminMonitoring = () => {
    try {
        // Configurar contexto de usuario administrador
        crashlyticsService.setUser('admin', 'admin@maikostudios.com', {
            role: 'admin',
            panel: 'admin_panel',
            permissions: 'full_access'
        })

        // Configurar contexto global para el panel de administración
        crashlyticsService.setGlobalContext({
            app_section: 'admin_panel',
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0'
        })

        // Iniciar traza de performance para el panel de administración
        performanceService.startTrace('admin_panel_load', {
            user_type: 'admin',
            initial_view: currentView.value,
            sidebar_collapsed: sidebarCollapsed.value.toString()
        })

        // Registrar métricas de uso del panel
        budgetMonitoringService.incrementFirestoreReads(1) // Carga inicial del panel

        console.log('✅ Admin monitoring initialized')

    } catch (error) {
        console.error('Error initializing admin monitoring:', error)
        crashlyticsService.recordError('admin_monitoring_init_error', error, {
            component: 'AdminPanelView',
            action: 'initializeAdminMonitoring'
        }, 'medium')
    }
}

// Limpiar listeners al desmontar
onUnmounted(() => {
    document.removeEventListener('sidebar-toggle', handleSidebarToggle)
})

// Mensaje y tipo de notificación
const notificationMessage = ref("");
const notificationType = ref("success");

// Función para mostrar notificaciones
const showNotification = (type, message) => {
    notificationType.value = type;
    notificationMessage.value = message;
};

// Funciones adicionales pueden ir aquí

</script>

<style scoped>
@import '@/styles/admin-optimized.css';

.admin-panel {
    display: flex;
    min-height: 100vh;
    background: var(--color-background);
    font-family: var(--font-primary);
    position: relative;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-left: 280px;
    padding: 2rem 1.5rem;
    width: calc(100% - 280px);
    min-height: calc(100vh - 80px);
    transition: margin-left 0.3s ease, width 0.3s ease;
}

.main-content.sidebar-collapsed {
    margin-left: 70px;
    width: calc(100% - 70px);
}

/* Animación de entrada */
.admin-panel {
    animation: fadeIn var(--duration-normal) var(--easing-default);
}

/* Loading de componentes async */
.component-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    background: var(--color-surface);
    border-radius: 1rem;
    border: 1px solid var(--color-border);
    margin: 2rem;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-surface-variant);
    border-top: 4px solid var(--color-turquesa);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

.component-loading p {
    color: var(--color-text-secondary);
    margin: 0;
    font-size: 0.9rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Mobile First - Responsive */
@media (max-width: 768px) {
    .admin-panel {
        flex-direction: column;
    }

    .main-content,
    .main-content.sidebar-collapsed {
        margin-left: 0;
        width: 100%;
        padding: 1rem;
        min-height: calc(100vh - 80px);
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .main-content {
        margin-left: 280px;
        width: calc(100% - 280px);
        padding: 1.5rem;
    }

    .main-content.sidebar-collapsed {
        margin-left: 70px;
        width: calc(100% - 70px);
    }
}

@media (min-width: 1025px) {
    .main-content {
        margin-left: 280px;
        width: calc(100% - 280px);
        padding: 2rem;
    }

    .main-content.sidebar-collapsed {
        margin-left: 70px;
        width: calc(100% - 70px);
    }
}
</style>