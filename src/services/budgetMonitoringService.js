// ✅ ETAPA 6: Budget Monitoring Service
// Servicio para monitoreo de presupuesto y alertas de costos

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

class BudgetMonitoringService {
  constructor() {
    this.budgetLimits = {
      firestore_reads: 50000,    // Lecturas gratuitas por día
      firestore_writes: 20000,   // Escrituras gratuitas por día
      cloud_functions: 2000000,  // Invocaciones gratuitas por mes
      hosting_gb: 10,            // GB de hosting gratuito por mes
      storage_gb: 5              // GB de storage gratuito
    }
    
    this.alertThresholds = [0.5, 0.8, 0.9, 1.0] // 50%, 80%, 90%, 100%
    this.isEnabled = true
  }

  // ==================== MONITOREO DE USO ====================
  
  /**
   * Obtener métricas de uso actual
   */
  async getCurrentUsage() {
    try {
      const usageDoc = await getDoc(doc(db, 'monitoring', 'usage'))
      
      if (usageDoc.exists()) {
        return usageDoc.data()
      } else {
        // Crear documento inicial
        const initialUsage = this.createInitialUsageDoc()
        await setDoc(doc(db, 'monitoring', 'usage'), initialUsage)
        return initialUsage
      }
    } catch (error) {
      console.error('Error getting current usage:', error)
      throw error
    }
  }

  /**
   * Crear documento inicial de uso
   */
  createInitialUsageDoc() {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const currentDay = now.toISOString().split('T')[0]
    
    return {
      current_month: currentMonth,
      current_day: currentDay,
      firestore: {
        reads_today: 0,
        writes_today: 0,
        reads_month: 0,
        writes_month: 0,
        last_reset_day: currentDay,
        last_reset_month: currentMonth
      },
      cloud_functions: {
        invocations_month: 0,
        execution_time_ms: 0,
        last_reset: currentMonth
      },
      hosting: {
        bandwidth_gb_month: 0,
        requests_month: 0,
        last_reset: currentMonth
      },
      storage: {
        used_gb: 0,
        last_check: serverTimestamp()
      },
      alerts_sent: [],
      last_updated: serverTimestamp()
    }
  }

  /**
   * Incrementar contador de lecturas de Firestore
   */
  async incrementFirestoreReads(count = 1) {
    if (!this.isEnabled) return

    try {
      const usage = await this.getCurrentUsage()
      const today = new Date().toISOString().split('T')[0]
      
      // Resetear contadores diarios si es necesario
      if (usage.firestore.last_reset_day !== today) {
        usage.firestore.reads_today = 0
        usage.firestore.writes_today = 0
        usage.firestore.last_reset_day = today
      }
      
      usage.firestore.reads_today += count
      usage.firestore.reads_month += count
      usage.last_updated = serverTimestamp()
      
      await updateDoc(doc(db, 'monitoring', 'usage'), usage)
      
      // Verificar alertas
      await this.checkFirestoreAlerts(usage)
      
    } catch (error) {
      console.error('Error incrementing Firestore reads:', error)
    }
  }

  /**
   * Incrementar contador de escrituras de Firestore
   */
  async incrementFirestoreWrites(count = 1) {
    if (!this.isEnabled) return

    try {
      const usage = await this.getCurrentUsage()
      const today = new Date().toISOString().split('T')[0]
      
      // Resetear contadores diarios si es necesario
      if (usage.firestore.last_reset_day !== today) {
        usage.firestore.reads_today = 0
        usage.firestore.writes_today = 0
        usage.firestore.last_reset_day = today
      }
      
      usage.firestore.writes_today += count
      usage.firestore.writes_month += count
      usage.last_updated = serverTimestamp()
      
      await updateDoc(doc(db, 'monitoring', 'usage'), usage)
      
      // Verificar alertas
      await this.checkFirestoreAlerts(usage)
      
    } catch (error) {
      console.error('Error incrementing Firestore writes:', error)
    }
  }

  /**
   * Incrementar contador de invocaciones de Cloud Functions
   */
  async incrementCloudFunctionInvocations(functionName, executionTimeMs = 0) {
    if (!this.isEnabled) return

    try {
      const usage = await this.getCurrentUsage()
      const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
      
      // Resetear contadores mensuales si es necesario
      if (usage.cloud_functions.last_reset !== currentMonth) {
        usage.cloud_functions.invocations_month = 0
        usage.cloud_functions.execution_time_ms = 0
        usage.cloud_functions.last_reset = currentMonth
      }
      
      usage.cloud_functions.invocations_month += 1
      usage.cloud_functions.execution_time_ms += executionTimeMs
      usage.last_updated = serverTimestamp()
      
      await updateDoc(doc(db, 'monitoring', 'usage'), usage)
      
      // Verificar alertas
      await this.checkCloudFunctionAlerts(usage)
      
    } catch (error) {
      console.error('Error incrementing Cloud Function invocations:', error)
    }
  }

  // ==================== SISTEMA DE ALERTAS ====================
  
  /**
   * Verificar alertas de Firestore
   */
  async checkFirestoreAlerts(usage) {
    const readsPercentage = usage.firestore.reads_today / this.budgetLimits.firestore_reads
    const writesPercentage = usage.firestore.writes_today / this.budgetLimits.firestore_writes
    
    for (const threshold of this.alertThresholds) {
      if (readsPercentage >= threshold) {
        await this.sendAlert('firestore_reads', threshold, {
          current: usage.firestore.reads_today,
          limit: this.budgetLimits.firestore_reads,
          percentage: Math.round(readsPercentage * 100)
        })
      }
      
      if (writesPercentage >= threshold) {
        await this.sendAlert('firestore_writes', threshold, {
          current: usage.firestore.writes_today,
          limit: this.budgetLimits.firestore_writes,
          percentage: Math.round(writesPercentage * 100)
        })
      }
    }
  }

  /**
   * Verificar alertas de Cloud Functions
   */
  async checkCloudFunctionAlerts(usage) {
    const invocationsPercentage = usage.cloud_functions.invocations_month / this.budgetLimits.cloud_functions
    
    for (const threshold of this.alertThresholds) {
      if (invocationsPercentage >= threshold) {
        await this.sendAlert('cloud_functions', threshold, {
          current: usage.cloud_functions.invocations_month,
          limit: this.budgetLimits.cloud_functions,
          percentage: Math.round(invocationsPercentage * 100)
        })
      }
    }
  }

  /**
   * Enviar alerta
   */
  async sendAlert(service, threshold, data) {
    try {
      const alertId = `${service}_${threshold}_${new Date().toISOString().split('T')[0]}`
      
      // Verificar si ya se envió esta alerta hoy
      const usage = await this.getCurrentUsage()
      if (usage.alerts_sent.includes(alertId)) {
        return // Ya se envió esta alerta
      }
      
      const alert = {
        id: alertId,
        service,
        threshold: threshold * 100,
        data,
        timestamp: serverTimestamp(),
        severity: this.getAlertSeverity(threshold),
        message: this.generateAlertMessage(service, threshold, data)
      }
      
      // Guardar alerta en Firestore
      await setDoc(doc(db, 'monitoring', 'alerts', alertId), alert)
      
      // Agregar a la lista de alertas enviadas
      usage.alerts_sent.push(alertId)
      await updateDoc(doc(db, 'monitoring', 'usage'), {
        alerts_sent: usage.alerts_sent
      })
      
      // Log en consola
      console.warn(`🚨 BUDGET ALERT [${alert.severity}]:`, alert.message)
      
      // Enviar notificación (implementar según necesidades)
      await this.sendNotification(alert)
      
    } catch (error) {
      console.error('Error sending alert:', error)
    }
  }

  /**
   * Obtener severidad de la alerta
   */
  getAlertSeverity(threshold) {
    if (threshold >= 1.0) return 'CRITICAL'
    if (threshold >= 0.9) return 'HIGH'
    if (threshold >= 0.8) return 'MEDIUM'
    return 'LOW'
  }

  /**
   * Generar mensaje de alerta
   */
  generateAlertMessage(service, threshold, data) {
    const serviceNames = {
      firestore_reads: 'Lecturas de Firestore',
      firestore_writes: 'Escrituras de Firestore',
      cloud_functions: 'Invocaciones de Cloud Functions'
    }
    
    const serviceName = serviceNames[service] || service
    const percentage = threshold * 100
    
    return `${serviceName}: ${data.percentage}% del límite alcanzado (${data.current}/${data.limit})`
  }

  /**
   * Enviar notificación
   */
  async sendNotification(alert) {
    try {
      // Aquí se puede implementar envío de email, webhook, etc.
      // Por ahora solo guardamos en una colección de notificaciones
      
      await setDoc(doc(db, 'notifications', alert.id), {
        type: 'budget_alert',
        title: `Alerta de Presupuesto - ${alert.severity}`,
        message: alert.message,
        data: alert.data,
        read: false,
        created_at: serverTimestamp()
      })
      
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  // ==================== REPORTES Y ANÁLISIS ====================
  
  /**
   * Generar reporte de uso
   */
  async generateUsageReport() {
    try {
      const usage = await this.getCurrentUsage()
      
      const report = {
        generated_at: new Date().toISOString(),
        period: {
          current_day: usage.current_day,
          current_month: usage.current_month
        },
        firestore: {
          reads: {
            today: usage.firestore.reads_today,
            month: usage.firestore.reads_month,
            limit_daily: this.budgetLimits.firestore_reads,
            percentage_today: Math.round((usage.firestore.reads_today / this.budgetLimits.firestore_reads) * 100)
          },
          writes: {
            today: usage.firestore.writes_today,
            month: usage.firestore.writes_month,
            limit_daily: this.budgetLimits.firestore_writes,
            percentage_today: Math.round((usage.firestore.writes_today / this.budgetLimits.firestore_writes) * 100)
          }
        },
        cloud_functions: {
          invocations: usage.cloud_functions.invocations_month,
          limit_monthly: this.budgetLimits.cloud_functions,
          percentage_month: Math.round((usage.cloud_functions.invocations_month / this.budgetLimits.cloud_functions) * 100),
          execution_time_ms: usage.cloud_functions.execution_time_ms
        },
        alerts: {
          total_sent: usage.alerts_sent.length,
          recent: usage.alerts_sent.slice(-5)
        }
      }
      
      return report
    } catch (error) {
      console.error('Error generating usage report:', error)
      throw error
    }
  }

  /**
   * Obtener alertas recientes
   */
  async getRecentAlerts(limit = 10) {
    try {
      // Implementar consulta a la colección de alertas
      // Por simplicidad, retornamos las alertas del documento de uso
      const usage = await this.getCurrentUsage()
      return usage.alerts_sent.slice(-limit)
    } catch (error) {
      console.error('Error getting recent alerts:', error)
      throw error
    }
  }

  // ==================== CONFIGURACIÓN ====================
  
  /**
   * Actualizar límites de presupuesto
   */
  updateBudgetLimits(newLimits) {
    this.budgetLimits = {
      ...this.budgetLimits,
      ...newLimits
    }
    
    console.log('Budget limits updated:', this.budgetLimits)
  }

  /**
   * Actualizar umbrales de alerta
   */
  updateAlertThresholds(newThresholds) {
    this.alertThresholds = newThresholds.sort((a, b) => a - b)
    console.log('Alert thresholds updated:', this.alertThresholds)
  }

  /**
   * Habilitar/deshabilitar monitoreo
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    console.log(`Budget monitoring ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Resetear contadores (para testing)
   */
  async resetCounters() {
    try {
      const initialUsage = this.createInitialUsageDoc()
      await setDoc(doc(db, 'monitoring', 'usage'), initialUsage)
      console.log('Usage counters reset')
    } catch (error) {
      console.error('Error resetting counters:', error)
    }
  }
}

// Crear instancia singleton
export const budgetMonitoringService = new BudgetMonitoringService()

// Exportar clase para testing
export { BudgetMonitoringService }

// Exportar funciones de conveniencia
export const {
  getCurrentUsage,
  incrementFirestoreReads,
  incrementFirestoreWrites,
  incrementCloudFunctionInvocations,
  generateUsageReport,
  getRecentAlerts,
  updateBudgetLimits,
  updateAlertThresholds
} = budgetMonitoringService
