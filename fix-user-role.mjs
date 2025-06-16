// Script para crear el usuario con el UID correcto
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

async function fixUserRole() {
  try {
    const uid = "rNi8X1TXb9TFwJDkw9opqVkgrqA2";
    const email = "maikostudios@gmail.com";
    
    console.log("🔧 Creando usuario con UID correcto...");
    
    // Crear en colección 'users' con UID como ID
    await setDoc(doc(db, "users", uid), {
      email: email,
      role: "admin",
      nombre: "Michael",
      fechaRegistro: serverTimestamp()
    });
    
    console.log("✅ Usuario creado en colección 'users' con UID");
    
    // Crear en colección 'usuarios' con UID como ID
    await setDoc(doc(db, "usuarios", uid), {
      email: email,
      rol: "ADMIN",
      nombre: "Michael",
      comuna: "TEMUCO",
      creadoPor: "Admin",
      fechaNacimiento: new Date("1994-10-19"),
      fechaRegistro: serverTimestamp(),
      rut: "189909780"
    });
    
    console.log("✅ Usuario creado en colección 'usuarios' con UID");
    
    // También crear con email como ID por si busca por email
    await setDoc(doc(db, "users", email), {
      email: email,
      role: "admin",
      nombre: "Michael",
      fechaRegistro: serverTimestamp()
    });
    
    console.log("✅ Usuario creado en colección 'users' con email como ID");
    
    await setDoc(doc(db, "usuarios", email), {
      email: email,
      rol: "ADMIN",
      nombre: "Michael",
      comuna: "TEMUCO",
      creadoPor: "Admin",
      fechaNacimiento: new Date("1994-10-19"),
      fechaRegistro: serverTimestamp(),
      rut: "189909780"
    });
    
    console.log("✅ Usuario creado en colección 'usuarios' con email como ID");
    
    console.log("\n🎯 Usuario admin configurado correctamente:");
    console.log("📧 Email:", email);
    console.log("🆔 UID:", uid);
    console.log("👑 Rol: admin/ADMIN");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

fixUserRole();
