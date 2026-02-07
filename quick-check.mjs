// Script de verificación rápida para identificar problemas de carga
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

console.log("🔍 VERIFICACIÓN RÁPIDA DE COMPONENTES CRÍTICOS");
console.log("=" .repeat(50));

// Componentes críticos que deben existir para que la app funcione
const criticalComponents = [
  'src/App.vue',
  'src/main.js',
  'src/router/index.js',
  'src/store/auth.js',
  'src/firebase.js',
  'src/components/navigation/UserNavbar.vue',
  'src/components/navigation/UserNavMenu.vue',
  'src/components/layout/AppFooter.vue',
  'src/components/notifications/NotificationBell.vue',
  'src/views/HomeView.vue',
  'src/views/LoginView.vue',
  'src/views/UserDashboardView.vue',
  'src/views/AdminPanelView.vue'
];

let hasErrors = false;
let warnings = [];

console.log("📁 Verificando existencia de archivos críticos...\n");

for (const component of criticalComponents) {
  const filePath = path.join(projectRoot, component);
  
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${component}`);
    
    // Verificación adicional para archivos Vue
    if (component.endsWith('.vue')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Verificar estructura básica de Vue
        if (!content.includes('<template>')) {
          warnings.push(`⚠️  ${component}: Falta <template>`);
        }
        if (!content.includes('<script')) {
          warnings.push(`⚠️  ${component}: Falta <script>`);
        }
        
        // Verificar imports problemáticos
        if (content.includes('@/stores/auth')) {
          warnings.push(`⚠️  ${component}: Import incorrecto @/stores/auth (debería ser @/store/auth)`);
        }
        
      } catch (error) {
        warnings.push(`⚠️  ${component}: Error leyendo archivo - ${error.message}`);
      }
    }
    
    // Verificación para archivos JS
    if (component.endsWith('.js')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Verificar que main.js tenga las importaciones básicas
        if (component === 'src/main.js') {
          const requiredImports = ['createApp', 'App', 'router', 'vuetify', 'pinia'];
          for (const imp of requiredImports) {
            if (!content.includes(imp)) {
              warnings.push(`⚠️  ${component}: Falta import de ${imp}`);
            }
          }
        }
        
        // Verificar que firebase.js no tenga errores de sintaxis obvios
        if (component === 'src/firebase.js') {
          if (!content.includes('initializeApp')) {
            warnings.push(`⚠️  ${component}: Falta initializeApp`);
          }
          if (!content.includes('export const db')) {
            warnings.push(`⚠️  ${component}: Falta export de db`);
          }
        }
        
      } catch (error) {
        warnings.push(`⚠️  ${component}: Error leyendo archivo - ${error.message}`);
      }
    }
    
  } else {
    console.log(`❌ ${component} - ARCHIVO FALTANTE`);
    hasErrors = true;
  }
}

console.log("\n" + "=" .repeat(50));

// Verificar package.json
console.log("📦 Verificando package.json...");
const packagePath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packagePath)) {
  try {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Verificar dependencias críticas
    const criticalDeps = ['vue', 'vue-router', 'vuetify', 'pinia', 'firebase'];
    const missingDeps = [];
    
    for (const dep of criticalDeps) {
      if (!packageContent.dependencies || !packageContent.dependencies[dep]) {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length > 0) {
      warnings.push(`⚠️  package.json: Faltan dependencias: ${missingDeps.join(', ')}`);
    } else {
      console.log("✅ Todas las dependencias críticas están presentes");
    }
    
    // Verificar scripts
    if (!packageContent.scripts || !packageContent.scripts.dev) {
      warnings.push(`⚠️  package.json: Falta script 'dev'`);
    }
    
  } catch (error) {
    warnings.push(`⚠️  package.json: Error parseando - ${error.message}`);
  }
} else {
  console.log("❌ package.json - ARCHIVO FALTANTE");
  hasErrors = true;
}

// Verificar vite.config.js
console.log("⚙️  Verificando vite.config.js...");
const viteConfigPath = path.join(projectRoot, 'vite.config.js');
if (fs.existsSync(viteConfigPath)) {
  console.log("✅ vite.config.js existe");
} else {
  warnings.push("⚠️  vite.config.js: Archivo faltante");
}

// Mostrar resultados
console.log("\n" + "=" .repeat(50));
console.log("📊 RESUMEN DE VERIFICACIÓN:");

if (hasErrors) {
  console.log("❌ ERRORES CRÍTICOS ENCONTRADOS");
  console.log("   La aplicación NO podrá iniciarse correctamente");
} else {
  console.log("✅ TODOS LOS ARCHIVOS CRÍTICOS ESTÁN PRESENTES");
}

if (warnings.length > 0) {
  console.log(`\n⚠️  ADVERTENCIAS (${warnings.length}):`);
  warnings.forEach(warning => console.log(`   ${warning}`));
} else {
  console.log("\n🎉 NO HAY ADVERTENCIAS");
}

console.log("\n🚀 PRÓXIMOS PASOS:");
if (hasErrors) {
  console.log("1. ❌ RESOLVER ERRORES CRÍTICOS PRIMERO");
  console.log("2. Crear archivos faltantes");
  console.log("3. Verificar imports y dependencias");
} else {
  console.log("1. ✅ Ejecutar: npm run dev");
  console.log("2. ✅ Abrir navegador en: http://localhost:5173");
  console.log("3. ✅ Verificar consola del navegador para errores");
  console.log("4. ✅ Probar login con: maikostudios@gmail.com / 123456");
}

if (warnings.length > 0) {
  console.log("\n🔧 CORRECCIONES RECOMENDADAS:");
  console.log("1. Revisar y corregir las advertencias listadas");
  console.log("2. Verificar imports de componentes");
  console.log("3. Asegurar que todos los archivos estén guardados");
}

console.log("\n" + "=" .repeat(50));

// Exit code
if (hasErrors) {
  process.exit(1);
} else {
  process.exit(0);
}
