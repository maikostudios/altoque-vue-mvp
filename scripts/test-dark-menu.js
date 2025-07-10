#!/usr/bin/env node

// ✅ Script para verificar que el menú oscuro esté implementado correctamente
// Verifica que se haya reemplazado v-list con div personalizado

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

console.log("🌙 VERIFICANDO IMPLEMENTACIÓN DEL MENÚ OSCURO...\n");

const userNavMenuPath = path.join(
  projectRoot,
  "src/components/navigation/UserNavMenu.vue"
);

try {
  if (!fs.existsSync(userNavMenuPath)) {
    console.log("❌ UserNavMenu.vue no existe");
    process.exit(1);
  }

  const content = fs.readFileSync(userNavMenuPath, "utf8");

  // Verificar que se haya reemplazado v-list con div
  const templateChecks = [
    {
      check: 'div class="user-menu-list"',
      description: "Menú principal como div",
    },
    {
      check: 'div class="user-info-item"',
      description: "Información de usuario como div",
    },
    {
      check: 'div class="dropdown-divider"',
      description: "Divisor personalizado",
    },
    {
      check: 'div class="dropdown-menu"',
      description: "Menú de opciones como div",
    },
    { check: "button.*dropdown-item", description: "Botones de opciones" },
    { check: 'class="mdi mdi-logout"', description: "Iconos MDI" },
  ];

  // Verificar estilos oscuros
  const darkStyles = [
    { check: "background: #1e1e1e", description: "Fondo oscuro principal" },
    { check: "border: 1px solid #333", description: "Bordes oscuros" },
    {
      check: "box-shadow: 0 8px 32px rgba\\(0, 0, 0, 0\\.3\\)",
      description: "Sombra profesional",
    },
    {
      check: "background: rgba\\(0, 204, 204, 0\\.05\\)",
      description: "Fondo de información de usuario",
    },
    { check: "color: #ffffff", description: "Texto blanco" },
    { check: "color: #888", description: "Texto secundario gris" },
    { check: "color: #ccc", description: "Texto de opciones" },
    { check: "color: #ff6b6b", description: "Color de logout" },
    {
      check: "background: rgba\\(255, 255, 255, 0\\.05\\)",
      description: "Hover effect",
    },
  ];

  console.log("📋 VERIFICANDO ESTRUCTURA DEL TEMPLATE:\n");

  let templatePassed = 0;
  for (const { check, description } of templateChecks) {
    const regex = new RegExp(check, "i");
    if (regex.test(content)) {
      console.log(`✅ ${description}`);
      templatePassed++;
    } else {
      console.log(`❌ ${description}`);
    }
  }

  console.log(
    `\n📊 Template: ${templatePassed}/${templateChecks.length} verificaciones pasaron\n`
  );

  console.log("🎨 VERIFICANDO ESTILOS OSCUROS:\n");

  let stylesPassed = 0;
  for (const { check, description } of darkStyles) {
    const regex = new RegExp(check, "i");
    if (regex.test(content)) {
      console.log(`✅ ${description}`);
      stylesPassed++;
    } else {
      console.log(`❌ ${description}`);
    }
  }

  console.log(
    `\n📊 Estilos: ${stylesPassed}/${darkStyles.length} verificaciones pasaron\n`
  );

  // Verificar que NO tenga elementos de Vuetify problemáticos
  const vuetifyChecks = [
    {
      check: '<v-list class="user-menu-list"',
      shouldNotExist: true,
      description: "v-list eliminado",
    },
    {
      check: '<v-list-item class="user-info-item"',
      shouldNotExist: true,
      description: "v-list-item eliminado",
    },
    {
      check: "v-list-item-title",
      shouldNotExist: true,
      description: "v-list-item-title eliminado",
    },
  ];

  console.log("🚫 VERIFICANDO ELIMINACIÓN DE ELEMENTOS VUETIFY:\n");

  let vuetifyPassed = 0;
  for (const { check, shouldNotExist, description } of vuetifyChecks) {
    const exists = content.includes(check);
    if (shouldNotExist && !exists) {
      console.log(`✅ ${description}`);
      vuetifyPassed++;
    } else if (shouldNotExist && exists) {
      console.log(`❌ ${description} - TODAVÍA PRESENTE`);
    }
  }

  console.log(
    `\n📊 Limpieza Vuetify: ${vuetifyPassed}/${vuetifyChecks.length} verificaciones pasaron\n`
  );

  console.log("=".repeat(60));

  const totalChecks =
    templateChecks.length + darkStyles.length + vuetifyChecks.length;
  const totalPassed = templatePassed + stylesPassed + vuetifyPassed;

  if (totalPassed === totalChecks) {
    console.log("🎉 ¡MENÚ OSCURO IMPLEMENTADO CORRECTAMENTE!");
    console.log("\n✅ CARACTERÍSTICAS IMPLEMENTADAS:");
    console.log("   🌙 Fondo oscuro profesional (#1e1e1e)");
    console.log("   🎨 Estilos personalizados sin dependencia de Vuetify");
    console.log("   🖱️ Efectos hover profesionales");
    console.log("   📱 Estructura HTML limpia y controlable");
    console.log("   🎯 Consistencia visual con el dashboard");

    console.log("\n🚀 PRÓXIMOS PASOS:");
    console.log("1. Reiniciar servidor: npm run dev");
    console.log("2. Probar con usuario: nico@gmail.com / 123456");
    console.log("3. Verificar que el menú se vea oscuro");
    console.log("4. Comparar con el menú del dashboard");
  } else {
    console.log(
      `❌ IMPLEMENTACIÓN INCOMPLETA: ${totalPassed}/${totalChecks} verificaciones pasaron`
    );
    console.log("\n🔧 ACCIONES REQUERIDAS:");
    if (templatePassed < templateChecks.length) {
      console.log("   - Completar estructura del template");
    }
    if (stylesPassed < darkStyles.length) {
      console.log("   - Implementar estilos oscuros faltantes");
    }
    if (vuetifyPassed < vuetifyChecks.length) {
      console.log("   - Eliminar elementos de Vuetify restantes");
    }
  }

  console.log("=".repeat(60));
} catch (error) {
  console.log(`❌ Error verificando menú: ${error.message}`);
  process.exit(1);
}
