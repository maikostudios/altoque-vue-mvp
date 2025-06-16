<template>
    <section class="hero">
        <div class="hero-text">
            <h1 class="hero-title">¡Transfiere Deuna!</h1>
            <p class="hero-subtitle">Realiza pagos y transferencias fácilmente en segundos.</p>
        </div>
        <div class="hero-image">
            <img src="/phone-mockup.svg" alt="Demo transferencia" class="hero-img" />
        </div>
    </section>
</template>

<style scoped>
.hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 72px 8vw 36px 8vw;
    min-height: 60vh;
}

.hero-text {
    max-width: 520px;
    flex: 1;
}

.hero-title {
    font-size: 3rem;
    font-weight: bold;
    line-height: 1.1;
    margin-bottom: 12px;
    color: #fff;
    font-family: 'Montserrat', sans-serif;
}

.hero-subtitle {
    font-size: 1.2rem;
    color: #bababa;
    margin-bottom: 24px;
    line-height: 1.5;
    font-family: 'Roboto', sans-serif;
}

.hero-image {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 400px;
}

.hero-img {
    width: 320px;
    min-width: 220px;
    max-width: 100%;
    height: auto;
    filter: drop-shadow(0 0 48px #00cccc55);
    border-radius: 32px;
    transition: transform 0.3s ease;
}

.hero-img:hover {
    transform: scale(1.02);
}

/* Mobile First - Responsive */
@media (max-width: 768px) {
    .hero {
        flex-direction: column;
        text-align: center;
        padding: 40px 4vw 20px 4vw;
        gap: 2rem;
    }

    .hero-text {
        max-width: 100%;
        order: 2;
    }

    .hero-title {
        font-size: 2.2rem;
        margin-bottom: 16px;
    }

    .hero-subtitle {
        font-size: 1.1rem;
        margin-bottom: 20px;
    }

    .hero-image {
        order: 1;
        max-width: 280px;
        margin: 0 auto;
    }

    .hero-img {
        width: 280px;
        min-width: 200px;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .hero {
        padding: 60px 6vw 30px 6vw;
        gap: 2rem;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .hero-subtitle {
        font-size: 1.1rem;
    }

    .hero-img {
        width: 280px;
    }
}

@media (min-width: 1025px) and (max-width: 1200px) {
    .hero {
        padding: 64px 7vw 32px 7vw;
    }

    .hero-title {
        font-size: 2.8rem;
    }
}

/* Animaciones */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInRight {
    from {
        opacity: 0;
        transform: translateX(30px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.hero-text {
    animation: fadeInUp 0.8s ease-out;
}

.hero-image {
    animation: fadeInRight 0.8s ease-out 0.2s both;
}
</style>
