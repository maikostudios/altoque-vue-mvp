<template>
    <div class="settings">
        <h2>⚙️ Configuraciones del Sistema</h2>
        <p>Gestiona las configuraciones generales de la aplicación.</p>

        <div class="settings-sections">
            <div class="settings-card">
                <h3>🔧 Configuraciones Generales</h3>
                <div class="setting-item">
                    <label>Nombre de la aplicación:</label>
                    <input type="text" value="De Una App" class="setting-input">
                </div>
                <div class="setting-item">
                    <label>Email de contacto:</label>
                    <input type="email" value="admin@deuna.com" class="setting-input">
                </div>
                <div class="setting-item">
                    <label>Modo mantenimiento:</label>
                    <input type="checkbox" class="setting-checkbox">
                </div>
            </div>

            <div class="settings-card">
                <h3>🔐 Configuraciones de Seguridad</h3>
                <div class="setting-item">
                    <label>Tiempo de sesión (minutos):</label>
                    <input type="number" value="60" class="setting-input">
                </div>
                <div class="setting-item">
                    <label>Autenticación de dos factores:</label>
                    <input type="checkbox" class="setting-checkbox">
                </div>
                <div class="setting-item">
                    <label>Logs de auditoría:</label>
                    <input type="checkbox" checked class="setting-checkbox">
                </div>
            </div>

            <div class="settings-card">
                <h3>📧 Configuraciones de Notificaciones</h3>
                <div class="setting-item">
                    <label>Notificaciones por email:</label>
                    <input type="checkbox" checked class="setting-checkbox">
                </div>
                <div class="setting-item">
                    <label>Notificaciones push:</label>
                    <input type="checkbox" class="setting-checkbox">
                </div>
                <div class="setting-item">
                    <label>Frecuencia de reportes:</label>
                    <select class="setting-select">
                        <option>Diario</option>
                        <option selected>Semanal</option>
                        <option>Mensual</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="settings-actions">
            <button class="btn-save">💾 Guardar Cambios</button>
            <button class="btn-reset">🔄 Restablecer</button>
        </div>
    </div>
</template>

<script setup>
defineEmits(['showNotification'])
</script>

<style scoped>
.settings {
    padding: 2rem;
}

.settings-sections {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
}

.settings-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.settings-card h3 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;
    padding: 0.5rem 0;
}

.setting-item label {
    color: #2c3e50;
    font-weight: 500;
}

.setting-input,
.setting-select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 150px;
}

.setting-checkbox {
    width: auto;
    transform: scale(1.2);
}

.settings-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
}

.btn-save,
.btn-reset {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.3s ease;
}

.btn-save {
    background: #27ae60;
    color: white;
}

.btn-save:hover {
    background: #229954;
}

.btn-reset {
    background: #95a5a6;
    color: white;
}

.btn-reset:hover {
    background: #7f8c8d;
}
</style>