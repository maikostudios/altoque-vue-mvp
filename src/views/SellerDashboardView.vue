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
                    ➕ Registrar Usuario
                </button>
                <button @click="refreshData" class="btn btn-secondary" :disabled="loading">
                    🔄 Actualizar
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

            <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-content">
                    <h3>Ranking</h3>
                    <p class="stat-number">#{{ stats.ranking || 'N/A' }}</p>
                    <span class="stat-label">Este mes</span>
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
                <div v-for="usuario in usuariosRecientes" :key="usuario.id" class="user-card">
                    <div class="user-avatar">
                        <div class="avatar-placeholder">
                            {{ usuario.nombre?.charAt(0) || '?' }}
                        </div>
                    </div>
                    <div class="user-info">
                        <h4>{{ usuario.nombre }} {{ usuario.apellido }}</h4>
                        <p class="user-email">{{ usuario.email }}</p>
                        <p class="user-date">{{ formatDate(usuario.fechaRegistro) }}</p>
                    </div>
                    <div class="user-status">
                        <span class="status-badge active">Activo</span>
                    </div>
                </div>
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
                            <div class="form-group">
                                <label>Comuna *</label>
                                <input v-model="completeForm.comuna" type="text" class="input" required
                                    placeholder="Comuna de residencia">
                            </div>
                            <div class="form-group">
                                <label>Región *</label>
                                <input v-model="completeForm.region" type="text" class="input" required
                                    placeholder="Región">
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

// Formulario de registro completo
const completeForm = ref({
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

// Funciones
const loadVendedorData = async () => {
    try {
        loading.value = true

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
            stats.value.usuariosRegistrados = data.usuariosRegistrados || 0
        }

        // Cargar usuarios registrados por este vendedor
        await loadUsuariosRecientes()

    } catch (error) {
        console.error('Error cargando datos del vendedor:', error)
    } finally {
        loading.value = false
    }
}

const loadUsuariosRecientes = async () => {
    try {
        const q = query(
            collection(db, 'users'),
            where('vendedor', '==', authStore.user.email),
            where('role', '==', 'usuario'),
            orderBy('fechaRegistro', 'desc'),
            limit(5)
        )

        const querySnapshot = await getDocs(q)
        usuariosRecientes.value = []

        querySnapshot.forEach((doc) => {
            usuariosRecientes.value.push({
                id: doc.id,
                ...doc.data()
            })
        })

        // Actualizar contador
        stats.value.usuariosRegistrados = usuariosRecientes.value.length

    } catch (error) {
        console.error('Error cargando usuarios recientes:', error)
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
            role: 'usuario',
            nombre: completeForm.value.nombre,
            apellido: completeForm.value.apellido,
            rut: formatRut(completeForm.value.rut),
            telefono: completeForm.value.telefono,
            fechaNacimiento: completeForm.value.fechaNacimiento ? new Date(completeForm.value.fechaNacimiento) : null,
            comuna: completeForm.value.comuna,
            region: completeForm.value.region,
            empresa: completeForm.value.empresa,

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

        console.log('Usuario guardado en Firestore')
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

const refreshData = async () => {
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

.users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.user-card {
    background: var(--color-surface-variant);
    border-radius: 1rem;
    padding: 1rem;
    border: 1px solid var(--color-border);
    transition: all var(--duration-normal) var(--easing-default);
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-turquesa);
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
