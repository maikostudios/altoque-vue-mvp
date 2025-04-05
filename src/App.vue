<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <nav class="bg-white shadow p-4 flex justify-between items-center">
      <h1 class="text-xl font-bold">Altoque App</h1>
      <ul class="flex gap-4">
        <li><router-link to="/login" class="hover:underline">Login</router-link></li>
        <li><router-link to="/admin" class="hover:underline">Admin Panel</router-link></li>
        <li><router-link to="/dashboard" class="hover:underline">User Dashboard</router-link></li>
        <li><router-link :to="{ name: 'PublicLanding', params: { username: 'ejemplo' } }"
            class="hover:underline">Landing Pública</router-link></li>
      </ul>
    </nav>

    <main class="p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// nada por ahora
</script>

<style scoped>
/* Puedes agregar estilos extra si quieres */
</style>
