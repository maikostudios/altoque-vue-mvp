<template>
    <div class="user-dashboard">
        <!-- Header del usuario -->
        <div class="dashboard-header">
            <div class="user-welcome">
                <div class="user-avatar">
                    <div class="avatar-placeholder">
                        {{ userInfo.nombre?.charAt(0) || '?' }}{{ userInfo.apellido?.charAt(0) || '' }}
                    </div>
                </div>
                <div class="welcome-content">
                    <h1>¡Hola, {{ userInfo.nombre }}!</h1>
                    <p class="user-plan">
                        Plan {{ userInfo.tipoPlan || 'Gratuito' }}
                        <span v-if="userInfo.esPremium" class="premium-badge">⭐ Premium</span>
                    </p>
                    <p v-if="userInfo.esPremium && diasRestantesPremium > 0" class="premium-expiry">
                        {{ diasRestantesPremium }} días restantes
                    </p>
                    <p v-else-if="userInfo.esPremium && diasRestantesPremium <= 0" class="premium-expired">
                        ⚠️ Plan Premium vencido
                    </p>
                </div>
            </div>
            <div class="header-actions">
                <button @click="showCreateCardModal = true" class="btn btn-primary" :disabled="!puedeCrearTarjeta">
                    ➕ Nueva Tarjeta
                </button>
                <button @click="showQRModal = true" class="btn btn-turquesa">
                    📱 Mi QR Público
                </button>
                <button @click="refreshData" class="btn btn-secondary" :disabled="loading">
                    🔄 Actualizar
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
                    <h3>Visitas Totales</h3>
                    <p class="stat-number">{{ estadisticas.visitasTotales }}</p>
                    <span class="stat-label">Este mes</span>
                </div>
            </div>

            <div class="stat-card" v-if="userInfo.esPremium">
                <div class="stat-icon">📱</div>
                <div class="stat-content">
                    <h3>Escaneos QR</h3>
                    <p class="stat-number">{{ estadisticas.escaneosQR }}</p>
                    <span class="stat-label">Este mes</span>
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
                    <button @click="showCreateCardModal = true" class="btn btn-primary">
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
                            <button @click="copiarEnlace" class="btn btn-ghost btn-sm">
                                🔗 Copiar Enlace Público
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Estadísticas (Solo Premium) -->
            <div v-if="activeTab === 'estadisticas' && userInfo.esPremium" class="estadisticas-section">
                <div class="stats-header">
                    <h3>📊 Estadísticas Detalladas</h3>
                    <div class="period-selector">
                        <select v-model="periodoEstadisticas" @change="cargarEstadisticas">
                            <option value="7">Últimos 7 días</option>
                            <option value="30">Últimos 30 días</option>
                            <option value="90">Últimos 90 días</option>
                        </select>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stats-card">
                        <h4>📈 Visitas por Día</h4>
                        <div class="chart-placeholder">
                            <p>Gráfico de visitas diarias</p>
                            <div class="mock-chart">
                                <div class="chart-bar" style="height: 60%"></div>
                                <div class="chart-bar" style="height: 80%"></div>
                                <div class="chart-bar" style="height: 40%"></div>
                                <div class="chart-bar" style="height: 90%"></div>
                                <div class="chart-bar" style="height: 70%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="stats-card">
                        <h4>🏦 Bancos Preferidos</h4>
                        <div class="bank-stats">
                            <div class="bank-item">
                                <span>Banco de Chile</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 45%"></div>
                                </div>
                                <span>45%</span>
                            </div>
                            <div class="bank-item">
                                <span>Banco Santander</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 30%"></div>
                                </div>
                                <span>30%</span>
                            </div>
                            <div class="bank-item">
                                <span>Banco Estado</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 25%"></div>
                                </div>
                                <span>25%</span>
                            </div>
                        </div>
                    </div>

                    <div class="stats-card">
                        <h4>📱 Dispositivos</h4>
                        <div class="device-stats">
                            <div class="device-item">
                                <span class="device-icon">📱</span>
                                <span>Móvil</span>
                                <span class="device-percentage">75%</span>
                            </div>
                            <div class="device-item">
                                <span class="device-icon">💻</span>
                                <span>Desktop</span>
                                <span class="device-percentage">20%</span>
                            </div>
                            <div class="device-item">
                                <span class="device-icon">📟</span>
                                <span>Tablet</span>
                                <span class="device-percentage">5%</span>
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

                <div class="config-grid">
                    <!-- Información Personal -->
                    <div class="config-card">
                        <h4>👤 Información Personal</h4>
                        <div class="config-content">
                            <p><strong>Nombre:</strong> {{ userInfo.nombre }} {{ userInfo.apellido }}</p>
                            <p><strong>Email:</strong> {{ userInfo.email }}</p>
                            <p><strong>RUT:</strong> {{ userInfo.rut }}</p>
                            <p><strong>Teléfono:</strong> {{ userInfo.telefono }}</p>
                            <button class="btn btn-secondary btn-sm">Editar Información</button>
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
                            <button class="btn btn-secondary btn-sm">Cambiar Contraseña</button>
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
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { db } from '@/firebase'
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import BankCardForm from '@/components/user/BankCardForm.vue'
import QRModal from '@/components/user/QRModal.vue'

const authStore = useAuthStore()
const loading = ref(true)
const submitting = ref(false)
const activeTab = ref('tarjetas')
const showCreateCardModal = ref(false)
const showQRModal = ref(false)
const editingCard = ref(null)
const periodoEstadisticas = ref(30)

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

// Estadísticas
const estadisticas = ref({
    visitasTotales: 0,
    escaneosQR: 0,
    visitasPorDia: [],
    bancosMasUsados: [],
    dispositivosUsados: []
})

// Notificaciones
const notificaciones = ref([])

// Configuraciones
const configuraciones = ref({
    notificacionesEmail: true,
    notificacionesVencimiento: true
})

// Computed
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
    // Simular carga de estadísticas
    estadisticas.value = {
        visitasTotales: Math.floor(Math.random() * 1000),
        escaneosQR: Math.floor(Math.random() * 500),
        visitasPorDia: [],
        bancosMasUsados: [],
        dispositivosUsados: []
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
    const enlace = `${window.location.origin}/linktransferencia?tkn=${userInfo.value.tokenPublico}`
    navigator.clipboard.writeText(enlace)
    alert('Enlace público copiado al portapapeles')
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

onMounted(() => {
    loadUserData()
})
</script>

<style scoped>
@import '@/styles/user-dashboard.css';
</style>
