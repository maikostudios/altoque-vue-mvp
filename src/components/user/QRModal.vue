<template>
    <div class="qr-modal-overlay" @click="$emit('close')">
        <div class="qr-modal-content" @click.stop>
            <div class="qr-header">
                <h3>📱 Mi Código QR Público</h3>
                <button @click="$emit('close')" class="close-btn">✕</button>
            </div>

            <div class="qr-body">
                <div class="qr-section">
                    <div class="qr-container">
                        <qrcode-vue :value="qrUrl" :size="qrSize" level="H" render-as="canvas"
                            :background="qrBackground" :foreground="qrForeground" :margin="2" class="qr-code"
                            ref="qrCodeElement" />
                    </div>

                    <div class="qr-info">
                        <p class="qr-url">{{ qrUrl }}</p>
                        <div class="qr-actions">
                            <button @click="copiarEnlace" class="btn btn-primary">
                                📋 Copiar Enlace
                            </button>
                            <button @click="descargarQR" class="btn btn-secondary">
                                💾 Descargar QR
                            </button>
                            <button @click="compartir" class="btn btn-ghost" v-if="canShare">
                                📤 Compartir
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card-preview">
                    <h4>Vista Previa Pública</h4>
                    <div class="preview-card" :style="{ background: getDefaultGradient() }">
                        <div class="preview-header">
                            <h3>{{ props.userInfo.nombre }} {{ props.userInfo.apellido }}</h3>
                            <div class="preview-bank">{{ props.userInfo.empresa || 'De Una Transferencias' }}</div>
                        </div>
                        <div class="preview-info">
                            <p><strong>Plan:</strong> {{ props.userInfo.tipoPlan || 'Gratuito' }}</p>
                            <p><strong>Email:</strong> {{ props.userInfo.email }}</p>
                            <p><strong>Teléfono:</strong> {{ props.userInfo.telefono || 'No especificado' }}</p>
                            <p v-if="props.userInfo.comunaNombre"><strong>Ubicación:</strong> {{
                                props.userInfo.comunaNombre }}, {{ props.userInfo.regionNombre }}</p>
                        </div>
                        <div class="preview-footer">
                            <span class="preview-qr">📱 Escanea para ver tarjetas</span>
                            <span class="preview-status active">Público</span>
                        </div>
                    </div>
                </div>

                <div class="qr-stats" v-if="userInfo.esPremium">
                    <h4>📊 Estadísticas Generales</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-icon">👁️</span>
                            <div class="stat-content">
                                <span class="stat-number">{{ userInfo.visitasTotales || 0 }}</span>
                                <span class="stat-label">Visitas Totales</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">💳</span>
                            <div class="stat-content">
                                <span class="stat-number">{{ userInfo.limiteTarjetas || 1 }}</span>
                                <span class="stat-label">Límite Tarjetas</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">📅</span>
                            <div class="stat-content">
                                <span class="stat-number">{{ formatDate(userInfo.ultimaVisitaPublica) }}</span>
                                <span class="stat-label">Última visita</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="qr-instructions">
                    <h4>💡 Instrucciones de Uso</h4>
                    <ul>
                        <li><strong>Un solo QR para todas tus tarjetas:</strong> Este QR muestra todas las tarjetas
                            bancarias que has creado</li>
                        <li><strong>Imprime y comparte:</strong> Puedes imprimirlo y colocarlo en tu negocio, local o
                            enviarlo por WhatsApp</li>
                        <li><strong>Seguro y actualizado:</strong> Cuando agregues o modifiques tarjetas, el mismo QR
                            mostrará los cambios automáticamente</li>
                        <li><strong>Fácil para tus clientes:</strong> Solo escanean una vez y ven todas tus opciones de
                            pago</li>
                        <li v-if="userInfo.esPremium">Como usuario Premium, puedes personalizar la apariencia y ver
                            estadísticas detalladas</li>
                        <li v-else>Actualiza a Premium para personalización avanzada y estadísticas detalladas</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { incrementTransferCounter } from '@/store/transferCounter'

const props = defineProps({
    userInfo: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close'])

const qrCodeElement = ref(null)

// Propiedades del QR
const qrSize = ref(256)
const qrBackground = ref('#ffffff')
const qrForeground = ref('#121212')

// Computed
const qrUrl = computed(() => {
    // Usar la nueva URL SEO-friendly
    return `${window.location.origin}/datostransferencia/${props.userInfo.tokenPublico}`
})

const canShare = computed(() => {
    return navigator.share !== undefined
})

// Funciones

const getDefaultGradient = () => {
    // Usar el gradiente por defecto del tema
    return 'linear-gradient(135deg, #00cccc, #1c94e0)'
}

const formatDate = (date) => {
    if (!date) return 'Nunca'

    let dateObj = date
    if (date.toDate) {
        dateObj = date.toDate()
    } else if (typeof date === 'string') {
        dateObj = new Date(date)
    }

    return dateObj.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

const copiarEnlace = async () => {
    try {
        await navigator.clipboard.writeText(qrUrl.value)
        alert('Enlace copiado al portapapeles')
        // Incrementar contador global de transferencias
        incrementTransferCounter()
    } catch (error) {
        console.error('Error copiando enlace:', error)
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = qrUrl.value
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('Enlace copiado al portapapeles')
        // Incrementar contador global de transferencias
        incrementTransferCounter()
    }
}

const descargarQR = () => {
    try {
        // Buscar el canvas dentro del componente qrcode-vue
        const qrComponent = qrCodeElement.value
        const canvas = qrComponent?.$el?.querySelector('canvas')

        if (!canvas) {
            alert('Error: No se pudo encontrar el código QR para descargar')
            return
        }

        const link = document.createElement('a')
        const userName = `${props.userInfo.nombre}-${props.userInfo.apellido}`.replace(/\s+/g, '-').toLowerCase()
        link.download = `qr-publico-${userName}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
    } catch (error) {
        console.error('Error descargando QR:', error)
        alert('Error al descargar el QR')
    }
}

const compartir = async () => {
    try {
        await navigator.share({
            title: `Transferencias - ${props.userInfo.nombre} ${props.userInfo.apellido}`,
            text: `Transfiere a ${props.userInfo.nombre} ${props.userInfo.apellido} usando este enlace`,
            url: qrUrl.value
        })
    } catch (error) {
        console.error('Error compartiendo:', error)
    }
}

// El QR se genera automáticamente por el componente qrcode-vue
</script>

<style scoped>
.qr-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn var(--duration-normal) var(--easing-default);
}

.qr-modal-content {
    background: var(--color-surface);
    border-radius: 1rem;
    padding: 0;
    max-width: 800px;
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
    animation: scaleIn var(--duration-normal) var(--easing-default);
}

.qr-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface-variant);
    border-radius: 1rem 1rem 0 0;
}

.qr-header h3 {
    margin: 0;
    color: var(--color-text);
    font-size: 1.5rem;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: color var(--duration-normal) var(--easing-default);
}

.close-btn:hover {
    color: var(--color-text);
}

.qr-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.qr-section {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2rem;
    align-items: center;
}

.qr-container {
    display: flex;
    justify-content: center;
    padding: 1rem;
    background: white;
    border-radius: 1rem;
    box-shadow: var(--shadow-md);
}

.qr-code {
    border-radius: 0.5rem;
}

.qr-code canvas {
    border-radius: 0.5rem;
    display: block;
}

.qr-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.qr-url {
    background: var(--color-surface-variant);
    padding: 1rem;
    border-radius: 0.5rem;
    font-family: monospace;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    word-break: break-all;
    margin: 0;
}

.qr-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.card-preview {
    background: var(--color-surface-variant);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
}

.card-preview h4 {
    margin: 0 0 1rem 0;
    color: var(--color-text);
    font-size: 1.2rem;
    font-weight: 600;
}

.preview-card {
    width: 100%;
    max-width: 350px;
    margin: 0 auto;
    padding: 1.5rem;
    border-radius: 1rem;
    color: white;
    box-shadow: var(--shadow-lg);
}

.preview-header {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-header h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 600;
}

.preview-bank {
    font-size: 0.9rem;
    opacity: 0.9;
}

.preview-info p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
}

.preview-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-status.active {
    background: rgba(40, 167, 69, 0.8);
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
}

.qr-stats {
    background: var(--color-surface-variant);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
}

.qr-stats h4 {
    margin: 0 0 1rem 0;
    color: var(--color-text);
    font-size: 1.2rem;
    font-weight: 600;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
}

.stat-icon {
    font-size: 1.5rem;
}

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-number {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-text);
}

.stat-label {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
}

.qr-instructions {
    background: var(--color-surface-variant);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
}

.qr-instructions h4 {
    margin: 0 0 1rem 0;
    color: var(--color-text);
    font-size: 1.2rem;
    font-weight: 600;
}

.qr-instructions ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--color-text-secondary);
}

.qr-instructions li {
    margin: 0.5rem 0;
    line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
    .qr-modal-content {
        width: 95%;
        margin: 1rem;
    }

    .qr-body {
        padding: 1rem;
    }

    .qr-section {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .qr-actions {
        justify-content: center;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>
