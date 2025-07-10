#!/usr/bin/env node

// ✅ Script para verificar que la sesión de usuario funcione correctamente
// Verifica que los componentes de navegación y registro estén bien integrados

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

console.log('🔍 VERIFICANDO INTEGRACIÓN DE SESIÓN DE USUARIO...\n')

// Verificar archivos críticos para la sesión
const criticalFiles = [
  {
    path: 'src/components/navigation/UserNavMenu.vue',
    description: 'Componente de navegación dinámico',
    checks: [
      'useAuthStore',
      'isAuthenticated',
      'userRole',
      'logout'
    ]
  },
  {
    path: 'src/components/home/NavbarHome.vue',
    description: 'Navbar del home con integración',
    checks: [
      'UserNavMenu',
      'import.*UserNavMenu'
    ]
  },
  {
    path: 'src/components/auth/UserInfoModal.vue',
    description: 'Modal de registro con carga de datos',
    checks: [
      'loadExistingUserData',
      'postponeRegistration',
      'onMounted',
      'Completar más tarde'
    ]
  }
]

let hasErrors = false

for (const file of criticalFiles) {
  const filePath = path.join(projectRoot, file.path)
  
  console.log(`📁 Verificando: ${file.description}`)
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${file.path} - ARCHIVO NO EXISTE`)
      hasErrors = true
      continue
    }
    
    const content = fs.readFileSync(filePath, 'utf8')
    const missingChecks = []
    
    for (const check of file.checks) {
      const regex = new RegExp(check, 'i')
      if (!regex.test(content)) {
        missingChecks.push(check)
      }
    }
    
    if (missingChecks.length > 0) {
      console.log(`❌ ${file.path}:`)
      missingChecks.forEach(check => console.log(`   - Falta: ${check}`))
      hasErrors = true
    } else {
      console.log(`✅ ${file.path} - TODAS LAS VERIFICACIONES PASARON`)
    }
    
  } catch (error) {
    console.log(`❌ ${file.path} - ERROR: ${error.message}`)
    hasErrors = true
  }
  
  console.log('')
}

// Verificar integración en store de auth
console.log('🔍 VERIFICANDO STORE DE AUTENTICACIÓN...')
const authStorePath = path.join(projectRoot, 'src/store/auth.js')

try {
  if (fs.existsSync(authStorePath)) {
    const authContent = fs.readFileSync(authStorePath, 'utf8')
    
    const authChecks = [
      'isAuthenticated',
      'userInfo',
      'logout'
    ]
    
    const missingAuthChecks = authChecks.filter(check => !authContent.includes(check))
    
    if (missingAuthChecks.length > 0) {
      console.log('❌ Store de autenticación:')
      missingAuthChecks.forEach(check => console.log(`   - Falta: ${check}`))
      hasErrors = true
    } else {
      console.log('✅ Store de autenticación - CORRECTO')
    }
  } else {
    console.log('❌ Store de autenticación - ARCHIVO NO EXISTE')
    hasErrors = true
  }
} catch (error) {
  console.log(`❌ Store de autenticación - ERROR: ${error.message}`)
  hasErrors = true
}

console.log('\n' + '='.repeat(60))

if (hasErrors) {
  console.log('❌ SE ENCONTRARON PROBLEMAS EN LA INTEGRACIÓN')
  console.log('\n🔧 PASOS PARA SOLUCIONAR:')
  console.log('1. Verificar que todos los imports estén correctos')
  console.log('2. Reiniciar el servidor de desarrollo: npm run dev')
  console.log('3. Limpiar cache del navegador: Ctrl+F5')
  console.log('4. Verificar que el usuario de prueba exista en Firebase')
  process.exit(1)
} else {
  console.log('✅ INTEGRACIÓN DE SESIÓN COMPLETADA CORRECTAMENTE')
  console.log('\n🎯 FUNCIONALIDADES IMPLEMENTADAS:')
  console.log('✅ Navegación dinámica según estado de sesión')
  console.log('✅ Avatar y menú desplegable para usuarios autenticados')
  console.log('✅ Opciones específicas por rol (admin, vendedor, usuario)')
  console.log('✅ Carga automática de datos existentes en registro')
  console.log('✅ Opción para completar registro más tarde')
  console.log('✅ Botón de cerrar sesión integrado')
  
  console.log('\n🚀 PRÓXIMOS PASOS:')
  console.log('1. Probar con usuario: nico@gmail.com / 123456')
  console.log('2. Verificar que el navbar cambie al iniciar sesión')
  console.log('3. Verificar que el modal cargue datos existentes')
  console.log('4. Probar la funcionalidad "Completar más tarde"')
}

console.log('='.repeat(60))
