// Servicio para calcular y gestionar el ranking de vendedores
import { db } from '@/firebase'
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

export const vendorRankingService = {
  
  /**
   * Calcular el ranking de todos los vendedores basado en usuarios registrados
   * @param {string} periodo - 'mes' | 'trimestre' | 'año' | 'total'
   * @returns {Array} Array de vendedores con su ranking
   */
  async calculateVendorRanking(periodo = 'mes') {
    try {
      console.log(`🏆 Calculando ranking de vendedores para período: ${periodo}`)
      
      // 1. Obtener todos los vendedores
      const vendedoresQuery = query(
        collection(db, 'users'),
        where('rol', '==', 'vendedor')
      )
      const vendedoresSnapshot = await getDocs(vendedoresQuery)
      
      if (vendedoresSnapshot.empty) {
        console.log('⚠️ No se encontraron vendedores')
        return []
      }

      // 2. Obtener todos los usuarios registrados
      const usuariosQuery = query(
        collection(db, 'users'),
        where('rol', '==', 'usuario')
      )
      const usuariosSnapshot = await getDocs(usuariosQuery)
      
      // 3. Calcular estadísticas por vendedor
      const vendedoresStats = []
      
      vendedoresSnapshot.forEach((vendedorDoc) => {
        const vendedorData = vendedorDoc.data()
        const vendedorEmail = vendedorData.email
        
        // Contar usuarios registrados por este vendedor
        let usuariosRegistrados = 0
        let usuariosPeriodo = 0
        
        usuariosSnapshot.forEach((usuarioDoc) => {
          const usuarioData = usuarioDoc.data()
          
          if (usuarioData.vendedor === vendedorEmail) {
            usuariosRegistrados++
            
            // Filtrar por período si es necesario
            if (periodo !== 'total' && usuarioData.fechaRegistro) {
              const fechaRegistro = usuarioData.fechaRegistro.toDate ? 
                usuarioData.fechaRegistro.toDate() : 
                new Date(usuarioData.fechaRegistro)
              
              if (this.isInPeriod(fechaRegistro, periodo)) {
                usuariosPeriodo++
              }
            }
          }
        })
        
        // Si es período total, usar el total de usuarios
        if (periodo === 'total') {
          usuariosPeriodo = usuariosRegistrados
        }
        
        vendedoresStats.push({
          id: vendedorDoc.id,
          email: vendedorEmail,
          nombre: vendedorData.nombre || '',
          apellido: vendedorData.apellido || '',
          metaMensual: vendedorData.metaMensual || 0,
          usuariosRegistrados: usuariosRegistrados,
          usuariosPeriodo: usuariosPeriodo,
          porcentajeMeta: vendedorData.metaMensual > 0 ? 
            Math.round((usuariosPeriodo / vendedorData.metaMensual) * 100) : 0,
          fechaRegistro: vendedorData.fechaRegistro,
          estado: vendedorData.estado || 'activo'
        })
      })
      
      // 4. Ordenar por usuarios del período (descendente)
      vendedoresStats.sort((a, b) => {
        if (b.usuariosPeriodo !== a.usuariosPeriodo) {
          return b.usuariosPeriodo - a.usuariosPeriodo
        }
        // En caso de empate, ordenar por porcentaje de meta
        return b.porcentajeMeta - a.porcentajeMeta
      })
      
      // 5. Asignar posiciones de ranking
      vendedoresStats.forEach((vendedor, index) => {
        vendedor.ranking = index + 1
        vendedor.periodo = periodo
      })
      
      console.log(`✅ Ranking calculado para ${vendedoresStats.length} vendedores`)
      return vendedoresStats
      
    } catch (error) {
      console.error('Error calculando ranking de vendedores:', error)
      throw error
    }
  },

  /**
   * Obtener el ranking de un vendedor específico
   * @param {string} vendedorEmail - Email del vendedor
   * @param {string} periodo - Período para el cálculo
   * @returns {Object} Información del ranking del vendedor
   */
  async getVendorRanking(vendedorEmail, periodo = 'mes') {
    try {
      const ranking = await this.calculateVendorRanking(periodo)
      const vendedorRanking = ranking.find(v => v.email === vendedorEmail)
      
      if (!vendedorRanking) {
        return {
          ranking: null,
          totalVendedores: ranking.length,
          usuariosPeriodo: 0,
          porcentajeMeta: 0
        }
      }
      
      return {
        ranking: vendedorRanking.ranking,
        totalVendedores: ranking.length,
        usuariosPeriodo: vendedorRanking.usuariosPeriodo,
        porcentajeMeta: vendedorRanking.porcentajeMeta,
        metaMensual: vendedorRanking.metaMensual
      }
    } catch (error) {
      console.error('Error obteniendo ranking del vendedor:', error)
      return {
        ranking: null,
        totalVendedores: 0,
        usuariosPeriodo: 0,
        porcentajeMeta: 0
      }
    }
  },

  /**
   * Obtener el top N vendedores
   * @param {number} limit - Número de vendedores a retornar
   * @param {string} periodo - Período para el cálculo
   * @returns {Array} Top vendedores
   */
  async getTopVendors(limit = 10, periodo = 'mes') {
    try {
      const ranking = await this.calculateVendorRanking(periodo)
      return ranking.slice(0, limit)
    } catch (error) {
      console.error('Error obteniendo top vendedores:', error)
      return []
    }
  },

  /**
   * Actualizar el ranking en los documentos de vendedores
   * @param {string} periodo - Período para el cálculo
   */
  async updateVendorRankingInDatabase(periodo = 'mes') {
    try {
      const ranking = await this.calculateVendorRanking(periodo)
      
      // Actualizar cada vendedor con su ranking
      const updatePromises = ranking.map(async (vendedor) => {
        const vendedorRef = doc(db, 'users', vendedor.id)
        return updateDoc(vendedorRef, {
          [`ranking_${periodo}`]: vendedor.ranking,
          [`usuarios_${periodo}`]: vendedor.usuariosPeriodo,
          [`porcentaje_meta_${periodo}`]: vendedor.porcentajeMeta,
          ultimaActualizacionRanking: serverTimestamp()
        })
      })
      
      await Promise.all(updatePromises)
      console.log(`✅ Ranking actualizado en base de datos para ${ranking.length} vendedores`)
      
    } catch (error) {
      console.error('Error actualizando ranking en base de datos:', error)
      throw error
    }
  },

  /**
   * Verificar si una fecha está dentro del período especificado
   * @param {Date} fecha - Fecha a verificar
   * @param {string} periodo - Período de comparación
   * @returns {boolean}
   */
  isInPeriod(fecha, periodo) {
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const inicioTrimestre = new Date(ahora.getFullYear(), Math.floor(ahora.getMonth() / 3) * 3, 1)
    const inicioAño = new Date(ahora.getFullYear(), 0, 1)
    
    switch (periodo) {
      case 'mes':
        return fecha >= inicioMes
      case 'trimestre':
        return fecha >= inicioTrimestre
      case 'año':
        return fecha >= inicioAño
      case 'total':
        return true
      default:
        return fecha >= inicioMes
    }
  },

  /**
   * Obtener estadísticas generales del ranking
   * @param {string} periodo - Período para el cálculo
   * @returns {Object} Estadísticas del ranking
   */
  async getRankingStats(periodo = 'mes') {
    try {
      const ranking = await this.calculateVendorRanking(periodo)
      
      if (ranking.length === 0) {
        return {
          totalVendedores: 0,
          totalUsuariosRegistrados: 0,
          promedioUsuariosPorVendedor: 0,
          vendedorTop: null,
          metaPromedio: 0
        }
      }
      
      const totalUsuarios = ranking.reduce((sum, v) => sum + v.usuariosPeriodo, 0)
      const metaPromedio = ranking.reduce((sum, v) => sum + v.metaMensual, 0) / ranking.length
      
      return {
        totalVendedores: ranking.length,
        totalUsuariosRegistrados: totalUsuarios,
        promedioUsuariosPorVendedor: Math.round(totalUsuarios / ranking.length),
        vendedorTop: ranking[0] || null,
        metaPromedio: Math.round(metaPromedio)
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas del ranking:', error)
      return {
        totalVendedores: 0,
        totalUsuariosRegistrados: 0,
        promedioUsuariosPorVendedor: 0,
        vendedorTop: null,
        metaPromedio: 0
      }
    }
  }
}
