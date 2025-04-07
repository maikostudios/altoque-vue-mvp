<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h2 class="text-2xl font-bold mb-4 text-center">Iniciar sesión</h2>
            <form @submit.prevent="handleLogin">
                <div class="mb-4">
                    <label class="block mb-1 text-sm font-medium text-gray-700">Correo</label>
                    <input v-model="email" type="email" required class="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div class="mb-4">
                    <label class="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
                    <input v-model="password" type="password" required class="w-full px-3 py-2 border rounded-lg" />
                </div>
                <button type="submit"
                    class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Entrar</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = () => {
    // Simulamos usuarios
    const users = [
        { email: 'admin@altoque.cl', password: 'admin123', role: 'admin' },
        { email: 'user@altoque.cl', password: 'user123', role: 'user' }
    ]

    const user = users.find(u => u.email === email.value && u.password === password.value)

    if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        if (user.role === 'admin') {
            router.push('/admin')
        } else {
            router.push('/dashboard')
        }
    } else {
        alert('Credenciales incorrectas')
    }
}
</script>