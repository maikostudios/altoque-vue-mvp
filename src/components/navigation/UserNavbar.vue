<template>
  <nav class="user-navbar">
    <div class="navbar-content">
      <!-- Logo -->
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-d">D</span>euna
        </router-link>
      </div>

      <!-- Navigation Links -->
      <div class="navbar-nav">
        <!-- Home solo si no estamos en admin -->
        <router-link v-if="!isAdminRoute" to="/" class="nav-link">
          <i class="bi bi-house"></i>
          Home
        </router-link>

        <!-- Mostrar solo en rutas de usuario -->
        <template v-if="isUserRoute">
          <router-link to="/ayuda" class="nav-link">
            <i class="bi bi-question-circle"></i>
            Ayuda
          </router-link>
        </template>

        <!-- Links para admin -->
        <router-link v-if="authStore.role === 'admin'" to="/admin" class="nav-link">
          <i class="bi bi-gear"></i>
          Admin Panel
        </router-link>

        <!-- Links para vendedor -->
        <router-link v-if="authStore.role === 'vendedor'" to="/vendedor" class="nav-link">
          <i class="bi bi-shop"></i>
          Vendedor
        </router-link>

        <!-- Links para soporte -->
        <router-link v-if="authStore.role === 'soporte'" to="/support-dashboard" class="nav-link">
          <i class="bi bi-headset"></i>
          Panel Soporte
        </router-link>
      </div>

      <!-- User Actions -->
      <div class="navbar-actions">
        <!-- Soporte (solo en rutas de usuario) -->
        <router-link v-if="isUserRoute" to="/soporte" class="support-btn" title="Contactar soporte">
          <i class="bi bi-headset"></i>
        </router-link>

        <!-- Notificaciones (solo para usuarios logueados) -->
        <NotificationBell v-if="authStore.user && isUserRoute" />

        <!-- Avatar y menú de usuario -->
        <div v-if="authStore.user" class="user-menu" ref="userMenuRef">
          <button @click="toggleUserMenu" class="user-avatar-btn">
            <div class="user-avatar">
              <span>{{ getUserInitials() }}</span>
            </div>
            <i class="bi bi-chevron-down" :class="{ 'rotated': showUserMenu }"></i>
          </button>

          <!-- Dropdown del usuario -->
          <div v-if="showUserMenu" class="user-dropdown">
            <div class="user-info">
              <div class="user-avatar large">
                <span>{{ getUserInitials() }}</span>
              </div>
              <div class="user-details">
                <h4>{{ getUserName() }}</h4>
                <p>{{ authStore.user.email }}</p>
                <span class="user-role">{{ getRoleLabel() }}</span>
              </div>
            </div>

            <div class="dropdown-divider"></div>

            <div class="dropdown-menu">
              <router-link to="/usuario" class="dropdown-item" @click="closeUserMenu">
                <i class="bi bi-person"></i>
                Mi Perfil
              </router-link>

              <router-link to="/soporte" class="dropdown-item" @click="closeUserMenu">
                <i class="bi bi-headset"></i>
                Soporte
              </router-link>

              <button @click="logout" class="dropdown-item logout">
                <i class="bi bi-box-arrow-right"></i>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        <!-- Login button para usuarios no logueados -->
        <router-link v-else to="/login" class="login-btn">
          <i class="bi bi-box-arrow-in-right"></i>
          Iniciar Sesión
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import NotificationBell from '@/components/notifications/NotificationBell.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const userMenuRef = ref(null)

// Computed
const isUserRoute = computed(() => {
  return route.path.startsWith('/usuario') ||
    route.path.startsWith('/dashboard') ||
    route.path === '/ayuda' ||
    route.path === '/soporte'
})

const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

// Methods
const getUserInitials = () => {
  if (!authStore.user) return '?'

  const email = authStore.user.email || ''
  const parts = email.split('@')[0].split('.')

  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }

  return email.charAt(0).toUpperCase()
}

const getUserName = () => {
  if (!authStore.user) return 'Usuario'

  const email = authStore.user.email || ''
  const username = email.split('@')[0]

  // Capitalizar primera letra
  return username.charAt(0).toUpperCase() + username.slice(1)
}

const getRoleLabel = () => {
  const roleLabels = {
    admin: 'Administrador',
    vendedor: 'Vendedor',
    usuario: 'Usuario',
    cliente: 'Cliente'
  }

  return roleLabels[authStore.role] || 'Usuario'
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const logout = async () => {
  try {
    await authStore.logout()
    closeUserMenu()
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

// Click outside to close user menu
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    closeUserMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-navbar {
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  box-shadow: 0 2px 10px rgba(0, 204, 204, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
  font-family: 'Montserrat', sans-serif;
}

.brand-link {
  color: #ffffff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.brand-link:hover {
  color: #00cccc;
}

.brand-d {
  color: #00cccc;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: #ccc;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.nav-link:hover {
  color: #00cccc;
  background: rgba(0, 204, 204, 0.1);
}

.nav-link.router-link-active {
  color: #00cccc;
  background: rgba(0, 204, 204, 0.15);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.support-btn {
  color: #ccc;
  font-size: 1.2rem;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  text-decoration: none;
}

.support-btn:hover {
  color: #00cccc;
  background: rgba(0, 204, 204, 0.1);
}

.user-menu {
  position: relative;
}

.user-avatar-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-avatar-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00cccc, #1c94e0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #121212;
  font-weight: bold;
  font-size: 0.9rem;
}

.user-avatar.large {
  width: 48px;
  height: 48px;
  font-size: 1.1rem;
}

.user-avatar-btn i {
  color: #ccc;
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.user-avatar-btn i.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  margin-top: 8px;
}

.user-info {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 204, 204, 0.05);
}

.user-details h4 {
  margin: 0 0 4px 0;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
}

.user-details p {
  margin: 0 0 4px 0;
  color: #888;
  font-size: 0.8rem;
}

.user-role {
  background: rgba(0, 204, 204, 0.2);
  color: #00cccc;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.dropdown-divider {
  height: 1px;
  background: #333;
}

.dropdown-menu {
  padding: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #ccc;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.dropdown-item.logout {
  color: #ff6b6b;
}

.dropdown-item.logout:hover {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
}

.login-btn {
  background: #00cccc;
  color: #121212;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.login-btn:hover {
  background: #1c94e0;
  transform: translateY(-1px);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .navbar-content {
    padding: 0 16px;
    height: 56px;
  }

  .navbar-brand {
    font-size: 1.3rem;
  }

  .navbar-nav {
    gap: 12px;
  }

  .nav-link {
    font-size: 0.8rem;
    padding: 6px 8px;
  }

  .nav-link i {
    display: none;
  }

  .navbar-actions {
    gap: 12px;
  }

  .user-dropdown {
    width: 260px;
    right: -20px;
  }
}

@media (max-width: 480px) {
  .navbar-nav {
    display: none;
  }

  .user-dropdown {
    width: 240px;
    right: -40px;
  }
}
</style>
