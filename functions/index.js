const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { determineVerificationStatus } = require("./src/idValidationUtils");
const { v4: uuidv4 } = require("uuid");

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ✅ NUEVO: Función para generar tokens únicos
function generateSecureToken(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ✅ NUEVO: Función para crear landing ID único
async function generateUniqueLandingId() {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const landingId = generateSecureToken(6);

    // Verificar que no exista
    const existingDoc = await db
      .collection("public_landings")
      .doc(landingId)
      .get();
    if (!existingDoc.exists) {
      return landingId;
    }

    attempts++;
  }

  // Fallback con UUID si no se puede generar uno único
  return uuidv4().substring(0, 8);
}

// Configurar transporter de email (usando Gmail como ejemplo)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().email?.user || "noreply@deuna.com", // soporte@maikostudios.com
    pass: functions.config().email?.password || "dummy_password", // App password
  },
});

/**
 * Cloud Function que se ejecuta cuando se crea un nuevo ticket
 * Envía email de notificación al equipo de soporte
 */
exports.onTicketCreated = functions.firestore
  .document("tickets/{ticketId}")
  .onCreate(async (snap, context) => {
    try {
      const ticketData = snap.data();
      const ticketId = context.params.ticketId;

      console.log("Nuevo ticket creado:", ticketId, ticketData);

      // Enviar email al equipo de soporte
      const supportEmailOptions = {
        from: functions.config().email?.user || "noreply@deuna.com",
        to: "soporte@maikostudios.com",
        subject: `[De Una] Nuevo Ticket de Soporte #${ticketData.ticketId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #00cccc; color: #121212; padding: 20px; text-align: center;">
              <h1>🎫 Nuevo Ticket de Soporte</h1>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
              <h2>Detalles del Ticket</h2>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef; font-weight: bold;">ID del Ticket:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${
                    ticketData.ticketId
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef; font-weight: bold;">Usuario:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${
                    ticketData.userName || "No especificado"
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef; font-weight: bold;">Email:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${
                    ticketData.userEmail
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef; font-weight: bold;">Asunto:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${getSubjectLabel(
                    ticketData.asunto
                  )}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef; font-weight: bold;">Estado:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${
                    ticketData.estado
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef; font-weight: bold;">Fecha:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString(
                    "es-CL"
                  )}</td>
                </tr>
              </table>
              
              <h3>Mensaje del Usuario:</h3>
              <div style="background: white; padding: 15px; border-left: 4px solid #00cccc; margin: 10px 0;">
                ${ticketData.mensaje.replace(/\n/g, "<br>")}
              </div>
              
              <div style="margin-top: 30px; padding: 15px; background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px;">
                <p style="margin: 0; color: #0c5460;">
                  <strong>Próximos pasos:</strong><br>
                  1. Revisa el ticket en el panel de administración<br>
                  2. Responde al usuario lo antes posible<br>
                  3. Actualiza el estado del ticket según corresponda
                </p>
              </div>
            </div>
            
            <div style="background: #121212; color: white; padding: 15px; text-align: center;">
              <p style="margin: 0;">De Una - Sistema de Soporte</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #ccc;">
                Este es un email automático, no responder directamente.
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(supportEmailOptions);
      console.log("Email de notificación enviado al equipo de soporte");

      // Enviar email de confirmación al usuario
      const userEmailOptions = {
        from: functions.config().email?.user || "noreply@deuna.com",
        to: ticketData.userEmail,
        subject: `[De Una] Ticket de Soporte Recibido #${ticketData.ticketId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #00cccc; color: #121212; padding: 20px; text-align: center;">
              <h1>✅ Ticket Recibido</h1>
            </div>
            
            <div style="padding: 20px;">
              <h2>Hola ${ticketData.userName || "Usuario"},</h2>
              
              <p>Hemos recibido tu solicitud de soporte y te asignamos el ticket <strong>#${
                ticketData.ticketId
              }</strong>.</p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #00cccc;">Resumen de tu solicitud:</h3>
                <p><strong>Asunto:</strong> ${getSubjectLabel(
                  ticketData.asunto
                )}</p>
                <p><strong>Mensaje:</strong></p>
                <div style="background: white; padding: 10px; border-left: 3px solid #00cccc;">
                  ${ticketData.mensaje.replace(/\n/g, "<br>")}
                </div>
              </div>
              
              <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0c5460;">¿Qué sigue?</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Nuestro equipo revisará tu solicitud</li>
                  <li>Te contactaremos dentro de las próximas 24 horas</li>
                  <li>Recibirás actualizaciones por email</li>
                  <li>Puedes ver el estado en tu panel de usuario</li>
                </ul>
              </div>
              
              <p>Si tienes preguntas adicionales, puedes responder a este email o crear un nuevo ticket.</p>
              
              <p>Gracias por usar De Una.</p>
              
              <p style="margin-top: 30px;">
                Saludos,<br>
                <strong>Equipo de Soporte de De Una</strong>
              </p>
            </div>
            
            <div style="background: #121212; color: white; padding: 15px; text-align: center;">
              <p style="margin: 0;">De Una - Maiko Studios</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #ccc;">
                soporte@maikostudios.com | Santiago, Chile
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(userEmailOptions);
      console.log("Email de confirmación enviado al usuario");

      return null;
    } catch (error) {
      console.error("Error procesando ticket creado:", error);
      throw error;
    }
  });

/**
 * Cloud Function que se ejecuta cuando se actualiza un ticket
 * Envía notificación al usuario sobre cambios de estado
 */
exports.onTicketUpdated = functions.firestore
  .document("tickets/{ticketId}")
  .onUpdate(async (change, context) => {
    try {
      const beforeData = change.before.data();
      const afterData = change.after.data();
      const ticketId = context.params.ticketId;

      // Solo procesar si cambió el estado
      if (beforeData.estado === afterData.estado) {
        return null;
      }

      console.log(
        "Ticket actualizado:",
        ticketId,
        "Estado:",
        beforeData.estado,
        "->",
        afterData.estado
      );

      // Crear notificación en Firestore
      await db.collection("notifications").add({
        userId: afterData.userId,
        tipo: "ticket_actualizado",
        titulo: "Ticket actualizado",
        mensaje: `Tu ticket #${
          afterData.ticketId
        } cambió a estado: ${getStatusLabel(afterData.estado)}`,
        ticketId: ticketId,
        icono: getStatusIcon(afterData.estado),
        fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
        leida: false,
      });

      // Enviar email solo para ciertos estados
      if (["respondido", "cerrado"].includes(afterData.estado)) {
        const emailOptions = {
          from: functions.config().email?.user || "noreply@deuna.com",
          to: afterData.userEmail,
          subject: `[De Una] Actualización de Ticket #${afterData.ticketId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #00cccc; color: #121212; padding: 20px; text-align: center;">
                <h1>📬 Actualización de Ticket</h1>
              </div>
              
              <div style="padding: 20px;">
                <h2>Hola ${afterData.userName || "Usuario"},</h2>
                
                <p>Tu ticket de soporte <strong>#${
                  afterData.ticketId
                }</strong> ha sido actualizado.</p>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Estado anterior:</strong> ${getStatusLabel(
                    beforeData.estado
                  )}</p>
                  <p><strong>Estado actual:</strong> <span style="color: #00cccc; font-weight: bold;">${getStatusLabel(
                    afterData.estado
                  )}</span></p>
                </div>
                
                ${
                  afterData.comentarioAdmin
                    ? `
                  <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #0c5460;">Respuesta del equipo de soporte:</h3>
                    <div style="background: white; padding: 10px; border-left: 3px solid #00cccc;">
                      ${afterData.comentarioAdmin.replace(/\n/g, "<br>")}
                    </div>
                  </div>
                `
                    : ""
                }
                
                <p>Puedes ver más detalles en tu panel de usuario.</p>
                
                <p>Gracias por tu paciencia.</p>
                
                <p style="margin-top: 30px;">
                  Saludos,<br>
                  <strong>Equipo de Soporte de De Una</strong>
                </p>
              </div>
              
              <div style="background: #121212; color: white; padding: 15px; text-align: center;">
                <p style="margin: 0;">De Una - Maiko Studios</p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(emailOptions);
        console.log("Email de actualización enviado al usuario");
      }

      return null;
    } catch (error) {
      console.error("Error procesando actualización de ticket:", error);
      throw error;
    }
  });

// Funciones auxiliares
function getSubjectLabel(value) {
  const subjects = {
    qr_no_funciona: "No sirve el QR",
    problemas_premium: "Problemas Función Premium",
    registro_tarjeta: "Registré mi tarjeta pero no aparece",
    problema_pago: "Problema con el pago",
    cuenta_bloqueada: "Mi cuenta está bloqueada",
    cambio_datos: "Quiero cambiar mis datos",
    otro: "Otro",
  };
  return subjects[value] || value;
}

function getStatusLabel(status) {
  const statuses = {
    recibido: "Recibido",
    en_proceso: "En proceso",
    respondido: "Respondido",
    cerrado: "Cerrado",
  };
  return statuses[status] || status;
}

function getStatusIcon(status) {
  const icons = {
    recibido: "📨",
    en_proceso: "⚙️",
    respondido: "💬",
    cerrado: "✅",
  };
  return icons[status] || "🎫";
}

/**
 * ✅ NUEVO: Cloud Function que se ejecuta cuando se crea un nuevo usuario en Auth
 * Implementa el flujo de onboarding automático del plan
 */
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    console.log("🆕 Nuevo usuario creado:", user.email, user.uid);

    // Determinar el origen del registro
    const signUpSource =
      user.providerData && user.providerData.length > 0
        ? user.providerData[0].providerId === "google.com"
          ? "google"
          : "email"
        : "email";

    console.log("📝 Origen del registro:", signUpSource);

    // Crear documento del usuario en Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      rol: "usuario", // Rol por defecto
      isPremium: false,
      planType: "free",
      onboardingCompleted: false,
      idVerificationStatus: "pending",
      userType: "client_deuna",
      associatedProjects: ["deuna"],
      signUpSource: signUpSource,
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Crear el documento del usuario
    await db.collection("users").doc(user.uid).set(userData);
    console.log("✅ Documento de usuario creado en Firestore");

    // Generar landing ID único para la página pública
    const landingId = await generateUniqueLandingId();
    console.log("🔗 Landing ID generado:", landingId);

    // Crear landing pública inicial
    const landingData = {
      landingId: landingId,
      userId: user.uid,
      urlCustomization: landingId, // Usar el mismo ID como slug inicial
      isActive: true,
      designConfig: {
        colors: {
          primary: "#00cccc",
          secondary: "#1c94e0",
        },
        logoUrl: null,
      },
      engagementMetrics: {
        clicksToCopy: 0,
        qrScans: 0,
        whatsappContacts: 0,
        pageViews: 0,
      },
      adDisplayCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("public_landings").doc(landingId).set(landingData);
    console.log("✅ Landing pública creada");

    console.log("🎉 Onboarding automático completado para:", user.email);
  } catch (error) {
    console.error("❌ Error en onboarding automático:", error);
    throw error;
  }
});

/**
 * ✅ NUEVO: Cloud Function para completar el onboarding del usuario
 * Se llama desde UserInfoModal cuando el usuario completa su información
 */
exports.completeUserOnboarding = functions.https.onCall(
  async (data, context) => {
    try {
      // Verificar autenticación
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Usuario no autenticado"
        );
      }

      const userId = context.auth.uid;
      const userEmail = context.auth.token.email;

      console.log("📝 Completando onboarding para usuario:", userEmail);

      // Validar datos requeridos
      const requiredFields = [
        "nombre",
        "apellido",
        "rut",
        "telefono",
        "fechaNacimiento",
        "sexo",
      ];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new functions.https.HttpsError(
            "invalid-argument",
            `Campo requerido faltante: ${field}`
          );
        }
      }

      // Validar datos geográficos
      if (!data.pais) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "País es requerido"
        );
      }

      // Determinar estado de verificación automática
      const verificationStatus = determineVerificationStatus(
        data.pais,
        data.rut
      );
      console.log(
        `🔍 Estado de verificación determinado: ${verificationStatus} para país ${data.pais}`
      );

      // Preparar datos de actualización
      const updateData = {
        // Información personal
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        rut: data.rut.trim(),
        telefono: data.telefono.trim(),
        fechaNacimiento: data.fechaNacimiento,
        sexo: data.sexo,
        empresa: data.empresa ? data.empresa.trim() : null,

        // Información geográfica
        pais: data.pais,
        paisNombre: data.paisNombre || "",
        region: data.region || "",
        regionNombre: data.regionNombre || "",
        provincia: data.provincia || "",
        provinciaNombre: data.provinciaNombre || "",
        comuna: data.comuna || "",
        comunaNombre: data.comunaNombre || "",
        city: data.city || "",

        // Estado de verificación automática
        idVerificationStatus: verificationStatus,

        // Marcar onboarding como completado
        onboardingCompleted: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Actualizar documento del usuario
      await db.collection("users").doc(userId).update(updateData);
      console.log("✅ Información del usuario actualizada");

      // Registrar evento en logs
      const logData = {
        type: "onboarding_completed",
        userId: userId,
        responsibleUid: userId,
        responsibleEmail: userEmail,
        responsibleIpAddress: context.rawRequest?.ip || null,
        responsibleUserAgent:
          context.rawRequest?.headers?.["user-agent"] || null,
        involvedEntityId: null,
        changeDetails: {
          completedFields: Object.keys(updateData),
          country: data.pais,
          hasCompany: !!data.empresa,
        },
        eventDescription: `Usuario completó proceso de onboarding`,
        eventSeverity: "info",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("logs").add(logData);
      console.log("✅ Evento de onboarding registrado en logs");

      // Enviar email de confirmación (opcional)
      try {
        const mailOptions = {
          from: functions.config().email?.user || "noreply@deuna.com",
          to: userEmail,
          subject: "✅ Información completada - De Una Transferencias",
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00cccc, #1c94e0); padding: 2rem; text-align: center;">
              <h1 style="color: white; margin: 0;">¡Información Completada!</h1>
            </div>

            <div style="padding: 2rem; background: #f9f9f9;">
              <h2>Hola ${data.nombre}! 👋</h2>

              <p>Tu información personal ha sido guardada exitosamente en <strong>De Una Transferencias</strong>.</p>

              <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
                <h3>📋 Información registrada:</h3>
                <ul>
                  <li><strong>Nombre:</strong> ${data.nombre} ${
            data.apellido
          }</li>
                  <li><strong>País:</strong> ${
                    data.paisNombre || data.pais
                  }</li>
                  <li><strong>Teléfono:</strong> ${data.telefono}</li>
                  ${
                    data.empresa
                      ? `<li><strong>Empresa:</strong> ${data.empresa}</li>`
                      : ""
                  }
                </ul>
              </div>

              <div style="background: #e8f8f8; padding: 1rem; border-radius: 8px; border-left: 4px solid #00cccc;">
                <p><strong>🎉 ¡Ya puedes usar todas las funciones!</strong></p>
                <p>Ahora puedes crear tus tarjetas bancarias y empezar a recibir transferencias.</p>
              </div>

              <div style="text-align: center; margin: 2rem 0;">
                <a href="https://deuna.maikostudios.com/dashboard"
                   style="background: linear-gradient(135deg, #00cccc, #1c94e0); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Ir a mi Dashboard
                </a>
              </div>
            </div>

            <div style="background: #333; color: white; padding: 1rem; text-align: center; font-size: 0.8rem;">
              <p>© 2024 De Una Transferencias - Maiko Studios</p>
            </div>
          </div>
        `,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email de confirmación enviado");
      } catch (emailError) {
        console.error("❌ Error enviando email de confirmación:", emailError);
        // No fallar la función por error de email
      }

      console.log("🎉 Onboarding completado exitosamente para:", userEmail);

      return {
        success: true,
        message: "Onboarding completado exitosamente",
        userId: userId,
      };
    } catch (error) {
      console.error("❌ Error completando onboarding:", error);

      // Registrar error en logs si es posible
      try {
        if (context.auth) {
          await db.collection("logs").add({
            type: "onboarding_error",
            userId: context.auth.uid,
            responsibleUid: context.auth.uid,
            responsibleEmail: context.auth.token.email,
            responsibleIpAddress: context.rawRequest?.ip || null,
            responsibleUserAgent:
              context.rawRequest?.headers?.["user-agent"] || null,
            involvedEntityId: null,
            changeDetails: {
              error: error.message,
              data: data,
            },
            eventDescription: `Error completando onboarding: ${error.message}`,
            eventSeverity: "error",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (logError) {
        console.error("❌ Error registrando error en logs:", logError);
      }

      // Re-lanzar el error para que el cliente lo reciba
      if (error instanceof functions.https.HttpsError) {
        throw error;
      } else {
        throw new functions.https.HttpsError(
          "internal",
          "Error interno del servidor"
        );
      }
    }
  }
);

/**
 * ✅ NUEVO: Cloud Function para actualizar el estado de verificación de ID
 * Se llama desde el panel de administración para verificar o rechazar usuarios
 */
exports.updateIdVerificationStatus = functions.https.onCall(
  async (data, context) => {
    try {
      // Verificar autenticación
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Usuario no autenticado"
        );
      }

      // Verificar que el usuario sea admin o soporte
      const adminDoc = await db.collection("users").doc(context.auth.uid).get();

      if (!adminDoc.exists) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Usuario no encontrado"
        );
      }

      const adminData = adminDoc.data();
      if (!["admin", "soporte"].includes(adminData.rol)) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "No tienes permisos para realizar esta acción"
        );
      }

      // Validar datos requeridos
      if (!data.userId || !data.newStatus) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "userId y newStatus son requeridos"
        );
      }

      if (!["verified", "rejected"].includes(data.newStatus)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "newStatus debe ser 'verified' o 'rejected'"
        );
      }

      const userId = data.userId;
      const newStatus = data.newStatus;
      const notes = data.notes || "";

      console.log(
        `🔄 Actualizando verificación ID: ${userId} → ${newStatus} por ${context.auth.token.email}`
      );

      // Obtener datos actuales del usuario
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Usuario no encontrado"
        );
      }

      const userData = userDoc.data();
      const oldStatus = userData.idVerificationStatus;

      // Actualizar estado de verificación
      await db.collection("users").doc(userId).update({
        idVerificationStatus: newStatus,
        idVerificationDate: admin.firestore.FieldValue.serverTimestamp(),
        idVerificationBy: context.auth.uid,
        idVerificationNotes: notes,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ Estado de verificación actualizado");

      // Registrar evento en logs
      const logData = {
        type: "id_verification",
        userId: userId,
        responsibleUid: context.auth.uid,
        responsibleEmail: context.auth.token.email,
        responsibleIpAddress: context.rawRequest?.ip || null,
        responsibleUserAgent:
          context.rawRequest?.headers?.["user-agent"] || null,
        involvedEntityId: userId,
        changeDetails: {
          oldStatus: oldStatus,
          newStatus: newStatus,
          notes: notes,
          userEmail: userData.email,
          userName: userData.nombre || userData.displayName,
        },
        eventDescription: `Verificación de ID ${
          newStatus === "verified" ? "aprobada" : "rechazada"
        } para ${userData.email}`,
        eventSeverity: newStatus === "verified" ? "info" : "warning",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("logs").add(logData);
      console.log("✅ Evento de verificación registrado en logs");

      // Enviar notificación al usuario
      try {
        const statusText =
          newStatus === "verified" ? "verificada" : "rechazada";
        const statusIcon = newStatus === "verified" ? "✅" : "❌";
        const statusColor = newStatus === "verified" ? "#4caf50" : "#f44336";

        const mailOptions = {
          from: functions.config().email?.user || "noreply@deuna.com",
          to: userData.email,
          subject: `${statusIcon} Verificación de identidad ${statusText} - De Una Transferencias`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00cccc, #1c94e0); padding: 2rem; text-align: center;">
              <h1 style="color: white; margin: 0;">${statusIcon} Verificación ${
            newStatus === "verified" ? "Aprobada" : "Rechazada"
          }</h1>
            </div>

            <div style="padding: 2rem; background: #f9f9f9;">
              <h2>Hola ${userData.nombre || userData.displayName}! 👋</h2>

              <p>Te informamos sobre el estado de la verificación de tu identidad en <strong>De Una Transferencias</strong>.</p>

              <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid ${statusColor};">
                <h3>${statusIcon} Estado de Verificación</h3>
                <p><strong>Tu identidad ha sido ${statusText}.</strong></p>
                ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ""}
              </div>

              ${
                newStatus === "verified"
                  ? `
                <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px;">
                  <p><strong>🎉 ¡Felicitaciones!</strong></p>
                  <p>Tu cuenta está completamente verificada. Ya puedes usar todas las funciones de De Una sin restricciones.</p>
                </div>
              `
                  : `
                <div style="background: #ffeaea; padding: 1rem; border-radius: 8px;">
                  <p><strong>📋 Próximos pasos:</strong></p>
                  <p>Si crees que esto es un error, puedes contactar a nuestro equipo de soporte para revisar tu caso.</p>
                </div>
              `
              }

              <div style="text-align: center; margin: 2rem 0;">
                <a href="https://deuna.maikostudios.com/dashboard"
                   style="background: linear-gradient(135deg, #00cccc, #1c94e0); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Ir a mi Dashboard
                </a>
              </div>
            </div>

            <div style="background: #333; color: white; padding: 1rem; text-align: center; font-size: 0.8rem;">
              <p>© 2024 De Una Transferencias - Maiko Studios</p>
            </div>
          </div>
        `,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email de notificación enviado");
      } catch (emailError) {
        console.error("❌ Error enviando email de notificación:", emailError);
        // No fallar la función por error de email
      }

      console.log(`🎉 Verificación de ID completada: ${userId} → ${newStatus}`);

      return {
        success: true,
        message: `Verificación ${statusText} exitosamente`,
        userId: userId,
        newStatus: newStatus,
      };
    } catch (error) {
      console.error("❌ Error actualizando verificación de ID:", error);

      // Registrar error en logs si es posible
      try {
        if (context.auth) {
          await db.collection("logs").add({
            type: "id_verification_error",
            userId: data.userId || null,
            responsibleUid: context.auth.uid,
            responsibleEmail: context.auth.token.email,
            responsibleIpAddress: context.rawRequest?.ip || null,
            responsibleUserAgent:
              context.rawRequest?.headers?.["user-agent"] || null,
            involvedEntityId: data.userId || null,
            changeDetails: {
              error: error.message,
              data: data,
            },
            eventDescription: `Error actualizando verificación de ID: ${error.message}`,
            eventSeverity: "error",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (logError) {
        console.error("❌ Error registrando error en logs:", logError);
      }

      // Re-lanzar el error para que el cliente lo reciba
      if (error instanceof functions.https.HttpsError) {
        throw error;
      } else {
        throw new functions.https.HttpsError(
          "internal",
          "Error interno del servidor"
        );
      }
    }
  }
);

/**
 * ✅ ETAPA 4.1: Cloud Function para actualizar rol de usuario de forma segura
 * Solo admins con permisos específicos pueden cambiar roles
 */
exports.updateUserRole = functions.https.onCall(async (data, context) => {
  try {
    // Verificar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Usuario no autenticado"
      );
    }

    const adminUid = context.auth.uid;
    const adminEmail = context.auth.token.email;

    console.log(`🔐 Solicitud de cambio de rol por: ${adminEmail}`);

    // Validar datos requeridos
    if (!data.userId || !data.newRole) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "userId y newRole son requeridos"
      );
    }

    // Validar que el nuevo rol sea válido
    const validRoles = ["admin", "vendedor", "soporte", "usuario"];
    if (!validRoles.includes(data.newRole)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Rol inválido. Debe ser uno de: ${validRoles.join(", ")}`
      );
    }

    // Usar transacción para operación atómica
    const result = await db.runTransaction(async (transaction) => {
      // Verificar permisos del admin que ejecuta la acción
      const adminDoc = await transaction.get(
        db.collection("users").doc(adminUid)
      );

      if (!adminDoc.exists) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Usuario administrador no encontrado"
        );
      }

      const adminData = adminDoc.data();

      // Verificar que sea admin con permisos correctos
      if (adminData.rol !== "admin") {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Solo administradores pueden cambiar roles"
        );
      }

      // ✅ VERIFICAR CONTEXTO DE PERMISOS GRANULARES
      if (
        adminData.userType !== "internal_maiko_studios" ||
        !adminData.associatedProjects?.includes("deuna")
      ) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Permisos insuficientes para esta operación. Se requiere contexto interno de Maiko Studios."
        );
      }

      // ✅ VALIDACIÓN ADICIONAL: Verificar que el admin esté activo
      if (adminData.estado !== "activo") {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Usuario administrador no está activo"
        );
      }

      // Obtener datos actuales del usuario objetivo
      const targetUserDoc = await transaction.get(
        db.collection("users").doc(data.userId)
      );

      if (!targetUserDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Usuario objetivo no encontrado"
        );
      }

      const targetUserData = targetUserDoc.data();
      const oldRole = targetUserData.rol;

      // Prevenir que se cambie el rol del último admin
      if (oldRole === "admin" && data.newRole !== "admin") {
        const adminQuery = await db
          .collection("users")
          .where("rol", "==", "admin")
          .get();

        if (adminQuery.size <= 1) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "No se puede cambiar el rol del último administrador"
          );
        }
      }

      // Actualizar rol del usuario
      const updateData = {
        rol: data.newRole,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastRoleChangeBy: adminUid,
        lastRoleChangeAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      transaction.update(db.collection("users").doc(data.userId), updateData);

      return {
        oldRole,
        newRole: data.newRole,
        targetUserEmail: targetUserData.email,
        targetUserName: targetUserData.nombre || targetUserData.displayName,
      };
    });

    console.log(
      `✅ Rol actualizado: ${result.targetUserEmail} ${result.oldRole} → ${result.newRole}`
    );

    // Registrar evento en logs
    const logData = {
      type: "role_change",
      userId: data.userId,
      responsibleUid: adminUid,
      responsibleEmail: adminEmail,
      responsibleIpAddress: context.rawRequest?.ip || null,
      responsibleUserAgent: context.rawRequest?.headers?.["user-agent"] || null,
      involvedEntityId: data.userId,
      changeDetails: {
        oldRole: result.oldRole,
        newRole: result.newRole,
        targetUserEmail: result.targetUserEmail,
        targetUserName: result.targetUserName,
        reason: data.reason || "No especificado",
      },
      eventDescription: `Rol cambiado de '${result.oldRole}' a '${result.newRole}' para ${result.targetUserEmail}`,
      eventSeverity: "warning",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("logs").add(logData);
    console.log("✅ Evento de cambio de rol registrado en logs");

    // Enviar notificación al usuario afectado
    try {
      const roleNames = {
        admin: "Administrador",
        vendedor: "Vendedor",
        soporte: "Soporte",
        usuario: "Usuario",
      };

      const mailOptions = {
        from: functions.config().email?.user || "noreply@deuna.com",
        to: result.targetUserEmail,
        subject: "🔄 Cambio de rol en tu cuenta - De Una Transferencias",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00cccc, #1c94e0); padding: 2rem; text-align: center;">
              <h1 style="color: white; margin: 0;">🔄 Cambio de Rol</h1>
            </div>

            <div style="padding: 2rem; background: #f9f9f9;">
              <h2>Hola ${result.targetUserName}! 👋</h2>

              <p>Te informamos que tu rol en <strong>De Una Transferencias</strong> ha sido actualizado.</p>

              <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #00cccc;">
                <h3>📋 Cambio Realizado</h3>
                <p><strong>Rol anterior:</strong> ${
                  roleNames[result.oldRole]
                }</p>
                <p><strong>Nuevo rol:</strong> ${roleNames[result.newRole]}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString(
                  "es-CL"
                )}</p>
              </div>

              <div style="background: #e8f8f8; padding: 1rem; border-radius: 8px;">
                <p><strong>ℹ️ ¿Qué significa esto?</strong></p>
                <p>Tu nuevo rol puede incluir diferentes permisos y funcionalidades. Inicia sesión para ver los cambios.</p>
              </div>

              <div style="text-align: center; margin: 2rem 0;">
                <a href="https://deuna.maikostudios.com/dashboard"
                   style="background: linear-gradient(135deg, #00cccc, #1c94e0); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Ir a mi Dashboard
                </a>
              </div>
            </div>

            <div style="background: #333; color: white; padding: 1rem; text-align: center; font-size: 0.8rem;">
              <p>© 2024 De Una Transferencias - Maiko Studios</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Email de notificación de cambio de rol enviado");
    } catch (emailError) {
      console.error("❌ Error enviando email de notificación:", emailError);
      // No fallar la función por error de email
    }

    return {
      success: true,
      message: `Rol actualizado exitosamente de '${result.oldRole}' a '${result.newRole}'`,
      oldRole: result.oldRole,
      newRole: result.newRole,
      userId: data.userId,
    };
  } catch (error) {
    console.error("❌ Error actualizando rol de usuario:", error);

    // Registrar error en logs
    try {
      if (context.auth) {
        await db.collection("logs").add({
          type: "role_change_error",
          userId: data.userId || null,
          responsibleUid: context.auth.uid,
          responsibleEmail: context.auth.token.email,
          responsibleIpAddress: context.rawRequest?.ip || null,
          responsibleUserAgent:
            context.rawRequest?.headers?.["user-agent"] || null,
          involvedEntityId: data.userId || null,
          changeDetails: {
            error: error.message,
            attemptedRole: data.newRole,
            data: data,
          },
          eventDescription: `Error cambiando rol: ${error.message}`,
          eventSeverity: "error",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (logError) {
      console.error("❌ Error registrando error en logs:", logError);
    }

    // Re-lanzar el error
    if (error instanceof functions.https.HttpsError) {
      throw error;
    } else {
      throw new functions.https.HttpsError(
        "internal",
        "Error interno del servidor"
      );
    }
  }
});

/**
 * ✅ ETAPA 4.1: Cloud Function para actualizar plan de usuario de forma segura
 * Solo admins y soporte con permisos específicos pueden cambiar planes
 */
exports.updateUserPlan = functions.https.onCall(async (data, context) => {
  try {
    // Verificar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Usuario no autenticado"
      );
    }

    const adminUid = context.auth.uid;
    const adminEmail = context.auth.token.email;

    console.log(`💎 Solicitud de cambio de plan por: ${adminEmail}`);

    // Validar datos requeridos
    if (!data.userId || typeof data.isPremium !== "boolean") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "userId e isPremium son requeridos"
      );
    }

    // Validar planType si se proporciona
    const validPlanTypes = ["free", "premium", "premium_annual"];
    const planType = data.planType || (data.isPremium ? "premium" : "free");

    if (!validPlanTypes.includes(planType)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Tipo de plan inválido. Debe ser uno de: ${validPlanTypes.join(", ")}`
      );
    }

    // Usar transacción para operación atómica
    const result = await db.runTransaction(async (transaction) => {
      // Verificar permisos del admin que ejecuta la acción
      const adminDoc = await transaction.get(
        db.collection("users").doc(adminUid)
      );

      if (!adminDoc.exists) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Usuario administrador no encontrado"
        );
      }

      const adminData = adminDoc.data();

      // Verificar que sea admin o soporte con permisos correctos
      if (!["admin", "soporte"].includes(adminData.rol)) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Solo administradores y soporte pueden cambiar planes"
        );
      }

      // ✅ VERIFICAR CONTEXTO DE PERMISOS GRANULARES
      if (
        adminData.userType !== "internal_maiko_studios" ||
        !adminData.associatedProjects?.includes("deuna")
      ) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Permisos insuficientes para esta operación. Se requiere contexto interno de Maiko Studios."
        );
      }

      // ✅ VALIDACIÓN ADICIONAL: Verificar que el admin/soporte esté activo
      if (adminData.estado !== "activo") {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Usuario no está activo para realizar esta operación"
        );
      }

      // ✅ VALIDACIÓN ESPECÍFICA PARA SOPORTE: Verificar permisos de plan
      if (adminData.rol === "soporte" && !adminData.permisosCambiarPlan) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Agente de soporte no tiene permisos para cambiar planes"
        );
      }

      // Obtener datos actuales del usuario objetivo
      const targetUserDoc = await transaction.get(
        db.collection("users").doc(data.userId)
      );

      if (!targetUserDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Usuario objetivo no encontrado"
        );
      }

      const targetUserData = targetUserDoc.data();
      const oldPlan = {
        isPremium: targetUserData.isPremium || false,
        planType: targetUserData.planType || "free",
        limiteTarjetas: targetUserData.limiteTarjetas || 1,
      };

      // Calcular nuevos límites y configuraciones
      const newLimiteTarjetas = data.isPremium ? 5 : 1;
      const premiumExpiryDate = data.isPremium
        ? data.expiryDate
          ? new Date(data.expiryDate)
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año por defecto
        : null;

      // Actualizar plan del usuario
      const updateData = {
        isPremium: data.isPremium,
        planType: planType,
        limiteTarjetas: newLimiteTarjetas,
        premiumExpiryDate: premiumExpiryDate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastPlanChangeBy: adminUid,
        lastPlanChangeAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      transaction.update(db.collection("users").doc(data.userId), updateData);

      return {
        oldPlan,
        newPlan: {
          isPremium: data.isPremium,
          planType: planType,
          limiteTarjetas: newLimiteTarjetas,
          expiryDate: premiumExpiryDate,
        },
        targetUserEmail: targetUserData.email,
        targetUserName: targetUserData.nombre || targetUserData.displayName,
      };
    });

    console.log(
      `✅ Plan actualizado: ${result.targetUserEmail} ${result.oldPlan.planType} → ${result.newPlan.planType}`
    );

    // Registrar evento en logs
    const logData = {
      type: "plan_change",
      userId: data.userId,
      responsibleUid: adminUid,
      responsibleEmail: adminEmail,
      responsibleIpAddress: context.rawRequest?.ip || null,
      responsibleUserAgent: context.rawRequest?.headers?.["user-agent"] || null,
      involvedEntityId: data.userId,
      changeDetails: {
        oldPlan: result.oldPlan,
        newPlan: result.newPlan,
        targetUserEmail: result.targetUserEmail,
        targetUserName: result.targetUserName,
        reason: data.reason || "No especificado",
        paymentReference: data.paymentReference || null,
      },
      eventDescription: `Plan cambiado de '${result.oldPlan.planType}' a '${result.newPlan.planType}' para ${result.targetUserEmail}`,
      eventSeverity: "info",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("logs").add(logData);
    console.log("✅ Evento de cambio de plan registrado en logs");

    // Enviar notificación al usuario afectado
    try {
      const planNames = {
        free: "Gratuito",
        premium: "Premium",
        premium_annual: "Premium Anual",
      };

      const isUpgrade = !result.oldPlan.isPremium && result.newPlan.isPremium;
      const isDowngrade = result.oldPlan.isPremium && !result.newPlan.isPremium;

      const mailOptions = {
        from: functions.config().email?.user || "noreply@deuna.com",
        to: result.targetUserEmail,
        subject: `${isUpgrade ? "🎉" : isDowngrade ? "📋" : "🔄"} ${
          isUpgrade
            ? "¡Bienvenido a Premium!"
            : isDowngrade
            ? "Cambio de plan"
            : "Actualización de plan"
        } - De Una Transferencias`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00cccc, #1c94e0); padding: 2rem; text-align: center;">
              <h1 style="color: white; margin: 0;">${
                isUpgrade ? "🎉 ¡Bienvenido a Premium!" : "🔄 Cambio de Plan"
              }</h1>
            </div>

            <div style="padding: 2rem; background: #f9f9f9;">
              <h2>Hola ${result.targetUserName}! 👋</h2>

              <p>Te informamos que tu plan en <strong>De Una Transferencias</strong> ha sido actualizado.</p>

              <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid ${
                isUpgrade ? "#4caf50" : isDowngrade ? "#ff9800" : "#00cccc"
              };">
                <h3>📋 Cambio Realizado</h3>
                <p><strong>Plan anterior:</strong> ${
                  planNames[result.oldPlan.planType]
                }</p>
                <p><strong>Nuevo plan:</strong> ${
                  planNames[result.newPlan.planType]
                }</p>
                <p><strong>Límite de tarjetas:</strong> ${
                  result.newPlan.limiteTarjetas
                } tarjeta${result.newPlan.limiteTarjetas > 1 ? "s" : ""}</p>
                ${
                  result.newPlan.expiryDate
                    ? `<p><strong>Válido hasta:</strong> ${result.newPlan.expiryDate.toLocaleDateString(
                        "es-CL"
                      )}</p>`
                    : ""
                }
              </div>

              ${
                isUpgrade
                  ? `
                <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px;">
                  <p><strong>🎉 ¡Felicitaciones!</strong></p>
                  <p>Ahora tienes acceso a todas las funciones Premium:</p>
                  <ul>
                    <li>Hasta 5 tarjetas bancarias</li>
                    <li>Estadísticas detalladas</li>
                    <li>Personalización avanzada</li>
                    <li>Soporte prioritario</li>
                  </ul>
                </div>
              `
                  : isDowngrade
                  ? `
                <div style="background: #fff3e0; padding: 1rem; border-radius: 8px;">
                  <p><strong>📋 Cambio a plan gratuito</strong></p>
                  <p>Tu cuenta ahora tiene las funciones del plan gratuito. Puedes actualizar a Premium en cualquier momento.</p>
                </div>
              `
                  : `
                <div style="background: #e8f8f8; padding: 1rem; border-radius: 8px;">
                  <p><strong>ℹ️ Plan actualizado</strong></p>
                  <p>Los cambios en tu plan ya están activos. Inicia sesión para ver las nuevas funcionalidades.</p>
                </div>
              `
              }

              <div style="text-align: center; margin: 2rem 0;">
                <a href="https://deuna.maikostudios.com/dashboard"
                   style="background: linear-gradient(135deg, #00cccc, #1c94e0); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Ir a mi Dashboard
                </a>
              </div>
            </div>

            <div style="background: #333; color: white; padding: 1rem; text-align: center; font-size: 0.8rem;">
              <p>© 2024 De Una Transferencias - Maiko Studios</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Email de notificación de cambio de plan enviado");
    } catch (emailError) {
      console.error("❌ Error enviando email de notificación:", emailError);
      // No fallar la función por error de email
    }

    return {
      success: true,
      message: `Plan actualizado exitosamente de '${result.oldPlan.planType}' a '${result.newPlan.planType}'`,
      oldPlan: result.oldPlan,
      newPlan: result.newPlan,
      userId: data.userId,
    };
  } catch (error) {
    console.error("❌ Error actualizando plan de usuario:", error);

    // Registrar error en logs
    try {
      if (context.auth) {
        await db.collection("logs").add({
          type: "plan_change_error",
          userId: data.userId || null,
          responsibleUid: context.auth.uid,
          responsibleEmail: context.auth.token.email,
          responsibleIpAddress: context.rawRequest?.ip || null,
          responsibleUserAgent:
            context.rawRequest?.headers?.["user-agent"] || null,
          involvedEntityId: data.userId || null,
          changeDetails: {
            error: error.message,
            attemptedPlan: {
              isPremium: data.isPremium,
              planType: data.planType,
            },
            data: data,
          },
          eventDescription: `Error cambiando plan: ${error.message}`,
          eventSeverity: "error",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (logError) {
      console.error("❌ Error registrando error en logs:", logError);
    }

    // Re-lanzar el error
    if (error instanceof functions.https.HttpsError) {
      throw error;
    } else {
      throw new functions.https.HttpsError(
        "internal",
        "Error interno del servidor"
      );
    }
  }
});
