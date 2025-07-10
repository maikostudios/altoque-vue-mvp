#!/usr/bin/env node

// ✅ Script para verificar que los estilos del navbar se hayan actualizado correctamente
// Compara los estilos del UserNavMenu con los del dashboard

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

console.log('🎨 VERIFICANDO ESTILOS PROFESIONALES DEL NAVBAR...\n')

const userNavMenuPath = path.join(projectRoot, 'src/components/navigation/UserNavMenu.vue')

try {
  if (!fs.existsSync(userNavMenuPath)) {
    console.log('❌ UserNavMenu.vue no existe')
    process.exit(1)
  }
  
  const content = fs.readFileSync(userNavMenuPath, 'utf8')
  
  // Verificar estilos profesionales implementados
  const professionalStyles = [
    'background: #1e1e1e',
    'border: 1px solid #333',
    'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3)',
    'background: linear-gradient(135deg, #00cccc, #1c94e0)',
    'color: #121212',
    'background: rgba(0, 204, 204, 0.05)',
    'color: #ffffff',
    'color: #888',
    'background: rgba(0, 204, 204, 0.2)',
    'color: #00cccc',
    'background: rgba(255, 255, 255, 0.05)',
    'color: #ff6b6b',
    'background: rgba(255, 107, 107, 0.1)',
    'transform: translateX(2px)',
    'animation: fadeIn 0.2s ease-out'
  ]
  
  const missingStyles = []
  
  for (const style of professionalStyles) {
    if (!content.includes(style)) {
      missingStyles.push(style)
    }
  }
  
  // Verificar estructura del componente
  const componentChecks = [
    'user-dropdown',
    'user-avatar-btn',
    'user-menu-list',
    'user-info-item',
    'menu-option',
    'logout-option',
    'auth-buttons'
  ]
  
  const missingComponents = componentChecks.filter(check => !content.includes(check))
  
  console.log('📊 RESULTADOS DE LA VERIFICACIÓN:\n')
  
  if (missingStyles.length === 0) {
    console.log('✅ ESTILOS PROFESIONALES: TODOS IMPLEMENTADOS')
  } else {
    console.log('❌ ESTILOS FALTANTES:')
    missingStyles.forEach(style => console.log(`   - ${style}`))
  }
  
  if (missingComponents.length === 0) {
    console.log('✅ COMPONENTES: TODOS PRESENTES')
  } else {
    console.log('❌ COMPONENTES FALTANTES:')
    missingComponents.forEach(comp => console.log(`   - ${comp}`))
  }
  
  // Verificar características específicas del dashboard
  const dashboardFeatures = [
    'rgba(255, 255, 255, 0.05)', // Hover effect del dashboard
    '#1e1e1e', // Background color del dashboard
    'rgba(0, 204, 204, 0.05)', // User info background
    'transform: translateX(2px)', // Icon animation
    'fadeIn 0.2s ease-out' // Smooth animation
  ]
  
  const implementedFeatures = dashboardFeatures.filter(feature => content.includes(feature))
  
  console.log(`\n🎯 CARACTERÍSTICAS DEL DASHBOARD: ${implementedFeatures.length}/${dashboardFeatures.length} IMPLEMENTADAS`)
  
  if (implementedFeatures.length === dashboardFeatures.length) {
    console.log('✅ TODOS los estilos del dashboard han sido replicados')
  } else {
    console.log('⚠️ Algunas características del dashboard faltan:')
    dashboardFeatures.filter(f => !content.includes(f)).forEach(f => console.log(`   - ${f}`))
  }
  
  // Verificar responsividad
  const responsiveChecks = [
    '@media (max-width: 768px)',
    'flex-direction: column',
    'min-width: 250px'
  ]
  
  const responsiveImplemented = responsiveChecks.filter(check => content.includes(check))
  
  console.log(`\n📱 RESPONSIVIDAD: ${responsiveImplemented.length}/${responsiveChecks.length} IMPLEMENTADA`)
  
  console.log('\n' + '='.repeat(60))
  
  if (missingStyles.length === 0 && missingComponents.length === 0 && implementedFeatures.length === dashboardFeatures.length) {
    console.log('🎉 ¡ESTILOS PROFESIONALES IMPLEMENTADOS EXITOSAMENTE!')
    console.log('\n✅ CARACTERÍSTICAS IMPLEMENTADAS:')
    console.log('   🎨 Colores y fondos del dashboard')
    console.log('   🖱️ Efectos hover profesionales')
    console.log('   ✨ Animaciones suaves')
    console.log('   📱 Diseño responsivo')
    console.log('   🎯 Consistencia visual con el dashboard')
    
    console.log('\n🚀 PRÓXIMOS PASOS:')
    console.log('1. Reiniciar el servidor: npm run dev')
    console.log('2. Probar con usuario: nico@gmail.com / 123456')
    console.log('3. Verificar que el menú se vea igual al del dashboard')
    console.log('4. Probar en móvil para verificar responsividad')
  } else {
    console.log('❌ ALGUNOS ESTILOS NECESITAN AJUSTES')
    console.log('\n🔧 ACCIONES REQUERIDAS:')
    if (missingStyles.length > 0) {
      console.log('   - Implementar estilos faltantes')
    }
    if (missingComponents.length > 0) {
      console.log('   - Agregar componentes faltantes')
    }
    if (implementedFeatures.length < dashboardFeatures.length) {
      console.log('   - Completar características del dashboard')
    }
  }
  
  console.log('='.repeat(60))
  
} catch (error) {
  console.log(`❌ Error verificando estilos: ${error.message}`)
  process.exit(1)
}
