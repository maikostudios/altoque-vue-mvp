// Servicio para manejar configuraciones del sistema
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/firebase'

export const settingsService = {
  // Obtener configuraciones generales
  async getGeneralSettings() {
    try {
      const docRef = doc(db, 'settings', 'general')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      } else {
        // Crear configuraciones por defecto si no existen
        const defaultSettings = {
          nombreApp: 'Altoque App',
          emailContacto: 'admin@altoque.com',
          modoMantenimiento: false,
          version: '1.0.0',
          fechaActualizacion: serverTimestamp()
        }
        await setDoc(docRef, defaultSettings)
        return defaultSettings
      }
    } catch (error) {
      console.error('Error obteniendo configuraciones generales:', error)
      throw error
    }
  },

  // Obtener configuraciones de seguridad
  async getSecuritySettings() {
    try {
      const docRef = doc(db, 'settings', 'security')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      } else {
        const defaultSettings = {
          tiempoSesion: 60,
          autenticacionDosFactor: false,
          logsAuditoria: true,
          intentosMaximoLogin: 5,
          fechaActualizacion: serverTimestamp()
        }
        await setDoc(docRef, defaultSettings)
        return defaultSettings
      }
    } catch (error) {
      console.error('Error obteniendo configuraciones de seguridad:', error)
      throw error
    }
  },

  // Obtener configuraciones de notificaciones
  async getNotificationSettings() {
    try {
      const docRef = doc(db, 'settings', 'notifications')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      } else {
        const defaultSettings = {
          notificacionesEmail: true,
          notificacionesPush: false,
          frecuenciaReportes: 'semanal',
          emailReportes: 'reports@altoque.com',
          fechaActualizacion: serverTimestamp()
        }
        await setDoc(docRef, defaultSettings)
        return defaultSettings
      }
    } catch (error) {
      console.error('Error obteniendo configuraciones de notificaciones:', error)
      throw error
    }
  },

  // Obtener todas las configuraciones
  async getAllSettings() {
    try {
      const [general, security, notifications] = await Promise.all([
        this.getGeneralSettings(),
        this.getSecuritySettings(),
        this.getNotificationSettings()
      ])

      return {
        general,
        security,
        notifications
      }
    } catch (error) {
      console.error('Error obteniendo todas las configuraciones:', error)
      throw error
    }
  },

  // Actualizar configuraciones generales
  async updateGeneralSettings(settings) {
    try {
      const docRef = doc(db, 'settings', 'general')
      const updateData = {
        ...settings,
        fechaActualizacion: serverTimestamp()
      }
      
      await updateDoc(docRef, updateData)
      return true
    } catch (error) {
      console.error('Error actualizando configuraciones generales:', error)
      throw error
    }
  },

  // Actualizar configuraciones de seguridad
  async updateSecuritySettings(settings) {
    try {
      const docRef = doc(db, 'settings', 'security')
      const updateData = {
        ...settings,
        fechaActualizacion: serverTimestamp()
      }
      
      await updateDoc(docRef, updateData)
      return true
    } catch (error) {
      console.error('Error actualizando configuraciones de seguridad:', error)
      throw error
    }
  },

  // Actualizar configuraciones de notificaciones
  async updateNotificationSettings(settings) {
    try {
      const docRef = doc(db, 'settings', 'notifications')
      const updateData = {
        ...settings,
        fechaActualizacion: serverTimestamp()
      }
      
      await updateDoc(docRef, updateData)
      return true
    } catch (error) {
      console.error('Error actualizando configuraciones de notificaciones:', error)
      throw error
    }
  },

  // Activar/desactivar modo mantenimiento
  async toggleMaintenanceMode(enabled) {
    try {
      const docRef = doc(db, 'settings', 'general')
      await updateDoc(docRef, {
        modoMantenimiento: enabled,
        fechaActualizacion: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Error cambiando modo mantenimiento:', error)
      throw error
    }
  },

  // Restablecer configuraciones a valores por defecto
  async resetToDefaults(settingType) {
    try {
      let defaultSettings = {}
      let docRef = null

      switch (settingType) {
        case 'general':
          defaultSettings = {
            nombreApp: 'Altoque App',
            emailContacto: 'admin@altoque.com',
            modoMantenimiento: false,
            version: '1.0.0',
            fechaActualizacion: serverTimestamp()
          }
          docRef = doc(db, 'settings', 'general')
          break

        case 'security':
          defaultSettings = {
            tiempoSesion: 60,
            autenticacionDosFactor: false,
            logsAuditoria: true,
            intentosMaximoLogin: 5,
            fechaActualizacion: serverTimestamp()
          }
          docRef = doc(db, 'settings', 'security')
          break

        case 'notifications':
          defaultSettings = {
            notificacionesEmail: true,
            notificacionesPush: false,
            frecuenciaReportes: 'semanal',
            emailReportes: 'reports@altoque.com',
            fechaActualizacion: serverTimestamp()
          }
          docRef = doc(db, 'settings', 'notifications')
          break

        default:
          throw new Error('Tipo de configuración no válido')
      }

      await setDoc(docRef, defaultSettings)
      return true
    } catch (error) {
      console.error('Error restableciendo configuraciones:', error)
      throw error
    }
  }
}
