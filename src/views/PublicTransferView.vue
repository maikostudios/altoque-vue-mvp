<template>
    <div class="public-transfer">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="spinner-large"></div>
            <p>Cargando información...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
            <div class="error-icon">❌</div>
            <h2>Token no válido</h2>
            <p>El enlace que has seguido no es válido o ha expirado.</p>
            <p>Por favor, verifica el enlace o contacta al propietario.</p>
        </div>

        <!-- Info State - Acceso directo sin token -->
        <div v-else-if="!userInfo && !loading && !error" class="info-container">
            <div class="info-icon">ℹ️</div>
            <h2>Página de Transferencias</h2>
            <p>Esta es una página pública para recibir datos de transferencia.</p>
            <p>Para acceder a los datos de un usuario específico, necesitas un enlace válido o código QR.</p>
            <div class="info-actions">
                <router-link to="/" class="btn btn-primary">
                    🏠 Ir al Inicio
                </router-link>
            </div>
        </div>

        <!-- Success State -->
        <div v-else-if="userInfo && tarjetas.length > 0" class="transfer-content">
            <!-- ✅ NUEVO: Publicidad de Maiko Studios (Top Banner) -->
            <div class="ads-section top-ads">
                <MaikoStudiosAds placement="banner" :context="adContext" :user-info="userInfo"
                    @ad-clicked="handleAdClick" @ad-viewed="handleAdView" />
            </div>

            <!-- Header del usuario -->
            <div class="user-header">
                <div class="user-avatar">
                    <div class="avatar-placeholder">
                        {{ userInfo.nombre?.charAt(0) || '?' }}{{ userInfo.apellido?.charAt(0) || '' }}
                    </div>
                </div>
                <div class="user-info">
                    <h1>{{ userInfo.nombre }} {{ userInfo.apellido }}</h1>
                    <p v-if="userInfo.empresa" class="user-company">{{ userInfo.empresa }}</p>
                    <p class="user-description">Selecciona una opción para transferir</p>
                </div>
                <div v-if="userInfo.esPremium" class="premium-badge">
                    ⭐ Premium
                </div>
            </div>

            <!-- Tarjetas bancarias -->
            <div class="cards-section">
                <h2>💳 Opciones de Transferencia</h2>
                <div class="cards-grid">
                    <div v-for="tarjeta in tarjetasActivas" :key="tarjeta.id" class="bank-card"
                        :style="{ background: getCardGradient(tarjeta.colorTema) }" @click="selectCard(tarjeta)">
                        <div class="card-header">
                            <h3>{{ tarjeta.tituloPersonalizado || tarjeta.nombreTarjeta }}</h3>
                            <div class="bank-logo">{{ tarjeta.banco }}</div>
                        </div>

                        <div class="card-body">
                            <div class="card-info">
                                <p><strong>Tipo:</strong> {{ tarjeta.tipoCuenta }}</p>
                                <p><strong>Banco:</strong> {{ tarjeta.banco }}</p>
                                <p><strong>Titular:</strong> {{ tarjeta.nombreTitular.toUpperCase() }}</p>
                            </div>
                        </div>

                        <div class="card-footer">
                            <span class="tap-hint">👆 Toca para ver datos</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Información de contacto -->
            <div v-if="userInfo.telefono || userInfo.email" class="contact-section">
                <h3>📞 Información de Contacto</h3>
                <div class="contact-info">
                    <div v-if="userInfo.telefono" class="contact-item">
                        <span class="contact-icon">📱</span>
                        <a :href="`tel:${userInfo.telefono}`" class="contact-link">
                            {{ userInfo.telefono }}
                        </a>
                    </div>
                    <div v-if="userInfo.email" class="contact-item">
                        <span class="contact-icon">✉️</span>
                        <a :href="`mailto:${userInfo.email}`" class="contact-link">
                            {{ userInfo.email }}
                        </a>
                    </div>
                </div>
            </div>

            <!-- ✅ NUEVO: Publicidad de Maiko Studios (Bottom Banner) -->
            <div class="ads-section bottom-ads">
                <MaikoStudiosAds placement="footer" :context="adContext" :user-info="userInfo"
                    @ad-clicked="handleAdClick" @ad-viewed="handleAdView" />
            </div>

            <!-- ✅ ETAPA 6: Google AdSense (Solo en producción) -->
            <div v-if="showAdSense" class="ads-section adsense-ads">
                <AdSenseUnit ad-unit-id="1234567890" publisher-id="ca-pub-1234567890123456" format="horizontal"
                    size="responsive" placement="footer" @ad-loaded="handleAdSenseLoaded" @ad-error="handleAdSenseError"
                    @ad-impression="handleAdSenseImpression" @ad-click="handleAdSenseClick" />
            </div>
        </div>

        <!-- No cards state -->
        <div v-else-if="userInfo && tarjetas.length === 0" class="no-cards-container">
            <div class="no-cards-icon">💳</div>
            <h2>Sin tarjetas disponibles</h2>
            <p>{{ userInfo.nombre }} {{ userInfo.apellido }} aún no ha configurado tarjetas bancarias.</p>
        </div>

        <!-- Modal de detalles de tarjeta -->
        <div v-if="selectedCard" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>💳 Datos para Transferencia</h3>
                    <button @click="closeModal" class="close-btn">✕</button>
                </div>

                <div class="modal-body">
                    <div class="transfer-details">
                        <div class="detail-item">
                            <label>Banco:</label>
                            <span class="detail-value">{{ selectedCard.banco }}</span>
                        </div>

                        <div class="detail-item">
                            <label>Tipo de Cuenta:</label>
                            <span class="detail-value">{{ selectedCard.tipoCuenta }}</span>
                        </div>

                        <div class="detail-item">
                            <label>Número de Cuenta:</label>
                            <span class="detail-value copyable"
                                @click="copyToClipboard(formatAccountNumber(selectedCard.numeroCuenta))">
                                {{ formatAccountNumber(selectedCard.numeroCuenta) }}
                                <span class="copy-icon">📋</span>
                            </span>
                        </div>

                        <div class="detail-item">
                            <label>Titular:</label>
                            <span class="detail-value copyable"
                                @click="copyToClipboard(selectedCard.nombreTitular.toUpperCase())">
                                {{ selectedCard.nombreTitular.toUpperCase() }}
                                <span class="copy-icon">📋</span>
                            </span>
                        </div>

                        <div class="detail-item">
                            <label>RUT del Titular:</label>
                            <span class="detail-value copyable"
                                @click="copyToClipboard(formatRut(selectedCard.rutTitular))">
                                {{ formatRut(selectedCard.rutTitular) }}
                                <span class="copy-icon">📋</span>
                            </span>
                        </div>

                        <div v-if="selectedCard.emailTitular" class="detail-item">
                            <label>Email:</label>
                            <span class="detail-value">{{ selectedCard.emailTitular }}</span>
                        </div>
                    </div>

                    <div class="copy-all-section">
                        <button @click="copyAllData" class="btn btn-primary">
                            📋 Copiar Todos los Datos
                        </button>
                    </div>

                    <div class="instructions">
                        <h4>💡 Instrucciones:</h4>
                        <ul>
                            <li>Toca cualquier dato para copiarlo al portapapeles</li>
                            <li>Usa estos datos en tu app bancaria para hacer la transferencia</li>
                            <li>Verifica siempre el nombre del titular antes de transferir</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Powered by <strong>De Una</strong> - Transferencias Seguras</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '@/firebase'
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore'
import { incrementTransferCounter } from '@/store/transferCounter'
import { metricsService } from '@/services/metricsService'
import { analyticsService } from '@/services/analyticsService'
import MaikoStudiosAds from '@/components/ads/MaikoStudiosAds.vue'
import AdSenseUnit from '@/components/ads/AdSenseUnit.vue'
// ✅ ETAPA 6: Servicios de monitoreo
import { performanceService } from '@/services/performanceService'
import { crashlyticsService } from '@/services/crashlyticsService'
import { budgetMonitoringService } from '@/services/budgetMonitoringService'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref(false)
const userInfo = ref(null)
const tarjetas = ref([])
const selectedCard = ref(null)
const tokenCaptured = ref(false) // Para evitar loops

// ✅ NUEVO: Variables para publicidad
const adContext = ref({
    industry: null,
    keywords: [],
    userType: 'visitor'
})

// ✅ ETAPA 6: Variables para AdSense
const showAdSense = ref(process.env.NODE_ENV === 'production')

// Computed
const tarjetasActivas = computed(() => {
    return tarjetas.value.filter(tarjeta => tarjeta.activa)
})

// Funciones
const loadUserData = async () => {
    try {
        loading.value = true
        error.value = false

        // Obtener identificador desde la URL (parámetro o query) o sessionStorage
        let userId = route.params.id || route.query.id || route.query.tkn

        // Si no hay token en la URL, intentar recuperar de sessionStorage
        if (!userId) {
            userId = sessionStorage.getItem('deuna_transfer_token')
        }

        if (!userId) {
            // No hay token disponible, mostrar página de información
            loading.value = false
            return
        }

        console.log('🔍 Buscando usuario con ID:', userId)

        // 📊 TRACKING: Registrar visita a la página
        await metricsService.trackPageVisit(userId)

        // 📊 ANALYTICS: Registrar visita detallada con datos del dispositivo
        await analyticsService.trackDetailedVisit(userId)

        // 🎯 REEMPLAZO DE HISTORIAL: Limpiar URL después de capturar el token
        if (!tokenCaptured.value && (route.params.id || route.query.id || route.query.tkn)) {
            tokenCaptured.value = true

            // Guardar token en sessionStorage para recargas de página
            sessionStorage.setItem('deuna_transfer_token', userId)

            // Reemplazar la URL actual con la versión limpia
            router.replace({
                path: '/datostransferencia',
                query: {} // Limpiar todos los query parameters
            })

            console.log('🔄 URL limpiada a: /datostransferencia')
            console.log('💾 Token guardado en sessionStorage')
        }

        // Buscar usuario por token público, RUT o UID
        let usersQuery

        // Si parece ser un UID de Firebase (28 caracteres alfanuméricos)
        if (userId.length === 28 && /^[a-zA-Z0-9]+$/.test(userId)) {
            usersQuery = query(
                collection(db, 'users'),
                where('tokenPublico', '==', userId)
            )
        }
        // Si parece ser un RUT (formato chileno)
        else if (/^\d{7,8}[-kK\d]?$/.test(userId.replace(/[.\-]/g, ''))) {
            const cleanRut = userId.replace(/[.\-]/g, '').toLowerCase()
            usersQuery = query(
                collection(db, 'users'),
                where('rut', '==', cleanRut)
            )
        }
        // Buscar por token público como fallback
        else {
            usersQuery = query(
                collection(db, 'users'),
                where('tokenPublico', '==', userId)
            )
        }

        const usersSnapshot = await getDocs(usersQuery)

        if (usersSnapshot.empty) {
            console.log('❌ No se encontró usuario con el ID:', userId)
            error.value = true
            return
        }

        // Obtener datos del usuario
        const userDoc = usersSnapshot.docs[0]
        userInfo.value = { id: userDoc.id, ...userDoc.data() }

        console.log('✅ Usuario encontrado:', userInfo.value.nombre)

        // Cargar tarjetas del usuario
        await loadUserCards(userInfo.value.email)

        // Registrar visita
        await registerVisit()

    } catch (error) {
        console.error('Error cargando datos:', error)
        error.value = true
    } finally {
        loading.value = false
    }
}

const loadUserCards = async (userEmail) => {
    try {
        const cardsQuery = query(
            collection(db, 'bank_cards'),
            where('propietarioEmail', '==', userEmail)
        )

        const cardsSnapshot = await getDocs(cardsQuery)
        tarjetas.value = []

        cardsSnapshot.forEach((doc) => {
            tarjetas.value.push({
                id: doc.id,
                ...doc.data()
            })
        })

        console.log('💳 Tarjetas cargadas:', tarjetas.value.length)

    } catch (error) {
        console.error('Error cargando tarjetas:', error)
    }
}

const registerVisit = async () => {
    try {
        // Registrar visita en el usuario (solo si es Premium)
        if (userInfo.value.esPremium) {
            await updateDoc(doc(db, 'users', userInfo.value.id), {
                ultimaVisitaPublica: new Date(),
                visitasTotales: increment(1)
            })
        }
    } catch (error) {
        console.error('Error registrando visita:', error)
    }
}

const getCardGradient = (colorTema) => {
    const colorMap = {
        'turquesa': 'linear-gradient(135deg, #00cccc, #1c94e0)',
        'azul': 'linear-gradient(135deg, #1c94e0, #0066cc)',
        'verde': 'linear-gradient(135deg, #28a745, #20c997)',
        'morado': 'linear-gradient(135deg, #6f42c1, #e83e8c)',
        'naranja': 'linear-gradient(135deg, #fd7e14, #ffc107)',
        'rojo': 'linear-gradient(135deg, #dc3545, #fd7e14)'
    }
    return colorMap[colorTema] || colorMap.turquesa
}

const selectCard = async (tarjeta) => {
    selectedCard.value = tarjeta

    // Registrar escaneo/vista de la tarjeta
    try {
        await updateDoc(doc(db, 'bank_cards', tarjeta.id), {
            vistas: increment(1),
            ultimaVisita: new Date()
        })
    } catch (error) {
        console.error('Error registrando vista de tarjeta:', error)
    }
}

const closeModal = () => {
    selectedCard.value = null
}

// Funciones de formato para datos bancarios
const formatRut = (rut) => {
    if (!rut) return ''
    // Formatear RUT con puntos y guión especial (‑ es guión no-break)
    return rut.replace(/^(\d{1,2})(\d{3})(\d{3})([kK\d])$/, '$1.$2.$3‑$4')
}

const formatAccountNumber = (account) => {
    if (!account) return ''
    // Formatear número de cuenta con espacios cada 3 dígitos
    return account.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, '$1 ')
}

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text)
        showCopyFeedback()
        // Incrementar contador global de transferencias
        incrementTransferCounter()

        // 📊 ANALYTICS: Registrar uso del banco cuando se copia dato individual
        const userToken = sessionStorage.getItem('deuna_transfer_token') || route.params.id || route.query.id || route.query.tkn
        if (selectedCard.value && userToken) {
            await analyticsService.trackBankUsage(
                userToken,
                selectedCard.value.banco,
                selectedCard.value.tipoCuenta
            )
        }
    } catch (error) {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        showCopyFeedback()
        // Incrementar contador global de transferencias
        incrementTransferCounter()
    }
}

const copyAllData = async () => {
    // ✅ ETAPA 6: Iniciar monitoreo de performance
    const copyTrace = performanceService.startCopyDataTrace(1)

    try {
        // Formato específico para formularios bancarios
        const formatRut = (rut) => {
            if (!rut) return ''
            // Formatear RUT con puntos y guión
            return rut.replace(/^(\d{1,2})(\d{3})(\d{3})([kK\d])$/, '$1.$2.$3‑$4')
        }

        const formatAccountNumber = (account) => {
            if (!account) return ''
            // Formatear número de cuenta con espacios cada 3 dígitos
            return account.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, '$1 ')
        }

        const allData = `Nombre: ${selectedCard.value.nombreTitular.toUpperCase()}
RUT: ${formatRut(selectedCard.value.rutTitular)}
Banco: ${selectedCard.value.banco.toUpperCase()}
Tipo de cuenta: ${selectedCard.value.tipoCuenta}
Número de cuenta: ${formatAccountNumber(selectedCard.value.numeroCuenta)}
${selectedCard.value.emailTitular ? `Correo: ${selectedCard.value.emailTitular.toLowerCase()}` : ''}`

        // 📊 TRACKING: Registrar click en copiar todos los datos
        const userToken = sessionStorage.getItem('deuna_transfer_token') || route.params.id || route.query.id || route.query.tkn
        await metricsService.trackCopyAllData(userToken)

        // 📊 ANALYTICS: Registrar uso del banco específico
        if (selectedCard.value && userToken) {
            await analyticsService.trackBankUsage(
                userToken,
                selectedCard.value.banco,
                selectedCard.value.tipoCuenta
            )
        }

        // Usar la función copyToClipboard que ya incrementa el contador
        copyToClipboard(allData)

        // ✅ ETAPA 6: Finalizar traza exitosa
        performanceService.stopTrace('copy_data_action', {
            bank_name: selectedCard.value.banco,
            account_type: selectedCard.value.tipoCuenta,
            copy_success: 1
        })

        // Incrementar contador de escrituras de Firestore
        budgetMonitoringService.incrementFirestoreWrites(2) // Métricas + analytics

    } catch (error) {
        console.error('Error en copyAllData:', error)

        // ✅ ETAPA 6: Registrar error y finalizar traza
        crashlyticsService.recordError('copy_all_data_error', error, {
            component: 'PublicTransferView',
            action: 'copyAllData',
            hasSelectedCard: !!selectedCard.value
        }, 'medium')

        performanceService.stopTrace('copy_data_action', {
            copy_success: 0,
            error_count: 1
        })
    }
}

const showCopyFeedback = () => {
    // Crear elemento de feedback temporal
    const feedback = document.createElement('div')
    feedback.textContent = '✅ Copiado!'
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #28a745;
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `

    document.body.appendChild(feedback)

    setTimeout(() => {
        document.body.removeChild(feedback)
    }, 2000)
}

// ✅ NUEVO: Funciones para manejar publicidad
const detectAdContext = () => {
    // Detectar industria basada en información del usuario
    if (userInfo.value?.empresa) {
        const empresa = userInfo.value.empresa.toLowerCase()

        if (empresa.includes('restaurant') || empresa.includes('comida') || empresa.includes('food')) {
            adContext.value.industry = 'restaurant'
            adContext.value.keywords = ['restaurant', 'comida', 'food']
        } else if (empresa.includes('tienda') || empresa.includes('retail') || empresa.includes('shop')) {
            adContext.value.industry = 'retail'
            adContext.value.keywords = ['retail', 'tienda', 'shop']
        } else if (empresa.includes('servicio') || empresa.includes('service')) {
            adContext.value.industry = 'services'
            adContext.value.keywords = ['servicio', 'service']
        }
    }

    // Detectar tipo de usuario
    if (userInfo.value?.esPremium) {
        adContext.value.userType = 'premium'
    } else {
        adContext.value.userType = 'free'
    }
}

const handleAdClick = async (adData) => {
    console.log('🎯 Ad clicked:', adData)

    try {
        // Registrar click en analytics
        await analyticsService.trackEvent('ad_click', {
            adId: adData.adId,
            adType: adData.adType,
            placement: adData.placement,
            userToken: route.query.tkn || 'direct',
            timestamp: new Date()
        })

    } catch (error) {
        console.error('Error tracking ad click:', error)
    }
}

const handleAdView = async (adData) => {
    console.log('👁️ Ad viewed:', adData)

    try {
        // Registrar view en analytics
        await analyticsService.trackEvent('ad_view', {
            adId: adData.adId,
            adType: adData.adType,
            placement: adData.placement,
            userToken: route.query.tkn || 'direct',
            timestamp: new Date()
        })

    } catch (error) {
        console.error('Error tracking ad view:', error)
    }
}

// ✅ ETAPA 6: Funciones para manejar eventos de AdSense
const handleAdSenseLoaded = (adData) => {
    console.log('📺 AdSense ad loaded:', adData)
}

const handleAdSenseError = (adData) => {
    console.error('❌ AdSense ad error:', adData)
    crashlyticsService.recordError('adsense_error', new Error(adData.error), {
        component: 'PublicTransferView',
        adUnitId: adData.adUnitId
    }, 'medium')
}

const handleAdSenseImpression = async (adData) => {
    console.log('👁️ AdSense impression:', adData)

    try {
        // Registrar impresión en analytics
        await analyticsService.trackEvent('adsense_impression', {
            adUnitId: adData.adUnitId,
            placement: adData.placement,
            userToken: route.query.tkn || 'direct',
            timestamp: new Date()
        })

        // Incrementar contador de impresiones
        budgetMonitoringService.incrementFirestoreWrites(1)

    } catch (error) {
        console.error('Error tracking AdSense impression:', error)
    }
}

const handleAdSenseClick = async (adData) => {
    console.log('🖱️ AdSense click:', adData)

    try {
        // Registrar click en analytics
        await analyticsService.trackEvent('adsense_click', {
            adUnitId: adData.adUnitId,
            placement: adData.placement,
            userToken: route.query.tkn || 'direct',
            timestamp: new Date()
        })

        // Incrementar contador de clicks
        budgetMonitoringService.incrementFirestoreWrites(1)

    } catch (error) {
        console.error('Error tracking AdSense click:', error)
    }
}

// Limpiar sessionStorage al salir de la página (opcional para seguridad)
const cleanupOnExit = () => {
    sessionStorage.removeItem('deuna_transfer_token')
}

onMounted(() => {
    // ✅ ETAPA 6: Iniciar monitoreo de performance
    const landingTrace = performanceService.startPublicLandingTrace(route.query.tkn)

    loadUserData().then(() => {
        // ✅ NUEVO: Detectar contexto para publicidad después de cargar datos
        if (userInfo.value) {
            detectAdContext()
        }

        // ✅ ETAPA 6: Finalizar traza de performance
        performanceService.stopTrace('public_landing_load', {
            cards_count: tarjetas.value.length,
            has_user_data: userInfo.value ? 1 : 0,
            load_success: 1
        })

        // Incrementar contador de lecturas de Firestore
        budgetMonitoringService.incrementFirestoreReads(2) // Usuario + tarjetas

    }).catch(error => {
        // ✅ ETAPA 6: Registrar error
        crashlyticsService.recordError('public_landing_load_error', error, {
            component: 'PublicTransferView',
            action: 'loadUserData',
            token: route.query.tkn ? 'present' : 'missing'
        }, 'medium')

        performanceService.stopTrace('public_landing_load', {
            load_success: 0,
            error_count: 1
        })
    })

    // Limpiar token al cerrar/recargar la página (opcional)
    window.addEventListener('beforeunload', cleanupOnExit)
})

// Cleanup al desmontar el componente
onUnmounted(() => {
    window.removeEventListener('beforeunload', cleanupOnExit)
})
</script>

<style scoped>
@import '@/styles/public-transfer.css';
</style>

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

.loading-container,
.error-container,
.info-container {
    text-align: center;
    padding: 3rem 2rem;
    animation: fadeIn var(--duration-normal) var(--easing-default);
    max-width: 500px;
    margin: 0 auto;
}

.info-container {
    background: var(--color-surface);
    border-radius: 1rem;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
}

.info-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--color-turquesa);
}

.info-actions {
    margin-top: 2rem;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 600;
    transition: all var(--duration-normal) var(--easing-default);
    border: none;
    cursor: pointer;
}

.btn-primary {
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
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
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
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

/* ✅ NUEVO: Estilos para secciones de publicidad */
.ads-section {
    margin: 1.5rem 0;
    display: flex;
    justify-content: center;
}

.top-ads {
    margin-bottom: 2rem;
}

.bottom-ads {
    margin-top: 2rem;
    margin-bottom: 1rem;
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
