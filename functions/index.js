const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Configurar transporter de email (usando Gmail como ejemplo)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: functions.config().email.user, // soporte@maikostudios.com
    pass: functions.config().email.password // App password
  }
});

/**
 * Cloud Function que se ejecuta cuando se crea un nuevo ticket
 * Envía email de notificación al equipo de soporte
 */
exports.onTicketCreated = functions.firestore
  .document('tickets/{ticketId}')
  .onCreate(async (snap, context) => {
    try {
      const ticketData = snap.data();
      const ticketId = context.params.ticketId;

      console.log('Nuevo ticket creado:', ticketId, ticketData);

      // Enviar email al equipo de soporte
      const supportEmailOptions = {
        from: functions.config().email.user,
        to: 'soporte@maikostudios.com',
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
                  <td style="padding: 8px; border: 1px solid #ddd;">${ticketData.ticketId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef; font-weight: bold;">Usuario:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${ticketData.userName || 'No especificado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef; font-weight: bold;">Email:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${ticketData.userEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef; font-weight: bold;">Asunto:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${getSubjectLabel(ticketData.asunto)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef; font-weight: bold;">Estado:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${ticketData.estado}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef; font-weight: bold;">Fecha:</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString('es-CL')}</td>
                </tr>
              </table>
              
              <h3>Mensaje del Usuario:</h3>
              <div style="background: white; padding: 15px; border-left: 4px solid #00cccc; margin: 10px 0;">
                ${ticketData.mensaje.replace(/\n/g, '<br>')}
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
        `
      };

      await transporter.sendMail(supportEmailOptions);
      console.log('Email de notificación enviado al equipo de soporte');

      // Enviar email de confirmación al usuario
      const userEmailOptions = {
        from: functions.config().email.user,
        to: ticketData.userEmail,
        subject: `[De Una] Ticket de Soporte Recibido #${ticketData.ticketId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #00cccc; color: #121212; padding: 20px; text-align: center;">
              <h1>✅ Ticket Recibido</h1>
            </div>
            
            <div style="padding: 20px;">
              <h2>Hola ${ticketData.userName || 'Usuario'},</h2>
              
              <p>Hemos recibido tu solicitud de soporte y te asignamos el ticket <strong>#${ticketData.ticketId}</strong>.</p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #00cccc;">Resumen de tu solicitud:</h3>
                <p><strong>Asunto:</strong> ${getSubjectLabel(ticketData.asunto)}</p>
                <p><strong>Mensaje:</strong></p>
                <div style="background: white; padding: 10px; border-left: 3px solid #00cccc;">
                  ${ticketData.mensaje.replace(/\n/g, '<br>')}
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
        `
      };

      await transporter.sendMail(userEmailOptions);
      console.log('Email de confirmación enviado al usuario');

      return null;

    } catch (error) {
      console.error('Error procesando ticket creado:', error);
      throw error;
    }
  });

/**
 * Cloud Function que se ejecuta cuando se actualiza un ticket
 * Envía notificación al usuario sobre cambios de estado
 */
exports.onTicketUpdated = functions.firestore
  .document('tickets/{ticketId}')
  .onUpdate(async (change, context) => {
    try {
      const beforeData = change.before.data();
      const afterData = change.after.data();
      const ticketId = context.params.ticketId;

      // Solo procesar si cambió el estado
      if (beforeData.estado === afterData.estado) {
        return null;
      }

      console.log('Ticket actualizado:', ticketId, 'Estado:', beforeData.estado, '->', afterData.estado);

      // Crear notificación en Firestore
      await db.collection('notifications').add({
        userId: afterData.userId,
        tipo: 'ticket_actualizado',
        titulo: 'Ticket actualizado',
        mensaje: `Tu ticket #${afterData.ticketId} cambió a estado: ${getStatusLabel(afterData.estado)}`,
        ticketId: ticketId,
        icono: getStatusIcon(afterData.estado),
        fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
        leida: false
      });

      // Enviar email solo para ciertos estados
      if (['respondido', 'cerrado'].includes(afterData.estado)) {
        const emailOptions = {
          from: functions.config().email.user,
          to: afterData.userEmail,
          subject: `[De Una] Actualización de Ticket #${afterData.ticketId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #00cccc; color: #121212; padding: 20px; text-align: center;">
                <h1>📬 Actualización de Ticket</h1>
              </div>
              
              <div style="padding: 20px;">
                <h2>Hola ${afterData.userName || 'Usuario'},</h2>
                
                <p>Tu ticket de soporte <strong>#${afterData.ticketId}</strong> ha sido actualizado.</p>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Estado anterior:</strong> ${getStatusLabel(beforeData.estado)}</p>
                  <p><strong>Estado actual:</strong> <span style="color: #00cccc; font-weight: bold;">${getStatusLabel(afterData.estado)}</span></p>
                </div>
                
                ${afterData.comentarioAdmin ? `
                  <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #0c5460;">Respuesta del equipo de soporte:</h3>
                    <div style="background: white; padding: 10px; border-left: 3px solid #00cccc;">
                      ${afterData.comentarioAdmin.replace(/\n/g, '<br>')}
                    </div>
                  </div>
                ` : ''}
                
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
          `
        };

        await transporter.sendMail(emailOptions);
        console.log('Email de actualización enviado al usuario');
      }

      return null;

    } catch (error) {
      console.error('Error procesando actualización de ticket:', error);
      throw error;
    }
  });

// Funciones auxiliares
function getSubjectLabel(value) {
  const subjects = {
    'qr_no_funciona': 'No sirve el QR',
    'problemas_premium': 'Problemas Función Premium',
    'registro_tarjeta': 'Registré mi tarjeta pero no aparece',
    'problema_pago': 'Problema con el pago',
    'cuenta_bloqueada': 'Mi cuenta está bloqueada',
    'cambio_datos': 'Quiero cambiar mis datos',
    'otro': 'Otro'
  };
  return subjects[value] || value;
}

function getStatusLabel(status) {
  const statuses = {
    'recibido': 'Recibido',
    'en_proceso': 'En proceso',
    'respondido': 'Respondido',
    'cerrado': 'Cerrado'
  };
  return statuses[status] || status;
}

function getStatusIcon(status) {
  const icons = {
    'recibido': '📨',
    'en_proceso': '⚙️',
    'respondido': '💬',
    'cerrado': '✅'
  };
  return icons[status] || '🎫';
}
