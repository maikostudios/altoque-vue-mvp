<!-- filepath: d:\proyectosvuepersonal\maikostudiosWeb\altoque-vue-mvp\src\views\AdminPanelView.vue -->
<template>
    <div class="p-4 text-center text-lg">Vista AdminPanel</div>

    <!-- Notificación -->
    <Notification v-if="notificationMessage" :message="notificationMessage" :type="notificationType"
        @close="notificationMessage = ''" />

    <!-- Botones de ejemplo -->
    <div class="space-y-4 mt-4">
        <button @click="showNotification('success', 'Acción realizada con éxito.')"
            class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition">
            Mostrar Éxito
        </button>
        <button @click="showNotification('error', 'Ocurrió un error inesperado.')"
            class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition">
            Mostrar Error
        </button>
        <button @click="showNotification('warning', 'Advertencia: Verifica los datos.')"
            class="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-600 transition">
            Mostrar Advertencia
        </button>
        <button @click="showNotification('info', 'Información importante.')"
            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
            Mostrar Información
        </button>
    </div>
</template>

<script setup>
import { ref } from "vue";
import Notification from "../components/Notification.vue";

// Mensaje y tipo de notificación
const notificationMessage = ref("");
const notificationType = ref("success");

// Función para mostrar notificaciones
const showNotification = (type, message) => {
    notificationType.value = type;
    notificationMessage.value = message;
};
</script>