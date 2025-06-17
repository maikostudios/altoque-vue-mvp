// Script para configurar la estructura de métricas en Firebase
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFfjqq8YIfrduQpiYoMLGreId4vhkX08M",
  authDomain: "deunamaikostudios.firebaseapp.com",
  projectId: "deunamaikostudios",
  storageBucket: "deunamaikostudios.firebasestorage.app",
  messagingSenderId: "515483851699",
  appId: "1:515483851699:web:009b0b4885464ece0bc9c6",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupMetricsDatabase() {
  try {
    console.log("🚀 Configurando estructura de métricas...");

    // 1. Crear métricas globales iniciales
    console.log("📊 Creando métricas globales...");

    // Contar usuarios existentes
    const usersSnapshot = await getDocs(collection(db, "users"));
    const totalUsuarios = usersSnapshot.size;

    // Contar tarjetas existentes
    const cardsSnapshot = await getDocs(collection(db, "bank_cards"));
    const totalTarjetas = cardsSnapshot.size;

    await setDoc(doc(db, "metrics", "global"), {
      totalUsuarios: totalUsuarios,
      totalTarjetas: totalTarjetas,
      visitasDatosTransferencia: 0,
      datosCopiadosTotal: 0,
      usuariosActivos: totalUsuarios,
      tarjetasActivas: totalTarjetas,
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
    });

    console.log(`✅ Métricas globales creadas:`);
    console.log(`   - Total usuarios: ${totalUsuarios}`);
    console.log(`   - Total tarjetas: ${totalTarjetas}`);
    console.log(`   - Visitas datos transferencia: 0`);
    console.log(`   - Datos copiados total: 0`);

    // 2. Crear métricas iniciales para usuarios existentes
    console.log("\n👥 Creando métricas para usuarios existentes...");

    let userMetricsCreated = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();

      await setDoc(doc(db, "user_metrics", userDoc.id), {
        userId: userDoc.id,
        userEmail: userData.email,
        visitasPagina: 0,
        datosCopiadosCount: 0,
        primeraVisita: null,
        ultimaVisita: null,
        primerCopy: null,
        ultimoCopy: null,
        fechaCreacion: serverTimestamp(),
      });

      userMetricsCreated++;
      console.log(`   ✅ Métricas creadas para: ${userData.email}`);
    }

    // 3. Crear documento de configuración de métricas
    console.log("\n⚙️ Creando configuración de métricas...");

    await setDoc(doc(db, "settings", "metrics"), {
      trackingEnabled: true,
      retentionDays: 365, // Mantener métricas por 1 año
      anonymizeAfterDays: 90, // Anonimizar datos después de 90 días
      batchUpdateInterval: 300, // Actualizar métricas cada 5 minutos
      enableUserMetrics: true,
      enableGlobalMetrics: true,
      enableRealTimeUpdates: true,
      enableDetailedAnalytics: true, // Habilitar analytics detallados
      enableDeviceTracking: true, // Habilitar tracking de dispositivos
      enableBankTracking: true, // Habilitar tracking de bancos
      enableRegionTracking: true, // Habilitar tracking por región
      lastMaintenanceDate: serverTimestamp(),
      fechaCreacion: serverTimestamp(),
    });

    // 4. Crear colecciones de ejemplo para analytics detallados
    console.log("\n📊 Creando estructura para analytics detallados...");

    // Crear documento de ejemplo para detailed_visits
    await setDoc(doc(db, "detailed_visits", "example"), {
      userToken: "example_token",
      userId: "example_user_id",
      userEmail: "example@example.com",
      userRegion: "Región Metropolitana",
      timestamp: serverTimestamp(),
      device: "mobile",
      browser: "Chrome",
      userAgent: "Mozilla/5.0...",
      screenResolution: "1920x1080",
      timezone: "America/Santiago",
      language: "es-ES",
      isExample: true,
    });

    // Crear documento de ejemplo para bank_usage
    await setDoc(doc(db, "bank_usage", "example"), {
      userId: "example_user_id",
      userEmail: "example@example.com",
      userRegion: "Región Metropolitana",
      bankName: "Banco de Chile",
      cardType: "Cuenta Corriente",
      timestamp: serverTimestamp(),
      device: "mobile",
      isExample: true,
    });

    // 4. Crear índices de ejemplo para consultas eficientes
    console.log("\n📈 Configuración de métricas completada");

    console.log("\n🎯 Resumen de la configuración:");
    console.log(`   📊 Métricas globales: ✅ Configuradas`);
    console.log(
      `   👥 Métricas de usuarios: ✅ ${userMetricsCreated} usuarios`
    );
    console.log(`   ⚙️ Configuración: ✅ Establecida`);

    console.log("\n📋 Estructura de colecciones creadas:");
    console.log("   - metrics/global: Contadores globales del sistema");
    console.log(
      "   - user_metrics/{userId}: Métricas individuales por usuario"
    );
    console.log("   - settings/metrics: Configuración del sistema de métricas");
    console.log(
      "   - detailed_visits: Visitas detalladas con datos de dispositivo y región"
    );
    console.log("   - bank_usage: Uso de bancos por usuario y región");

    console.log("\n🔄 Próximos pasos:");
    console.log(
      "   1. Las métricas se actualizarán automáticamente con el uso"
    );
    console.log("   2. Los contadores se incrementarán en tiempo real");
    console.log("   3. Los dashboards mostrarán datos actualizados");

    console.log("\n✨ ¡Configuración de métricas completada exitosamente!");
  } catch (error) {
    console.error("❌ Error configurando métricas:", error);
    process.exit(1);
  }
}

// Función para verificar la estructura existente
async function verifyMetricsStructure() {
  try {
    console.log("\n🔍 Verificando estructura de métricas...");

    // Verificar métricas globales
    const globalMetricsDoc = await getDocs(collection(db, "metrics"));
    console.log(`   📊 Documentos en metrics: ${globalMetricsDoc.size}`);

    // Verificar métricas de usuarios
    const userMetricsDoc = await getDocs(collection(db, "user_metrics"));
    console.log(`   👥 Documentos en user_metrics: ${userMetricsDoc.size}`);

    // Verificar configuración
    const settingsDoc = await getDocs(collection(db, "settings"));
    console.log(`   ⚙️ Documentos en settings: ${settingsDoc.size}`);

    console.log("✅ Verificación completada");
  } catch (error) {
    console.error("❌ Error verificando estructura:", error);
  }
}

// Ejecutar configuración
async function main() {
  console.log("🎯 CONFIGURACIÓN DE SISTEMA DE MÉTRICAS");
  console.log("=====================================");

  await setupMetricsDatabase();
  await verifyMetricsStructure();

  console.log("\n🏁 Proceso completado");
  process.exit(0);
}

main().catch(console.error);
