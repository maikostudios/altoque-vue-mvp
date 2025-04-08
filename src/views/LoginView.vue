<!-- filepath: d:\proyectosvuepersonal\maikostudiosWeb\altoque-vue-mvp\src\views\LoginView.vue -->
<template>
    <div class="p-4 max-w-md mx-auto">
        <h2 class="text-xl font-semibold text-center mb-4">Iniciar Sesión</h2>
        <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
                <label for="username" class="block text-sm font-medium text-gray-700">Usuario</label>
                <input v-model="username" type="text" id="username"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required />
            </div>
            <div>
                <label for="role" class="block text-sm font-medium text-gray-700">Rol</label>
                <select v-model="role" id="role"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>
            <button type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                Iniciar Sesión
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const username = ref("");
const role = ref("user");
const router = useRouter();

const handleLogin = () => {
    // Guardar usuario y rol en localStorage
    const user = { username: username.value, role: role.value };
    localStorage.setItem("user", JSON.stringify(user));

    // Redirigir según el rol
    if (role.value === "admin") {
        router.push("/admin");
    } else {
        router.push("/dashboard");
    }
};
</script>