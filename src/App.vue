<template>

  <div class="min-h-screen bg-gray-100 text-gray-800">
    <nav class="bg-white shadow p-4 flex justify-between items-center">
      <h1 class="text-xl font-bold">Altoque App</h1>
      <ul class="flex gap-4">
        <li><router-link to="/" class="hover:underline">Home</router-link></li>
        <li><router-link to="/login" class="hover:underline">Login</router-link></li>
        <li v-if="authStore.role === 'admin'"><router-link to="/admin" class="hover:underline">Admin Panel</router-link>
        </li>
        <li v-if="authStore.user"><router-link to="/dashboard" class="hover:underline">Dashboard</router-link></li>
        <li v-if="authStore.role === 'vendedor'"><router-link to="/vendedor"
            class="hover:underline">Vendedor</router-link></li>
        <li><router-link :to="{ name: 'PublicLanding', params: { username: 'ejemplo' } }"
            class="hover:underline">Landing Pública</router-link></li>
      </ul>
      <button v-if="authStore.user" @click="logout" class="bg-red-500 text-white px-3 py-1 rounded">Cerrar
        sesión</button>
    </nav>

    <main class="p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from './store/auth'

const router = useRouter()
const authStore = useAuthStore()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Puedes agregar estilos extra si quieres */
</style>
