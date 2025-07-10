<template>
    <div class="users-list">
        <!-- Header con estadísticas -->
        <div class="management-header">
            <div class="header-content">
                <h2>👥 Lista de Usuarios</h2>
                <div class="stats-summary">
                    <div class="stat-item">
                        <span class="stat-number">{{ usuarios.length }}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">{{ usuariosPremium }}</span>
                        <span class="stat-label">Premium</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">{{ totalTarjetas }}</span>
                        <span class="stat-label">Tarjetas</span>
                    </div>
                </div>
            </div>
            <div class="header-actions">
                <button @click="refreshUsers" class="btn btn-secondary" :disabled="loading">
                    🔄 Actualizar
                </button>
                <button @click="migrarRoles" class="btn btn-warning" :disabled="loading">
                    🔧 Migrar Roles
                </button>
            </div>
        </div>

        <!-- Filtros y búsqueda -->
        <div class="filters-section">
            <div class="search-and-sort">
                <div class="search-box">
                    <input v-model="searchQuery" type="text" placeholder="🔍 Buscar por nombre, email o RUT..."
                        class="search-input">
                </div>
                <div class="sort-controls">
                    <label>Ordenar por:</label>
                    <select v-model="sortBy" class="sort-select">
                        <option value="nombre">Nombre</option>
                        <option value="fechaRegistro">Fecha de Registro</option>
                        <option value="role">Rol</option>
                        <option value="comuna">Comuna</option>
                        <option value="edad">Edad</option>
                        <option value="estado">Estado</option>
                    </select>
                    <button @click="toggleSortOrder" class="sort-order-btn"
                        :title="sortOrder === 'asc' ? 'Ascendente' : 'Descendente'">
                        {{ sortOrder === 'asc' ? '⬆️' : '⬇️' }}
                    </button>
                </div>
            </div>

            <div class="filter-buttons">
                <button @click="filterType = 'todos'" :class="['filter-btn', { active: filterType === 'todos' }]">
                    Todos ({{ usuarios.length }})
                </button>
                <button @click="filterType = 'admin'" :class="['filter-btn', { active: filterType === 'admin' }]">
                    Admin ({{ usuariosAdmin }})
                </button>
                <button @click="filterType = 'vendedor'" :class="['filter-btn', { active: filterType === 'vendedor' }]">
                    Vendedor ({{ usuariosVendedor }})
                </button>
                <button @click="filterType = 'usuario'" :class="['filter-btn', { active: filterType === 'usuario' }]">
                    Usuario ({{ usuariosUsuario }})
                </button>
                <button @click="filterType = 'premium'" :class="['filter-btn', { active: filterType === 'premium' }]">
                    Premium ({{ usuariosPremium }})
                </button>
                <button @click="filterType = 'activos'" :class="['filter-btn', { active: filterType === 'activos' }]">
                    Activos ({{ usuariosActivos }})
                </button>
                <button @click="filterType = 'inactivos'"
                    :class="['filter-btn', { active: filterType === 'inactivos' }]">
                    Inactivos ({{ usuariosInactivos }})
                </button>
            </div>
        </div>

        <!-- Tabla de usuarios -->
        <div class="users-table-container">
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Cargando usuarios...</p>
            </div>

            <div v-else-if="usuariosFiltrados.length === 0" class="empty-state">
                <div class="empty-icon">👥</div>
                <h3>No se encontraron usuarios</h3>
                <p>{{ searchQuery ? 'Intenta con otros términos de búsqueda' : 'Aún no hay usuarios registrados' }}</p>
            </div>

            <table v-else class="users-table">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Comuna</th>
                        <th>Edad</th>
                        <th>Plan</th>
                        <th>Tarjetas por Banco</th>
                        <th>Registro</th>
                        <th>Verificación</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="usuario in usuariosFiltrados" :key="usuario.id" class="user-row">
                        <td class="user-info">
                            <div class="user-avatar">
                                <div class="avatar-placeholder">
                                    {{ usuario.nombre?.charAt(0) || '?' }}{{ usuario.apellido?.charAt(0) || '' }}
                                </div>
                            </div>
                            <div class="user-details">
                                <strong>{{ usuario.nombre }} {{ usuario.apellido }}</strong>
                                <span class="user-email">{{ usuario.email }}</span>
                                <span class="user-rut">{{ usuario.rut }}</span>
                            </div>
                        </td>

                        <td class="comuna-info">
                            <div class="location-info">
                                <span class="comuna">{{ usuario.comuna || 'No especificada' }}</span>
                                <small v-if="usuario.region" class="region">{{ usuario.region }}</small>
                            </div>
                        </td>

                        <td class="edad-info">
                            <div class="age-info">
                                <span class="age">{{ calculateAge(usuario.fechaNacimiento) || 'N/A' }}</span>
                                <small v-if="usuario.fechaNacimiento" class="birth-date">
                                    {{ formatDate(usuario.fechaNacimiento) }}
                                </small>
                            </div>
                        </td>

                        <td class="plan-info">
                            <span :class="['plan-badge', usuario.esPremium ? 'premium' : 'gratuito']">
                                {{ usuario.esPremium ? '⭐ Premium' : '🆓 Gratuito' }}
                            </span>
                            <div v-if="usuario.esPremium" class="plan-details">
                                <small>Vence: {{ formatDate(usuario.fechaVencimientoPremium) }}</small>
                                <small
                                    :class="['days-remaining', getDaysRemainingClass(usuario.fechaVencimientoPremium)]">
                                    {{ getDaysRemaining(usuario.fechaVencimientoPremium) }} días
                                </small>
                            </div>
                        </td>

                        <td class="cards-info">
                            <div v-if="usuario.tarjetas && usuario.tarjetas.length > 0" class="cards-summary">
                                <div class="cards-count">
                                    <strong>{{ usuario.tarjetas.length }}</strong> tarjeta{{ usuario.tarjetas.length !==
                                        1 ? 's' : '' }}
                                </div>
                                <div class="banks-list">
                                    <span v-for="banco in getBancosUnicos(usuario.tarjetas)" :key="banco.name"
                                        class="bank-tag"
                                        :title="`${banco.count} tarjeta${banco.count !== 1 ? 's' : ''} en ${banco.name}`">
                                        {{ getBancoIcon(banco.type) }} {{ banco.name }} ({{ banco.count }})
                                    </span>
                                </div>
                            </div>
                            <div v-else class="no-cards">
                                <span class="no-cards-text">Sin tarjetas</span>
                            </div>
                        </td>

                        <td class="registration-info">
                            <div class="registration-date">{{ formatDate(usuario.fechaRegistro) }}</div>
                            <div class="user-role">
                                <span :class="['role-badge', usuario.rol]">
                                    {{ getRoleLabel(usuario.rol) }}
                                </span>
                            </div>
                            <div v-if="usuario.creadoPor" class="creation-source">
                                <small>Creado por: {{ usuario.creadoPor }}</small>
                            </div>
                            <div v-if="usuario.vendedor" class="vendor-info">
                                <small>Vendedor: {{ usuario.vendedor }}</small>
                            </div>
                        </td>

                        <td class="verification-info">
                            <div class="verification-status">
                                <select :value="usuario.idVerificationStatus || 'pending'"
                                    @change="updateVerificationStatus(usuario, $event.target.value)"
                                    :disabled="updating" class="verification-select">
                                    <option value="auto_approved">✅ Auto-aprobado</option>
                                    <option value="pending">⏳ Pendiente</option>
                                    <option value="approved">✅ Aprobado</option>
                                    <option value="rejected">❌ Rechazado</option>
                                </select>
                                <div v-if="usuario.verifiedBadge" class="verified-badge-indicator">
                                    <span class="badge-verified" title="Badge Verificado">✓ Badge</span>
                                </div>
                                <div v-else-if="usuario.isPremium || usuario.esPremium" class="badge-actions">
                                    <button @click="toggleVerifiedBadge(usuario)" :disabled="updating"
                                        class="btn-badge-toggle"
                                        :title="usuario.verifiedBadge ? 'Quitar Badge Verificado' : 'Otorgar Badge Verificado'">
                                        {{ usuario.verifiedBadge ? '🛡️ Quitar Badge' : '🛡️ Dar Badge' }}
                                    </button>
                                </div>
                            </div>
                        </td>

                        <td class="status-info">
                            <div class="status-toggle">
                                <label class="toggle-switch">
                                    <input type="checkbox" :checked="usuario.estado === 'activo'"
                                        @change="toggleUserStatus(usuario)" :disabled="updating">
                                    <span class="toggle-slider"></span>
                                </label>
                                <span :class="['status-label', usuario.estado]">
                                    {{ usuario.estado === 'activo' ? 'Activo' : 'Inactivo' }}
                                </span>
                            </div>
                        </td>

                        <td class="actions">
                            <button @click="viewUserDetail(usuario)" class="btn-icon view" title="Ver detalle">
                                👁️
                            </button>
                            <button @click="editUser(usuario)" class="btn-icon edit" title="Editar">
                                ✏️
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal de detalle de usuario -->
        <UserDetailModal v-if="showUserDetail" :user="selectedUser" @close="closeUserDetail" @updated="onUserUpdated" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/firebase'
import UserDetailModal from './UserDetailModal.vue'
import { migrateUserRoles, checkRoleStatus } from '@/utils/migrateRoles'

// Estado
const loading = ref(true)
const updating = ref(false)
const usuarios = ref([])
const searchQuery = ref('')
const filterType = ref('todos')
const sortBy = ref('nombre')
const sortOrder = ref('asc')
const showUserDetail = ref(false)
const selectedUser = ref(null)
const showEditModal = ref(false)

// Computed
const usuariosFiltrados = computed(() => {
    let filtered = usuarios.value

    // Filtrar por búsqueda
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(user =>
            user.nombre?.toLowerCase().includes(query) ||
            user.apellido?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.rut?.toLowerCase().includes(query) ||
            user.comuna?.toLowerCase().includes(query)
        )
    }

    // Filtrar por tipo
    if (filterType.value === 'admin') {
        filtered = filtered.filter(user => user.rol === 'admin')
    } else if (filterType.value === 'vendedor') {
        filtered = filtered.filter(user => user.rol === 'vendedor')
    } else if (filterType.value === 'usuario') {
        filtered = filtered.filter(user => user.rol === 'usuario')
    } else if (filterType.value === 'premium') {
        filtered = filtered.filter(user => user.esPremium)
    } else if (filterType.value === 'activos') {
        filtered = filtered.filter(user => user.estado === 'activo')
    } else if (filterType.value === 'inactivos') {
        filtered = filtered.filter(user => user.estado === 'inactivo')
    }

    // Ordenar
    filtered.sort((a, b) => {
        let valueA, valueB

        switch (sortBy.value) {
            case 'nombre':
                valueA = `${a.nombre || ''} ${a.apellido || ''}`.toLowerCase()
                valueB = `${b.nombre || ''} ${b.apellido || ''}`.toLowerCase()
                break
            case 'fechaRegistro':
                valueA = a.fechaRegistro ? (a.fechaRegistro.toDate ? a.fechaRegistro.toDate() : new Date(a.fechaRegistro)) : new Date(0)
                valueB = b.fechaRegistro ? (b.fechaRegistro.toDate ? b.fechaRegistro.toDate() : new Date(b.fechaRegistro)) : new Date(0)
                break
            case 'rol':
                valueA = a.rol || ''
                valueB = b.rol || ''
                break
            case 'comuna':
                valueA = (a.comuna || '').toLowerCase()
                valueB = (b.comuna || '').toLowerCase()
                break
            case 'edad':
                valueA = calculateAge(a.fechaNacimiento)
                valueB = calculateAge(b.fechaNacimiento)
                break
            case 'estado':
                valueA = a.estado || ''
                valueB = b.estado || ''
                break
            default:
                valueA = a.nombre || ''
                valueB = b.nombre || ''
        }

        if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1
        if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
    })

    return filtered
})

const usuariosAdmin = computed(() => {
    return usuarios.value.filter(user => user.rol === 'admin').length
})

const usuariosVendedor = computed(() => {
    return usuarios.value.filter(user => user.rol === 'vendedor').length
})

const usuariosUsuario = computed(() => {
    return usuarios.value.filter(user => user.rol === 'usuario').length
})

const usuariosPremium = computed(() => {
    return usuarios.value.filter(user => user.esPremium).length
})

const usuariosActivos = computed(() => {
    return usuarios.value.filter(user => user.estado === 'activo').length
})

const usuariosInactivos = computed(() => {
    return usuarios.value.filter(user => user.estado === 'inactivo').length
})

const totalTarjetas = computed(() => {
    return usuarios.value.reduce((total, user) => {
        return total + (user.tarjetas ? user.tarjetas.length : 0)
    }, 0)
})

// Funciones
const loadUsers = async () => {
    try {
        loading.value = true

        // Cargar usuarios
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const usersData = []

        for (const userDoc of usersSnapshot.docs) {
            const userData = { id: userDoc.id, ...userDoc.data() }

            // Migrar de 'role' a 'rol' si es necesario
            if (userData.role && !userData.rol) {
                userData.rol = userData.role
                // Actualizar en Firebase para migrar el campo
                try {
                    await updateDoc(doc(db, 'users', userData.id), {
                        rol: userData.role
                    })
                    console.log(`🔄 Migrado role → rol para ${userData.email}`)
                } catch (error) {
                    console.error('Error migrando campo:', error)
                }
            }

            // Asignar valor por defecto si no existe ningún rol
            if (!userData.rol) {
                userData.rol = 'usuario'
            }

            // Normalizar estado si no existe
            if (!userData.estado) {
                userData.estado = 'activo'
            }

            // Debug: Mostrar datos reales de cada usuario
            console.log('📋 Usuario encontrado:', {
                id: userData.id,
                email: userData.email,
                nombre: userData.nombre,
                apellido: userData.apellido,
                rol: userData.rol,
                creadoPor: userData.creadoPor,
                vendedor: userData.vendedor,
                estado: userData.estado,
                esPremium: userData.esPremium,
                fechaRegistro: userData.fechaRegistro
            })

            // Cargar tarjetas del usuario
            const cardsQuery = query(
                collection(db, 'bank_cards'),
                where('propietarioEmail', '==', userData.email)
            )
            const cardsSnapshot = await getDocs(cardsQuery)
            userData.tarjetas = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

            usersData.push(userData)
        }

        usuarios.value = usersData
        console.log('✅ Usuarios cargados:', usuarios.value.length)
        console.log('📊 Resumen de roles:', {
            admin: usersData.filter(u => u.rol === 'admin').length,
            vendedor: usersData.filter(u => u.rol === 'vendedor').length,
            usuario: usersData.filter(u => u.rol === 'usuario').length
        })

    } catch (error) {
        console.error('❌ Error cargando usuarios:', error)
    } finally {
        loading.value = false
    }
}

const refreshUsers = () => {
    loadUsers()
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

const getBancosUnicos = (tarjetas) => {
    const bancosMap = new Map()

    tarjetas.forEach(tarjeta => {
        const banco = tarjeta.banco
        const tipo = tarjeta.bancoTipo || 'BANK'

        if (bancosMap.has(banco)) {
            bancosMap.get(banco).count++
        } else {
            bancosMap.set(banco, {
                name: banco,
                type: tipo,
                count: 1
            })
        }
    })

    return Array.from(bancosMap.values())
}

const getBancoIcon = (type) => {
    const icons = {
        'BANK': '🏦',
        'WALLET': '💳',
        'PREPAID_CARD': '🎫'
    }
    return icons[type] || '🏦'
}

const viewUserDetail = (usuario) => {
    selectedUser.value = usuario
    showUserDetail.value = true
}

const closeUserDetail = () => {
    showUserDetail.value = false
    selectedUser.value = null
}

const onUserUpdated = () => {
    loadUsers() // Recargar usuarios después de actualización
}

const toggleUserStatus = async (usuario) => {
    try {
        updating.value = true
        const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo'

        await updateDoc(doc(db, 'users', usuario.id), {
            estado: nuevoEstado,
            fechaActualizacion: new Date()
        })

        // Actualizar localmente
        usuario.estado = nuevoEstado

        console.log(`✅ Usuario ${nuevoEstado}: ${usuario.email}`)

    } catch (error) {
        console.error('Error actualizando estado:', error)
        alert('Error al actualizar el estado del usuario')
    } finally {
        updating.value = false
    }
}

// Función para actualizar estado de verificación usando Cloud Function
const updateVerificationStatus = async (usuario, newStatus) => {
    try {
        updating.value = true

        // Usar Cloud Function para mantener logs y seguridad
        const updateIdVerificationStatus = httpsCallable(functions, 'updateIdVerificationStatus')

        const result = await updateIdVerificationStatus({
            userId: usuario.id,
            status: newStatus,
            notes: `Estado cambiado manualmente por admin desde lista de usuarios`
        })

        // Actualizar localmente
        usuario.idVerificationStatus = newStatus

        console.log(`✅ Estado de verificación actualizado: ${usuario.email} → ${newStatus}`)

        // Mostrar confirmación
        const statusLabels = {
            'auto_approved': 'Auto-aprobado',
            'pending': 'Pendiente',
            'approved': 'Aprobado',
            'rejected': 'Rechazado'
        }
        alert(`Estado de verificación cambiado a: ${statusLabels[newStatus]}`)

    } catch (error) {
        console.error('Error actualizando estado de verificación:', error)

        // Mostrar error específico si está disponible
        let errorMessage = 'Error al actualizar el estado de verificación'
        if (error.code === 'functions/permission-denied') {
            errorMessage = 'No tienes permisos para realizar esta acción'
        } else if (error.message) {
            errorMessage = error.message
        }

        alert(errorMessage)
    } finally {
        updating.value = false
    }
}

// Función para otorgar/quitar badge verificado
const toggleVerifiedBadge = async (usuario) => {
    try {
        updating.value = true

        const newBadgeStatus = !usuario.verifiedBadge

        const updateData = {
            verifiedBadge: newBadgeStatus,
            verifiedBadgeUpdatedAt: new Date(),
            verifiedBadgeUpdatedBy: 'admin', // TODO: usar el UID del admin actual
            fechaActualizacion: new Date()
        }

        await updateDoc(doc(db, 'users', usuario.id), updateData)

        // Actualizar localmente
        usuario.verifiedBadge = newBadgeStatus

        console.log(`✅ Badge verificado ${newBadgeStatus ? 'otorgado' : 'removido'}: ${usuario.email}`)

        // Mostrar confirmación
        alert(`Badge verificado ${newBadgeStatus ? 'otorgado' : 'removido'} exitosamente`)

    } catch (error) {
        console.error('Error actualizando badge verificado:', error)
        alert('Error al actualizar el badge verificado')
    } finally {
        updating.value = false
    }
}

const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const calculateAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return 0

    const birthDate = fechaNacimiento.toDate ?
        fechaNacimiento.toDate() :
        new Date(fechaNacimiento)

    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }

    return age
}

const getRoleLabel = (role) => {
    const labels = {
        'admin': '👑 Admin',
        'vendedor': '🏪 Vendedor',
        'soporte': '🎧 Soporte',
        'usuario': '👤 Usuario'
    }
    return labels[role] || '❓ Sin rol'
}

// Funciones para estados de verificación
const getVerificationClass = (status) => {
    const classes = {
        'auto_approved': 'auto-approved',
        'pending': 'pending',
        'approved': 'approved',
        'verified': 'verified',
        'rejected': 'rejected'
    }
    return classes[status] || 'unknown'
}

const getVerificationIcon = (status) => {
    const icons = {
        'auto_approved': '✅',
        'pending': '⏳',
        'approved': '✅',
        'verified': '🛡️',
        'rejected': '❌'
    }
    return icons[status] || '❓'
}

const getVerificationLabel = (status) => {
    const labels = {
        'auto_approved': 'Auto-aprobado',
        'pending': 'Pendiente',
        'approved': 'Aprobado',
        'verified': 'Verificado',
        'rejected': 'Rechazado'
    }
    return labels[status] || 'Sin estado'
}

const editUser = (usuario) => {
    selectedUser.value = usuario
    showUserDetail.value = true // Usar el mismo modal de detalle para edición
}

const closeEditModal = () => {
    showEditModal.value = false
    selectedUser.value = null
}

const migrarRoles = async () => {
    if (!confirm('¿Estás seguro de que quieres migrar todos los roles a usar el campo "rol"? Esta acción actualizará la base de datos.')) {
        return
    }

    try {
        loading.value = true
        console.log('🔄 Iniciando migración de roles...')

        // Verificar estado actual
        await checkRoleStatus()

        // Ejecutar migración
        const result = await migrateUserRoles()

        // Recargar usuarios
        await loadUsers()

        alert(`✅ Migración completada:\n- Total usuarios: ${result.total}\n- Migrados: ${result.migrated}\n- Sin cambios: ${result.unchanged}`)

    } catch (error) {
        console.error('Error en migración:', error)
        alert('❌ Error durante la migración: ' + error.message)
    } finally {
        loading.value = false
    }
}

// Detectar si la tabla necesita scroll horizontal
const checkTableScroll = () => {
    const container = document.querySelector('.users-table-container')
    if (container) {
        const needsScroll = container.scrollWidth > container.clientWidth
        if (needsScroll) {
            container.setAttribute('data-scrollable', 'true')
        } else {
            container.removeAttribute('data-scrollable')
        }
    }
}

onMounted(() => {
    loadUsers()
    // Verificar scroll después de cargar
    setTimeout(checkTableScroll, 100)
    // Verificar scroll al redimensionar ventana
    window.addEventListener('resize', checkTableScroll)
})
</script>

<style scoped>
@import '@/styles/admin-users.css';
</style>
