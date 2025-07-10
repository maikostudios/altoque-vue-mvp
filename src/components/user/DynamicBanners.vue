<template>
  <div class="dynamic-banners">
    <!-- Banner de Onboarding Incompleto -->
    <v-alert v-if="showOnboardingBanner" type="info" variant="tonal" prominent closable class="banner-alert mb-4"
      @click:close="dismissBanner('onboarding')">
      <template #prepend>
        <v-icon size="32">mdi-account-check</v-icon>
      </template>

      <div class="banner-content">
        <h3 class="banner-title">¡Felicidades por unirte a De Una!</h3>
        <p class="banner-message">
          Completa tu perfil para activar todas las funciones y empezar a recibir transferencias.
        </p>
        <div class="banner-actions">
          <v-btn @click="$emit('complete-onboarding')" color="info" variant="elevated" size="small">
            <v-icon left>mdi-account-plus</v-icon>
            Completar Perfil
          </v-btn>
        </div>
      </div>
    </v-alert>

    <!-- Banner de Verificación Pendiente -->
    <v-alert v-if="showVerificationBanner" type="warning" variant="tonal" prominent closable class="banner-alert mb-4"
      @click:close="dismissBanner('verification')">
      <template #prepend>
        <v-icon size="32">mdi-shield-clock</v-icon>
      </template>

      <div class="banner-content">
        <h3 class="banner-title">Verificación en Proceso</h3>
        <p class="banner-message">
          Tu identificación está en revisión. Te notificaremos por email cuando esté lista.
        </p>
        <div class="banner-progress">
          <v-progress-linear :model-value="75" color="warning" height="6" rounded />
          <span class="progress-text">Revisión en curso...</span>
        </div>
      </div>
    </v-alert>

    <!-- Banner de Upgrade a Premium -->
    <v-alert v-if="showUpgradeBanner" type="success" variant="tonal" prominent closable
      class="banner-alert premium-banner mb-4" @click:close="dismissBanner('upgrade')">
      <template #prepend>
        <v-icon size="32" color="warning">mdi-diamond</v-icon>
      </template>

      <div class="banner-content">
        <h3 class="banner-title">¡Potencia tus Transferencias!</h3>
        <p class="banner-message">
          Estás en el plan gratuito. ¿Listo para desbloquear todas las funciones Premium?
        </p>

        <div class="premium-features">
          <div class="feature-item">
            <v-icon size="small" color="success">mdi-check</v-icon>
            <span>Hasta 5 tarjetas bancarias</span>
          </div>
          <div class="feature-item">
            <v-icon size="small" color="success">mdi-check</v-icon>
            <span>Estadísticas avanzadas</span>
          </div>
          <div class="feature-item">
            <v-icon size="small" color="success">mdi-check</v-icon>
            <span>Personalización completa</span>
          </div>
        </div>

        <div class="banner-actions">
          <v-btn @click="$emit('upgrade-to-premium')" color="warning" variant="elevated" size="small"
            class="premium-cta">
            <v-icon left>mdi-diamond</v-icon>
            Mejorar a Premium
          </v-btn>
          <v-btn @click="$emit('learn-more')" variant="outlined" size="small" color="warning">
            Más Información
          </v-btn>
        </div>
      </div>
    </v-alert>

    <!-- Banner de Bienvenida Premium -->
    <v-alert v-if="showPremiumWelcomeBanner" type="success" variant="tonal" prominent closable
      class="banner-alert premium-welcome-banner mb-4" @click:close="dismissBanner('premium-welcome')">
      <template #prepend>
        <v-icon size="32" color="warning">mdi-diamond</v-icon>
      </template>

      <div class="banner-content">
        <h3 class="banner-title">¡Bienvenido, Maiko Studios Premium!</h3>
        <p class="banner-message">
          Todas tus herramientas Premium están listas. Disfruta de la experiencia completa.
        </p>

        <div class="premium-status">
          <div class="status-item">
            <v-icon color="success">mdi-check-circle</v-icon>
            <span>{{ cardCount }}/5 tarjetas disponibles</span>
          </div>
          <div class="status-item">
            <v-icon color="success">mdi-chart-line</v-icon>
            <span>Estadísticas activadas</span>
          </div>
          <div class="status-item" v-if="premiumDaysLeft > 0">
            <v-icon color="warning">mdi-calendar</v-icon>
            <span>{{ premiumDaysLeft }} días restantes</span>
          </div>
        </div>

        <div class="banner-actions">
          <v-btn @click="$emit('explore-premium')" color="success" variant="elevated" size="small">
            <v-icon left>mdi-rocket</v-icon>
            Explorar Funciones
          </v-btn>
        </div>
      </div>
    </v-alert>

    <!-- Banner de Premium Próximo a Vencer -->
    <v-alert v-if="showPremiumExpiringBanner" type="warning" variant="tonal" prominent closable
      class="banner-alert mb-4" @click:close="dismissBanner('premium-expiring')">
      <template #prepend>
        <v-icon size="32">mdi-calendar-alert</v-icon>
      </template>

      <div class="banner-content">
        <h3 class="banner-title">Tu Premium Vence Pronto</h3>
        <p class="banner-message">
          Tu plan Premium vence en {{ premiumDaysLeft }} días. ¡Renueva para seguir disfrutando!
        </p>
        <div class="banner-actions">
          <v-btn @click="$emit('renew-premium')" color="warning" variant="elevated" size="small">
            <v-icon left>mdi-refresh</v-icon>
            Renovar Premium
          </v-btn>
        </div>
      </div>
    </v-alert>

    <!-- Banner de Límite Alcanzado -->
    <v-alert v-if="showLimitBanner" type="error" variant="tonal" prominent closable class="banner-alert mb-4"
      @click:close="dismissBanner('limit')">
      <template #prepend>
        <v-icon size="32">mdi-alert-circle</v-icon>
      </template>

      <div class="banner-content">
        <h3 class="banner-title">Límite Alcanzado</h3>
        <p class="banner-message">
          Has alcanzado el límite de {{ userInfo.limiteTarjetas || 1 }} tarjeta{{ (userInfo.limiteTarjetas || 1) > 1 ?
            's' :
          '' }}
          del plan gratuito.
        </p>
        <div class="banner-actions">
          <v-btn @click="$emit('upgrade-to-premium')" color="warning" variant="elevated" size="small">
            <v-icon left>mdi-diamond</v-icon>
            Desbloquear Más Tarjetas
          </v-btn>
        </div>
      </div>
    </v-alert>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// Props
const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  },
  cardCount: {
    type: Number,
    default: 0
  },
  showLimitReached: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'complete-onboarding',
  'upgrade-to-premium',
  'learn-more',
  'explore-premium',
  'renew-premium'
])

// Reactive data
const dismissedBanners = ref(new Set())

// Computed
const premiumDaysLeft = computed(() => {
  if (!props.userInfo.isPremium && !props.userInfo.esPremium) return 0

  const expiryDate = props.userInfo.premiumExpiryDate || props.userInfo.fechaVencimientoPremium
  if (!expiryDate) return 0

  const expiry = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate)
  const today = new Date()
  const diffTime = expiry - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
})

const showOnboardingBanner = computed(() => {
  return !props.userInfo.onboardingCompleted &&
    !dismissedBanners.value.has('onboarding')
})

const showVerificationBanner = computed(() => {
  // Solo mostrar para usuarios que realmente necesitan verificación manual
  // No mostrar para usuarios auto-aprobados
  return props.userInfo.onboardingCompleted &&
    props.userInfo.idVerificationStatus === 'pending' &&
    !dismissedBanners.value.has('verification')
})

const showUpgradeBanner = computed(() => {
  return props.userInfo.onboardingCompleted &&
    !props.userInfo.isPremium &&
    !props.userInfo.esPremium &&
    !dismissedBanners.value.has('upgrade') &&
    !showLimitBanner.value
})

const showPremiumWelcomeBanner = computed(() => {
  return (props.userInfo.isPremium || props.userInfo.esPremium) &&
    premiumDaysLeft.value > 7 &&
    !dismissedBanners.value.has('premium-welcome')
})

const showPremiumExpiringBanner = computed(() => {
  return (props.userInfo.isPremium || props.userInfo.esPremium) &&
    premiumDaysLeft.value > 0 &&
    premiumDaysLeft.value <= 7 &&
    !dismissedBanners.value.has('premium-expiring')
})

const showLimitBanner = computed(() => {
  return props.showLimitReached &&
    !props.userInfo.isPremium &&
    !props.userInfo.esPremium &&
    !dismissedBanners.value.has('limit')
})

// Methods
const dismissBanner = (bannerType) => {
  dismissedBanners.value.add(bannerType)

  // Guardar en localStorage para persistencia
  const dismissed = Array.from(dismissedBanners.value)
  localStorage.setItem('dismissedBanners', JSON.stringify(dismissed))
}

// Cargar banners descartados del localStorage
const loadDismissedBanners = () => {
  try {
    const saved = localStorage.getItem('dismissedBanners')
    if (saved) {
      const dismissed = JSON.parse(saved)
      dismissedBanners.value = new Set(dismissed)
    }
  } catch (error) {
    console.error('Error cargando banners descartados:', error)
  }
}

// Inicializar
loadDismissedBanners()
</script>

<style scoped>
.dynamic-banners {
  width: 100%;
}

.banner-alert {
  border-radius: 12px;
  border-left: 4px solid currentColor;
}

.banner-content {
  width: 100%;
}

.banner-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.banner-message {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.banner-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.banner-progress {
  margin-top: 0.75rem;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
  display: block;
}

.premium-features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text);
}

.premium-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text);
}

.premium-banner {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.05));
}

.premium-welcome-banner {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.05));
}

.premium-cta {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .banner-actions {
    flex-direction: column;
  }

  .banner-actions .v-btn {
    width: 100%;
  }

  .premium-features,
  .premium-status {
    margin: 0.5rem 0;
  }
}
</style>
