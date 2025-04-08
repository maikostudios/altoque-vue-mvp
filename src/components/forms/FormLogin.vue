<template>
    <v-form @submit.prevent="handleSubmit">
        <v-text-field v-model="email" label="Correo Electrónico" type="email" required />
        <v-text-field v-model="password" label="Contraseña" type="password" required />
        <v-btn type="submit" color="primary" class="mt-4" block>
            Iniciar Sesión
        </v-btn>
    </v-form>
</template>

<script setup>
import { ref } from 'vue'

// 👉 Emitir evento personalizado
const emit = defineEmits(['login'])

const email = ref('')
const password = ref('')

const handleSubmit = () => {
    emit('login', {
        email: email.value,
        password: password.value
    })
}
</script>

<style scoped></style>