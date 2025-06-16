<template>
    <div class="dashboard">
        <h1 class="text-3xl font-bold mb-6">Dashboard de Usuario</h1>
        <p>Bienvenido a tu panel de control.</p>

        <!-- Aquí irá el contenido del dashboard -->
        <div class="mt-6 p-4 bg-white rounded shadow">
            <h2 class="text-xl font-semibold mb-4">Resumen de actividad</h2>
            <p>Contenido del dashboard...</p>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '../store/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.dashboard {
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
}
</style>
