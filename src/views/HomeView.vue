<!-- src/views/HomeView.vue -->
<template>
    <div>
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <AboutContactSection />
    </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
import HeroSection from '../components/HeroSection.vue'
import FeaturesSection from '../components/FeaturesSection.vue'
import AboutContactSection from '../components/AboutContactSection.vue'
</script>