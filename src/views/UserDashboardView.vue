<template>
    <div class="user-dashboard">
        <!-- ✅ NUEVO: Banners Dinámicos Contextuales -->
        <DynamicBanners :user-info="userInfo" :card-count="tarjetas.length" :show-limit-reached="showLimitReachedBanner"
            @complete-onboarding="handleCompleteOnboarding" @upgrade-to-premium="handleUpgradeToPremium"
            @learn-more="handleLearnMore" @explore-premium="handleExplorePremium" @renew-premium="handleRenewPremium" />

        <!-- ✅ NUEVO: Header con UserProfileCard -->
        <div class="dashboard-header">
            <div class="profile-section">
                <UserProfileCard :user-info="userInfo" :user-metrics="userMetrics" :card-count="tarjetas.length"
                    @edit-profile="handleEditProfile" @view-qr="handleViewQR" />
            </div>

            <div class="header-actions">
                <button @click="handleCreateCard" class="btn btn-primary" :disabled="!puedeCrearTarjeta">
                    ➕ Nueva Tarjeta
                </button>
                <button @click="showQRModal = true" class="btn btn-turquesa">
                    📱 Mi QR Público
                </button>
                <button @click="refreshData" class="btn btn-secondary" :disabled="loading">
                    🔄 Actualizar
                </button>
                <button v-if="isAdmin" @click="showConversionTester = true" class="btn btn-info"
                    title="Testing de Conversión - Etapa 5">
                    🧪 Testing
                </button>
                <button @click="showFeedbackModal = true" class="btn btn-secondary" title="Enviar Comentarios">
                    💬 Feedback
                </button>
            </div>
        </div>

        <!-- Notificaciones -->
        <div v-if="notificaciones.length > 0" class="notifications-section">
            <div v-for="notif in notificaciones" :key="notif.id" :class="['notification', notif.type]">
                <div class="notification-icon">{{ notif.icon }}</div>
                <div class="notification-content">
                    <h4>{{ notif.title }}</h4>
                    <p>{{ notif.message }}</p>
                </div>
                <button @click="dismissNotification(notif.id)" class="notification-close">✕</button>
            </div>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="quick-stats">
            <div class="stat-card">
                <div class="stat-icon">💳</div>
                <div class="stat-content">
                    <h3>Tarjetas Activas</h3>
                    <p class="stat-number">{{ tarjetas.length }}</p>
                    <span class="stat-limit">de {{ userInfo.limiteTarjetas || 1 }}</span>
                </div>
            </div>

            <div class="stat-card" v-if="userInfo.esPremium">
                <div class="stat-icon">👁️</div>
                <div class="stat-content">
                    <h3>Visitas a tus Datos</h3>
                    <p class="stat-number">{{ metricsPersonales.visitasPagina }}</p>
                    <span class="stat-label">Total de visitas</span>
                </div>
            </div>

            <div class="stat-card" v-if="userInfo.esPremium">
                <div class="stat-icon">📋</div>
                <div class="stat-content">
                    <h3>Datos Copiados</h3>
                    <p class="stat-number">{{ metricsPersonales.datosCopiadosCount }}</p>
                    <span class="stat-label">Total de copias</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-content">
                    <h3>Miembro desde</h3>
                    <p class="stat-number">{{ formatDate(userInfo.fechaRegistro) }}</p>
                    <span class="stat-label">Fecha de registro</span>
                </div>
            </div>
        </div>

        <!-- Tabs de navegación -->
        <div class="tabs-container">
            <div class="tabs">
                <button @click="activeTab = 'tarjetas'" :class="['tab-btn', { active: activeTab === 'tarjetas' }]">
                    💳 Mis Tarjetas
                </button>
                <button v-if="userInfo.esPremium" @click="activeTab = 'estadisticas'"
                    :class="['tab-btn', { active: activeTab === 'estadisticas' }]">
                    📊 Estadísticas
                </button>
                <button @click="activeTab = 'configuracion'"
                    :class="['tab-btn', { active: activeTab === 'configuracion' }]">
                    ⚙️ Configuración
                </button>
            </div>
        </div>

        <!-- Contenido de tabs -->
        <div class="tab-content">
            <!-- Tab Tarjetas -->
            <div v-if="activeTab === 'tarjetas'" class="tarjetas-section">
                <div v-if="loading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando tarjetas...</p>
                </div>

                <div v-else-if="tarjetas.length === 0" class="empty-state">
                    <div class="empty-icon">💳</div>
                    <h3>No tienes tarjetas aún</h3>
                    <p>Crea tu primera tarjeta bancaria para empezar a recibir transferencias</p>
                    <button @click="handleCreateCard" class="btn btn-primary">
                        Crear Primera Tarjeta
                    </button>
                </div>

                <div v-else class="tarjetas-grid">
                    <div v-for="tarjeta in tarjetas" :key="tarjeta.id" class="tarjeta-card">
                        <div class="tarjeta-header">
                            <h4>{{ tarjeta.nombreTarjeta }}</h4>
                            <div class="tarjeta-actions">
                                <button @click="editarTarjeta(tarjeta)" class="btn-icon edit">✏️</button>
                                <button @click="eliminarTarjeta(tarjeta)" class="btn-icon delete">🗑️</button>
                            </div>
                        </div>
                        <div class="tarjeta-info">
                            <p><strong>Banco:</strong> {{ tarjeta.banco }}</p>
                            <p v-if="tarjeta.bancoTipo" class="banco-tipo">
                                <span :class="['tipo-badge', tarjeta.bancoTipo.toLowerCase()]">
                                    {{ getBancoTypeLabel(tarjeta.bancoTipo) }}
                                </span>
                            </p>
                            <p><strong>Tipo:</strong> {{ tarjeta.tipoCuenta }}</p>
                            <p><strong>Cuenta:</strong> {{ tarjeta.numeroCuenta }}</p>
                            <p><strong>Titular:</strong> {{ tarjeta.nombreTitular }}</p>
                        </div>
                        <div class="tarjeta-stats" v-if="userInfo.esPremium">
                            <span class="stat">👁️ {{ tarjeta.vistas || 0 }} visitas</span>
                            <span class="stat">📱 {{ tarjeta.escaneos || 0 }} escaneos</span>
                        </div>
                        <div class="tarjeta-footer">
                            <span :class="['status-badge', tarjeta.activa ? 'active' : 'inactive']">
                                {{ tarjeta.activa ? 'Activa' : 'Inactiva' }}
                            </span>
                            <div class="tarjeta-actions">
                                <button @click="copiarEnlace" class="btn btn-ghost btn-sm">
                                    🔗 Copiar Enlace
                                </button>
                                <button @click="mostrarQR" class="btn btn-primary btn-sm">
                                    📱 Ver QR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Estadísticas (Solo Premium) -->
            <div v-if="activeTab === 'estadisticas' && userInfo.esPremium" class="estadisticas-section">
                <div class="stats-header">
                    <h3>📊 Estadísticas Detalladas</h3>
                    <div class="period-selector">
                        <select v-model="periodoEstadisticas" @change="cargarEstadisticas" :disabled="loadingStats">
                            <option value="1">Hoy</option>
                            <option value="7">Últimos 7 días</option>
                            <option value="30">Últimos 30 días</option>
                            <option value="90">Últimos 3 meses</option>
                            <option value="365">Último año</option>
                        </select>
                        <div v-if="loadingStats" class="loading-indicator">
                            <div class="spinner-small"></div>
                        </div>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stats-card">
                        <h4>📈 Visitas por Día</h4>
                        <div class="chart-placeholder">
                            <p v-if="estadisticas.visitasPorDia.length === 0">No hay datos de visitas aún</p>
                            <div v-else class="real-chart">
                                <div class="chart-container">
                                    <div v-for="(day, index) in estadisticas.visitasPorDia.slice(-7)" :key="index"
                                        class="chart-bar"
                                        :style="{ height: getBarHeight(day.count, estadisticas.visitasPorDia) + '%' }"
                                        :title="`${day.day}: ${day.count} visitas`">
                                        <span class="bar-value">{{ day.count }}</span>
                                    </div>
                                </div>
                                <div class="chart-labels">
                                    <span v-for="(day, index) in estadisticas.visitasPorDia.slice(-7)" :key="index"
                                        class="day-label">
                                        {{ day.day }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stats-card">
                        <h4>🏦 Bancos Preferidos</h4>
                        <div class="bank-stats">
                            <div v-if="estadisticas.bancosMasUsados.length === 0" class="no-data">
                                <p>No hay datos de bancos utilizados aún</p>
                            </div>
                            <div v-else>
                                <div v-for="(bank, index) in estadisticas.bancosMasUsados.slice(0, 5)" :key="index"
                                    class="bank-item">
                                    <span class="bank-name">{{ bank.bank }}</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill"
                                            :style="{ width: getBankPercentage(bank.count, estadisticas.bancosMasUsados) + '%' }">
                                        </div>
                                    </div>
                                    <span class="bank-count">{{ bank.count }} usos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stats-card">
                        <h4>📱 Dispositivos</h4>
                        <div class="device-stats">
                            <div v-if="estadisticas.dispositivosUsados.length === 0" class="no-data">
                                <p>No hay datos de dispositivos aún</p>
                            </div>
                            <div v-else>
                                <div v-for="(device, index) in estadisticas.dispositivosUsados" :key="index"
                                    class="device-item">
                                    <span class="device-icon">{{ getDeviceIcon(device.device) }}</span>
                                    <span class="device-name">{{ getDeviceName(device.device) }}</span>
                                    <span class="device-percentage">{{ device.percentage }}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stats-card">
                        <h4>🕐 Horarios Populares</h4>
                        <div class="time-stats">
                            <div class="time-item">
                                <span>Mañana (6-12)</span>
                                <span class="time-percentage">25%</span>
                            </div>
                            <div class="time-item">
                                <span>Tarde (12-18)</span>
                                <span class="time-percentage">45%</span>
                            </div>
                            <div class="time-item">
                                <span>Noche (18-24)</span>
                                <span class="time-percentage">30%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Configuración -->
            <div v-if="activeTab === 'configuracion'" class="configuracion-section">
                <div class="config-header">
                    <h3>⚙️ Configuración de Cuenta</h3>
                </div>

                <!-- ✅ NUEVO: Badge Verificado Section -->
                <VerifiedBadgeSection :user-info="userInfo" @upgrade-to-premium="handleUpgradeToPremium"
                    @verification-submitted="handleVerificationSubmitted" />

                <div class="config-grid">
                    <!-- Información Personal -->
                    <div class="config-card">
                        <h4>👤 Información Personal</h4>
                        <div class="config-content">
                            <p><strong>Nombre:</strong> {{ userInfo.nombre }} {{ userInfo.apellido }}</p>
                            <p><strong>Email:</strong> {{ userInfo.email }}</p>
                            <p><strong>RUT:</strong> {{ userInfo.rut || 'No especificado' }}</p>
                            <p><strong>Teléfono:</strong> {{ userInfo.telefono || 'No especificado' }}</p>
                            <p v-if="userInfo.comunaNombre"><strong>Ubicación:</strong> {{ userInfo.comunaNombre }}, {{
                                userInfo.regionNombre }}</p>
                            <p v-if="userInfo.sexo"><strong>Sexo:</strong> {{ userInfo.sexo }}</p>
                            <button @click="openEditProfile" class="btn btn-secondary btn-sm">Editar
                                Información</button>
                        </div>
                    </div>

                    <!-- Plan Actual -->
                    <div class="config-card plan-card">
                        <h4>⭐ Plan Actual</h4>
                        <div class="config-content">
                            <div class="plan-info">
                                <span class="plan-name">{{ userInfo.tipoPlan || 'Gratuito' }}</span>
                                <span v-if="userInfo.esPremium" class="plan-badge premium">Premium</span>
                                <span v-else class="plan-badge free">Gratuito</span>
                            </div>
                            <div v-if="userInfo.esPremium" class="plan-details">
                                <p><strong>Vence:</strong> {{ formatDate(userInfo.fechaVencimientoPremium) }}</p>
                                <p><strong>Días restantes:</strong> {{ diasRestantesPremium }}</p>
                                <button v-if="diasRestantesPremium <= 30" @click="renovarPremium"
                                    class="btn btn-primary btn-sm">
                                    🔄 Renovar Premium
                                </button>
                            </div>
                            <div v-else class="upgrade-section">
                                <p>Actualiza a Premium para obtener más funciones</p>
                                <button @click="upgradeToPremium" class="btn btn-primary btn-sm">
                                    ⭐ Actualizar a Premium
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Notificaciones -->
                    <div class="config-card">
                        <h4>🔔 Notificaciones</h4>
                        <div class="config-content">
                            <div class="notification-setting">
                                <label class="switch">
                                    <input v-model="configuraciones.notificacionesEmail" type="checkbox">
                                    <span class="slider"></span>
                                </label>
                                <span>Notificaciones por email</span>
                            </div>
                            <div class="notification-setting">
                                <label class="switch">
                                    <input v-model="configuraciones.notificacionesVencimiento" type="checkbox">
                                    <span class="slider"></span>
                                </label>
                                <span>Avisos de vencimiento Premium</span>
                            </div>
                            <button @click="guardarConfiguraciones" class="btn btn-secondary btn-sm">
                                Guardar Configuraciones
                            </button>
                        </div>
                    </div>

                    <!-- Seguridad -->
                    <div class="config-card">
                        <h4>🔒 Seguridad</h4>
                        <div class="config-content">
                            <button @click="openChangePassword" class="btn btn-secondary btn-sm">Cambiar
                                Contraseña</button>
                            <button @click="authStore.logout" class="btn btn-ghost btn-sm">Cerrar Sesión</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal crear/editar tarjeta -->
        <div v-if="showCreateCardModal" class="modal-overlay" @click="closeCardModal">
            <div class="modal-content large" @click.stop>
                <div class="modal-header">
                    <h3>{{ editingCard ? '✏️ Editar Tarjeta' : '➕ Nueva Tarjeta Bancaria' }}</h3>
                    <button @click="closeCardModal" class="close-btn">✕</button>
                </div>

                <BankCardForm :edit-mode="!!editingCard" :card-data="editingCard" :user-info="userInfo"
                    :submitting="submitting" @submit="guardarTarjeta" @cancel="closeCardModal" />
            </div>
        </div>

        <!-- Modal QR -->
        <QRModal v-if="showQRModal" :user-info="userInfo" @close="closeQRModal" />

        <!-- Modal Editar Perfil -->
        <div v-if="showEditProfileModal" class="modal-overlay" @click="closeEditProfile">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>✏️ Editar Información Personal</h3>
                    <button @click="closeEditProfile" class="close-btn">✕</button>
                </div>

                <form @submit.prevent="saveProfile" class="edit-profile-form">
                    <div class="form-group">
                        <label for="nombre">Nombre *</label>
                        <input id="nombre" v-model="editForm.nombre" type="text" class="form-input" required
                            placeholder="Ingresa tu nombre">
                    </div>

                    <div class="form-group">
                        <label for="apellido">Apellido *</label>
                        <input id="apellido" v-model="editForm.apellido" type="text" class="form-input" required
                            placeholder="Ingresa tu apellido">
                    </div>

                    <div class="form-group">
                        <label for="telefono">Teléfono</label>
                        <input id="telefono" v-model="editForm.telefono" type="tel" class="form-input"
                            placeholder="+56 9 1234 5678">
                    </div>

                    <!-- Información Geográfica -->
                    <div class="form-group">
                        <label class="form-label">📍 Ubicación Geográfica</label>
                        <GeoSelector v-model="geoData" @change="onGeoDataChange" :required="false" />
                    </div>

                    <div class="modal-actions">
                        <button type="button" @click="closeEditProfile" class="btn btn-ghost">
                            Cancelar
                        </button>
                        <button type="submit" :disabled="submitting" class="btn btn-primary">
                            {{ submitting ? 'Guardando...' : 'Guardar Cambios' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal Cambiar Contraseña -->
        <div v-if="showChangePasswordModal" class="modal-overlay" @click="closeChangePassword">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>🔒 Cambiar Contraseña</h3>
                    <button @click="closeChangePassword" class="close-btn">✕</button>
                </div>

                <form @submit.prevent="changePassword" class="change-password-form">
                    <div class="form-group">
                        <label for="currentPassword">Contraseña Actual *</label>
                        <input id="currentPassword" v-model="passwordForm.currentPassword" type="password"
                            class="form-input" required placeholder="Ingresa tu contraseña actual">
                    </div>

                    <div class="form-group">
                        <label for="newPassword">Nueva Contraseña *</label>
                        <input id="newPassword" v-model="passwordForm.newPassword" type="password" class="form-input"
                            required minlength="6" placeholder="Mínimo 6 caracteres">
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">Confirmar Nueva Contraseña *</label>
                        <input id="confirmPassword" v-model="passwordForm.confirmPassword" type="password"
                            class="form-input" required placeholder="Repite la nueva contraseña">
                    </div>

                    <div class="modal-actions">
                        <button type="button" @click="closeChangePassword" class="btn btn-ghost">
                            Cancelar
                        </button>
                        <button type="submit" :disabled="submitting" class="btn btn-primary">
                            {{ submitting ? 'Cambiando...' : 'Cambiar Contraseña' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- ✅ NUEVO: Modal de Información de Usuario (Onboarding) -->
        <UserInfoModal v-model="showUserInfoModal" @completed="handleOnboardingCompleted"
            @error="handleOnboardingError" />

        <!-- ✅ NUEVO: Modal de Planes Premium -->
        <PremiumPlansModal v-model="showPremiumPlansModal" :user-info="userInfo"
            @contact-whatsapp="handleContactWhatsApp" @contact-support="handleContactSupport"
            @manage-premium="handleManagePremium" />

        <!-- ✅ NUEVO: Modal de Bloqueo de Funciones -->
        <FeatureLockModal v-model="showFeatureLockModal" :feature-type="lockedFeatureType"
            :current-usage="tarjetas.length" :current-limit="userInfo.limiteTarjetas || 1"
            @upgrade-to-premium="handleUpgradeToPremium" @learn-more="handleLearnMore" />

        <!-- ✅ NUEVO: Modal de Testing de Conversión (Solo para Admins) -->
        <ConversionTester v-if="isAdmin" v-model="showConversionTester" />

        <!-- ✅ ETAPA 6: Modal de Feedback de Usuario -->
        <UserFeedbackModal v-model="showFeedbackModal" @feedback-sent="handleFeedbackSent" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { db } from '@/firebase'
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import BankCardForm from '@/components/user/BankCardForm.vue'
import QRModal from '@/components/user/QRModal.vue'
import GeoSelector from '@/components/forms/GeoSelector.vue'
import UserInfoModal from '@/components/auth/UserInfoModal.vue'
import UserProfileCard from '@/components/user/UserProfileCard.vue'
import DynamicBanners from '@/components/user/DynamicBanners.vue'
import VerifiedBadgeSection from '@/components/user/VerifiedBadgeSection.vue'
import PremiumPlansModal from '@/components/premium/PremiumPlansModal.vue'
import FeatureLockModal from '@/components/premium/FeatureLockModal.vue'
import ConversionTester from '@/components/testing/ConversionTester.vue'
import UserFeedbackModal from '@/components/feedback/UserFeedbackModal.vue'
// ✅ ETAPA 6: Servicios de monitoreo
import { performanceService } from '@/services/performanceService'
import { crashlyticsService } from '@/services/crashlyticsService'
import { budgetMonitoringService } from '@/services/budgetMonitoringService'
import { incrementTransferCounter } from '@/store/transferCounter'
import { metricsService } from '@/services/metricsService'
import { analyticsService } from '@/services/analyticsService'

const authStore = useAuthStore()
const loading = ref(true)
const submitting = ref(false)
const activeTab = ref('tarjetas')
const showCreateCardModal = ref(false)
const showQRModal = ref(false)
const showEditProfileModal = ref(false)
const showChangePasswordModal = ref(false)
const showUserInfoModal = ref(false) // ✅ NUEVO: Modal de onboarding
const showLimitReachedBanner = ref(false) // ✅ NUEVO: Banner de límite alcanzado
const showPremiumPlansModal = ref(false) // ✅ NUEVO: Modal de planes Premium
const showFeatureLockModal = ref(false) // ✅ NUEVO: Modal de bloqueo de funciones
const lockedFeatureType = ref('cards') // ✅ NUEVO: Tipo de función bloqueada
const showConversionTester = ref(false) // ✅ NUEVO: Modal de testing de conversión
const showFeedbackModal = ref(false) // ✅ ETAPA 6: Modal de feedback de usuario
const editingCard = ref(null)
const periodoEstadisticas = ref(30)
const loadingStats = ref(false)

// Datos del usuario
const userInfo = ref({
    nombre: '',
    apellido: '',
    email: '',
    tipoPlan: 'gratuito',
    esPremium: false,
    limiteTarjetas: 1,
    fechaVencimientoPremium: null,
    fechaRegistro: null
})

// Tarjetas del usuario
const tarjetas = ref([])

// ✅ NUEVO: Métricas del usuario para UserProfileCard
const userMetrics = ref({
    visitasPagina: 0,
    datosCopiadosCount: 0,
    ultimaVisita: null
})

// Estadísticas
const estadisticas = ref({
    visitasTotales: 0,
    escaneosQR: 0,
    visitasPorDia: [],
    bancosMasUsados: [],
    dispositivosUsados: []
})

// Métricas personales del usuario
const metricsPersonales = ref({
    visitasPagina: 0,
    datosCopiadosCount: 0,
    primeraVisita: null,
    ultimaVisita: null,
    primerCopy: null,
    ultimoCopy: null
})

// Notificaciones
const notificaciones = ref([])

// Configuraciones
const configuraciones = ref({
    notificacionesEmail: true,
    notificacionesVencimiento: true
})

// Formulario de edición de perfil
const editForm = ref({
    nombre: '',
    apellido: '',
    telefono: ''
})

// Datos geográficos para edición
const geoData = ref({
    country: '',
    region: '',
    province: '',
    commune: '',
    gender: ''
})

// Formulario de cambio de contraseña
const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// Computed
const isAdmin = computed(() => {
    return userInfo.value?.rol === 'admin' || userInfo.value?.role === 'admin'
})

const diasRestantesPremium = computed(() => {
    if (!userInfo.value.esPremium || !userInfo.value.fechaVencimientoPremium) return 0

    const fechaVencimiento = userInfo.value.fechaVencimientoPremium.toDate ?
        userInfo.value.fechaVencimientoPremium.toDate() :
        new Date(userInfo.value.fechaVencimientoPremium)

    const hoy = new Date()
    const diferencia = fechaVencimiento - hoy
    return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)))
})

const puedeCrearTarjeta = computed(() => {
    return tarjetas.value.length < (userInfo.value.limiteTarjetas || 1)
})

// Funciones
const loadUserData = async () => {
    try {
        loading.value = true

        // Cargar datos del usuario
        const userDoc = await getDoc(doc(db, 'users', authStore.user.uid))
        if (userDoc.exists()) {
            userInfo.value = { ...userDoc.data() }

            // ✅ NUEVO: Verificar si necesita completar onboarding
            if (!userInfo.value.onboardingCompleted) {
                console.log('📝 Usuario necesita completar onboarding')
                showUserInfoModal.value = true
                return // No cargar más datos hasta completar onboarding
            }
        }

        // Cargar tarjetas del usuario
        await loadTarjetas()

        // Cargar estadísticas si es premium
        if (userInfo.value.esPremium) {
            await cargarEstadisticas()
        }

        // Generar notificaciones
        generarNotificaciones()

    } catch (error) {
        console.error('Error cargando datos del usuario:', error)
    } finally {
        loading.value = false
    }
}

const loadTarjetas = async () => {
    try {
        const q = query(
            collection(db, 'bank_cards'),
            where('propietarioEmail', '==', authStore.user.email)
        )

        const querySnapshot = await getDocs(q)
        tarjetas.value = []

        querySnapshot.forEach((doc) => {
            tarjetas.value.push({
                id: doc.id,
                ...doc.data()
            })
        })

        console.log('Tarjetas cargadas:', tarjetas.value.length)

    } catch (error) {
        console.error('Error cargando tarjetas:', error)
    }
}

const cargarEstadisticas = async () => {
    try {
        loadingStats.value = true

        // Cargar métricas personales del usuario
        const userMetrics = await metricsService.getUserMetrics(authStore.user.uid)
        metricsPersonales.value = userMetrics

        // Cargar estadísticas detalladas con analytics
        const detailedStats = await analyticsService.getUserCompleteStats(
            authStore.user.uid,
            periodoEstadisticas.value
        )

        // Actualizar estadísticas con datos reales
        estadisticas.value = {
            visitasTotales: userMetrics.visitasPagina || 0,
            escaneosQR: userMetrics.datosCopiadosCount || 0,
            visitasPorDia: detailedStats.visitsByDay || [],
            bancosMasUsados: detailedStats.topBanks || [],
            dispositivosUsados: detailedStats.topDevices || []
        }

        console.log('📊 Estadísticas detalladas cargadas:', {
            userMetrics,
            detailedStats,
            estadisticas: estadisticas.value,
            periodo: periodoEstadisticas.value
        })
    } catch (error) {
        console.error('Error cargando estadísticas:', error)
        // Mantener valores por defecto en caso de error
        estadisticas.value = {
            visitasTotales: 0,
            escaneosQR: 0,
            visitasPorDia: [],
            bancosMasUsados: [],
            dispositivosUsados: []
        }
    } finally {
        loadingStats.value = false
    }
}

const generarNotificaciones = () => {
    notificaciones.value = []

    // Notificación de vencimiento Premium
    if (userInfo.value.esPremium && diasRestantesPremium.value <= 30 && diasRestantesPremium.value > 0) {
        notificaciones.value.push({
            id: 'premium-expiry',
            type: 'warning',
            icon: '⚠️',
            title: 'Plan Premium por vencer',
            message: `Tu plan Premium vence en ${diasRestantesPremium.value} días. ¡Renuévalo para seguir disfrutando de todas las funciones!`
        })
    }

    // Notificación de Premium vencido
    if (userInfo.value.esPremium && diasRestantesPremium.value <= 0) {
        notificaciones.value.push({
            id: 'premium-expired',
            type: 'error',
            icon: '❌',
            title: 'Plan Premium vencido',
            message: 'Tu plan Premium ha vencido. Renuévalo para recuperar el acceso a las funciones avanzadas.'
        })
    }

    // Notificación de límite de tarjetas
    if (!puedeCrearTarjeta.value && !userInfo.value.esPremium) {
        notificaciones.value.push({
            id: 'card-limit',
            type: 'info',
            icon: 'ℹ️',
            title: 'Límite de tarjetas alcanzado',
            message: 'Has alcanzado el límite de tarjetas para tu plan gratuito. Actualiza a Premium para crear hasta 5 tarjetas.'
        })
    }
}

const refreshData = async () => {
    await loadUserData()
}

const formatDate = (date) => {
    if (!date) return 'No disponible'

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

const getBancoTypeLabel = (type) => {
    const labels = {
        'BANK': 'Banco',
        'WALLET': 'Wallet',
        'PREPAID_CARD': 'Prepagada'
    }
    return labels[type] || 'Banco'
}

// Funciones auxiliares para gráficos de estadísticas
const getBarHeight = (count, allData) => {
    if (!allData || allData.length === 0) return 0
    const maxCount = Math.max(...allData.map(d => d.count))
    if (maxCount === 0) return 0
    return Math.max((count / maxCount) * 100, 5) // Mínimo 5% para visibilidad
}

const getBankPercentage = (count, allBanks) => {
    if (!allBanks || allBanks.length === 0) return 0
    const totalCount = allBanks.reduce((sum, bank) => sum + bank.count, 0)
    if (totalCount === 0) return 0
    return Math.round((count / totalCount) * 100)
}

const getDeviceIcon = (device) => {
    const icons = {
        'mobile': '📱',
        'desktop': '💻',
        'tablet': '📟'
    }
    return icons[device.toLowerCase()] || '🖥️'
}

const getDeviceName = (device) => {
    const names = {
        'mobile': 'Móvil',
        'desktop': 'Escritorio',
        'tablet': 'Tablet'
    }
    return names[device.toLowerCase()] || device
}

const dismissNotification = (id) => {
    notificaciones.value = notificaciones.value.filter(n => n.id !== id)
}

const closeCardModal = () => {
    showCreateCardModal.value = false
    editingCard.value = null
}

const editarTarjeta = (tarjeta) => {
    editingCard.value = tarjeta
    showCreateCardModal.value = true
}

const closeQRModal = () => {
    showQRModal.value = false
}

const eliminarTarjeta = async (tarjeta) => {
    if (confirm('¿Estás seguro de eliminar esta tarjeta? Esta acción no se puede deshacer.')) {
        try {
            await deleteDoc(doc(db, 'bank_cards', tarjeta.id))
            console.log('Tarjeta eliminada:', tarjeta.id)
            alert('Tarjeta eliminada exitosamente')
            await loadTarjetas()
        } catch (error) {
            console.error('Error eliminando tarjeta:', error)
            alert('Error al eliminar la tarjeta: ' + error.message)
        }
    }
}

const copiarEnlace = () => {
    // Usar la nueva URL SEO-friendly
    const enlace = `${window.location.origin}/datostransferencia/${userInfo.value.tokenPublico}`
    navigator.clipboard.writeText(enlace)
    alert('Enlace público copiado al portapapeles')
    // Incrementar contador global de transferencias
    incrementTransferCounter()
}

const mostrarQR = () => {
    showQRModal.value = true
}

const guardarTarjeta = async (formData) => {
    try {
        submitting.value = true
        console.log('Guardando tarjeta:', formData)

        // Verificar límite de tarjetas
        if (!editingCard.value && !puedeCrearTarjeta.value) {
            alert('Has alcanzado el límite de tarjetas para tu plan')
            return
        }

        const cardData = {
            ...formData,
            propietarioEmail: authStore.user.email,
            propietarioUID: authStore.user.uid,
            fechaCreacion: editingCard.value?.fechaCreacion || serverTimestamp(),
            fechaActualizacion: serverTimestamp(),
            vistas: editingCard.value?.vistas || 0,
            escaneos: editingCard.value?.escaneos || 0,
            ultimaVisita: editingCard.value?.ultimaVisita || null
        }

        if (editingCard.value) {
            // Actualizar tarjeta existente
            await updateDoc(doc(db, 'bank_cards', editingCard.value.id), cardData)
            console.log('Tarjeta actualizada')
            alert('Tarjeta actualizada exitosamente')
        } else {
            // Crear nueva tarjeta
            const docRef = await addDoc(collection(db, 'bank_cards'), cardData)
            console.log('Nueva tarjeta creada con ID:', docRef.id)
            alert('Tarjeta creada exitosamente')
        }

        closeCardModal()
        await loadTarjetas()

    } catch (error) {
        console.error('Error guardando tarjeta:', error)
        alert('Error al guardar la tarjeta: ' + error.message)
    } finally {
        submitting.value = false
    }
}

const renovarPremium = async () => {
    try {
        const nuevaFechaVencimiento = new Date()
        nuevaFechaVencimiento.setFullYear(nuevaFechaVencimiento.getFullYear() + 1)

        await updateDoc(doc(db, 'users', authStore.user.uid), {
            fechaVencimientoPremium: nuevaFechaVencimiento,
            fechaRenovacion: serverTimestamp()
        })

        alert('¡Plan Premium renovado exitosamente por 1 año más!')
        await loadUserData()

    } catch (error) {
        console.error('Error renovando Premium:', error)
        alert('Error al renovar el plan Premium: ' + error.message)
    }
}

const upgradeToPremium = async () => {
    try {
        const fechaVencimiento = new Date()
        fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1)

        await updateDoc(doc(db, 'users', authStore.user.uid), {
            tipoPlan: 'premium',
            esPremium: true,
            fechaVencimientoPremium: fechaVencimiento,
            limiteTarjetas: 5,
            accesoEstadisticas: true,
            personalizacionAvanzada: true,
            fechaUpgrade: serverTimestamp()
        })

        alert('¡Bienvenido a Premium! Ya puedes disfrutar de todas las funciones avanzadas.')
        await loadUserData()

    } catch (error) {
        console.error('Error actualizando a Premium:', error)
        alert('Error al actualizar a Premium: ' + error.message)
    }
}

const guardarConfiguraciones = async () => {
    try {
        await updateDoc(doc(db, 'users', authStore.user.uid), {
            configuraciones: configuraciones.value
        })
        alert('Configuraciones guardadas')
    } catch (error) {
        console.error('Error guardando configuraciones:', error)
    }
}

// Funciones auxiliares para obtener nombres geográficos
const getRegionName = (regionCode) => {
    const regions = {
        '1': 'Tarapacá',
        '2': 'Antofagasta',
        '3': 'Atacama',
        '4': 'Coquimbo',
        '5': 'Valparaíso',
        '6': 'Libertador General Bernardo O\'Higgins',
        '7': 'Maule',
        '8': 'Biobío',
        '9': 'La Araucanía',
        '10': 'Los Lagos',
        '11': 'Aysén del General Carlos Ibáñez del Campo',
        '12': 'Magallanes y de la Antártica Chilena',
        '13': 'Metropolitana de Santiago',
        '14': 'Los Ríos',
        '15': 'Arica y Parinacota',
        '16': 'Ñuble'
    }
    return regions[regionCode] || ''
}

const getProvinceName = (provinceCode) => {
    const provinces = {
        '131': 'Santiago', '132': 'Cordillera', '133': 'Chacabuco', '134': 'Maipo', '135': 'Melipilla', '136': 'Talagante',
        '51': 'Valparaíso', '52': 'Isla de Pascua', '53': 'Los Andes', '54': 'Petorca', '55': 'Quillota', '56': 'San Antonio', '57': 'San Felipe de Aconcagua', '58': 'Marga Marga',
        '81': 'Concepción', '82': 'Arauco', '83': 'Biobío',
        '91': 'Cautín', '92': 'Malleco',
        '41': 'Elqui', '42': 'Choapa', '43': 'Limarí',
        '21': 'Antofagasta', '22': 'El Loa', '23': 'Tocopilla',
        '101': 'Llanquihue', '102': 'Chiloé', '103': 'Osorno', '104': 'Palena',
        '11': 'Iquique', '14': 'Tamarugal',
        '151': 'Arica', '152': 'Parinacota'
    }
    return provinces[provinceCode] || ''
}

const getCommuneName = (communeCode) => {
    const communes = {
        // Santiago
        '13101': 'Santiago', '13102': 'Cerrillos', '13103': 'Cerro Navia', '13104': 'Conchalí', '13105': 'El Bosque',
        '13106': 'Estación Central', '13107': 'Huechuraba', '13108': 'Independencia', '13109': 'La Cisterna', '13110': 'La Florida',
        '13111': 'La Granja', '13112': 'La Pintana', '13113': 'La Reina', '13114': 'Las Condes', '13115': 'Lo Barnechea',
        '13116': 'Lo Espejo', '13117': 'Lo Prado', '13118': 'Macul', '13119': 'Maipú', '13120': 'Ñuñoa',
        '13121': 'Pedro Aguirre Cerda', '13122': 'Peñalolén', '13123': 'Providencia', '13124': 'Pudahuel', '13125': 'Quilicura',
        '13126': 'Quinta Normal', '13127': 'Recoleta', '13128': 'Renca', '13129': 'San Joaquín', '13130': 'San Miguel',
        '13131': 'San Ramón', '13132': 'Vitacura',
        // Valparaíso
        '5101': 'Valparaíso', '5102': 'Casablanca', '5103': 'Concón', '5104': 'Juan Fernández', '5105': 'Puchuncaví', '5106': 'Quintero', '5107': 'Viña del Mar',
        // Concepción
        '8101': 'Concepción', '8102': 'Coronel', '8103': 'Chiguayante', '8104': 'Florida', '8105': 'Hualqui', '8106': 'Lota',
        '8107': 'Penco', '8108': 'San Pedro de la Paz', '8109': 'Santa Juana', '8110': 'Talcahuano', '8111': 'Tomé', '8112': 'Hualpén',
        // Cautín
        '9101': 'Temuco', '9102': 'Carahue', '9103': 'Cunco', '9104': 'Curarrehue', '9105': 'Freire', '9106': 'Galvarino',
        '9107': 'Gorbea', '9108': 'Lautaro', '9109': 'Loncoche', '9110': 'Melipeuco', '9111': 'Nueva Imperial', '9112': 'Padre las Casas',
        '9113': 'Perquenco', '9114': 'Pitrufquén', '9115': 'Pucón', '9116': 'Saavedra', '9117': 'Teodoro Schmidt', '9118': 'Toltén',
        '9119': 'Vilcún', '9120': 'Villarrica',
        // Elqui
        '4101': 'La Serena', '4102': 'Coquimbo', '4103': 'Andacollo', '4104': 'La Higuera', '4105': 'Paiguano', '4106': 'Vicuña',
        // Antofagasta
        '2101': 'Antofagasta', '2102': 'Mejillones', '2103': 'Sierra Gorda', '2104': 'Taltal',
        // Otras
        '10101': 'Puerto Montt', '10301': 'Osorno', '1101': 'Iquique', '15101': 'Arica'
    }
    return communes[communeCode] || ''
}

// Funciones para editar perfil
const openEditProfile = () => {
    // Cargar datos actuales en el formulario
    editForm.value = {
        nombre: userInfo.value.nombre || '',
        apellido: userInfo.value.apellido || '',
        telefono: userInfo.value.telefono || ''
    }

    // Cargar datos geográficos actuales
    geoData.value = {
        country: userInfo.value.pais || 'CL',
        region: userInfo.value.region || '',
        province: userInfo.value.provincia || '',
        commune: userInfo.value.comuna || '',
        gender: userInfo.value.sexo || ''
    }

    showEditProfileModal.value = true
}

// Función para manejar cambios en el GeoSelector
const onGeoDataChange = (newGeoData) => {
    geoData.value = { ...newGeoData }
}

const closeEditProfile = () => {
    showEditProfileModal.value = false
    editForm.value = {
        nombre: '',
        apellido: '',
        telefono: ''
    }
    geoData.value = {
        country: '',
        region: '',
        province: '',
        commune: '',
        gender: ''
    }
}

const saveProfile = async () => {
    try {
        submitting.value = true

        // Preparar datos para actualizar
        const updateData = {
            nombre: editForm.value.nombre,
            apellido: editForm.value.apellido,
            telefono: editForm.value.telefono,
            fechaActualizacion: serverTimestamp()
        }

        // Agregar datos geográficos si están completos
        if (geoData.value.country) {
            updateData.pais = geoData.value.country
        }
        if (geoData.value.region) {
            updateData.region = geoData.value.region
            // Buscar nombre de la región
            const regionName = getRegionName(geoData.value.region)
            if (regionName) updateData.regionNombre = regionName
        }
        if (geoData.value.province) {
            updateData.provincia = geoData.value.province
            // Buscar nombre de la provincia
            const provinceName = getProvinceName(geoData.value.province)
            if (provinceName) updateData.provinciaNombre = provinceName
        }
        if (geoData.value.commune) {
            updateData.comuna = geoData.value.commune
            // Buscar nombre de la comuna
            const communeName = getCommuneName(geoData.value.commune)
            if (communeName) updateData.comunaNombre = communeName
        }
        if (geoData.value.gender) {
            updateData.sexo = geoData.value.gender
        }

        await updateDoc(doc(db, 'users', authStore.user.uid), updateData)

        alert('Información actualizada exitosamente')
        closeEditProfile()
        await loadUserData()

    } catch (error) {
        console.error('Error actualizando perfil:', error)
        alert('Error al actualizar la información: ' + error.message)
    } finally {
        submitting.value = false
    }
}

// Funciones para cambiar contraseña
const openChangePassword = () => {
    passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    }
    showChangePasswordModal.value = true
}

const closeChangePassword = () => {
    showChangePasswordModal.value = false
    passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    }
}

const changePassword = async () => {
    try {
        if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
            alert('Las contraseñas no coinciden')
            return
        }

        if (passwordForm.value.newPassword.length < 6) {
            alert('La nueva contraseña debe tener al menos 6 caracteres')
            return
        }

        submitting.value = true

        // Aquí implementarías la lógica de cambio de contraseña con Firebase Auth
        // Por ahora solo mostramos un mensaje
        alert('Funcionalidad de cambio de contraseña en desarrollo')
        closeChangePassword()

    } catch (error) {
        console.error('Error cambiando contraseña:', error)
        alert('Error al cambiar la contraseña: ' + error.message)
    } finally {
        submitting.value = false
    }
}

// ✅ NUEVO: Funciones para manejar onboarding
const handleOnboardingCompleted = async (userData) => {
    try {
        console.log('✅ Onboarding completado:', userData)

        // Aquí se llamaría a la Cloud Function para completar el onboarding
        // Por ahora, cerramos el modal y recargamos datos
        showUserInfoModal.value = false

        // Recargar datos del usuario
        await loadUserData()

        // Mostrar notificación de éxito
        notificaciones.value.push({
            id: Date.now(),
            type: 'success',
            icon: '🎉',
            title: '¡Bienvenido a De Una!',
            message: 'Tu información ha sido guardada correctamente. Ya puedes empezar a usar todas las funciones.'
        })

    } catch (error) {
        console.error('❌ Error completando onboarding:', error)
        handleOnboardingError(error)
    }
}

const handleOnboardingError = (error) => {
    console.error('❌ Error en onboarding:', error)

    notificaciones.value.push({
        id: Date.now(),
        type: 'error',
        icon: '❌',
        title: 'Error al guardar información',
        message: 'Hubo un problema al guardar tu información. Por favor, inténtalo de nuevo.'
    })
}

// ✅ NUEVO: Funciones para manejar eventos de banners y perfil
const handleCompleteOnboarding = () => {
    showUserInfoModal.value = true
}

const handleUpgradeToPremium = () => {
    // Mostrar modal de planes Premium
    console.log('🚀 Mostrando planes Premium...')
    showPremiumPlansModal.value = true
}

const handleVerificationSubmitted = async (verificationData) => {
    try {
        console.log('📤 Procesando verificación de badge:', verificationData)

        // TODO: Implementar subida de archivos a CDN y crear solicitud de verificación
        // Por ahora solo actualizamos el estado local

        // Actualizar estado en Firestore
        await updateDoc(doc(db, 'users', authStore.user.uid), {
            verificationBadgeStatus: 'pending',
            verificationBadgeSubmittedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })

        // Actualizar estado local
        userInfo.value.verificationBadgeStatus = 'pending'

        console.log('✅ Verificación de badge enviada exitosamente')

    } catch (error) {
        console.error('❌ Error procesando verificación de badge:', error)
        alert('❌ Error enviando verificación. Inténtalo nuevamente.')
    }
}

const handleLearnMore = () => {
    // Mostrar modal de planes Premium
    console.log('📖 Mostrando información de planes...')
    showPremiumPlansModal.value = true
}

const handleExplorePremium = () => {
    // Mostrar funciones Premium disponibles
    console.log('🔍 Explorando funciones Premium...')
    // TODO: Implementar tour de funciones
}

const handleRenewPremium = () => {
    // Proceso de renovación Premium
    console.log('🔄 Iniciando renovación Premium...')
    // TODO: Implementar proceso de renovación
}

const handleEditProfile = () => {
    showEditProfileModal.value = true
}

const handleViewQR = () => {
    showQRModal.value = true
}

// ✅ NUEVO: Funciones para manejar eventos de Premium
const handleContactWhatsApp = () => {
    console.log('📱 Contacto por WhatsApp iniciado')
    // Analytics: registrar conversión de WhatsApp
}

const handleContactSupport = () => {
    console.log('📧 Contacto por soporte iniciado')
    // Redirigir a página de soporte o abrir modal de contacto
}

const handleManagePremium = () => {
    console.log('⚙️ Gestión de Premium')
    // Mostrar opciones de gestión Premium
}

// ✅ NUEVO: Función para verificar límites y mostrar bloqueo
const checkFeatureLimit = (featureType) => {
    const isPremium = userInfo.value.isPremium || userInfo.value.esPremium

    if (featureType === 'cards' && !isPremium) {
        const currentCards = tarjetas.value.length
        const limit = userInfo.value.limiteTarjetas || 1

        if (currentCards >= limit) {
            lockedFeatureType.value = 'cards'
            showFeatureLockModal.value = true
            showLimitReachedBanner.value = true
            return false // Bloquear acción
        }
    }

    return true // Permitir acción
}

// ✅ NUEVO: Función para manejar creación de tarjetas con bloqueo
const handleCreateCard = () => {
    if (checkFeatureLimit('cards')) {
        editingCard.value = null
        showCreateCardModal.value = true
    }
}

// ✅ ETAPA 6: Función para manejar feedback de usuario
const handleFeedbackSent = (result) => {
    notificaciones.value.push({
        id: Date.now(),
        type: result.type,
        icon: result.type === 'success' ? '✅' : '❌',
        title: result.type === 'success' ? 'Feedback Enviado' : 'Error al Enviar',
        message: result.message
    })

    // Auto-remover notificación después de 5 segundos
    setTimeout(() => {
        const index = notificaciones.value.findIndex(n => n.id === Date.now())
        if (index > -1) {
            notificaciones.value.splice(index, 1)
        }
    }, 5000)
}

onMounted(() => {
    // ✅ ETAPA 6: Iniciar monitoreo de performance
    const dashboardTrace = performanceService.startUserDashboardTrace()

    // Configurar usuario para crashlytics
    if (authStore.user) {
        crashlyticsService.setUser(authStore.user.uid, authStore.user.email, {
            role: userInfo.value?.rol || 'usuario',
            plan: userInfo.value?.isPremium ? 'premium' : 'free'
        })
    }

    loadUserData().then(() => {
        // ✅ ETAPA 6: Finalizar traza de performance
        performanceService.stopTrace('user_dashboard_load', {
            cards_count: tarjetas.value.length,
            load_success: 1
        })

        // Incrementar contador de lecturas de Firestore
        budgetMonitoringService.incrementFirestoreReads(3) // Usuario + tarjetas + métricas

    }).catch(error => {
        // ✅ ETAPA 6: Registrar error
        crashlyticsService.recordError('dashboard_load_error', error, {
            component: 'UserDashboardView',
            action: 'loadUserData'
        }, 'high')

        performanceService.stopTrace('user_dashboard_load', {
            load_success: 0,
            error_count: 1
        })
    })
})
</script>

<style scoped>
@import '@/styles/user-dashboard.css';
</style>
