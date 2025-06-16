<!-- filepath: d:\proyectosvuepersonal\maikostudiosWeb\altoque-vue-mvp\src\views\AdminPanelView.vue -->
<template>
    <div class="p-4 text-center text-lg">Vista AdminPanel</div>

    <!-- Notificación -->
    <Notification v-if="notificationMessage" :message="notificationMessage" :type="notificationType"
        @close="notificationMessage = ''" />

    <div class="admin-panel">
        <SidebarMenu :currentView="currentView" @changeView="changeView" />
        <div class="main-content">
            <HeaderPanel @logout="handleLogout" />
            <component :is="currentComponent" @show-notification="showNotification" />
        </div>
        <Notification v-if="notificationMessage" :message="notificationMessage" :type="notificationType"
            @close="notificationMessage = ''" />
    </div>


</template>

<script setup>
import { ref, computed } from "vue";
import SidebarMenu from '@/components/admin/SidebarMenu.vue'
import HeaderPanel from '@/components/admin/HeaderPanel.vue'

// Componentes cargables dinámicamente
import DashboardStats from '@/components/admin/DashboardStats.vue'
import UserManagement from '@/components/admin/UserManagement.vue'
import BankAccountsManagement from '@/components/admin/BankAccountsManagement.vue'
import DemographicsData from '@/components/admin/DemographicsData.vue'
import StatisticsGraphs from '@/components/admin/StatisticsGraphs.vue'
import Settings from '@/components/admin/Settings.vue'
import Notification from "../components/Notification.vue";

const currentView = ref('dashboard')

const viewsMap = {
    dashboard: DashboardStats,
    usuarios: UserManagement,
    tarjetas: BankAccountsManagement,
    datos: DemographicsData,
    estadisticas: StatisticsGraphs,
    configuraciones: Settings,
}

const currentComponent = computed(() => viewsMap[currentView.value])

function changeView(view) {
    currentView.value = view
}

async function handleLogout() {
    try {
        const { useAuthStore } = await import('@/store/auth')
        const { useRouter } = await import('vue-router')

        const authStore = useAuthStore()
        const router = useRouter()

        await authStore.logout()
        router.push('/login')
    } catch (error) {
        console.error('Error al cerrar sesión:', error)
    }
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
    background: #f5f6fa;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}
</style>