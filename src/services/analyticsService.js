// Servicio para manejar analytics avanzados y estadísticas detalladas
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
  limit,
  startAfter,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebase'

export const analyticsService = {
  // ==================== DETECCIÓN DE DISPOSITIVOS ====================
  
  // Detectar tipo de dispositivo del usuario
  detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent)
    
    if (isTablet) return 'tablet'
    if (isMobile) return 'mobile'
    return 'desktop'
  },

  // Detectar navegador del usuario
  detectBrowser() {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome')) return 'Chrome'
    if (userAgent.includes('firefox')) return 'Firefox'
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'Safari'
    if (userAgent.includes('edge')) return 'Edge'
    if (userAgent.includes('opera')) return 'Opera'
    
    return 'Otro'
  },

  // ==================== TRACKING AVANZADO ====================
  
  // Registrar visita con datos detallados
  async trackDetailedVisit(userToken, additionalData = {}) {
    try {
      const visitData = {
        userToken,
        timestamp: serverTimestamp(),
        device: this.detectDevice(),
        browser: this.detectBrowser(),
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        ...additionalData
      }

      // Buscar usuario por token
      const user = await this.getUserByToken(userToken)
      if (user) {
        visitData.userId = user.id
        visitData.userEmail = user.email
        visitData.userRegion = user.region || 'No especificada'
      }

      // Guardar en colección de visitas detalladas
      await setDoc(doc(collection(db, 'detailed_visits')), visitData)

      console.log('📊 Visita detallada registrada:', visitData)
    } catch (error) {
      console.error('Error registrando visita detallada:', error)
    }
  },

  // Registrar uso de banco específico
  async trackBankUsage(userToken, bankName, cardType = null) {
    try {
      const user = await this.getUserByToken(userToken)
      if (!user) return

      const bankUsageData = {
        userId: user.id,
        userEmail: user.email,
        userRegion: user.region || 'No especificada',
        bankName: bankName,
        cardType: cardType,
        timestamp: serverTimestamp(),
        device: this.detectDevice()
      }

      // Guardar en colección de uso de bancos
      await setDoc(doc(collection(db, 'bank_usage')), bankUsageData)

      console.log('🏦 Uso de banco registrado:', bankUsageData)
    } catch (error) {
      console.error('Error registrando uso de banco:', error)
    }
  },

  // ==================== ESTADÍSTICAS POR USUARIO ====================
  
  // Obtener visitas por día para un usuario
  async getUserVisitsByDay(userId, days = 30) {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const q = query(
        collection(db, 'detailed_visits'),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const visits = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }))

      // Agrupar por día
      const visitsByDay = this.groupVisitsByDay(visits, days)
      return visitsByDay
    } catch (error) {
      console.error('Error obteniendo visitas por día:', error)
      return []
    }
  },

  // Obtener bancos más usados por un usuario
  async getUserTopBanks(userId, days = 30) {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const q = query(
        collection(db, 'bank_usage'),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      )

      const querySnapshot = await getDocs(q)
      const bankUsage = querySnapshot.docs.map(doc => doc.data())

      // Contar uso por banco
      const bankCounts = {}
      bankUsage.forEach(usage => {
        const bank = usage.bankName || 'Banco no especificado'
        bankCounts[bank] = (bankCounts[bank] || 0) + 1
      })

      // Convertir a array y ordenar
      const sortedBanks = Object.entries(bankCounts)
        .map(([bank, count]) => ({ bank, count }))
        .sort((a, b) => b.count - a.count)

      return sortedBanks
    } catch (error) {
      console.error('Error obteniendo bancos preferidos:', error)
      return []
    }
  },

  // Obtener dispositivos más usados por un usuario
  async getUserTopDevices(userId, days = 30) {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const q = query(
        collection(db, 'detailed_visits'),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      )

      const querySnapshot = await getDocs(q)
      const visits = querySnapshot.docs.map(doc => doc.data())

      // Contar uso por dispositivo
      const deviceCounts = {}
      visits.forEach(visit => {
        const device = visit.device || 'Desconocido'
        deviceCounts[device] = (deviceCounts[device] || 0) + 1
      })

      // Convertir a array y calcular porcentajes
      const totalVisits = visits.length
      const deviceStats = Object.entries(deviceCounts)
        .map(([device, count]) => ({
          device,
          count,
          percentage: totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)

      return deviceStats
    } catch (error) {
      console.error('Error obteniendo dispositivos preferidos:', error)
      return []
    }
  },

  // ==================== ESTADÍSTICAS GLOBALES PARA ADMIN ====================
  
  // Obtener bancos preferidos por región
  async getBanksByRegion(days = 30) {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const q = query(
        collection(db, 'bank_usage'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      )

      const querySnapshot = await getDocs(q)
      const bankUsage = querySnapshot.docs.map(doc => doc.data())

      // Agrupar por región y banco
      const regionBankData = {}
      bankUsage.forEach(usage => {
        const region = usage.userRegion || 'No especificada'
        const bank = usage.bankName || 'Banco no especificado'
        
        if (!regionBankData[region]) {
          regionBankData[region] = {}
        }
        
        regionBankData[region][bank] = (regionBankData[region][bank] || 0) + 1
      })

      return regionBankData
    } catch (error) {
      console.error('Error obteniendo bancos por región:', error)
      return {}
    }
  },

  // Obtener visitas por región
  async getVisitsByRegion(days = 30) {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const q = query(
        collection(db, 'detailed_visits'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      )

      const querySnapshot = await getDocs(q)
      const visits = querySnapshot.docs.map(doc => doc.data())

      // Contar visitas por región
      const regionCounts = {}
      visits.forEach(visit => {
        const region = visit.userRegion || 'No especificada'
        regionCounts[region] = (regionCounts[region] || 0) + 1
      })

      // Convertir a array y ordenar
      const sortedRegions = Object.entries(regionCounts)
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count)

      return sortedRegions
    } catch (error) {
      console.error('Error obteniendo visitas por región:', error)
      return []
    }
  },

  // ==================== UTILIDADES ====================
  
  // Agrupar visitas por día
  groupVisitsByDay(visits, days) {
    const visitsByDay = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayVisits = visits.filter(visit => {
        if (!visit.timestamp) return false
        const visitDate = visit.timestamp.toISOString().split('T')[0]
        return visitDate === dateStr
      })
      
      visitsByDay.push({
        date: dateStr,
        day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        count: dayVisits.length
      })
    }
    
    return visitsByDay
  },

  // Buscar usuario por token
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

  // Obtener estadísticas completas para un usuario
  async getUserCompleteStats(userId, days = 30) {
    try {
      const [visitsByDay, topBanks, topDevices] = await Promise.all([
        this.getUserVisitsByDay(userId, days),
        this.getUserTopBanks(userId, days),
        this.getUserTopDevices(userId, days)
      ])

      return {
        visitsByDay,
        topBanks,
        topDevices,
        period: days
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas completas:', error)
      return {
        visitsByDay: [],
        topBanks: [],
        topDevices: [],
        period: days
      }
    }
  },

  // Obtener estadísticas completas para admin
  async getAdminCompleteStats(days = 30) {
    try {
      const [banksByRegion, visitsByRegion] = await Promise.all([
        this.getBanksByRegion(days),
        this.getVisitsByRegion(days)
      ])

      return {
        banksByRegion,
        visitsByRegion,
        period: days
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas de admin:', error)
      return {
        banksByRegion: {},
        visitsByRegion: [],
        period: days
      }
    }
  }
}
