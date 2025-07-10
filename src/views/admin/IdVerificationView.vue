<template>
  <div class="id-verification-view">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        <v-icon class="title-icon">mdi-shield-check</v-icon>
        Verificación de Identidades
      </h1>
      <p class="page-subtitle">
        Gestiona la verificación manual de documentos de identidad de los usuarios
      </p>
    </div>

    <!-- Filtros -->
    <v-card class="filters-card mb-6">
      <v-card-title>
        <v-icon>mdi-filter</v-icon>
        Filtros
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select v-model="filters.status" :items="statusOptions" label="Estado" variant="outlined"
              density="comfortable" clearable />
          </v-col>
          <v-col cols="12" md="3">
            <v-select v-model="filters.country" :items="countryOptions" label="País" variant="outlined"
              density="comfortable" clearable />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.dateFrom" label="Desde" type="date" variant="outlined"
              density="comfortable" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.dateTo" label="Hasta" type="date" variant="outlined" density="comfortable" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="filters.search" label="Buscar por nombre, email o RUT" variant="outlined"
              density="comfortable" prepend-inner-icon="mdi-magnify" clearable />
          </v-col>
          <v-col cols="12" md="6" class="d-flex align-center">
            <v-btn @click="applyFilters" color="turquesa" variant="elevated" :loading="loading">
              <v-icon left>mdi-filter-check</v-icon>
              Aplicar Filtros
            </v-btn>
            <v-btn @click="clearFilters" variant="outlined" class="ml-2">
              <v-icon left>mdi-filter-remove</v-icon>
              Limpiar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Estadísticas rápidas -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card pending">
          <v-card-text>
            <div class="stat-content">
              <v-icon class="stat-icon">mdi-clock-outline</v-icon>
              <div>
                <div class="stat-number">{{ stats.pending }}</div>
                <div class="stat-label">Pendientes</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card verified">
          <v-card-text>
            <div class="stat-content">
              <v-icon class="stat-icon">mdi-check-circle</v-icon>
              <div>
                <div class="stat-number">{{ stats.verified }}</div>
                <div class="stat-label">Verificados</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card rejected">
          <v-card-text>
            <div class="stat-content">
              <v-icon class="stat-icon">mdi-close-circle</v-icon>
              <div>
                <div class="stat-number">{{ stats.rejected }}</div>
                <div class="stat-label">Rechazados</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card total">
          <v-card-text>
            <div class="stat-content">
              <v-icon class="stat-icon">mdi-account-group</v-icon>
              <div>
                <div class="stat-number">{{ stats.total }}</div>
                <div class="stat-label">Total</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de usuarios -->
    <v-card class="users-table-card">
      <v-card-title>
        <v-icon>mdi-account-multiple</v-icon>
        Usuarios para Verificación
        <v-spacer />
        <v-chip :color="getStatusColor('pending')" variant="elevated" class="ml-2">
          {{ filteredUsers.length }} usuarios
        </v-chip>
      </v-card-title>

      <v-data-table :headers="tableHeaders" :items="filteredUsers" :loading="loading" :items-per-page="10"
        class="verification-table">
        <!-- Usuario -->
        <template #item.user="{ item }">
          <div class="user-info">
            <v-avatar size="32" class="mr-2">
              <v-img v-if="item.photoURL" :src="item.photoURL" :alt="item.displayName" />
              <v-icon v-else>mdi-account</v-icon>
            </v-avatar>
            <div>
              <div class="user-name">{{ item.displayName || item.nombre || 'Sin nombre' }}</div>
              <div class="user-email">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Documento -->
        <template #item.document="{ item }">
          <div class="document-info">
            <div class="document-type">{{ getDocumentType(item.pais) }}</div>
            <div class="document-number">{{ item.rut || 'No especificado' }}</div>
          </div>
        </template>

        <!-- País -->
        <template #item.country="{ item }">
          <v-chip size="small" variant="outlined">
            {{ item.paisNombre || item.pais || 'No especificado' }}
          </v-chip>
        </template>

        <!-- Estado -->
        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.idVerificationStatus)" variant="elevated" size="small">
            <v-icon left size="small">{{ getStatusIcon(item.idVerificationStatus) }}</v-icon>
            {{ getStatusText(item.idVerificationStatus) }}
          </v-chip>
        </template>

        <!-- Fecha -->
        <template #item.date="{ item }">
          <div class="date-info">
            <div>{{ formatDate(item.createdAt) }}</div>
            <div class="date-time">{{ formatTime(item.createdAt) }}</div>
          </div>
        </template>

        <!-- Acciones -->
        <template #item.actions="{ item }">
          <div class="action-buttons">
            <v-btn @click="viewUserDetails(item)" icon size="small" variant="text" color="info">
              <v-icon>mdi-eye</v-icon>
              <v-tooltip activator="parent">Ver detalles</v-tooltip>
            </v-btn>

            <v-btn v-if="item.idVerificationStatus === 'pending'" @click="verifyUser(item)" icon size="small"
              variant="text" color="success" :loading="item.verifying">
              <v-icon>mdi-check</v-icon>
              <v-tooltip activator="parent">Verificar</v-tooltip>
            </v-btn>

            <v-btn v-if="item.idVerificationStatus === 'pending'" @click="rejectUser(item)" icon size="small"
              variant="text" color="error" :loading="item.rejecting">
              <v-icon>mdi-close</v-icon>
              <v-tooltip activator="parent">Rechazar</v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- Loading -->
        <template #loading>
          <div class="loading-container">
            <v-progress-circular indeterminate color="turquesa" />
            <p>Cargando usuarios...</p>
          </div>
        </template>

        <!-- No data -->
        <template #no-data>
          <div class="no-data-container">
            <v-icon size="64" color="grey">mdi-account-search</v-icon>
            <h3>No hay usuarios para verificar</h3>
            <p>No se encontraron usuarios que coincidan con los filtros aplicados.</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal de detalles del usuario -->
    <UserDetailsModal v-model="showUserDetailsModal" :user="selectedUser" @verify="verifyUser" @reject="rejectUser" />

    <!-- Modal de confirmación de verificación -->
    <ConfirmationModal v-model="showVerifyModal" title="Verificar Usuario"
      :message="`¿Estás seguro de que quieres verificar la identidad de ${selectedUser?.displayName || selectedUser?.email}?`"
      confirm-text="Verificar" confirm-color="success" @confirm="confirmVerifyUser" />

    <!-- Modal de confirmación de rechazo -->
    <ConfirmationModal v-model="showRejectModal" title="Rechazar Usuario"
      :message="`¿Estás seguro de que quieres rechazar la identidad de ${selectedUser?.displayName || selectedUser?.email}?`"
      confirm-text="Rechazar" confirm-color="error" @confirm="confirmRejectUser" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { db } from '@/firebase'
import { getIdConfig } from '@/services/idValidationService'
import UserDetailsModal from '@/components/admin/UserDetailsModal.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'

// Reactive data
const loading = ref(false)
const users = ref([])
const selectedUser = ref(null)
const showUserDetailsModal = ref(false)
const showVerifyModal = ref(false)
const showRejectModal = ref(false)

// Filtros
const filters = ref({
  status: '',
  country: '',
  dateFrom: '',
  dateTo: '',
  search: ''
})

// Opciones para filtros
const statusOptions = [
  { title: 'Pendiente', value: 'pending' },
  { title: 'Verificado', value: 'verified' },
  { title: 'Rechazado', value: 'rejected' }
]

const countryOptions = [
  { title: 'Chile', value: 'CL' },
  { title: 'Argentina', value: 'AR' },
  { title: 'Perú', value: 'PE' },
  { title: 'Colombia', value: 'CO' },
  { title: 'Otros', value: 'OTHER' }
]

// Headers de la tabla
const tableHeaders = [
  { title: 'Usuario', key: 'user', sortable: false },
  { title: 'Documento', key: 'document', sortable: false },
  { title: 'País', key: 'country', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Fecha Registro', key: 'date', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filtrar por estado
  if (filters.value.status) {
    filtered = filtered.filter(user => user.idVerificationStatus === filters.value.status)
  }

  // Filtrar por país
  if (filters.value.country) {
    filtered = filtered.filter(user => user.pais === filters.value.country)
  }

  // Filtrar por búsqueda
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(user =>
      (user.displayName && user.displayName.toLowerCase().includes(search)) ||
      (user.nombre && user.nombre.toLowerCase().includes(search)) ||
      (user.email && user.email.toLowerCase().includes(search)) ||
      (user.rut && user.rut.toLowerCase().includes(search))
    )
  }

  // Filtrar por fechas
  if (filters.value.dateFrom) {
    const fromDate = new Date(filters.value.dateFrom)
    filtered = filtered.filter(user => {
      const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt)
      return userDate >= fromDate
    })
  }

  if (filters.value.dateTo) {
    const toDate = new Date(filters.value.dateTo)
    toDate.setHours(23, 59, 59, 999) // Final del día
    filtered = filtered.filter(user => {
      const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt)
      return userDate <= toDate
    })
  }

  return filtered
})

const stats = computed(() => {
  const pending = users.value.filter(u => u.idVerificationStatus === 'pending').length
  const verified = users.value.filter(u => u.idVerificationStatus === 'verified').length
  const rejected = users.value.filter(u => u.idVerificationStatus === 'rejected').length

  return {
    pending,
    verified,
    rejected,
    total: users.value.length
  }
})

// Methods
const loadUsers = async () => {
  loading.value = true
  try {
    console.log('📊 Cargando usuarios para verificación...')

    // Consultar usuarios que necesitan verificación
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(500) // Limitar para rendimiento
    )

    const snapshot = await getDocs(usersQuery)
    users.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    console.log(`✅ ${users.value.length} usuarios cargados`)

  } catch (error) {
    console.error('❌ Error cargando usuarios:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  // Los filtros se aplican automáticamente via computed
  console.log('🔍 Filtros aplicados:', filters.value)
}

const clearFilters = () => {
  filters.value = {
    status: '',
    country: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  }
}

const viewUserDetails = (user) => {
  selectedUser.value = user
  showUserDetailsModal.value = true
}

const verifyUser = (user) => {
  selectedUser.value = user
  showVerifyModal.value = true
}

const rejectUser = (user) => {
  selectedUser.value = user
  showRejectModal.value = true
}

const confirmVerifyUser = async () => {
  await updateUserVerificationStatus(selectedUser.value, 'verified')
  showVerifyModal.value = false
}

const confirmRejectUser = async () => {
  await updateUserVerificationStatus(selectedUser.value, 'rejected')
  showRejectModal.value = false
}

const updateUserVerificationStatus = async (user, status) => {
  try {
    console.log(`🔄 Actualizando estado de verificación: ${user.email} → ${status}`)

    // ✅ LLAMAR A CLOUD FUNCTION
    const functions = getFunctions()
    const updateVerification = httpsCallable(functions, 'updateIdVerificationStatus')

    const result = await updateVerification({
      userId: user.id,
      newStatus: status,
      notes: '' // Se podría agregar un campo para notas en el futuro
    })

    if (result.data.success) {
      // Actualizar localmente
      const userIndex = users.value.findIndex(u => u.id === user.id)
      if (userIndex !== -1) {
        users.value[userIndex].idVerificationStatus = status
        users.value[userIndex].idVerificationDate = new Date()
      }

      console.log(`✅ Estado actualizado: ${status}`)

      // Mostrar notificación de éxito
      // Aquí se podría agregar una notificación toast

    } else {
      throw new Error(result.data.message || 'Error desconocido')
    }

  } catch (error) {
    console.error('❌ Error actualizando estado:', error)

    // Mostrar error al usuario
    let errorMessage = 'Error al actualizar el estado de verificación'

    if (error.code === 'functions/permission-denied') {
      errorMessage = 'No tienes permisos para realizar esta acción'
    } else if (error.code === 'functions/not-found') {
      errorMessage = 'Usuario no encontrado'
    } else if (error.message) {
      errorMessage = error.message
    }

    // Aquí se podría mostrar un toast de error
    alert(errorMessage) // Temporal, se debería reemplazar por un toast
  }
}

// Utility functions
const getDocumentType = (country) => {
  return getIdConfig(country || 'CL').idName
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    verified: 'success',
    rejected: 'error'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'mdi-clock-outline',
    verified: 'mdi-check-circle',
    rejected: 'mdi-close-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Pendiente',
    verified: 'Verificado',
    rejected: 'Rechazado'
  }
  return texts[status] || 'Desconocido'
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('es-CL')
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.id-verification-view {
  padding: 1.5rem;
  max-width: 100%;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.title-icon {
  color: var(--color-turquesa);
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.filters-card {
  background: var(--color-surface);
}

.stat-card {
  background: var(--color-surface);
  border-left: 4px solid var(--color-turquesa);
}

.stat-card.pending {
  border-left-color: #ff9800;
}

.stat-card.verified {
  border-left-color: #4caf50;
}

.stat-card.rejected {
  border-left-color: #f44336;
}

.stat-card.total {
  border-left-color: var(--color-azul);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  color: var(--color-turquesa);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.users-table-card {
  background: var(--color-surface);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  font-weight: 500;
  color: var(--color-text);
}

.user-email {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.document-info {
  text-align: center;
}

.document-type {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.document-number {
  font-weight: 500;
  color: var(--color-text);
}

.date-info {
  text-align: center;
}

.date-time {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.loading-container,
.no-data-container {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.verification-table {
  background: var(--color-surface);
}

/* Responsive */
@media (max-width: 768px) {
  .id-verification-view {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style>
