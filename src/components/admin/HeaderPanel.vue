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
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 1.5rem 2rem;
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    animation: slideDown var(--duration-normal) var(--easing-default);
}

.header-title {
    margin: 0;
    color: var(--color-text);
    font-size: 1.75rem;
    font-weight: 600;
    font-family: var(--font-primary);
    background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.user-info {
    color: var(--color-text-secondary);
    font-size: 0.95rem;
    font-weight: 500;
    font-family: var(--font-secondary);
    padding: 0.5rem 1rem;
    background: var(--color-surface-variant);
    border-radius: 1rem;
    border: 1px solid var(--color-border);
}

.logout-btn {
    background: linear-gradient(135deg, #ff4444, #cc0000);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    font-family: var(--font-secondary);
    transition: all var(--duration-normal) var(--easing-default);
    box-shadow: var(--shadow-md);
}

.logout-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    background: linear-gradient(135deg, #ff6666, #ee0000);
}

.logout-btn:active {
    transform: translateY(0);
}

@keyframes slideDown {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .header-panel {
        padding: 1rem;
    }

    .header-title {
        font-size: 1.25rem;
    }

    .header-actions {
        gap: 1rem;
    }

    .user-info {
        display: none;
    }

    .logout-btn {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
    }
}
</style>