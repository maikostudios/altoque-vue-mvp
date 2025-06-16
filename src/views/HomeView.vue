<template>
    <div class="home">
        <NavbarHome />
        <HeroSectionHome />
        <TransferCounter />
        <BenefitsSection />
        <FooterHome />
        <WhatsAppButton />
    </div>
</template>

<script setup>
import NavbarHome from '@/components/home/NavbarHome.vue'
import HeroSectionHome from '@/components/home/HeroSectionHome.vue'
import TransferCounter from '@/components/home/TransferCounter.vue'
import BenefitsSection from '@/components/home/BenefitsSection.vue'
import FooterHome from '@/components/home/FooterHome.vue'
import WhatsAppButton from '@/components/home/WhatsAppButton.vue'
</script>

<style scoped>
.home {
    background: #121212;
    color: #fff;
    font-family: 'Montserrat', 'Roboto', 'Raleway', sans-serif;
    margin: 0;
    min-height: 100vh;
    overflow-x: hidden;
}

/* Asegurar que el layout sea fluido */
.home * {
    box-sizing: border-box;
}

/* Smooth scrolling */
html {
    scroll-behavior: smooth;
}

/* Links globales */
.home a {
    color: #00cccc;
    text-decoration: none;
    transition: color 0.2s;
}

.home a:hover {
    color: #1c94e0;
}
</style>
