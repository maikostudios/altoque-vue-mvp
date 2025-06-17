// Script para crear datos de prueba del sistema de soporte
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

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

// UID del usuario actual (nico@gmail.com)
const USER_ID = "tf3YgdhZ7XVtLaUM70ioca9w0wA2";
const USER_EMAIL = "nico@gmail.com";
const USER_NAME = "Nico";

async function createTestData() {
  console.log("🧪 Creando datos de prueba para el sistema de soporte...");

  try {
    // 1. Crear tickets de prueba
    console.log("🎫 Creando tickets de prueba...");
    
    const tickets = [
      {
        ticketId: "TK" + Date.now(),
        userId: USER_ID,
        userEmail: USER_EMAIL,
        userName: USER_NAME,
        asunto: "qr_no_funciona",
        mensaje: "Hola, tengo problemas con mi código QR. Cuando lo escaneo no muestra mis datos bancarios correctamente. ¿Podrían ayudarme a solucionarlo?",
        estado: "recibido",
        prioridad: "normal",
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        historial: [{
          accion: "creado",
          descripcion: "Ticket creado por el usuario",
          fecha: serverTimestamp(),
          autor: "usuario"
        }]
      },
      {
        ticketId: "TK" + (Date.now() + 1000),
        userId: USER_ID,
        userEmail: USER_EMAIL,
        userName: USER_NAME,
        asunto: "problemas_premium",
        mensaje: "Actualicé a Premium pero no puedo ver las estadísticas avanzadas. También sigue mostrando que tengo límite de 1 tarjeta.",
        estado: "en_proceso",
        prioridad: "alta",
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        comentarioAdmin: "Hemos identificado el problema. Estamos trabajando en la solución.",
        historial: [
          {
            accion: "creado",
            descripcion: "Ticket creado por el usuario",
            fecha: serverTimestamp(),
            autor: "usuario"
          },
          {
            accion: "actualizado",
            descripcion: "Estado cambiado a 'en_proceso'",
            fecha: serverTimestamp(),
            autor: "admin"
          }
        ]
      },
      {
        ticketId: "TK" + (Date.now() + 2000),
        userId: USER_ID,
        userEmail: USER_EMAIL,
        userName: USER_NAME,
        asunto: "registro_tarjeta",
        mensaje: "Registré mi tarjeta del Banco de Chile pero no aparece en mi dashboard. Ya intenté refrescar la página varias veces.",
        estado: "respondido",
        prioridad: "normal",
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        comentarioAdmin: "Hemos revisado tu cuenta y encontramos que la tarjeta se registró correctamente. El problema era un error de caché. Ya está solucionado. Por favor verifica en tu dashboard.",
        historial: [
          {
            accion: "creado",
            descripcion: "Ticket creado por el usuario",
            fecha: serverTimestamp(),
            autor: "usuario"
          },
          {
            accion: "respondido",
            descripcion: "Respuesta del equipo de soporte",
            fecha: serverTimestamp(),
            autor: "admin"
          }
        ]
      }
    ];

    for (const ticket of tickets) {
      const docRef = await addDoc(collection(db, "tickets"), ticket);
      console.log(`✅ Ticket creado: ${ticket.ticketId} (${docRef.id})`);
    }

    // 2. Crear notificaciones de prueba
    console.log("🔔 Creando notificaciones de prueba...");
    
    const notifications = [
      {
        userId: USER_ID,
        tipo: "ticket_creado",
        titulo: "Ticket de soporte creado",
        mensaje: `Tu ticket #${tickets[0].ticketId} ha sido recibido. Te contactaremos pronto.`,
        ticketId: "ticket_1",
        icono: "🎫",
        fechaCreacion: serverTimestamp(),
        leida: false
      },
      {
        userId: USER_ID,
        tipo: "ticket_actualizado",
        titulo: "Ticket actualizado",
        mensaje: `Tu ticket #${tickets[1].ticketId} está ahora en proceso. Estamos trabajando en la solución.`,
        ticketId: "ticket_2",
        icono: "⚙️",
        fechaCreacion: serverTimestamp(),
        leida: false
      },
      {
        userId: USER_ID,
        tipo: "ticket_actualizado",
        titulo: "Ticket respondido",
        mensaje: `Tu ticket #${tickets[2].ticketId} ha sido respondido. Revisa la respuesta en tu panel de soporte.`,
        ticketId: "ticket_3",
        icono: "💬",
        fechaCreacion: serverTimestamp(),
        leida: true
      },
      {
        userId: USER_ID,
        tipo: "premium_expiring",
        titulo: "Plan Premium por vencer",
        mensaje: "Tu plan Premium vence en 15 días. ¡Renuévalo para seguir disfrutando de todas las funciones!",
        ticketId: null,
        icono: "⚠️",
        fechaCreacion: serverTimestamp(),
        leida: false
      },
      {
        userId: USER_ID,
        tipo: "system",
        titulo: "Bienvenido al sistema de soporte",
        mensaje: "Ahora puedes crear tickets de soporte y recibir notificaciones en tiempo real. ¡Explora las nuevas funciones!",
        ticketId: null,
        icono: "🎉",
        fechaCreacion: serverTimestamp(),
        leida: false
      }
    ];

    for (const notification of notifications) {
      const docRef = await addDoc(collection(db, "notifications"), notification);
      console.log(`✅ Notificación creada: ${notification.titulo} (${docRef.id})`);
    }

    console.log("\n🎉 ¡Datos de prueba creados exitosamente!");
    console.log("\n📋 Resumen:");
    console.log(`- ✅ ${tickets.length} tickets de prueba`);
    console.log(`- ✅ ${notifications.length} notificaciones de prueba`);
    console.log(`- 👤 Usuario: ${USER_EMAIL} (${USER_ID})`);
    
    console.log("\n🚀 Ahora puedes:");
    console.log("1. Ver los tickets en /soporte");
    console.log("2. Ver las notificaciones en la campana");
    console.log("3. Crear nuevos tickets");
    console.log("4. Probar el sistema completo");

    console.log("\n⚠️ Recuerda:");
    console.log("1. Crear el índice de Firestore para las consultas");
    console.log("2. Configurar las Cloud Functions para emails");
    console.log("3. Actualizar las reglas de Firestore si es necesario");

  } catch (error) {
    console.error("❌ Error creando datos de prueba:", error);
  }
}

// Ejecutar creación de datos
createTestData();
