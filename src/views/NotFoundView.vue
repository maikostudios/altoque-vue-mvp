<template>
  <div class="not-found">
    <h1 class="text-4xl font-bold mb-4">404</h1>
    <h2 class="text-2xl mb-6">Página no encontrada</h2>
    <p class="mb-8">Lo sentimos, la página que estás buscando no existe.</p>
    <router-link to="/" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
      Volver al inicio
    </router-link>
  </div>
</template>

<script setup>
// No se requiere lógica adicional
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
}
</style>