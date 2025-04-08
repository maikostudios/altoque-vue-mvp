<!-- filepath: d:\proyectosvuepersonal\maikostudiosWeb\altoque-vue-mvp\src\components\Notification.vue -->
<template>
    <div v-if="visible" class="fixed top-4 right-4 py-2 px-4 rounded-lg shadow-lg transition-opacity duration-300"
        :class="notificationClass">
        {{ message }}
    </div>
</template>

<script setup>
import { ref, watch } from "vue";

// Props para recibir el mensaje, tipo y duración
defineProps({
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: "success", // Tipos: success, error, warning, info
    },
    duration: {
        type: Number,
        default: 3000, // Duración predeterminada: 3 segundos
    },
});

// Estado de visibilidad
const visible = ref(true);

// Clases dinámicas según el tipo de notificación
const notificationClass = ref("");

watch(
    () => type,
    () => {
        switch (type) {
            case "success":
                notificationClass.value = "bg-green-500 text-white";
                break;
            case "error":
                notificationClass.value = "bg-red-500 text-white";
                break;
            case "warning":
                notificationClass.value = "bg-yellow-500 text-black";
                break;
            case "info":
                notificationClass.value = "bg-blue-500 text-white";
                break;
            default:
                notificationClass.value = "bg-gray-500 text-white";
        }
    },
    { immediate: true }
);

// Ocultar la notificación después de la duración especificada
watch(visible, (newVal) => {
    if (newVal) {
        setTimeout(() => {
            visible.value = false;
        }, duration);
    }
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>