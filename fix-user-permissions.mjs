// Script de emergencia para agregar usuario a Firestore
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addUserToFirestore() {
  try {
    console.log("🔧 Agregando usuario a Firestore...");
    
    // UID del usuario que se creó en Auth
    const uid = "OPBRlk6wMXeI1YgMeObPK9ScARM2";
    
    await setDoc(doc(db, "users", uid), {
      email: "m.esteban.saez@gmail.com",
      role: "usuario",
      nombre: "Michael",
      apellido: "Usuarioski",
      rut: "11111111-1",
      telefono: "",
      fechaNacimiento: new Date("1994-10-19"),
      comuna: "Temuco",
      region: "Araucanía",
      empresa: "Muahahahaha",
      estado: "activo",
      fechaRegistro: serverTimestamp(),
      ultimoAcceso: serverTimestamp(),
      creadoPor: "admin"
    });
    
    console.log("✅ Usuario agregado exitosamente a Firestore");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

addUserToFirestore();
