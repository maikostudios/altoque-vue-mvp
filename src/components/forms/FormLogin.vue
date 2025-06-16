<template>
    <v-form @submit.prevent="handleSubmit">
        <v-text-field v-model="email" label="Correo Electrónico" type="email" autocomplete="email" :disabled="disabled"
            required />
        <v-text-field v-model="password" label="Contraseña" type="password" autocomplete="current-password"
            :disabled="disabled" required />
        <v-btn type="submit" color="primary" class="mt-4" block :loading="disabled" :disabled="disabled">
            Iniciar Sesión
        </v-btn>
    </v-form>
</template>

<script setup>
import { ref } from 'vue'

// Props
defineProps({
    disabled: {
        type: Boolean,
        default: false
    }
})

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