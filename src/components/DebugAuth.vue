<template>
    <div class="debug-auth">
        <h3>🔍 Debug de Autenticación</h3>
        <div class="debug-info">
            <p><strong>Usuario autenticado:</strong> {{ !!authStore.user }}</p>
            <p><strong>Email:</strong> {{ authStore.user?.email || 'N/A' }}</p>
            <p><strong>UID:</strong> {{ authStore.user?.uid || 'N/A' }}</p>
            <p><strong>Rol:</strong> {{ authStore.role || 'N/A' }}</p>
            <p><strong>Loading:</strong> {{ authStore.loading }}</p>
            <p><strong>Error:</strong> {{ authStore.error || 'N/A' }}</p>
        </div>

        <div class="debug-actions">
            <button @click="testLogin" :disabled="authStore.loading">
                Test Login
            </button>
            <button @click="testLogout" :disabled="!authStore.user">
                Test Logout
            </button>
            <button @click="refreshRole" :disabled="!authStore.user">
                Refresh Role
            </button>
            <button @click="forceAdmin" :disabled="!authStore.user">
                Force Admin
            </button>
            <button @click="goToAdmin" :disabled="authStore.role !== 'admin'">
                Go to Admin
            </button>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const testLogin = async () => {
    console.log("🧪 Test Login iniciado");
    const success = await authStore.login("maikostudios@gmail.com", "123456");
    console.log("🧪 Test Login resultado:", success);

    if (success) {
        console.log("🧪 Rol obtenido:", authStore.role);

        // Esperar y verificar rol
        setTimeout(() => {
            console.log("🧪 Rol después de 1 segundo:", authStore.role);
            if (authStore.role === "admin") {
                console.log("🧪 Navegando a /admin");
                router.push("/admin");
            }
        }, 1000);
    }
}

const testLogout = async () => {
    await authStore.logout();
    router.push("/login");
}

const refreshRole = async () => {
    if (authStore.user) {
        await authStore.fetchUserRole();
        console.log("🧪 Rol actualizado:", authStore.role);
    }
}

const forceAdmin = () => {
    console.log("🧪 Forzando rol admin...");
    authStore.role = "admin";
    console.log("🧪 Rol forzado a:", authStore.role);
}

const goToAdmin = () => {
    console.log("🧪 Navegando a /admin...");
    router.push("/admin");
}
</script>

<style scoped>
.debug-auth {
    background: #f0f0f0;
    border: 2px solid #ccc;
    padding: 1rem;
    margin: 1rem;
    border-radius: 8px;
}

.debug-info {
    background: white;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 4px;
}

.debug-info p {
    margin: 0.5rem 0;
}

.debug-actions {
    display: flex;
    gap: 0.5rem;
}

.debug-actions button {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.debug-actions button:disabled {
    background: #ccc;
    cursor: not-allowed;
}
</style>
