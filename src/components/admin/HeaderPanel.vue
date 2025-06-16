<template>
    <header class="header-panel">
        <div class="header-content">
            <h1 class="header-title">Panel de Administración</h1>
            <div class="header-actions">
                <span class="user-info">👤 {{ userEmail }}</span>
                <button @click="$emit('logout')" class="logout-btn">
                    🚪 Cerrar Sesión
                </button>
            </div>
        </div>
    </header>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
import { computed } from 'vue'

const authStore = useAuthStore()

const userEmail = computed(() => {
    return authStore.user?.email || 'Usuario'
})

defineEmits(['logout'])
</script>

<style scoped>
.header-panel {
    background: white;
    border-bottom: 1px solid #e0e0e0;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-title {
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
    font-weight: 600;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-info {
    color: #7f8c8d;
    font-size: 0.9rem;
}

.logout-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s ease;
}

.logout-btn:hover {
    background: #c0392b;
}
</style>