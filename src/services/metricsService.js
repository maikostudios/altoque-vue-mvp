// Servicio para manejar métricas avanzadas del sistema
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db } from '@/firebase'
import { bankAccountService } from './bankAccountService'
import { userService } from './userService'

export const metricsService = {
  // ==================== MÉTRICAS GLOBALES ====================
  
  // Obtener métricas globales del dashboard
  async getGlobalMetrics() {
    try {
      const metricsDoc = await getDoc(doc(db, 'metrics', 'global'))
      
      if (metricsDoc.exists()) {
        return metricsDoc.data()
      } else {
        // Crear métricas iniciales si no existen
        const initialMetrics = await this.calculateInitialMetrics()
        await this.setGlobalMetrics(initialMetrics)
        return initialMetrics
      }
    } catch (error) {
      console.error('Error obteniendo métricas globales:', error)
      throw error
    }
  },

  // Establecer métricas globales
  async setGlobalMetrics(metrics) {
    try {
      await setDoc(doc(db, 'metrics', 'global'), {
        ...metrics,
        fechaActualizacion: serverTimestamp()
      })
    } catch (error) {
      console.error('Error estableciendo métricas globales:', error)
      throw error
    }
  },

  // Calcular métricas iniciales basadas en datos existentes
  async calculateInitialMetrics() {
    try {
      // Obtener estadísticas de usuarios
      const userStats = await userService.getUserStats()
      
      // Obtener estadísticas de tarjetas bancarias
      const bankCards = await bankAccountService.getAllBankCards()
      
      return {
        totalUsuarios: userStats.total,
        totalTarjetas: bankCards.length,
        visitasDatosTransferencia: 0,
        datosCopiadosTotal: 0,
        usuariosActivos: userStats.activos,
        tarjetasActivas: bankCards.filter(card => card.activa).length
      }
    } catch (error) {
      console.error('Error calculando métricas iniciales:', error)
      return {
        totalUsuarios: 0,
        totalTarjetas: 0,
        visitasDatosTransferencia: 0,
        datosCopiadosTotal: 0,
        usuariosActivos: 0,
        tarjetasActivas: 0
      }
    }
  },

  // ==================== TRACKING DE VISITAS ====================
  
  // Incrementar contador de visitas a /datostransferencia
  async trackPageVisit(userToken = null) {
    try {
      // Incrementar contador global
      await updateDoc(doc(db, 'metrics', 'global'), {
        visitasDatosTransferencia: increment(1),
        fechaActualizacion: serverTimestamp()
      })

      // Si hay token de usuario, incrementar contador personal
      if (userToken) {
        await this.trackUserPageVisit(userToken)
      }

      console.log('✅ Visita a datos transferencia registrada')
    } catch (error) {
      console.error('Error registrando visita:', error)
      // No lanzar error para no interrumpir la experiencia del usuario
    }
  },

  // Incrementar contador personal de visitas del usuario
  async trackUserPageVisit(userToken) {
    try {
      // Buscar usuario por token
      const user = await this.getUserByToken(userToken)
      if (!user) return

      const userMetricsRef = doc(db, 'user_metrics', user.id)
      const userMetricsDoc = await getDoc(userMetricsRef)

      if (userMetricsDoc.exists()) {
        await updateDoc(userMetricsRef, {
          visitasPagina: increment(1),
          ultimaVisita: serverTimestamp()
        })
      } else {
        await setDoc(userMetricsRef, {
          userId: user.id,
          userEmail: user.email,
          visitasPagina: 1,
          datosCopiadosCount: 0,
          primeraVisita: serverTimestamp(),
          ultimaVisita: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error registrando visita personal:', error)
    }
  },

  // ==================== TRACKING DE CLICKS COPIAR ====================
  
  // Incrementar contador de clicks en "Copiar todos los datos"
  async trackCopyAllData(userToken = null) {
    try {
      // Incrementar contador global
      await updateDoc(doc(db, 'metrics', 'global'), {
        datosCopiadosTotal: increment(1),
        fechaActualizacion: serverTimestamp()
      })

      // Si hay token de usuario, incrementar contador personal
      if (userToken) {
        await this.trackUserCopyData(userToken)
      }

      console.log('✅ Click en copiar datos registrado')
    } catch (error) {
      console.error('Error registrando click copiar:', error)
      // No lanzar error para no interrumpir la experiencia del usuario
    }
  },

  // Incrementar contador personal de clicks del usuario
  async trackUserCopyData(userToken) {
    try {
      // Buscar usuario por token
      const user = await this.getUserByToken(userToken)
      if (!user) return

      const userMetricsRef = doc(db, 'user_metrics', user.id)
      const userMetricsDoc = await getDoc(userMetricsRef)

      if (userMetricsDoc.exists()) {
        await updateDoc(userMetricsRef, {
          datosCopiadosCount: increment(1),
          ultimoCopy: serverTimestamp()
        })
      } else {
        await setDoc(userMetricsRef, {
          userId: user.id,
          userEmail: user.email,
          visitasPagina: 0,
          datosCopiadosCount: 1,
          primerCopy: serverTimestamp(),
          ultimoCopy: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error registrando copy personal:', error)
    }
  },

  // ==================== MÉTRICAS POR USUARIO ====================
  
  // Obtener métricas de un usuario específico
  async getUserMetrics(userId) {
    try {
      const userMetricsDoc = await getDoc(doc(db, 'user_metrics', userId))
      
      if (userMetricsDoc.exists()) {
        return userMetricsDoc.data()
      } else {
        return {
          userId,
          visitasPagina: 0,
          datosCopiadosCount: 0,
          primeraVisita: null,
          ultimaVisita: null,
          primerCopy: null,
          ultimoCopy: null
        }
      }
    } catch (error) {
      console.error('Error obteniendo métricas de usuario:', error)
      return {
        userId,
        visitasPagina: 0,
        datosCopiadosCount: 0,
        primeraVisita: null,
        ultimaVisita: null,
        primerCopy: null,
        ultimoCopy: null
      }
    }
  },

  // ==================== UTILIDADES ====================
  
  // Buscar usuario por token público
  async getUserByToken(token) {
    try {
      const q = query(collection(db, 'users'), where('tokenPublico', '==', token))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return {
          id: doc.id,
          ...doc.data()
        }
      }
      return null
    } catch (error) {
      console.error('Error buscando usuario por token:', error)
      return null
    }
  },

  // Actualizar métricas globales recalculando desde cero
  async refreshGlobalMetrics() {
    try {
      const metrics = await this.calculateInitialMetrics()
      
      // Mantener contadores de visitas y copias existentes
      const currentMetrics = await this.getGlobalMetrics()
      
      const updatedMetrics = {
        ...metrics,
        visitasDatosTransferencia: currentMetrics.visitasDatosTransferencia || 0,
        datosCopiadosTotal: currentMetrics.datosCopiadosTotal || 0
      }
      
      await this.setGlobalMetrics(updatedMetrics)
      return updatedMetrics
    } catch (error) {
      console.error('Error refrescando métricas globales:', error)
      throw error
    }
  },

  // Obtener top usuarios por métricas
  async getTopUsersByMetrics(limit = 10) {
    try {
      const q = query(
        collection(db, 'user_metrics'),
        orderBy('datosCopiadosCount', 'desc'),
        limit(limit)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error obteniendo top usuarios:', error)
      return []
    }
  }
}
