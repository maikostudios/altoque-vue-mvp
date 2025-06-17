// Script simplificado para crear datos de prueba
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

console.log("🚀 Iniciando script de datos de prueba...");

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

// Usuario actual
const USER_ID = "KCcfigeVFEYjTxLtiW7VtfOcTod2";
const USER_EMAIL = "usuariopremium@hotmail.com";
const USER_NAME = "Usuario Premium";

console.log(`👤 Usuario: ${USER_EMAIL}`);

async function createTestData() {
  try {
    console.log("🎫 Creando tickets de prueba...");
    
    // Ticket 1
    const ticket1 = {
      ticketId: "TK" + Date.now(),
      userId: USER_ID,
      userEmail: USER_EMAIL,
      userName: USER_NAME,
      asunto: "qr_no_funciona",
      mensaje: "Mi código QR no funciona correctamente. ¿Pueden ayudarme?",
      estado: "recibido",
      prioridad: "normal",
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
      historial: [{
        accion: "creado",
        descripcion: "Ticket creado por el usuario",
        fecha: new Date(),
        autor: "usuario"
      }]
    };

    const docRef1 = await addDoc(collection(db, "tickets"), ticket1);
    console.log(`✅ Ticket 1 creado: ${ticket1.ticketId}`);

    // Ticket 2
    const ticket2 = {
      ticketId: "TK" + (Date.now() + 1000),
      userId: USER_ID,
      userEmail: USER_EMAIL,
      userName: USER_NAME,
      asunto: "problemas_premium",
      mensaje: "No puedo acceder a las funciones Premium después de actualizar.",
      estado: "en_proceso",
      prioridad: "alta",
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
      comentarioAdmin: "Estamos revisando tu cuenta Premium.",
      historial: [
        {
          accion: "creado",
          descripcion: "Ticket creado por el usuario",
          fecha: new Date(),
          autor: "usuario"
        },
        {
          accion: "actualizado",
          descripcion: "Estado cambiado a en_proceso",
          fecha: new Date(),
          autor: "admin"
        }
      ]
    };

    const docRef2 = await addDoc(collection(db, "tickets"), ticket2);
    console.log(`✅ Ticket 2 creado: ${ticket2.ticketId}`);

    console.log("🔔 Creando notificaciones de prueba...");

    // Notificaciones
    const notifications = [
      {
        userId: USER_ID,
        tipo: "ticket_creado",
        titulo: "Ticket de soporte creado",
        mensaje: `Tu ticket #${ticket1.ticketId} ha sido recibido.`,
        ticketId: docRef1.id,
        icono: "🎫",
        fechaCreacion: serverTimestamp(),
        leida: false
      },
      {
        userId: USER_ID,
        tipo: "ticket_actualizado",
        titulo: "Ticket actualizado",
        mensaje: `Tu ticket #${ticket2.ticketId} está en proceso.`,
        ticketId: docRef2.id,
        icono: "⚙️",
        fechaCreacion: serverTimestamp(),
        leida: false
      },
      {
        userId: USER_ID,
        tipo: "system",
        titulo: "¡Bienvenido al sistema de soporte!",
        mensaje: "Ahora puedes crear tickets y recibir notificaciones.",
        ticketId: null,
        icono: "🎉",
        fechaCreacion: serverTimestamp(),
        leida: false
      }
    ];

    for (let i = 0; i < notifications.length; i++) {
      const docRef = await addDoc(collection(db, "notifications"), notifications[i]);
      console.log(`✅ Notificación ${i + 1} creada: ${notifications[i].titulo}`);
    }

    console.log("\n🎉 ¡Datos de prueba creados exitosamente!");
    console.log("\n📋 Resumen:");
    console.log("- ✅ 2 tickets de prueba");
    console.log("- ✅ 3 notificaciones de prueba");
    console.log(`- 👤 Usuario: ${USER_EMAIL}`);
    
    console.log("\n🚀 Ahora puedes:");
    console.log("1. Ir a /soporte para ver los tickets");
    console.log("2. Hacer clic en la campana para ver notificaciones");
    console.log("3. Crear nuevos tickets");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createTestData();
