<template>
    <div class="seller-management">
        <div class="header-section">
            <h2>🧑‍💼 Gestión de Vendedores</h2>
            <p class="subtitle">Registra y administra vendedores del sistema</p>
        </div>

        <!-- Tabs para alternar entre registro y lista -->
        <div class="tabs-container">
            <div class="tabs">
                <button @click="activeTab = 'register'" :class="['tab-btn', { active: activeTab === 'register' }]">
                    ➕ Registrar Vendedor
                </button>
                <button @click="activeTab = 'list'" :class="['tab-btn', { active: activeTab === 'list' }]">
                    📋 Lista de Vendedores
                </button>
            </div>
        </div>

        <!-- Formulario de Registro -->
        <div v-if="activeTab === 'register'" class="form-container">
            <form @submit.prevent="registrarVendedor" class="seller-form">
                <div class="form-header">
                    <h3>➕ Registrar Nuevo Vendedor</h3>
                    <p class="form-description">Complete todos los campos para crear un vendedor</p>
                </div>

                <!-- Información Personal -->
                <div class="form-section">
                    <h4>👤 Información Personal</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Email *</label>
                            <input v-model="form.email" type="email" class="input" required autocomplete="email"
                                placeholder="vendedor@ejemplo.com">
                        </div>

                        <div class="form-group">
                            <label>Contraseña *</label>
                            <input v-model="form.password" type="password" class="input" required
                                autocomplete="new-password" minlength="6" placeholder="Mínimo 6 caracteres">
                        </div>

                        <div class="form-group">
                            <label>Nombre *</label>
                            <input v-model="form.nombre" type="text" class="input" required placeholder="Nombre">
                        </div>

                        <div class="form-group">
                            <label>Apellido *</label>
                            <input v-model="form.apellido" type="text" class="input" required placeholder="Apellido">
                        </div>

                        <div class="form-group">
                            <label>RUT *</label>
                            <input v-model="form.rut" type="text" class="input" required placeholder="12345678-9">
                        </div>

                        <div class="form-group">
                            <label>Fecha de Nacimiento</label>
                            <input v-model="form.fechaNacimiento" type="date" class="input">
                        </div>
                    </div>
                </div>

                <!-- Información de Contacto -->
                <div class="form-section">
                    <h4>📞 Información de Contacto</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Teléfono *</label>
                            <input v-model="form.telefono" type="tel" class="input" required placeholder="+56912345678">
                        </div>

                        <div class="form-group">
                            <label>Comuna *</label>
                            <input v-model="form.comuna" type="text" class="input" required
                                placeholder="Comuna de residencia">
                        </div>

                        <div class="form-group">
                            <label>Región *</label>
                            <input v-model="form.region" type="text" class="input" required placeholder="Región">
                        </div>

                        <div class="form-group full-width">
                            <label>Dirección Completa *</label>
                            <input v-model="form.direccion" type="text" class="input" required
                                placeholder="Calle, número, comuna, región">
                        </div>
                    </div>
                </div>

                <!-- Información Laboral -->
                <div class="form-section">
                    <h4>💼 Información Laboral</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Fecha de Inicio de Trabajo *</label>
                            <input v-model="form.fechaInicioTrabajo" type="date" class="input" required>
                        </div>

                        <div class="form-group">
                            <label>Meta Mensual (usuarios)</label>
                            <input v-model="form.metaMensual" type="number" class="input" min="1" placeholder="50">
                        </div>

                        <div class="form-group">
                            <label>Empresa/Sucursal</label>
                            <input v-model="form.empresa" type="text" class="input" placeholder="Sucursal o empresa">
                        </div>

                        <div class="form-group">
                            <label>Supervisor</label>
                            <input v-model="form.supervisor" type="text" class="input"
                                placeholder="Nombre del supervisor">
                        </div>
                    </div>
                </div>

                <!-- Confirmación de Rol -->
                <div class="form-section">
                    <h4>🔐 Confirmación de Rol</h4>
                    <div class="role-confirmation">
                        <label class="checkbox-label">
                            <input v-model="form.confirmarRolVendedor" type="checkbox" required>
                            <span class="checkmark"></span>
                            Confirmo que este usuario tendrá rol de <strong>VENDEDOR</strong>
                        </label>
                        <p class="role-description">
                            Los vendedores podrán registrar usuarios finales y ver sus propias métricas de ventas.
                        </p>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary" :disabled="submitting">
                        {{ submitting ? '⏳ Registrando...' : '✅ Registrar Vendedor' }}
                    </button>
                    <button type="button" @click="limpiarFormulario" class="btn btn-secondary">
                        🔄 Limpiar
                    </button>
                </div>
            </form>
        </div>

        <!-- Lista de Vendedores -->
        <div v-if="activeTab === 'list'" class="list-container">
            <div class="list-header">
                <h3>📋 Vendedores Registrados</h3>
                <div class="list-stats">
                    <span class="stat-item">Total: {{ vendedores.length }}</span>
                    <span class="stat-item">Activos: {{ vendedoresActivos }}</span>
                </div>
            </div>

            <!-- Loading state -->
            <div v-if="loadingVendedores" class="loading-state">
                <div class="spinner"></div>
                <p>Cargando vendedores...</p>
            </div>

            <!-- Vendedores Grid -->
            <div v-else class="vendedores-grid">
                <div v-for="vendedor in vendedores" :key="vendedor.id" class="vendedor-card">
                    <div class="vendedor-avatar">
                        <div class="avatar-placeholder">
                            {{ vendedor.nombre?.charAt(0) || '?' }}{{ vendedor.apellido?.charAt(0) || '' }}
                        </div>
                    </div>
                    <div class="vendedor-info">
                        <h4>{{ vendedor.nombre }} {{ vendedor.apellido }}</h4>
                        <p class="vendedor-email">{{ vendedor.email }}</p>
                        <p class="vendedor-telefono">📞 {{ vendedor.telefono }}</p>
                        <p class="vendedor-ubicacion">📍 {{ vendedor.comuna }}, {{ vendedor.region }}</p>
                        <div class="vendedor-stats">
                            <span class="stat">Meta: {{ vendedor.metaMensual || 0 }}</span>
                            <span class="stat">Registrados: {{ vendedor.usuariosRegistrados || 0 }}</span>
                        </div>
                        <span class="role-badge vendedor">{{ vendedor.role }}</span>
                    </div>
                    <div class="vendedor-actions">
                        <button @click="editarVendedor(vendedor)" class="btn-icon edit">✏️</button>
                        <button @click="verDetalles(vendedor)" class="btn-icon view">👁️</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Información adicional -->
        <div class="info-section">
            <div class="info-card">
                <h4>ℹ️ Información sobre Vendedores</h4>
                <ul>
                    <li>Los vendedores pueden registrar usuarios finales desde su panel</li>
                    <li>Tienen acceso a sus propias métricas y estadísticas</li>
                    <li>No pueden ver información de otros vendedores</li>
                    <li>Pueden gestionar sus propias metas mensuales</li>
                    <li>Reciben notificaciones sobre su progreso</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { auth, db } from '@/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc, doc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const submitting = ref(false)
const loadingVendedores = ref(false)
const activeTab = ref('register')
const vendedores = ref([])

// Formulario para vendedor
const form = ref({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rut: '',
    fechaNacimiento: '',
    telefono: '',
    comuna: '',
    region: '',
    direccion: '',
    fechaInicioTrabajo: '',
    metaMensual: 50,
    empresa: '',
    supervisor: '',
    confirmarRolVendedor: false
})

// Computed
const vendedoresActivos = computed(() => {
    return vendedores.value.filter(v => v.estado === 'activo').length
})

// Funciones
const limpiarFormulario = () => {
    form.value = {
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        rut: '',
        fechaNacimiento: '',
        telefono: '',
        comuna: '',
        region: '',
        direccion: '',
        fechaInicioTrabajo: '',
        metaMensual: 50,
        empresa: '',
        supervisor: '',
        confirmarRolVendedor: false
    }
}

const formatRut = (rut) => {
    return rut
        .replace(/^0+|[^0-9kK]+/g, '')
        .replace(/^(\d{1,2})(\d{3})(\d{3})([kK\d])$/, '$1.$2.$3-$4')
}

const registrarVendedor = async () => {
    try {
        submitting.value = true
        console.log('Registrando vendedor:', form.value.email)

        // Crear usuario en Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, form.value.email, form.value.password)
        const uid = cred.user.uid
        console.log('Vendedor creado en Auth:', uid)

        // Crear documento en Firestore
        await setDoc(doc(db, 'users', uid), {
            email: form.value.email,
            rol: 'vendedor',
            nombre: form.value.nombre,
            apellido: form.value.apellido,
            rut: formatRut(form.value.rut),
            telefono: form.value.telefono,
            fechaNacimiento: form.value.fechaNacimiento ? new Date(form.value.fechaNacimiento) : null,
            comuna: form.value.comuna,
            region: form.value.region,
            direccion: form.value.direccion,
            fechaInicioTrabajo: form.value.fechaInicioTrabajo ? new Date(form.value.fechaInicioTrabajo) : null,
            metaMensual: parseInt(form.value.metaMensual) || 50,
            empresa: form.value.empresa,
            supervisor: form.value.supervisor,
            usuariosRegistrados: 0,
            estado: 'activo',
            fechaRegistro: serverTimestamp(),
            ultimoAcceso: serverTimestamp(),
            creadoPor: authStore.user?.email || 'admin'
        })

        console.log('Vendedor guardado en Firestore')
        alert('Vendedor registrado correctamente')

        // Limpiar formulario y recargar lista
        limpiarFormulario()
        if (activeTab.value === 'list') {
            await cargarVendedores()
        }

    } catch (error) {
        console.error('Error al registrar vendedor:', error)
        let errorMessage = 'Error al registrar vendedor'

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'El email ya está en uso'
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'La contraseña debe tener al menos 6 caracteres'
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'El email no es válido'
        }

        alert(errorMessage + ': ' + error.message)
    } finally {
        submitting.value = false
    }
}

const cargarVendedores = async () => {
    try {
        loadingVendedores.value = true
        const q = query(collection(db, 'users'), where('rol', '==', 'vendedor'))
        const querySnapshot = await getDocs(q)

        vendedores.value = []
        querySnapshot.forEach((doc) => {
            vendedores.value.push({
                id: doc.id,
                ...doc.data()
            })
        })

        console.log('Vendedores cargados:', vendedores.value.length)
    } catch (error) {
        console.error('Error cargando vendedores:', error)
    } finally {
        loadingVendedores.value = false
    }
}

const editarVendedor = (vendedor) => {
    console.log('Editar vendedor:', vendedor)
    // TODO: Implementar edición
}

const verDetalles = (vendedor) => {
    console.log('Ver detalles:', vendedor)
    // TODO: Implementar vista de detalles
}

// Cargar vendedores cuando se monta el componente o se cambia a la pestaña de lista
onMounted(() => {
    if (activeTab.value === 'list') {
        cargarVendedores()
    }
})

// Watch para cargar vendedores cuando se cambia a la pestaña de lista
watch(activeTab, (newTab) => {
    if (newTab === 'list') {
        cargarVendedores()
    }
})
</script>

<style scoped>
.seller-management {
    padding: 2rem;
    animation: fadeIn var(--duration-normal) var(--easing-default);
}

.header-section {
    margin-bottom: 2rem;
    text-align: center;
}

.header-section h2 {
    margin: 0 0 0.5rem 0;
    color: var(--color-text);
    font-size: 2rem;
    font-weight: 600;
}

.subtitle {
    color: var(--color-text-secondary);
    font-size: 1.1rem;
    margin: 0;
}

/* Tabs */
.tabs-container {
    margin-bottom: 2rem;
}

.tabs {
    display: flex;
    justify-content: center;
    gap: 1rem;
    background: var(--color-surface);
    padding: 0.5rem;
    border-radius: 1rem;
    border: 1px solid var(--color-border);
    max-width: 500px;
    margin: 0 auto;
}

.tab-btn {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.75rem;
    background: transparent;
    color: var(--color-text-secondary);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--duration-normal) var(--easing-default);
}

.tab-btn.active {
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    color: white;
    box-shadow: var(--shadow-md);
}

.tab-btn:hover:not(.active) {
    background: var(--color-surface-variant);
    color: var(--color-text);
}

/* Form Container */
.form-container,
.list-container {
    max-width: 900px;
    margin: 0 auto;
}

.seller-form {
    background: var(--color-surface);
    border-radius: 1.5rem;
    padding: 2rem;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border);
    animation: slideUp var(--duration-normal) var(--easing-default);
}

.form-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
    text-align: center;
}

.form-header h3 {
    margin: 0 0 0.5rem 0;
    color: var(--color-text);
    font-size: 1.5rem;
    font-weight: 600;
}

.form-description {
    color: var(--color-text-secondary);
    margin: 0;
}

/* Form Sections */
.form-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--color-surface-variant);
    border-radius: 1rem;
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

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-group label {
    color: var(--color-text);
    font-weight: 500;
    font-size: 0.95rem;
    font-family: var(--font-secondary);
}

/* Role Confirmation */
.role-confirmation {
    text-align: center;
    padding: 1.5rem;
    background: var(--color-surface);
    border-radius: 1rem;
    border: 2px solid var(--color-turquesa);
}

.checkbox-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: 0.5rem;
}

.checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: var(--color-turquesa);
}

.role-description {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    margin: 0;
    font-style: italic;
}

/* Form Actions */
.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
}

/* List Styles */
.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--color-surface);
    border-radius: 1rem;
    border: 1px solid var(--color-border);
}

.list-header h3 {
    margin: 0;
    color: var(--color-text);
    font-size: 1.5rem;
}

.list-stats {
    display: flex;
    gap: 1rem;
}

.stat-item {
    padding: 0.5rem 1rem;
    background: var(--color-surface-variant);
    border-radius: 0.5rem;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
}

/* Vendedores Grid */
.vendedores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
}

.vendedor-card {
    background: var(--color-surface);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
    transition: all var(--duration-normal) var(--easing-default);
    display: flex;
    gap: 1rem;
    animation: slideUp var(--duration-normal) var(--easing-default);
}

.vendedor-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-turquesa);
}

.vendedor-avatar {
    width: 60px;
    height: 60px;
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
    font-size: 1.1rem;
}

.vendedor-info {
    flex: 1;
}

.vendedor-info h4 {
    margin: 0 0 0.5rem 0;
    color: var(--color-text);
    font-size: 1.2rem;
}

.vendedor-email,
.vendedor-telefono,
.vendedor-ubicacion {
    margin: 0.25rem 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
}

.vendedor-stats {
    display: flex;
    gap: 1rem;
    margin: 0.5rem 0;
}

.stat {
    padding: 0.25rem 0.5rem;
    background: var(--color-surface-variant);
    border-radius: 0.5rem;
    font-size: 0.8rem;
    color: var(--color-text-secondary);
}

.vendedor-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.btn-icon {
    width: 35px;
    height: 35px;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all var(--duration-normal) var(--easing-default);
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-icon.edit {
    background: var(--color-azul);
}

.btn-icon.view {
    background: var(--color-turquesa);
}

.btn-icon:hover {
    transform: scale(1.1);
}

/* Loading State */
.loading-state {
    text-align: center;
    padding: 3rem;
    background: var(--color-surface);
    border-radius: 1rem;
    margin: 2rem 0;
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

/* Info Section */
.info-section {
    max-width: 600px;
    margin: 2rem auto 0;
}

.info-card {
    background: var(--color-surface-variant);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
    animation: slideUp var(--duration-normal) var(--easing-default);
    animation-delay: 0.3s;
    animation-fill-mode: both;
}

.info-card h4 {
    margin: 0 0 1rem 0;
    color: var(--color-text);
    font-size: 1.2rem;
}

.info-card ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--color-text-secondary);
}

.info-card li {
    margin: 0.5rem 0;
    line-height: 1.5;
}

/* Role Badge */
.role-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
}

.role-badge.vendedor {
    background: linear-gradient(135deg, #4834d4, #686de0);
    color: white;
}

/* Responsive */
@media (max-width: 768px) {
    .seller-management {
        padding: 1rem;
    }

    .tabs {
        flex-direction: column;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .form-actions {
        flex-direction: column;
    }

    .seller-form {
        padding: 1.5rem;
    }

    .vendedores-grid {
        grid-template-columns: 1fr;
    }

    .vendedor-card {
        flex-direction: column;
        text-align: center;
    }

    .list-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
}
</style>
