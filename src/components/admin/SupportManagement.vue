<template>
    <div class="support-management">
        <div class="header-section">
            <h2>🎧 Gestión de Agentes de Soporte</h2>
            <p>Registra y gestiona agentes de soporte técnico</p>
        </div>

        <!-- Formulario de registro -->
        <div class="form-container">
            <h3>➕ Registrar Nuevo Agente de Soporte</h3>

            <form @submit.prevent="registrarSoporte" class="support-form">
                <!-- Información Personal -->
                <div class="form-section">
                    <h4>👤 Información Personal</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="nombre">Nombre *</label>
                            <input v-model="form.nombre" type="text" id="nombre" required
                                placeholder="Nombre del agente">
                        </div>
                        <div class="form-group">
                            <label for="apellido">Apellido *</label>
                            <input v-model="form.apellido" type="text" id="apellido" required
                                placeholder="Apellido del agente">
                        </div>
                        <div class="form-group">
                            <label for="email">Email *</label>
                            <input v-model="form.email" type="email" id="email" required
                                placeholder="email@empresa.com">
                        </div>
                        <div class="form-group">
                            <label for="telefono">Teléfono</label>
                            <input v-model="form.telefono" type="tel" id="telefono" placeholder="+56 9 1234 5678">
                        </div>
                    </div>
                </div>

                <!-- Información de Acceso -->
                <div class="form-section">
                    <h4>🔐 Información de Acceso</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="password">Contraseña Temporal *</label>
                            <input v-model="form.password" type="password" id="password" required
                                placeholder="Mínimo 6 caracteres" minlength="6">
                            <small>El agente deberá cambiar esta contraseña en su primer acceso</small>
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirmar Contraseña *</label>
                            <input v-model="form.confirmPassword" type="password" id="confirmPassword" required
                                placeholder="Repetir contraseña">
                        </div>
                    </div>
                </div>

                <!-- Información Laboral -->
                <div class="form-section">
                    <h4>💼 Información Laboral</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="fechaInicioTrabajo">Fecha de Inicio</label>
                            <input v-model="form.fechaInicioTrabajo" type="date" id="fechaInicioTrabajo">
                        </div>
                        <div class="form-group">
                            <label for="turno">Turno de Trabajo</label>
                            <select v-model="form.turno" id="turno">
                                <option value="">Seleccionar turno</option>
                                <option value="mañana">🌅 Mañana (08:00 - 16:00)</option>
                                <option value="tarde">🌆 Tarde (16:00 - 00:00)</option>
                                <option value="noche">🌙 Noche (00:00 - 08:00)</option>
                                <option value="flexible">🔄 Flexible</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="especialidad">Especialidad</label>
                            <select v-model="form.especialidad" id="especialidad">
                                <option value="">Seleccionar especialidad</option>
                                <option value="tecnico">🔧 Soporte Técnico</option>
                                <option value="cuentas">👤 Gestión de Cuentas</option>
                                <option value="pagos">💳 Problemas de Pago</option>
                                <option value="general">📋 Soporte General</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="supervisor">Supervisor</label>
                            <input v-model="form.supervisor" type="text" id="supervisor"
                                placeholder="Nombre del supervisor">
                        </div>
                    </div>
                </div>

                <!-- Configuración de Soporte -->
                <div class="form-section">
                    <h4>⚙️ Configuración de Soporte</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="maxTicketsDiarios">Máximo Tickets por Día</label>
                            <input v-model.number="form.maxTicketsDiarios" type="number" id="maxTicketsDiarios" min="1"
                                max="50" placeholder="20">
                            <small>Límite recomendado: 15-25 tickets por día</small>
                        </div>
                        <div class="form-group">
                            <label for="nivelAcceso">Nivel de Acceso</label>
                            <select v-model="form.nivelAcceso" id="nivelAcceso">
                                <option value="basico">🟢 Básico - Solo tickets asignados</option>
                                <option value="intermedio">🟡 Intermedio - Puede auto-asignarse</option>
                                <option value="avanzado">🔴 Avanzado - Acceso a estadísticas</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Confirmación de Rol -->
                <div class="form-section">
                    <h4>🔐 Confirmación de Rol</h4>
                    <div class="role-confirmation">
                        <label class="checkbox-label">
                            <input v-model="form.confirmarRolSoporte" type="checkbox" required>
                            <span class="checkmark"></span>
                            Confirmo que este usuario tendrá rol de <strong>SOPORTE</strong>
                        </label>
                        <p class="role-description">
                            Los agentes de soporte podrán acceder al panel de tickets, responder consultas y gestionar
                            casos de usuarios.
                        </p>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary" :disabled="submitting">
                        {{ submitting ? '⏳ Registrando...' : '✅ Registrar Agente de Soporte' }}
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
                <h4>ℹ️ Información sobre Agentes de Soporte</h4>
                <ul>
                    <li><strong>Acceso:</strong> Panel de soporte en /support-dashboard</li>
                    <li><strong>Funciones:</strong> Ver, asignar y responder tickets</li>
                    <li><strong>Permisos:</strong> Solo tickets de soporte, sin acceso administrativo</li>
                    <li><strong>Notificaciones:</strong> Reciben alertas de tickets asignados</li>
                    <li><strong>Horarios:</strong> Pueden trabajar en diferentes turnos</li>
                </ul>
            </div>

            <div class="info-card">
                <h4>📊 Métricas de Soporte</h4>
                <div class="metrics-grid">
                    <div class="metric-item">
                        <span class="metric-number">{{ supportStats.totalAgents }}</span>
                        <span class="metric-label">Agentes Activos</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-number">{{ supportStats.ticketsHoy }}</span>
                        <span class="metric-label">Tickets Hoy</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-number">{{ supportStats.tiempoPromedio }}</span>
                        <span class="metric-label">Tiempo Promedio</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const submitting = ref(false)
const supportStats = ref({
    totalAgents: 0,
    ticketsHoy: 0,
    tiempoPromedio: '2.5h'
})

const form = reactive({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    fechaInicioTrabajo: '',
    turno: '',
    especialidad: '',
    supervisor: '',
    maxTicketsDiarios: 20,
    nivelAcceso: 'intermedio',
    confirmarRolSoporte: false
})

const registrarSoporte = async () => {
    try {
        submitting.value = true
        console.log('Registrando agente de soporte:', form.email)

        // Validaciones
        if (form.password !== form.confirmPassword) {
            alert('Las contraseñas no coinciden')
            return
        }

        if (!form.confirmarRolSoporte) {
            alert('Debes confirmar el rol de soporte')
            return
        }

        // Crear usuario en Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
        const uid = cred.user.uid
        console.log('Agente de soporte creado en Auth:', uid)

        // Crear documento en Firestore
        await setDoc(doc(db, 'users', uid), {
            email: form.email,
            rol: 'soporte', // Rol específico de soporte
            nombre: form.nombre,
            apellido: form.apellido,
            telefono: form.telefono,
            fechaInicioTrabajo: form.fechaInicioTrabajo ? new Date(form.fechaInicioTrabajo) : null,
            turno: form.turno,
            especialidad: form.especialidad,
            supervisor: form.supervisor,
            maxTicketsDiarios: parseInt(form.maxTicketsDiarios) || 20,
            nivelAcceso: form.nivelAcceso,

            // Estadísticas de soporte
            ticketsAsignados: 0,
            ticketsResueltos: 0,
            tiempoPromedioRespuesta: 0,
            calificacionPromedio: 0,

            // Metadatos
            estado: 'activo',
            fechaRegistro: serverTimestamp(),
            ultimoAcceso: serverTimestamp(),
            creadoPor: authStore.user?.email || 'admin',
            tipoUsuario: 'soporte'
        })

        console.log('✅ Agente de soporte registrado exitosamente')
        alert(`✅ Agente de soporte registrado exitosamente!\n\nEmail: ${form.email}\nAcceso: /support-dashboard`)

        limpiarFormulario()
        await loadSupportStats()

    } catch (error) {
        console.error('Error registrando agente de soporte:', error)

        let errorMessage = 'Error desconocido'
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'El email ya está registrado en el sistema'
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'La contraseña es muy débil'
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'El formato del email no es válido'
        }

        alert(`❌ Error: ${errorMessage}`)
    } finally {
        submitting.value = false
    }
}

const limpiarFormulario = () => {
    Object.assign(form, {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: '',
        fechaInicioTrabajo: '',
        turno: '',
        especialidad: '',
        supervisor: '',
        maxTicketsDiarios: 20,
        nivelAcceso: 'intermedio',
        confirmarRolSoporte: false
    })
}

const loadSupportStats = async () => {
    try {
        // Contar agentes de soporte activos
        const supportQuery = query(
            collection(db, 'users'),
            where('rol', '==', 'soporte'),
            where('estado', '==', 'activo')
        )
        const supportSnapshot = await getDocs(supportQuery)
        supportStats.value.totalAgents = supportSnapshot.size

        // Aquí podrías agregar más estadísticas de tickets, etc.

    } catch (error) {
        console.error('Error cargando estadísticas de soporte:', error)
    }
}

onMounted(() => {
    loadSupportStats()
})
</script>

<style scoped>
@import '@/styles/admin-forms.css';

.support-management {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    margin-top: 16px;
}

.metric-item {
    text-align: center;
    padding: 16px;
    background: #2a2a2a;
    border-radius: 8px;
    border: 1px solid #444;
}

.metric-number {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
    color: #00cccc;
    margin-bottom: 4px;
}

.metric-label {
    display: block;
    font-size: 0.8rem;
    color: #888;
}

.role-confirmation {
    background: rgba(0, 204, 204, 0.05);
    border: 1px solid rgba(0, 204, 204, 0.2);
    border-radius: 8px;
    padding: 16px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    color: #ffffff;
}

.checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #00cccc;
}

.role-description {
    margin: 0;
    color: #ccc;
    font-size: 0.9rem;
    line-height: 1.4;
}
</style>
