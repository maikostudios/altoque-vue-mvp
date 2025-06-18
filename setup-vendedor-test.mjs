// Script para configurar credenciales de prueba del vendedor
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

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
const auth = getAuth(app);
const db = getFirestore(app);

async function setupVendedorTest() {
  try {
    console.log("🔧 CONFIGURACIÓN DE VENDEDOR DE PRUEBA");
    console.log("=====================================");

    const vendedorEmail = "vendedor@ejemplo.com";
    const vendedorPassword = "123456"; // Contraseña de prueba

    console.log(`📧 Email del vendedor: ${vendedorEmail}`);
    console.log(`🔑 Contraseña de prueba: ${vendedorPassword}`);

    // Verificar si el vendedor existe en Firestore
    console.log("\n1️⃣ Verificando vendedor en Firestore...");
    const vendedorUID = "SKbbWSdlOOd5Wl5wSIMmt0Fkjz53"; // UID del vendedor
    const vendedorDoc = await getDoc(doc(db, 'users', vendedorUID));

    if (vendedorDoc.exists()) {
      const vendedorData = vendedorDoc.data();
      console.log("✅ Vendedor encontrado en Firestore:");
      console.log(`   👤 Nombre: ${vendedorData.nombre} ${vendedorData.apellido}`);
      console.log(`   📧 Email: ${vendedorData.email}`);
      console.log(`   🎭 Rol: ${vendedorData.rol}`);
    } else {
      console.log("❌ Vendedor no encontrado en Firestore");
      return;
    }

    // Intentar iniciar sesión con las credenciales
    console.log("\n2️⃣ Probando inicio de sesión...");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, vendedorEmail, vendedorPassword);
      console.log("✅ Inicio de sesión exitoso!");
      console.log(`   🆔 UID: ${userCredential.user.uid}`);
      console.log(`   📧 Email verificado: ${userCredential.user.emailVerified}`);
      
      // Cerrar sesión
      await auth.signOut();
      console.log("🔓 Sesión cerrada");
      
    } catch (loginError) {
      console.log("❌ Error en inicio de sesión:", loginError.code);
      
      if (loginError.code === 'auth/user-not-found') {
        console.log("\n🔧 El usuario no existe en Authentication, creándolo...");
        
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, vendedorEmail, vendedorPassword);
          console.log("✅ Usuario creado en Authentication!");
          console.log(`   🆔 UID: ${userCredential.user.uid}`);
          
          // Verificar que el UID coincida con Firestore
          if (userCredential.user.uid !== vendedorUID) {
            console.log("⚠️ ADVERTENCIA: El UID generado no coincide con el de Firestore");
            console.log(`   Firestore UID: ${vendedorUID}`);
            console.log(`   Auth UID: ${userCredential.user.uid}`);
            console.log("   Necesitarás actualizar el documento en Firestore con el nuevo UID");
          }
          
          await auth.signOut();
          
        } catch (createError) {
          console.error("❌ Error creando usuario:", createError.code, createError.message);
        }
        
      } else if (loginError.code === 'auth/wrong-password') {
        console.log("❌ Contraseña incorrecta");
        console.log("💡 Intenta con una contraseña diferente o restablece la contraseña");
        
      } else {
        console.log("❌ Error desconocido:", loginError.message);
      }
    }

    // Instrucciones finales
    console.log("\n📋 INSTRUCCIONES PARA PROBAR:");
    console.log("=============================");
    console.log("1. Ve a la aplicación web");
    console.log("2. Inicia sesión con:");
    console.log(`   📧 Email: ${vendedorEmail}`);
    console.log(`   🔑 Contraseña: ${vendedorPassword}`);
    console.log("3. Deberías ser redirigido a /vendedor");
    console.log("4. Verifica que aparezcan los 3 usuarios registrados");
    console.log("5. El botón debería decir 'Registrar Nuevo Usuario'");

    console.log("\n🔍 SI NO FUNCIONA:");
    console.log("==================");
    console.log("1. Abre las herramientas de desarrollador (F12)");
    console.log("2. Ve a la pestaña Console");
    console.log("3. Busca los logs que empiezan con 🔍, 📊, ✅, ❌");
    console.log("4. Verifica que el email del vendedor coincida");

  } catch (error) {
    console.error("❌ Error en configuración:", error);
    throw error;
  }
}

// Ejecutar configuración
async function main() {
  console.log("🎯 CONFIGURACIÓN DE VENDEDOR DE PRUEBA");
  console.log("======================================");
  
  await setupVendedorTest();
  
  console.log("\n🏁 Configuración completada");
  process.exit(0);
}

main().catch(console.error);
