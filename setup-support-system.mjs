// Script para configurar el sistema de soporte en Firestore
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
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

async function setupSupportSystem() {
  console.log("🚀 Configurando sistema de soporte...");

  try {
    // 1. Crear configuración del sistema de soporte
    console.log("📋 Creando configuración del sistema...");
    
    await setDoc(doc(db, "system_config", "support_settings"), {
      emailSupport: "soporte@maikostudios.com",
      autoResponseEnabled: true,
      maxTicketsPerUser: 10,
      ticketStatuses: {
        recibido: { label: "Recibido", color: "blue", icon: "📨" },
        en_proceso: { label: "En proceso", color: "yellow", icon: "⚙️" },
        respondido: { label: "Respondido", color: "green", icon: "💬" },
        cerrado: { label: "Cerrado", color: "gray", icon: "✅" }
      },
      ticketSubjects: {
        qr_no_funciona: "No sirve el QR",
        problemas_premium: "Problemas Función Premium",
        registro_tarjeta: "Registré mi tarjeta pero no aparece",
        problema_pago: "Problema con el pago",
        cuenta_bloqueada: "Mi cuenta está bloqueada",
        cambio_datos: "Quiero cambiar mis datos",
        otro: "Otro"
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 2. Crear templates de email
    console.log("📧 Creando templates de email...");
    
    await setDoc(doc(db, "system_config", "email_templates"), {
      ticketCreated: {
        subject: "[De Una] Ticket de Soporte Recibido #{ticketId}",
        template: "ticket_created_user",
        variables: ["ticketId", "userName", "asunto", "mensaje"]
      },
      ticketUpdated: {
        subject: "[De Una] Actualización de Ticket #{ticketId}",
        template: "ticket_updated_user",
        variables: ["ticketId", "userName", "estado", "comentarioAdmin"]
      },
      supportNotification: {
        subject: "[De Una] Nuevo Ticket de Soporte #{ticketId}",
        template: "ticket_created_support",
        variables: ["ticketId", "userName", "userEmail", "asunto", "mensaje"]
      },
      createdAt: serverTimestamp()
    });

    // 3. Crear FAQs iniciales
    console.log("❓ Creando FAQs iniciales...");
    
    const faqs = [
      {
        id: "faq_001",
        category: "account",
        question: "¿Cómo creo una cuenta en De Una?",
        answer: "Para crear una cuenta: 1) Ve a la página de registro, 2) Completa tus datos personales, 3) Verifica tu correo electrónico, 4) ¡Listo!",
        order: 1,
        active: true,
        createdAt: serverTimestamp()
      },
      {
        id: "faq_002",
        category: "cards",
        question: "¿Cuántas tarjetas puedo registrar?",
        answer: "Plan Gratuito: 1 tarjeta bancaria. Plan Premium: Hasta 5 tarjetas bancarias.",
        order: 2,
        active: true,
        createdAt: serverTimestamp()
      },
      {
        id: "faq_003",
        category: "qr",
        question: "¿Cómo funciona el código QR?",
        answer: "El código QR permite compartir tus datos bancarios de forma segura. Genera tu QR desde el dashboard y compártelo con quien necesite transferirte dinero.",
        order: 3,
        active: true,
        createdAt: serverTimestamp()
      },
      {
        id: "faq_004",
        category: "premium",
        question: "¿Qué incluye el plan Premium?",
        answer: "El plan Premium incluye: hasta 5 tarjetas bancarias, estadísticas detalladas, personalización avanzada, soporte prioritario y análisis de visitas.",
        order: 4,
        active: true,
        createdAt: serverTimestamp()
      },
      {
        id: "faq_005",
        category: "technical",
        question: "El código QR no funciona, ¿qué hago?",
        answer: "Intenta: 1) Verificar conexión a internet, 2) Regenerar el código QR, 3) Verificar que la tarjeta esté activa, 4) Comprobar datos correctos.",
        order: 5,
        active: true,
        createdAt: serverTimestamp()
      }
    ];

    for (const faq of faqs) {
      await setDoc(doc(db, "faqs", faq.id), faq);
    }

    // 4. Crear ticket de ejemplo (para testing)
    console.log("🎫 Creando ticket de ejemplo...");
    
    const exampleTicket = {
      ticketId: "TK" + Date.now(),
      userId: "example_user_id",
      userEmail: "usuario@ejemplo.com",
      userName: "Usuario Ejemplo",
      asunto: "qr_no_funciona",
      mensaje: "Hola, tengo problemas con mi código QR. No se puede escanear correctamente y no muestra mis datos bancarios. ¿Podrían ayudarme?",
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
    };

    await addDoc(collection(db, "tickets"), exampleTicket);

    // 5. Crear notificación de ejemplo
    console.log("🔔 Creando notificación de ejemplo...");
    
    const exampleNotification = {
      userId: "example_user_id",
      tipo: "ticket_creado",
      titulo: "Ticket de soporte creado",
      mensaje: `Tu ticket #${exampleTicket.ticketId} ha sido recibido. Te contactaremos pronto.`,
      ticketId: "example_ticket_id",
      icono: "🎫",
      fechaCreacion: serverTimestamp(),
      leida: false
    };

    await addDoc(collection(db, "notifications"), exampleNotification);

    // 6. Crear estadísticas iniciales del sistema de soporte
    console.log("📊 Creando estadísticas iniciales...");
    
    await setDoc(doc(db, "analytics", "support_stats"), {
      totalTickets: 1,
      ticketsByStatus: {
        recibido: 1,
        en_proceso: 0,
        respondido: 0,
        cerrado: 0
      },
      ticketsBySubject: {
        qr_no_funciona: 1,
        problemas_premium: 0,
        registro_tarjeta: 0,
        problema_pago: 0,
        cuenta_bloqueada: 0,
        cambio_datos: 0,
        otro: 0
      },
      averageResponseTime: 0,
      satisfactionRating: 0,
      lastUpdated: serverTimestamp()
    });

    // 7. Crear configuración de notificaciones
    console.log("🔔 Configurando sistema de notificaciones...");
    
    await setDoc(doc(db, "system_config", "notifications_settings"), {
      enableEmailNotifications: true,
      enablePushNotifications: false,
      notificationTypes: {
        ticket_creado: {
          enabled: true,
          emailTemplate: "ticket_created",
          pushEnabled: false
        },
        ticket_actualizado: {
          enabled: true,
          emailTemplate: "ticket_updated",
          pushEnabled: false
        },
        premium_expiring: {
          enabled: true,
          emailTemplate: "premium_expiring",
          pushEnabled: true
        }
      },
      createdAt: serverTimestamp()
    });

    console.log("✅ Sistema de soporte configurado exitosamente!");
    console.log("\n📋 Resumen de configuración:");
    console.log("- ✅ Configuración del sistema");
    console.log("- ✅ Templates de email");
    console.log("- ✅ FAQs iniciales (5 preguntas)");
    console.log("- ✅ Ticket de ejemplo");
    console.log("- ✅ Notificación de ejemplo");
    console.log("- ✅ Estadísticas iniciales");
    console.log("- ✅ Configuración de notificaciones");
    
    console.log("\n🚀 Próximos pasos:");
    console.log("1. Configurar Cloud Functions para emails");
    console.log("2. Actualizar reglas de Firestore");
    console.log("3. Probar creación de tickets");
    console.log("4. Verificar envío de emails");

  } catch (error) {
    console.error("❌ Error configurando sistema de soporte:", error);
  }
}

// Ejecutar configuración
setupSupportSystem();
