<template>
    <div class="user-management">
        <div class="header-section">
            <h2>👥 Gestión de Usuarios</h2>
            <p class="subtitle">Registra nuevos usuarios en el sistema</p>
        </div>

        <div class="form-container">
            <form @submit.prevent="registrarUsuario" class="user-form">
                <div class="form-header">
                    <h3>➕ Registrar Nuevo Usuario</h3>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Email *</label>
                        <input v-model="form.email" type="email" class="input" required autocomplete="email"
                            placeholder="usuario@ejemplo.com">
                    </div>

                    <div class="form-group">
                        <label>Contraseña *</label>
                        <input v-model="form.password" type="password" class="input" required
                            autocomplete="new-password" minlength="6" placeholder="Mínimo 6 caracteres">
                    </div>

                    <div class="form-group">
                        <label>RUT *</label>
                        <input v-model="form.rut" type="text" class="input" required placeholder="12345678-9">
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
                        <label>Fecha de Nacimiento</label>
                        <input v-model="form.fechaNacimiento" type="date" class="input">
                    </div>

                    <div class="form-group">
                        <label>Comuna</label>
                        <input v-model="form.comuna" type="text" class="input" placeholder="Comuna de residencia">
                    </div>

                    <div class="form-group">
                        <label>Región *</label>
                        <input v-model="form.region" type="text" class="input" required placeholder="Región">
                    </div>

                    <div class="form-group">
                        <label>Teléfono</label>
                        <input v-model="form.telefono" type="tel" class="input" placeholder="+56912345678">
                    </div>

                    <div class="form-group full-width">
                        <label>Empresa</label>
                        <input v-model="form.empresa" type="text" class="input" placeholder="Empresa o organización">
                    </div>
                </div>

                <!-- Plan Premium -->
                <div class="premium-section">
                    <h4>⭐ Plan Premium</h4>
                    <div class="premium-option">
                        <label class="checkbox-label premium">
                            <input v-model="form.esPremium" type="checkbox">
                            <span class="checkmark"></span>
                            <div class="premium-info">
                                <strong>Usuario Premium</strong>
                                <p>Acceso a funciones avanzadas por 1 año</p>
                            </div>
                        </label>

                        <div v-if="form.esPremium" class="premium-details">
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
                    <button type="submit" class="btn btn-primary" :disabled="submitting">
                        {{ submitting ? '⏳ Registrando...' : '✅ Registrar Usuario' }}
                    </button>
                    <button type="button" @click="limpiarFormulario" class="btn btn-secondary">
                        🔄 Limpiar
                    </button>
                </div>
            </form>
        </div>

        <!-- Información adicional -->
        <div class="info-section">
            <div class="info-card">
                <h4>ℹ️ Información</h4>
                <ul>
                    <li>Los usuarios creados tendrán rol de "usuario" por defecto</li>
                    <li>Recibirán acceso a su panel personal</li>
                    <li>Podrán crear tarjetas bancarias con QR</li>
                    <li>El email debe ser único en el sistema</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { auth, db } from '@/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const submitting = ref(false)

// Computed para fecha de vencimiento Premium
const fechaVencimientoPremium = computed(() => {
    const fechaVencimiento = new Date()
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1)
    return fechaVencimiento.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
})

const form = ref({
    email: '',
    password: '',
    rut: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    comuna: '',
    region: '',
    telefono: '',
    empresa: '',
    esPremium: false
})

const limpiarFormulario = () => {
    form.value = {
        email: '',
        password: '',
        rut: '',
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        comuna: '',
        region: '',
        telefono: '',
        empresa: '',
        esPremium: false
    }
}

function formatRut(rut) {
    return rut
        .replace(/^0+|[^0-9kK]+/g, '')
        .replace(/^(\d{1,2})(\d{3})(\d{3})([kK\d])$/, '$1.$2.$3-$4')
}

const registrarUsuario = async () => {
    try {
        submitting.value = true
        console.log('Intentando registrar usuario:', form.value.email)

        // Crear usuario en Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, form.value.email, form.value.password)
        const uid = cred.user.uid
        console.log('Usuario creado en Auth:', uid)

        // Calcular fechas para Premium
        const fechaRegistro = new Date()
        const fechaVencimientoPremiumDate = form.value.esPremium ?
            new Date(fechaRegistro.getFullYear() + 1, fechaRegistro.getMonth(), fechaRegistro.getDate()) :
            null

        // Crear documento en la colección 'users' (no 'usuarios')
        await setDoc(doc(db, 'users', uid), {
            email: form.value.email,
            rut: formatRut(form.value.rut),
            nombre: form.value.nombre,
            apellido: form.value.apellido,
            telefono: form.value.telefono,
            fechaNacimiento: form.value.fechaNacimiento ? new Date(form.value.fechaNacimiento) : null,
            comuna: form.value.comuna,
            region: form.value.region,
            empresa: form.value.empresa,
            role: 'usuario', // Usar 'role' en lugar de 'rol'

            // Plan y permisos
            tipoPlan: form.value.esPremium ? 'premium' : 'gratuito',
            esPremium: form.value.esPremium,
            fechaVencimientoPremium: fechaVencimientoPremiumDate,
            limiteTarjetas: form.value.esPremium ? 5 : 1,
            accesoEstadisticas: form.value.esPremium,
            personalizacionAvanzada: form.value.esPremium,

            // Metadatos
            estado: 'activo',
            fechaRegistro: serverTimestamp(),
            ultimoAcceso: serverTimestamp(),
            vendedor: authStore.user?.email || 'admin',
            creadoPor: 'admin'
        })

        console.log('Usuario guardado en Firestore')
        alert('Usuario registrado correctamente')

        // Limpiar formulario
        limpiarFormulario()
    } catch (e) {
        console.error('Error completo:', e)
        let errorMessage = 'Error al registrar usuario'

        if (e.code === 'auth/email-already-in-use') {
            errorMessage = 'El email ya está en uso. Usa otro email.'
        } else if (e.code === 'auth/weak-password') {
            errorMessage = 'La contraseña debe tener al menos 6 caracteres'
        } else if (e.code === 'auth/invalid-email') {
            errorMessage = 'El email no es válido'
        }

        alert(errorMessage + ': ' + e.message)
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.user-management {
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

.form-container {
    max-width: 800px;
    margin: 0 auto 2rem;
}

.user-form {
    background: var(--color-surface);
    border-radius: 1.5rem;
    padding: 2rem;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border);
}

.form-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
}

.form-header h3 {
    margin: 0;
    color: var(--color-text);
    font-size: 1.5rem;
    font-weight: 600;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
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

/* Premium Section */
.premium-section {
    background: linear-gradient(135deg, rgba(0, 204, 204, 0.1), rgba(28, 148, 224, 0.1));
    border: 2px solid var(--color-turquesa);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.premium-section h4 {
    margin: 0 0 1rem 0;
    color: var(--color-text);
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
}

.info-section {
    max-width: 600px;
    margin: 0 auto;
}

.info-card {
    background: var(--color-surface-variant);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
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

/* Responsive */
@media (max-width: 768px) {
    .user-management {
        padding: 1rem;
    }

    .form-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .user-form {
        padding: 1.5rem;
    }

    .premium-details {
        grid-template-columns: 1fr;
    }

    .premium-section {
        padding: 1rem;
    }
}

/* Animaciones */
.user-form {
    animation: slideUp var(--duration-normal) var(--easing-default);
}

.info-card {
    animation: slideUp var(--duration-normal) var(--easing-default);
    animation-delay: 0.2s;
    animation-fill-mode: both;
}
</style>