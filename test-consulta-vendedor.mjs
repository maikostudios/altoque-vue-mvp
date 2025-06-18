// Script para probar la consulta simplificada del vendedor
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

async function testConsultaVendedor() {
  try {
    console.log("🧪 PRUEBA DE CONSULTA SIMPLIFICADA DEL VENDEDOR");
    console.log("===============================================");

    const vendedorEmail = "vendedor@ejemplo.com";
    console.log(`🔍 Probando consulta para vendedor: ${vendedorEmail}`);

    // Consulta simplificada (sin orderBy)
    console.log("\n1️⃣ Probando consulta simplificada...");
    const qSimple = query(
      collection(db, 'users'),
      where('vendedor', '==', vendedorEmail),
      where('rol', '==', 'usuario')
    );

    const simpleSnapshot = await getDocs(qSimple);
    console.log(`✅ Consulta simplificada exitosa: ${simpleSnapshot.size} usuarios encontrados`);

    const usuarios = [];
    simpleSnapshot.forEach((doc) => {
      const userData = doc.data();
      const fechaRegistro = userData.fechaRegistro?.toDate ? userData.fechaRegistro.toDate() : new Date(userData.fechaRegistro);
      
      usuarios.push({
        id: doc.id,
        ...userData,
        fechaRegistroDate: fechaRegistro
      });
    });

    // Ordenar manualmente por fecha
    usuarios.sort((a, b) => b.fechaRegistroDate - a.fechaRegistroDate);

    console.log("\n📋 Usuarios encontrados (ordenados por fecha):");
    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nombre} ${usuario.apellido}`);
      console.log(`   📧 Email: ${usuario.email}`);
      console.log(`   📅 Registro: ${usuario.fechaRegistroDate.toLocaleDateString('es-CL')} ${usuario.fechaRegistroDate.toLocaleTimeString('es-CL')}`);
      console.log(`   💎 Plan: ${usuario.esPremium ? 'Premium' : 'Gratuito'}`);
      console.log('');
    });

    // Filtrar por últimas 24 horas
    console.log("2️⃣ Filtrando por últimas 24 horas...");
    const hace24Horas = new Date();
    hace24Horas.setHours(hace24Horas.getHours() - 24);
    
    const usuariosRecientes = usuarios.filter(usuario => usuario.fechaRegistroDate >= hace24Horas);
    
    console.log(`📅 Fecha límite (24h atrás): ${hace24Horas.toISOString()}`);
    console.log(`📊 Usuarios en últimas 24h: ${usuariosRecientes.length}`);

    if (usuariosRecientes.length > 0) {
      console.log("\n👥 Usuarios de las últimas 24 horas:");
      usuariosRecientes.forEach((usuario, index) => {
        const horasAtras = Math.floor((new Date() - usuario.fechaRegistroDate) / (1000 * 60 * 60));
        console.log(`${index + 1}. ${usuario.nombre} ${usuario.apellido} (hace ${horasAtras} horas)`);
      });
    } else {
      console.log("\n⚠️ No hay usuarios registrados en las últimas 24 horas");
      console.log("📋 Mostrando los 5 más recientes:");
      usuarios.slice(0, 5).forEach((usuario, index) => {
        const diasAtras = Math.floor((new Date() - usuario.fechaRegistroDate) / (1000 * 60 * 60 * 24));
        console.log(`${index + 1}. ${usuario.nombre} ${usuario.apellido} (hace ${diasAtras} días)`);
      });
    }

    // Probar consulta aún más simple como respaldo
    console.log("\n3️⃣ Probando consulta de respaldo (solo vendedor)...");
    const qRespaldo = query(
      collection(db, 'users'),
      where('vendedor', '==', vendedorEmail)
    );

    const respaldoSnapshot = await getDocs(qRespaldo);
    console.log(`✅ Consulta de respaldo exitosa: ${respaldoSnapshot.size} documentos encontrados`);

    const usuariosRespaldo = [];
    respaldoSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.rol === 'usuario') {
        usuariosRespaldo.push({
          id: doc.id,
          ...userData
        });
      }
    });

    console.log(`📊 Usuarios con rol 'usuario': ${usuariosRespaldo.length}`);

    return {
      consultaSimple: usuarios,
      usuariosRecientes: usuariosRecientes.length > 0 ? usuariosRecientes : usuarios.slice(0, 5),
      consultaRespaldo: usuariosRespaldo
    };

  } catch (error) {
    console.error("❌ Error en prueba de consulta:", error);
    console.error("Detalles del error:", error.message);
    throw error;
  }
}

// Ejecutar prueba
async function main() {
  console.log("🎯 PRUEBA DE CONSULTA DEL VENDEDOR");
  console.log("==================================");
  
  const resultado = await testConsultaVendedor();
  
  console.log("\n🏁 Prueba completada exitosamente");
  console.log(`📊 Resultado: ${resultado.usuariosRecientes.length} usuarios para mostrar`);
  
  process.exit(0);
}

main().catch(console.error);
