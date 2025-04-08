<template>
    <section class="hero">
        <div class="hero-text">
            <h1>¡Transfiere Deuna!</h1>
            <p>Realiza pagos y transferencias fácilmente en segundos.</p>
        </div>
        <div class="hero-media">
            <img src="/src/assets/vue.svg" alt="Demo transferencia" class="mockup" />
        </div>
        <a href="https://wa.me/56912345678" class="whatsapp-float" target="_blank">
            <i class="bi bi-whatsapp"></i>
        </a>
    </section>
</template>

<style scoped>
.hero {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: radial-gradient(circle at center, #1a1a1a, #121212);
    padding: 2rem;
    color: white;
    text-align: center;
    position: relative;
}

.hero-text h1 {
    font-size: 2.4rem;
    margin-bottom: 0.5rem;
}

.hero-text p {
    font-size: 1.1rem;
    color: #cccccc;
}

.hero-media .mockup {
    width: 100%;
    max-width: 300px;
    margin-top: 1.5rem;
    transition: transform 0.3s ease;
}

.hero-media .mockup:hover {
    transform: scale(1.03);
}

.whatsapp-float {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    background: #00cccc;
    padding: 0.7rem;
    border-radius: 50%;
    font-size: 1.5rem;
    color: #fff;
    z-index: 1000;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}
</style>