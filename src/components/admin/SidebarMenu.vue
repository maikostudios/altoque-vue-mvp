<template>
    <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
        <!-- Botón de colapso -->
        <button @click="toggleSidebar" class="collapse-btn" :title="isCollapsed ? 'Expandir menú' : 'Colapsar menú'">
            <i class="bi" :class="isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
        </button>

        <div class="sidebar-header">
            <h2 v-show="!isCollapsed">Panel Admin</h2>
            <div v-show="isCollapsed" class="logo-collapsed">PA</div>
        </div>

        <nav class="sidebar-nav">
            <ul>
                <li>
                    <button @click="$emit('changeView', 'dashboard')" class="nav-item"
                        :class="{ active: currentView === 'dashboard' }" :title="isCollapsed ? 'Dashboard' : ''">
                        <i class="nav-icon">📊</i>
                        <span v-show="!isCollapsed" class="nav-text">Dashboard</span>
                    </button>
                </li>
                <li>
                    <button @click="showPerformanceDashboard" class="nav-item performance-btn"
                        :title="isCollapsed ? 'Performance Monitor' : ''">
                        <i class="nav-icon">🔍</i>
                        <span v-show="!isCollapsed" class="nav-text">Performance</span>
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'usuarios')" class="nav-item"
                        :class="{ active: currentView === 'usuarios' }" :title="isCollapsed ? 'Crear Usuario' : ''">
                        <i class="nav-icon">➕</i>
                        <span v-show="!isCollapsed" class="nav-text">Crear Usuario</span>
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'lista')" class="nav-item"
                        :class="{ active: currentView === 'lista' }" :title="isCollapsed ? 'Lista de Usuarios' : ''">
                        <i class="nav-icon">👥</i>
                        <span v-show="!isCollapsed" class="nav-text">Lista de Usuarios</span>
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'vendedores')" class="nav-item"
                        :class="{ active: currentView === 'vendedores' }" :title="isCollapsed ? 'Vendedores' : ''">
                        <i class="nav-icon">🧑‍💼</i>
                        <span v-show="!isCollapsed" class="nav-text">Vendedores</span>
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'soporte')" class="nav-item"
                        :class="{ active: currentView === 'soporte' }"
                        :title="isCollapsed ? 'Crear Agente Soporte' : ''">
                        <i class="nav-icon">🎧</i>
                        <span v-show="!isCollapsed" class="nav-text">Crear Agente Soporte</span>
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'lista-soporte')" class="nav-item"
                        :class="{ active: currentView === 'lista-soporte' }"
                        :title="isCollapsed ? 'Lista Agentes Soporte' : ''">
                        <i class="nav-icon">📋</i>
                        <span v-show="!isCollapsed" class="nav-text">Lista Agentes Soporte</span>
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'gestion-tickets')" class="nav-item"
                        :class="{ active: currentView === 'gestion-tickets' }"
                        :title="isCollapsed ? 'Gestión de Tickets' : ''">
                        <i class="nav-icon">🎫</i>
                        <span v-show="!isCollapsed" class="nav-text">Gestión de Tickets</span>
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'verificacion-ids')" class="nav-item"
                        :class="{ active: currentView === 'verificacion-ids' }"
                        :title="isCollapsed ? 'Verificación de IDs' : ''">
                        <i class="nav-icon">🛡️</i>
                        <span v-show="!isCollapsed" class="nav-text">Verificación de IDs</span>
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'audit-logs')" class="nav-item"
                        :class="{ active: currentView === 'audit-logs' }"
                        :title="isCollapsed ? 'Logs de Auditoría' : ''">
                        <i class="nav-icon">📋</i>
                        <span v-show="!isCollapsed" class="nav-text">Logs de Auditoría</span>
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'tarjetas')" class="nav-item"
                        :class="{ active: currentView === 'tarjetas' }" :title="isCollapsed ? 'Cuentas Bancarias' : ''">
                        <i class="nav-icon">💳</i>
                        <span v-show="!isCollapsed" class="nav-text">Cuentas Bancarias</span>
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'datos')" class="nav-item"
                        :class="{ active: currentView === 'datos' }" :title="isCollapsed ? 'Datos Demográficos' : ''">
                        <i class="nav-icon">📈</i>
                        <span v-show="!isCollapsed" class="nav-text">Datos Demográficos</span>
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'estadisticas')" class="nav-item"
                        :class="{ active: currentView === 'estadisticas' }" :title="isCollapsed ? 'Estadísticas' : ''">
                        <i class="nav-icon">📊</i>
                        <span v-show="!isCollapsed" class="nav-text">Estadísticas</span>
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'configuraciones')" class="nav-item"
                        :class="{ active: currentView === 'configuraciones' }"
                        :title="isCollapsed ? 'Configuraciones' : ''">
                        <i class="nav-icon">⚙️</i>
                        <span v-show="!isCollapsed" class="nav-text">Configuraciones</span>
                    </button>
                </li>
            </ul>
        </nav>

        <!-- ✅ ETAPA 6: Performance Dashboard Modal -->
        <PerformanceDashboard v-model="showPerformanceModal" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PerformanceDashboard from '@/components/monitoring/PerformanceDashboard.vue'

defineProps({
    currentView: {
        type: String,
        default: 'dashboard'
    }
})

defineEmits(['changeView'])

// Estado del sidebar colapsado
const isCollapsed = ref(false)

// ✅ ETAPA 6: Performance Dashboard
const showPerformanceModal = ref(false)

// Función para alternar el estado del sidebar
const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
    // Guardar preferencia en localStorage
    localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString())

    // Emitir evento para que el componente padre ajuste el layout
    document.dispatchEvent(new CustomEvent('sidebar-toggle', {
        detail: { collapsed: isCollapsed.value }
    }))
}

// ✅ ETAPA 6: Función para mostrar Performance Dashboard
const showPerformanceDashboard = () => {
    showPerformanceModal.value = true
}

// Cargar preferencia guardada al montar el componente
onMounted(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
        isCollapsed.value = savedState === 'true'
    }

    // Detectar pantallas grandes para expandir automáticamente
    const mediaQuery = window.matchMedia('(min-width: 1200px)')
    if (mediaQuery.matches && savedState === null) {
        isCollapsed.value = false
    }

    // Emitir estado inicial
    document.dispatchEvent(new CustomEvent('sidebar-toggle', {
        detail: { collapsed: isCollapsed.value }
    }))
})
</script>

<style scoped>
.sidebar {
    position: fixed;
    top: 80px;
    left: 0;
    width: 280px;
    background: var(--color-surface);
    color: var(--color-text);
    min-height: calc(100vh - 80px);
    height: calc(100vh - 80px);
    padding: 1.5rem 0;
    border-right: 1px solid var(--color-border);
    box-shadow: var(--shadow-lg);
    font-family: var(--font-primary);
    z-index: 1000;
    overflow-y: auto;
    transition: width 0.3s ease, padding 0.3s ease;
}

.sidebar.collapsed {
    width: 70px;
    padding: 1.5rem 0.5rem;
}

/* Botón de colapso */
.collapse-btn {
    position: absolute;
    top: 1rem;
    right: -15px;
    width: 30px;
    height: 30px;
    background: var(--color-turquesa);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;
    z-index: 1001;
}

.collapse-btn:hover {
    background: var(--color-azul);
    transform: scale(1.1);
    box-shadow: var(--shadow-lg);
}

.sidebar-header {
    padding: 0 1.5rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 1.5rem;
    text-align: center;
    transition: padding 0.3s ease;
}

.sidebar.collapsed .sidebar-header {
    padding: 0 0.5rem 1rem;
}

.sidebar-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-turquesa);
    font-family: var(--font-primary);
    transition: opacity 0.3s ease;
}

.logo-collapsed {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--color-turquesa);
    background: var(--color-surface-variant);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border: 2px solid var(--color-turquesa);
}

.sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.nav-item {
    width: 100%;
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    color: var(--color-text-secondary);
    text-align: left;
    cursor: pointer;
    transition: all var(--duration-normal) var(--easing-default);
    font-size: 0.95rem;
    font-weight: 500;
    font-family: var(--font-secondary);
    border-radius: 1rem;
    margin: 0.25rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
}

.sidebar.collapsed .nav-item {
    padding: 1rem 0.5rem;
    margin: 0.25rem 0.25rem;
    justify-content: center;
    gap: 0;
}

.nav-icon {
    font-size: 1.1rem;
    min-width: 20px;
    text-align: center;
}

.nav-text {
    transition: opacity 0.3s ease;
    white-space: nowrap;
}

.nav-item:hover {
    background: var(--color-surface-variant);
    color: var(--color-text);
    transform: translateX(4px);
    box-shadow: var(--shadow-md);
}

.nav-item.active {
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    color: white;
    box-shadow: var(--shadow-glow);
    transform: translateX(8px);
}

.nav-item.active:hover {
    transform: translateX(8px) scale(1.02);
}

/* Animación de entrada */
.sidebar {
    animation: slideInLeft var(--duration-normal) var(--easing-default);
}

.nav-item {
    animation: fadeIn var(--duration-slow) var(--easing-default);
    animation-fill-mode: both;
}

.nav-item:nth-child(1) {
    animation-delay: 0.1s;
}

.nav-item:nth-child(2) {
    animation-delay: 0.2s;
}

.nav-item:nth-child(3) {
    animation-delay: 0.3s;
}

.nav-item:nth-child(4) {
    animation-delay: 0.4s;
}

.nav-item:nth-child(5) {
    animation-delay: 0.5s;
}

.nav-item:nth-child(6) {
    animation-delay: 0.6s;
}

.nav-item:nth-child(7) {
    animation-delay: 0.7s;
}

.nav-item:nth-child(8) {
    animation-delay: 0.8s;
}

@keyframes slideInLeft {
    from {
        transform: translateX(-100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Mobile First - Responsive Design */
@media (max-width: 768px) {
    .sidebar {
        position: relative;
        top: 0;
        /* Reset top en móvil */
        width: 100%;
        height: auto;
        min-height: auto;
        border-right: none;
        border-bottom: 1px solid var(--color-border);
        z-index: 100;
    }

    .sidebar-nav ul {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        padding: 0 1rem;
    }

    .nav-item {
        margin: 0;
        padding: 0.75rem 1rem;
        font-size: 0.85rem;
        border-radius: 0.75rem;
        flex: 1;
        min-width: 120px;
        text-align: center;
    }

    .nav-item:hover,
    .nav-item.active {
        transform: none;
    }

    .nav-item.active {
        transform: scale(1.02);
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .sidebar {
        width: 260px;
    }
}

@media (min-width: 1025px) {
    .sidebar {
        width: 280px;
    }
}

@media (max-width: 768px) {
    .sidebar {
        width: 100%;
        min-height: auto;
        padding: 1rem 0;
    }

    .nav-item {
        margin: 0.25rem 0.5rem;
        padding: 0.75rem 1rem;
    }
}
</style>