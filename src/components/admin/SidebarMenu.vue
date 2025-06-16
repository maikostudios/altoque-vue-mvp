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
                        👥 Usuarios
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
    width: 250px;
    background: #2c3e50;
    color: white;
    min-height: 100vh;
    padding: 1rem 0;
}

.sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid #34495e;
    margin-bottom: 1rem;
}

.sidebar-header h2 {
    margin: 0;
    font-size: 1.2rem;
    color: #ecf0f1;
}

.sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.nav-item {
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    color: #bdc3c7;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.nav-item:hover {
    background: #34495e;
    color: #ecf0f1;
}

.nav-item.active {
    background: #3498db;
    color: white;
}
</style>