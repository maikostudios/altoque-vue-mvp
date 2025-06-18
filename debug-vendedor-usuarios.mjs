// Script para diagnosticar problemas con usuarios del vendedor
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
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

async function debugVendedorUsuarios() {
  try {
    console.log("🔍 DIAGNÓSTICO DE USUARIOS DEL VENDEDOR");
    console.log("=====================================");

    // 1. Verificar todos los usuarios en la base de datos
    console.log("\n📊 1. TODOS LOS USUARIOS EN LA BASE DE DATOS:");
    const allUsersSnapshot = await getDocs(collection(db, "users"));
    
    console.log(`Total de usuarios: ${allUsersSnapshot.size}`);
    
    const usuarios = [];
    allUsersSnapshot.forEach((doc) => {
      usuarios.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // 2. Mostrar información de cada usuario
    console.log("\n👥 2. INFORMACIÓN DETALLADA DE USUARIOS:");
    usuarios.forEach((usuario, index) => {
      console.log(`\n--- Usuario ${index + 1} ---`);
      console.log(`📧 Email: ${usuario.email}`);
      console.log(`🎭 Rol: ${usuario.rol || 'NO DEFINIDO'}`);
      console.log(`🧑‍💼 Vendedor: ${usuario.vendedor || 'NO DEFINIDO'}`);
      console.log(`📅 Fecha Registro: ${usuario.fechaRegistro ? 
        (usuario.fechaRegistro.toDate ? usuario.fechaRegistro.toDate().toISOString() : usuario.fechaRegistro) : 
        'NO DEFINIDO'}`);
      console.log(`⚡ Estado: ${usuario.estado || 'NO DEFINIDO'}`);
    });

    // 3. Buscar vendedores específicos
    console.log("\n🧑‍💼 3. ANÁLISIS DE VENDEDORES:");
    const vendedores = usuarios.filter(u => u.rol === 'vendedor');
    console.log(`Total de vendedores: ${vendedores.length}`);
    
    vendedores.forEach(vendedor => {
      console.log(`\n📧 Vendedor: ${vendedor.email}`);
      
      // Buscar usuarios de este vendedor
      const usuariosDelVendedor = usuarios.filter(u => 
        u.vendedor === vendedor.email && u.rol === 'usuario'
      );
      
      console.log(`   👥 Usuarios registrados: ${usuariosDelVendedor.length}`);
      
      if (usuariosDelVendedor.length > 0) {
        usuariosDelVendedor.forEach(usuario => {
          const fechaRegistro = usuario.fechaRegistro ? 
            (usuario.fechaRegistro.toDate ? usuario.fechaRegistro.toDate() : new Date(usuario.fechaRegistro)) : 
            null;
          
          console.log(`   - ${usuario.nombre} ${usuario.apellido} (${usuario.email}) - ${fechaRegistro ? fechaRegistro.toLocaleDateString() : 'Sin fecha'}`);
        });
      }
    });

    // 4. Verificar usuarios específicos problemáticos
    console.log("\n🔍 4. VERIFICACIÓN DE USUARIOS ESPECÍFICOS:");
    
    // Buscar jorge@j.cl
    const jorge = usuarios.find(u => u.email === 'jorge@j.cl');
    if (jorge) {
      console.log("\n✅ Usuario jorge@j.cl encontrado:");
      console.log(`   🎭 Rol: ${jorge.rol}`);
      console.log(`   🧑‍💼 Vendedor: ${jorge.vendedor}`);
      console.log(`   📅 Fecha: ${jorge.fechaRegistro ? 
        (jorge.fechaRegistro.toDate ? jorge.fechaRegistro.toDate().toISOString() : jorge.fechaRegistro) : 
        'NO DEFINIDO'}`);
    } else {
      console.log("\n❌ Usuario jorge@j.cl NO encontrado");
    }

    // 5. Simular consulta del vendedor
    console.log("\n🔄 5. SIMULANDO CONSULTA DEL VENDEDOR:");
    
    const vendedorEmail = "vendedor@ejemplo.com"; // Email del vendedor de prueba
    console.log(`Buscando usuarios para vendedor: ${vendedorEmail}`);
    
    try {
      const q = query(
        collection(db, 'users'),
        where('vendedor', '==', vendedorEmail),
        where('rol', '==', 'usuario'),
        orderBy('fechaRegistro', 'desc')
      );

      const querySnapshot = await getDocs(q);
      console.log(`✅ Consulta exitosa: ${querySnapshot.size} usuarios encontrados`);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   - ${data.nombre} ${data.apellido} (${data.email})`);
      });

    } catch (error) {
      console.error(`❌ Error en consulta del vendedor: ${error.message}`);
    }

    // 6. Verificar índices necesarios
    console.log("\n📋 6. VERIFICACIÓN DE ÍNDICES:");
    console.log("Para que las consultas funcionen correctamente, necesitas estos índices:");
    console.log("- Índice compuesto: vendedor (ASC) + rol (ASC) + fechaRegistro (DESC)");
    console.log("- Índice compuesto: vendedor (ASC) + rol (ASC)");

    // 7. Análisis de fechas
    console.log("\n📅 7. ANÁLISIS DE FECHAS DE REGISTRO:");
    const ahora = new Date();
    const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
    
    console.log(`Fecha actual: ${ahora.toISOString()}`);
    console.log(`Hace 24 horas: ${hace24Horas.toISOString()}`);
    
    const usuariosRecientes = usuarios.filter(u => {
      if (!u.fechaRegistro || u.rol !== 'usuario') return false;
      
      const fechaRegistro = u.fechaRegistro.toDate ? u.fechaRegistro.toDate() : new Date(u.fechaRegistro);
      return fechaRegistro >= hace24Horas;
    });
    
    console.log(`Usuarios registrados en las últimas 24 horas: ${usuariosRecientes.length}`);
    
    usuariosRecientes.forEach(usuario => {
      const fechaRegistro = usuario.fechaRegistro.toDate ? usuario.fechaRegistro.toDate() : new Date(usuario.fechaRegistro);
      console.log(`   - ${usuario.nombre} ${usuario.apellido} (${fechaRegistro.toISOString()})`);
    });

  } catch (error) {
    console.error("❌ Error en diagnóstico:", error);
    throw error;
  }
}

// Ejecutar diagnóstico
async function main() {
  console.log("🎯 DIAGNÓSTICO DE USUARIOS DEL VENDEDOR");
  console.log("======================================");
  
  await debugVendedorUsuarios();
  
  console.log("\n🏁 Diagnóstico completado");
  process.exit(0);
}

main().catch(console.error);
