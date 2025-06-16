// Script para debuggear el usuario
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

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

async function debugUser() {
  try {
    console.log("🔐 Iniciando sesión...");
    
    const userCredential = await signInWithEmailAndPassword(
      auth,
      "maikostudios@gmail.com",
      "123456"
    );
    
    console.log("✅ Login exitoso!");
    console.log("👤 UID:", userCredential.user.uid);
    console.log("📧 Email:", userCredential.user.email);
    
    // Listar todas las colecciones disponibles
    console.log("\n🔍 Explorando colecciones...");
    
    const collections = ["users", "usuarios", "user", "profiles"];
    
    for (const collectionName of collections) {
      try {
        console.log(`\n📁 Colección: ${collectionName}`);
        const querySnapshot = await getDocs(collection(db, collectionName));
        
        if (querySnapshot.empty) {
          console.log(`   ❌ Vacía`);
        } else {
          console.log(`   ✅ ${querySnapshot.size} documentos encontrados`);
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`   📄 Doc ID: ${doc.id}`);
            console.log(`   📋 Email: ${data.email || 'N/A'}`);
            console.log(`   👑 Rol: ${data.role || data.rol || 'N/A'}`);
            console.log(`   📝 Datos:`, data);
            console.log(`   ---`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // Buscar específicamente por UID
    console.log(`\n🎯 Buscando por UID: ${userCredential.user.uid}`);
    for (const collectionName of collections) {
      try {
        const userDoc = await getDoc(doc(db, collectionName, userCredential.user.uid));
        if (userDoc.exists()) {
          console.log(`✅ Encontrado en ${collectionName}:`, userDoc.data());
        }
      } catch (error) {
        console.log(`❌ Error en ${collectionName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

debugUser();
