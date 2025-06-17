<template>
    <div class="sidebar">
        <div class="sidebar-header">
            <h2>Panel Admin</h2>
        </div>
        <nav class="sidebar-nav">
            <ul>
                <li>
                    <button @click="$emit('changeView', 'dashboard')" class="nav-item"
                        :class="{ active: currentView === 'dashboard' }">
                        📊 Dashboard
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'usuarios')" class="nav-item"
                        :class="{ active: currentView === 'usuarios' }">
                        ➕ Crear Usuario
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'lista')" class="nav-item"
                        :class="{ active: currentView === 'lista' }">
                        👥 Lista de Usuarios
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'vendedores')" class="nav-item"
                        :class="{ active: currentView === 'vendedores' }">
                        🧑‍💼 Vendedores
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'tarjetas')" class="nav-item"
                        :class="{ active: currentView === 'tarjetas' }">
                        💳 Cuentas Bancarias
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'datos')" class="nav-item"
                        :class="{ active: currentView === 'datos' }">
                        📈 Datos Demográficos
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'estadisticas')" class="nav-item"
                        :class="{ active: currentView === 'estadisticas' }">
                        📊 Estadísticas
                    </button>
                </li>
                <li>
                    <button @click="$emit('changeView', 'configuraciones')" class="nav-item"
                        :class="{ active: currentView === 'configuraciones' }">
                        ⚙️ Configuraciones
                    </button>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script setup>

defineProps({
    currentView: {
        type: String,
        default: 'dashboard'
    }
})

defineEmits(['changeView'])
</script>

<style scoped>
.sidebar {
    position: fixed;
    top: 80px;
    /* Espacio para el navbar superior */
    left: 0;
    width: 280px;
    background: var(--color-surface);
    color: var(--color-text);
    min-height: calc(100vh - 80px);
    /* Ajustar altura */
    height: calc(100vh - 80px);
    padding: 1.5rem 0;
    border-right: 1px solid var(--color-border);
    box-shadow: var(--shadow-lg);
    font-family: var(--font-primary);
    z-index: 1000;
    overflow-y: auto;
}

.sidebar-header {
    padding: 0 1.5rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 1.5rem;
}

.sidebar-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-turquesa);
    font-family: var(--font-primary);
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
    border-radius: 0;
    margin: 0.25rem 0.75rem;
    border-radius: 1rem;
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