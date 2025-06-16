<template>
    <div class="modal-overlay" @click="$emit('close')">
        <div class="modal-content extra-large" @click.stop>
            <div class="modal-header">
                <div class="user-header-info">
                    <div class="user-avatar">
                        <div class="avatar-placeholder">
                            {{ user.nombre?.charAt(0) || '?' }}{{ user.apellido?.charAt(0) || '' }}
                        </div>
                    </div>
                    <div class="user-title">
                        <h3>{{ user.nombre }} {{ user.apellido }}</h3>
                        <span :class="['plan-badge', user.esPremium ? 'premium' : 'gratuito']">
                            {{ user.esPremium ? '⭐ Premium' : '🆓 Gratuito' }}
                        </span>
                    </div>
                </div>
                <button @click="$emit('close')" class="close-btn">✕</button>
            </div>

            <div class="modal-body">
                <!-- Tabs de navegación -->
                <div class="tabs">
                    <button @click="activeTab = 'personal'" :class="['tab-btn', { active: activeTab === 'personal' }]">
                        👤 Datos Personales
                    </button>
                    <button @click="activeTab = 'plan'" :class="['tab-btn', { active: activeTab === 'plan' }]">
                        ⭐ Plan y Suscripción
                    </button>
                    <button @click="activeTab = 'tarjetas'" :class="['tab-btn', { active: activeTab === 'tarjetas' }]">
                        💳 Tarjetas ({{ user.tarjetas?.length || 0 }})
                    </button>
                    <button @click="activeTab = 'sistema'" :class="['tab-btn', { active: activeTab === 'sistema' }]">
                        🔧 Sistema
                    </button>
                </div>

                <!-- Contenido de tabs -->
                <div class="tab-content">
                    <!-- Tab Datos Personales -->
                    <div v-if="activeTab === 'personal'" class="personal-tab">
                        <h4>👤 Información Personal</h4>
                        <div class="editable-fields">
                            <div class="field-group">
                                <label>Nombre:</label>
                                <EditableField :value="user.nombre" field="nombre" @update="updateField" />
                            </div>

                            <div class="field-group">
                                <label>Apellido:</label>
                                <EditableField :value="user.apellido" field="apellido" @update="updateField" />
                            </div>

                            <div class="field-group">
                                <label>Email:</label>
                                <EditableField :value="user.email" field="email" type="email" @update="updateField" />
                            </div>

                            <div class="field-group">
                                <label>RUT:</label>
                                <EditableField :value="user.rut" field="rut" @update="updateField" />
                            </div>

                            <div class="field-group">
                                <label>Teléfono:</label>
                                <EditableField :value="user.telefono" field="telefono" type="tel"
                                    @update="updateField" />
                            </div>

                            <div class="field-group">
                                <label>Fecha de Nacimiento:</label>
                                <EditableField :value="formatDateForInput(user.fechaNacimiento)" field="fechaNacimiento"
                                    type="date" @update="updateField" />
                            </div>

                            <div class="field-group">
                                <label>Comuna:</label>
                                <EditableField :value="user.comuna" field="comuna" @update="updateField" />
                            </div>

                            <div class="field-group">
                                <label>Región:</label>
                                <EditableField :value="user.region" field="region" @update="updateField" />
                            </div>

                            <div class="field-group">
                                <label>Empresa:</label>
                                <EditableField :value="user.empresa" field="empresa" @update="updateField" />
                            </div>
                        </div>
                    </div>

                    <!-- Tab Plan y Suscripción -->
                    <div v-if="activeTab === 'plan'" class="plan-tab">
                        <h4>⭐ Plan y Suscripción</h4>

                        <div class="plan-section">
                            <div class="current-plan">
                                <div class="plan-info">
                                    <span :class="['plan-badge-large', user.esPremium ? 'premium' : 'gratuito']">
                                        {{ user.esPremium ? '⭐ Premium' : '🆓 Gratuito' }}
                                    </span>
                                    <div class="plan-details">
                                        <p><strong>Tipo de Plan:</strong> {{ user.tipoPlan || 'gratuito' }}</p>
                                        <p><strong>Límite de Tarjetas:</strong> {{ user.limiteTarjetas || 1 }}</p>
                                        <p><strong>Acceso a Estadísticas:</strong> {{ user.accesoEstadisticas ? 'Sí' :
                                            'No' }}</p>
                                        <p><strong>Personalización Avanzada:</strong> {{ user.personalizacionAvanzada ?
                                            'Sí' : 'No' }}</p>
                                    </div>
                                </div>

                                <div class="plan-actions">
                                    <button v-if="!user.esPremium" @click="upgradeToPremium" class="btn btn-primary"
                                        :disabled="updating">
                                        ⭐ Actualizar a Premium
                                    </button>
                                    <button v-else @click="downgradeToPlan" class="btn btn-secondary"
                                        :disabled="updating">
                                        🔄 Cambiar a Gratuito
                                    </button>
                                </div>
                            </div>

                            <div v-if="user.esPremium" class="premium-details">
                                <h5>📅 Detalles Premium</h5>
                                <div class="premium-info">
                                    <div class="info-item">
                                        <label>Fecha de Vencimiento:</label>
                                        <EditableField :value="formatDateForInput(user.fechaVencimientoPremium)"
                                            field="fechaVencimientoPremium" type="date" @update="updateField" />
                                    </div>

                                    <div class="info-item">
                                        <label>Días Restantes:</label>
                                        <span
                                            :class="['days-remaining', getDaysRemainingClass(user.fechaVencimientoPremium)]">
                                            {{ getDaysRemaining(user.fechaVencimientoPremium) }} días
                                        </span>
                                    </div>

                                    <div class="info-item">
                                        <label>Fecha de Upgrade:</label>
                                        <span>{{ formatDate(user.fechaUpgrade) || 'No disponible' }}</span>
                                    </div>

                                    <div class="info-item">
                                        <label>Última Renovación:</label>
                                        <span>{{ formatDate(user.fechaRenovacion) || 'No disponible' }}</span>
                                    </div>
                                </div>

                                <div class="premium-actions">
                                    <button @click="extendPremium" class="btn btn-primary" :disabled="updating">
                                        📅 Extender 1 Año
                                    </button>
                                    <button @click="extendPremiumCustom" class="btn btn-secondary" :disabled="updating">
                                        📅 Extender Personalizado
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tab Tarjetas -->
                    <div v-if="activeTab === 'tarjetas'" class="tarjetas-tab">
                        <h4>💳 Tarjetas Bancarias ({{ user.tarjetas?.length || 0 }})</h4>

                        <div v-if="!user.tarjetas || user.tarjetas.length === 0" class="no-cards">
                            <div class="empty-icon">💳</div>
                            <p>Este usuario no tiene tarjetas bancarias registradas</p>
                        </div>

                        <div v-else class="cards-list">
                            <div v-for="tarjeta in user.tarjetas" :key="tarjeta.id" class="card-item">
                                <div class="card-header">
                                    <div class="card-title">
                                        <h5>{{ tarjeta.nombreTarjeta }}</h5>
                                        <span :class="['tipo-badge', (tarjeta.bancoTipo || 'bank').toLowerCase()]">
                                            {{ getBancoIcon(tarjeta.bancoTipo) }} {{
                                                getBancoTypeLabel(tarjeta.bancoTipo) }}
                                        </span>
                                    </div>
                                    <span :class="['status-badge', tarjeta.activa ? 'active' : 'inactive']">
                                        {{ tarjeta.activa ? 'Activa' : 'Inactiva' }}
                                    </span>
                                </div>

                                <div class="card-details">
                                    <div class="detail-row">
                                        <span class="label">Banco:</span>
                                        <span class="value">{{ tarjeta.banco }}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Tipo de Cuenta:</span>
                                        <span class="value">{{ tarjeta.tipoCuenta }}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Número de Cuenta:</span>
                                        <span class="value">{{ tarjeta.numeroCuenta }}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Titular:</span>
                                        <span class="value">{{ tarjeta.nombreTitular }}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">RUT Titular:</span>
                                        <span class="value">{{ tarjeta.rutTitular }}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Creada:</span>
                                        <span class="value">{{ formatDate(tarjeta.fechaCreacion) }}</span>
                                    </div>
                                </div>

                                <div v-if="user.esPremium" class="card-stats">
                                    <div class="stat-item">
                                        <span class="stat-icon">👁️</span>
                                        <span class="stat-value">{{ tarjeta.vistas || 0 }} visitas</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-icon">📱</span>
                                        <span class="stat-value">{{ tarjeta.escaneos || 0 }} escaneos</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-icon">📅</span>
                                        <span class="stat-value">{{ formatDate(tarjeta.ultimaVisita) || 'Nunca'
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tab Sistema -->
                    <div v-if="activeTab === 'sistema'" class="sistema-tab">
                        <h4>🔧 Información del Sistema</h4>

                        <div class="system-info">
                            <div class="info-section">
                                <h5>🔑 Identificadores</h5>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <label>UID:</label>
                                        <span class="monospace">{{ user.id }}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Token Público:</label>
                                        <span class="monospace">{{ user.tokenPublico }}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Rol:</label>
                                        <EditableField :value="user.rol" field="rol" type="select"
                                            :options="['usuario', 'vendedor', 'admin']" @update="updateField" />
                                    </div>
                                    <div class="info-item">
                                        <label>Estado:</label>
                                        <EditableField :value="user.estado" field="estado" type="select"
                                            :options="['activo', 'inactivo']" @update="updateField" />
                                    </div>
                                </div>
                            </div>

                            <div class="info-section">
                                <h5>📅 Fechas Importantes</h5>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <label>Fecha de Registro:</label>
                                        <span>{{ formatDate(user.fechaRegistro) }}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Último Acceso:</label>
                                        <span>{{ formatDate(user.ultimoAcceso) }}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Última Visita Pública:</label>
                                        <span>{{ formatDate(user.ultimaVisitaPublica) || 'Nunca' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Visitas Totales:</label>
                                        <span>{{ user.visitasTotales || 0 }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="info-section">
                                <h5>👥 Información de Creación</h5>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <label>Creado Por:</label>
                                        <span :class="['source-badge', user.creadoPor]">
                                            {{ user.creadoPor === 'admin' ? '👑 Admin' : '🏪 Vendedor' }}
                                        </span>
                                    </div>
                                    <div class="info-item">
                                        <label>Vendedor:</label>
                                        <span>{{ user.vendedor || 'No especificado' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <div class="footer-info">
                    <span class="last-updated">
                        Última actualización: {{ formatDate(user.fechaActualizacion) || 'No disponible' }}
                    </span>
                </div>
                <div class="footer-actions">
                    <button @click="$emit('close')" class="btn btn-secondary">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { db } from '@/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import EditableField from './EditableField.vue'

const props = defineProps({
    user: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close', 'updated'])

// Estado
const activeTab = ref('personal')
const updating = ref(false)

// Funciones
const updateField = async (field, value) => {
    try {
        updating.value = true

        let updateData = {
            [field]: value,
            fechaActualizacion: serverTimestamp()
        }

        // Manejar campos especiales
        if (field === 'fechaNacimiento' || field === 'fechaVencimientoPremium') {
            updateData[field] = value ? new Date(value) : null
        }

        await updateDoc(doc(db, 'users', props.user.id), updateData)

        // Actualizar localmente
        props.user[field] = value

        emit('updated')

    } catch (error) {
        console.error('Error actualizando campo:', error)
        alert('Error al actualizar el campo')
    } finally {
        updating.value = false
    }
}



const upgradeToPremium = async () => {
    try {
        updating.value = true

        const fechaVencimiento = new Date()
        fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1)

        await updateDoc(doc(db, 'users', props.user.id), {
            tipoPlan: 'premium',
            esPremium: true,
            fechaVencimientoPremium: fechaVencimiento,
            limiteTarjetas: 5,
            accesoEstadisticas: true,
            personalizacionAvanzada: true,
            fechaUpgrade: serverTimestamp(),
            fechaActualizacion: serverTimestamp()
        })

        // Actualizar localmente
        Object.assign(props.user, {
            tipoPlan: 'premium',
            esPremium: true,
            fechaVencimientoPremium: fechaVencimiento,
            limiteTarjetas: 5,
            accesoEstadisticas: true,
            personalizacionAvanzada: true
        })

        emit('updated')
        alert('Usuario actualizado a Premium exitosamente')

    } catch (error) {
        console.error('Error actualizando a Premium:', error)
        alert('Error al actualizar a Premium')
    } finally {
        updating.value = false
    }
}

const downgradeToPlan = async () => {
    if (!confirm('¿Estás seguro de cambiar este usuario a plan gratuito?')) return

    try {
        updating.value = true

        await updateDoc(doc(db, 'users', props.user.id), {
            tipoPlan: 'gratuito',
            esPremium: false,
            fechaVencimientoPremium: null,
            limiteTarjetas: 1,
            accesoEstadisticas: false,
            personalizacionAvanzada: false,
            fechaDowngrade: serverTimestamp(),
            fechaActualizacion: serverTimestamp()
        })

        // Actualizar localmente
        Object.assign(props.user, {
            tipoPlan: 'gratuito',
            esPremium: false,
            fechaVencimientoPremium: null,
            limiteTarjetas: 1,
            accesoEstadisticas: false,
            personalizacionAvanzada: false
        })

        emit('updated')
        alert('Usuario cambiado a plan gratuito')

    } catch (error) {
        console.error('Error cambiando a gratuito:', error)
        alert('Error al cambiar el plan')
    } finally {
        updating.value = false
    }
}

const extendPremium = async () => {
    try {
        updating.value = true

        const fechaActual = props.user.fechaVencimientoPremium ?
            (props.user.fechaVencimientoPremium.toDate ? props.user.fechaVencimientoPremium.toDate() : new Date(props.user.fechaVencimientoPremium)) :
            new Date()

        const nuevaFecha = new Date(fechaActual)
        nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1)

        await updateDoc(doc(db, 'users', props.user.id), {
            fechaVencimientoPremium: nuevaFecha,
            fechaRenovacion: serverTimestamp(),
            fechaActualizacion: serverTimestamp()
        })

        props.user.fechaVencimientoPremium = nuevaFecha

        emit('updated')
        alert('Plan Premium extendido por 1 año')

    } catch (error) {
        console.error('Error extendiendo Premium:', error)
        alert('Error al extender el plan')
    } finally {
        updating.value = false
    }
}

const extendPremiumCustom = () => {
    const meses = prompt('¿Cuántos meses quieres extender el plan Premium?', '12')
    if (!meses || isNaN(meses)) return

    // TODO: Implementar extensión personalizada
    alert(`Funcionalidad de extensión personalizada por ${meses} meses (por implementar)`)
}

const formatDate = (date) => {
    if (!date) return null

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

const formatDateForInput = (date) => {
    if (!date) return ''

    let dateObj = date
    if (date.toDate) {
        dateObj = date.toDate()
    } else if (typeof date === 'string') {
        dateObj = new Date(date)
    }

    return dateObj.toISOString().split('T')[0]
}

const getDaysRemaining = (fechaVencimiento) => {
    if (!fechaVencimiento) return 0

    const fechaVenc = fechaVencimiento.toDate ?
        fechaVencimiento.toDate() :
        new Date(fechaVencimiento)

    const hoy = new Date()
    const diferencia = fechaVenc - hoy
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
}

const getDaysRemainingClass = (fechaVencimiento) => {
    const days = getDaysRemaining(fechaVencimiento)
    if (days <= 0) return 'expired'
    if (days <= 30) return 'warning'
    return 'normal'
}

const getBancoIcon = (type) => {
    const icons = {
        'BANK': '🏦',
        'WALLET': '💳',
        'PREPAID_CARD': '🎫'
    }
    return icons[type] || '🏦'
}

const getBancoTypeLabel = (type) => {
    const labels = {
        'BANK': 'Banco',
        'WALLET': 'Wallet',
        'PREPAID_CARD': 'Prepagada'
    }
    return labels[type] || 'Banco'
}
</script>

<style scoped>
@import '@/styles/admin-users.css';
</style>
