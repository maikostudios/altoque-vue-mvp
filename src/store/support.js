import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { useNotificationsStore } from './notifications'

export const useSupportStore = defineStore('support', {
  state: () => ({
    tickets: [],
    loading: false,
    submitting: false,
    error: null
  }),

  getters: {
    ticketsByStatus: (state) => (status) => 
      state.tickets.filter(ticket => ticket.estado === status),
    
    openTickets: (state) => 
      state.tickets.filter(ticket => ['recibido', 'en_proceso'].includes(ticket.estado)),
    
    closedTickets: (state) => 
      state.tickets.filter(ticket => ticket.estado === 'cerrado')
  },

  actions: {
    // Cargar tickets del usuario
    async loadUserTickets(userId) {
      if (!userId) return

      this.loading = true
      this.error = null

      try {
        const q = query(
          collection(db, 'tickets'),
          where('userId', '==', userId),
          orderBy('fechaCreacion', 'desc')
        )

        const querySnapshot = await getDocs(q)
        this.tickets = []

        querySnapshot.forEach((doc) => {
          this.tickets.push({
            id: doc.id,
            ...doc.data()
          })
        })

      } catch (error) {
        console.error('Error cargando tickets:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Crear nuevo ticket
    async createTicket(ticketData) {
      this.submitting = true
      this.error = null

      try {
        // Generar ID único para el ticket
        const ticketId = `TK${Date.now()}`
        
        const newTicket = {
          ticketId,
          userId: ticketData.userId,
          userEmail: ticketData.userEmail,
          userName: ticketData.userName,
          asunto: ticketData.asunto,
          mensaje: ticketData.mensaje,
          estado: 'recibido',
          prioridad: 'normal',
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
          historial: [{
            accion: 'creado',
            descripcion: 'Ticket creado por el usuario',
            fecha: serverTimestamp(),
            autor: 'usuario'
          }]
        }

        const docRef = await addDoc(collection(db, 'tickets'), newTicket)
        
        // Crear notificación para el usuario
        const notificationsStore = useNotificationsStore()
        await notificationsStore.createNotification({
          userId: ticketData.userId,
          tipo: 'ticket_creado',
          titulo: 'Ticket de soporte creado',
          mensaje: `Tu ticket #${ticketId} ha sido recibido. Te contactaremos pronto.`,
          ticketId: docRef.id,
          icono: '🎫'
        })

        // Recargar tickets
        await this.loadUserTickets(ticketData.userId)

        return { success: true, ticketId, docId: docRef.id }

      } catch (error) {
        console.error('Error creando ticket:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.submitting = false
      }
    },

    // Actualizar estado del ticket (para uso administrativo)
    async updateTicketStatus(ticketId, newStatus, comment = '') {
      try {
        const updateData = {
          estado: newStatus,
          fechaActualizacion: serverTimestamp()
        }

        if (comment) {
          updateData.comentarioAdmin = comment
        }

        await updateDoc(doc(db, 'tickets', ticketId), updateData)
        
        return { success: true }
      } catch (error) {
        console.error('Error actualizando ticket:', error)
        return { success: false, error: error.message }
      }
    },

    // Limpiar store
    clearTickets() {
      this.tickets = []
      this.loading = false
      this.submitting = false
      this.error = null
    }
  }
})

// Tipos de asuntos predefinidos
export const TICKET_SUBJECTS = [
  { value: 'qr_no_funciona', label: 'No sirve el QR' },
  { value: 'problemas_premium', label: 'Problemas Función Premium' },
  { value: 'registro_tarjeta', label: 'Registré mi tarjeta pero no aparece' },
  { value: 'problema_pago', label: 'Problema con el pago' },
  { value: 'cuenta_bloqueada', label: 'Mi cuenta está bloqueada' },
  { value: 'cambio_datos', label: 'Quiero cambiar mis datos' },
  { value: 'otro', label: 'Otro' }
]

// Estados de tickets
export const TICKET_STATUSES = {
  recibido: { label: 'Recibido', color: 'blue', icon: '📨' },
  en_proceso: { label: 'En proceso', color: 'yellow', icon: '⚙️' },
  respondido: { label: 'Respondido', color: 'green', icon: '💬' },
  cerrado: { label: 'Cerrado', color: 'gray', icon: '✅' }
}
