// Script simple para verificar el rol de un usuario
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFfjqq8YIfrduQpiYoMLGreId4vhkX08M",
  authDomain: "deunamaikostudios.firebaseapp.com",
  projectId: "deunamaikostudios",
  storageBucket: "deunamaikostudios.firebasestorage.app",
  messagingSenderId: "515483851699",
  appId: "1:515483851699:web:009b0b4885464ece0bc9c6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUserRole() {
  try {
    console.log("🔍 Verificando rol de usuario...");
    
    const userUID = "KCcfigeVFEYjTxLtiW7VtfOcTod2";
    const userRef = doc(db, "users", userUID);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log("✅ Usuario encontrado:");
      console.log(`📧 Email: ${userData.email}`);
      console.log(`👤 Nombre: ${userData.nombre} ${userData.apellido}`);
      console.log(`🎭 Rol: ${userData.rol || userData.role || 'sin rol'}`);
      console.log(`📊 Estado: ${userData.estado || 'sin estado'}`);
      
      if (userData.rol === 'soporte' || userData.role === 'soporte') {
        console.log("🎧 ¡Usuario tiene rol de soporte!");
        console.log("🔗 Puede acceder a: /support-dashboard");
      } else {
        console.log("⚠️  Usuario NO tiene rol de soporte");
        console.log(`🔄 Rol actual: ${userData.rol || userData.role || 'sin rol'}`);
      }
      
    } else {
      console.log("❌ Usuario no encontrado");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkUserRole();
