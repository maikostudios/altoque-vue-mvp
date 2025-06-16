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
import { ref } from 'vue'
import { auth, db } from '@/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const submitting = ref(false)

const form = ref({
    email: '',
    password: '',
    rut: '',
    nombre: '',
    fechaNacimiento: '',
    comuna: '',
    empresa: ''
})

const limpiarFormulario = () => {
    form.value = {
        email: '',
        password: '',
        rut: '',
        nombre: '',
        fechaNacimiento: '',
        comuna: '',
        empresa: ''
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

        // Crear documento en la colección 'users' (no 'usuarios')
        await setDoc(doc(db, 'users', uid), {
            email: form.value.email,
            rut: formatRut(form.value.rut),
            nombre: form.value.nombre,
            apellido: '', // Campo faltante
            telefono: '', // Campo faltante
            fechaNacimiento: form.value.fechaNacimiento ? new Date(form.value.fechaNacimiento) : null,
            comuna: form.value.comuna,
            region: '', // Campo faltante
            empresa: form.value.empresa,
            role: 'usuario', // Usar 'role' en lugar de 'rol'
            estado: 'activo',
            vendedor: authStore.user?.email || 'admin',
            fechaRegistro: serverTimestamp(),
            ultimoAcceso: serverTimestamp(),
            creadoPor: 'admin'
        })

        console.log('Usuario guardado en Firestore')
        alert('Usuario registrado correctamente')

        // Limpiar formulario
        form.value = {
            email: '',
            password: '',
            rut: '',
            nombre: '',
            fechaNacimiento: '',
            comuna: '',
            empresa: ''
        }
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