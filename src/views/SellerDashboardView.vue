<template>
    <div class="seller-dashboard">
        <!-- Header del vendedor -->
        <div class="dashboard-header">
            <div class="welcome-section">
                <h1>🧑‍💼 Panel de Vendedor</h1>
                <p class="welcome-text">
                    Bienvenido, <strong>{{ vendedorInfo.nombre }} {{ vendedorInfo.apellido }}</strong>
                </p>
                <p class="role-description">Gestiona tus ventas y registra nuevos usuarios</p>
            </div>
            <div class="quick-actions">
                <button @click="showRegistroModal = true" class="btn btn-primary">
                    ➕ {{ stats.usuariosRegistrados === 0 ? 'Registrar Primer Usuario' : 'Registrar Nuevo Usuario' }}
                </button>
                <button @click="refreshData" class="btn btn-secondary" :disabled="loading">
                    🔄 Actualizar
                </button>
                <button @click="toggleUsersList" class="btn btn-outline">
                    📋 {{ showUsersList ? 'Ocultar Lista' : 'Ver Todos los Usuarios' }}
                </button>
            </div>
        </div>

        <!-- Estadísticas del vendedor -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                    <h3>Usuarios Registrados</h3>
                    <p class="stat-number">{{ stats.usuariosRegistrados }}</p>
                    <span class="stat-label">Este mes</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-content">
                    <h3>Meta Mensual</h3>
                    <p class="stat-number">{{ stats.metaMensual }}</p>
                    <span class="stat-label">Objetivo</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                    <h3>Progreso</h3>
                    <p class="stat-number">{{ progressPercentage }}%</p>
                    <span class="stat-label">Completado</span>
                </div>
            </div>

            <div class="stat-card ranking-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-content">
                    <h3>Ranking</h3>
                    <p class="stat-number">
                        <span v-if="stats.ranking">#{{ stats.ranking }}</span>
                        <span v-else class="loading-ranking">Calculando...</span>
                    </p>
                    <span class="stat-label" v-if="stats.ranking && stats.totalVendedores">
                        de {{ stats.totalVendedores }} vendedores
                    </span>
                    <span class="stat-label" v-else>Este mes</span>
                </div>
            </div>
        </div>

        <!-- Barra de progreso -->
        <div class="progress-section">
            <h3>📈 Progreso hacia la Meta</h3>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <p class="progress-text">
                {{ stats.usuariosRegistrados }} de {{ stats.metaMensual }} usuarios registrados
                <span v-if="remainingUsers > 0">(faltan {{ remainingUsers }})</span>
                <span v-else class="success-text">¡Meta alcanzada! 🎉</span>
            </p>
        </div>

        <!-- Usuarios recientes -->
        <div class="recent-users">
            <h3>👥 Usuarios Registrados Recientemente</h3>
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Cargando usuarios...</p>
            </div>
            <div v-else-if="usuariosRecientes.length === 0" class="empty-state">
                <p>No has registrado usuarios aún</p>
                <button @click="showRegistroModal = true" class="btn btn-primary">
                    Registrar Primer Usuario
                </button>
            </div>
            <div v-else class="users-grid">
                <div v-for="usuario in usuariosRecientes" :key="usuario.id" class="user-card-modern">
                    <!-- Header de la tarjeta -->
                    <div class="card-header">
                        <div class="user-avatar-modern">
                            <div class="avatar-circle">
                                {{ usuario.nombre?.charAt(0) || '?' }}{{ usuario.apellido?.charAt(0) || '' }}
                            </div>
                            <div class="status-indicator" :class="usuario.estado || 'activo'"></div>
                        </div>
                        <div class="card-actions">
                            <button @click="contactarUsuario(usuario)" class="action-btn whatsapp"
                                title="Contactar por WhatsApp">
                                📱
                            </button>
                            <button @click="verDetallesUsuario(usuario)" class="action-btn details"
                                title="Ver detalles">
                                👁️
                            </button>
                        </div>
                    </div>

                    <!-- Información principal -->
                    <div class="card-body">
                        <h4 class="user-name">{{ usuario.nombre }} {{ usuario.apellido }}</h4>
                        <p class="user-email">{{ usuario.email }}</p>

                        <!-- Información adicional -->
                        <div class="user-details-grid">
                            <div class="detail-item">
                                <span class="detail-icon">🆔</span>
                                <span class="detail-text">{{ usuario.rut || 'Sin RUT' }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">📱</span>
                                <span class="detail-text">{{ usuario.telefono || 'Sin teléfono' }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">🌍</span>
                                <span class="detail-text">{{ usuario.comuna || 'Sin ubicación' }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">🏢</span>
                                <span class="detail-text">{{ usuario.empresa || 'Sin empresa' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Footer de la tarjeta -->
                    <div class="card-footer">
                        <div class="plan-info">
                            <span class="plan-badge" :class="usuario.esPremium ? 'premium' : 'free'">
                                {{ usuario.esPremium ? '⭐ Premium' : '🆓 Gratuito' }}
                            </span>
                        </div>
                        <div class="date-info">
                            <span class="date-label">Registrado</span>
                            <span class="date-value">{{ formatearTiempo(usuario.fechaRegistro) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sección de listado completo de usuarios -->
        <div v-if="showUsersList" class="users-list-section">
            <div class="section-header">
                <h2>📋 Todos los Usuarios Registrados</h2>
                <p class="section-description">
                    Gestiona y revisa todos los usuarios que has registrado en el sistema
                </p>
            </div>

            <!-- Controles de búsqueda y filtros -->
            <div class="search-filters">
                <div class="search-box">
                    <input v-model="busquedaTexto" type="text" placeholder="🔍 Buscar por nombre, email o RUT..."
                        class="search-input" @input="filtrarUsuarios">
                </div>

                <div class="filter-buttons">
                    <button @click="cambiarFiltro('todos')"
                        :class="['filter-btn', { active: filtroTemporal === 'todos' }]">
                        📊 Todos ({{ todosLosUsuarios.length }})
                    </button>
                    <button @click="cambiarFiltro('7dias')"
                        :class="['filter-btn', { active: filtroTemporal === '7dias' }]">
                        📅 Últimos 7 días
                    </button>
                    <button @click="cambiarFiltro('mes')" :class="['filter-btn', { active: filtroTemporal === 'mes' }]">
                        📆 Este mes
                    </button>
                </div>
            </div>

            <!-- Tabla de usuarios -->
            <div class="users-table-container">
                <div v-if="loadingUsuarios" class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando usuarios...</p>
                </div>

                <div v-else-if="usuariosFiltrados.length === 0" class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>No se encontraron usuarios</h3>
                    <p v-if="busquedaTexto">
                        No hay usuarios que coincidan con "{{ busquedaTexto }}"
                    </p>
                    <p v-else-if="filtroTemporal !== 'todos'">
                        No hay usuarios registrados en el período seleccionado
                    </p>
                    <p v-else>
                        Aún no has registrado ningún usuario
                    </p>
                </div>

                <div v-else class="users-table">
                    <table>
                        <thead>
                            <tr>
                                <th>👤 Usuario</th>
                                <th>📧 Email</th>
                                <th>🆔 RUT</th>
                                <th>📱 Teléfono</th>
                                <th>🌍 Ubicación</th>
                                <th>💎 Plan</th>
                                <th>📅 Registro</th>
                                <th>⚙️ Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="usuario in usuariosFiltrados" :key="usuario.id" class="user-row">
                                <td class="user-info">
                                    <div class="user-avatar">
                                        {{ usuario.nombre?.charAt(0) || '?' }}{{ usuario.apellido?.charAt(0) || '' }}
                                    </div>
                                    <div class="user-details">
                                        <strong>{{ usuario.nombre }} {{ usuario.apellido }}</strong>
                                        <span class="user-status" :class="usuario.estado">{{ usuario.estado }}</span>
                                    </div>
                                </td>
                                <td>{{ usuario.email }}</td>
                                <td>{{ usuario.rut || 'No especificado' }}</td>
                                <td>{{ usuario.telefono || 'No especificado' }}</td>
                                <td>
                                    <div class="location-info">
                                        <div>{{ usuario.comuna || 'No especificado' }}</div>
                                        <small>{{ usuario.region || 'No especificado' }}</small>
                                    </div>
                                </td>
                                <td>
                                    <span class="plan-badge" :class="usuario.esPremium ? 'premium' : 'free'">
                                        {{ usuario.esPremium ? '⭐ Premium' : '🆓 Gratuito' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="date-info">
                                        <div>{{ formatearFecha(usuario.fechaRegistro) }}</div>
                                        <small>{{ formatearTiempo(usuario.fechaRegistro) }}</small>
                                    </div>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button @click="verDetallesUsuario(usuario)" class="btn-action view">
                                            👁️
                                        </button>
                                        <button @click="contactarUsuario(usuario)" class="btn-action contact">
                                            📞
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Resumen de la lista -->
            <div class="list-summary">
                <p>
                    Mostrando {{ usuariosFiltrados.length }} de {{ todosLosUsuarios.length }} usuarios registrados
                    <span v-if="busquedaTexto"> • Filtrado por: "{{ busquedaTexto }}"</span>
                    <span v-if="filtroTemporal !== 'todos'"> • Período: {{ getNombreFiltro(filtroTemporal) }}</span>
                </p>
            </div>
        </div>

        <!-- Modal de registro completo -->
        <div v-if="showRegistroModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content large" @click.stop>
                <div class="modal-header">
                    <h3>➕ Registrar Nuevo Usuario</h3>
                    <button @click="closeModal" class="close-btn">✕</button>
                </div>
                <p class="modal-description">
                    Complete todos los campos para registrar un nuevo usuario en el sistema.
                </p>
                <form @submit.prevent="registrarUsuarioCompleto" class="complete-form">
                    <!-- Información Personal -->
                    <div class="form-section">
                        <h4>👤 Información Personal</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Email *</label>
                                <input v-model="completeForm.email" type="email" class="input" required
                                    autocomplete="email" placeholder="usuario@ejemplo.com">
                            </div>
                            <div class="form-group">
                                <label>Contraseña *</label>
                                <input v-model="completeForm.password" type="password" class="input" required
                                    autocomplete="new-password" minlength="6" placeholder="Mínimo 6 caracteres">
                            </div>
                            <div class="form-group">
                                <label>Nombre *</label>
                                <input v-model="completeForm.nombre" type="text" class="input" required
                                    placeholder="Nombre">
                            </div>
                            <div class="form-group">
                                <label>Apellido *</label>
                                <input v-model="completeForm.apellido" type="text" class="input" required
                                    placeholder="Apellido">
                            </div>
                            <div class="form-group">
                                <label>RUT *</label>
                                <input v-model="completeForm.rut" type="text" class="input" required
                                    placeholder="12345678-9">
                            </div>
                            <div class="form-group">
                                <label>Fecha de Nacimiento</label>
                                <input v-model="completeForm.fechaNacimiento" type="date" class="input">
                            </div>
                        </div>
                    </div>

                    <!-- Información de Contacto -->
                    <div class="form-section">
                        <h4>📞 Información de Contacto</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Teléfono *</label>
                                <input v-model="completeForm.telefono" type="tel" class="input" required
                                    placeholder="+56912345678">
                            </div>
                            <!-- Información Geográfica y Demográfica -->
                            <div class="geo-section">
                                <h4>🌍 Información Geográfica y Demográfica</h4>
                                <GeoSelector v-model="geoData" @change="onGeoDataChange" :required="true"
                                    ref="geoSelector" />
                            </div>
                            <div class="form-group">
                                <label>Empresa</label>
                                <input v-model="completeForm.empresa" type="text" class="input"
                                    placeholder="Empresa o organización">
                            </div>
                        </div>
                    </div>

                    <!-- Plan Premium -->
                    <div class="form-section premium-section">
                        <h4>⭐ Plan Premium</h4>
                        <div class="premium-option">
                            <label class="checkbox-label premium">
                                <input v-model="completeForm.esPremium" type="checkbox">
                                <span class="checkmark"></span>
                                <div class="premium-info">
                                    <strong>Usuario Premium</strong>
                                    <p>Acceso a funciones avanzadas por 1 año</p>
                                </div>
                            </label>

                            <div v-if="completeForm.esPremium" class="premium-details">
                                <div class="premium-benefits">
                                    <h5>✨ Beneficios Premium:</h5>
                                    <ul>
                                        <li>Hasta 5 tarjetas bancarias</li>
                                        <li>Estadísticas y métricas detalladas</li>
                                        <li>Personalización avanzada</li>
                                        <li>Branding personalizado</li>
                                        <li>Soporte prioritario</li>
                                    </ul>
                                </div>
                                <div class="premium-validity">
                                    <p><strong>Vigencia:</strong> 1 año desde la fecha de registro</p>
                                    <p><strong>Vence:</strong> {{ fechaVencimientoPremium }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" @click="closeModal" class="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary" :disabled="submitting">
                            {{ submitting ? '⏳ Registrando...' : '✅ Registrar Usuario' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { db, auth } from '@/firebase'
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import GeoSelector from '@/components/forms/GeoSelector.vue'
import { vendorRankingService } from '@/services/vendorRankingService.js'

const authStore = useAuthStore()
const loading = ref(true)
const submitting = ref(false)
const showRegistroModal = ref(false)

// Datos del vendedor
const vendedorInfo = ref({
    nombre: '',
    apellido: '',
    email: '',
    metaMensual: 0,
    usuariosRegistrados: 0
})

// Estadísticas
const stats = ref({
    usuariosRegistrados: 0,
    metaMensual: 50,
    ranking: null
})

// Usuarios recientes
const usuariosRecientes = ref([])

// Listado completo de usuarios
const todosLosUsuarios = ref([])
const usuariosFiltrados = ref([])
const busquedaTexto = ref('')
const filtroTemporal = ref('todos') // 'todos', '7dias', 'mes'
const loadingUsuarios = ref(false)
const showUsersList = ref(false)

// Formulario de registro completo
const completeForm = ref({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rut: '',
    fechaNacimiento: '',
    telefono: '',
    empresa: '',
    esPremium: false
})

// Datos geográficos y demográficos
const geoData = ref({
    pais: '',
    region: '',
    provincia: '',
    comuna: '',
    sexo: ''
})

// Computed
const progressPercentage = computed(() => {
    if (stats.value.metaMensual === 0) return 0
    return Math.min(Math.round((stats.value.usuariosRegistrados / stats.value.metaMensual) * 100), 100)
})

const remainingUsers = computed(() => {
    return Math.max(stats.value.metaMensual - stats.value.usuariosRegistrados, 0)
})

const fechaVencimientoPremium = computed(() => {
    const fechaVencimiento = new Date()
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1)
    return fechaVencimiento.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
})

// Función para manejar cambios en datos geográficos
const onGeoDataChange = (newGeoData) => {
    geoData.value = { ...newGeoData }
    console.log('📍 Datos geográficos actualizados:', geoData.value)
}

// Funciones para la lista de usuarios
const toggleUsersList = async () => {
    showUsersList.value = !showUsersList.value
    if (showUsersList.value && todosLosUsuarios.value.length === 0) {
        await cargarTodosLosUsuarios()
    }
}

const cargarTodosLosUsuarios = async () => {
    try {
        loadingUsuarios.value = true

        const q = query(
            collection(db, 'users'),
            where('vendedor', '==', authStore.user.email),
            where('rol', '==', 'usuario'),
            orderBy('fechaRegistro', 'desc')
        )

        const querySnapshot = await getDocs(q)
        todosLosUsuarios.value = []

        querySnapshot.forEach((doc) => {
            todosLosUsuarios.value.push({
                id: doc.id,
                ...doc.data()
            })
        })

        // Aplicar filtros iniciales
        filtrarUsuarios()

        console.log(`📊 Total de usuarios cargados: ${todosLosUsuarios.value.length}`)

    } catch (error) {
        console.error('Error cargando todos los usuarios:', error)
    } finally {
        loadingUsuarios.value = false
    }
}

const cambiarFiltro = (nuevoFiltro) => {
    filtroTemporal.value = nuevoFiltro
    filtrarUsuarios()
}

const filtrarUsuarios = () => {
    let usuariosFiltradosTemp = [...todosLosUsuarios.value]

    // Filtro temporal
    if (filtroTemporal.value === '7dias') {
        const hace7Dias = new Date()
        hace7Dias.setDate(hace7Dias.getDate() - 7)
        usuariosFiltradosTemp = usuariosFiltradosTemp.filter(usuario => {
            const fechaRegistro = usuario.fechaRegistro?.toDate ? usuario.fechaRegistro.toDate() : new Date(usuario.fechaRegistro)
            return fechaRegistro >= hace7Dias
        })
    } else if (filtroTemporal.value === 'mes') {
        const inicioMes = new Date()
        inicioMes.setDate(1)
        inicioMes.setHours(0, 0, 0, 0)
        usuariosFiltradosTemp = usuariosFiltradosTemp.filter(usuario => {
            const fechaRegistro = usuario.fechaRegistro?.toDate ? usuario.fechaRegistro.toDate() : new Date(usuario.fechaRegistro)
            return fechaRegistro >= inicioMes
        })
    }

    // Filtro de búsqueda
    if (busquedaTexto.value.trim()) {
        const textoBusqueda = busquedaTexto.value.toLowerCase().trim()
        usuariosFiltradosTemp = usuariosFiltradosTemp.filter(usuario => {
            return (
                usuario.nombre?.toLowerCase().includes(textoBusqueda) ||
                usuario.apellido?.toLowerCase().includes(textoBusqueda) ||
                usuario.email?.toLowerCase().includes(textoBusqueda) ||
                usuario.rut?.toLowerCase().includes(textoBusqueda) ||
                `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(textoBusqueda)
            )
        })
    }

    usuariosFiltrados.value = usuariosFiltradosTemp
}

// Funciones de utilidad
const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible'
    const fechaObj = fecha.toDate ? fecha.toDate() : new Date(fecha)
    return fechaObj.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

const formatearTiempo = (fecha) => {
    if (!fecha) return ''
    const fechaObj = fecha.toDate ? fecha.toDate() : new Date(fecha)
    const ahora = new Date()
    const diferencia = ahora - fechaObj
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

    if (dias === 0) return 'Hoy'
    if (dias === 1) return 'Ayer'
    if (dias < 7) return `Hace ${dias} días`
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`
    return `Hace ${Math.floor(dias / 30)} meses`
}

const getNombreFiltro = (filtro) => {
    const nombres = {
        'todos': 'Todos los usuarios',
        '7dias': 'Últimos 7 días',
        'mes': 'Este mes'
    }
    return nombres[filtro] || filtro
}

// Acciones de usuario
const verDetallesUsuario = (usuario) => {
    console.log('Ver detalles de usuario:', usuario)
    // TODO: Implementar modal de detalles
    alert(`Detalles de ${usuario.nombre} ${usuario.apellido}\nEmail: ${usuario.email}\nPlan: ${usuario.esPremium ? 'Premium' : 'Gratuito'}`)
}

const contactarUsuario = (usuario) => {
    console.log('Contactar usuario:', usuario)
    if (usuario.telefono) {
        const mensaje = `Hola ${usuario.nombre}, soy tu vendedor de De Una. ¿Cómo puedo ayudarte?`
        const url = `https://wa.me/${usuario.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(mensaje)}`
        window.open(url, '_blank')
    } else {
        alert('Este usuario no tiene teléfono registrado')
    }
}

// Funciones
const loadVendedorData = async () => {
    try {
        loading.value = true

        console.log('🔍 INFORMACIÓN DEL VENDEDOR ACTUAL:')
        console.log('   📧 Email:', authStore.user?.email)
        console.log('   🆔 UID:', authStore.user?.uid)
        console.log('   🎭 Rol en store:', authStore.role)

        // Obtener datos del vendedor actual
        const vendedorDoc = await getDoc(doc(db, 'users', authStore.user.uid))
        if (vendedorDoc.exists()) {
            const data = vendedorDoc.data()
            vendedorInfo.value = {
                nombre: data.nombre || '',
                apellido: data.apellido || '',
                email: data.email || '',
                metaMensual: data.metaMensual || 50,
                usuariosRegistrados: data.usuariosRegistrados || 0
            }

            stats.value.metaMensual = data.metaMensual || 50
        }

        // Contar usuarios reales registrados por este vendedor
        const usuariosQuery = query(
            collection(db, 'users'),
            where('vendedor', '==', authStore.user.email),
            where('rol', '==', 'usuario')
        )
        const usuariosSnapshot = await getDocs(usuariosQuery)
        const usuariosRegistradosReal = usuariosSnapshot.size

        // Actualizar contador real
        stats.value.usuariosRegistrados = usuariosRegistradosReal
        vendedorInfo.value.usuariosRegistrados = usuariosRegistradosReal

        console.log(`📊 Usuarios registrados por ${authStore.user.email}: ${usuariosRegistradosReal}`)

        // Cargar usuarios registrados por este vendedor
        console.log('🔄 Iniciando carga de usuarios recientes...')
        await loadUsuariosRecientes()
        console.log('✅ Carga de usuarios recientes completada')

        // Cargar ranking del vendedor
        console.log('🏆 Cargando ranking del vendedor...')
        await loadVendorRanking()
        console.log('✅ Ranking del vendedor cargado')

    } catch (error) {
        console.error('Error cargando datos del vendedor:', error)
    } finally {
        loading.value = false
    }
}

const loadUsuariosRecientes = async () => {
    try {
        console.log('🔍 Cargando usuarios recientes para vendedor:', authStore.user.email)

        // Consulta simplificada sin orderBy para evitar problemas de índice
        const qTodos = query(
            collection(db, 'users'),
            where('vendedor', '==', authStore.user.email),
            where('rol', '==', 'usuario')
        )

        const querySnapshotTodos = await getDocs(qTodos)
        console.log(`📊 Total de usuarios encontrados para el vendedor: ${querySnapshotTodos.size}`)

        // Calcular fecha de hace 24 horas
        const hace24Horas = new Date()
        hace24Horas.setHours(hace24Horas.getHours() - 24)
        console.log('📅 Filtro de 24 horas desde:', hace24Horas.toISOString())

        const todosLosUsuarios = []
        const usuariosUltimas24h = []

        querySnapshotTodos.forEach((doc) => {
            const userData = doc.data()
            const fechaRegistro = userData.fechaRegistro?.toDate ? userData.fechaRegistro.toDate() : new Date(userData.fechaRegistro)

            todosLosUsuarios.push({
                id: doc.id,
                ...userData,
                fechaRegistroDate: fechaRegistro
            })

            // Filtrar por las últimas 24 horas
            if (fechaRegistro >= hace24Horas) {
                usuariosUltimas24h.push({
                    id: doc.id,
                    ...userData,
                    fechaRegistroDate: fechaRegistro
                })
            }
        })

        // Ordenar manualmente por fecha de registro (más reciente primero)
        todosLosUsuarios.sort((a, b) => b.fechaRegistroDate - a.fechaRegistroDate)
        usuariosUltimas24h.sort((a, b) => b.fechaRegistroDate - a.fechaRegistroDate)

        console.log(`📊 Usuarios registrados en las últimas 24 horas: ${usuariosUltimas24h.length}`)

        // Si hay usuarios en las últimas 24 horas, mostrar esos; si no, mostrar los más recientes
        if (usuariosUltimas24h.length > 0) {
            usuariosRecientes.value = usuariosUltimas24h.slice(0, 10)
            console.log('✅ Mostrando usuarios de las últimas 24 horas')
        } else if (todosLosUsuarios.length > 0) {
            usuariosRecientes.value = todosLosUsuarios.slice(0, 5)
            console.log('ℹ️ No hay usuarios en 24h, mostrando los 5 más recientes')
        } else {
            usuariosRecientes.value = []
            console.log('⚠️ No hay usuarios registrados por este vendedor')
        }

        console.log(`📋 Usuarios a mostrar: ${usuariosRecientes.value.length}`)
        usuariosRecientes.value.forEach(usuario => {
            console.log(`   - ${usuario.nombre} ${usuario.apellido} (${usuario.fechaRegistroDate.toLocaleDateString()})`)
        })

    } catch (error) {
        console.error('❌ Error cargando usuarios recientes:', error)
        console.error('Error details:', error.message)

        // En caso de error, intentar una consulta aún más simple
        try {
            console.log('🔄 Intentando consulta de respaldo...')
            const qSimple = query(
                collection(db, 'users'),
                where('vendedor', '==', authStore.user.email)
            )

            const simpleSnapshot = await getDocs(qSimple)
            const usuariosSimple = []

            simpleSnapshot.forEach((doc) => {
                const userData = doc.data()
                if (userData.rol === 'usuario') {
                    const fechaRegistro = userData.fechaRegistro?.toDate ? userData.fechaRegistro.toDate() : new Date(userData.fechaRegistro)
                    usuariosSimple.push({
                        id: doc.id,
                        ...userData,
                        fechaRegistroDate: fechaRegistro
                    })
                }
            })

            // Ordenar por fecha y tomar los más recientes
            usuariosSimple.sort((a, b) => b.fechaRegistroDate - a.fechaRegistroDate)
            usuariosRecientes.value = usuariosSimple.slice(0, 5)
            console.log(`✅ Consulta de respaldo exitosa: ${usuariosRecientes.value.length} usuarios`)

        } catch (backupError) {
            console.error('❌ Error en consulta de respaldo:', backupError)
            usuariosRecientes.value = []
        }
    }
}

const registrarUsuarioCompleto = async () => {
    try {
        submitting.value = true
        console.log('Registrando usuario completo:', completeForm.value.email)

        // Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, completeForm.value.email, completeForm.value.password)
        const uid = userCredential.user.uid
        console.log('Usuario creado en Auth:', uid)

        // Generar token público único (16+ caracteres aleatorios)
        const tokenPublico = generatePublicToken()

        // Calcular fechas para Premium
        const fechaRegistro = new Date()
        const fechaVencimientoPremiumDate = completeForm.value.esPremium ?
            new Date(fechaRegistro.getFullYear() + 1, fechaRegistro.getMonth(), fechaRegistro.getDate()) :
            null

        // Formatear RUT
        const formatRut = (rut) => {
            return rut
                .replace(/^0+|[^0-9kK]+/g, '')
                .replace(/^(\d{1,2})(\d{3})(\d{3})([kK\d])$/, '$1.$2.$3-$4')
        }

        // Crear documento en Firestore
        await setDoc(doc(db, 'users', uid), {
            email: completeForm.value.email,
            rol: 'usuario',
            nombre: completeForm.value.nombre,
            apellido: completeForm.value.apellido,
            rut: formatRut(completeForm.value.rut),
            telefono: completeForm.value.telefono,
            fechaNacimiento: completeForm.value.fechaNacimiento ? new Date(completeForm.value.fechaNacimiento) : null,
            // Datos geográficos del GeoSelector
            pais: geoData.value.pais,
            region: geoData.value.region,
            provincia: geoData.value.provincia,
            comuna: geoData.value.comuna,
            sexo: geoData.value.sexo,
            empresa: completeForm.value.empresa,

            // Token público único para QR
            tokenPublico: tokenPublico,

            // Plan y permisos
            tipoPlan: completeForm.value.esPremium ? 'premium' : 'gratuito',
            esPremium: completeForm.value.esPremium,
            fechaVencimientoPremium: fechaVencimientoPremiumDate,
            limiteTarjetas: completeForm.value.esPremium ? 5 : 1,
            accesoEstadisticas: completeForm.value.esPremium,
            personalizacionAvanzada: completeForm.value.esPremium,

            // Metadatos
            estado: 'activo',
            fechaRegistro: fechaRegistro,
            ultimoAcceso: fechaRegistro,
            vendedor: authStore.user.email,
            creadoPor: 'vendedor'
        })

        console.log('Usuario guardado en Firestore con token:', tokenPublico)
        alert('Usuario registrado exitosamente')
        closeModal()
        await refreshData()

    } catch (error) {
        console.error('Error registrando usuario:', error)
        let errorMessage = 'Error al registrar usuario'

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'El email ya está en uso'
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'La contraseña debe tener al menos 6 caracteres'
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'El email no es válido'
        }

        alert(errorMessage)
    } finally {
        submitting.value = false
    }
}

// Generar token público seguro (mínimo 16 caracteres)
const generatePublicToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = 'tkn_'
    for (let i = 0; i < 20; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
}

const closeModal = () => {
    showRegistroModal.value = false
    completeForm.value = {
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        rut: '',
        fechaNacimiento: '',
        telefono: '',
        comuna: '',
        region: '',
        empresa: '',
        esPremium: false
    }
}

const loadVendorRanking = async () => {
    try {
        const rankingInfo = await vendorRankingService.getVendorRanking(authStore.user.email, 'mes')

        // Actualizar el ranking en las estadísticas
        stats.value.ranking = rankingInfo.ranking
        stats.value.totalVendedores = rankingInfo.totalVendedores
        stats.value.porcentajeMeta = rankingInfo.porcentajeMeta

        console.log(`🏆 Ranking del vendedor: ${rankingInfo.ranking}/${rankingInfo.totalVendedores}`)

    } catch (error) {
        console.error('Error cargando ranking del vendedor:', error)
        stats.value.ranking = null
    }
}

const refreshData = async () => {
    console.log('🔄 Refrescando datos del dashboard...')
    console.log('👤 Usuario actual:', authStore.user?.email)
    await loadVendedorData()
}

const formatDate = (date) => {
    if (!date) return 'Fecha no disponible'

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

onMounted(() => {
    loadVendedorData()
})
</script>

<script>
export default {
    components: {
        GeoSelector
    }
}
</script>

<style scoped>
.seller-dashboard {
    min-height: 100vh;
    background: var(--color-background);
    padding: 2rem;
    font-family: var(--font-primary);
    animation: fadeIn var(--duration-normal) var(--easing-default);
}

/* Header */
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 2rem;
    background: var(--color-surface);
    border-radius: 1.5rem;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border);
    animation: slideUp var(--duration-normal) var(--easing-default);
}

.welcome-section h1 {
    margin: 0 0 0.5rem 0;
    color: var(--color-text);
    font-size: 2rem;
    font-weight: 600;
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.welcome-text {
    margin: 0 0 0.5rem 0;
    color: var(--color-text);
    font-size: 1.2rem;
}

.role-description {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 1rem;
}

.quick-actions {
    display: flex;
    gap: 1rem;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: var(--color-surface);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
    transition: all var(--duration-normal) var(--easing-default);
    display: flex;
    align-items: center;
    gap: 1rem;
    animation: slideUp var(--duration-normal) var(--easing-default);
    animation-delay: 0.1s;
    animation-fill-mode: both;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-turquesa);
}

.stat-icon {
    font-size: 2.5rem;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    border-radius: 50%;
    flex-shrink: 0;
}

.stat-content h3 {
    margin: 0 0 0.5rem 0;
    color: var(--color-text);
    font-size: 1rem;
    font-weight: 500;
}

.stat-number {
    margin: 0 0 0.25rem 0;
    color: var(--color-text);
    font-size: 2rem;
    font-weight: 700;
}

.stat-label {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
}

/* Estilos específicos para la tarjeta de ranking */
.ranking-card {
    position: relative;
    overflow: hidden;
}

.ranking-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ffd700, #ffed4e);
}

.loading-ranking {
    color: var(--color-text-secondary);
    font-style: italic;
    font-size: 1.5rem;
}

/* Progress Section */
.progress-section {
    background: var(--color-surface);
    border-radius: 1rem;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
    animation: slideUp var(--duration-normal) var(--easing-default);
    animation-delay: 0.2s;
    animation-fill-mode: both;
}

.progress-section h3 {
    margin: 0 0 1rem 0;
    color: var(--color-text);
    font-size: 1.5rem;
}

.progress-bar {
    width: 100%;
    height: 20px;
    background: var(--color-surface-variant);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 1rem;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    border-radius: 10px;
    transition: width var(--duration-slow) var(--easing-default);
    position: relative;
}

.progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

.progress-text {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 1rem;
}

.success-text {
    color: var(--color-success);
    font-weight: 600;
}

/* Recent Users */
.recent-users {
    background: var(--color-surface);
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
    animation: slideUp var(--duration-normal) var(--easing-default);
    animation-delay: 0.3s;
    animation-fill-mode: both;
}

.recent-users h3 {
    margin: 0 0 1.5rem 0;
    color: var(--color-text);
    font-size: 1.5rem;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--color-text-secondary);
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

/* Estilos para tarjetas modernas de usuarios recientes */
.users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
}

.user-card-modern {
    background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
    border: 1px solid #333;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    position: relative;
}

.user-card-modern:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 204, 204, 0.2);
    border-color: #00cccc;
}

.user-card-modern::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #00cccc, #1c94e0);
}

.user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    flex-shrink: 0;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1.2rem;
}

.user-info {
    flex: 1;
}

.user-info h4 {
    margin: 0 0 0.25rem 0;
    color: var(--color-text);
    font-size: 1.1rem;
}

.user-email,
.user-date {
    margin: 0.25rem 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
}

.user-status {
    flex-shrink: 0;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
}

.status-badge.active {
    background: var(--color-success);
    color: white;
}

/* Estilos adicionales para tarjetas modernas */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
}

.user-avatar-modern {
    position: relative;
}

.avatar-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00cccc, #1c94e0);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1.3rem;
    box-shadow: 0 4px 15px rgba(0, 204, 204, 0.3);
    border: 3px solid #333;
}

.status-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #1a1a1a;
}

.status-indicator.activo {
    background: #10b981;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.card-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.action-btn:hover {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.2);
}

.action-btn.whatsapp:hover {
    background: #25d366;
    box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
}

.action-btn.details:hover {
    background: #1c94e0;
    box-shadow: 0 4px 15px rgba(28, 148, 224, 0.3);
}

.card-body {
    padding: 0 1.5rem 1rem 1.5rem;
}

.user-name {
    margin: 0 0 0.5rem 0;
    color: #fff;
    font-size: 1.2rem;
    font-weight: 600;
}

.user-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-icon {
    font-size: 0.9rem;
    opacity: 0.8;
}

.detail-text {
    color: #e5e7eb;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
}

.date-info {
    text-align: right;
}

.date-label {
    display: block;
    color: #9ca3af;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
}

.date-value {
    color: #00cccc;
    font-size: 0.9rem;
    font-weight: 600;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn var(--duration-normal) var(--easing-default);
}

.modal-content {
    background: var(--color-surface);
    border-radius: 1rem;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: scaleIn var(--duration-normal) var(--easing-default);
}

.modal-content.large {
    max-width: 800px;
    width: 95%;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
    margin: 0;
    color: var(--color-text);
    font-size: 1.5rem;
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

.modal-description {
    color: var(--color-text-secondary);
    margin-bottom: 1.5rem;
}

.complete-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-section {
    background: var(--color-surface-variant);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
}

.form-section h4 {
    margin: 0 0 1rem 0;
    color: var(--color-text);
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.geo-section {
    grid-column: 1 / -1;
    margin: 1.5rem 0;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #00cccc;
}

.geo-section h4 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
    font-size: 1.1rem;
    font-weight: 600;
}

/* Estilos para la sección de listado de usuarios */
.users-list-section {
    margin-top: 2rem;
    background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
    border: 1px solid #333;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
}

.section-header {
    margin-bottom: 2rem;
    text-align: center;
}

.section-header h2 {
    color: #fff;
    margin-bottom: 0.5rem;
    font-size: 1.8rem;
}

.section-description {
    color: #9ca3af;
    font-size: 1rem;
}

.search-filters {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #333;
    border-radius: 8px;
}

.search-box {
    flex: 1;
}

.search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #333;
    border-radius: 8px;
    font-size: 1rem;
    background: #1a1a1a;
    color: #fff;
    transition: border-color 0.3s ease;
}

.search-input::placeholder {
    color: #9ca3af;
}

.search-input:focus {
    outline: none;
    border-color: #00cccc;
    box-shadow: 0 0 0 3px rgba(0, 204, 204, 0.1);
}

.filter-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #333;
    background: #1a1a1a;
    color: #fff;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
}

.filter-btn:hover {
    border-color: #00cccc;
    background: rgba(0, 204, 204, 0.1);
}

.filter-btn.active {
    background: #00cccc;
    border-color: #00cccc;
    color: white;
}

.users-table-container {
    min-height: 300px;
}

.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
}

.loading-state p {
    color: #9ca3af;
    margin-top: 1rem;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #333;
    border-top: 4px solid #00cccc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-state h3 {
    color: #9ca3af;
    margin-bottom: 0.5rem;
}

.empty-state p {
    color: #6c757d;
}

.users-table {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid #333;
    background: #1a1a1a;
}

.users-table table {
    width: 100%;
    border-collapse: collapse;
    background: #1a1a1a;
}

.users-table th {
    background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #00cccc;
    border-bottom: 2px solid #333;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.9rem;
}

.users-table td {
    padding: 1rem;
    border-bottom: 1px solid #333;
    vertical-align: middle;
    color: #e5e7eb;
}

.user-row:hover {
    background: rgba(0, 204, 204, 0.1);
    border-left: 3px solid #00cccc;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00cccc, #1c94e0);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 0.9rem;
    border: 2px solid #333;
}

.user-details strong {
    display: block;
    color: #fff;
    margin-bottom: 0.25rem;
    font-weight: 600;
}

.user-status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
}

.user-status.activo {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    border: 1px solid #10b981;
}

.location-info div {
    font-weight: 500;
    color: #fff;
}

.location-info small {
    color: #9ca3af;
}

.plan-badge {
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
}

.plan-badge.premium {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #8b5a00;
    box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
}

.plan-badge.free {
    background: rgba(156, 163, 175, 0.2);
    color: #9ca3af;
    border: 1px solid rgba(156, 163, 175, 0.3);
}

.date-info div {
    font-weight: 500;
    color: #fff;
}

.date-info small {
    color: #9ca3af;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-action {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.btn-action.view {
    background: rgba(28, 148, 224, 0.2);
    color: #1c94e0;
    border: 1px solid rgba(28, 148, 224, 0.3);
}

.btn-action.view:hover {
    background: #1c94e0;
    color: white;
    box-shadow: 0 4px 15px rgba(28, 148, 224, 0.3);
}

.btn-action.contact {
    background: rgba(37, 211, 102, 0.2);
    color: #25d366;
    border: 1px solid rgba(37, 211, 102, 0.3);
}

.btn-action.contact:hover {
    background: #25d366;
    color: white;
    box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
}

.list-summary {
    margin-top: 1.5rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #333;
    border-radius: 6px;
    text-align: center;
    color: #9ca3af;
    font-size: 0.9rem;
}

.btn-outline {
    background: transparent;
    border: 2px solid #00cccc;
    color: #00cccc;
}

.btn-outline:hover {
    background: #00cccc;
    color: white;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Responsive */
@media (min-width: 768px) {
    .search-filters {
        flex-direction: row;
        align-items: center;
    }

    .search-box {
        flex: 2;
    }

    .filter-buttons {
        flex: 1;
        justify-content: flex-end;
    }
}

/* Premium Section */
.premium-section {
    background: linear-gradient(135deg, rgba(0, 204, 204, 0.1), rgba(28, 148, 224, 0.1));
    border: 2px solid var(--color-turquesa);
}

.premium-option {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.checkbox-label.premium {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    cursor: pointer;
    padding: 1rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
    transition: all var(--duration-normal) var(--easing-default);
}

.checkbox-label.premium:hover {
    border-color: var(--color-turquesa);
    box-shadow: var(--shadow-md);
}

.checkbox-label.premium input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: var(--color-turquesa);
    margin: 0;
}

.premium-info {
    flex: 1;
}

.premium-info strong {
    color: var(--color-text);
    font-size: 1.1rem;
    display: block;
    margin-bottom: 0.25rem;
}

.premium-info p {
    color: var(--color-text-secondary);
    margin: 0;
    font-size: 0.9rem;
}

.premium-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    padding: 1rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-turquesa);
    animation: slideUp var(--duration-normal) var(--easing-default);
}

.premium-benefits h5 {
    margin: 0 0 0.75rem 0;
    color: var(--color-text);
    font-size: 1rem;
    font-weight: 600;
}

.premium-benefits ul {
    margin: 0;
    padding-left: 1.25rem;
    color: var(--color-text-secondary);
}

.premium-benefits li {
    margin: 0.5rem 0;
    line-height: 1.4;
}

.premium-validity {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.premium-validity p {
    margin: 0.25rem 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
}

.premium-validity strong {
    color: var(--color-text);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    color: var(--color-text);
    font-weight: 500;
    font-size: 0.95rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
}

/* Responsive */
@media (max-width: 768px) {
    .seller-dashboard {
        padding: 1rem;
    }

    .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .quick-actions {
        flex-direction: column;
        width: 100%;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .users-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .user-card-modern .user-details-grid {
        grid-template-columns: 1fr;
    }

    .user-card-modern .card-footer {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .user-card {
        flex-direction: column;
        text-align: center;
    }

    .form-actions {
        flex-direction: column;
    }

    .modal-content.large {
        max-width: 95%;
        padding: 1.5rem;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .premium-details {
        grid-template-columns: 1fr;
    }

    .form-section {
        padding: 1rem;
    }
}

/* Animaciones adicionales */
.stat-card:nth-child(1) {
    animation-delay: 0.1s;
}

.stat-card:nth-child(2) {
    animation-delay: 0.2s;
}

.stat-card:nth-child(3) {
    animation-delay: 0.3s;
}

.stat-card:nth-child(4) {
    animation-delay: 0.4s;
}
</style>
