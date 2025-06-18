<!-- filepath: d:\proyectosvuepersonal\maikostudiosWeb\altoque-vue-mvp\src\views\AdminPanelView.vue -->
<template>
    <div class="admin-panel">
        <SidebarMenu :currentView="currentView" @changeView="changeView" />
        <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
            <component :is="currentComponent" @show-notification="showNotification" />
        </div>

        <!-- Notificación -->
        <Notification v-if="notificationMessage" :message="notificationMessage" :type="notificationType"
            @close="notificationMessage = ''" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import SidebarMenu from '@/components/admin/SidebarMenu.vue'

// Componentes cargables dinámicamente
import DashboardStats from '@/components/admin/DashboardStats.vue'
import UserManagement from '@/components/admin/UserManagement.vue'
import UsersList from '@/components/admin/UsersList.vue'
import SellerManagement from '@/components/admin/SellerManagement.vue'
import SupportManagement from '@/components/admin/SupportManagement.vue'
import SupportAgentsList from '@/components/admin/SupportAgentsList.vue'
import TicketManagement from '@/components/admin/TicketManagement.vue'
import BankAccountsManagement from '@/components/admin/BankAccountsManagement.vue'
import DemographicsData from '@/components/admin/DemographicsData.vue'
import StatisticsGraphs from '@/components/admin/StatisticsGraphs.vue'
import Settings from '@/components/admin/Settings.vue'
import Notification from "../components/Notification.vue";

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
})

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
@import '@/styles/admin-layout.css';

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