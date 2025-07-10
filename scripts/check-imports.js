#!/usr/bin/env node

// ✅ ETAPA 6: Script para verificar que todos los imports estén correctos
// Verifica que no haya errores de sintaxis en los archivos principales

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

console.log('🔍 VERIFICANDO IMPORTS Y SINTAXIS...\n')

// Archivos críticos a verificar
const criticalFiles = [
  'src/components/feedback/UserFeedbackModal.vue',
  'src/components/monitoring/PerformanceDashboard.vue',
  'src/components/ads/AdSenseUnit.vue',
  'src/services/performanceService.js',
  'src/services/crashlyticsService.js',
  'src/services/budgetMonitoringService.js',
  'src/services/adsenseService.js',
  'src/views/UserDashboardView.vue',
  'src/views/PublicTransferView.vue'
]

let hasErrors = false

// Verificar cada archivo
for (const file of criticalFiles) {
  const filePath = path.join(projectRoot, file)
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${file} - ARCHIVO NO EXISTE`)
      hasErrors = true
      continue
    }
    
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Verificaciones básicas
    const checks = []
    
    // Verificar que el archivo no esté vacío
    if (content.trim().length === 0) {
      checks.push('Archivo vacío')
    }
    
    // Verificar imports problemáticos
    if (content.includes('@/stores/auth')) {
      checks.push('Import incorrecto: @/stores/auth (debería ser @/store/auth)')
    }
    
    // Verificar que los archivos Vue tengan estructura correcta
    if (file.endsWith('.vue')) {
      if (!content.includes('<template>')) {
        checks.push('Falta <template>')
      }
      if (!content.includes('<script')) {
        checks.push('Falta <script>')
      }
      if (!content.includes('</template>')) {
        checks.push('Template no cerrado')
      }
    }
    
    // Verificar que los archivos JS tengan exports
    if (file.endsWith('.js') && file.includes('Service')) {
      if (!content.includes('export')) {
        checks.push('Falta export')
      }
    }
    
    // Verificar sintaxis básica de JavaScript/Vue
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Verificar imports mal formateados
      if (line.startsWith('import') && !line.includes('from') && !line.endsWith('{')) {
        checks.push(`Línea ${i + 1}: Import mal formateado`)
      }
      
      // Verificar llaves no balanceadas en imports
      if (line.startsWith('import {') && !line.includes('}') && !line.endsWith('{')) {
        let j = i + 1
        let found = false
        while (j < lines.length && j < i + 5) {
          if (lines[j].includes('}')) {
            found = true
            break
          }
          j++
        }
        if (!found) {
          checks.push(`Línea ${i + 1}: Import con llaves no cerradas`)
        }
      }
    }
    
    if (checks.length > 0) {
      console.log(`❌ ${file}:`)
      checks.forEach(check => console.log(`   - ${check}`))
      hasErrors = true
    } else {
      console.log(`✅ ${file}`)
    }
    
  } catch (error) {
    console.log(`❌ ${file} - ERROR: ${error.message}`)
    hasErrors = true
  }
}

console.log('\n' + '='.repeat(50))

if (hasErrors) {
  console.log('❌ SE ENCONTRARON ERRORES')
  console.log('\n🔧 SOLUCIONES RECOMENDADAS:')
  console.log('1. Reiniciar el servidor de desarrollo: Ctrl+C y npm run dev')
  console.log('2. Limpiar cache: rm -rf node_modules/.vite')
  console.log('3. Verificar que todos los imports usen la ruta correcta')
  console.log('4. Asegurar que todos los archivos estén guardados')
  process.exit(1)
} else {
  console.log('✅ TODOS LOS ARCHIVOS ESTÁN CORRECTOS')
  console.log('\n🚀 RECOMENDACIONES:')
  console.log('1. Reiniciar el servidor de desarrollo si hay errores de carga')
  console.log('2. Verificar que el navegador no tenga cache antiguo')
  console.log('3. Usar Ctrl+F5 para forzar recarga completa')
}

console.log('='.repeat(50))
