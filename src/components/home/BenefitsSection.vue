<template>
    <section class="benefits-section">
        <div class="benefits-info">
            <h2>Qué puedes hacer con Deuna?</h2>
            <p>Somos Maiko Studios, un equipo dedicado a crear soluciones digitales innovadoras para facilitar tus transacciones financieras.</p>
        </div>
        <div class="benefits-list">
            <div class="benefit-item">
                <span class="benefit-icon">✓</span>
                <span class="benefit-text">Datos rápidos para copiar</span>
            </div>
            <div class="benefit-item">
                <span class="benefit-icon">✓</span>
                <span class="benefit-text">Seguridad en transferencias</span>
            </div>
            <div class="benefit-item">
                <span class="benefit-icon">✓</span>
                <span class="benefit-text">Gestión sencilla desde tu panel</span>
            </div>
            <div class="benefit-item">
                <span class="benefit-icon">✓</span>
                <span class="benefit-text">Página personalizada instantánea</span>
            </div>
        </div>
    </section>
</template>

<style scoped>
.benefits-section {
    background: #181a20;
    border-radius: 32px;
    margin: 0 8vw 40px 8vw;
    padding: 40px 48px;
    display: flex;
    gap: 40px;
    align-items: flex-start;
    box-shadow: 0 2px 40px 0 rgba(0,204,204,0.10);
}

.benefits-info {
    flex: 1;
}

.benefits-info h2 {
    font-size: 1.5rem;
    margin-bottom: 8px;
    color: #fff;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
}

.benefits-info p {
    color: #bababa;
    font-size: 1rem;
    line-height: 1.6;
    font-family: 'Roboto', sans-serif;
}

.benefits-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.benefit-item {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    gap: 12px;
}

.benefit-icon {
    color: #00cccc;
    font-weight: bold;
    font-size: 1.2rem;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 204, 204, 0.1);
    border-radius: 50%;
    flex-shrink: 0;
}

.benefit-text {
    color: #bababa;
    font-size: 1rem;
    font-family: 'Roboto', sans-serif;
}

/* Mobile First - Responsive */
@media (max-width: 768px) {
    .benefits-section {
        flex-direction: column;
        margin: 0 4vw 30px 4vw;
        padding: 30px 24px;
        gap: 24px;
        border-radius: 24px;
    }
    
    .benefits-info h2 {
        font-size: 1.3rem;
        text-align: center;
    }
    
    .benefits-info p {
        font-size: 0.95rem;
        text-align: center;
    }
    
    .benefit-item {
        font-size: 1rem;
        gap: 10px;
    }
    
    .benefit-text {
        font-size: 0.95rem;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .benefits-section {
        margin: 0 6vw 35px 6vw;
        padding: 35px 40px;
        gap: 30px;
        border-radius: 28px;
    }
    
    .benefits-info h2 {
        font-size: 1.4rem;
    }
    
    .benefits-info p {
        font-size: 0.95rem;
    }
    
    .benefit-item {
        font-size: 1.05rem;
    }
    
    .benefit-text {
        font-size: 0.95rem;
    }
}

@media (min-width: 1025px) and (max-width: 1200px) {
    .benefits-section {
        margin: 0 7vw 38px 7vw;
        padding: 38px 44px;
    }
}

/* Animaciones */
@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.benefits-info {
    animation: slideInLeft 0.8s ease-out;
}

.benefits-list {
    animation: slideInRight 0.8s ease-out 0.2s both;
}

.benefit-item {
    animation: fadeInUp 0.6s ease-out both;
}

.benefit-item:nth-child(1) { animation-delay: 0.4s; }
.benefit-item:nth-child(2) { animation-delay: 0.5s; }
.benefit-item:nth-child(3) { animation-delay: 0.6s; }
.benefit-item:nth-child(4) { animation-delay: 0.7s; }
</style>
