<template>
    <div class="qr-container">
        <canvas ref="qrCanvas"></canvas>
        <p class="mt-2">Escanea para visitar tu perfil</p>
        <p class="text-sm text-gray-500">{{ baseUrl }}{{ username }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
    username: {
        type: String,
        required: true
    }
})

// Referencia al canvas donde se generará el QR
const qrCanvas = ref(null)

// URL base de la aplicación
const baseUrl = "https://altoque.maikostudios.com/u/"

// Generar el QR cuando el componente se monta o el username cambia
const generateQRCode = async () => {
    if (qrCanvas.value) {
        try {
            await QRCode.toCanvas(qrCanvas.value, `${baseUrl}${props.username}`, {
                width: 200,
                margin: 2,
            })
        } catch (error) {
            console.error("Error generando el código QR:", error)
        }
    }
}

// Generar el QR al montar el componente y cuando cambie el username
onMounted(generateQRCode)
watch(() => props.username, generateQRCode)
</script>

<style scoped>
.qr-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
}
</style>
