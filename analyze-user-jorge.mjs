// Script para analizar el usuario jorge@j.cl y identificar inconsistencias
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
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

async function analyzeUserJorge() {
  try {
    console.log("🔍 ANÁLISIS DEL USUARIO jorge@j.cl");
    console.log("=====================================");

    // Buscar usuario jorge@j.cl
    console.log("\n📧 Buscando usuario jorge@j.cl...");
    const q = query(collection(db, "users"), where("email", "==", "jorge@j.cl"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("❌ Usuario jorge@j.cl no encontrado");
      return;
    }

    const jorgeDoc = querySnapshot.docs[0];
    const jorgeData = jorgeDoc.data();

    console.log("✅ Usuario encontrado:");
    console.log(`   📧 Email: ${jorgeData.email}`);
    console.log(`   🆔 ID: ${jorgeDoc.id}`);

    // Analizar estructura de datos
    console.log("\n📊 ESTRUCTURA DE DATOS:");
    console.log("========================");

    // Verificar campos de rol
    console.log("\n🎭 CAMPOS DE ROL:");
    if (jorgeData.rol) {
      console.log(`   ✅ Campo 'rol': ${jorgeData.rol}`);
    } else {
      console.log("   ❌ Campo 'rol': NO EXISTE");
    }

    if (jorgeData.role) {
      console.log(`   ⚠️  Campo 'role': ${jorgeData.role} (INCONSISTENTE)`);
    } else {
      console.log("   ✅ Campo 'role': NO EXISTE (correcto)");
    }

    // Verificar datos geográficos
    console.log("\n🌍 DATOS GEOGRÁFICOS:");
    const geoFields = ['pais', 'region', 'provincia', 'comuna'];
    geoFields.forEach(field => {
      if (jorgeData[field]) {
        console.log(`   ✅ ${field}: ${jorgeData[field]}`);
      } else {
        console.log(`   ❌ ${field}: NO EXISTE`);
      }
    });

    // Verificar datos demográficos
    console.log("\n👤 DATOS DEMOGRÁFICOS:");
    const demoFields = ['sexo', 'fechaNacimiento'];
    demoFields.forEach(field => {
      if (jorgeData[field]) {
        console.log(`   ✅ ${field}: ${jorgeData[field]}`);
      } else {
        console.log(`   ❌ ${field}: NO EXISTE`);
      }
    });

    // Verificar datos de vendedor
    console.log("\n🧑‍💼 DATOS DE VENDEDOR:");
    if (jorgeData.vendedor) {
      console.log(`   ✅ vendedor: ${jorgeData.vendedor}`);
    } else {
      console.log("   ❌ vendedor: NO EXISTE");
    }

    if (jorgeData.creadoPor) {
      console.log(`   ✅ creadoPor: ${jorgeData.creadoPor}`);
    } else {
      console.log("   ❌ creadoPor: NO EXISTE");
    }

    // Verificar token público
    console.log("\n🔑 TOKEN PÚBLICO:");
    if (jorgeData.tokenPublico) {
      console.log(`   ✅ tokenPublico: ${jorgeData.tokenPublico}`);
    } else {
      console.log("   ❌ tokenPublico: NO EXISTE");
    }

    // Verificar datos de plan
    console.log("\n💎 DATOS DE PLAN:");
    const planFields = ['tipoPlan', 'esPremium', 'limiteTarjetas', 'fechaVencimientoPremium'];
    planFields.forEach(field => {
      if (jorgeData[field] !== undefined) {
        console.log(`   ✅ ${field}: ${jorgeData[field]}`);
      } else {
        console.log(`   ❌ ${field}: NO EXISTE`);
      }
    });

    // Mostrar todos los campos disponibles
    console.log("\n📋 TODOS LOS CAMPOS DISPONIBLES:");
    console.log("================================");
    Object.keys(jorgeData).sort().forEach(key => {
      const value = jorgeData[key];
      const type = typeof value;
      const displayValue = type === 'object' && value !== null ? 
        (value.toDate ? value.toDate().toISOString() : JSON.stringify(value)) : 
        value;
      console.log(`   ${key}: ${displayValue} (${type})`);
    });

    // Comparar con estructura estándar
    console.log("\n⚖️  COMPARACIÓN CON ESTRUCTURA ESTÁNDAR:");
    console.log("=========================================");

    const standardFields = [
      'email', 'rol', 'nombre', 'apellido', 'rut', 'telefono', 'fechaNacimiento',
      'pais', 'region', 'provincia', 'comuna', 'sexo', 'empresa',
      'tokenPublico', 'tipoPlan', 'esPremium', 'limiteTarjetas', 'fechaVencimientoPremium',
      'accesoEstadisticas', 'personalizacionAvanzada', 'estado', 'fechaRegistro',
      'ultimoAcceso', 'vendedor', 'creadoPor'
    ];

    const missingFields = [];
    const extraFields = [];

    standardFields.forEach(field => {
      if (!(field in jorgeData)) {
        missingFields.push(field);
      }
    });

    Object.keys(jorgeData).forEach(field => {
      if (!standardFields.includes(field)) {
        extraFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      console.log("\n❌ CAMPOS FALTANTES:");
      missingFields.forEach(field => {
        console.log(`   - ${field}`);
      });
    }

    if (extraFields.length > 0) {
      console.log("\n⚠️  CAMPOS EXTRA/INCONSISTENTES:");
      extraFields.forEach(field => {
        console.log(`   - ${field}: ${jorgeData[field]}`);
      });
    }

    // Verificar si puede ser encontrado por consultas del vendedor
    console.log("\n🔍 VERIFICACIÓN DE CONSULTAS:");
    console.log("=============================");

    // Simular consulta del vendedor
    if (jorgeData.vendedor && (jorgeData.rol === 'usuario' || jorgeData.role === 'usuario')) {
      console.log("✅ El usuario PUEDE ser encontrado por consultas del vendedor");
    } else {
      console.log("❌ El usuario NO PUEDE ser encontrado por consultas del vendedor");
      console.log("   Razones:");
      if (!jorgeData.vendedor) {
        console.log("   - Falta campo 'vendedor'");
      }
      if (jorgeData.rol !== 'usuario' && jorgeData.role !== 'usuario') {
        console.log("   - Campo de rol incorrecto o faltante");
      }
    }

    return jorgeData;

  } catch (error) {
    console.error("❌ Error analizando usuario:", error);
    throw error;
  }
}

// Función para comparar con otros usuarios
async function compareWithOtherUsers() {
  try {
    console.log("\n\n🔄 COMPARANDO CON OTROS USUARIOS:");
    console.log("=================================");

    const allUsersSnapshot = await getDocs(collection(db, "users"));
    const users = [];

    allUsersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`📊 Total de usuarios en la base de datos: ${users.length}`);

    // Analizar patrones de campos
    const fieldAnalysis = {};
    
    users.forEach(user => {
      Object.keys(user).forEach(field => {
        if (!fieldAnalysis[field]) {
          fieldAnalysis[field] = {
            count: 0,
            examples: []
          };
        }
        fieldAnalysis[field].count++;
        if (fieldAnalysis[field].examples.length < 3) {
          fieldAnalysis[field].examples.push(user[field]);
        }
      });
    });

    console.log("\n📈 ANÁLISIS DE CAMPOS (frecuencia):");
    Object.entries(fieldAnalysis)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([field, data]) => {
        const percentage = Math.round((data.count / users.length) * 100);
        console.log(`   ${field}: ${data.count}/${users.length} (${percentage}%)`);
      });

    // Verificar inconsistencias de rol
    console.log("\n🎭 ANÁLISIS DE CAMPOS DE ROL:");
    const rolCount = users.filter(u => u.rol).length;
    const roleCount = users.filter(u => u.role).length;
    
    console.log(`   Usuarios con campo 'rol': ${rolCount}`);
    console.log(`   Usuarios con campo 'role': ${roleCount}`);
    
    if (rolCount > 0 && roleCount > 0) {
      console.log("   ⚠️  INCONSISTENCIA DETECTADA: Ambos campos existen");
    }

  } catch (error) {
    console.error("❌ Error comparando usuarios:", error);
  }
}

// Ejecutar análisis
async function main() {
  console.log("🎯 ANÁLISIS COMPLETO DE INCONSISTENCIAS");
  console.log("=======================================");
  
  const jorgeData = await analyzeUserJorge();
  await compareWithOtherUsers();
  
  console.log("\n🏁 Análisis completado");
  process.exit(0);
}

main().catch(console.error);
