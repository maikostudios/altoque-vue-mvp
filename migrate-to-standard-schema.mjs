// Script para migrar datos a la estructura estándar del plan
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc,
  deleteField,
  serverTimestamp 
} from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAFfjqq8YIfrduQpiYoMLGreId4vhkX08M",
  authDomain: "deunamaikostudios.firebaseapp.com",
  projectId: "deunamaikostudios",
  storageBucket: "deunamaikostudios.firebasestorage.app",
  messagingSenderId: "515483851699",
  appId: "1:515483851699:web:009b0b4885464ece0bc9c6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateUsersSchema() {
  try {
    console.log("🚀 Iniciando migración de esquema de usuarios...");
    
    // Obtener todos los usuarios
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let migratedCount = 0;
    let errorCount = 0;
    
    console.log(`📊 Total usuarios encontrados: ${usersSnapshot.size}`);
    
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data();
        const userId = userDoc.id;
        const updates = {};
        let needsUpdate = false;
        
        console.log(`\n👤 Procesando usuario: ${userData.email || userId}`);
        
        // 1. Migrar campo 'role' a 'rol'
        if (userData.role && !userData.rol) {
          updates.rol = userData.role;
          updates.role = deleteField(); // Eliminar campo antiguo
          needsUpdate = true;
          console.log(`   ✅ Migrando role '${userData.role}' → rol '${userData.role}'`);
        } else if (userData.role && userData.rol) {
          // Si ambos existen, usar 'rol' y eliminar 'role'
          updates.role = deleteField();
          needsUpdate = true;
          console.log(`   ✅ Eliminando campo 'role' duplicado, manteniendo 'rol': ${userData.rol}`);
        } else if (!userData.rol && !userData.role) {
          // Si no tiene ningún rol, asignar 'usuario' por defecto
          updates.rol = 'usuario';
          needsUpdate = true;
          console.log(`   ✅ Asignando rol por defecto: 'usuario'`);
        }
        
        // 2. Agregar campos faltantes del plan si no existen
        if (!userData.hasOwnProperty('isPremium')) {
          updates.isPremium = false;
          needsUpdate = true;
          console.log(`   ✅ Agregando isPremium: false`);
        }
        
        if (!userData.hasOwnProperty('planType')) {
          updates.planType = 'free';
          needsUpdate = true;
          console.log(`   ✅ Agregando planType: 'free'`);
        }
        
        if (!userData.hasOwnProperty('onboardingCompleted')) {
          // Si el usuario ya tiene datos básicos, marcar como completado
          const hasBasicData = userData.rut && userData.telefono && userData.nombre;
          updates.onboardingCompleted = hasBasicData;
          needsUpdate = true;
          console.log(`   ✅ Agregando onboardingCompleted: ${hasBasicData}`);
        }
        
        if (!userData.hasOwnProperty('idVerificationStatus')) {
          updates.idVerificationStatus = 'pending';
          needsUpdate = true;
          console.log(`   ✅ Agregando idVerificationStatus: 'pending'`);
        }
        
        if (!userData.hasOwnProperty('userType')) {
          updates.userType = 'client_deuna';
          needsUpdate = true;
          console.log(`   ✅ Agregando userType: 'client_deuna'`);
        }
        
        if (!userData.hasOwnProperty('associatedProjects')) {
          updates.associatedProjects = ['deuna'];
          needsUpdate = true;
          console.log(`   ✅ Agregando associatedProjects: ['deuna']`);
        }
        
        if (!userData.hasOwnProperty('signUpSource')) {
          updates.signUpSource = 'email'; // Asumir email por defecto para usuarios existentes
          needsUpdate = true;
          console.log(`   ✅ Agregando signUpSource: 'email'`);
        }
        
        // 3. Agregar timestamps si no existen
        if (!userData.createdAt) {
          updates.createdAt = userData.fechaRegistro || serverTimestamp();
          needsUpdate = true;
          console.log(`   ✅ Agregando createdAt`);
        }
        
        if (!userData.updatedAt) {
          updates.updatedAt = serverTimestamp();
          needsUpdate = true;
          console.log(`   ✅ Agregando updatedAt`);
        }
        
        if (!userData.lastLoginAt) {
          updates.lastLoginAt = userData.ultimoAcceso || serverTimestamp();
          needsUpdate = true;
          console.log(`   ✅ Agregando lastLoginAt`);
        }
        
        // 4. Aplicar actualizaciones si es necesario
        if (needsUpdate) {
          await updateDoc(doc(db, 'users', userId), updates);
          migratedCount++;
          console.log(`   ✅ Usuario migrado exitosamente`);
        } else {
          console.log(`   ℹ️  Usuario ya está actualizado`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error migrando usuario ${userDoc.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📊 RESUMEN DE MIGRACIÓN:`);
    console.log(`   ✅ Usuarios migrados: ${migratedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📋 Total procesados: ${usersSnapshot.size}`);
    
  } catch (error) {
    console.error("❌ Error en migración de usuarios:", error);
  }
}

async function updateAppSettings() {
  try {
    console.log("\n🔧 Actualizando configuraciones de la aplicación...");
    
    // Actualizar configuraciones generales para usar "De Una"
    await setDoc(doc(db, 'settings', 'general'), {
      nombreApp: 'De Una',
      descripcion: 'Plataforma de transferencias bancarias con QR',
      emailContacto: 'maikostudios@gmail.com',
      telefonoWhatsApp: '+56912345678',
      modoMantenimiento: false,
      version: '2.0.0',
      urlBase: 'https://deuna.maikostudios.com',
      fechaActualizacion: serverTimestamp(),
      // Nuevos campos del plan
      ecosystem: 'maiko_studios',
      projectType: 'deuna_transferencias'
    }, { merge: true });
    
    console.log("   ✅ Configuraciones generales actualizadas");
    
    // Actualizar configuraciones de planes
    await setDoc(doc(db, 'settings', 'plans'), {
      free: {
        nombre: 'Plan Gratuito',
        limiteTarjetas: 1,
        estadisticas: false,
        soporte: 'email',
        precio: 0,
        duracion: 'ilimitado'
      },
      premium: {
        nombre: 'Plan Premium',
        limiteTarjetas: 5,
        estadisticas: true,
        soporte: 'prioritario',
        precio: 9990,
        duracion: '1 año'
      }
    }, { merge: true });
    
    console.log("   ✅ Configuraciones de planes actualizadas");
    
  } catch (error) {
    console.error("❌ Error actualizando configuraciones:", error);
  }
}

async function createInitialCollections() {
  try {
    console.log("\n📁 Creando colecciones iniciales del plan...");
    
    // Crear documento de ejemplo para public_landings
    await setDoc(doc(db, 'public_landings', 'example'), {
      landingId: 'example',
      userId: 'example_user',
      urlCustomization: 'ejemplo',
      isActive: false,
      designConfig: {
        colors: {
          primary: '#00cccc',
          secondary: '#1c94e0'
        },
        logoUrl: null
      },
      engagementMetrics: {
        clicksToCopy: 0,
        qrScans: 0,
        whatsappContacts: 0,
        pageViews: 0
      },
      adDisplayCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isExample: true
    });
    
    console.log("   ✅ Colección public_landings inicializada");
    
    // Crear documento de ejemplo para logs
    await setDoc(doc(db, 'logs', 'example'), {
      type: 'system_initialization',
      userId: null,
      responsibleUid: null,
      responsibleEmail: 'system',
      responsibleIpAddress: '127.0.0.1',
      responsibleUserAgent: 'Migration Script',
      involvedEntityId: null,
      changeDetails: {
        action: 'schema_migration',
        version: '2.0.0'
      },
      eventDescription: 'Migración inicial del esquema de datos',
      eventSeverity: 'info',
      timestamp: serverTimestamp(),
      isExample: true
    });
    
    console.log("   ✅ Colección logs inicializada");
    
  } catch (error) {
    console.error("❌ Error creando colecciones iniciales:", error);
  }
}

// Ejecutar migración completa
async function runFullMigration() {
  console.log("🚀 INICIANDO MIGRACIÓN COMPLETA A ESQUEMA ESTÁNDAR");
  console.log("================================================");
  
  await migrateUsersSchema();
  await updateAppSettings();
  await createInitialCollections();
  
  console.log("\n🎉 MIGRACIÓN COMPLETADA");
  console.log("========================");
  console.log("✅ Esquema de usuarios migrado");
  console.log("✅ Configuraciones actualizadas");
  console.log("✅ Colecciones iniciales creadas");
  console.log("\n📋 Próximos pasos:");
  console.log("1. Desplegar nuevas reglas de Firestore");
  console.log("2. Implementar flujo de registro con Google");
  console.log("3. Crear UserInfoModal.vue");
  console.log("4. Implementar Cloud Functions");
}

runFullMigration().catch(console.error);
