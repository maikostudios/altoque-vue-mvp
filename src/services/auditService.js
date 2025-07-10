/**
 * 🔍 Servicio de Auditoría - De Una Transferencias
 * Maneja todas las operaciones relacionadas con logs de auditoría
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  doc,
  getDoc 
} from 'firebase/firestore'
import { db } from '@/firebase'

/**
 * ✅ CLASE PRINCIPAL DEL SERVICIO DE AUDITORÍA
 */
export class AuditService {
  constructor() {
    this.collectionName = 'logs'
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutos
  }

  /**
   * 📊 Obtener logs con filtros avanzados y paginación
   */
  async getLogs(filters = {}, pagination = {}) {
    try {
      console.log('📊 Cargando logs con filtros:', filters)

      // Construir query base
      let q = query(
        collection(db, this.collectionName),
        orderBy('timestamp', 'desc')
      )

      // ✅ APLICAR FILTROS INDEXABLES
      if (filters.type && filters.type.length > 0) {
        q = query(q, where('type', 'in', filters.type))
      }

      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId))
      }

      if (filters.responsibleUid) {
        q = query(q, where('responsibleUid', '==', filters.responsibleUid))
      }

      if (filters.severity && filters.severity.length > 0) {
        q = query(q, where('eventSeverity', 'in', filters.severity))
      }

      // ✅ PAGINACIÓN
      if (pagination.lastDoc) {
        q = query(q, startAfter(pagination.lastDoc))
      }

      const pageSize = pagination.limit || 25
      q = query(q, limit(pageSize))

      // Ejecutar query
      const snapshot = await getDocs(q)
      let logs = []
      
      snapshot.forEach(doc => {
        logs.push({
          id: doc.id,
          ...doc.data()
        })
      })

      // ✅ FILTROS ADICIONALES EN CLIENTE
      logs = this.applyClientSideFilters(logs, filters)

      const lastDoc = snapshot.docs[snapshot.docs.length - 1]
      const hasMore = snapshot.docs.length === pageSize

      console.log(`✅ ${logs.length} logs cargados`)

      return {
        logs,
        lastDoc,
        hasMore,
        total: logs.length
      }

    } catch (error) {
      console.error('❌ Error cargando logs:', error)
      throw error
    }
  }

  /**
   * 🔍 Aplicar filtros que no se pueden indexar en Firestore
   */
  applyClientSideFilters(logs, filters) {
    let filtered = [...logs]

    // Filtro de búsqueda libre
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(log => 
        (log.eventDescription && log.eventDescription.toLowerCase().includes(search)) ||
        (log.responsibleEmail && log.responsibleEmail.toLowerCase().includes(search)) ||
        (log.responsibleIpAddress && log.responsibleIpAddress.includes(search)) ||
        (log.changeDetails && JSON.stringify(log.changeDetails).toLowerCase().includes(search))
      )
    }

    // Filtro de fecha desde
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp)
        return logDate >= fromDate
      })
    }

    // Filtro de fecha hasta
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      filtered = filtered.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp)
        return logDate <= toDate
      })
    }

    return filtered
  }

  /**
   * 📈 Obtener estadísticas de logs
   */
  async getLogStats(filters = {}) {
    try {
      const cacheKey = `stats_${JSON.stringify(filters)}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      // Obtener logs para estadísticas
      const result = await this.getLogs(filters, { limit: 1000 })
      const logs = result.logs

      const stats = {
        total: logs.length,
        info: logs.filter(log => log.eventSeverity === 'info').length,
        warning: logs.filter(log => log.eventSeverity === 'warning').length,
        error: logs.filter(log => log.eventSeverity === 'error').length,
        critical: logs.filter(log => log.eventSeverity === 'critical').length,
        byType: this.groupByField(logs, 'type'),
        byResponsible: this.groupByField(logs, 'responsibleEmail'),
        last24h: logs.filter(log => {
          const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp)
          return Date.now() - logDate.getTime() < 24 * 60 * 60 * 1000
        }).length
      }

      // Guardar en cache
      this.cache.set(cacheKey, {
        data: stats,
        timestamp: Date.now()
      })

      return stats

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error)
      throw error
    }
  }

  /**
   * 👥 Obtener opciones de usuarios para autocompletado
   */
  async getUserOptions() {
    try {
      const cacheKey = 'user_options'
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      const snapshot = await getDocs(collection(db, 'users'))
      const options = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          label: `${data.email} (${data.nombre || 'Sin nombre'})`,
          value: doc.id,
          email: data.email,
          name: data.nombre || data.displayName
        }
      })

      // Guardar en cache
      this.cache.set(cacheKey, {
        data: options,
        timestamp: Date.now()
      })

      return options

    } catch (error) {
      console.error('❌ Error cargando usuarios:', error)
      throw error
    }
  }

  /**
   * 👨‍💼 Obtener opciones de administradores/soporte para autocompletado
   */
  async getAdminOptions() {
    try {
      const cacheKey = 'admin_options'
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      const q = query(
        collection(db, 'users'),
        where('rol', 'in', ['admin', 'soporte'])
      )
      
      const snapshot = await getDocs(q)
      const options = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          label: `${data.email} (${data.rol})`,
          value: doc.id,
          email: data.email,
          role: data.rol
        }
      })

      // Guardar en cache
      this.cache.set(cacheKey, {
        data: options,
        timestamp: Date.now()
      })

      return options

    } catch (error) {
      console.error('❌ Error cargando administradores:', error)
      throw error
    }
  }

  /**
   * 📄 Obtener detalles de un log específico
   */
  async getLogDetails(logId) {
    try {
      const docRef = doc(db, this.collectionName, logId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        }
      } else {
        throw new Error('Log no encontrado')
      }

    } catch (error) {
      console.error('❌ Error obteniendo detalles del log:', error)
      throw error
    }
  }

  /**
   * 📊 Exportar logs a CSV
   */
  exportToCSV(logs, filename = null) {
    try {
      const headers = [
        'Fecha/Hora',
        'Tipo',
        'Severidad',
        'Responsable',
        'Email Responsable',
        'IP',
        'User Agent',
        'Descripción',
        'Usuario Afectado',
        'Entidad Involucrada',
        'Detalles'
      ]
      
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          this.formatDateTime(log.timestamp),
          log.type || '',
          log.eventSeverity || '',
          log.responsibleEmail || 'Sistema',
          log.responsibleEmail || '',
          log.responsibleIpAddress || '',
          `"${(log.responsibleUserAgent || '').replace(/"/g, '""')}"`,
          `"${(log.eventDescription || '').replace(/"/g, '""')}"`,
          log.userId || '',
          log.involvedEntityId || '',
          `"${JSON.stringify(log.changeDetails || {}).replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', filename || `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('✅ Logs exportados a CSV')
      return true

    } catch (error) {
      console.error('❌ Error exportando CSV:', error)
      throw error
    }
  }

  /**
   * 🔧 Utilidades
   */
  groupByField(array, field) {
    return array.reduce((acc, item) => {
      const key = item[field] || 'Sin especificar'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }

  formatDateTime(timestamp) {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return `${date.toLocaleDateString('es-CL')} ${date.toLocaleTimeString('es-CL')}`
  }

  /**
   * 🧹 Limpiar cache
   */
  clearCache() {
    this.cache.clear()
    console.log('✅ Cache de auditoría limpiado')
  }
}

// ✅ INSTANCIA SINGLETON
export const auditService = new AuditService()

// ✅ VISTAS PREDEFINIDAS
export const PREDEFINED_VIEWS = {
  RECENT_CHANGES: {
    key: 'recent_changes',
    name: 'Cambios Recientes',
    icon: 'mdi-clock-outline',
    description: 'Cambios de roles y planes en las últimas 24 horas',
    filters: {
      type: ['role_change', 'plan_change'],
      dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    }
  },
  SECURITY_WARNINGS: {
    key: 'security_warnings',
    name: 'Alertas Seguridad',
    icon: 'mdi-shield-alert',
    description: 'Eventos de seguridad y errores críticos',
    filters: {
      severity: ['warning', 'error', 'critical']
    }
  },
  VENDOR_ACTIVITY: {
    key: 'vendor_activity',
    name: 'Actividad Vendedores',
    icon: 'mdi-account-tie',
    description: 'Actividad de vendedores en los últimos 7 días',
    filters: {
      type: ['user_creation', 'vendor_registration'],
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    }
  },
  PLAN_CHANGES: {
    key: 'plan_changes',
    name: 'Cambios de Plan',
    icon: 'mdi-diamond',
    description: 'Cambios de plan Premium en el último mes',
    filters: {
      type: ['plan_change'],
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    }
  },
  TODAY_ACTIVITY: {
    key: 'today_activity',
    name: 'Actividad Hoy',
    icon: 'mdi-calendar-today',
    description: 'Toda la actividad del día actual',
    filters: {
      dateFrom: new Date().toISOString().slice(0, 10) + 'T00:00'
    }
  },
  ID_VERIFICATIONS: {
    key: 'id_verifications',
    name: 'Verificaciones ID',
    icon: 'mdi-shield-check',
    description: 'Verificaciones de identidad realizadas',
    filters: {
      type: ['id_verification']
    }
  }
}

// ✅ TIPOS DE EVENTOS
export const EVENT_TYPES = [
  { title: 'Cambio de Rol', value: 'role_change', icon: 'mdi-account-switch', color: 'warning' },
  { title: 'Cambio de Plan', value: 'plan_change', icon: 'mdi-diamond', color: 'info' },
  { title: 'Verificación ID', value: 'id_verification', icon: 'mdi-shield-check', color: 'success' },
  { title: 'Creación Usuario', value: 'user_creation', icon: 'mdi-account-plus', color: 'primary' },
  { title: 'Onboarding', value: 'onboarding_completed', icon: 'mdi-check-circle', color: 'success' },
  { title: 'Login', value: 'login', icon: 'mdi-login', color: 'default' },
  { title: 'Error', value: 'error', icon: 'mdi-alert-circle', color: 'error' }
]

// ✅ NIVELES DE SEVERIDAD
export const SEVERITY_LEVELS = [
  { title: 'Información', value: 'info', icon: 'mdi-information', color: 'info' },
  { title: 'Advertencia', value: 'warning', icon: 'mdi-alert', color: 'warning' },
  { title: 'Error', value: 'error', icon: 'mdi-alert-circle', color: 'error' },
  { title: 'Crítico', value: 'critical', icon: 'mdi-alert-octagon', color: 'red-darken-2' }
]

export default auditService
