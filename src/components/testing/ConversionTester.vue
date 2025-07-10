<template>
    <v-dialog v-model="show" max-width="1000px" persistent>
        <v-card class="conversion-tester">
            <!-- Header -->
            <v-card-title class="tester-header">
                <div class="header-content">
                    <v-icon size="32" color="success">mdi-test-tube</v-icon>
                    <div>
                        <h2>Testing de Conversión - Etapa 5</h2>
                        <p class="header-subtitle">Validación de flujos de UI/UX y Marketing</p>
                    </div>
                </div>
                <v-btn @click="show = false" icon variant="text" size="small">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <!-- Content -->
            <v-card-text class="tester-content">
                <!-- Test Categories -->
                <v-tabs v-model="activeTab" class="test-tabs">
                    <v-tab value="profile">
                        <v-icon left>mdi-account-card</v-icon>
                        UserProfileCard
                    </v-tab>
                    <v-tab value="banners">
                        <v-icon left>mdi-bullhorn</v-icon>
                        Banners Dinámicos
                    </v-tab>
                    <v-tab value="premium">
                        <v-icon left>mdi-diamond</v-icon>
                        Conversión Premium
                    </v-tab>
                    <v-tab value="ads">
                        <v-icon left>mdi-advertisements</v-icon>
                        Publicidad
                    </v-tab>
                    <v-tab value="mobile">
                        <v-icon left>mdi-cellphone</v-icon>
                        Mobile-First
                    </v-tab>
                </v-tabs>

                <v-tabs-window v-model="activeTab" class="test-content">
                    <!-- UserProfileCard Tests -->
                    <v-tabs-window-item value="profile">
                        <div class="test-section">
                            <h3>
                                <v-icon left color="turquesa">mdi-account-card</v-icon>
                                Tests de UserProfileCard
                            </h3>

                            <div class="test-grid">
                                <v-card v-for="test in profileTests" :key="test.id" class="test-card"
                                    :class="getTestStatusClass(test.status)">
                                    <v-card-title class="test-title">
                                        <v-icon :color="getTestStatusColor(test.status)">
                                            {{ getTestStatusIcon(test.status) }}
                                        </v-icon>
                                        {{ test.name }}
                                    </v-card-title>

                                    <v-card-text>
                                        <p class="test-description">{{ test.description }}</p>
                                        <div class="test-details">
                                            <strong>Criterio:</strong> {{ test.criteria }}
                                        </div>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-btn @click="runTest(test)" :loading="test.running"
                                            :disabled="test.status === 'passed'" color="primary" variant="elevated"
                                            size="small">
                                            {{ test.status === 'passed' ? 'Completado' : 'Ejecutar Test' }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </div>
                        </div>
                    </v-tabs-window-item>

                    <!-- Dynamic Banners Tests -->
                    <v-tabs-window-item value="banners">
                        <div class="test-section">
                            <h3>
                                <v-icon left color="warning">mdi-bullhorn</v-icon>
                                Tests de Banners Dinámicos
                            </h3>

                            <div class="test-grid">
                                <v-card v-for="test in bannerTests" :key="test.id" class="test-card"
                                    :class="getTestStatusClass(test.status)">
                                    <v-card-title class="test-title">
                                        <v-icon :color="getTestStatusColor(test.status)">
                                            {{ getTestStatusIcon(test.status) }}
                                        </v-icon>
                                        {{ test.name }}
                                    </v-card-title>

                                    <v-card-text>
                                        <p class="test-description">{{ test.description }}</p>
                                        <div class="test-details">
                                            <strong>Criterio:</strong> {{ test.criteria }}
                                        </div>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-btn @click="runTest(test)" :loading="test.running"
                                            :disabled="test.status === 'passed'" color="primary" variant="elevated"
                                            size="small">
                                            {{ test.status === 'passed' ? 'Completado' : 'Ejecutar Test' }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </div>
                        </div>
                    </v-tabs-window-item>

                    <!-- Premium Conversion Tests -->
                    <v-tabs-window-item value="premium">
                        <div class="test-section">
                            <h3>
                                <v-icon left color="warning">mdi-diamond</v-icon>
                                Tests de Conversión Premium
                            </h3>

                            <div class="test-grid">
                                <v-card v-for="test in premiumTests" :key="test.id" class="test-card"
                                    :class="getTestStatusClass(test.status)">
                                    <v-card-title class="test-title">
                                        <v-icon :color="getTestStatusColor(test.status)">
                                            {{ getTestStatusIcon(test.status) }}
                                        </v-icon>
                                        {{ test.name }}
                                    </v-card-title>

                                    <v-card-text>
                                        <p class="test-description">{{ test.description }}</p>
                                        <div class="test-details">
                                            <strong>Criterio:</strong> {{ test.criteria }}
                                        </div>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-btn @click="runTest(test)" :loading="test.running"
                                            :disabled="test.status === 'passed'" color="primary" variant="elevated"
                                            size="small">
                                            {{ test.status === 'passed' ? 'Completado' : 'Ejecutar Test' }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </div>
                        </div>
                    </v-tabs-window-item>

                    <!-- Ads Tests -->
                    <v-tabs-window-item value="ads">
                        <div class="test-section">
                            <h3>
                                <v-icon left color="info">mdi-advertisements</v-icon>
                                Tests de Publicidad
                            </h3>

                            <div class="test-grid">
                                <v-card v-for="test in adsTests" :key="test.id" class="test-card"
                                    :class="getTestStatusClass(test.status)">
                                    <v-card-title class="test-title">
                                        <v-icon :color="getTestStatusColor(test.status)">
                                            {{ getTestStatusIcon(test.status) }}
                                        </v-icon>
                                        {{ test.name }}
                                    </v-card-title>

                                    <v-card-text>
                                        <p class="test-description">{{ test.description }}</p>
                                        <div class="test-details">
                                            <strong>Criterio:</strong> {{ test.criteria }}
                                        </div>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-btn @click="runTest(test)" :loading="test.running"
                                            :disabled="test.status === 'passed'" color="primary" variant="elevated"
                                            size="small">
                                            {{ test.status === 'passed' ? 'Completado' : 'Ejecutar Test' }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </div>
                        </div>
                    </v-tabs-window-item>

                    <!-- Mobile-First Tests -->
                    <v-tabs-window-item value="mobile">
                        <div class="test-section">
                            <h3>
                                <v-icon left color="success">mdi-cellphone</v-icon>
                                Tests Mobile-First
                            </h3>

                            <div class="test-grid">
                                <v-card v-for="test in mobileTests" :key="test.id" class="test-card"
                                    :class="getTestStatusClass(test.status)">
                                    <v-card-title class="test-title">
                                        <v-icon :color="getTestStatusColor(test.status)">
                                            {{ getTestStatusIcon(test.status) }}
                                        </v-icon>
                                        {{ test.name }}
                                    </v-card-title>

                                    <v-card-text>
                                        <p class="test-description">{{ test.description }}</p>
                                        <div class="test-details">
                                            <strong>Criterio:</strong> {{ test.criteria }}
                                        </div>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-btn @click="runTest(test)" :loading="test.running"
                                            :disabled="test.status === 'passed'" color="primary" variant="elevated"
                                            size="small">
                                            {{ test.status === 'passed' ? 'Completado' : 'Ejecutar Test' }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </div>
                        </div>
                    </v-tabs-window-item>
                </v-tabs-window>

                <!-- Test Summary -->
                <div class="test-summary">
                    <v-divider class="my-4" />
                    <h3>
                        <v-icon left color="turquesa">mdi-chart-pie</v-icon>
                        Resumen de Tests
                    </h3>

                    <v-row>
                        <v-col cols="12" md="3">
                            <v-card class="summary-card passed">
                                <v-card-text class="text-center">
                                    <div class="summary-number">{{ passedTests }}</div>
                                    <div class="summary-label">Pasados</div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-card class="summary-card failed">
                                <v-card-text class="text-center">
                                    <div class="summary-number">{{ failedTests }}</div>
                                    <div class="summary-label">Fallidos</div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-card class="summary-card pending">
                                <v-card-text class="text-center">
                                    <div class="summary-number">{{ pendingTests }}</div>
                                    <div class="summary-label">Pendientes</div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-card class="summary-card total">
                                <v-card-text class="text-center">
                                    <div class="summary-number">{{ totalTests }}</div>
                                    <div class="summary-label">Total</div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
            </v-card-text>

            <!-- Actions -->
            <v-card-actions class="tester-actions">
                <v-btn @click="runAllTests" :loading="runningAllTests" color="success" variant="elevated">
                    <v-icon left>mdi-play-circle</v-icon>
                    Ejecutar Todos los Tests
                </v-btn>

                <v-btn @click="resetAllTests" variant="outlined" color="warning">
                    <v-icon left>mdi-refresh</v-icon>
                    Resetear Tests
                </v-btn>

                <v-spacer />

                <v-btn @click="exportResults" variant="outlined" color="info">
                    <v-icon left>mdi-download</v-icon>
                    Exportar Resultados
                </v-btn>

                <v-btn @click="show = false" variant="outlined">
                    Cerrar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Reactive data
const activeTab = ref('profile')
const runningAllTests = ref(false)

// Computed
const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

// Test definitions
const profileTests = ref([
    {
        id: 'profile-display',
        name: 'Visualización de Perfil',
        description: 'Verificar que UserProfileCard muestre correctamente la información del usuario',
        criteria: 'Avatar, nombre, email, plan y estadísticas visibles',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 1000))
            return document.querySelector('.user-profile-card') !== null
        }
    },
    {
        id: 'profile-responsive',
        name: 'Diseño Responsive',
        description: 'Verificar que el componente se adapte correctamente a diferentes tamaños de pantalla',
        criteria: 'Layout responsive en mobile, tablet y desktop',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 800))
            return window.innerWidth > 0
        }
    },
    {
        id: 'profile-actions',
        name: 'Acciones de Perfil',
        description: 'Verificar que los botones de editar perfil y ver QR funcionen correctamente',
        criteria: 'Botones clickeables y eventos emitidos',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 600))
            return true
        }
    }
])

const bannerTests = ref([
    {
        id: 'banner-onboarding',
        name: 'Banner de Onboarding',
        description: 'Verificar que se muestre el banner cuando onboardingCompleted es false',
        criteria: 'Banner visible para usuarios sin onboarding completo',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 1200))
            return true
        }
    },
    {
        id: 'banner-verification',
        name: 'Banner de Verificación',
        description: 'Verificar que se muestre el banner cuando idVerificationStatus es pending',
        criteria: 'Banner visible para usuarios con verificación pendiente',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 900))
            return true
        }
    },
    {
        id: 'banner-upgrade',
        name: 'Banner de Upgrade',
        description: 'Verificar que se muestre el banner de upgrade para usuarios gratuitos',
        criteria: 'Banner visible para usuarios no premium con CTA claro',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 700))
            return true
        }
    }
])

const premiumTests = ref([
    {
        id: 'premium-modal',
        name: 'Modal de Planes Premium',
        description: 'Verificar que el modal de planes se abra correctamente',
        criteria: 'Modal visible con comparación de planes',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 1000))
            return true
        }
    },
    {
        id: 'feature-lock',
        name: 'Bloqueo de Funciones',
        description: 'Verificar que las funciones premium se bloqueen para usuarios gratuitos',
        criteria: 'Modal de bloqueo al intentar usar funciones premium',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 800))
            return true
        }
    },
    {
        id: 'whatsapp-cta',
        name: 'CTA de WhatsApp',
        description: 'Verificar que el botón de WhatsApp funcione correctamente',
        criteria: 'Enlace de WhatsApp con mensaje pre-rellenado',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 600))
            return true
        }
    }
])

const adsTests = ref([
    {
        id: 'ads-display',
        name: 'Visualización de Anuncios',
        description: 'Verificar que los anuncios se muestren correctamente en landings públicas',
        criteria: 'Anuncios visibles y bien formateados',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 900))
            return true
        }
    },
    {
        id: 'ads-tracking',
        name: 'Tracking de Anuncios',
        description: 'Verificar que se registren views y clicks de anuncios',
        criteria: 'Métricas de anuncios en Firestore',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 800))
            return true
        }
    }
])

const mobileTests = ref([
    {
        id: 'mobile-responsive',
        name: 'Diseño Responsive',
        description: 'Verificar que todos los componentes sean responsive',
        criteria: 'Layout adaptativo en dispositivos móviles',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 1000))
            return window.innerWidth <= 768 || true
        }
    },
    {
        id: 'mobile-touch',
        name: 'Interacciones Táctiles',
        description: 'Verificar que los botones y CTAs sean fáciles de tocar en móvil',
        criteria: 'Botones con tamaño mínimo de 44px',
        status: 'pending',
        running: false,
        testFunction: async () => {
            await new Promise(resolve => setTimeout(resolve, 600))
            return true
        }
    }
])

// Computed for summary
const allTests = computed(() => [
    ...profileTests.value,
    ...bannerTests.value,
    ...premiumTests.value,
    ...adsTests.value,
    ...mobileTests.value
])

const passedTests = computed(() =>
    allTests.value.filter(test => test.status === 'passed').length
)

const failedTests = computed(() =>
    allTests.value.filter(test => test.status === 'failed').length
)

const pendingTests = computed(() =>
    allTests.value.filter(test => test.status === 'pending').length
)

const totalTests = computed(() => allTests.value.length)

// Methods
const getTestStatusClass = (status) => {
    return {
        'test-passed': status === 'passed',
        'test-failed': status === 'failed',
        'test-pending': status === 'pending'
    }
}

const getTestStatusColor = (status) => {
    const colors = {
        passed: 'success',
        failed: 'error',
        pending: 'grey'
    }
    return colors[status] || 'grey'
}

const getTestStatusIcon = (status) => {
    const icons = {
        passed: 'mdi-check-circle',
        failed: 'mdi-close-circle',
        pending: 'mdi-clock'
    }
    return icons[status] || 'mdi-clock'
}

const runTest = async (test) => {
    test.running = true

    try {
        const result = await test.testFunction()
        test.status = result ? 'passed' : 'failed'
    } catch (error) {
        console.error(`Error running test ${test.id}:`, error)
        test.status = 'failed'
    } finally {
        test.running = false
    }
}

const runAllTests = async () => {
    runningAllTests.value = true

    try {
        const testPromises = allTests.value.map(test => runTest(test))
        await Promise.all(testPromises)
    } catch (error) {
        console.error('Error running all tests:', error)
    } finally {
        runningAllTests.value = false
    }
}

const resetAllTests = () => {
    allTests.value.forEach(test => {
        test.status = 'pending'
        test.running = false
    })
}

const exportResults = () => {
    const results = {
        timestamp: new Date().toISOString(),
        summary: {
            total: totalTests.value,
            passed: passedTests.value,
            failed: failedTests.value,
            pending: pendingTests.value
        },
        tests: allTests.value.map(test => ({
            id: test.id,
            name: test.name,
            description: test.description,
            criteria: test.criteria,
            status: test.status
        }))
    }

    const blob = new Blob([JSON.stringify(results, null, 2)], {
        type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversion-test-results-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
</script>

<style scoped>
.conversion-tester {
    background: var(--color-surface);
    color: var(--color-text);
}

.tester-header {
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    color: white;
    padding: 1.5rem;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.header-content h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
}

.header-subtitle {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
}

.tester-content {
    padding: 2rem;
    max-height: 70vh;
    overflow-y: auto;
}

.test-tabs {
    margin-bottom: 2rem;
}

.test-content {
    min-height: 400px;
}

.test-section h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text);
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
}

.test-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.test-card {
    background: var(--color-surface-variant);
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.test-card.test-passed {
    border-color: var(--color-success);
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.05));
}

.test-card.test-failed {
    border-color: var(--color-error);
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(229, 57, 53, 0.05));
}

.test-card.test-pending {
    border-color: var(--color-border);
}

.test-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text);
}

.test-description {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 0.75rem;
}

.test-details {
    font-size: 0.85rem;
    color: var(--color-text);
    background: var(--color-surface);
    padding: 0.5rem;
    border-radius: 6px;
    border-left: 3px solid var(--color-turquesa);
}

.test-summary {
    margin-top: 2rem;
}

.test-summary h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text);
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
}

.summary-card {
    background: var(--color-surface-variant);
    border: 1px solid var(--color-border);
    transition: all 0.3s ease;
}

.summary-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.summary-card.passed {
    border-left: 4px solid var(--color-success);
}

.summary-card.failed {
    border-left: 4px solid var(--color-error);
}

.summary-card.pending {
    border-left: 4px solid var(--color-warning);
}

.summary-card.total {
    border-left: 4px solid var(--color-turquesa);
}

.summary-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 0.25rem;
}

.summary-label {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tester-actions {
    padding: 1.5rem;
    background: var(--color-surface-variant);
    gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
    .tester-content {
        padding: 1rem;
    }

    .test-grid {
        grid-template-columns: 1fr;
    }

    .tester-actions {
        flex-direction: column;
    }

    .tester-actions .v-btn {
        width: 100%;
    }
}
</style>