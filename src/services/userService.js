// Servicio para manejar usuarios
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/firebase'

export const userService = {
  // Obtener todos los usuarios
  async getAllUsers() {
    try {
      const q = query(collection(db, 'users'), orderBy('fechaRegistro', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error obteniendo usuarios:', error)
      throw error
    }
  },

  // Obtener usuario por ID
  async getUserById(userId) {
    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        }
      } else {
        throw new Error('Usuario no encontrado')
      }
    } catch (error) {
      console.error('Error obteniendo usuario:', error)
      throw error
    }
  },

  // Buscar usuarios por email
  async getUserByEmail(email) {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return {
          id: doc.id,
          ...doc.data()
        }
      } else {
        return null
      }
    } catch (error) {
      console.error('Error buscando usuario por email:', error)
      throw error
    }
  },

  // Crear nuevo usuario
  async createUser(userData) {
    try {
      const newUser = {
        ...userData,
        fechaRegistro: serverTimestamp(),
        ultimoAcceso: serverTimestamp(),
        estado: 'activo',
        creadoPor: 'admin'
      }
      
      const docRef = await addDoc(collection(db, 'users'), newUser)
      return docRef.id
    } catch (error) {
      console.error('Error creando usuario:', error)
      throw error
    }
  },

  // Actualizar usuario
  async updateUser(userId, userData) {
    try {
      const docRef = doc(db, 'users', userId)
      const updateData = {
        ...userData,
        fechaActualizacion: serverTimestamp()
      }
      
      await updateDoc(docRef, updateData)
      return true
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      throw error
    }
  },

  // Eliminar usuario
  async deleteUser(userId) {
    try {
      await deleteDoc(doc(db, 'users', userId))
      return true
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      throw error
    }
  },

  // Obtener estadísticas de usuarios
  async getUserStats() {
    try {
      const allUsers = await this.getAllUsers()
      
      const stats = {
        total: allUsers.length,
        activos: allUsers.filter(user => user.estado === 'activo').length,
        inactivos: allUsers.filter(user => user.estado === 'inactivo').length,
        admins: allUsers.filter(user => user.role === 'admin').length,
        vendedores: allUsers.filter(user => user.role === 'vendedor').length,
        usuarios: allUsers.filter(user => user.role === 'user').length,
        porRegion: this.groupByRegion(allUsers),
        porEdad: this.groupByAge(allUsers)
      }
      
      return stats
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      throw error
    }
  },

  // Agrupar usuarios por región
  groupByRegion(users) {
    const regions = {}
    users.forEach(user => {
      const region = user.region || 'Sin especificar'
      regions[region] = (regions[region] || 0) + 1
    })
    return regions
  },

  // Agrupar usuarios por edad
  groupByAge(users) {
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46+': 0
    }
    
    users.forEach(user => {
      if (user.fechaNacimiento) {
        const birthDate = user.fechaNacimiento.toDate ? user.fechaNacimiento.toDate() : new Date(user.fechaNacimiento)
        const age = new Date().getFullYear() - birthDate.getFullYear()
        
        if (age >= 18 && age <= 25) ageGroups['18-25']++
        else if (age >= 26 && age <= 35) ageGroups['26-35']++
        else if (age >= 36 && age <= 45) ageGroups['36-45']++
        else if (age >= 46) ageGroups['46+']++
      }
    })
    
    return ageGroups
  }
}
