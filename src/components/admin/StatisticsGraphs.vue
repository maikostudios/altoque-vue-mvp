<template>
    <div class="statistics-graphs">
        <h2>📊 Gráficos y Estadísticas</h2>
        <p>Visualización de datos y tendencias del sistema.</p>

        <div class="graphs-grid">
            <div class="graph-card">
                <h3>📈 Crecimiento de Usuarios</h3>
                <div class="mock-graph">
                    <div class="graph-bars">
                        <div class="bar" style="height: 30%"></div>
                        <div class="bar" style="height: 45%"></div>
                        <div class="bar" style="height: 60%"></div>
                        <div class="bar" style="height: 80%"></div>
                        <div class="bar" style="height: 100%"></div>
                        <div class="bar" style="height: 75%"></div>
                    </div>
                    <div class="graph-labels">
                        <span>Ene</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Abr</span>
                        <span>May</span>
                        <span>Jun</span>
                    </div>
                </div>
            </div>

            <div class="graph-card">
                <h3>💰 Ingresos Mensuales</h3>
                <div class="mock-graph">
                    <div class="graph-line">
                        <svg viewBox="0 0 300 150" class="line-chart">
                            <polyline points="0,120 50,100 100,80 150,60 200,40 250,30 300,20" fill="none"
                                stroke="#3498db" stroke-width="3" />
                        </svg>
                    </div>
                    <div class="graph-labels">
                        <span>Ene</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Abr</span>
                        <span>May</span>
                        <span>Jun</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineEmits(['showNotification'])
</script>

<style scoped>
.statistics-graphs {
    padding: 2rem;
}

.graphs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.graph-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.graph-card h3 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
}

.mock-graph {
    height: 200px;
    display: flex;
    flex-direction: column;
}

.graph-bars {
    display: flex;
    align-items: end;
    height: 150px;
    gap: 10px;
    padding: 0 10px;
}

.bar {
    flex: 1;
    background: linear-gradient(to top, #3498db, #5dade2);
    border-radius: 4px 4px 0 0;
    min-height: 20px;
}

.graph-line {
    height: 150px;
    padding: 10px;
}

.line-chart {
    width: 100%;
    height: 100%;
}

.graph-labels {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;
    font-size: 0.8rem;
    color: #7f8c8d;
}
</style>