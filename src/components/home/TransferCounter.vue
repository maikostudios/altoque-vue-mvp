<template>
    <div class="transfer-counter">
        <div class="counter-header">
            <h3 class="counter-title">Transferencias Realizadas</h3>
            <p class="counter-subtitle">Clientes que han confiado en nosotros</p>
        </div>

        <div class="flip-counter">
            <div v-for="(digit, index) in formattedCount" :key="`digit-${index}`" class="flip-digit"
                :class="{ 'flip-animation': animatingDigits[index] }">
                <div class="flip-card">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <span class="digit">{{ digit }}</span>
                        </div>
                        <div class="flip-card-back">
                            <span class="digit">{{ digit }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="counter-footer">
            <div class="trust-indicators">
                <div class="indicator">
                    <span class="indicator-icon">🔒</span>
                    <span class="indicator-text">100% Seguro</span>
                </div>
                <div class="indicator">
                    <span class="indicator-icon">⚡</span>
                    <span class="indicator-text">Instantáneo</span>
                </div>
                <div class="indicator">
                    <span class="indicator-icon">✅</span>
                    <span class="indicator-text">Verificado</span>
                </div>
            </div>

            <!-- Botón de prueba solo en desarrollo -->
            <div v-if="isDev" class="test-section">
                <button @click="testIncrement" class="test-btn">
                    🧪 Probar Contador (+1)
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTransferCounterStore } from '@/store/transferCounter'

const counterStore = useTransferCounterStore()
const animatingDigits = ref({})

// Detectar si estamos en desarrollo
const isDev = computed(() => import.meta.env.DEV)

// Formatear el contador para mostrar siempre 6 dígitos
const formattedCount = computed(() => {
    const count = counterStore.count.toString().padStart(6, '0')
    return count.split('')
})

// Animar dígitos cuando cambie el contador
watch(() => counterStore.count, (newCount, oldCount) => {
    if (oldCount !== undefined) {
        animateCounterChange(oldCount, newCount)
    }
}, { immediate: false })

const animateCounterChange = (oldCount, newCount) => {
    const oldFormatted = oldCount.toString().padStart(6, '0').split('')
    const newFormatted = newCount.toString().padStart(6, '0').split('')

    // Encontrar qué dígitos cambiaron
    oldFormatted.forEach((digit, index) => {
        if (digit !== newFormatted[index]) {
            // Animar este dígito
            animatingDigits.value[index] = true

            // Quitar la animación después de 600ms
            setTimeout(() => {
                animatingDigits.value[index] = false
            }, 600)
        }
    })
}

// Función de prueba para incrementar el contador
const testIncrement = () => {
    counterStore.incrementCounter()
}

onMounted(() => {
    // Cargar el contador inicial
    counterStore.loadCounter()

    // Simular incremento inicial para demostración
    if (counterStore.count === 0) {
        counterStore.setInitialCount(25134) // Número inicial atractivo
    }
})
</script>

<style scoped>
.transfer-counter {
    background: rgba(24, 26, 32, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 2rem;
    text-align: center;
    border: 1px solid rgba(0, 204, 204, 0.1);
    box-shadow: 0 8px 32px rgba(0, 204, 204, 0.1);
    margin: 2rem 0;
}

.counter-header {
    margin-bottom: 2rem;
}

.counter-title {
    font-size: 1.8rem;
    font-weight: bold;
    color: #fff;
    margin-bottom: 0.5rem;
    font-family: 'Montserrat', sans-serif;
}

.counter-subtitle {
    color: #bababa;
    font-size: 1rem;
    margin: 0;
    font-family: 'Roboto', sans-serif;
}

/* Flip Counter Styles */
.flip-counter {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 2rem 0;
    perspective: 1000px;
}

.flip-digit {
    width: 60px;
    height: 80px;
    position: relative;
}

.flip-card {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.flip-animation .flip-card {
    animation: flipAnimation 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.flip-card-front,
.flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
    border: 2px solid rgba(0, 204, 204, 0.3);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
        0 4px 8px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.flip-card-back {
    transform: rotateX(180deg);
    background: linear-gradient(145deg, #00cccc, #1c94e0);
}

.digit {
    font-size: 2.5rem;
    font-weight: bold;
    color: #fff;
    font-family: 'Montserrat', sans-serif;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.flip-card-back .digit {
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Separadores entre grupos de dígitos */
.flip-digit:nth-child(2)::after,
.flip-digit:nth-child(4)::after {
    content: '';
    position: absolute;
    right: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    background: #00cccc;
    border-radius: 50%;
    box-shadow:
        0 12px 0 #00cccc,
        0 -12px 0 #00cccc;
}

/* Animación de flip */
@keyframes flipAnimation {
    0% {
        transform: rotateX(0deg);
    }

    50% {
        transform: rotateX(-90deg);
    }

    100% {
        transform: rotateX(0deg);
    }
}

/* Footer del contador */
.counter-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(0, 204, 204, 0.1);
}

.trust-indicators {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
}

.indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.indicator-icon {
    font-size: 1.2rem;
}

.indicator-text {
    color: #bababa;
    font-size: 0.9rem;
    font-family: 'Roboto', sans-serif;
}

/* Responsive */
@media (max-width: 768px) {
    .transfer-counter {
        padding: 1.5rem;
        margin: 1.5rem 0;
    }

    .counter-title {
        font-size: 1.5rem;
    }

    .flip-digit {
        width: 45px;
        height: 60px;
    }

    .digit {
        font-size: 1.8rem;
    }

    .flip-counter {
        gap: 6px;
    }

    .trust-indicators {
        gap: 1rem;
    }

    .indicator-text {
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .flip-digit {
        width: 35px;
        height: 50px;
    }

    .digit {
        font-size: 1.4rem;
    }

    .trust-indicators {
        flex-direction: column;
        gap: 0.8rem;
    }
}

/* Botón de prueba */
.test-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.test-btn {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.test-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.test-btn:active {
    transform: translateY(0);
}

/* Efectos de hover */
.flip-digit:hover .flip-card {
    transform: scale(1.05);
}

.transfer-counter:hover {
    box-shadow: 0 12px 40px rgba(0, 204, 204, 0.15);
}
</style>
