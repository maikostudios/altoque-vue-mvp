// Script para migrar y corregir inconsistencias en datos de usuarios
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteField,
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

// Mapeo de códigos de región a nombres
const regionMapping = {
  "1": "Tarapacá",
  "2": "Antofagasta", 
  "3": "Atacama",
  "4": "Coquimbo",
  "5": "Valparaíso",
  "6": "O'Higgins",
  "7": "Maule",
  "8": "Biobío",
  "9": "La Araucanía",
  "10": "Los Lagos",
  "11": "Aysén",
  "12": "Magallanes",
  "13": "Metropolitana",
  "14": "Los Ríos",
  "15": "Arica y Parinacota"
};

// Mapeo de códigos de comuna (ejemplo para algunas comunas principales)
const comunaMapping = {
  "1": "Arica",
  "2": "Camarones", 
  "3": "Putre",
  "4": "General Lagos",
  "5": "Santiago", // Asumiendo que el código 5 es Santiago
  "13101": "Santiago",
  "13102": "Cerrillos",
  "13103": "Cerro Navia",
  "13104": "Conchalí",
  "13105": "El Bosque"
};

async function migrateUserData() {
  try {
    console.log("🔄 INICIANDO MIGRACIÓN DE DATOS DE USUARIOS");
    console.log("============================================");

    // Obtener todos los usuarios
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = [];

    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`📊 Total de usuarios a procesar: ${users.length}`);

    let migratedCount = 0;
    let errorsCount = 0;

    for (const user of users) {
      try {
        console.log(`\n🔄 Procesando usuario: ${user.email}`);
        
        const updates = {};
        let needsUpdate = false;

        // 1. Migrar campo 'role' a 'rol'
        if (user.role && !user.rol) {
          updates.rol = user.role;
          updates.role = deleteField(); // Eliminar campo 'role'
          needsUpdate = true;
          console.log(`   ✅ Migrando 'role' -> 'rol': ${user.role}`);
        } else if (user.role && user.rol) {
          // Si ambos existen, mantener 'rol' y eliminar 'role'
          updates.role = deleteField();
          needsUpdate = true;
          console.log(`   ✅ Eliminando campo 'role' duplicado`);
        }

        // 2. Convertir códigos de región a nombres
        if (user.region && regionMapping[user.region]) {
          updates.region = regionMapping[user.region];
          needsUpdate = true;
          console.log(`   ✅ Convirtiendo región: ${user.region} -> ${regionMapping[user.region]}`);
        }

        // 3. Convertir códigos de comuna a nombres (si es posible)
        if (user.comuna && comunaMapping[user.comuna]) {
          updates.comuna = comunaMapping[user.comuna];
          needsUpdate = true;
          console.log(`   ✅ Convirtiendo comuna: ${user.comuna} -> ${comunaMapping[user.comuna]}`);
        }

        // 4. Agregar campos faltantes con valores por defecto
        if (!user.pais) {
          updates.pais = "Chile";
          needsUpdate = true;
          console.log(`   ✅ Agregando país: Chile`);
        }

        if (!user.provincia && user.region) {
          // Asignar provincia por defecto basada en la región
          const provinciaDefault = getDefaultProvincia(user.region);
          if (provinciaDefault) {
            updates.provincia = provinciaDefault;
            needsUpdate = true;
            console.log(`   ✅ Agregando provincia: ${provinciaDefault}`);
          }
        }

        if (!user.sexo) {
          updates.sexo = "No especificado";
          needsUpdate = true;
          console.log(`   ✅ Agregando sexo: No especificado`);
        }

        // 5. Asegurar que tenga tokenPublico
        if (!user.tokenPublico) {
          updates.tokenPublico = generateToken();
          needsUpdate = true;
          console.log(`   ✅ Generando tokenPublico: ${updates.tokenPublico}`);
        }

        // 6. Asegurar campos de plan
        if (user.esPremium === undefined) {
          updates.esPremium = false;
          needsUpdate = true;
          console.log(`   ✅ Estableciendo esPremium: false`);
        }

        if (!user.tipoPlan) {
          updates.tipoPlan = user.esPremium ? "Premium" : "Free";
          needsUpdate = true;
          console.log(`   ✅ Estableciendo tipoPlan: ${updates.tipoPlan}`);
        }

        if (!user.limiteTarjetas) {
          updates.limiteTarjetas = user.esPremium ? 5 : 1;
          needsUpdate = true;
          console.log(`   ✅ Estableciendo limiteTarjetas: ${updates.limiteTarjetas}`);
        }

        // 7. Aplicar actualizaciones si es necesario
        if (needsUpdate) {
          await updateDoc(doc(db, "users", user.id), updates);
          migratedCount++;
          console.log(`   ✅ Usuario actualizado exitosamente`);
        } else {
          console.log(`   ℹ️  Usuario ya está actualizado`);
        }

      } catch (error) {
        console.error(`   ❌ Error procesando usuario ${user.email}:`, error);
        errorsCount++;
      }
    }

    console.log("\n📊 RESUMEN DE MIGRACIÓN:");
    console.log("========================");
    console.log(`✅ Usuarios procesados: ${users.length}`);
    console.log(`✅ Usuarios migrados: ${migratedCount}`);
    console.log(`❌ Errores: ${errorsCount}`);

    if (errorsCount === 0) {
      console.log("\n🎉 ¡Migración completada exitosamente!");
    } else {
      console.log(`\n⚠️  Migración completada con ${errorsCount} errores`);
    }

  } catch (error) {
    console.error("❌ Error en la migración:", error);
    throw error;
  }
}

// Función para obtener provincia por defecto basada en región
function getDefaultProvincia(region) {
  const provinciaDefaults = {
    "Tarapacá": "Iquique",
    "Antofagasta": "Antofagasta",
    "Atacama": "Copiapó",
    "Coquimbo": "Elqui",
    "Valparaíso": "Valparaíso",
    "O'Higgins": "Cachapoal",
    "Maule": "Talca",
    "Biobío": "Concepción",
    "La Araucanía": "Cautín",
    "Los Lagos": "Llanquihue",
    "Aysén": "Coyhaique",
    "Magallanes": "Magallanes",
    "Metropolitana": "Santiago",
    "Los Ríos": "Valdivia",
    "Arica y Parinacota": "Arica"
  };
  
  return provinciaDefaults[region] || null;
}

// Función para generar token único
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Función para verificar resultados después de la migración
async function verifyMigration() {
  try {
    console.log("\n🔍 VERIFICANDO RESULTADOS DE MIGRACIÓN:");
    console.log("======================================");

    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = [];

    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    let usersWithRole = 0;
    let usersWithRol = 0;
    let usersWithBothFields = 0;
    let usersWithoutGeoData = 0;

    users.forEach(user => {
      if (user.role) usersWithRole++;
      if (user.rol) usersWithRol++;
      if (user.role && user.rol) usersWithBothFields++;
      if (!user.pais || !user.region || !user.comuna) usersWithoutGeoData++;
    });

    console.log(`📊 Usuarios con campo 'role': ${usersWithRole}`);
    console.log(`📊 Usuarios con campo 'rol': ${usersWithRol}`);
    console.log(`⚠️  Usuarios con ambos campos: ${usersWithBothFields}`);
    console.log(`⚠️  Usuarios sin datos geográficos completos: ${usersWithoutGeoData}`);

    if (usersWithRole === 0 && usersWithBothFields === 0) {
      console.log("✅ Migración de campos de rol exitosa");
    } else {
      console.log("❌ Aún hay inconsistencias en campos de rol");
    }

  } catch (error) {
    console.error("❌ Error verificando migración:", error);
  }
}

// Ejecutar migración
async function main() {
  console.log("🎯 MIGRACIÓN DE DATOS DE USUARIOS");
  console.log("=================================");
  
  await migrateUserData();
  await verifyMigration();
  
  console.log("\n🏁 Proceso completado");
  process.exit(0);
}

main().catch(console.error);
