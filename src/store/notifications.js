import { defineStore } from "pinia";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  }),

  getters: {
    unreadNotifications: (state) => state.notifications.filter((n) => !n.leida),
    readNotifications: (state) => state.notifications.filter((n) => n.leida),
    hasUnread: (state) => state.unreadCount > 0,
  },

  actions: {
    // Inicializar listener de notificaciones para un usuario
    initNotificationsListener(userId) {
      if (!userId) return;

      this.loading = true;

      // Consulta simplificada sin orderBy para evitar error de índice
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId)
      );

      // Listener en tiempo real
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          this.notifications = [];
          this.unreadCount = 0;

          snapshot.forEach((doc) => {
            const notification = {
              id: doc.id,
              ...doc.data(),
            };
            this.notifications.push(notification);

            if (!notification.leida) {
              this.unreadCount++;
            }
          });

          // Ordenar en el cliente por fechaCreacion (descendente)
          this.notifications.sort((a, b) => {
            const dateA =
              a.fechaCreacion?.toDate?.() || new Date(a.fechaCreacion || 0);
            const dateB =
              b.fechaCreacion?.toDate?.() || new Date(b.fechaCreacion || 0);
            return dateB - dateA;
          });

          this.loading = false;
          this.error = null;
        },
        (error) => {
          console.error("Error en listener de notificaciones:", error);
          this.error = error.message;
          this.loading = false;
        }
      );

      return unsubscribe;
    },

    // Marcar notificación como leída
    async markAsRead(notificationId) {
      try {
        await updateDoc(doc(db, "notifications", notificationId), {
          leida: true,
          fechaLectura: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error marcando notificación como leída:", error);
        this.error = error.message;
      }
    },

    // Marcar todas las notificaciones como leídas
    async markAllAsRead(userId) {
      try {
        const unreadNotifications = this.notifications.filter(
          (n) => !n.leida && n.userId === userId
        );

        const promises = unreadNotifications.map((notification) =>
          updateDoc(doc(db, "notifications", notification.id), {
            leida: true,
            fechaLectura: serverTimestamp(),
          })
        );

        await Promise.all(promises);
      } catch (error) {
        console.error(
          "Error marcando todas las notificaciones como leídas:",
          error
        );
        this.error = error.message;
      }
    },

    // Crear nueva notificación (para uso interno del sistema)
    async createNotification(notificationData) {
      try {
        const docRef = await addDoc(collection(db, "notifications"), {
          ...notificationData,
          fechaCreacion: serverTimestamp(),
          leida: false,
        });

        return docRef.id;
      } catch (error) {
        console.error("Error creando notificación:", error);
        this.error = error.message;
        throw error;
      }
    },

    // Limpiar store
    clearNotifications() {
      this.notifications = [];
      this.unreadCount = 0;
      this.loading = false;
      this.error = null;
    },
  },
});
