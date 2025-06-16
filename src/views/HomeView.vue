<template>
    <div class="home">
        <h1 class="text-3xl font-bold mb-6">Bienvenido a Altoque App</h1>
        <p class="mb-4">Tu plataforma para gestionar tus servicios de manera eficiente.</p>

        <div class="mt-8">
            <router-link to="/login" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-4">
                Iniciar sesión
            </router-link>
        </div>
    </div>
</template>

<script setup>
// No se requiere lógica adicional
</script>

<style scoped>
.home {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}
</style>
