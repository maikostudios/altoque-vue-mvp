<template>
  <v-dialog v-model="show" max-width="900px" persistent>
    <v-card class="premium-plans-modal">
      <!-- Header -->
      <v-card-title class="modal-header">
        <div class="header-content">
          <v-icon size="32" color="warning">mdi-diamond</v-icon>
          <div>
            <h2>Planes De Una Transferencias</h2>
            <p class="header-subtitle">Elige el plan perfecto para tus necesidades</p>
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
        <!-- Comparación de Planes -->
        <div class="plans-comparison">
          <v-row>
            <!-- Plan Gratuito -->
            <v-col cols="12" md="6">
              <v-card 
                class="plan-card free-plan"
                :class="{ 'current-plan': !userInfo.isPremium && !userInfo.esPremium }"
                elevation="3"
              >
                <v-card-title class="plan-header">
                  <div class="plan-icon">
                    <v-icon size="32">mdi-account</v-icon>
                  </div>
                  <div>
                    <h3>Plan Gratuito</h3>
                    <p class="plan-price">$0 CLP</p>
                  </div>
                  <v-chip
                    v-if="!userInfo.isPremium && !userInfo.esPremium"
                    color="success"
                    variant="elevated"
                    size="small"
                  >
                    Plan Actual
                  </v-chip>
                </v-card-title>

                <v-card-text>
                  <div class="plan-features">
                    <div class="feature-item">
                      <v-icon color="success" size="small">mdi-check</v-icon>
                      <span>1 tarjeta bancaria</span>
                    </div>
                    <div class="feature-item">
                      <v-icon color="success" size="small">mdi-check</v-icon>
                      <span>QR público básico</span>
                    </div>
                    <div class="feature-item">
                      <v-icon color="success" size="small">mdi-check</v-icon>
                      <span>Datos de transferencia</span>
                    </div>
                    <div class="feature-item">
                      <v-icon color="success" size="small">mdi-check</v-icon>
                      <span>Soporte por email</span>
                    </div>
                    <div class="feature-item disabled">
                      <v-icon color="grey" size="small">mdi-close</v-icon>
                      <span>Estadísticas avanzadas</span>
                    </div>
                    <div class="feature-item disabled">
                      <v-icon color="grey" size="small">mdi-close</v-icon>
                      <span>Personalización completa</span>
                    </div>
                    <div class="feature-item disabled">
                      <v-icon color="grey" size="small">mdi-close</v-icon>
                      <span>Múltiples tarjetas</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Plan Premium -->
            <v-col cols="12" md="6">
              <v-card 
                class="plan-card premium-plan"
                :class="{ 'current-plan': userInfo.isPremium || userInfo.esPremium }"
                elevation="6"
              >
                <div class="premium-badge">
                  <v-icon left size="small">mdi-star</v-icon>
                  Recomendado
                </div>

                <v-card-title class="plan-header">
                  <div class="plan-icon premium">
                    <v-icon size="32" color="warning">mdi-diamond</v-icon>
                  </div>
                  <div>
                    <h3>Plan Premium</h3>
                    <p class="plan-price">Consultar Precio</p>
                  </div>
                  <v-chip
                    v-if="userInfo.isPremium || userInfo.esPremium"
                    color="warning"
                    variant="elevated"
                    size="small"
                  >
                    Plan Actual
                  </v-chip>
                </v-card-title>

                <v-card-text>
                  <div class="plan-features">
                    <div class="feature-item">
                      <v-icon color="success" size="small">mdi-check</v-icon>
                      <span><strong>Hasta 5 tarjetas bancarias</strong></span>
                    </div>
                    <div class="feature-item">
                      <v-icon color="success" size="small">mdi-check</v-icon>
                      <span><strong>Estadísticas detalladas</strong></span>
                    </div>
                    <div class="feature-item">
                      <v-icon color="success" size="small">mdi-check</v-icon>
                      <span><strong>Personalización completa</strong></span>
                    </div>
                    <div class="feature-item">
                      <v-icon color="success" size="small">mdi-check</v-icon>
                      <span><strong>Soporte prioritario</strong></span>
                    </div>
                    <div class="feature-item">
                      <v-icon color="success" size="small">mdi-check</v-icon>
                      <span>QR personalizado</span>
                    </div>
                    <div class="feature-item">
                      <v-icon color="success" size="small">mdi-check</v-icon>
                      <span>Analytics avanzados</span>
                    </div>
                    <div class="feature-item">
                      <v-icon color="success" size="small">mdi-check</v-icon>
                      <span>Validez de 1 año</span>
                    </div>
                  </div>

                  <div class="premium-highlight">
                    <v-icon color="warning">mdi-lightning-bolt</v-icon>
                    <span>¡Desbloquea todo el potencial de De Una!</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Información Adicional -->
        <v-divider class="my-6" />
        
        <div class="additional-info">
          <h3 class="info-title">
            <v-icon left color="turquesa">mdi-information</v-icon>
            ¿Por qué elegir Premium?
          </h3>
          
          <v-row>
            <v-col cols="12" md="4">
              <div class="benefit-item">
                <v-icon color="warning" size="32">mdi-speedometer</v-icon>
                <h4>Mayor Productividad</h4>
                <p>Gestiona múltiples cuentas desde un solo lugar y ahorra tiempo valioso.</p>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="benefit-item">
                <v-icon color="turquesa" size="32">mdi-chart-line</v-icon>
                <h4>Insights Valiosos</h4>
                <p>Conoce mejor a tus clientes con estadísticas detalladas y analytics.</p>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="benefit-item">
                <v-icon color="success" size="32">mdi-shield-check</v-icon>
                <h4>Soporte Premium</h4>
                <p>Atención prioritaria y soporte especializado para tu negocio.</p>
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- Testimonios -->
        <div class="testimonials">
          <h3 class="info-title">
            <v-icon left color="turquesa">mdi-account-heart</v-icon>
            Lo que dicen nuestros usuarios Premium
          </h3>
          
          <v-row>
            <v-col cols="12" md="6">
              <v-card class="testimonial-card" variant="outlined">
                <v-card-text>
                  <div class="testimonial-content">
                    <p>"Premium me permitió organizar todas mis cuentas. Mis clientes ahora pueden elegir cómo pagarme fácilmente."</p>
                    <div class="testimonial-author">
                      <strong>María González</strong>
                      <span>Emprendedora</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="testimonial-card" variant="outlined">
                <v-card-text>
                  <div class="testimonial-content">
                    <p>"Las estadísticas me ayudan a entender mejor mi negocio. Vale cada peso invertido."</p>
                    <div class="testimonial-author">
                      <strong>Carlos Mendoza</strong>
                      <span>Vendedor Online</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="modal-actions">
        <v-spacer />
        
        <v-btn
          @click="show = false"
          variant="outlined"
        >
          Cerrar
        </v-btn>
        
        <v-btn
          v-if="!userInfo.isPremium && !userInfo.esPremium"
          @click="contactWhatsApp"
          color="success"
          variant="elevated"
          size="large"
          class="premium-cta"
        >
          <v-icon left>mdi-whatsapp</v-icon>
          Contactar por WhatsApp
        </v-btn>
        
        <v-btn
          v-if="!userInfo.isPremium && !userInfo.esPremium"
          @click="contactSupport"
          variant="outlined"
          color="info"
        >
          <v-icon left>mdi-email</v-icon>
          Contactar Soporte
        </v-btn>
        
        <v-btn
          v-if="userInfo.isPremium || userInfo.esPremium"
          @click="managePremium"
          color="warning"
          variant="elevated"
        >
          <v-icon left>mdi-cog</v-icon>
          Gestionar Premium
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
  userInfo: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'contact-whatsapp', 'contact-support', 'manage-premium'])

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const contactWhatsApp = () => {
  const message = encodeURIComponent(
    `Hola, quiero información sobre el Plan Premium de De Una Transferencias. Mi email es: ${props.userInfo.email}`
  )
  const whatsappUrl = `https://wa.me/56912345678?text=${message}` // Reemplazar con número real
  window.open(whatsappUrl, '_blank')
  
  emit('contact-whatsapp')
}

const contactSupport = () => {
  emit('contact-support')
}

const managePremium = () => {
  emit('manage-premium')
}
</script>

<style scoped>
.premium-plans-modal {
  background: var(--color-surface);
  color: var(--color-text);
}

.modal-header {
  background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
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
  max-height: 70vh;
  overflow-y: auto;
}

.plans-comparison {
  margin-bottom: 2rem;
}

.plan-card {
  position: relative;
  height: 100%;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
}

.plan-card.current-plan {
  border: 2px solid var(--color-success);
}

.premium-plan {
  border: 2px solid var(--color-warning);
}

.premium-badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background: linear-gradient(135deg, var(--color-warning), #ff9800);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1;
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.plan-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan-icon.premium {
  background: linear-gradient(135deg, var(--color-warning), #ff9800);
}

.plan-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-text);
}

.plan-price {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
}

.feature-item.disabled {
  opacity: 0.5;
}

.premium-highlight {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.05));
  border-radius: 8px;
  border-left: 4px solid var(--color-warning);
  font-weight: 500;
  color: var(--color-text);
}

.additional-info {
  margin-bottom: 2rem;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.benefit-item {
  text-align: center;
  padding: 1rem;
}

.benefit-item h4 {
  margin: 1rem 0 0.5rem 0;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
}

.benefit-item p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
}

.testimonials {
  margin-bottom: 1rem;
}

.testimonial-card {
  height: 100%;
  background: var(--color-surface-variant);
}

.testimonial-content p {
  font-style: italic;
  margin-bottom: 1rem;
  color: var(--color-text);
  line-height: 1.6;
}

.testimonial-author {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.testimonial-author strong {
  color: var(--color-text);
  font-weight: 600;
}

.testimonial-author span {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.modal-actions {
  padding: 1.5rem;
  background: var(--color-surface-variant);
  gap: 1rem;
}

.premium-cta {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    padding: 1rem;
  }
  
  .plan-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .v-btn {
    width: 100%;
  }
}
</style>
