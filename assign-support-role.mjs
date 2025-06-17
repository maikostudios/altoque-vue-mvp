// Script para asignar rol de soporte a un usuario existente
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

console.log("🎧 Script para asignar rol de soporte...");

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

// CONFIGURACIÓN: Cambiar estos datos por el usuario que quieres convertir en soporte
const USER_EMAIL = "usuariopremium@hotmail.com"; // Email del usuario existente
const USER_UID = "KCcfigeVFEYjTxLtiW7VtfOcTod2"; // UID del usuario

async function assignSupportRole() {
  try {
    console.log(`🔍 Verificando usuario: ${USER_EMAIL}`);
    
    // Verificar que el usuario existe
    const userRef = doc(db, "users", USER_UID);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error(`❌ Usuario no encontrado con UID: ${USER_UID}`);
      return;
    }
    
    const userData = userSnap.data();
    console.log(`✅ Usuario encontrado: ${userData.email}`);
    console.log(`📋 Rol actual: ${userData.rol || userData.role || 'sin rol'}`);
    
    // Actualizar rol a soporte
    const updateData = {
      rol: "soporte",
      
      // Agregar campos específicos de soporte
      turno: "flexible",
      especialidad: "general",
      maxTicketsDiarios: 20,
      nivelAcceso: "intermedio",
      
      // Estadísticas de soporte
      ticketsAsignados: 0,
      ticketsResueltos: 0,
      tiempoPromedioRespuesta: 0,
      calificacionPromedio: 0,
      
      // Metadatos
      fechaActualizacion: serverTimestamp(),
      tipoUsuario: "soporte",
      rolAnterior: userData.rol || userData.role || "usuario"
    };
    
    await updateDoc(userRef, updateData);
    
    console.log("🎉 ¡Rol de soporte asignado exitosamente!");
    console.log(`📧 Usuario: ${userData.email}`);
    console.log(`🎧 Nuevo rol: soporte`);
    console.log(`🔗 Acceso: /support-dashboard`);
    console.log("");
    console.log("🚀 El usuario ahora puede:");
    console.log("  - Acceder al panel de soporte");
    console.log("  - Ver tickets sin asignar");
    console.log("  - Asignarse tickets");
    console.log("  - Responder a usuarios");
    console.log("  - Cambiar estados de tickets");
    
  } catch (error) {
    console.error("❌ Error asignando rol de soporte:", error);
  }
}

// Función para crear un nuevo usuario de soporte desde cero
async function createSupportUser() {
  const newSupportUser = {
    email: "soporte@maikostudios.com",
    rol: "soporte",
    nombre: "Agente",
    apellido: "Soporte",
    telefono: "+56912345678",
    
    // Configuración de soporte
    turno: "flexible",
    especialidad: "general",
    supervisor: "Admin Principal",
    maxTicketsDiarios: 25,
    nivelAcceso: "avanzado",
    
    // Estadísticas iniciales
    ticketsAsignados: 0,
    ticketsResueltos: 0,
    tiempoPromedioRespuesta: 0,
    calificacionPromedio: 0,
    
    // Metadatos
    estado: "activo",
    fechaRegistro: serverTimestamp(),
    ultimoAcceso: serverTimestamp(),
    creadoPor: "script-admin",
    tipoUsuario: "soporte"
  };
  
  console.log("📋 Datos del nuevo usuario de soporte:");
  console.log(JSON.stringify(newSupportUser, null, 2));
  console.log("");
  console.log("⚠️  Para crear este usuario, necesitas:");
  console.log("1. Crear la cuenta en Firebase Auth");
  console.log("2. Usar el UID generado para crear el documento en Firestore");
  console.log("3. O usar el panel de admin en /admin > Agentes Soporte");
}

// Ejecutar script
console.log("🎯 Opciones disponibles:");
console.log("1. Asignar rol de soporte a usuario existente");
console.log("2. Ver ejemplo de nuevo usuario de soporte");
console.log("");

// Ejecutar asignación de rol
await assignSupportRole();

console.log("");
console.log("📝 Ejemplo de nuevo usuario de soporte:");
await createSupportUser();

console.log("");
console.log("✅ Script completado!");
