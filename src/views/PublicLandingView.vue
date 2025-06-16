<template>
    <div class="public-landing">
        <h1 class="text-3xl font-bold mb-6">Perfil de {{ username }}</h1>

        <div class="profile-card p-6 bg-white rounded shadow">
            <h2 class="text-xl font-semibold mb-4">Información de perfil</h2>
            <p>Esta es la página pública de {{ username }}</p>

            <!-- Componente QR -->
            <div class="mt-6">
                <QrGenerator :username="username" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import QrGenerator from '../components/QrGenerator.vue'

const route = useRoute()
const username = ref(route.params.username || 'usuario')

onMounted(() => {
    // Aquí podrías cargar datos del perfil desde la base de datos
    console.log(`Cargando perfil para: ${username.value}`)
})
</script>

<style scoped>
.public-landing {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
}

.profile-card {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
