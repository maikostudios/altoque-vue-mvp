<template>
    <div class="bank-accounts-management">
        <h2>💳 Gestión de Cuentas Bancarias</h2>
        <p>Aquí puedes gestionar las cuentas bancarias del sistema.</p>

        <div class="content-placeholder">
            <div class="placeholder-card">
                <h3>Funcionalidades disponibles:</h3>
                <ul>
                    <li>Ver todas las cuentas bancarias</li>
                    <li>Agregar nuevas cuentas</li>
                    <li>Editar cuentas existentes</li>
                    <li>Eliminar cuentas</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
// Declarar emits para evitar warnings
defineEmits(['showNotification'])
</script>

<style scoped>
.bank-accounts-management {
    padding: 2rem;
}

.content-placeholder {
    margin-top: 2rem;
}

.placeholder-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.placeholder-card h3 {
    margin-top: 0;
    color: #2c3e50;
}

.placeholder-card ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
}

.placeholder-card li {
    margin: 0.5rem 0;
    color: #7f8c8d;
}
</style>