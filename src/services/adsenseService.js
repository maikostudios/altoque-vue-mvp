// ✅ ETAPA 6: AdSense Service
// Servicio para gestión de publicidad de Google AdSense

import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

class AdSenseService {
  constructor() {
    this.isEnabled = false
    this.adUnits = new Map()
    this.impressionObserver = null
    this.adBlockDetected = false
    
    this.setupAdBlockDetection()
  }

  // ==================== INICIALIZACIÓN ====================
  
  /**
   * Inicializar AdSense
   * @param {string} publisherId - ID del publisher de AdSense
   * @param {boolean} testMode - Modo de prueba
   */
  async initializeAdSense(publisherId, testMode = false) {
    try {
      if (this.isEnabled) return

      // Verificar si AdSense ya está cargado
      if (window.adsbygoogle) {
        this.isEnabled = true
        return
      }

      // Cargar script de AdSense
      await this.loadAdSenseScript(publisherId, testMode)
      
      // Configurar observador de intersección para impresiones
      this.setupImpressionObserver()
      
      this.isEnabled = true
      console.log('✅ AdSense initialized successfully')
      
    } catch (error) {
      console.error('Error initializing AdSense:', error)
      throw error
    }
  }

  /**
   * Cargar script de AdSense
   */
  loadAdSenseScript(publisherId, testMode) {
    return new Promise((resolve, reject) => {
      // Verificar si ya existe el script
      if (document.querySelector('script[src*="adsbygoogle.js"]')) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.async = true
      script.crossOrigin = 'anonymous'
      
      if (testMode) {
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-test'
      } else {
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`
      }
      
      script.onload = () => {
        // Inicializar array de AdSense si no existe
        window.adsbygoogle = window.adsbygoogle || []
        resolve()
      }
      
      script.onerror = () => {
        this.adBlockDetected = true
        reject(new Error('Failed to load AdSense script - possible ad blocker'))
      }
      
      document.head.appendChild(script)
    })
  }

  // ==================== GESTIÓN DE ANUNCIOS ====================
  
  /**
   * Crear unidad de anuncio
   * @param {string} adUnitId - ID de la unidad de anuncio
   * @param {string} containerId - ID del contenedor HTML
   * @param {Object} config - Configuración del anuncio
   */
  createAdUnit(adUnitId, containerId, config = {}) {
    try {
      const container = document.getElementById(containerId)
      if (!container) {
        throw new Error(`Container ${containerId} not found`)
      }

      // Configuración por defecto
      const defaultConfig = {
        format: 'auto',
        responsive: true,
        style: 'display:block',
        fullWidthResponsive: true
      }

      const adConfig = { ...defaultConfig, ...config }

      // Crear elemento de anuncio
      const adElement = document.createElement('ins')
      adElement.className = 'adsbygoogle'
      adElement.style.cssText = adConfig.style
      adElement.setAttribute('data-ad-client', config.publisherId || '')
      adElement.setAttribute('data-ad-slot', adUnitId)
      adElement.setAttribute('data-ad-format', adConfig.format)
      
      if (adConfig.responsive) {
        adElement.setAttribute('data-full-width-responsive', 'true')
      }

      // Agregar al contenedor
      container.appendChild(adElement)

      // Registrar unidad de anuncio
      this.adUnits.set(adUnitId, {
        element: adElement,
        container: containerId,
        config: adConfig,
        impressions: 0,
        clicks: 0,
        revenue: 0
      })

      // Activar anuncio si AdSense está habilitado
      if (this.isEnabled && !this.adBlockDetected) {
        this.activateAdUnit(adUnitId)
      }

      console.log(`Ad unit ${adUnitId} created in container ${containerId}`)
      
    } catch (error) {
      console.error(`Error creating ad unit ${adUnitId}:`, error)
      throw error
    }
  }

  /**
   * Activar unidad de anuncio
   */
  activateAdUnit(adUnitId) {
    try {
      const adUnit = this.adUnits.get(adUnitId)
      if (!adUnit) {
        throw new Error(`Ad unit ${adUnitId} not found`)
      }

      if (window.adsbygoogle && !this.adBlockDetected) {
        window.adsbygoogle.push({})
        console.log(`Ad unit ${adUnitId} activated`)
      }
      
    } catch (error) {
      console.error(`Error activating ad unit ${adUnitId}:`, error)
    }
  }

  /**
   * Remover unidad de anuncio
   */
  removeAdUnit(adUnitId) {
    try {
      const adUnit = this.adUnits.get(adUnitId)
      if (!adUnit) return

      // Remover elemento del DOM
      if (adUnit.element && adUnit.element.parentNode) {
        adUnit.element.parentNode.removeChild(adUnit.element)
      }

      // Remover del registro
      this.adUnits.delete(adUnitId)
      
      console.log(`Ad unit ${adUnitId} removed`)
      
    } catch (error) {
      console.error(`Error removing ad unit ${adUnitId}:`, error)
    }
  }

  // ==================== TRACKING DE IMPRESIONES ====================
  
  /**
   * Configurar observador de intersección para tracking de impresiones
   */
  setupImpressionObserver() {
    if (!window.IntersectionObserver) return

    this.impressionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const adElement = entry.target
            const adUnitId = this.findAdUnitId(adElement)
            
            if (adUnitId) {
              this.trackImpression(adUnitId)
            }
          }
        })
      },
      {
        threshold: 0.5, // 50% visible
        rootMargin: '0px'
      }
    )
  }

  /**
   * Encontrar ID de unidad de anuncio por elemento
   */
  findAdUnitId(element) {
    for (const [adUnitId, adUnit] of this.adUnits.entries()) {
      if (adUnit.element === element) {
        return adUnitId
      }
    }
    return null
  }

  /**
   * Observar anuncio para tracking de impresiones
   */
  observeAdUnit(adUnitId) {
    const adUnit = this.adUnits.get(adUnitId)
    if (adUnit && this.impressionObserver) {
      this.impressionObserver.observe(adUnit.element)
    }
  }

  /**
   * Registrar impresión de anuncio
   */
  async trackImpression(adUnitId) {
    try {
      const adUnit = this.adUnits.get(adUnitId)
      if (!adUnit) return

      // Incrementar contador local
      adUnit.impressions++

      // Registrar en Firestore
      await this.recordAdMetric('impression', adUnitId, {
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href
      })

      console.log(`Impression tracked for ad unit: ${adUnitId}`)
      
    } catch (error) {
      console.error(`Error tracking impression for ${adUnitId}:`, error)
    }
  }

  /**
   * Registrar click en anuncio
   */
  async trackClick(adUnitId) {
    try {
      const adUnit = this.adUnits.get(adUnitId)
      if (!adUnit) return

      // Incrementar contador local
      adUnit.clicks++

      // Registrar en Firestore
      await this.recordAdMetric('click', adUnitId, {
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href
      })

      console.log(`Click tracked for ad unit: ${adUnitId}`)
      
    } catch (error) {
      console.error(`Error tracking click for ${adUnitId}:`, error)
    }
  }

  /**
   * Registrar métrica de anuncio en Firestore
   */
  async recordAdMetric(type, adUnitId, data) {
    try {
      const metricsRef = doc(db, 'public_landings', 'ads_metrics')
      
      const updateData = {
        [`${type}s.${adUnitId}`]: increment(1),
        [`${type}s.total`]: increment(1),
        lastUpdated: serverTimestamp()
      }

      await updateDoc(metricsRef, updateData)
      
    } catch (error) {
      console.error('Error recording ad metric:', error)
    }
  }

  // ==================== DETECCIÓN DE AD BLOCKER ====================
  
  /**
   * Configurar detección de ad blocker
   */
  setupAdBlockDetection() {
    // Crear elemento de prueba que los ad blockers suelen bloquear
    const testAd = document.createElement('div')
    testAd.innerHTML = '&nbsp;'
    testAd.className = 'adsbox'
    testAd.style.cssText = 'position:absolute;left:-10000px;'
    
    document.body.appendChild(testAd)
    
    setTimeout(() => {
      if (testAd.offsetHeight === 0) {
        this.adBlockDetected = true
        console.warn('Ad blocker detected')
      }
      document.body.removeChild(testAd)
    }, 100)
  }

  // ==================== CONFIGURACIÓN RESPONSIVA ====================
  
  /**
   * Configurar anuncios responsivos
   */
  setupResponsiveAds() {
    const mediaQueries = [
      { query: '(max-width: 600px)', size: 'mobile' },
      { query: '(max-width: 1024px)', size: 'tablet' },
      { query: '(min-width: 1025px)', size: 'desktop' }
    ]

    mediaQueries.forEach(({ query, size }) => {
      const mediaQuery = window.matchMedia(query)
      
      const handleChange = (e) => {
        if (e.matches) {
          this.adjustAdsForDevice(size)
        }
      }
      
      mediaQuery.addListener(handleChange)
      handleChange(mediaQuery) // Ejecutar inmediatamente
    })
  }

  /**
   * Ajustar anuncios según dispositivo
   */
  adjustAdsForDevice(deviceSize) {
    this.adUnits.forEach((adUnit, adUnitId) => {
      const { element, config } = adUnit
      
      // Ajustar tamaños según dispositivo
      switch (deviceSize) {
        case 'mobile':
          element.style.width = '100%'
          element.style.height = 'auto'
          break
        case 'tablet':
          element.style.width = '728px'
          element.style.height = '90px'
          break
        case 'desktop':
          element.style.width = '970px'
          element.style.height = '250px'
          break
      }
    })
  }

  // ==================== REPORTES Y ANÁLISIS ====================
  
  /**
   * Obtener estadísticas de anuncios
   */
  getAdStats() {
    const stats = {
      totalUnits: this.adUnits.size,
      totalImpressions: 0,
      totalClicks: 0,
      totalRevenue: 0,
      ctr: 0,
      units: {}
    }

    this.adUnits.forEach((adUnit, adUnitId) => {
      stats.totalImpressions += adUnit.impressions
      stats.totalClicks += adUnit.clicks
      stats.totalRevenue += adUnit.revenue
      
      stats.units[adUnitId] = {
        impressions: adUnit.impressions,
        clicks: adUnit.clicks,
        revenue: adUnit.revenue,
        ctr: adUnit.impressions > 0 ? (adUnit.clicks / adUnit.impressions * 100).toFixed(2) : 0
      }
    })

    stats.ctr = stats.totalImpressions > 0 ? 
      (stats.totalClicks / stats.totalImpressions * 100).toFixed(2) : 0

    return stats
  }

  // ==================== CONFIGURACIÓN ====================
  
  /**
   * Habilitar/deshabilitar AdSense
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    console.log(`AdSense ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Verificar si AdSense está disponible
   */
  isAvailable() {
    return this.isEnabled && !this.adBlockDetected && window.adsbygoogle
  }

  /**
   * Limpiar todos los anuncios
   */
  clearAllAds() {
    this.adUnits.forEach((adUnit, adUnitId) => {
      this.removeAdUnit(adUnitId)
    })
    
    if (this.impressionObserver) {
      this.impressionObserver.disconnect()
    }
  }
}

// Crear instancia singleton
export const adsenseService = new AdSenseService()

// Exportar clase para testing
export { AdSenseService }
