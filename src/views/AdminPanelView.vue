<!-- filepath: d:\proyectosvuepersonal\maikostudiosWeb\altoque-vue-mvp\src\views\AdminPanelView.vue -->
<template>
    <div class="p-4 text-center text-lg">Vista AdminPanel</div>

    <!-- Notificación -->
    <Notification v-if="notificationMessage" :message="notificationMessage" :type="notificationType"
        @close="notificationMessage = ''" />

    <div class="admin-panel">
        <SidebarMenu @changeView="changeView" />
        <div class="main-content">
            <HeaderPanel @logout="handleLogout" />
            <component :is="currentComponent" @show-notification="showNotification" />
        </div>
        <Notification v-if="notificationMessage" :message="notificationMessage" :type="notificationType"
            @close="notificationMessage = ''" />
    </div>


</template>

<script setup>
import { ref } from "vue";
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
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

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

function handleLogout() {
    // cerrar sesión en Firebase
}

// Mensaje y tipo de notificación
const notificationMessage = ref("");
const notificationType = ref("success");

// Función para mostrar notificaciones
const showNotification = (type, message) => {
    notificationType.value = type;
    notificationMessage.value = message;
};

//Registrar nuevo usuario
const registrarUsuario = async (email, password, role) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'usuarios', cred.user.uid), {
        email,
        role
    })
}
showNotification("success", "Usuario registrado con éxito");

</script>