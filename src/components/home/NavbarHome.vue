<template>
    <nav class="navbar">
        <div class="logo">
            <span class="logo-d">D</span>euna
        </div>
        <div class="nav-links">
            <a href="#inicio" class="nav-link active">Inicio</a>
            <a href="#quienes-somos" class="nav-link">Quiénes Somos</a>
            <a href="#contacto" class="nav-link">Contacto</a>
        </div>
        <div class="nav-actions">
            <router-link to="/login" class="btn-login">Iniciar Sesión</router-link>
            <button class="btn-register">Regístrate</button>
        </div>
        
        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
            <span></span>
            <span></span>
            <span></span>
        </button>
        
        <!-- Mobile Menu -->
        <div class="mobile-menu" :class="{ active: mobileMenuOpen }">
            <a href="#inicio" class="mobile-nav-link" @click="closeMobileMenu">Inicio</a>
            <a href="#quienes-somos" class="mobile-nav-link" @click="closeMobileMenu">Quiénes Somos</a>
            <a href="#contacto" class="mobile-nav-link" @click="closeMobileMenu">Contacto</a>
            <router-link to="/login" class="mobile-btn-login" @click="closeMobileMenu">Iniciar Sesión</router-link>
            <button class="mobile-btn-register" @click="closeMobileMenu">Regístrate</button>
        </div>
    </nav>
</template>

<script setup>
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
    mobileMenuOpen.value = false
}
</script>

<style scoped>
.navbar {
    width: 100%;
    padding: 24px 8vw;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: transparent;
    position: relative;
    z-index: 1000;
}

.logo {
    font-weight: bold;
    font-size: 2rem;
    color: #00cccc;
    letter-spacing: -1.5px;
    font-family: 'Montserrat', sans-serif;
}

.logo-d {
    color: #00cccc;
}

.nav-links {
    display: flex;
    gap: 32px;
}

.nav-link {
    font-size: 1rem;
    color: #bababa;
    text-decoration: none;
    transition: color 0.2s;
    font-family: 'Montserrat', sans-serif;
}

.nav-link.active,
.nav-link:hover {
    color: #00cccc;
}

.nav-actions {
    display: flex;
    gap: 12px;
}

.btn-login, .btn-register {
    padding: 8px 22px;
    font-size: 1rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: box-shadow 0.2s, background 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Montserrat', sans-serif;
}

.btn-login {
    background: #1c94e0;
    color: #fff;
    box-shadow: 0 2px 16px 0 rgba(28,148,224,0.18);
}

.btn-login:hover {
    background: #00cccc;
    color: #fff;
}

.btn-register {
    background: #00cccc;
    color: #fff;
    box-shadow: 0 2px 16px 0 rgba(0,204,204,0.12);
}

.btn-register:hover {
    background: #1c94e0;
}

/* Mobile Menu Button */
.mobile-menu-btn {
    display: none;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
}

.mobile-menu-btn span {
    width: 25px;
    height: 3px;
    background: #00cccc;
    transition: all 0.3s;
}

/* Mobile Menu */
.mobile-menu {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: #121212;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    z-index: 999;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
}

.mobile-menu.active {
    transform: translateX(0);
}

.mobile-nav-link {
    font-size: 1.5rem;
    color: #bababa;
    text-decoration: none;
    transition: color 0.2s;
}

.mobile-nav-link:hover {
    color: #00cccc;
}

.mobile-btn-login, .mobile-btn-register {
    padding: 12px 32px;
    font-size: 1.2rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.mobile-btn-login {
    background: #1c94e0;
    color: #fff;
}

.mobile-btn-register {
    background: #00cccc;
    color: #fff;
}

/* Mobile First - Responsive */
@media (max-width: 768px) {
    .navbar {
        padding: 16px 4vw;
    }
    
    .logo {
        font-size: 1.5rem;
    }
    
    .nav-links,
    .nav-actions {
        display: none;
    }
    
    .mobile-menu-btn {
        display: flex;
    }
    
    .mobile-menu {
        display: flex;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .navbar {
        padding: 20px 6vw;
    }
    
    .nav-links {
        gap: 24px;
    }
    
    .nav-link {
        font-size: 0.9rem;
    }
    
    .btn-login, .btn-register {
        padding: 6px 18px;
        font-size: 0.9rem;
    }
}
</style>
