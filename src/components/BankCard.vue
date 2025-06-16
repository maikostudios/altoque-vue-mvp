<template>
    <div class="bg-white shadow-md rounded-lg p-4 max-w-sm mx-auto">
        <h3 class="text-lg font-semibold text-gray-800">{{ bankName }}</h3>
        <p class="text-sm text-gray-600">Titular: {{ accountHolder }}</p>
        <p class="text-sm text-gray-600">Número de cuenta: {{ accountNumber }}</p>
        <button @click="copyToClipboard(accountNumber)"
            class="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            Copiar número de cuenta
        </button>
    </div>
</template>

<script setup>
import { ref } from "vue";

// Props para recibir datos dinámicos
defineProps({
    bankName: {
        type: String,
        required: true,
    },
    accountHolder: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
    },
});

import { incrementTransferCounter } from '@/store/transferCounter'

// Función para copiar al portapapeles
const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
        () => {
            alert("Número de cuenta copiado al portapapeles.");
            // Incrementar contador global de transferencias
            incrementTransferCounter();
        },
        () => {
            alert("Error al copiar el número de cuenta.");
        }
    );
};
</script>