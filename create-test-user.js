// Script para crear un usuario de prueba
const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

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

async function createTestUser() {
  try {
    // Crear usuario de prueba
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      "test@example.com",
      "123456"
    );

    console.log("Usuario creado:", userCredential.user.uid);

    // Crear documento en Firestore con rol
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: "test@example.com",
      role: "user",
      nombre: "Usuario de Prueba",
      fechaRegistro: new Date(),
    });

    console.log("Documento de usuario creado en Firestore");

    // Crear usuario admin
    const adminCredential = await createUserWithEmailAndPassword(
      auth,
      "admin@example.com",
      "123456"
    );

    console.log("Usuario admin creado:", adminCredential.user.uid);

    await setDoc(doc(db, "users", adminCredential.user.uid), {
      email: "admin@example.com",
      role: "admin",
      nombre: "Administrador",
      fechaRegistro: new Date(),
    });

    console.log("Documento de admin creado en Firestore");

    // Crear usuario vendedor
    const vendedorCredential = await createUserWithEmailAndPassword(
      auth,
      "vendedor@example.com",
      "123456"
    );

    console.log("Usuario vendedor creado:", vendedorCredential.user.uid);

    await setDoc(doc(db, "users", vendedorCredential.user.uid), {
      email: "vendedor@example.com",
      role: "vendedor",
      nombre: "Vendedor",
      fechaRegistro: new Date(),
    });

    console.log("Documento de vendedor creado en Firestore");

    console.log("\n✅ Usuarios de prueba creados exitosamente:");
    console.log("👤 Usuario normal: test@example.com / 123456");
    console.log("👑 Admin: admin@example.com / 123456");
    console.log("💼 Vendedor: vendedor@example.com / 123456");
  } catch (error) {
    console.error("Error creando usuarios:", error);
  }
}

createTestUser();
