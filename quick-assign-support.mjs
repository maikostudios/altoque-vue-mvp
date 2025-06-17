// Script rápido para asignar rol de soporte
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase/firestore";

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

async function assignSupportRole() {
  try {
    console.log("🎧 Asignando rol de soporte...");
    
    const userUID = "KCcfigeVFEYjTxLtiW7VtfOcTod2";
    
    await updateDoc(doc(db, "users", userUID), {
      rol: "soporte",
      tipoUsuario: "soporte",
      turno: "flexible",
      especialidad: "general",
      maxTicketsDiarios: 20,
      nivelAcceso: "intermedio",
      ticketsAsignados: 0,
      ticketsResueltos: 0,
      estado: "activo",
      fechaActualizacion: serverTimestamp()
    });
    
    console.log("✅ ¡Rol de soporte asignado correctamente!");
    console.log("🔗 El usuario puede acceder a /support-dashboard");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

assignSupportRole();
