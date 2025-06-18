// Script para verificar vendedores y sus credenciales
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

async function verificarVendedores() {
  try {
    console.log("🔍 VERIFICACIÓN DE VENDEDORES");
    console.log("============================");

    // Obtener todos los usuarios
    const allUsersSnapshot = await getDocs(collection(db, "users"));
    const usuarios = [];

    allUsersSnapshot.forEach((doc) => {
      usuarios.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`📊 Total de usuarios en la base de datos: ${usuarios.length}`);

    // Filtrar vendedores
    const vendedores = usuarios.filter(u => u.rol === 'vendedor');
    console.log(`🧑‍💼 Total de vendedores: ${vendedores.length}`);

    if (vendedores.length === 0) {
      console.log("❌ No se encontraron vendedores en la base de datos");
      return;
    }

    console.log("\n📋 INFORMACIÓN DE VENDEDORES:");
    console.log("=============================");

    vendedores.forEach((vendedor, index) => {
      console.log(`\n--- Vendedor ${index + 1} ---`);
      console.log(`📧 Email: ${vendedor.email}`);
      console.log(`🆔 UID: ${vendedor.id}`);
      console.log(`👤 Nombre: ${vendedor.nombre} ${vendedor.apellido}`);
      console.log(`📅 Fecha Registro: ${vendedor.fechaRegistro ? 
        (vendedor.fechaRegistro.toDate ? vendedor.fechaRegistro.toDate().toLocaleDateString() : vendedor.fechaRegistro) : 
        'No disponible'}`);
      console.log(`⚡ Estado: ${vendedor.estado || 'No definido'}`);
      console.log(`🎯 Meta Mensual: ${vendedor.metaMensual || 'No definida'}`);

      // Buscar usuarios registrados por este vendedor
      const usuariosDelVendedor = usuarios.filter(u => 
        u.vendedor === vendedor.email && u.rol === 'usuario'
      );

      console.log(`👥 Usuarios registrados: ${usuariosDelVendedor.length}`);

      if (usuariosDelVendedor.length > 0) {
        console.log("   📝 Lista de usuarios:");
        usuariosDelVendedor.forEach((usuario, idx) => {
          const fechaRegistro = usuario.fechaRegistro ? 
            (usuario.fechaRegistro.toDate ? usuario.fechaRegistro.toDate().toLocaleDateString() : new Date(usuario.fechaRegistro).toLocaleDateString()) : 
            'Sin fecha';
          console.log(`   ${idx + 1}. ${usuario.nombre} ${usuario.apellido} (${usuario.email}) - ${fechaRegistro}`);
        });
      }
    });

    // Verificar credenciales de acceso
    console.log("\n🔐 CREDENCIALES DE ACCESO:");
    console.log("=========================");

    vendedores.forEach((vendedor, index) => {
      console.log(`\n${index + 1}. Para acceder como ${vendedor.nombre}:`);
      console.log(`   📧 Email: ${vendedor.email}`);
      console.log(`   🔑 Contraseña: [Definida por el administrador]`);
      console.log(`   🌐 URL: /vendedor`);
      
      if (vendedor.email === 'vendedor@ejemplo.com') {
        console.log(`   ⚠️  NOTA: Este es el vendedor de prueba con usuarios asignados`);
      }
    });

    // Verificar usuarios sin vendedor asignado
    console.log("\n⚠️  USUARIOS SIN VENDEDOR ASIGNADO:");
    console.log("===================================");

    const usuariosSinVendedor = usuarios.filter(u => 
      u.rol === 'usuario' && (!u.vendedor || u.vendedor === '')
    );

    if (usuariosSinVendedor.length > 0) {
      console.log(`📊 Total: ${usuariosSinVendedor.length} usuarios`);
      usuariosSinVendedor.forEach((usuario, index) => {
        console.log(`${index + 1}. ${usuario.nombre} ${usuario.apellido} (${usuario.email})`);
      });
    } else {
      console.log("✅ Todos los usuarios tienen vendedor asignado");
    }

    // Resumen final
    console.log("\n📊 RESUMEN:");
    console.log("===========");
    console.log(`👥 Total usuarios: ${usuarios.length}`);
    console.log(`🧑‍💼 Vendedores: ${vendedores.length}`);
    console.log(`👤 Usuarios finales: ${usuarios.filter(u => u.rol === 'usuario').length}`);
    console.log(`👑 Administradores: ${usuarios.filter(u => u.rol === 'admin').length}`);
    console.log(`🎧 Soporte: ${usuarios.filter(u => u.rol === 'soporte').length}`);

    return vendedores;

  } catch (error) {
    console.error("❌ Error verificando vendedores:", error);
    throw error;
  }
}

// Ejecutar verificación
async function main() {
  console.log("🎯 VERIFICACIÓN DE VENDEDORES Y CREDENCIALES");
  console.log("============================================");
  
  const vendedores = await verificarVendedores();
  
  console.log("\n🏁 Verificación completada");
  
  if (vendedores && vendedores.length > 0) {
    console.log("\n💡 INSTRUCCIONES PARA PROBAR:");
    console.log("=============================");
    console.log("1. Inicia sesión con uno de los emails de vendedor mostrados arriba");
    console.log("2. Ve a la ruta /vendedor");
    console.log("3. Verifica que aparezcan los usuarios registrados");
    console.log("4. Si no aparecen, revisa la consola del navegador para logs de depuración");
  }
  
  process.exit(0);
}

main().catch(console.error);
