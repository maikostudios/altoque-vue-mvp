<template>
  <v-dialog v-model="show" max-width="600px" persistent>
    <v-card class="feature-lock-modal">
      <!-- Header -->
      <v-card-title class="modal-header">
        <div class="header-content">
          <v-icon size="32" color="warning">mdi-lock</v-icon>
          <div>
            <h2>Función Premium</h2>
            <p class="header-subtitle">Desbloquea todo el potencial</p>
          </div>
        </div>
        <v-btn
          @click="show = false"
          icon
          variant="text"
          size="small"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="modal-content">
        <!-- Icono y mensaje principal -->
        <div class="lock-content">
          <div class="lock-icon">
            <v-icon size="64" color="warning">{{ featureIcon }}</v-icon>
          </div>
          
          <h3 class="lock-title">{{ lockTitle }}</h3>
          <p class="lock-message">{{ lockMessage }}</p>
        </div>

        <!-- Límite actual vs Premium -->
        <div class="limit-comparison">
          <v-row>
            <v-col cols="6">
              <div class="limit-card current">
                <div class="limit-header">
                  <v-icon color="default">mdi-account</v-icon>
                  <span>Plan Actual</span>
                </div>
                <div class="limit-value">{{ currentLimit }}</div>
                <div class="limit-label">{{ limitLabel }}</div>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="limit-card premium">
                <div class="limit-header">
                  <v-icon color="warning">mdi-diamond</v-icon>
                  <span>Plan Premium</span>
                </div>
                <div class="limit-value premium">{{ premiumLimit }}</div>
                <div class="limit-label">{{ limitLabel }}</div>
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- Beneficios Premium -->
        <div class="premium-benefits">
          <h4 class="benefits-title">
            <v-icon left color="warning">mdi-star</v-icon>
            Con Premium también obtienes:
          </h4>
          
          <div class="benefits-list">
            <div class="benefit-item">
              <v-icon color="success" size="small">mdi-check-circle</v-icon>
              <span>Estadísticas detalladas de uso</span>
            </div>
            <div class="benefit-item">
              <v-icon color="success" size="small">mdi-check-circle</v-icon>
              <span>Personalización completa del QR</span>
            </div>
            <div class="benefit-item">
              <v-icon color="success" size="small">mdi-check-circle</v-icon>
              <span>Soporte prioritario</span>
            </div>
            <div class="benefit-item">
              <v-icon color="success" size="small">mdi-check-circle</v-icon>
              <span>Analytics avanzados</span>
            </div>
          </div>
        </div>

        <!-- Urgencia y valor -->
        <div class="urgency-section">
          <v-alert
            type="info"
            variant="tonal"
            prominent
          >
            <template #prepend>
              <v-icon size="24">mdi-lightning-bolt</v-icon>
            </template>
            
            <div class="urgency-content">
              <h4>¡No pierdas más oportunidades!</h4>
              <p>Cada cliente que no puede elegir su método de pago preferido es una venta perdida. Premium te da la flexibilidad que tu negocio necesita.</p>
            </div>
          </v-alert>
        </div>

        <!-- Social Proof -->
        <div class="social-proof">
          <div class="proof-stats">
            <div class="stat-item">
              <div class="stat-number">500+</div>
              <div class="stat-label">Usuarios Premium</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">95%</div>
              <div class="stat-label">Satisfacción</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">3x</div>
              <div class="stat-label">Más Conversiones</div>
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="modal-actions">
        <v-btn
          @click="show = false"
          variant="outlined"
        >
          Tal vez después
        </v-btn>
        
        <v-spacer />
        
        <v-btn
          @click="learnMore"
          variant="outlined"
          color="info"
        >
          <v-icon left>mdi-information</v-icon>
          Más Información
        </v-btn>
        
        <v-btn
          @click="upgradeToPremium"
          color="warning"
          variant="elevated"
          size="large"
          class="upgrade-cta"
        >
          <v-icon left>mdi-diamond</v-icon>
          Desbloquear Premium
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  featureType: {
    type: String,
    required: true,
    validator: (value) => ['cards', 'analytics', 'customization', 'support'].includes(value)
  },
  currentUsage: {
    type: Number,
    default: 0
  },
  currentLimit: {
    type: Number,
    default: 1
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'upgrade-to-premium', 'learn-more'])

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const featureConfig = computed(() => {
  const configs = {
    cards: {
      icon: 'mdi-credit-card-multiple',
      title: '¡Desbloquea más tarjetas!',
      message: 'Has alcanzado el límite de tarjetas del plan gratuito. Con Premium puedes agregar hasta 5 tarjetas y dar más opciones a tus clientes.',
      limitLabel: 'tarjetas',
      premiumLimit: '5'
    },
    analytics: {
      icon: 'mdi-chart-line',
      title: '¡Descubre insights valiosos!',
      message: 'Las estadísticas avanzadas te ayudan a entender mejor a tus clientes y optimizar tu negocio.',
      limitLabel: 'funciones',
      premiumLimit: 'Ilimitadas'
    },
    customization: {
      icon: 'mdi-palette',
      title: '¡Personaliza tu experiencia!',
      message: 'Con Premium puedes personalizar completamente tu QR y página de transferencias con tu marca.',
      limitLabel: 'opciones',
      premiumLimit: 'Completa'
    },
    support: {
      icon: 'mdi-headset',
      title: '¡Obtén soporte prioritario!',
      message: 'Accede a soporte especializado y respuestas más rápidas para hacer crecer tu negocio.',
      limitLabel: 'nivel',
      premiumLimit: 'Prioritario'
    }
  }
  
  return configs[props.featureType] || configs.cards
})

const featureIcon = computed(() => featureConfig.value.icon)
const lockTitle = computed(() => featureConfig.value.title)
const lockMessage = computed(() => featureConfig.value.message)
const limitLabel = computed(() => featureConfig.value.limitLabel)
const premiumLimit = computed(() => featureConfig.value.premiumLimit)

// Methods
const upgradeToPremium = () => {
  emit('upgrade-to-premium')
  show.value = false
}

const learnMore = () => {
  emit('learn-more')
}
</script>

<style scoped>
.feature-lock-modal {
  background: var(--color-surface);
  color: var(--color-text);
}

.modal-header {
  background: linear-gradient(135deg, var(--color-warning), #ff9800);
  color: white;
  padding: 1.5rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.header-content h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

.modal-content {
  padding: 2rem;
}

.lock-content {
  text-align: center;
  margin-bottom: 2rem;
}

.lock-icon {
  margin-bottom: 1rem;
}

.lock-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.lock-message {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

.limit-comparison {
  margin-bottom: 2rem;
}

.limit-card {
  background: var(--color-surface-variant);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.limit-card.current {
  border-color: var(--color-border);
}

.limit-card.premium {
  border-color: var(--color-warning);
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.05));
}

.limit-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.limit-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.limit-value.premium {
  color: var(--color-warning);
}

.limit-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.premium-benefits {
  margin-bottom: 2rem;
}

.benefits-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--color-text);
}

.urgency-section {
  margin-bottom: 2rem;
}

.urgency-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
  font-weight: 600;
}

.urgency-content p {
  margin: 0;
  line-height: 1.5;
}

.social-proof {
  margin-bottom: 1rem;
}

.proof-stats {
  display: flex;
  justify-content: space-around;
  padding: 1.5rem;
  background: var(--color-surface-variant);
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-turquesa);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-actions {
  padding: 1.5rem;
  background: var(--color-surface-variant);
}

.upgrade-cta {
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
  .modal-content {
    padding: 1rem;
  }
  
  .proof-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-actions .v-btn {
    width: 100%;
  }
}
</style>
