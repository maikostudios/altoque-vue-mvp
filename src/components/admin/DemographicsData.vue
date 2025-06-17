<template>
    <div class="demographics-data">
        <!-- Header con estadísticas generales -->
        <div class="demographics-header">
            <div class="header-content">
                <h2>📈 Datos Demográficos</h2>
                <p>Análisis demográfico de usuarios finales (rol: usuario)</p>
            </div>
            <div class="header-stats">
                <div class="stat-item">
                    <span class="stat-number">{{ totalUsuarios }}</span>
                    <span class="stat-label">Total Usuarios</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">{{ usuariosConDatos }}</span>
                    <span class="stat-label">Con Datos Completos</span>
                </div>
                <button @click="refreshData" class="btn btn-secondary" :disabled="loading">
                    🔄 {{ loading ? 'Cargando...' : 'Actualizar' }}
                </button>
                <button @click="completeMissingData" class="btn btn-primary" :disabled="loading || completing">
                    🔧 {{ completing ? 'Completando...' : 'Completar Datos' }}
                </button>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando datos demográficos...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Error al cargar datos</h3>
            <p>{{ error }}</p>
            <button @click="refreshData" class="btn btn-primary">Reintentar</button>
        </div>

        <!-- Demographics grid -->
        <div v-else class="demographics-grid">
            <!-- Por Ubicación -->
            <div class="demo-card location-card">
                <div class="card-header">
                    <h3>📍 Distribución por Ubicación</h3>
                    <span class="data-count">{{ totalUsuarios }} usuarios analizados</span>
                </div>

                <div v-if="locationData.length === 0" class="no-data">
                    <div class="no-data-icon">📍</div>
                    <p>No hay datos de ubicación disponibles</p>
                </div>

                <div v-else class="demo-content">
                    <div v-for="item in locationData" :key="item.location" class="demo-item">
                        <div class="item-info">
                            <span class="item-label">{{ item.location }}</span>
                            <span class="item-count">{{ item.count }} usuario{{ item.count !== 1 ? 's' : '' }}</span>
                        </div>
                        <div class="item-stats">
                            <span class="item-percentage">{{ item.percentage }}%</span>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: item.percentage + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Por Edad -->
            <div class="demo-card age-card">
                <div class="card-header">
                    <h3>👥 Distribución por Edad</h3>
                    <span class="data-count">{{ usuariosConEdad }} con fecha de nacimiento</span>
                </div>

                <div v-if="ageData.length === 0" class="no-data">
                    <div class="no-data-icon">👥</div>
                    <p>No hay datos de edad disponibles</p>
                </div>

                <div v-else class="demo-content">
                    <div v-for="item in ageData" :key="item.range" class="demo-item">
                        <div class="item-info">
                            <span class="item-label">{{ item.range }}</span>
                            <span class="item-count">{{ item.count }} usuario{{ item.count !== 1 ? 's' : '' }}</span>
                        </div>
                        <div class="item-stats">
                            <span class="item-percentage">{{ item.percentage }}%</span>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: item.percentage + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Por Plan -->
            <div class="demo-card plan-card">
                <div class="card-header">
                    <h3>⭐ Distribución por Plan</h3>
                    <span class="data-count">{{ totalUsuarios }} usuarios</span>
                </div>

                <div class="demo-content">
                    <div v-for="item in planData" :key="item.plan" class="demo-item">
                        <div class="item-info">
                            <span class="item-label">{{ item.plan }}</span>
                            <span class="item-count">{{ item.count }} usuario{{ item.count !== 1 ? 's' : '' }}</span>
                        </div>
                        <div class="item-stats">
                            <span class="item-percentage">{{ item.percentage }}%</span>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: item.percentage + '%' }"
                                    :class="{ 'premium': item.plan.includes('Premium') }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Por Sexo -->
            <div class="demo-card gender-card">
                <div class="card-header">
                    <h3>👤 Distribución por Sexo</h3>
                    <span class="data-count">{{ usuariosConSexo }} con sexo definido</span>
                </div>

                <div v-if="genderData.length === 0" class="no-data">
                    <div class="no-data-icon">👤</div>
                    <p>No hay datos de sexo disponibles</p>
                </div>

                <div v-else class="demo-content">
                    <div v-for="item in genderData" :key="item.gender" class="demo-item">
                        <div class="item-info">
                            <span class="item-label">{{ item.gender }}</span>
                            <span class="item-count">{{ item.count }} usuario{{ item.count !== 1 ? 's' : '' }}</span>
                        </div>
                        <div class="item-stats">
                            <span class="item-percentage">{{ item.percentage }}%</span>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: item.percentage + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Por Estado -->
            <div class="demo-card status-card">
                <div class="card-header">
                    <h3>🔄 Estado de Usuarios</h3>
                    <span class="data-count">{{ totalUsuarios }} usuarios</span>
                </div>

                <div class="demo-content">
                    <div v-for="item in statusData" :key="item.status" class="demo-item">
                        <div class="item-info">
                            <span class="item-label">{{ item.status }}</span>
                            <span class="item-count">{{ item.count }} usuario{{ item.count !== 1 ? 's' : '' }}</span>
                        </div>
                        <div class="item-stats">
                            <span class="item-percentage">{{ item.percentage }}%</span>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: item.percentage + '%' }"
                                    :class="{ 'active': item.status === 'Activo' }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

const emit = defineEmits(['showNotification'])

// Ubicaciones jerárquicamente correctas
const ubicacionesJerarquicas = [
    // Región Metropolitana
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13101', comunaNombre: 'Santiago' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13119', comunaNombre: 'Maipú' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13114', comunaNombre: 'Las Condes' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13123', comunaNombre: 'Providencia' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13120', comunaNombre: 'Ñuñoa' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13110', comunaNombre: 'La Florida' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13122', comunaNombre: 'Peñalolén' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13132', comunaNombre: 'Vitacura' },

    // Valparaíso
    { region: '5', regionNombre: 'Valparaíso', provincia: '51', provinciaNombre: 'Valparaíso', comuna: '5101', comunaNombre: 'Valparaíso' },
    { region: '5', regionNombre: 'Valparaíso', provincia: '51', provinciaNombre: 'Valparaíso', comuna: '5107', comunaNombre: 'Viña del Mar' },
    { region: '5', regionNombre: 'Valparaíso', provincia: '51', provinciaNombre: 'Valparaíso', comuna: '5103', comunaNombre: 'Concón' },

    // Biobío
    { region: '8', regionNombre: 'Biobío', provincia: '81', provinciaNombre: 'Concepción', comuna: '8101', comunaNombre: 'Concepción' },
    { region: '8', regionNombre: 'Biobío', provincia: '81', provinciaNombre: 'Concepción', comuna: '8110', comunaNombre: 'Talcahuano' },
    { region: '8', regionNombre: 'Biobío', provincia: '81', provinciaNombre: 'Concepción', comuna: '8108', comunaNombre: 'San Pedro de la Paz' },

    // Araucanía
    { region: '9', regionNombre: 'La Araucanía', provincia: '91', provinciaNombre: 'Cautín', comuna: '9101', comunaNombre: 'Temuco' },
    { region: '9', regionNombre: 'La Araucanía', provincia: '91', provinciaNombre: 'Cautín', comuna: '9115', comunaNombre: 'Pucón' },
    { region: '9', regionNombre: 'La Araucanía', provincia: '91', provinciaNombre: 'Cautín', comuna: '9120', comunaNombre: 'Villarrica' },

    // Coquimbo
    { region: '4', regionNombre: 'Coquimbo', provincia: '41', provinciaNombre: 'Elqui', comuna: '4101', comunaNombre: 'La Serena' },
    { region: '4', regionNombre: 'Coquimbo', provincia: '41', provinciaNombre: 'Elqui', comuna: '4102', comunaNombre: 'Coquimbo' },

    // Antofagasta
    { region: '2', regionNombre: 'Antofagasta', provincia: '21', provinciaNombre: 'Antofagasta', comuna: '2101', comunaNombre: 'Antofagasta' }
]

const sexos = ['masculino', 'femenino', 'otro']

// Estado
const loading = ref(true)
const error = ref(null)
const usuarios = ref([])
const completing = ref(false)

// Computed para estadísticas generales
const totalUsuarios = computed(() => usuarios.value.length)

const usuariosConDatos = computed(() => {
    return usuarios.value.filter(user =>
        user.comuna && user.fechaNacimiento
    ).length
})

const usuariosConEdad = computed(() => {
    return usuarios.value.filter(user => user.fechaNacimiento).length
})

// Computed para datos de ubicación
const locationData = computed(() => {
    const locationMap = new Map()

    usuarios.value.forEach(user => {
        // Priorizar comunaNombre, luego comuna
        const location = user.comunaNombre || user.comuna || 'Sin especificar'
        locationMap.set(location, (locationMap.get(location) || 0) + 1)
    })

    const total = usuarios.value.length
    if (total === 0) return []

    return Array.from(locationMap.entries())
        .map(([location, count]) => ({
            location,
            count,
            percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 ubicaciones
})

// Computed para datos de edad
const ageData = computed(() => {
    const ageRanges = {
        '18-25 años': { min: 18, max: 25, count: 0 },
        '26-35 años': { min: 26, max: 35, count: 0 },
        '36-45 años': { min: 36, max: 45, count: 0 },
        '46-55 años': { min: 46, max: 55, count: 0 },
        '56+ años': { min: 56, max: 999, count: 0 }
    }

    usuarios.value.forEach(user => {
        if (user.fechaNacimiento) {
            const age = calculateAge(user.fechaNacimiento)
            if (age) {
                for (const [range, config] of Object.entries(ageRanges)) {
                    if (age >= config.min && age <= config.max) {
                        config.count++
                        break
                    }
                }
            }
        }
    })

    const totalWithAge = usuariosConEdad.value
    if (totalWithAge === 0) return []

    return Object.entries(ageRanges)
        .filter(([_, config]) => config.count > 0)
        .map(([range, config]) => ({
            range,
            count: config.count,
            percentage: Math.round((config.count / totalWithAge) * 100)
        }))
        .sort((a, b) => b.count - a.count)
})

// Computed para datos de plan
const planData = computed(() => {
    const planMap = new Map()

    usuarios.value.forEach(user => {
        const plan = user.esPremium ? '⭐ Premium' : '🆓 Gratuito'
        planMap.set(plan, (planMap.get(plan) || 0) + 1)
    })

    const total = usuarios.value.length
    if (total === 0) return []

    return Array.from(planMap.entries())
        .map(([plan, count]) => ({
            plan,
            count,
            percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.count - a.count)
})

// Computed para datos de estado
const statusData = computed(() => {
    const statusMap = new Map()

    usuarios.value.forEach(user => {
        const status = user.estado === 'activo' ? 'Activo' : 'Inactivo'
        statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })

    const total = usuarios.value.length
    if (total === 0) return []

    return Array.from(statusMap.entries())
        .map(([status, count]) => ({
            status,
            count,
            percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.count - a.count)
})

// Computed para datos de sexo
const genderData = computed(() => {
    const genderMap = new Map()

    usuarios.value.forEach(user => {
        if (user.sexo) {
            const gender = user.sexo.charAt(0).toUpperCase() + user.sexo.slice(1)
            genderMap.set(gender, (genderMap.get(gender) || 0) + 1)
        }
    })

    const totalWithGender = usuarios.value.filter(user => user.sexo).length
    if (totalWithGender === 0) return []

    return Array.from(genderMap.entries())
        .map(([gender, count]) => ({
            gender,
            count,
            percentage: Math.round((count / totalWithGender) * 100)
        }))
        .sort((a, b) => b.count - a.count)
})

const usuariosConSexo = computed(() => {
    return usuarios.value.filter(user => user.sexo).length
})

// Funciones
const loadDemographicsData = async () => {
    try {
        loading.value = true
        error.value = null

        console.log('🔍 Cargando datos demográficos...')

        // Consultar todos los usuarios primero
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const usersData = []
        const allUsers = []

        usersSnapshot.forEach((doc) => {
            const userData = { id: doc.id, ...doc.data() }
            allUsers.push(userData)

            // Migrar de 'role' a 'rol' si es necesario
            if (userData.role && !userData.rol) {
                userData.rol = userData.role
            }

            // Solo incluir si el rol es 'usuario' (en cualquier campo)
            const userRole = userData.rol || userData.role
            console.log(`👤 Usuario: ${userData.nombre || userData.email}, Rol: ${userRole}`)

            if (userRole === 'usuario') {
                usersData.push(userData)
                console.log(`✅ Usuario incluido: ${userData.nombre} ${userData.apellido}`)
            }
        })

        console.log(`📊 Total usuarios en DB: ${allUsers.length}`)
        console.log(`👥 Usuarios con rol 'usuario': ${usersData.length}`)

        usuarios.value = usersData

        console.log('✅ Datos demográficos cargados:', {
            total: usuarios.value.length,
            conUbicacion: usuarios.value.filter(u => u.comuna).length,
            conEdad: usuariosConEdad.value,
            premium: usuarios.value.filter(u => u.esPremium).length
        })

        emit('showNotification', 'success', `Datos demográficos actualizados: ${usuarios.value.length} usuarios analizados`)

    } catch (err) {
        console.error('❌ Error cargando datos demográficos:', err)
        error.value = 'Error al cargar los datos demográficos: ' + err.message
        emit('showNotification', 'error', 'Error al cargar datos demográficos')
    } finally {
        loading.value = false
    }
}

const refreshData = () => {
    loadDemographicsData()
}

// Funciones auxiliares para completar datos
const generateRandomBirthDate = () => {
    const today = new Date()
    const minAge = 18
    const maxAge = 65
    const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate())
    const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate())
    const randomTime = minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime())
    return new Date(randomTime)
}

const getRandomLocation = () => {
    return ubicacionesJerarquicas[Math.floor(Math.random() * ubicacionesJerarquicas.length)]
}

const getRandomGender = () => {
    return sexos[Math.floor(Math.random() * sexos.length)]
}

// Función para completar datos faltantes
const completeMissingData = async () => {
    try {
        completing.value = true
        console.log('🔧 Completando datos faltantes...')

        let updatedCount = 0

        for (const usuario of usuarios.value) {
            const updateData = {}
            let needsUpdate = false

            // Completar fecha de nacimiento
            if (!usuario.fechaNacimiento) {
                updateData.fechaNacimiento = generateRandomBirthDate()
                needsUpdate = true
                console.log(`📅 Agregando fecha de nacimiento a ${usuario.email}`)
            }

            // Completar ubicación jerárquica
            const hasCompleteLocation = usuario.comunaNombre && usuario.regionNombre &&
                usuario.provincia && usuario.comuna && usuario.region

            if (!hasCompleteLocation) {
                const location = getRandomLocation()
                updateData.pais = 'CL'
                updateData.region = location.region
                updateData.regionNombre = location.regionNombre
                updateData.provincia = location.provincia
                updateData.provinciaNombre = location.provinciaNombre
                updateData.comuna = location.comuna
                updateData.comunaNombre = location.comunaNombre
                needsUpdate = true
                console.log(`📍 Agregando ubicación a ${usuario.email}: ${location.comunaNombre}, ${location.regionNombre}`)
            }

            // Completar sexo
            if (!usuario.sexo) {
                updateData.sexo = getRandomGender()
                needsUpdate = true
                console.log(`👤 Agregando sexo a ${usuario.email}: ${updateData.sexo}`)
            }

            // Migrar role a rol
            if (usuario.role && !usuario.rol) {
                updateData.rol = usuario.role
                needsUpdate = true
                console.log(`🔄 Migrando role → rol para ${usuario.email}`)
            }

            if (needsUpdate) {
                try {
                    await updateDoc(doc(db, 'users', usuario.id), updateData)
                    updatedCount++
                    console.log(`✅ Usuario actualizado: ${usuario.email}`)
                } catch (error) {
                    console.error(`❌ Error actualizando ${usuario.email}:`, error)
                }
            }
        }

        console.log(`🎉 Proceso completado! ${updatedCount} usuarios actualizados`)
        emit('showNotification', 'success', `Datos completados: ${updatedCount} usuarios actualizados`)

        // Recargar datos
        await loadDemographicsData()

    } catch (error) {
        console.error('❌ Error completando datos:', error)
        emit('showNotification', 'error', 'Error completando datos: ' + error.message)
    } finally {
        completing.value = false
    }
}

const calculateAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return null

    let birthDate
    if (fechaNacimiento.toDate) {
        birthDate = fechaNacimiento.toDate()
    } else if (typeof fechaNacimiento === 'string') {
        birthDate = new Date(fechaNacimiento)
    } else {
        birthDate = fechaNacimiento
    }

    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1
    }

    return age
}

onMounted(() => {
    loadDemographicsData()
})
</script>

<style scoped>
.demographics-data {
    padding: 1.5rem;
    background: var(--color-background);
    color: var(--color-text);
    font-family: var(--font-primary);
}

/* Header */
.demographics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--color-surface);
    border-radius: 1rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
}

.header-content h2 {
    margin: 0 0 0.5rem 0;
    color: var(--color-text);
    font-size: 1.8rem;
    font-weight: 600;
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.header-content p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 1rem;
}

.header-stats {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-turquesa);
    font-family: var(--font-secondary);
}

.stat-label {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    margin-top: 0.25rem;
}

/* Loading and Error States */
.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    background: var(--color-surface);
    border-radius: 1rem;
    border: 1px solid var(--color-border);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-surface-variant);
    border-top: 4px solid var(--color-turquesa);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.error-state h3 {
    color: var(--color-error);
    margin: 0 0 0.5rem 0;
}

.error-state p {
    color: var(--color-text-secondary);
    margin: 0 0 1.5rem 0;
}

/* Demographics Grid */
.demographics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
}

/* Demo Cards */
.demo-card {
    background: var(--color-surface);
    border-radius: 1rem;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border);
    overflow: hidden;
    transition: all var(--duration-normal) var(--easing-default);
}

.demo-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
}

.card-header {
    padding: 1.5rem 1.5rem 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface-variant);
}

.card-header h3 {
    margin: 0 0 0.5rem 0;
    color: var(--color-text);
    font-size: 1.2rem;
    font-weight: 600;
}

.data-count {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
}

/* Demo Content */
.demo-content {
    padding: 1rem 1.5rem 1.5rem;
}

.demo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border);
    transition: all var(--duration-normal) var(--easing-default);
}

.demo-item:last-child {
    border-bottom: none;
}

.demo-item:hover {
    background: var(--color-surface-variant);
    margin: 0 -1.5rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    border-radius: 0.5rem;
}

.item-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.item-label {
    color: var(--color-text);
    font-weight: 500;
    font-size: 0.95rem;
}

.item-count {
    color: var(--color-text-secondary);
    font-size: 0.8rem;
}

.item-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
    min-width: 80px;
}

.item-percentage {
    color: var(--color-turquesa);
    font-weight: 600;
    font-size: 1rem;
    font-family: var(--font-secondary);
}

/* Progress Bars */
.progress-bar {
    width: 60px;
    height: 6px;
    background: var(--color-surface-variant);
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    border-radius: 3px;
    transition: width 0.8s ease-out;
}

.progress-fill.premium {
    background: linear-gradient(135deg, #ffd700, #ffb347);
}

.progress-fill.active {
    background: linear-gradient(135deg, var(--color-success), #28a745);
}

/* No Data State */
.no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    text-align: center;
    color: var(--color-text-secondary);
}

.no-data-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.no-data p {
    margin: 0;
    font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
    .demographics-data {
        padding: 1rem;
    }

    .demographics-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .header-stats {
        gap: 1rem;
    }

    .demographics-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .demo-card {
        margin: 0;
    }

    .card-header {
        padding: 1rem;
    }

    .demo-content {
        padding: 0.5rem 1rem 1rem;
    }

    .item-stats {
        min-width: 60px;
    }

    .progress-bar {
        width: 50px;
    }
}

@media (max-width: 480px) {
    .header-stats {
        flex-direction: column;
        gap: 0.5rem;
    }

    .demo-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .item-stats {
        align-items: flex-start;
        width: 100%;
    }

    .progress-bar {
        width: 100%;
    }
}
</style>