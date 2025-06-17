<template>
    <div class="qr-generator">
        <h2>🔲 Generador de Código QR</h2>

        <div class="input-section">
            <label for="qr-input">Ingresa el texto o URL:</label>
            <input id="qr-input" v-model="qrText" type="text" placeholder="https://ejemplo.com" class="qr-input">
        </div>

        <div class="options-section">
            <div class="option-group">
                <label for="qr-size">Tamaño:</label>
                <input id="qr-size" v-model.number="qrSize" type="range" min="100" max="400" step="50"
                    class="size-slider">
                <span class="size-value">{{ qrSize }}px</span>
            </div>

            <div class="option-group">
                <label for="qr-level">Nivel de corrección:</label>
                <select id="qr-level" v-model="errorLevel" class="level-select">
                    <option value="L">Bajo (L)</option>
                    <option value="M">Medio (M)</option>
                    <option value="Q">Alto (Q)</option>
                    <option value="H">Muy Alto (H)</option>
                </select>
            </div>

            <div class="option-group">
                <label for="qr-format">Formato:</label>
                <select id="qr-format" v-model="renderFormat" class="format-select">
                    <option value="canvas">Canvas</option>
                    <option value="svg">SVG</option>
                </select>
            </div>
        </div>

        <div class="color-section">
            <div class="color-group">
                <label for="bg-color">Color de fondo:</label>
                <input id="bg-color" v-model="backgroundColor" type="color" class="color-picker">
            </div>

            <div class="color-group">
                <label for="fg-color">Color del código:</label>
                <input id="fg-color" v-model="foregroundColor" type="color" class="color-picker">
            </div>
        </div>

        <div class="qr-display">
            <div v-if="qrText" class="qr-container">
                <qrcode-vue :value="qrText" :size="qrSize" :level="errorLevel" :render-as="renderFormat"
                    :background="backgroundColor" :foreground="foregroundColor" :margin="2" class="qr-code"
                    ref="qrCodeElement" />
            </div>
            <div v-else class="qr-placeholder">
                <p>📱 Ingresa un texto para generar el código QR</p>
            </div>
        </div>

        <div class="actions-section">
            <button @click="downloadQR" :disabled="!qrText" class="download-btn">
                📥 Descargar QR
            </button>

            <button @click="copyToClipboard" :disabled="!qrText" class="copy-btn">
                📋 Copiar Imagen
            </button>

            <button @click="resetForm" class="reset-btn">
                🔄 Limpiar
            </button>
        </div>

        <div class="info-section">
            <h3>💡 Consejos de uso:</h3>
            <ul>
                <li><strong>Nivel H:</strong> Mejor para códigos que pueden dañarse</li>
                <li><strong>SVG:</strong> Ideal para impresión y escalado</li>
                <li><strong>Canvas:</strong> Mejor para web y descargas</li>
                <li><strong>Tamaño:</strong> Mínimo 100px para buena legibilidad</li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import QrcodeVue from 'qrcode.vue'

// Estado reactivo
const qrText = ref('')
const qrSize = ref(200)
const errorLevel = ref('M')
const renderFormat = ref('canvas')
const backgroundColor = ref('#ffffff')
const foregroundColor = ref('#000000')

// Referencias
const qrCodeElement = ref(null)

// Funciones
const downloadQR = () => {
    try {
        if (!qrCodeElement.value) return

        // Buscar el canvas o SVG dentro del componente
        const element = qrCodeElement.value.$el
        let downloadElement

        if (renderFormat.value === 'canvas') {
            downloadElement = element.querySelector('canvas')
        } else {
            downloadElement = element.querySelector('svg')
        }

        if (!downloadElement) {
            alert('Error: No se pudo encontrar el código QR para descargar')
            return
        }

        const link = document.createElement('a')
        const fileName = `qr-${Date.now()}.${renderFormat.value === 'canvas' ? 'png' : 'svg'}`

        if (renderFormat.value === 'canvas') {
            link.href = downloadElement.toDataURL('image/png')
        } else {
            const svgData = new XMLSerializer().serializeToString(downloadElement)
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
            link.href = URL.createObjectURL(svgBlob)
        }

        link.download = fileName
        link.click()

        if (renderFormat.value === 'svg') {
            URL.revokeObjectURL(link.href)
        }
    } catch (error) {
        console.error('Error descargando QR:', error)
        alert('Error al descargar el código QR')
    }
}

const copyToClipboard = async () => {
    try {
        if (!qrCodeElement.value) return

        const element = qrCodeElement.value.$el
        const canvas = element.querySelector('canvas')

        if (!canvas) {
            alert('La función de copiar solo funciona con formato Canvas')
            return
        }

        canvas.toBlob(async (blob) => {
            try {
                const item = new ClipboardItem({ 'image/png': blob })
                await navigator.clipboard.write([item])
                alert('✅ Imagen copiada al portapapeles')
            } catch (error) {
                console.error('Error copiando imagen:', error)
                alert('❌ Error al copiar la imagen')
            }
        })
    } catch (error) {
        console.error('Error copiando imagen:', error)
        alert('❌ Error al copiar la imagen')
    }
}

const resetForm = () => {
    qrText.value = ''
    qrSize.value = 200
    errorLevel.value = 'M'
    renderFormat.value = 'canvas'
    backgroundColor.value = '#ffffff'
    foregroundColor.value = '#000000'
}
</script>

<style scoped>
.qr-generator {
    max-width: 700px;
    margin: 0 auto;
    padding: 2rem;
    background: var(--color-surface);
    border-radius: 1rem;
    box-shadow: var(--shadow-lg);
}

.qr-generator h2 {
    text-align: center;
    color: var(--color-text);
    margin-bottom: 2rem;
    font-size: 1.8rem;
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.input-section {
    margin-bottom: 2rem;
}

.input-section label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--color-text);
    font-weight: 600;
}

.qr-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-surface-variant);
    color: var(--color-text);
    font-size: 1rem;
    transition: all var(--duration-normal) var(--easing-default);
}

.qr-input:focus {
    outline: none;
    border-color: var(--color-turquesa);
    box-shadow: 0 0 0 3px rgba(0, 204, 204, 0.2);
}

.options-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.option-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.option-group label {
    color: var(--color-text);
    font-weight: 600;
    font-size: 0.9rem;
}

.size-slider {
    width: 100%;
    accent-color: var(--color-turquesa);
}

.size-value {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    text-align: center;
    font-weight: 600;
}

.level-select,
.format-select {
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-surface-variant);
    color: var(--color-text);
    transition: all var(--duration-normal) var(--easing-default);
}

.level-select:focus,
.format-select:focus {
    outline: none;
    border-color: var(--color-turquesa);
}

.color-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
}

.color-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.color-group label {
    color: var(--color-text);
    font-weight: 600;
    font-size: 0.9rem;
}

.color-picker {
    width: 100%;
    height: 40px;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all var(--duration-normal) var(--easing-default);
}

.color-picker:hover {
    transform: scale(1.02);
}

.qr-display {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
    min-height: 220px;
    align-items: center;
}

.qr-container {
    padding: 1rem;
    background: white;
    border-radius: 1rem;
    box-shadow: var(--shadow-md);
    transition: all var(--duration-normal) var(--easing-default);
}

.qr-container:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.qr-code {
    border-radius: 0.5rem;
    display: block;
}

.qr-placeholder {
    text-align: center;
    color: var(--color-text-secondary);
    font-style: italic;
    padding: 2rem;
    border: 2px dashed var(--color-border);
    border-radius: 1rem;
}

.actions-section {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
}

.download-btn,
.copy-btn,
.reset-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-normal) var(--easing-default);
    font-size: 0.95rem;
}

.download-btn {
    background: var(--color-turquesa);
    color: white;
}

.download-btn:hover:not(:disabled) {
    background: var(--color-azul);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.copy-btn {
    background: var(--color-azul);
    color: white;
}

.copy-btn:hover:not(:disabled) {
    background: var(--color-turquesa);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.reset-btn {
    background: var(--color-surface-variant);
    color: var(--color-text);
    border: 1px solid var(--color-border);
}

.reset-btn:hover {
    background: var(--color-border);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.download-btn:disabled,
.copy-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.info-section {
    background: var(--color-surface-variant);
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
}

.info-section h3 {
    margin: 0 0 1rem 0;
    color: var(--color-text);
    font-size: 1.1rem;
}

.info-section ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--color-text-secondary);
}

.info-section li {
    margin: 0.5rem 0;
    line-height: 1.4;
}

.info-section strong {
    color: var(--color-text);
}

/* Responsive */
@media (max-width: 768px) {
    .qr-generator {
        padding: 1rem;
    }

    .options-section {
        grid-template-columns: 1fr;
    }

    .color-section {
        grid-template-columns: 1fr;
    }

    .actions-section {
        flex-direction: column;
    }
}
</style>
