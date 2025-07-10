<template>
  <div class="user-nav-menu">
    <!-- Avatar y dropdown cuando hay sesión -->
    <div v-if="isAuthenticated" class="user-dropdown">
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" class="user-avatar-btn" variant="text" size="large">
            <v-avatar size="40" class="user-avatar">
              <img v-if="userPhoto" :src="userPhoto" :alt="userName" />
              <span v-else class="avatar-initials">
                {{ userInitials }}
              </span>
            </v-avatar>
            <v-icon class="dropdown-icon">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <div class="user-menu-list">
          <!-- Información del usuario -->
          <div class="user-info-item">
            <div class="user-avatar large">
              <img v-if="userPhoto" :src="userPhoto" :alt="userName" />
              <span v-else>{{ userInitials }}</span>
            </div>
            <div class="user-details">
              <h4 class="user-name">{{ userName }}</h4>
              <p class="user-email">{{ userEmail }}</p>
              <span class="user-type-chip">{{ userTypeLabel }}</span>
            </div>
          </div>

          <div class="dropdown-divider"></div>

          <!-- Opciones según el rol -->
          <div class="dropdown-menu">
            <button v-for="option in menuOptions" :key="option.key" @click="handleMenuClick(option.action)"
              class="dropdown-item">
              <i class="mdi" :class="option.icon"></i>
              {{ option.label }}
            </button>

            <button @click="logout" class="dropdown-item logout">
              <i class="mdi mdi-logout"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </v-menu>
    </div>

    <!-- Botones de login/registro cuando no hay sesión -->
    <div v-else class="auth-buttons">
      <v-btn @click="goToLogin" variant="outlined" color="turquesa" class="login-btn">
        Iniciar Sesión
      </v-btn>
      <v-btn @click="goToRegister" color="turquesa" variant="elevated" class="register-btn">
        Registrarse
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

// Router y stores
const router = useRouter()
const authStore = useAuthStore()

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userEmail = computed(() => authStore.user?.email || '')
const userName = computed(() => {
  if (authStore.userInfo?.nombre && authStore.userInfo?.apellido) {
    return `${authStore.userInfo.nombre} ${authStore.userInfo.apellido}`
  }
  return authStore.userInfo?.nombre || authStore.user?.displayName || 'Usuario'
})

const userPhoto = computed(() => {
  return authStore.user?.photoURL || authStore.userInfo?.photoURL || null
})

const userInitials = computed(() => {
  const name = userName.value
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const userRole = computed(() => authStore.userInfo?.rol || 'usuario')
const isPremium = computed(() => authStore.userInfo?.isPremium || false)

const userTypeLabel = computed(() => {
  if (userRole.value === 'admin') return 'Administrador'
  if (userRole.value === 'vendedor') return 'Vendedor'
  if (userRole.value === 'soporte') return 'Soporte'
  return isPremium.value ? 'Premium' : 'Gratuito'
})

const userTypeColor = computed(() => {
  if (userRole.value === 'admin') return 'error'
  if (userRole.value === 'vendedor') return 'warning'
  if (userRole.value === 'soporte') return 'info'
  return isPremium.value ? 'success' : 'grey'
})

const menuOptions = computed(() => {
  const options = []

  // Opciones comunes para todos los usuarios
  options.push({
    key: 'dashboard',
    label: 'Mi Dashboard',
    icon: 'mdi-view-dashboard',
    color: 'primary',
    action: 'dashboard'
  })

  options.push({
    key: 'profile',
    label: 'Mi Perfil',
    icon: 'mdi-account-edit',
    color: 'info',
    action: 'profile'
  })

  // Opciones específicas por rol
  if (userRole.value === 'admin') {
    options.push({
      key: 'admin',
      label: 'Panel de Administración',
      icon: 'mdi-shield-crown',
      color: 'error',
      action: 'admin'
    })
  }

  if (userRole.value === 'vendedor') {
    options.push({
      key: 'vendor',
      label: 'Panel de Vendedor',
      icon: 'mdi-store',
      color: 'warning',
      action: 'vendor'
    })
  }

  if (userRole.value === 'soporte') {
    options.push({
      key: 'support',
      label: 'Panel de Soporte',
      icon: 'mdi-headset',
      color: 'info',
      action: 'support'
    })
  }

  // Opción de upgrade para usuarios gratuitos
  if (!isPremium.value && userRole.value === 'usuario') {
    options.push({
      key: 'upgrade',
      label: 'Actualizar a Premium',
      icon: 'mdi-star',
      color: 'success',
      action: 'upgrade'
    })
  }

  return options
})

// Methods
const handleMenuClick = (action) => {
  switch (action) {
    case 'dashboard':
      if (userRole.value === 'admin') {
        router.push('/admin')
      } else if (userRole.value === 'vendedor') {
        router.push('/vendedor')
      } else if (userRole.value === 'soporte') {
        router.push('/soporte')
      } else {
        router.push('/usuario')
      }
      break

    case 'profile':
      router.push('/perfil')
      break

    case 'admin':
      router.push('/admin')
      break

    case 'vendor':
      router.push('/vendedor')
      break

    case 'support':
      router.push('/soporte')
      break

    case 'upgrade':
      router.push('/planes')
      break

    default:
      console.log('Acción no reconocida:', action)
  }
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/registro')
}

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<style scoped>
.user-nav-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-dropdown {
  position: relative;
}

.user-avatar-btn {
  background: none !important;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: none !important;
}

.user-avatar-btn:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00cccc, #1c94e0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #121212;
  font-weight: bold;
  font-size: 0.9rem;
  border: none;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.avatar-initials {
  background: transparent;
  color: #121212;
  font-weight: bold;
  font-size: 0.9rem;
}

.dropdown-icon {
  color: #ccc;
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.user-avatar-btn:hover .dropdown-icon {
  transform: rotate(180deg);
}

.user-menu-list {
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

.user-info-item {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 204, 204, 0.05);
}

.user-avatar.large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00cccc, #1c94e0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #121212;
  font-weight: bold;
  font-size: 1.1rem;
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

.user-type-chip {
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

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.login-btn {
  color: #ccc;
  border: 1px solid #333;
  background: transparent;
  transition: all 0.3s ease;
}

.login-btn:hover {
  color: #00cccc;
  border-color: #00cccc;
  background: rgba(0, 204, 204, 0.1);
}

.register-btn {
  background: #00cccc;
  color: #121212;
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.register-btn:hover {
  background: #1c94e0;
  transform: translateY(-1px);
}

/* Sobrescribir el contenido del overlay de Vuetify */
.user-nav-menu .v-overlay__content {
  background: transparent !important;
  box-shadow: none !important;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .auth-buttons .v-btn {
    width: 100%;
    min-width: 120px;
  }

  .user-menu-list {
    min-width: 250px;
    right: -50px;
  }

  .user-info-item {
    padding: 16px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .menu-option,
  .logout-option {
    padding: 10px 16px;
    font-size: 0.85rem;
  }
}

/* Estilos adicionales para mejorar la apariencia */
.user-nav-menu .v-btn {
  text-transform: none;
  letter-spacing: normal;
}

/* Estilos para elementos del menú personalizado */
.user-nav-menu .dropdown-item {
  font-size: 0.9rem;
  line-height: 1.2;
}

/* Animaciones suaves */
.user-dropdown {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mejoras para el avatar con imagen */
.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Estados de hover mejorados */
.menu-option .v-icon,
.logout-option .v-icon {
  transition: all 0.3s ease;
}

.menu-option:hover .v-icon {
  transform: translateX(2px);
}

.logout-option:hover .v-icon {
  transform: translateX(2px);
}
</style>
