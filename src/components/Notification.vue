<!-- filepath: d:\proyectosvuepersonal\maikostudiosWeb\altoque-vue-mvp\src\components\Notification.vue -->
<template>
    <div v-if="visible" class="fixed top-4 right-4 py-2 px-4 rounded-lg shadow-lg transition-opacity duration-300"
        :class="notificationClass">
        {{ message }}
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";

// Props para recibir el mensaje, tipo y duración
const props = defineProps({
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

// Emits
const emit = defineEmits(['close']);

// Estado de visibilidad
const visible = ref(true);

// Clases dinámicas según el tipo de notificación usando computed
const notificationClass = computed(() => {
    switch (props.type) {
        case "success":
            return "bg-green-500 text-white";
        case "error":
            return "bg-red-500 text-white";
        case "warning":
            return "bg-yellow-500 text-black";
        case "info":
            return "bg-blue-500 text-white";
        default:
            return "bg-gray-500 text-white";
    }
});

// Ocultar la notificación después de la duración especificada
onMounted(() => {
    setTimeout(() => {
        visible.value = false;
        emit('close');
    }, props.duration);
});

// Watch para cerrar cuando visible cambia
watch(visible, (newVal) => {
    if (!newVal) {
        emit('close');
    }
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>