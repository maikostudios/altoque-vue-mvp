<template>
    <div class="public-transfer">
        <div class="container">
            <!-- Header -->
            <header class="transfer-header">
                <h1 class="app-title">Altoque</h1>
                <p class="subtitle">Transferencia Bancaria</p>
            </header>

            <!-- Loading state -->
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Cargando información...</p>
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="error-state">
                <div class="error-icon">❌</div>
                <h2>Error</h2>
                <p>{{ error }}</p>
                <button @click="retry" class="btn btn-primary">Reintentar</button>
            </div>

            <!-- Transfer card -->
            <div v-else-if="transferData" class="transfer-card">
                <div class="card-header">
                    <div class="user-avatar">
                        <img v-if="transferData.imagen" :src="transferData.imagen" :alt="transferData.nombreTitular">
                        <div v-else class="avatar-placeholder">
                            {{ transferData.nombreTitular?.charAt(0) || '?' }}
                        </div>
                    </div>
                    <div class="user-info">
                        <h2>{{ transferData.nombreTitular }}</h2>
                        <p v-if="transferData.descripcion">{{ transferData.descripcion }}</p>
                    </div>
                </div>

                <div class="bank-details">
                    <div class="detail-item">
                        <span class="label">Banco:</span>
                        <span class="value">{{ transferData.banco }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Tipo de cuenta:</span>
                        <span class="value">{{ transferData.tipoCuenta }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Número de cuenta:</span>
                        <span class="value">{{ transferData.numeroCuenta }}</span>
                        <button @click="copyToClipboard(transferData.numeroCuenta)" class="copy-btn">
                            📋
                        </button>
                    </div>
                    <div class="detail-item">
                        <span class="label">RUT:</span>
                        <span class="value">{{ transferData.rutTitular }}</span>
                        <button @click="copyToClipboard(transferData.rutTitular)" class="copy-btn">
                            📋
                        </button>
                    </div>
                    <div v-if="transferData.telefono" class="detail-item">
                        <span class="label">Teléfono:</span>
                        <span class="value">{{ transferData.telefono }}</span>
                    </div>
                </div>

                <div class="actions">
                    <button @click="copyAllData" class="btn btn-primary">
                        📋 Copiar todos los datos
                    </button>
                </div>
            </div>

            <!-- WhatsApp button -->
            <a href="https://wa.me/56912345678" target="_blank" class="whatsapp-btn">
                💬
            </a>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const transferData = ref(null)

const loadTransferData = async () => {
    try {
        loading.value = true
        error.value = null

        const token = route.query.tkn
        if (!token) {
            throw new Error('Token de transferencia no válido')
        }

        // TODO: Implementar llamada a la API para obtener datos por token
        // Por ahora, datos de ejemplo
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simular carga

        transferData.value = {
            nombreTitular: 'Juan Pérez',
            banco: 'Banco de Chile',
            tipoCuenta: 'Cuenta Corriente',
            numeroCuenta: '12345678',
            rutTitular: '11111111-1',
            telefono: '+56911111111',
            descripcion: 'Cuenta para recibir transferencias',
            imagen: null
        }
    } catch (err) {
        error.value = err.message
    } finally {
        loading.value = false
    }
}

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text)
        // TODO: Mostrar notificación de éxito
        console.log('Copiado:', text)
    } catch (err) {
        console.error('Error al copiar:', err)
    }
}

const copyAllData = async () => {
    const data = `
Datos para transferencia:
Titular: ${transferData.value.nombreTitular}
Banco: ${transferData.value.banco}
Tipo de cuenta: ${transferData.value.tipoCuenta}
Número de cuenta: ${transferData.value.numeroCuenta}
RUT: ${transferData.value.rutTitular}
${transferData.value.telefono ? `Teléfono: ${transferData.value.telefono}` : ''}
    `.trim()

    await copyToClipboard(data)
}

const retry = () => {
    loadTransferData()
}

onMounted(() => {
    loadTransferData()
})
</script>

<style scoped>
.public-transfer {
    min-height: 100vh;
    background: var(--color-background);
    font-family: var(--font-primary);
    padding: 2rem 0;
}

.container {
    max-width: 500px;
    margin: 0 auto;
    padding: 0 1rem;
}

.transfer-header {
    text-align: center;
    margin-bottom: 2rem;
    animation: fadeIn var(--duration-normal) var(--easing-default);
}

.app-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
}

.subtitle {
    color: var(--color-text-secondary);
    font-size: 1.1rem;
    margin: 0;
}

.loading-state, .error-state {
    text-align: center;
    padding: 3rem 2rem;
    animation: fadeIn var(--duration-normal) var(--easing-default);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-surface-variant);
    border-top: 4px solid var(--color-turquesa);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.transfer-card {
    background: var(--color-surface);
    border-radius: 1.5rem;
    padding: 2rem;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--color-border);
    animation: slideUp var(--duration-normal) var(--easing-default);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
}

.user-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 600;
    color: white;
}

.user-info h2 {
    margin: 0 0 0.5rem 0;
    color: var(--color-text);
    font-size: 1.5rem;
}

.user-info p {
    margin: 0;
    color: var(--color-text-secondary);
}

.bank-details {
    margin-bottom: 2rem;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border);
}

.detail-item:last-child {
    border-bottom: none;
}

.label {
    color: var(--color-text-secondary);
    font-weight: 500;
}

.value {
    color: var(--color-text);
    font-weight: 600;
    font-family: var(--font-secondary);
}

.copy-btn {
    background: var(--color-surface-variant);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 0.25rem 0.5rem;
    margin-left: 0.5rem;
    cursor: pointer;
    transition: all var(--duration-normal) var(--easing-default);
}

.copy-btn:hover {
    background: var(--color-turquesa);
    border-color: var(--color-turquesa);
    transform: scale(1.1);
}

.actions {
    text-align: center;
}

.whatsapp-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 60px;
    height: 60px;
    background: #25d366;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    text-decoration: none;
    box-shadow: var(--shadow-lg);
    transition: all var(--duration-normal) var(--easing-default);
    z-index: 1000;
}

.whatsapp-btn:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-xl);
}

@media (max-width: 768px) {
    .container {
        padding: 0 0.5rem;
    }
    
    .transfer-card {
        padding: 1.5rem;
    }
    
    .card-header {
        flex-direction: column;
        text-align: center;
    }
    
    .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>
