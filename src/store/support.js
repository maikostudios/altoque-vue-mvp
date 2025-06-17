import { defineStore } from "pinia";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNotificationsStore } from "./notifications";

export const useSupportStore = defineStore("support", {
  state: () => ({
    tickets: [],
    allTickets: [], // Para el panel de soporte
    loading: false,
    submitting: false,
    error: null,
  }),

  getters: {
    ticketsByStatus: (state) => (status) =>
      state.tickets.filter((ticket) => ticket.estado === status),

    openTickets: (state) =>
      state.tickets.filter((ticket) =>
        ["recibido", "en_proceso"].includes(ticket.estado)
      ),

    closedTickets: (state) =>
      state.tickets.filter((ticket) => ticket.estado === "cerrado"),
  },

  actions: {
    // Cargar tickets del usuario
    async loadUserTickets(userId) {
      if (!userId) return;

      this.loading = true;
      this.error = null;

      try {
        // Consulta simplificada sin orderBy para evitar error de índice
        const q = query(
          collection(db, "tickets"),
          where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(q);
        this.tickets = [];

        querySnapshot.forEach((doc) => {
          this.tickets.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Ordenar en el cliente por fechaCreacion (descendente)
        this.tickets.sort((a, b) => {
          const dateA =
            a.fechaCreacion?.toDate?.() || new Date(a.fechaCreacion || 0);
          const dateB =
            b.fechaCreacion?.toDate?.() || new Date(b.fechaCreacion || 0);
          return dateB - dateA;
        });
      } catch (error) {
        console.error("Error cargando tickets:", error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    // Crear nuevo ticket
    async createTicket(ticketData) {
      this.submitting = true;
      this.error = null;

      try {
        // Generar ID único para el ticket
        const ticketId = `TK${Date.now()}`;

        const newTicket = {
          ticketId,
          userId: ticketData.userId,
          userEmail: ticketData.userEmail,
          userName: ticketData.userName,
          asunto: ticketData.asunto,
          mensaje: ticketData.mensaje,
          estado: "recibido",
          prioridad: ticketData.prioridad || "media", // Alta, Media, Baja
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
          asignadoA: null, // UID del agente de soporte asignado
          fechaAsignacion: null,
          respuesta: null, // Respuesta del soporte
          diasPendientes: 0, // Campo calculado
          historial: [
            {
              estado: "recibido",
              usuario: ticketData.userName,
              mensaje: `Ticket creado: ${ticketData.mensaje}`,
              fecha: new Date(),
              autor: "usuario",
              autorId: ticketData.userId,
            },
          ],
        };

        const docRef = await addDoc(collection(db, "tickets"), newTicket);

        // Crear notificación para el usuario
        const notificationsStore = useNotificationsStore();
        await notificationsStore.createNotification({
          userId: ticketData.userId,
          tipo: "ticket_creado",
          titulo: "Ticket de soporte creado",
          mensaje: `Tu ticket #${ticketId} ha sido recibido. Te contactaremos pronto.`,
          ticketId: docRef.id,
          icono: "🎫",
        });

        // Recargar tickets
        await this.loadUserTickets(ticketData.userId);

        return { success: true, ticketId, docId: docRef.id };
      } catch (error) {
        console.error("Error creando ticket:", error);
        this.error = error.message;
        return { success: false, error: error.message };
      } finally {
        this.submitting = false;
      }
    },

    // Actualizar estado del ticket (para uso administrativo)
    async updateTicketStatus(ticketId, newStatus, comment = "") {
      try {
        const updateData = {
          estado: newStatus,
          fechaActualizacion: serverTimestamp(),
        };

        if (comment) {
          updateData.comentarioAdmin = comment;
        }

        await updateDoc(doc(db, "tickets", ticketId), updateData);

        return { success: true };
      } catch (error) {
        console.error("Error actualizando ticket:", error);
        return { success: false, error: error.message };
      }
    },

    // Cargar todos los tickets (para panel de soporte y admin)
    async loadAllTickets() {
      this.loading = true;
      this.error = null;

      try {
        const q = query(
          collection(db, "tickets"),
          orderBy("fechaCreacion", "desc")
        );

        const querySnapshot = await getDocs(q);
        this.allTickets = [];

        querySnapshot.forEach((doc) => {
          this.allTickets.push({
            id: doc.id,
            ...doc.data(),
          });
        });
      } catch (error) {
        console.error("Error cargando todos los tickets:", error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    // Asignar ticket a un agente de soporte
    async assignTicket(ticketId, supportUserId) {
      try {
        const updateData = {
          asignadoA: supportUserId,
          fechaAsignacion: serverTimestamp(),
          estado: "en_proceso",
          fechaActualizacion: serverTimestamp(),
        };

        await updateDoc(doc(db, "tickets", ticketId), updateData);

        return { success: true };
      } catch (error) {
        console.error("Error asignando ticket:", error);
        return { success: false, error: error.message };
      }
    },

    // Responder a un ticket
    async respondToTicket(ticketId, response, supportUserId) {
      try {
        const updateData = {
          respuesta: response,
          estado: "respondido",
          fechaActualizacion: serverTimestamp(),
        };

        await updateDoc(doc(db, "tickets", ticketId), updateData);

        return { success: true };
      } catch (error) {
        console.error("Error respondiendo ticket:", error);
        return { success: false, error: error.message };
      }
    },

    // Limpiar store
    clearTickets() {
      this.tickets = [];
      this.allTickets = [];
      this.loading = false;
      this.submitting = false;
      this.error = null;
    },
  },
});

// Tipos de asuntos predefinidos
export const TICKET_SUBJECTS = [
  { value: "qr_no_funciona", label: "No sirve el QR" },
  { value: "problemas_premium", label: "Problemas Función Premium" },
  { value: "registro_tarjeta", label: "Registré mi tarjeta pero no aparece" },
  { value: "problema_pago", label: "Problema con el pago" },
  { value: "cuenta_bloqueada", label: "Mi cuenta está bloqueada" },
  { value: "cambio_datos", label: "Quiero cambiar mis datos" },
  { value: "otro", label: "Otro" },
];

// Estados de tickets
export const TICKET_STATUSES = {
  recibido: { label: "Recibido", color: "blue", icon: "📨" },
  en_proceso: { label: "En proceso", color: "yellow", icon: "⚙️" },
  respondido: { label: "Respondido", color: "green", icon: "💬" },
  cerrado: { label: "Cerrado", color: "gray", icon: "✅" },
};

// Prioridades de tickets
export const TICKET_PRIORITIES = {
  alta: { label: "Alta", color: "red", icon: "🔴", sla: 24 }, // 24 horas
  media: { label: "Media", color: "yellow", icon: "🟡", sla: 72 }, // 3 días
  baja: { label: "Baja", color: "green", icon: "🟢", sla: 168 }, // 7 días
};

// Roles de soporte
export const SUPPORT_ROLES = {
  admin: "admin",
  soporte: "soporte",
  usuario: "usuario",
};
