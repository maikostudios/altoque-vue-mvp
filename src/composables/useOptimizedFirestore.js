// Composable optimizado para consultas de Firestore
import { ref, computed } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'

// Cache global para evitar consultas duplicadas
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useOptimizedFirestore() {
  const loading = ref(false)
  const error = ref(null)

  // Función para generar clave de cache
  const getCacheKey = (collectionName, constraints = []) => {
    return `${collectionName}_${JSON.stringify(constraints)}`
  }

  // Función para verificar si el cache es válido
  const isCacheValid = (cacheEntry) => {
    if (!cacheEntry) return false
    return Date.now() - cacheEntry.timestamp < CACHE_DURATION
  }

  // Consulta optimizada con cache
  const optimizedQuery = async (collectionName, constraints = [], useCache = true) => {
    try {
      loading.value = true
      error.value = null

      const cacheKey = getCacheKey(collectionName, constraints)
      
      // Verificar cache si está habilitado
      if (useCache && cache.has(cacheKey)) {
        const cacheEntry = cache.get(cacheKey)
        if (isCacheValid(cacheEntry)) {
          console.log(`📦 Cache hit para ${collectionName}`)
          loading.value = false
          return cacheEntry.data
        }
      }

      console.log(`🔍 Consultando ${collectionName} desde Firestore`)

      // Construir query
      let q = collection(db, collectionName)
      
      if (constraints.length > 0) {
        q = query(q, ...constraints)
      }

      // Ejecutar consulta
      const snapshot = await getDocs(q)
      const data = []
      
      // Optimización: usar for loop en lugar de forEach
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data()
        })
      })

      // Guardar en cache
      if (useCache) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        })
      }

      console.log(`✅ ${collectionName}: ${data.length} documentos cargados`)
      return data

    } catch (err) {
      console.error(`❌ Error consultando ${collectionName}:`, err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Consulta específica para usuarios
  const getUsers = async (role = null, useCache = true) => {
    const constraints = []
    if (role) {
      constraints.push(where('rol', '==', role))
    }
    return optimizedQuery('users', constraints, useCache)
  }

  // Consulta específica para usuarios con filtros comunes
  const getUsersWithFilters = async (filters = {}, useCache = true) => {
    const constraints = []
    
    if (filters.role) {
      constraints.push(where('rol', '==', filters.role))
    }
    
    if (filters.status) {
      constraints.push(where('estado', '==', filters.status))
    }
    
    if (filters.vendor) {
      constraints.push(where('vendedor', '==', filters.vendor))
    }
    
    if (filters.orderBy) {
      constraints.push(orderBy(filters.orderBy.field, filters.orderBy.direction || 'desc'))
    }
    
    if (filters.limit) {
      constraints.push(limit(filters.limit))
    }

    return optimizedQuery('users', constraints, useCache)
  }

  // Consulta específica para cuentas bancarias
  const getBankAccounts = async (useCache = true) => {
    return optimizedQuery('bank_accounts', [], useCache)
  }

  // Consulta específica para tickets
  const getTickets = async (filters = {}, useCache = true) => {
    const constraints = []
    
    if (filters.status) {
      constraints.push(where('estado', '==', filters.status))
    }
    
    if (filters.priority) {
      constraints.push(where('prioridad', '==', filters.priority))
    }
    
    if (filters.assignedTo) {
      constraints.push(where('asignadoA', '==', filters.assignedTo))
    }
    
    if (filters.orderBy) {
      constraints.push(orderBy(filters.orderBy.field, filters.orderBy.direction || 'desc'))
    }

    return optimizedQuery('tickets', constraints, useCache)
  }

  // Función para limpiar cache
  const clearCache = (pattern = null) => {
    if (pattern) {
      // Limpiar cache que coincida con el patrón
      for (const [key] of cache) {
        if (key.includes(pattern)) {
          cache.delete(key)
        }
      }
    } else {
      // Limpiar todo el cache
      cache.clear()
    }
    console.log('🧹 Cache limpiado')
  }

  // Función para invalidar cache específico
  const invalidateCache = (collectionName, constraints = []) => {
    const cacheKey = getCacheKey(collectionName, constraints)
    cache.delete(cacheKey)
    console.log(`🗑️ Cache invalidado para ${cacheKey}`)
  }

  // Función para obtener estadísticas del cache
  const getCacheStats = () => {
    const stats = {
      totalEntries: cache.size,
      validEntries: 0,
      expiredEntries: 0,
      memoryUsage: 0
    }

    for (const [key, entry] of cache) {
      if (isCacheValid(entry)) {
        stats.validEntries++
      } else {
        stats.expiredEntries++
      }
      stats.memoryUsage += JSON.stringify(entry).length
    }

    return stats
  }

  // Función para limpiar cache expirado
  const cleanExpiredCache = () => {
    let cleaned = 0
    for (const [key, entry] of cache) {
      if (!isCacheValid(entry)) {
        cache.delete(key)
        cleaned++
      }
    }
    console.log(`🧹 ${cleaned} entradas de cache expiradas eliminadas`)
    return cleaned
  }

  // Consultas batch optimizadas
  const batchQueries = async (queries, useCache = true) => {
    try {
      loading.value = true
      error.value = null

      const promises = queries.map(({ collection: collectionName, constraints = [] }) => 
        optimizedQuery(collectionName, constraints, useCache)
      )

      const results = await Promise.all(promises)
      
      // Retornar objeto con resultados nombrados
      const namedResults = {}
      queries.forEach((query, index) => {
        const key = query.name || `query_${index}`
        namedResults[key] = results[index]
      })

      return namedResults

    } catch (err) {
      console.error('❌ Error en consultas batch:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Computed para estadísticas de cache
  const cacheStats = computed(() => getCacheStats())

  return {
    // Estados
    loading,
    error,
    
    // Funciones principales
    optimizedQuery,
    getUsers,
    getUsersWithFilters,
    getBankAccounts,
    getTickets,
    batchQueries,
    
    // Gestión de cache
    clearCache,
    invalidateCache,
    cleanExpiredCache,
    cacheStats,
    
    // Utilidades
    getCacheKey,
    isCacheValid
  }
}

// Función para limpiar cache automáticamente cada cierto tiempo
export function setupCacheCleanup(intervalMinutes = 10) {
  const { cleanExpiredCache } = useOptimizedFirestore()
  
  setInterval(() => {
    cleanExpiredCache()
  }, intervalMinutes * 60 * 1000)
  
  console.log(`🕒 Limpieza automática de cache configurada cada ${intervalMinutes} minutos`)
}

// Función para precargar datos comunes
export async function preloadCommonData() {
  const { getUsers, getBankAccounts } = useOptimizedFirestore()
  
  try {
    console.log('🚀 Precargando datos comunes...')
    
    await Promise.all([
      getUsers('usuario'),
      getUsers('vendedor'),
      getUsers('admin'),
      getBankAccounts()
    ])
    
    console.log('✅ Datos comunes precargados')
  } catch (error) {
    console.error('❌ Error precargando datos:', error)
  }
}
