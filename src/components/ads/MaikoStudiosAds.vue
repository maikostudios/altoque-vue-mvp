<template>
  <div class="maiko-studios-ads">
    <!-- Ad Principal -->
    <div v-if="currentAd" class="ad-container" :class="adSize">
      <div class="ad-content" @click="handleAdClick">
        <!-- Banner de Servicios Maiko Studios -->
        <div v-if="currentAd.type === 'services'" class="services-ad">
          <div class="ad-header">
            <img 
              src="/logo-maiko-studios.png" 
              alt="Maiko Studios" 
              class="ad-logo"
              @error="handleImageError"
            />
            <div class="ad-brand">
              <span class="brand-name">Maiko Studios</span>
              <span class="brand-tagline">Soluciones Digitales</span>
            </div>
          </div>
          
          <div class="ad-body">
            <h3 class="ad-title">{{ currentAd.title }}</h3>
            <p class="ad-description">{{ currentAd.description }}</p>
            
            <div class="ad-features">
              <div 
                v-for="feature in currentAd.features" 
                :key="feature"
                class="feature-item"
              >
                <v-icon size="small" color="turquesa">mdi-check-circle</v-icon>
                <span>{{ feature }}</span>
              </div>
            </div>
          </div>
          
          <div class="ad-footer">
            <v-btn
              :color="currentAd.ctaColor || 'turquesa'"
              variant="elevated"
              size="small"
              class="ad-cta"
            >
              <v-icon left size="small">{{ currentAd.ctaIcon }}</v-icon>
              {{ currentAd.ctaText }}
            </v-btn>
            <span class="ad-label">Publicidad</span>
          </div>
        </div>

        <!-- Banner de Premium De Una -->
        <div v-else-if="currentAd.type === 'premium'" class="premium-ad">
          <div class="premium-gradient">
            <div class="ad-header">
              <v-icon size="32" color="warning">mdi-diamond</v-icon>
              <div class="ad-brand">
                <span class="brand-name">De Una Premium</span>
                <span class="brand-tagline">Desbloquea todo</span>
              </div>
            </div>
            
            <div class="ad-body">
              <h3 class="ad-title">{{ currentAd.title }}</h3>
              <p class="ad-description">{{ currentAd.description }}</p>
              
              <div class="premium-benefits">
                <div class="benefit-grid">
                  <div 
                    v-for="benefit in currentAd.benefits" 
                    :key="benefit"
                    class="benefit-item"
                  >
                    <v-icon size="small" color="warning">mdi-star</v-icon>
                    <span>{{ benefit }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="ad-footer">
              <v-btn
                color="warning"
                variant="elevated"
                size="small"
                class="ad-cta premium-cta"
              >
                <v-icon left size="small">mdi-diamond</v-icon>
                {{ currentAd.ctaText }}
              </v-btn>
              <span class="ad-label">Publicidad</span>
            </div>
          </div>
        </div>

        <!-- Banner Contextual -->
        <div v-else-if="currentAd.type === 'contextual'" class="contextual-ad">
          <div class="ad-header">
            <v-icon :color="currentAd.iconColor" size="24">{{ currentAd.icon }}</v-icon>
            <div class="ad-brand">
              <span class="brand-name">{{ currentAd.brandName }}</span>
              <span class="brand-tagline">{{ currentAd.brandTagline }}</span>
            </div>
          </div>
          
          <div class="ad-body">
            <h3 class="ad-title">{{ currentAd.title }}</h3>
            <p class="ad-description">{{ currentAd.description }}</p>
          </div>
          
          <div class="ad-footer">
            <v-btn
              :color="currentAd.ctaColor"
              variant="elevated"
              size="small"
              class="ad-cta"
            >
              <v-icon left size="small">{{ currentAd.ctaIcon }}</v-icon>
              {{ currentAd.ctaText }}
            </v-btn>
            <span class="ad-label">Publicidad</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Indicador de carga -->
    <div v-else-if="loading" class="ad-loading">
      <v-skeleton-loader type="card" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/firebase'

// Props
const props = defineProps({
  placement: {
    type: String,
    default: 'banner',
    validator: (value) => ['banner', 'sidebar', 'footer', 'inline'].includes(value)
  },
  context: {
    type: Object,
    default: () => ({})
  },
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['ad-clicked', 'ad-viewed'])

// Reactive data
const loading = ref(true)
const currentAd = ref(null)
const adRotationInterval = ref(null)
const viewTracked = ref(false)

// Computed
const adSize = computed(() => {
  const sizes = {
    banner: 'ad-banner',
    sidebar: 'ad-sidebar', 
    footer: 'ad-footer',
    inline: 'ad-inline'
  }
  return sizes[props.placement] || 'ad-banner'
})

// Ad configurations
const adConfigs = {
  services: [
    {
      id: 'maiko-web-design',
      type: 'services',
      title: 'Digitaliza tu Pyme',
      description: 'Páginas web profesionales que convierten visitantes en clientes.',
      features: ['Diseño Responsive', 'SEO Optimizado', 'Hosting Incluido'],
      ctaText: 'Cotizar Web',
      ctaIcon: 'mdi-web',
      ctaColor: 'turquesa',
      targetUrl: 'https://maikostudios.com/servicios/web',
      weight: 30
    },
    {
      id: 'maiko-ecommerce',
      type: 'services', 
      title: 'Tienda Online Completa',
      description: 'Vende online con nuestra plataforma de ecommerce personalizada.',
      features: ['Carrito de Compras', 'Pagos Integrados', 'Gestión de Stock'],
      ctaText: 'Ver Tiendas',
      ctaIcon: 'mdi-shopping',
      ctaColor: 'success',
      targetUrl: 'https://maikostudios.com/servicios/ecommerce',
      weight: 25
    },
    {
      id: 'maiko-marketing',
      type: 'services',
      title: 'Marketing Digital',
      description: 'Aumenta tus ventas con estrategias de marketing probadas.',
      features: ['Redes Sociales', 'Google Ads', 'Email Marketing'],
      ctaText: 'Aumentar Ventas',
      ctaIcon: 'mdi-trending-up',
      ctaColor: 'warning',
      targetUrl: 'https://maikostudios.com/servicios/marketing',
      weight: 20
    }
  ],
  premium: [
    {
      id: 'deuna-premium-upgrade',
      type: 'premium',
      title: '¡Upgrade a Premium!',
      description: 'Desbloquea todas las funciones y potencia tu negocio.',
      benefits: ['5 Tarjetas', 'Estadísticas', 'Soporte VIP'],
      ctaText: 'Mejorar Ahora',
      targetUrl: '/planes',
      weight: 40
    },
    {
      id: 'deuna-premium-features',
      type: 'premium',
      title: 'Funciones Premium',
      description: 'Descubre todo lo que puedes hacer con De Una Premium.',
      benefits: ['Analytics', 'Personalización', 'Prioridad'],
      ctaText: 'Ver Funciones',
      targetUrl: '/planes',
      weight: 35
    }
  ],
  contextual: [
    {
      id: 'restaurant-pos',
      type: 'contextual',
      title: 'Sistema POS para Restaurantes',
      description: 'Gestiona tu restaurante con nuestro sistema especializado.',
      icon: 'mdi-silverware-fork-knife',
      iconColor: 'orange',
      brandName: 'Maiko POS',
      brandTagline: 'Para Restaurantes',
      ctaText: 'Ver Demo',
      ctaIcon: 'mdi-play',
      ctaColor: 'orange',
      targetUrl: 'https://maikostudios.com/pos-restaurant',
      context: ['restaurant', 'food', 'comida'],
      weight: 15
    },
    {
      id: 'retail-inventory',
      type: 'contextual',
      title: 'Control de Inventario',
      description: 'Mantén tu stock bajo control con nuestro sistema inteligente.',
      icon: 'mdi-package-variant',
      iconColor: 'purple',
      brandName: 'Maiko Inventory',
      brandTagline: 'Control Total',
      ctaText: 'Probar Gratis',
      ctaIcon: 'mdi-rocket',
      ctaColor: 'purple',
      targetUrl: 'https://maikostudios.com/inventory',
      context: ['retail', 'tienda', 'inventario'],
      weight: 10
    }
  ]
}

// Methods
const selectAd = () => {
  const allAds = []
  
  // Agregar ads de servicios
  allAds.push(...adConfigs.services)
  
  // Agregar ads de Premium si el usuario no es Premium
  if (!props.userInfo.isPremium && !props.userInfo.esPremium) {
    allAds.push(...adConfigs.premium)
  }
  
  // Agregar ads contextuales basados en el contexto
  if (props.context.industry || props.context.keywords) {
    const contextualAds = adConfigs.contextual.filter(ad => {
      if (props.context.industry) {
        return ad.context.includes(props.context.industry)
      }
      if (props.context.keywords) {
        return ad.context.some(ctx => 
          props.context.keywords.some(keyword => 
            ctx.toLowerCase().includes(keyword.toLowerCase())
          )
        )
      }
      return false
    })
    allAds.push(...contextualAds)
  }
  
  // Selección ponderada
  const totalWeight = allAds.reduce((sum, ad) => sum + ad.weight, 0)
  let random = Math.random() * totalWeight
  
  for (const ad of allAds) {
    random -= ad.weight
    if (random <= 0) {
      return ad
    }
  }
  
  // Fallback al primer ad
  return allAds[0] || adConfigs.services[0]
}

const loadAd = () => {
  loading.value = true
  
  // Simular carga de ad
  setTimeout(() => {
    currentAd.value = selectAd()
    loading.value = false
    
    // Track view después de un momento
    setTimeout(() => {
      if (!viewTracked.value) {
        trackAdView()
        viewTracked.value = true
      }
    }, 1000)
  }, 500)
}

const handleAdClick = async () => {
  if (!currentAd.value) return
  
  try {
    // Track click
    await trackAdClick()
    
    // Emit event
    emit('ad-clicked', {
      adId: currentAd.value.id,
      adType: currentAd.value.type,
      placement: props.placement
    })
    
    // Navigate to target URL
    if (currentAd.value.targetUrl) {
      if (currentAd.value.targetUrl.startsWith('http')) {
        window.open(currentAd.value.targetUrl, '_blank')
      } else {
        // Internal navigation
        window.location.href = currentAd.value.targetUrl
      }
    }
    
  } catch (error) {
    console.error('Error handling ad click:', error)
  }
}

const trackAdView = async () => {
  if (!currentAd.value) return
  
  try {
    const adRef = doc(db, 'public_landings', 'ads_metrics')
    await updateDoc(adRef, {
      [`views.${currentAd.value.id}`]: increment(1),
      [`views.total`]: increment(1),
      lastUpdated: new Date()
    })
    
    emit('ad-viewed', {
      adId: currentAd.value.id,
      adType: currentAd.value.type,
      placement: props.placement
    })
    
  } catch (error) {
    console.error('Error tracking ad view:', error)
  }
}

const trackAdClick = async () => {
  if (!currentAd.value) return
  
  try {
    const adRef = doc(db, 'public_landings', 'ads_metrics')
    await updateDoc(adRef, {
      [`clicks.${currentAd.value.id}`]: increment(1),
      [`clicks.total`]: increment(1),
      lastUpdated: new Date()
    })
    
  } catch (error) {
    console.error('Error tracking ad click:', error)
  }
}

const handleImageError = (event) => {
  // Fallback para logo
  event.target.style.display = 'none'
}

const startAdRotation = () => {
  // Rotar ads cada 30 segundos
  adRotationInterval.value = setInterval(() => {
    viewTracked.value = false
    loadAd()
  }, 30000)
}

const stopAdRotation = () => {
  if (adRotationInterval.value) {
    clearInterval(adRotationInterval.value)
    adRotationInterval.value = null
  }
}

// Lifecycle
onMounted(() => {
  loadAd()
  startAdRotation()
})

onUnmounted(() => {
  stopAdRotation()
})
</script>

<style scoped>
.maiko-studios-ads {
  width: 100%;
}

.ad-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.ad-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.ad-content {
  background: var(--color-surface);
  border: 1px solid rgba(0, 204, 204, 0.2);
}

/* Tamaños de ads */
.ad-banner {
  max-width: 100%;
  min-height: 120px;
}

.ad-sidebar {
  max-width: 300px;
  min-height: 200px;
}

.ad-footer {
  max-width: 100%;
  min-height: 80px;
}

.ad-inline {
  max-width: 400px;
  min-height: 150px;
}

/* Estilos de contenido */
.services-ad,
.premium-ad,
.contextual-ad {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
}

.premium-ad {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.05));
}

.ad-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ad-logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.ad-brand {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

.brand-tagline {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.ad-body {
  flex: 1;
}

.ad-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
}

.ad-description {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
}

.ad-features,
.premium-benefits {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.feature-item,
.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-text);
}

.benefit-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.25rem;
}

.ad-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.ad-cta {
  font-size: 0.8rem;
  height: 32px;
}

.premium-cta {
  animation: pulse 2s infinite;
}

.ad-label {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ad-loading {
  min-height: 120px;
  border-radius: 12px;
  overflow: hidden;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 193, 7, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .ad-container {
    margin: 0.5rem 0;
  }
  
  .ad-header {
    gap: 0.5rem;
  }
  
  .ad-title {
    font-size: 0.9rem;
  }
  
  .ad-description {
    font-size: 0.8rem;
  }
  
  .benefit-grid {
    grid-template-columns: 1fr;
  }
}
</style>
