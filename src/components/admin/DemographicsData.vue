<template>
    <div class="demographics-data">
        <h2>📈 Datos Demográficos</h2>
        <p>Análisis demográfico de los usuarios del sistema.</p>

        <div class="demographics-grid">
            <div class="demo-card">
                <h3>📍 Por Ubicación</h3>
                <div class="demo-item">
                    <span>Santiago</span>
                    <span>45%</span>
                </div>
                <div class="demo-item">
                    <span>Valparaíso</span>
                    <span>20%</span>
                </div>
                <div class="demo-item">
                    <span>Concepción</span>
                    <span>15%</span>
                </div>
                <div class="demo-item">
                    <span>Temuco</span>
                    <span>10%</span>
                </div>
                <div class="demo-item">
                    <span>Otros</span>
                    <span>10%</span>
                </div>
            </div>

            <div class="demo-card">
                <h3>👥 Por Edad</h3>
                <div class="demo-item">
                    <span>18-25 años</span>
                    <span>30%</span>
                </div>
                <div class="demo-item">
                    <span>26-35 años</span>
                    <span>35%</span>
                </div>
                <div class="demo-item">
                    <span>36-45 años</span>
                    <span>20%</span>
                </div>
                <div class="demo-item">
                    <span>46+ años</span>
                    <span>15%</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineEmits(['showNotification'])
</script>

<style scoped>
.demographics-data {
    padding: 2rem;
}

.demographics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.demo-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.demo-card h3 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
}

.demo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #ecf0f1;
}

.demo-item:last-child {
    border-bottom: none;
}

.demo-item span:first-child {
    color: #2c3e50;
}

.demo-item span:last-child {
    color: #3498db;
    font-weight: bold;
}
</style>