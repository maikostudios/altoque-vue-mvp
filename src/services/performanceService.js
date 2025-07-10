// ✅ ETAPA 6: Performance Monitoring Service
// Servicio para monitoreo de rendimiento y trazas personalizadas

import { getPerformance, trace } from 'firebase/performance'
import app from '@/firebase'

class PerformanceService {
  constructor() {
    this.perf = getPerformance(app)
    this.traces = new Map()
    this.isEnabled = true
    
    // Configurar métricas automáticas
    this.setupAutomaticMetrics()
  }

  // ==================== TRAZAS PERSONALIZADAS ====================
  
  /**
   * Iniciar una traza personalizada
   * @param {string} traceName - Nombre de la traza
   * @param {Object} customAttributes - Atributos personalizados
   * @returns {Object} - Objeto de traza
   */
  startTrace(traceName, customAttributes = {}) {
    if (!this.isEnabled) return null
    
    try {
      const traceInstance = trace(this.perf, traceName)
      
      // Agregar atributos personalizados
      Object.entries(customAttributes).forEach(([key, value]) => {
        traceInstance.putAttribute(key, String(value))
      })
      
      traceInstance.start()
      this.traces.set(traceName, traceInstance)
      
      console.log(`🔍 Performance trace started: ${traceName}`)
      return traceInstance
    } catch (error) {
      console.error('Error starting performance trace:', error)
      return null
    }
  }

  /**
   * Finalizar una traza personalizada
   * @param {string} traceName - Nombre de la traza
   * @param {Object} metrics - Métricas adicionales
   */
  stopTrace(traceName, metrics = {}) {
    if (!this.isEnabled) return
    
    try {
      const traceInstance = this.traces.get(traceName)
      if (!traceInstance) {
        console.warn(`Trace ${traceName} not found`)
        return
      }

      // Agregar métricas personalizadas
      Object.entries(metrics).forEach(([key, value]) => {
        traceInstance.putMetric(key, Number(value))
      })

      traceInstance.stop()
      this.traces.delete(traceName)
      
      console.log(`✅ Performance trace completed: ${traceName}`)
    } catch (error) {
      console.error('Error stopping performance trace:', error)
    }
  }

  /**
   * Medir tiempo de ejecución de una función
   * @param {string} traceName - Nombre de la traza
   * @param {Function} fn - Función a medir
   * @param {Object} attributes - Atributos personalizados
   * @returns {Promise} - Resultado de la función
   */
  async measureFunction(traceName, fn, attributes = {}) {
    const traceInstance = this.startTrace(traceName, attributes)
    const startTime = performance.now()
    
    try {
      const result = await fn()
      const duration = performance.now() - startTime
      
      this.stopTrace(traceName, {
        duration_ms: Math.round(duration),
        success: 1
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      this.stopTrace(traceName, {
        duration_ms: Math.round(duration),
        success: 0,
        error_count: 1
      })
      
      throw error
    }
  }

  // ==================== TRAZAS ESPECÍFICAS DE LA APLICACIÓN ====================
  
  /**
   * Medir tiempo de carga del UserDashboardView
   */
  startUserDashboardTrace(userInfo = {}) {
    return this.startTrace('user_dashboard_load', {
      user_type: userInfo.isPremium ? 'premium' : 'free',
      user_role: userInfo.rol || 'usuario',
      has_cards: userInfo.cardCount > 0 ? 'true' : 'false'
    })
  }

  /**
   * Medir tiempo de carga de la landing pública
   */
  startPublicLandingTrace(userToken = null) {
    return this.startTrace('public_landing_load', {
      has_token: userToken ? 'true' : 'false',
      access_type: userToken ? 'direct' : 'organic'
    })
  }

  /**
   * Medir tiempo de acción de copiar datos
   */
  startCopyDataTrace(cardCount = 0) {
    return this.startTrace('copy_data_action', {
      card_count: String(cardCount),
      action_type: 'copy_all_data'
    })
  }

  /**
   * Medir tiempo de envío del UserInfoModal
   */
  startUserInfoModalTrace(isUpdate = false) {
    return this.startTrace('user_info_modal_submit', {
      action_type: isUpdate ? 'update' : 'create',
      form_type: 'onboarding'
    })
  }

  /**
   * Medir tiempo de ejecución de Cloud Functions
   */
  startCloudFunctionTrace(functionName, parameters = {}) {
    return this.startTrace(`cloud_function_${functionName}`, {
      function_name: functionName,
      parameter_count: String(Object.keys(parameters).length),
      ...parameters
    })
  }

  // ==================== MÉTRICAS AUTOMÁTICAS ====================
  
  /**
   * Configurar métricas automáticas del navegador
   */
  setupAutomaticMetrics() {
    if (typeof window === 'undefined') return

    // Medir tiempo de carga inicial de la página
    window.addEventListener('load', () => {
      this.measurePageLoadMetrics()
    })

    // Medir interacciones del usuario
    this.setupUserInteractionMetrics()
  }

  /**
   * Medir métricas de carga de página
   */
  measurePageLoadMetrics() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0]
      if (!navigation) return

      const loadTrace = this.startTrace('page_load_performance', {
        page_url: window.location.pathname,
        connection_type: navigator.connection?.effectiveType || 'unknown'
      })

      setTimeout(() => {
        this.stopTrace('page_load_performance', {
          dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
          load_complete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
          dns_lookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
          tcp_connect: Math.round(navigation.connectEnd - navigation.connectStart),
          server_response: Math.round(navigation.responseEnd - navigation.responseStart)
        })
      }, 100)
    } catch (error) {
      console.error('Error measuring page load metrics:', error)
    }
  }

  /**
   * Configurar métricas de interacción del usuario
   */
  setupUserInteractionMetrics() {
    // Medir tiempo hasta la primera interacción
    let firstInteraction = true
    const interactionEvents = ['click', 'keydown', 'touchstart']
    
    const handleFirstInteraction = () => {
      if (!firstInteraction) return
      firstInteraction = false
      
      const timeToInteraction = performance.now()
      this.recordCustomMetric('time_to_first_interaction', timeToInteraction)
      
      // Remover listeners después de la primera interacción
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction)
      })
    }
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true })
    })
  }

  /**
   * Registrar métrica personalizada
   */
  recordCustomMetric(metricName, value, attributes = {}) {
    try {
      const traceInstance = this.startTrace(`metric_${metricName}`, attributes)
      setTimeout(() => {
        this.stopTrace(`metric_${metricName}`, {
          [metricName]: Math.round(value)
        })
      }, 10)
    } catch (error) {
      console.error('Error recording custom metric:', error)
    }
  }

  // ==================== MONITOREO DE ERRORES ====================
  
  /**
   * Registrar error de rendimiento
   */
  recordPerformanceError(errorType, errorMessage, context = {}) {
    try {
      const errorTrace = this.startTrace('performance_error', {
        error_type: errorType,
        error_context: JSON.stringify(context).substring(0, 100)
      })
      
      setTimeout(() => {
        this.stopTrace('performance_error', {
          error_count: 1,
          error_severity: this.getErrorSeverity(errorType)
        })
      }, 10)
      
      console.error(`Performance Error [${errorType}]:`, errorMessage, context)
    } catch (error) {
      console.error('Error recording performance error:', error)
    }
  }

  /**
   * Obtener severidad del error
   */
  getErrorSeverity(errorType) {
    const severityMap = {
      'network_error': 3,
      'timeout_error': 2,
      'validation_error': 1,
      'user_error': 1,
      'system_error': 4,
      'critical_error': 5
    }
    
    return severityMap[errorType] || 2
  }

  // ==================== CONFIGURACIÓN ====================
  
  /**
   * Habilitar/deshabilitar monitoreo
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    console.log(`Performance monitoring ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Limpiar todas las trazas activas
   */
  clearAllTraces() {
    this.traces.forEach((trace, name) => {
      try {
        trace.stop()
        console.log(`Cleared trace: ${name}`)
      } catch (error) {
        console.error(`Error clearing trace ${name}:`, error)
      }
    })
    this.traces.clear()
  }
}

// Crear instancia singleton
export const performanceService = new PerformanceService()

// Exportar clase para testing
export { PerformanceService }

// Exportar funciones de conveniencia
export const {
  startTrace,
  stopTrace,
  measureFunction,
  startUserDashboardTrace,
  startPublicLandingTrace,
  startCopyDataTrace,
  startUserInfoModalTrace,
  startCloudFunctionTrace,
  recordCustomMetric,
  recordPerformanceError
} = performanceService
