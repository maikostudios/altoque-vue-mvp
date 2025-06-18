<!-- filepath: d:\proyectosvuepersonal\maikostudiosWeb\altoque-vue-mvp\src\views\AdminPanelView.vue -->
<template>
    <div class="admin-panel">
        <SidebarMenu :currentView="currentView" @changeView="changeView" />
        <div class="main-content">
            <component :is="currentComponent" @show-notification="showNotification" />
        </div>

        <!-- Notificación -->
        <Notification v-if="notificationMessage" :message="notificationMessage" :type="notificationType"
            @close="notificationMessage = ''" />
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
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
    padding-top: 2rem;
    /* Espacio para sidebar fijo */
    width: calc(100% - 280px);
    min-height: calc(100vh - 80px);
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

    .main-content {
        margin-left: 0;
        width: 100%;
        padding-top: 1rem;
        min-height: calc(100vh - 80px);
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .main-content {
        margin-left: 260px;
        width: calc(100% - 260px);
        padding-top: 2rem;
        min-height: calc(100vh - 80px);
    }
}

@media (min-width: 1025px) {
    .main-content {
        margin-left: 280px;
        width: calc(100% - 280px);
        padding-top: 2rem;
        min-height: calc(100vh - 80px);
    }
}
</style>