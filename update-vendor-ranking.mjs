#!/usr/bin/env node

/**
 * Script para actualizar el ranking de vendedores
 * Ejecutar con: node update-vendor-ranking.mjs
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBvBwcGUGzeQzWvyZNTnuRgQJhqJe_RNHM",
  authDomain: "deuna-vue-mvp.firebaseapp.com",
  projectId: "deuna-vue-mvp",
  storageBucket: "deuna-vue-mvp.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * Verificar si una fecha está dentro del período especificado
 */
function isInPeriod(fecha, periodo) {
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
}

/**
 * Calcular el ranking de vendedores
 */
async function calculateVendorRanking(periodo = 'mes') {
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
            
            if (isInPeriod(fechaRegistro, periodo)) {
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
}

/**
 * Actualizar el ranking en la base de datos
 */
async function updateVendorRankingInDatabase(periodo = 'mes') {
  try {
    console.log(`📝 Actualizando ranking en base de datos para período: ${periodo}`)
    
    const ranking = await calculateVendorRanking(periodo)
    
    if (ranking.length === 0) {
      console.log('⚠️ No hay datos de ranking para actualizar')
      return
    }
    
    // Actualizar cada vendedor con su ranking
    const updatePromises = ranking.map(async (vendedor) => {
      const vendedorRef = doc(db, 'users', vendedor.id)
      const updateData = {
        [`ranking_${periodo}`]: vendedor.ranking,
        [`usuarios_${periodo}`]: vendedor.usuariosPeriodo,
        [`porcentaje_meta_${periodo}`]: vendedor.porcentajeMeta,
        ultimaActualizacionRanking: serverTimestamp()
      }
      
      console.log(`   📊 ${vendedor.nombre} ${vendedor.apellido}: #${vendedor.ranking} (${vendedor.usuariosPeriodo} usuarios)`)
      
      return updateDoc(vendedorRef, updateData)
    })
    
    await Promise.all(updatePromises)
    console.log(`✅ Ranking actualizado en base de datos para ${ranking.length} vendedores`)
    
    return ranking
    
  } catch (error) {
    console.error('Error actualizando ranking en base de datos:', error)
    throw error
  }
}

/**
 * Mostrar estadísticas del ranking
 */
function showRankingStats(ranking) {
  if (ranking.length === 0) {
    console.log('📊 No hay datos para mostrar estadísticas')
    return
  }
  
  const totalUsuarios = ranking.reduce((sum, v) => sum + v.usuariosPeriodo, 0)
  const metaPromedio = ranking.reduce((sum, v) => sum + v.metaMensual, 0) / ranking.length
  const vendedorTop = ranking[0]
  
  console.log('\n📊 ESTADÍSTICAS DEL RANKING')
  console.log('============================')
  console.log(`👥 Total vendedores: ${ranking.length}`)
  console.log(`📈 Total usuarios registrados: ${totalUsuarios}`)
  console.log(`📊 Promedio usuarios por vendedor: ${Math.round(totalUsuarios / ranking.length)}`)
  console.log(`🎯 Meta promedio: ${Math.round(metaPromedio)}`)
  console.log(`🥇 Mejor vendedor: ${vendedorTop.nombre} ${vendedorTop.apellido} (${vendedorTop.usuariosPeriodo} usuarios)`)
  
  console.log('\n🏆 TOP 5 VENDEDORES')
  console.log('===================')
  ranking.slice(0, 5).forEach((vendedor, index) => {
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'
    console.log(`${emoji} #${vendedor.ranking} ${vendedor.nombre} ${vendedor.apellido} - ${vendedor.usuariosPeriodo} usuarios (${vendedor.porcentajeMeta}% de meta)`)
  })
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log('🚀 Iniciando actualización de ranking de vendedores...')
    console.log('====================================================')
    
    const periodos = ['mes', 'trimestre', 'año', 'total']
    
    for (const periodo of periodos) {
      console.log(`\n🔄 Procesando período: ${periodo.toUpperCase()}`)
      console.log('─'.repeat(40))
      
      const ranking = await updateVendorRankingInDatabase(periodo)
      
      if (ranking && ranking.length > 0) {
        showRankingStats(ranking)
      }
      
      // Pequeña pausa entre períodos
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log('\n✅ Actualización de ranking completada exitosamente')
    console.log('====================================================')
    
  } catch (error) {
    console.error('❌ Error en la actualización del ranking:', error)
    process.exit(1)
  }
}

// Ejecutar el script
main()
