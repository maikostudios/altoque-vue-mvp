<!-- filepath: d:\proyectosvuepersonal\maikostudiosWeb\altoque-vue-mvp\src\views\UserDashboardView.vue -->
<template>
    <div class="p-4 text-center text-lg">Vista Dashboard Usuario</div>

    <!-- Notificación -->
    <Notification v-if="notificationMessage" :message="notificationMessage" :type="notificationType"
        @close="notificationMessage = ''" />

    <!-- Lista de cuentas bancarias -->
    <div class="p-4 space-y-4">
        <h2 class="text-xl font-semibold">Cuentas Bancarias</h2>
        <div v-if="bankAccounts.length === 0" class="text-gray-500">No hay cuentas bancarias registradas.</div>
        <div v-for="(account, index) in bankAccounts" :key="index" class="border p-4 rounded-lg shadow-md">
            <BankCard :bankName="account.bankName" :accountHolder="account.accountHolder"
                :accountNumber="account.accountNumber" />
            <div class="flex justify-end space-x-2 mt-2">
                <button @click="editAccount(index)"
                    class="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 transition">
                    Editar
                </button>
                <button @click="deleteAccount(index)"
                    class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition">
                    Eliminar
                </button>
            </div>
        </div>
    </div>

    <!-- Generador de QR -->
    <div class="p-4">
        <QRGenerator username="maikostudios" />
    </div>

    <!-- Formulario para agregar/editar cuentas -->
    <div class="p-4">
        <UserForm :initialData="editingAccount" @save="handleSave" />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import BankCard from "../components/BankCard.vue";
import QRGenerator from "../components/QrGenerator.vue";
import UserForm from "../components/UserForm.vue";
import Notification from "../components/Notification.vue";

// Lista reactiva de cuentas bancarias
const bankAccounts = ref([]);

// Cuenta en edición
const editingAccount = ref(null);
const editingIndex = ref(null);

// Mensaje y tipo de notificación
const notificationMessage = ref("");
const notificationType = ref("success");

// Cargar cuentas bancarias desde localStorage al montar el componente
onMounted(() => {
    const savedAccounts = JSON.parse(localStorage.getItem("bankAccounts")) || [];
    bankAccounts.value = savedAccounts;
});

// Manejar el guardado de una nueva cuenta bancaria o edición
const handleSave = (data) => {
    if (editingIndex.value !== null) {
        // Editar cuenta existente
        bankAccounts.value[editingIndex.value] = data;
        editingIndex.value = null;
        editingAccount.value = null;
        notificationType.value = "success";
        notificationMessage.value = "Cuenta bancaria actualizada correctamente.";
    } else {
        // Agregar nueva cuenta
        bankAccounts.value.push(data);
        notificationType.value = "success";
        notificationMessage.value = "Cuenta bancaria agregada correctamente.";
    }
    localStorage.setItem("bankAccounts", JSON.stringify(bankAccounts.value)); // Guardar en localStorage
};

// Manejar la edición de una cuenta bancaria
const editAccount = (index) => {
    editingAccount.value = { ...bankAccounts.value[index] }; // Copiar datos de la cuenta
    editingIndex.value = index;
    notificationType.value = "info";
    notificationMessage.value = "Editando cuenta bancaria.";
};

// Manejar la eliminación de una cuenta bancaria
const deleteAccount = (index) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta cuenta bancaria?")) {
        bankAccounts.value.splice(index, 1); // Eliminar cuenta de la lista
        localStorage.setItem("bankAccounts", JSON.stringify(bankAccounts.value)); // Actualizar localStorage
        notificationType.value = "warning";
        notificationMessage.value = "Cuenta bancaria eliminada correctamente.";
    }
};
</script>