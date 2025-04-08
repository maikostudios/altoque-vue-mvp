<template>
    <div class="flex flex-col items-center">
        <canvas ref="qrCanvas" class="mb-4"></canvas>
        <p class="text-sm text-gray-600">Escanea este código QR para acceder a tu página pública.</p>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import QRCode from "qrcode";

// Props para recibir el username dinámico
defineProps({
    username: {
        type: String,
        required: true,
    },
});

// Referencia al canvas donde se generará el QR
const qrCanvas = ref(null);

// URL base de la aplicación
const baseUrl = "https://altoque.maikostudios.com/u/";

// Generar el QR cuando el componente se monta o el username cambia
const generateQRCode = async () => {
    if (qrCanvas.value) {
        try {
            await QRCode.toCanvas(qrCanvas.value, `${baseUrl}${username}`, {
                width: 200,
                margin: 2,
            });
        } catch (error) {
            console.error("Error generando el código QR:", error);
        }
    }
};

// Generar el QR al montar el componente y cuando cambie el username
onMounted(generateQRCode);
watch(() => username, generateQRCode);
</script>