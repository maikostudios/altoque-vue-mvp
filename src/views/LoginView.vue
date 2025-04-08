<template>
    <v-container class="d-flex justify-center align-center fill-height">
        <v-card elevation="10" max-width="500" width="100%">
            <v-card-title class="text-h5 text-center">Inicia sesión</v-card-title>
            <v-card-text>
                <FormLogin @login="handleLogin" />
            </v-card-text>
        </v-card>
    </v-container>

</template>

<script setup>
import FormLogin from '@/components/forms/FormLogin.vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const handleLogin = ({ email, password }) => {
    if (!email || !password) {
        alert("Por favor completa ambos campos.");
        return;
    }

    authStore.login(email.trim(), password)
}
</script>