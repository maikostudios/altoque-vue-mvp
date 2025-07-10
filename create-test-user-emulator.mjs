import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, connectAuthEmulator } from "firebase/auth";
import { getFirestore, doc, setDoc, connectFirestoreEmulator, serverTimestamp } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "deunamaikostudios",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Conectar a emulators
try {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  console.log("🔧 Conectado a Firebase Emulators");
} catch (error) {
  console.warn("⚠️ Error conectando a emulators:", error.message);
}

async function createTestUser() {
  try {
    console.log("🔄 Creando usuario de prueba...");
    
    // Crear usuario en Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      "maikostudios@gmail.com", 
      "123456"
    );
    
    const user = userCredential.user;
    console.log("✅ Usuario creado en Auth:", user.uid);
    
    // Crear documento en Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: "Michael Saez",
      rol: "admin",
      isPremium: false,
      planType: "free",
      onboardingCompleted: false,
      idVerificationStatus: "pending",
      userType: "client_deuna",
      associatedProjects: ["deuna"],
      signUpSource: "email",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log("✅ Documento creado en Firestore");
    
    console.log("🎉 Usuario de prueba creado exitosamente:");
    console.log("📧 Email: maikostudios@gmail.com");
    console.log("🔑 Password: 123456");
    console.log("👤 Rol: admin");
    
  } catch (error) {
    console.error("❌ Error creando usuario:", error);
  }
}

createTestUser();
