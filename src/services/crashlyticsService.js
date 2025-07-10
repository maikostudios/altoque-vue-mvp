// ✅ ETAPA 6: Crashlytics Service
// Servicio para monitoreo de errores y crashes

import { getAnalytics, logEvent } from 'firebase/analytics'
import app from '@/firebase'

class CrashlyticsService {
  constructor() {
    this.analytics = null
    this.isEnabled = true
    this.errorQueue = []
    this.maxQueueSize = 50
    
    this.initializeAnalytics()
    this.setupGlobalErrorHandlers()
  }

  // ==================== INICIALIZACIÓN ====================
  
  /**
   * Inicializar Firebase Analytics para logging de errores
   */
  async initializeAnalytics() {
    try {
      this.analytics = getAnalytics(app)
      console.log('✅ Crashlytics service initialized')
    } catch (error) {
      console.error('Error initializing analytics:', error)
    }
  }

  /**
   * Configurar manejadores globales de errores
   */
  setupGlobalErrorHandlers() {
    // Errores JavaScript no capturados
    window.addEventListener('error', (event) => {
      this.recordError('javascript_error', event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        source: 'global_error_handler'
      })
    })

    // Promesas rechazadas no capturadas
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError('unhandled_promise_rejection', event.reason, {
        source: 'unhandled_rejection_handler'
      })
    })

    // Errores de Vue (si está disponible)
    if (window.Vue && window.Vue.config) {
      window.Vue.config.errorHandler = (err, vm, info) => {
        this.recordError('vue_error', err, {
          component_info: info,
          source: 'vue_error_handler'
        })
      }
    }
  }

  // ==================== REGISTRO DE ERRORES ====================
  
  /**
   * Registrar error personalizado
   * @param {string} errorType - Tipo de error
   * @param {Error|string} error - Error o mensaje
   * @param {Object} context - Contexto adicional
   * @param {string} severity - Severidad: 'low', 'medium', 'high', 'critical'
   */
  recordError(errorType, error, context = {}, severity = 'medium') {
    if (!this.isEnabled) return

    try {
      const errorData = this.formatError(errorType, error, context, severity)
      
      // Agregar a la cola
      this.addToQueue(errorData)
      
      // Enviar a Firebase Analytics
      this.sendToAnalytics(errorData)
      
      // Log en consola para desarrollo
      this.logToConsole(errorData)
      
    } catch (err) {
      console.error('Error recording error:', err)
    }
  }

  /**
   * Formatear datos del error
   */
  formatError(errorType, error, context, severity) {
    const timestamp = new Date().toISOString()
    const errorMessage = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : null
    
    return {
      error_type: errorType,
      error_message: errorMessage,
      error_stack: stack,
      severity,
      timestamp,
      context: {
        ...context,
        url: window.location.href,
        user_agent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timestamp_ms: Date.now()
      }
    }
  }

  /**
   * Agregar error a la cola
   */
  addToQueue(errorData) {
    this.errorQueue.push(errorData)
    
    // Mantener tamaño máximo de la cola
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }
  }

  /**
   * Enviar error a Firebase Analytics
   */
  sendToAnalytics(errorData) {
    if (!this.analytics) return

    try {
      logEvent(this.analytics, 'app_error', {
        error_type: errorData.error_type,
        error_message: errorData.error_message.substring(0, 100),
        severity: errorData.severity,
        custom_parameter_1: JSON.stringify(errorData.context).substring(0, 100)
      })
    } catch (error) {
      console.error('Error sending to analytics:', error)
    }
  }

  /**
   * Log en consola para desarrollo
   */
  logToConsole(errorData) {
    const style = this.getConsoleStyle(errorData.severity)
    
    console.group(`%c🚨 ${errorData.error_type.toUpperCase()} [${errorData.severity}]`, style)
    console.error('Message:', errorData.error_message)
    if (errorData.error_stack) {
      console.error('Stack:', errorData.error_stack)
    }
    console.log('Context:', errorData.context)
    console.log('Timestamp:', errorData.timestamp)
    console.groupEnd()
  }

  /**
   * Obtener estilo de consola según severidad
   */
  getConsoleStyle(severity) {
    const styles = {
      low: 'color: #2196F3; font-weight: bold;',
      medium: 'color: #FF9800; font-weight: bold;',
      high: 'color: #F44336; font-weight: bold;',
      critical: 'color: #FFFFFF; background-color: #F44336; font-weight: bold; padding: 2px 4px;'
    }
    
    return styles[severity] || styles.medium
  }

  // ==================== ERRORES ESPECÍFICOS DE LA APLICACIÓN ====================
  
  /**
   * Registrar error de autenticación
   */
  recordAuthError(error, context = {}) {
    this.recordError('authentication_error', error, {
      ...context,
      component: 'auth_system'
    }, 'high')
  }

  /**
   * Registrar error de Firestore
   */
  recordFirestoreError(error, operation, collection, context = {}) {
    this.recordError('firestore_error', error, {
      ...context,
      operation,
      collection,
      component: 'database'
    }, 'high')
  }

  /**
   * Registrar error de Cloud Function
   */
  recordCloudFunctionError(error, functionName, parameters = {}, context = {}) {
    this.recordError('cloud_function_error', error, {
      ...context,
      function_name: functionName,
      parameters: JSON.stringify(parameters).substring(0, 200),
      component: 'cloud_functions'
    }, 'high')
  }

  /**
   * Registrar error de validación
   */
  recordValidationError(error, formType, fieldName, context = {}) {
    this.recordError('validation_error', error, {
      ...context,
      form_type: formType,
      field_name: fieldName,
      component: 'validation'
    }, 'low')
  }

  /**
   * Registrar error de red
   */
  recordNetworkError(error, url, method = 'GET', context = {}) {
    this.recordError('network_error', error, {
      ...context,
      url,
      method,
      component: 'network'
    }, 'medium')
  }

  /**
   * Registrar error de UI/UX
   */
  recordUIError(error, componentName, action, context = {}) {
    this.recordError('ui_error', error, {
      ...context,
      component_name: componentName,
      action,
      component: 'ui'
    }, 'low')
  }

  // ==================== MÉTRICAS Y ANÁLISIS ====================
  
  /**
   * Obtener estadísticas de errores
   */
  getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      by_type: {},
      by_severity: {},
      recent: this.errorQueue.slice(-10)
    }

    this.errorQueue.forEach(error => {
      // Por tipo
      stats.by_type[error.error_type] = (stats.by_type[error.error_type] || 0) + 1
      
      // Por severidad
      stats.by_severity[error.severity] = (stats.by_severity[error.severity] || 0) + 1
    })

    return stats
  }

  /**
   * Exportar errores para análisis
   */
  exportErrors(format = 'json') {
    const data = {
      exported_at: new Date().toISOString(),
      total_errors: this.errorQueue.length,
      errors: this.errorQueue
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    } else if (format === 'csv') {
      return this.convertToCSV(this.errorQueue)
    }

    return data
  }

  /**
   * Convertir errores a CSV
   */
  convertToCSV(errors) {
    if (errors.length === 0) return ''

    const headers = ['timestamp', 'error_type', 'severity', 'error_message', 'url']
    const rows = errors.map(error => [
      error.timestamp,
      error.error_type,
      error.severity,
      error.error_message.replace(/"/g, '""'),
      error.context.url || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    return csvContent
  }

  // ==================== CONFIGURACIÓN ====================
  
  /**
   * Configurar usuario para contexto de errores
   */
  setUser(userId, email, additionalData = {}) {
    this.userContext = {
      user_id: userId,
      user_email: email,
      ...additionalData
    }
  }

  /**
   * Agregar contexto global
   */
  setGlobalContext(context) {
    this.globalContext = {
      ...this.globalContext,
      ...context
    }
  }

  /**
   * Habilitar/deshabilitar servicio
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    console.log(`Crashlytics service ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Limpiar cola de errores
   */
  clearErrorQueue() {
    this.errorQueue = []
    console.log('Error queue cleared')
  }

  /**
   * Generar error de prueba
   */
  generateTestError() {
    this.recordError('test_error', new Error('This is a test error for Crashlytics'), {
      test: true,
      generated_at: new Date().toISOString()
    }, 'low')
  }
}

// Crear instancia singleton
export const crashlyticsService = new CrashlyticsService()

// Exportar clase para testing
export { CrashlyticsService }

// Exportar funciones de conveniencia
export const {
  recordError,
  recordAuthError,
  recordFirestoreError,
  recordCloudFunctionError,
  recordValidationError,
  recordNetworkError,
  recordUIError,
  setUser,
  setGlobalContext,
  getErrorStats,
  exportErrors,
  generateTestError
} = crashlyticsService
