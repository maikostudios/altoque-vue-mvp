<template>
  <div class="adsense-unit" :class="unitClass">
    <!-- Contenedor del anuncio -->
    <div 
      :id="containerId" 
      class="ad-container"
      :class="{ 'ad-loading': loading, 'ad-blocked': adBlocked }"
    >
      <!-- Placeholder mientras carga -->
      <div v-if="loading" class="ad-placeholder">
        <v-skeleton-loader type="card" />
        <span class="loading-text">Cargando anuncio...</span>
      </div>
      
      <!-- Mensaje cuando hay ad blocker -->
      <div v-else-if="adBlocked" class="ad-blocked-message">
        <v-icon color="grey">mdi-shield-outline</v-icon>
        <span>Contenido publicitario bloqueado</span>
      </div>
      
      <!-- Mensaje de error -->
      <div v-else-if="error" class="ad-error-message">
        <v-icon color="error">mdi-alert-circle</v-icon>
        <span>Error cargando anuncio</span>
      </div>
    </div>
    
    <!-- Label de publicidad (requerido por AdSense) -->
    <div v-if="showLabel && !adBlocked" class="ad-label">
      Publicidad
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { adsenseService } from '@/services/adsenseService'

// Props
const props = defineProps({
  adUnitId: {
    type: String,
    required: true
  },
  publisherId: {
    type: String,
    required: true
  },
  format: {
    type: String,
    default: 'auto',
    validator: (value) => ['auto', 'rectangle', 'vertical', 'horizontal'].includes(value)
  },
  size: {
    type: String,
    default: 'responsive',
    validator: (value) => ['responsive', 'fixed', 'fluid'].includes(value)
  },
  placement: {
    type: String,
    default: 'content',
    validator: (value) => ['header', 'content', 'sidebar', 'footer'].includes(value)
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  testMode: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['ad-loaded', 'ad-error', 'ad-impression', 'ad-click'])

// Reactive data
const loading = ref(true)
const error = ref(null)
const adBlocked = ref(false)
const adLoaded = ref(false)

// Computed
const containerId = computed(() => `adsense-${props.adUnitId}-${Date.now()}`)

const unitClass = computed(() => ({
  [`adsense-${props.placement}`]: true,
  [`adsense-${props.format}`]: true,
  [`adsense-${props.size}`]: true,
  'adsense-loading': loading.value,
  'adsense-error': error.value,
  'adsense-blocked': adBlocked.value
}))

const adConfig = computed(() => ({
  publisherId: props.publisherId,
  format: props.format,
  responsive: props.size === 'responsive',
  style: getAdStyle(),
  fullWidthResponsive: props.size === 'responsive'
}))

// Methods
const getAdStyle = () => {
  const baseStyle = 'display:block;'
  
  switch (props.format) {
    case 'rectangle':
      return baseStyle + 'width:336px;height:280px;'
    case 'vertical':
      return baseStyle + 'width:160px;height:600px;'
    case 'horizontal':
      return baseStyle + 'width:728px;height:90px;'
    default:
      return baseStyle
  }
}

const initializeAd = async () => {
  try {
    loading.value = true
    error.value = null

    // Verificar si AdSense está disponible
    if (!adsenseService.isAvailable()) {
      await adsenseService.initializeAdSense(props.publisherId, props.testMode)
    }

    // Verificar detección de ad blocker
    if (adsenseService.adBlockDetected) {
      adBlocked.value = true
      loading.value = false
      return
    }

    // Crear unidad de anuncio
    adsenseService.createAdUnit(
      props.adUnitId,
      containerId.value,
      adConfig.value
    )

    // Observar para tracking de impresiones
    adsenseService.observeAdUnit(props.adUnitId)

    // Configurar listeners de eventos
    setupAdEventListeners()

    adLoaded.value = true
    loading.value = false
    
    emit('ad-loaded', {
      adUnitId: props.adUnitId,
      placement: props.placement
    })

  } catch (err) {
    console.error('Error initializing ad:', err)
    error.value = err.message
    loading.value = false
    
    emit('ad-error', {
      adUnitId: props.adUnitId,
      error: err.message
    })
  }
}

const setupAdEventListeners = () => {
  // Listener para impresiones (manejado por IntersectionObserver en el servicio)
  // Listener para clicks
  const adContainer = document.getElementById(containerId.value)
  if (adContainer) {
    adContainer.addEventListener('click', handleAdClick)
  }
}

const handleAdClick = async () => {
  try {
    await adsenseService.trackClick(props.adUnitId)
    
    emit('ad-click', {
      adUnitId: props.adUnitId,
      placement: props.placement,
      timestamp: new Date()
    })
    
  } catch (error) {
    console.error('Error tracking ad click:', error)
  }
}

const cleanupAd = () => {
  try {
    // Remover listeners
    const adContainer = document.getElementById(containerId.value)
    if (adContainer) {
      adContainer.removeEventListener('click', handleAdClick)
    }

    // Remover unidad de anuncio del servicio
    adsenseService.removeAdUnit(props.adUnitId)
    
  } catch (error) {
    console.error('Error cleaning up ad:', error)
  }
}

// Watchers
watch(() => props.adUnitId, () => {
  if (adLoaded.value) {
    cleanupAd()
    initializeAd()
  }
})

// Lifecycle
onMounted(() => {
  // Delay para asegurar que el DOM esté listo
  setTimeout(initializeAd, 100)
})

onUnmounted(() => {
  cleanupAd()
})
</script>

<style scoped>
.adsense-unit {
  width: 100%;
  margin: 1rem 0;
  position: relative;
}

.ad-container {
  width: 100%;
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.ad-container.ad-loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.ad-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  width: 100%;
}

.loading-text {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.ad-blocked-message,
.ad-error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.ad-label {
  text-align: center;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.25rem;
  opacity: 0.7;
}

/* Estilos por placement */
.adsense-header {
  margin: 0 0 2rem 0;
}

.adsense-content {
  margin: 1.5rem 0;
}

.adsense-sidebar {
  margin: 1rem 0;
  max-width: 300px;
}

.adsense-footer {
  margin: 2rem 0 0 0;
}

/* Estilos por formato */
.adsense-rectangle .ad-container {
  max-width: 336px;
  min-height: 280px;
}

.adsense-vertical .ad-container {
  max-width: 160px;
  min-height: 600px;
}

.adsense-horizontal .ad-container {
  max-width: 728px;
  min-height: 90px;
}

/* Estilos por tamaño */
.adsense-responsive .ad-container {
  width: 100%;
  min-height: 90px;
}

.adsense-fixed .ad-container {
  width: auto;
}

.adsense-fluid .ad-container {
  width: 100%;
  height: auto;
}

/* Animaciones */
@keyframes loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Estados */
.adsense-loading .ad-container {
  pointer-events: none;
}

.adsense-error .ad-container {
  border-color: var(--color-error);
  background: rgba(244, 67, 54, 0.05);
}

.adsense-blocked .ad-container {
  border-color: var(--color-warning);
  background: rgba(255, 152, 0, 0.05);
}

/* Responsive */
@media (max-width: 768px) {
  .adsense-horizontal .ad-container {
    max-width: 320px;
    min-height: 50px;
  }
  
  .adsense-rectangle .ad-container {
    max-width: 300px;
    min-height: 250px;
  }
  
  .adsense-sidebar {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .adsense-unit {
    margin: 0.5rem 0;
  }
  
  .ad-container {
    min-height: 50px;
  }
}
</style>
