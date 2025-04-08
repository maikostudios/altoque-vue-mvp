<template>
    <form @submit.prevent="handleSubmit" class="bg-white shadow-md rounded-lg p-4 max-w-md mx-auto">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Agregar/Editar Cuenta Bancaria</h3>
        <div class="mb-4">
            <label for="bankName" class="block text-sm font-medium text-gray-700">Nombre del Banco</label>
            <input v-model="form.bankName" type="text" id="bankName"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required />
        </div>
        <div class="mb-4">
            <label for="accountHolder" class="block text-sm font-medium text-gray-700">Titular de la Cuenta</label>
            <input v-model="form.accountHolder" type="text" id="accountHolder"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required />
        </div>
        <div class="mb-4">
            <label for="accountNumber" class="block text-sm font-medium text-gray-700">Número de Cuenta</label>
            <input v-model="form.accountNumber" type="text" id="accountNumber"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required />
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            Guardar
        </button>
    </form>
</template>

<script setup>
import { reactive, toRefs } from "vue";

// Props para recibir datos iniciales (opcional para edición)
defineProps({
    initialData: {
        type: Object,
        default: () => ({
            bankName: "",
            accountHolder: "",
            accountNumber: "",
        }),
    },
});

// Emitir evento al guardar
const emit = defineEmits(["save"]);

// Formulario reactivo
const form = reactive({ ...initialData });

// Manejar el envío del formulario
const handleSubmit = () => {
    emit("save", { ...form });
};
</script>