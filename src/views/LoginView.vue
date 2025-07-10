<template>
    <div class="login-page">
        <!-- Background with gradient -->
        <div class="login-background">
            <div class="gradient-overlay"></div>
        </div>

        <!-- Navigation -->
        <nav class="login-nav">
            <router-link to="/" class="nav-logo">
                <span class="logo-d">D</span>euna
            </router-link>
            <div class="nav-links">
                <router-link to="/" class="nav-link">← Volver al inicio</router-link>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="login-container">
            <div class="login-card">
                <!-- Header -->
                <div class="login-header">
                    <h1 class="login-title">Iniciar Sesión</h1>
                    <p class="login-subtitle">Accede a tu cuenta de Deuna</p>
                </div>

                <!-- Error Alert -->
                <div v-if="authStore.error" class="error-alert">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">{{ authStore.error }}</div>
                </div>

                <!-- Loading Bar -->
                <div v-if="authStore.loading" class="loading-bar">
                    <div class="loading-progress"></div>
                </div>

                <!-- Login Form -->
                <form @submit.prevent="handleSubmit" class="login-form">
                    <div class="form-group">
                        <label for="email" class="form-label">Correo Electrónico</label>
                        <input id="email" v-model="email" type="email" class="form-input" placeholder="tu@email.com"
                            :disabled="authStore.loading" required />
                    </div>

                    <div class="form-group">
                        <label for="password" class="form-label">Contraseña</label>
                        <input id="password" v-model="password" type="password" class="form-input"
                            placeholder="••••••••" :disabled="authStore.loading" required />
                    </div>

                    <button type="submit" class="login-btn" :disabled="authStore.loading"
                        :class="{ loading: authStore.loading }">
                        <span v-if="!authStore.loading">Iniciar Sesión</span>
                        <span v-else class="loading-text">
                            <div class="spinner"></div>
                            Iniciando sesión...
                        </span>
                    </button>
                </form>

                <!-- Divider -->
                <div class="divider">
                    <span>o</span>
                </div>

                <!-- Google Sign In -->
                <button @click="handleGoogleSignIn" class="google-btn" :disabled="authStore.loading">
                    <svg class="google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span v-if="!authStore.loading">Continuar con Google</span>
                    <span v-else>Autenticando...</span>
                </button>

                <!-- Footer -->
                <div class="login-footer">
                    <p class="footer-text">
                        ¿No tienes cuenta?
                        <a href="#" class="footer-link">Regístrate con Google</a>
                    </p>
                </div>
            </div>

            <!-- Side Info -->
            <div class="login-info">
                <div class="info-content">
                    <h2 class="info-title">¡Bienvenido de vuelta!</h2>
                    <p class="info-description">
                        Accede a tu panel de control y gestiona tus transferencias de manera rápida y segura.
                    </p>
                    <div class="info-features">
                        <div class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Transferencias instantáneas</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Seguridad garantizada</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Panel de control intuitivo</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Form data
const email = ref('')
const password = ref('')

const handleSubmit = async () => {
    if (!email.value || !password.value) {
        authStore.error = "Por favor completa ambos campos."
        return;
    }

    try {
        const success = await authStore.login(email.value.trim(), password.value)

        if (success) {
            console.log("Login exitoso, esperando rol...")

            // Esperar más tiempo para asegurar que el rol esté disponible
            let attempts = 0;
            const maxAttempts = 10;

            while (!authStore.role && attempts < maxAttempts) {
                console.log(`Intento ${attempts + 1}: esperando rol...`);
                await new Promise(resolve => setTimeout(resolve, 200));
                attempts++;
            }

            console.log("Rol final obtenido:", authStore.role);

            // Redireccionar según el rol del usuario
            if (authStore.role === "admin") {
                console.log("✅ Redirigiendo ADMIN a /admin");
                await router.push("/admin");
            } else if (authStore.role === "vendedor") {
                console.log("✅ Redirigiendo VENDEDOR a /vendedor");
                await router.push("/vendedor");
            } else if (authStore.role === "usuario") {
                console.log("✅ Redirigiendo USUARIO a /usuario");
                await router.push("/usuario");
            } else {
                console.log("✅ Redirigiendo USER por defecto a /dashboard, rol:", authStore.role);
                await router.push("/dashboard");
            }
        } else {
            console.log("❌ Login falló");
        }
    } catch (error) {
        console.error("Error en login:", error)
    }
}

// ✅ NUEVO: Manejo de autenticación con Google
const handleGoogleSignIn = async () => {
    try {
        const result = await authStore.signInWithGoogle()

        if (result.success) {
            console.log("✅ Autenticación con Google exitosa")

            if (result.needsOnboarding) {
                console.log("📝 Usuario necesita completar onboarding")
                // TODO: Mostrar UserInfoModal aquí
                // Por ahora redirigimos al dashboard
                await router.push("/dashboard")
            } else {
                console.log("👤 Usuario existente, redirigiendo...")

                // Redireccionar según el rol del usuario
                if (authStore.role === "admin") {
                    await router.push("/admin")
                } else if (authStore.role === "vendedor") {
                    await router.push("/vendedor")
                } else if (authStore.role === "soporte") {
                    await router.push("/support-dashboard")
                } else {
                    await router.push("/dashboard")
                }
            }
        }
    } catch (error) {
        console.error("❌ Error en autenticación con Google:", error)
    }
}
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    background: #121212;
    color: #fff;
    font-family: 'Montserrat', 'Roboto', sans-serif;
    position: relative;
    overflow: hidden;
}

/* Background */
.login-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 20%, rgba(0, 204, 204, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 70% 80%, rgba(28, 148, 224, 0.1) 0%, transparent 50%),
        #121212;
}

.gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0, 204, 204, 0.05) 0%, rgba(28, 148, 224, 0.05) 100%);
}

/* Navigation */
.login-nav {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 8vw;
}

.nav-logo {
    font-weight: bold;
    font-size: 2rem;
    color: #00cccc;
    letter-spacing: -1.5px;
    text-decoration: none;
    font-family: 'Montserrat', sans-serif;
}

.logo-d {
    color: #00cccc;
}

.nav-link {
    color: #bababa;
    text-decoration: none;
    font-size: 1rem;
    transition: color 0.2s;
    font-family: 'Roboto', sans-serif;
}

.nav-link:hover {
    color: #00cccc;
}

/* Main Container */
.login-container {
    position: relative;
    z-index: 10;
    display: flex;
    min-height: calc(100vh - 100px);
    padding: 0 8vw;
    gap: 4rem;
    align-items: center;
}

/* Login Card */
.login-card {
    flex: 1;
    max-width: 480px;
    background: rgba(30, 30, 30, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 3rem;
    box-shadow: 0 20px 40px rgba(0, 204, 204, 0.1);
    border: 1px solid rgba(0, 204, 204, 0.1);
}

.login-header {
    text-align: center;
    margin-bottom: 2rem;
}

.login-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #00cccc, #1c94e0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: 'Montserrat', sans-serif;
}

.login-subtitle {
    color: #bababa;
    font-size: 1.1rem;
    margin: 0;
    font-family: 'Roboto', sans-serif;
}

/* Error Alert */
.error-alert {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(255, 68, 68, 0.1);
    border: 1px solid rgba(255, 68, 68, 0.3);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1.5rem;
}

.error-icon {
    font-size: 1.2rem;
}

.error-message {
    color: #ff6b6b;
    font-size: 0.95rem;
    font-family: 'Roboto', sans-serif;
}

/* Loading Bar */
.loading-bar {
    width: 100%;
    height: 4px;
    background: rgba(0, 204, 204, 0.2);
    border-radius: 2px;
    margin-bottom: 1.5rem;
    overflow: hidden;
}

.loading-progress {
    height: 100%;
    background: linear-gradient(90deg, #00cccc, #1c94e0);
    border-radius: 2px;
    animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
    0% {
        transform: translateX(-100%);
    }

    50% {
        transform: translateX(0%);
    }

    100% {
        transform: translateX(100%);
    }
}

/* Form Styles */
.login-form {
    margin-bottom: 2rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    color: #bababa;
    font-size: 0.95rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-family: 'Roboto', sans-serif;
}

.form-input {
    width: 100%;
    background: rgba(21, 24, 28, 0.8);
    border: 1px solid rgba(0, 204, 204, 0.2);
    border-radius: 12px;
    color: #fff;
    padding: 1rem 1.25rem;
    font-size: 1rem;
    font-family: 'Roboto', sans-serif;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.form-input:focus {
    outline: none;
    border-color: #00cccc;
    box-shadow: 0 0 0 3px rgba(0, 204, 204, 0.1);
    background: rgba(21, 24, 28, 1);
}

.form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.form-input::placeholder {
    color: #666;
}

/* Login Button */
.login-btn {
    width: 100%;
    background: linear-gradient(135deg, #00cccc, #1c94e0);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Montserrat', sans-serif;
    position: relative;
    overflow: hidden;
}

.login-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 204, 204, 0.3);
}

/* Divider */
.divider {
    margin: 2rem 0;
    text-align: center;
    position: relative;
}

.divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
}

.divider span {
    background: rgba(30, 30, 30, 0.9);
    padding: 0 1rem;
    color: #bababa;
    font-size: 0.9rem;
    position: relative;
    z-index: 1;
}

/* Google Button */
.google-btn {
    width: 100%;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    backdrop-filter: blur(10px);
}

.google-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
}

.google-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.google-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

.login-btn:active:not(:disabled) {
    transform: translateY(0);
}

.login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

.login-btn.loading {
    background: linear-gradient(135deg, #00cccc, #1c94e0);
}

.loading-text {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Footer */
.login-footer {
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(0, 204, 204, 0.1);
}

.footer-text {
    color: #bababa;
    font-size: 0.95rem;
    margin: 0;
    font-family: 'Roboto', sans-serif;
}

.footer-link {
    color: #00cccc;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.footer-link:hover {
    color: #1c94e0;
}

/* Side Info */
.login-info {
    flex: 1;
    max-width: 500px;
    padding-left: 2rem;
}

.info-content {
    background: rgba(24, 26, 32, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2.5rem;
    border: 1px solid rgba(0, 204, 204, 0.1);
}

.info-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #fff;
    font-family: 'Montserrat', sans-serif;
}

.info-description {
    color: #bababa;
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    font-family: 'Roboto', sans-serif;
}

.info-features {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.feature-icon {
    color: #00cccc;
    font-weight: bold;
    font-size: 1.1rem;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 204, 204, 0.1);
    border-radius: 50%;
    flex-shrink: 0;
}

.feature-text {
    color: #bababa;
    font-size: 1rem;
    font-family: 'Roboto', sans-serif;
}

/* Mobile First - Responsive Design */
@media (max-width: 768px) {
    .login-nav {
        padding: 16px 4vw;
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .nav-logo {
        font-size: 1.5rem;
    }

    .login-container {
        flex-direction: column;
        padding: 0 4vw 2rem 4vw;
        gap: 2rem;
        min-height: auto;
    }

    .login-card {
        max-width: 100%;
        padding: 2rem;
        order: 1;
    }

    .login-title {
        font-size: 2rem;
    }

    .login-subtitle {
        font-size: 1rem;
    }

    .login-info {
        max-width: 100%;
        padding-left: 0;
        order: 2;
    }

    .info-content {
        padding: 2rem;
    }

    .info-title {
        font-size: 1.5rem;
        text-align: center;
    }

    .info-description {
        font-size: 1rem;
        text-align: center;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .login-nav {
        padding: 20px 6vw;
    }

    .login-container {
        padding: 0 6vw;
        gap: 3rem;
    }

    .login-card {
        padding: 2.5rem;
    }

    .login-title {
        font-size: 2.2rem;
    }

    .info-title {
        font-size: 1.8rem;
    }

    .info-description {
        font-size: 1.05rem;
    }
}

@media (min-width: 1025px) and (max-width: 1200px) {
    .login-container {
        padding: 0 7vw;
    }
}

/* Animations */
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

.login-card {
    animation: fadeInUp 0.8s ease-out;
}

.login-info {
    animation: fadeInRight 0.8s ease-out 0.2s both;
}

.feature-item {
    animation: fadeInUp 0.6s ease-out both;
}

.feature-item:nth-child(1) {
    animation-delay: 0.4s;
}

.feature-item:nth-child(2) {
    animation-delay: 0.5s;
}

.feature-item:nth-child(3) {
    animation-delay: 0.6s;
}
</style>