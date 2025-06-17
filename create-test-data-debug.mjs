// Script para crear datos de prueba con debug detallado
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

console.log("🔧 Configurando Firebase...");

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("✅ Firebase inicializado correctamente");

// UID del usuario actual (usuariopremium@hotmail.com)
const USER_ID = "KCcfigeVFEYjTxLtiW7VtfOcTod2";
const USER_EMAIL = "usuariopremium@hotmail.com";
const USER_NAME = "Usuario Premium";

console.log(`👤 Usuario objetivo: ${USER_EMAIL} (${USER_ID})`);

async function createTestData() {
  console.log("🧪 Creando datos de prueba para el sistema de soporte...");

  try {
    // 1. Crear tickets de prueba
    console.log("🎫 Creando tickets de prueba...");

    const ticketData1 = {
      ticketId: "TK" + Date.now(),
      userId: USER_ID,
      userEmail: USER_EMAIL,
      userName: USER_NAME,
      asunto: "qr_no_funciona",
      mensaje:
        "Hola, tengo problemas con mi código QR. Cuando lo escaneo no muestra mis datos bancarios correctamente. ¿Podrían ayudarme a solucionarlo?",
      estado: "recibido",
      prioridad: "normal",
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
      historial: [
        {
          accion: "creado",
          descripcion: "Ticket creado por el usuario",
          fecha: serverTimestamp(),
          autor: "usuario",
        },
      ],
    };

    console.log("📝 Creando primer ticket...");
    const docRef1 = await addDoc(collection(db, "tickets"), ticketData1);
    console.log(
      `✅ Ticket 1 creado: ${ticketData1.ticketId} (ID: ${docRef1.id})`
    );

    const ticketData2 = {
      ticketId: "TK" + (Date.now() + 1000),
      userId: USER_ID,
      userEmail: USER_EMAIL,
      userName: USER_NAME,
      asunto: "problemas_premium",
      mensaje:
        "Actualicé a Premium pero no puedo ver las estadísticas avanzadas. También sigue mostrando que tengo límite de 1 tarjeta.",
      estado: "en_proceso",
      prioridad: "alta",
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
      comentarioAdmin:
        "Hemos identificado el problema. Estamos trabajando en la solución.",
      historial: [
        {
          accion: "creado",
          descripcion: "Ticket creado por el usuario",
          fecha: serverTimestamp(),
          autor: "usuario",
        },
        {
          accion: "actualizado",
          descripcion: "Estado cambiado a 'en_proceso'",
          fecha: serverTimestamp(),
          autor: "admin",
        },
      ],
    };

    console.log("📝 Creando segundo ticket...");
    const docRef2 = await addDoc(collection(db, "tickets"), ticketData2);
    console.log(
      `✅ Ticket 2 creado: ${ticketData2.ticketId} (ID: ${docRef2.id})`
    );

    const ticketData3 = {
      ticketId: "TK" + (Date.now() + 2000),
      userId: USER_ID,
      userEmail: USER_EMAIL,
      userName: USER_NAME,
      asunto: "registro_tarjeta",
      mensaje:
        "Registré mi tarjeta del Banco de Chile pero no aparece en mi dashboard. Ya intenté refrescar la página varias veces.",
      estado: "respondido",
      prioridad: "normal",
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
      comentarioAdmin:
        "Hemos revisado tu cuenta y encontramos que la tarjeta se registró correctamente. El problema era un error de caché. Ya está solucionado. Por favor verifica en tu dashboard.",
      historial: [
        {
          accion: "creado",
          descripcion: "Ticket creado por el usuario",
          fecha: serverTimestamp(),
          autor: "usuario",
        },
        {
          accion: "respondido",
          descripcion: "Respuesta del equipo de soporte",
          fecha: serverTimestamp(),
          autor: "admin",
        },
      ],
    };

    console.log("📝 Creando tercer ticket...");
    const docRef3 = await addDoc(collection(db, "tickets"), ticketData3);
    console.log(
      `✅ Ticket 3 creado: ${ticketData3.ticketId} (ID: ${docRef3.id})`
    );

    // 2. Crear notificaciones de prueba
    console.log("🔔 Creando notificaciones de prueba...");

    const notifications = [
      {
        userId: USER_ID,
        tipo: "ticket_creado",
        titulo: "Ticket de soporte creado",
        mensaje: `Tu ticket #${ticketData1.ticketId} ha sido recibido. Te contactaremos pronto.`,
        ticketId: docRef1.id,
        icono: "🎫",
        fechaCreacion: serverTimestamp(),
        leida: false,
      },
      {
        userId: USER_ID,
        tipo: "ticket_actualizado",
        titulo: "Ticket actualizado",
        mensaje: `Tu ticket #${ticketData2.ticketId} está ahora en proceso. Estamos trabajando en la solución.`,
        ticketId: docRef2.id,
        icono: "⚙️",
        fechaCreacion: serverTimestamp(),
        leida: false,
      },
      {
        userId: USER_ID,
        tipo: "ticket_actualizado",
        titulo: "Ticket respondido",
        mensaje: `Tu ticket #${ticketData3.ticketId} ha sido respondido. Revisa la respuesta en tu panel de soporte.`,
        ticketId: docRef3.id,
        icono: "💬",
        fechaCreacion: serverTimestamp(),
        leida: true,
      },
      {
        userId: USER_ID,
        tipo: "premium_expiring",
        titulo: "Plan Premium por vencer",
        mensaje:
          "Tu plan Premium vence en 15 días. ¡Renuévalo para seguir disfrutando de todas las funciones!",
        ticketId: null,
        icono: "⚠️",
        fechaCreacion: serverTimestamp(),
        leida: false,
      },
      {
        userId: USER_ID,
        tipo: "system",
        titulo: "Bienvenido al sistema de soporte",
        mensaje:
          "Ahora puedes crear tickets de soporte y recibir notificaciones en tiempo real. ¡Explora las nuevas funciones!",
        ticketId: null,
        icono: "🎉",
        fechaCreacion: serverTimestamp(),
        leida: false,
      },
    ];

    let notificationCount = 0;
    for (const notification of notifications) {
      console.log(`📧 Creando notificación ${notificationCount + 1}/5...`);
      const docRef = await addDoc(
        collection(db, "notifications"),
        notification
      );
      notificationCount++;
      console.log(
        `✅ Notificación ${notificationCount} creada: ${notification.titulo} (ID: ${docRef.id})`
      );
    }

    console.log("\n🎉 ¡Datos de prueba creados exitosamente!");
    console.log("\n📋 Resumen:");
    console.log(`- ✅ 3 tickets de prueba creados`);
    console.log(`- ✅ 5 notificaciones de prueba creadas`);
    console.log(`- 👤 Usuario: ${USER_EMAIL} (${USER_ID})`);

    console.log("\n🚀 Ahora puedes:");
    console.log("1. Ir a /soporte para ver los tickets");
    console.log("2. Hacer clic en la campana para ver notificaciones");
    console.log("3. Crear nuevos tickets");
    console.log("4. Probar el sistema completo");

    console.log("\n✨ ¡Todo listo para probar!");
  } catch (error) {
    console.error("❌ Error creando datos de prueba:", error);
    console.error("📝 Detalles del error:", error.message);
    console.error("🔍 Stack trace:", error.stack);
  }
}

// Ejecutar creación de datos
console.log("🎬 Iniciando proceso...");
createTestData()
  .then(() => {
    console.log("🏁 Proceso completado");
  })
  .catch((error) => {
    console.error("💥 Error en el proceso principal:", error);
  });
