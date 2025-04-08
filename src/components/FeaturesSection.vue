<template>
    <section class="features">
        <h2>¿Qué puedes hacer con Deuna?</h2>
        <ul class="features-list">
            <li><i class="bi bi-clipboard-check"></i> Datos rápidos para copiar</li>
            <li><i class="bi bi-shield-lock"></i> Seguridad en transferencias</li>
            <li><i class="bi bi-phone"></i> Gestión sencilla desde tu panel</li>
            <li><i class="bi bi-globe"></i> Página personalizada instantánea</li>
        </ul>
    </section>
</template>

<style scoped>
.features {
    background: #181818;
    color: white;
    padding: 2rem 1rem;
    text-align: center;
}

.features h2 {
    color: #00cccc;
    margin-bottom: 1rem;
}

.features-list {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

.features-list li {
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    justify-content: center;
}

.features-list i {
    font-size: 1.4rem;
    color: #00cccc;
}

@media (min-width: 600px) {
    .features-list {
        grid-template-columns: 1fr 1fr;
    }
}
</style>