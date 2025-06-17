// Script para crear tickets de prueba y asignarlos al agente de soporte
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

console.log("🎫 Creando tickets de prueba con asignaciones...");

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

// IDs de usuarios
const SUPPORT_AGENT_UID = "KCcfigeVFEYjTxLtiW7VtfOcTod2"; // Usuario con rol soporte
const USER_UID = "rNi8X1TXb9TFwJDkw9opqVkgrqA2"; // Usuario admin que crea tickets

async function createTestTickets() {
  try {
    console.log("🔍 Verificando usuarios...");
    
    // Verificar que el agente de soporte existe
    const supportAgentRef = doc(db, "users", SUPPORT_AGENT_UID);
    const supportAgentSnap = await getDoc(supportAgentRef);
    
    if (!supportAgentSnap.exists()) {
      console.error(`❌ Agente de soporte no encontrado: ${SUPPORT_AGENT_UID}`);
      return;
    }
    
    const supportAgent = supportAgentSnap.data();
    console.log(`✅ Agente de soporte: ${supportAgent.email} (${supportAgent.rol})`);
    
    // Verificar usuario que crea tickets
    const userRef = doc(db, "users", USER_UID);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error(`❌ Usuario no encontrado: ${USER_UID}`);
      return;
    }
    
    const user = userSnap.data();
    console.log(`✅ Usuario: ${user.email}`);
    
    console.log("🎫 Creando tickets de prueba...");
    
    // Ticket 1 - Asignado y en proceso
    const ticket1 = {
      ticketId: "TK" + Date.now(),
      userId: USER_UID,
      userEmail: user.email,
      userName: `${user.nombre || 'Admin'} ${user.apellido || 'Usuario'}`,
      asunto: "problemas_qr",
      mensaje: "Mi código QR no funciona correctamente. No puedo compartir mis datos bancarios.",
      estado: "en_proceso",
      prioridad: "alta",
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
      asignadoA: SUPPORT_AGENT_UID,
      fechaAsignacion: serverTimestamp(),
      respuesta: null,
      historial: [
        {
          estado: "recibido",
          usuario: user.email,
          mensaje: `Ticket creado: Mi código QR no funciona correctamente.`,
          fecha: new Date(),
          autor: "usuario",
          autorId: USER_UID
        },
        {
          estado: "en_proceso",
          usuario: supportAgent.email,
          mensaje: "Ticket asignado y en revisión",
          fecha: new Date(),
          autor: "soporte",
          autorId: SUPPORT_AGENT_UID
        }
      ]
    };

    const docRef1 = await addDoc(collection(db, "tickets"), ticket1);
    console.log(`✅ Ticket 1 creado y asignado: ${ticket1.ticketId}`);

    // Ticket 2 - Asignado y respondido
    const ticket2 = {
      ticketId: "TK" + (Date.now() + 1000),
      userId: USER_UID,
      userEmail: user.email,
      userName: `${user.nombre || 'Admin'} ${user.apellido || 'Usuario'}`,
      asunto: "problemas_premium",
      mensaje: "No puedo acceder a las funciones Premium después de pagar.",
      estado: "respondido",
      prioridad: "media",
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
      asignadoA: SUPPORT_AGENT_UID,
      fechaAsignacion: serverTimestamp(),
      respuesta: "Hemos verificado tu cuenta Premium. El problema ha sido solucionado. Ahora deberías poder acceder a todas las funciones Premium.",
      historial: [
        {
          estado: "recibido",
          usuario: user.email,
          mensaje: `Ticket creado: No puedo acceder a las funciones Premium.`,
          fecha: new Date(),
          autor: "usuario",
          autorId: USER_UID
        },
        {
          estado: "en_proceso",
          usuario: supportAgent.email,
          mensaje: "Ticket asignado y en revisión",
          fecha: new Date(),
          autor: "soporte",
          autorId: SUPPORT_AGENT_UID
        },
        {
          estado: "respondido",
          usuario: supportAgent.email,
          mensaje: "Hemos verificado tu cuenta Premium. El problema ha sido solucionado.",
          fecha: new Date(),
          autor: "soporte",
          autorId: SUPPORT_AGENT_UID
        }
      ]
    };

    const docRef2 = await addDoc(collection(db, "tickets"), ticket2);
    console.log(`✅ Ticket 2 creado y respondido: ${ticket2.ticketId}`);

    // Ticket 3 - Sin asignar
    const ticket3 = {
      ticketId: "TK" + (Date.now() + 2000),
      userId: USER_UID,
      userEmail: user.email,
      userName: `${user.nombre || 'Admin'} ${user.apellido || 'Usuario'}`,
      asunto: "problemas_cuenta",
      mensaje: "No puedo actualizar mi información de perfil. El formulario no guarda los cambios.",
      estado: "recibido",
      prioridad: "baja",
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
      asignadoA: null,
      fechaAsignacion: null,
      respuesta: null,
      historial: [
        {
          estado: "recibido",
          usuario: user.email,
          mensaje: `Ticket creado: No puedo actualizar mi información de perfil.`,
          fecha: new Date(),
          autor: "usuario",
          autorId: USER_UID
        }
      ]
    };

    const docRef3 = await addDoc(collection(db, "tickets"), ticket3);
    console.log(`✅ Ticket 3 creado sin asignar: ${ticket3.ticketId}`);

    // Ticket 4 - Asignado y cerrado
    const ticket4 = {
      ticketId: "TK" + (Date.now() + 3000),
      userId: USER_UID,
      userEmail: user.email,
      userName: `${user.nombre || 'Admin'} ${user.apellido || 'Usuario'}`,
      asunto: "problemas_pagos",
      mensaje: "Mi pago no se procesó correctamente. Necesito ayuda para completar la transacción.",
      estado: "cerrado",
      prioridad: "alta",
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
      asignadoA: SUPPORT_AGENT_UID,
      fechaAsignacion: serverTimestamp(),
      respuesta: "Hemos procesado tu pago manualmente. La transacción se ha completado exitosamente. Tu cuenta Premium está activa.",
      historial: [
        {
          estado: "recibido",
          usuario: user.email,
          mensaje: `Ticket creado: Mi pago no se procesó correctamente.`,
          fecha: new Date(),
          autor: "usuario",
          autorId: USER_UID
        },
        {
          estado: "en_proceso",
          usuario: supportAgent.email,
          mensaje: "Ticket asignado y en revisión",
          fecha: new Date(),
          autor: "soporte",
          autorId: SUPPORT_AGENT_UID
        },
        {
          estado: "respondido",
          usuario: supportAgent.email,
          mensaje: "Hemos procesado tu pago manualmente. La transacción se ha completado exitosamente.",
          fecha: new Date(),
          autor: "soporte",
          autorId: SUPPORT_AGENT_UID
        },
        {
          estado: "cerrado",
          usuario: supportAgent.email,
          mensaje: "Ticket cerrado - problema resuelto",
          fecha: new Date(),
          autor: "soporte",
          autorId: SUPPORT_AGENT_UID
        }
      ]
    };

    const docRef4 = await addDoc(collection(db, "tickets"), ticket4);
    console.log(`✅ Ticket 4 creado y cerrado: ${ticket4.ticketId}`);

    console.log("\n🎉 ¡Tickets de prueba creados exitosamente!");
    console.log("\n📊 Resumen:");
    console.log(`- ✅ 4 tickets creados`);
    console.log(`- 🎧 3 tickets asignados a: ${supportAgent.email}`);
    console.log(`- 📝 1 ticket sin asignar`);
    console.log(`- 💬 2 tickets respondidos/cerrados`);
    console.log(`- ⚙️ 1 ticket en proceso`);
    
    console.log("\n🚀 Ahora puedes:");
    console.log("1. Ir a /admin > Lista Agentes Soporte");
    console.log("2. Ver las estadísticas actualizadas");
    console.log("3. Hacer clic en el agente para ver sus tickets");
    console.log("4. Ir a /admin > Gestión de Tickets para ver todos");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createTestTickets();
