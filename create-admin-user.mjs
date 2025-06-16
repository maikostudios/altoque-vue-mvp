// Script para crear usuario admin en la colección correcta
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

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

async function createAdminUser() {
  try {
    console.log("🔧 Creando usuario admin en colección 'usuarios'...");
    
    // Crear documento con el email como ID (simulando tu estructura)
    await setDoc(doc(db, "usuarios", "maikostudios@gmail.com"), {
      email: "maikostudios@gmail.com",
      rol: "ADMIN",
      nombre: "Michael",
      comuna: "TEMUCO",
      creadoPor: "Admin",
      fechaNacimiento: new Date("1994-10-19"),
      fechaRegistro: serverTimestamp(),
      rut: "189909780"
    });
    
    console.log("✅ Usuario admin creado en colección 'usuarios'");
    
    // También crear en colección 'users' por si acaso
    await setDoc(doc(db, "users", "maikostudios@gmail.com"), {
      email: "maikostudios@gmail.com",
      role: "admin",
      nombre: "Michael",
      fechaRegistro: serverTimestamp()
    });
    
    console.log("✅ Usuario admin creado en colección 'users'");
    
    console.log("\n🎯 Usuarios de prueba creados:");
    console.log("📧 Email: maikostudios@gmail.com");
    console.log("🔑 Password: 123456");
    console.log("👑 Rol: ADMIN/admin");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

createAdminUser();
