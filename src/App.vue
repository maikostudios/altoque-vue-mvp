<template>
  <div class="app-container">
    <!-- Nueva navegación para usuarios logueados -->
    <UserNavbar v-if="showNavbar" />

    <main :class="{ 'with-navbar': showNavbar, 'full-screen': !showNavbar }">
      <router-view />
    </main>

    <!-- Footer para páginas logueadas -->
    <AppFooter v-if="showNavbar && authStore.user" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from './store/auth'
import { computed } from 'vue'
import UserNavbar from './components/navigation/UserNavbar.vue'
import AppFooter from './components/layout/AppFooter.vue'

const route = useRoute()
const authStore = useAuthStore()

// Determinar si mostrar la navbar (no en home)
const showNavbar = computed(() => {
  return route.path !== '/'
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--color-background, #121212);
  color: var(--color-text, #ffffff);
}

.app-navbar {
  background: var(--color-surface, #1e1e1e);
  box-shadow: 0 2px 10px rgba(0, 204, 204, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border, #333333);
}

.navbar-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--color-turquesa, #00cccc);
  margin: 0;
  font-family: 'Montserrat', sans-serif;
}

.navbar-menu {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-link {
  color: var(--color-text-secondary, #cccccc);
  text-decoration: none;
  transition: color 0.2s;
  font-family: 'Roboto', sans-serif;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-turquesa, #00cccc);
}

.logout-btn {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  font-family: 'Roboto', sans-serif;
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
}

.with-navbar {
  padding: 1rem;
}

.full-screen {
  padding: 0;
  margin: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .app-navbar {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .navbar-menu {
    gap: 1rem;
    flex-wrap: wrap;
  }

  .nav-link {
    font-size: 0.875rem;
  }

  .logout-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
