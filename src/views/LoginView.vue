<template>
    <v-container class="d-flex justify-center align-center fill-height">
        <v-card elevation="10" max-width="500" width="100%">
            <v-card-title class="text-h5 text-center">Inicia sesión</v-card-title>
            <v-card-text>
                <!-- Mostrar error si existe -->
                <v-alert v-if="authStore.error" type="error" class="mb-4">
                    {{ authStore.error }}
                </v-alert>

                <!-- Mostrar loading -->
                <v-progress-linear v-if="authStore.loading" indeterminate class="mb-4"></v-progress-linear>

                <FormLogin @login="handleLogin" :disabled="authStore.loading" />
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import FormLogin from '@/components/forms/FormLogin.vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async ({ email, password }) => {
    if (!email || !password) {
        alert("Por favor completa ambos campos.");
        return;
    }

    try {
        const success = await authStore.login(email.trim(), password)

        if (success) {
            console.log("Login exitoso, esperando rol...")

            // Esperar más tiempo para asegurar que el rol esté disponible
            let attempts = 0;
            const maxAttempts = 10;

            while (!authStore.role && attempts < maxAttempts) {
                console.log(`Intento ${attempts + 1}: esperando rol...`);
                await new Promise(resolve => setTimeout(resolve, 200));
                attempts++;
            }

            console.log("Rol final obtenido:", authStore.role);

            // Redireccionar según el rol del usuario
            if (authStore.role === "admin") {
                console.log("✅ Redirigiendo ADMIN a /admin");
                await router.push("/admin");
            } else if (authStore.role === "vendedor") {
                console.log("✅ Redirigiendo VENDEDOR a /vendedor");
                await router.push("/vendedor");
            } else if (authStore.role === "usuario") {
                console.log("✅ Redirigiendo USUARIO a /usuario");
                await router.push("/usuario");
            } else {
                console.log("✅ Redirigiendo USER por defecto a /dashboard, rol:", authStore.role);
                await router.push("/dashboard");
            }
        } else {
            console.log("❌ Login falló");
        }
    } catch (error) {
        console.error("Error en login:", error)
    }
}
</script>