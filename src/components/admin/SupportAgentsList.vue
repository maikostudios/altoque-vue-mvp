<template>
  <div class="support-agents-list">
    <div class="header-section">
      <h2>🎧 Lista de Agentes de Soporte</h2>
      <p>Gestiona y supervisa a todos los agentes de soporte del sistema</p>

      <div class="header-actions">
        <div class="search-box">
          <i class="bi bi-search"></i>
          <input v-model="searchQuery" type="text" placeholder="Buscar agentes..." class="search-input">
        </div>
        <button @click="loadAgents" class="btn btn-secondary" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i>
          Actualizar
        </button>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🎧</div>
        <div class="stat-content">
          <h3>{{ agents.length }}</h3>
          <p>Agentes Totales</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>{{ activeAgents }}</h3>
          <p>Agentes Activos</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎫</div>
        <div class="stat-content">
          <h3>{{ totalTicketsAssigned }}</h3>
          <p>Tickets Asignados</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <h3>{{ averageRating.toFixed(1) }}</h3>
          <p>Calificación Promedio</p>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <select v-model="statusFilter" class="filter-select">
        <option value="">Todos los estados</option>
        <option value="activo">Activos</option>
        <option value="inactivo">Inactivos</option>
      </select>

      <select v-model="specialtyFilter" class="filter-select">
        <option value="">Todas las especialidades</option>
        <option value="tecnico">Soporte Técnico</option>
        <option value="cuentas">Gestión de Cuentas</option>
        <option value="pagos">Problemas de Pago</option>
        <option value="general">Soporte General</option>
      </select>

      <select v-model="shiftFilter" class="filter-select">
        <option value="">Todos los turnos</option>
        <option value="mañana">Mañana</option>
        <option value="tarde">Tarde</option>
        <option value="noche">Noche</option>
        <option value="flexible">Flexible</option>
      </select>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando agentes de soporte...</p>
    </div>

    <!-- Lista de agentes -->
    <div v-else-if="filteredAgents.length > 0" class="agents-grid">
      <div v-for="agent in filteredAgents" :key="agent.id" class="agent-card" @click="viewAgentDetails(agent)">
        <div class="agent-header">
          <div class="agent-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
          <div class="agent-info">
            <h3>{{ agent.nombre }} {{ agent.apellido }}</h3>
            <p class="agent-email">{{ agent.email }}</p>
            <span class="status-badge" :class="agent.estado === 'activo' ? 'active' : 'inactive'">
              {{ agent.estado === 'activo' ? '🟢 Activo' : '🔴 Inactivo' }}
            </span>
          </div>
        </div>

        <div class="agent-details">
          <div class="detail-item">
            <span class="detail-label">Especialidad:</span>
            <span class="detail-value">{{ getSpecialtyLabel(agent.especialidad) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Turno:</span>
            <span class="detail-value">{{ getShiftLabel(agent.turno) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tickets Asignados:</span>
            <span class="detail-value highlight">{{ getAgentTicketCount(agent.id) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tickets Resueltos:</span>
            <span class="detail-value success">{{ getAgentResolvedCount(agent.id) }}</span>
          </div>
        </div>

        <div class="agent-stats">
          <div class="stat-item">
            <span class="stat-label">Calificación</span>
            <div class="rating">
              <span class="rating-value">{{ (agent.calificacionPromedio || 0).toFixed(1) }}</span>
              <div class="stars">
                <i v-for="n in 5" :key="n" class="bi"
                  :class="n <= Math.round(agent.calificacionPromedio || 0) ? 'bi-star-fill' : 'bi-star'"></i>
              </div>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-label">Tiempo Promedio</span>
            <span class="stat-value">{{ formatResponseTime(agent.tiempoPromedioRespuesta) }}</span>
          </div>
        </div>

        <div class="agent-actions">
          <button @click.stop="viewAgentDetails(agent)" class="btn-action primary" title="Ver detalles">
            <i class="bi bi-eye"></i>
          </button>
          <button @click.stop="editAgent(agent)" class="btn-action secondary" title="Editar agente">
            <i class="bi bi-pencil"></i>
          </button>
          <button @click.stop="toggleAgentStatus(agent)" class="btn-action"
            :class="agent.estado === 'activo' ? 'danger' : 'success'"
            :title="agent.estado === 'activo' ? 'Desactivar' : 'Activar'">
            <i class="bi" :class="agent.estado === 'activo' ? 'bi-pause' : 'bi-play'"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎧</div>
      <h3>No hay agentes de soporte</h3>
      <p>{{ getEmptyMessage() }}</p>
      <router-link to="/admin" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i>
        Crear Primer Agente
      </router-link>
    </div>

    <!-- Modal de detalles del agente -->
    <SupportAgentDetailModal v-if="showDetailModal && selectedAgent" :agent="selectedAgent" @close="closeDetailModal"
      @agent-updated="onAgentUpdated" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import SupportAgentDetailModal from './SupportAgentDetailModal.vue'

const agents = ref([])
const allTickets = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const specialtyFilter = ref('')
const shiftFilter = ref('')
const showDetailModal = ref(false)
const selectedAgent = ref(null)

// Computed
const filteredAgents = computed(() => {
  let filtered = agents.value

  // Filtro por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(agent =>
      agent.nombre.toLowerCase().includes(query) ||
      agent.apellido.toLowerCase().includes(query) ||
      agent.email.toLowerCase().includes(query)
    )
  }

  // Filtro por estado
  if (statusFilter.value) {
    filtered = filtered.filter(agent => agent.estado === statusFilter.value)
  }

  // Filtro por especialidad
  if (specialtyFilter.value) {
    filtered = filtered.filter(agent => agent.especialidad === specialtyFilter.value)
  }

  // Filtro por turno
  if (shiftFilter.value) {
    filtered = filtered.filter(agent => agent.turno === shiftFilter.value)
  }

  return filtered.sort((a, b) => {
    // Ordenar por estado (activos primero) y luego por tickets asignados
    if (a.estado !== b.estado) {
      return a.estado === 'activo' ? -1 : 1
    }
    return (b.ticketsAsignados || 0) - (a.ticketsAsignados || 0)
  })
})

const activeAgents = computed(() =>
  agents.value.filter(agent => agent.estado === 'activo').length
)

const totalTicketsAssigned = computed(() => {
  // Contar tickets realmente asignados a agentes de soporte
  return allTickets.value.filter(ticket => {
    return ticket.asignadoA && agents.value.some(agent => agent.id === ticket.asignadoA)
  }).length
})

const averageRating = computed(() => {
  const ratingsSum = agents.value.reduce((sum, agent) => sum + (agent.calificacionPromedio || 0), 0)
  return agents.value.length > 0 ? ratingsSum / agents.value.length : 0
})

// Methods
const loadTickets = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'tickets'))
    allTickets.value = []

    querySnapshot.forEach((doc) => {
      allTickets.value.push({
        id: doc.id,
        ...doc.data()
      })
    })

    console.log(`✅ Cargados ${allTickets.value.length} tickets`)

  } catch (error) {
    console.error('Error cargando tickets:', error)
  }
}

const updateAgentStatistics = () => {
  // Actualizar estadísticas de cada agente basándose en tickets reales
  agents.value.forEach(agent => {
    const agentTickets = allTickets.value.filter(ticket => ticket.asignadoA === agent.id)
    const resolvedTickets = agentTickets.filter(ticket =>
      ticket.estado === 'respondido' || ticket.estado === 'cerrado'
    )

    // Actualizar contadores
    agent.ticketsAsignados = agentTickets.length
    agent.ticketsResueltos = resolvedTickets.length

    // Calcular tiempo promedio de respuesta (simulado por ahora)
    if (resolvedTickets.length > 0) {
      agent.tiempoPromedioRespuesta = Math.floor(Math.random() * 120) + 30 // 30-150 minutos
    }

    // Calcular calificación promedio (simulado por ahora)
    if (resolvedTickets.length > 0) {
      agent.calificacionPromedio = 3.5 + (Math.random() * 1.5) // 3.5-5.0
    }
  })
}

const loadAgents = async () => {
  loading.value = true
  try {
    const q = query(
      collection(db, 'users'),
      where('rol', '==', 'soporte')
    )

    const querySnapshot = await getDocs(q)
    agents.value = []

    querySnapshot.forEach((doc) => {
      agents.value.push({
        id: doc.id,
        ...doc.data()
      })
    })

    console.log(`✅ Cargados ${agents.value.length} agentes de soporte`)

    // Cargar tickets y actualizar estadísticas
    await loadTickets()
    updateAgentStatistics()

  } catch (error) {
    console.error('Error cargando agentes:', error)
  } finally {
    loading.value = false
  }
}

const getSpecialtyLabel = (specialty) => {
  const labels = {
    'tecnico': '🔧 Técnico',
    'cuentas': '👤 Cuentas',
    'pagos': '💳 Pagos',
    'general': '📋 General'
  }
  return labels[specialty] || specialty || 'Sin especialidad'
}

const getShiftLabel = (shift) => {
  const labels = {
    'mañana': '🌅 Mañana',
    'tarde': '🌆 Tarde',
    'noche': '🌙 Noche',
    'flexible': '🔄 Flexible'
  }
  return labels[shift] || shift || 'Sin turno'
}

const formatResponseTime = (minutes) => {
  if (!minutes) return 'N/A'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const getAgentTicketCount = (agentId) => {
  return allTickets.value.filter(ticket => ticket.asignadoA === agentId).length
}

const getAgentResolvedCount = (agentId) => {
  return allTickets.value.filter(ticket =>
    ticket.asignadoA === agentId &&
    (ticket.estado === 'respondido' || ticket.estado === 'cerrado')
  ).length
}

const getEmptyMessage = () => {
  if (searchQuery.value.trim()) return 'No se encontraron agentes con ese criterio'
  if (statusFilter.value || specialtyFilter.value || shiftFilter.value) return 'No hay agentes con esos filtros'
  return 'Aún no hay agentes de soporte registrados'
}

const viewAgentDetails = (agent) => {
  selectedAgent.value = agent
  showDetailModal.value = true
}

const editAgent = (agent) => {
  // Implementar edición inline o modal
  console.log('Editar agente:', agent.email)
}

const toggleAgentStatus = async (agent) => {
  try {
    const newStatus = agent.estado === 'activo' ? 'inactivo' : 'activo'

    await updateDoc(doc(db, 'users', agent.id), {
      estado: newStatus,
      fechaActualizacion: new Date()
    })

    agent.estado = newStatus
    console.log(`✅ Estado actualizado: ${agent.email} → ${newStatus}`)

  } catch (error) {
    console.error('Error actualizando estado:', error)
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedAgent.value = null
}

const onAgentUpdated = () => {
  loadAgents()
  closeDetailModal()
}

// Función para refrescar datos cada 30 segundos
const startAutoRefresh = () => {
  setInterval(() => {
    if (!loading.value) {
      loadTickets().then(() => {
        updateAgentStatistics()
      })
    }
  }, 30000) // 30 segundos
}

onMounted(() => {
  loadAgents()
  startAutoRefresh()
})
</script>

<style scoped>
@import '@/styles/admin-forms.css';

.support-agents-list {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 20px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #00cccc;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 32px 0;
}

.stat-card {
  background: #1e1e1e;
  border: 1px solid #444;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: #2a2a2a;
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  margin: 0 0 4px 0;
  color: #00cccc;
  font-size: 1.8rem;
  font-weight: bold;
}

.stat-content p {
  margin: 0;
  color: #888;
  font-size: 0.9rem;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
  min-width: 150px;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.agent-card {
  background: #1e1e1e;
  border: 1px solid #444;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.agent-card:hover {
  background: #2a2a2a;
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 204, 204, 0.1);
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.agent-avatar {
  font-size: 3rem;
  color: #00cccc;
}

.agent-info h3 {
  margin: 0 0 4px 0;
  color: #ffffff;
  font-size: 1.2rem;
}

.agent-email {
  margin: 0 0 8px 0;
  color: #888;
  font-size: 0.9rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.status-badge.inactive {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.agent-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #888;
  font-size: 0.8rem;
}

.detail-value {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 500;
}

.detail-value.highlight {
  color: #00cccc;
}

.detail-value.success {
  color: #28a745;
}

.agent-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-top: 16px;
  border-top: 1px solid #444;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  color: #888;
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.rating-value {
  color: #00cccc;
  font-weight: bold;
}

.stars {
  color: #ffc107;
  font-size: 0.8rem;
}

.stat-value {
  color: #ffffff;
  font-weight: 500;
}

.agent-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-action {
  background: none;
  border: 1px solid #444;
  color: #888;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-action.primary:hover {
  border-color: #00cccc;
  color: #00cccc;
}

.btn-action.secondary:hover {
  border-color: #1c94e0;
  color: #1c94e0;
}

.btn-action.danger:hover {
  border-color: #dc3545;
  color: #dc3545;
}

.btn-action.success:hover {
  border-color: #28a745;
  color: #28a745;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top: 3px solid #00cccc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 12px 0;
  color: #ffffff;
  font-size: 1.3rem;
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 1rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .agents-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-section {
    flex-direction: column;
  }

  .filter-select {
    min-width: auto;
  }

  .agent-details {
    grid-template-columns: 1fr;
  }

  .agent-stats {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
