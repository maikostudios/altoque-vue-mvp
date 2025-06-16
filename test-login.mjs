// Script para probar el login
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

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

async function testLogin() {
  try {
    console.log("🔐 Probando login con maikostudios@gmail.com...");
    
    // Intentar login
    const userCredential = await signInWithEmailAndPassword(
      auth,
      "maikostudios@gmail.com",
      "123456"
    );
    
    console.log("✅ Login exitoso!");
    console.log("👤 UID:", userCredential.user.uid);
    console.log("📧 Email:", userCredential.user.email);
    
    // Buscar datos del usuario en Firestore
    console.log("\n🔍 Buscando datos del usuario en Firestore...");
    
    const q = query(
      collection(db, "users"),
      where("email", "==", userCredential.user.email)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      console.log("✅ Datos encontrados en colección 'users':");
      console.log("📋 Datos:", userData);
      console.log("👑 Rol:", userData.role || userData.rol);
    } else {
      console.log("❌ No se encontraron datos en colección 'users'");
      
      // Intentar buscar en otras colecciones posibles
      console.log("🔍 Buscando en otras colecciones...");
      
      const collections = ["usuarios", "user", "profiles"];
      for (const collectionName of collections) {
        try {
          const q2 = query(
            collection(db, collectionName),
            where("email", "==", userCredential.user.email)
          );
          const querySnapshot2 = await getDocs(q2);
          
          if (!querySnapshot2.empty) {
            const userData = querySnapshot2.docs[0].data();
            console.log(`✅ Datos encontrados en colección '${collectionName}':`);
            console.log("📋 Datos:", userData);
            console.log("👑 Rol:", userData.role || userData.rol);
            break;
          }
        } catch (error) {
          console.log(`❌ Error buscando en '${collectionName}':`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error en login:", error);
    console.error("🔍 Código de error:", error.code);
    console.error("📝 Mensaje:", error.message);
  }
}

testLogin();
