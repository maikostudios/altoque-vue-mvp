// Servicio para manejar cuentas bancarias
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

export const bankAccountService = {
  // Obtener todas las cuentas bancarias
  async getAllBankAccounts() {
    try {
      const q = query(collection(db, 'bank_accounts'), orderBy('fechaCreacion', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error obteniendo cuentas bancarias:', error)
      throw error
    }
  },

  // Obtener cuenta bancaria por ID
  async getBankAccountById(accountId) {
    try {
      const docRef = doc(db, 'bank_accounts', accountId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        }
      } else {
        throw new Error('Cuenta bancaria no encontrada')
      }
    } catch (error) {
      console.error('Error obteniendo cuenta bancaria:', error)
      throw error
    }
  },

  // Buscar cuentas por titular
  async getBankAccountsByTitular(rutTitular) {
    try {
      const q = query(collection(db, 'bank_accounts'), where('rutTitular', '==', rutTitular))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error buscando cuentas por titular:', error)
      throw error
    }
  },

  // Crear nueva cuenta bancaria
  async createBankAccount(accountData) {
    try {
      const newAccount = {
        ...accountData,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        estado: 'activa',
        saldo: accountData.saldo || 0,
        creadoPor: 'admin'
      }
      
      const docRef = await addDoc(collection(db, 'bank_accounts'), newAccount)
      return docRef.id
    } catch (error) {
      console.error('Error creando cuenta bancaria:', error)
      throw error
    }
  },

  // Actualizar cuenta bancaria
  async updateBankAccount(accountId, accountData) {
    try {
      const docRef = doc(db, 'bank_accounts', accountId)
      const updateData = {
        ...accountData,
        fechaActualizacion: serverTimestamp()
      }
      
      await updateDoc(docRef, updateData)
      return true
    } catch (error) {
      console.error('Error actualizando cuenta bancaria:', error)
      throw error
    }
  },

  // Eliminar cuenta bancaria
  async deleteBankAccount(accountId) {
    try {
      await deleteDoc(doc(db, 'bank_accounts', accountId))
      return true
    } catch (error) {
      console.error('Error eliminando cuenta bancaria:', error)
      throw error
    }
  },

  // Cambiar estado de cuenta
  async changeAccountStatus(accountId, newStatus) {
    try {
      const docRef = doc(db, 'bank_accounts', accountId)
      await updateDoc(docRef, {
        estado: newStatus,
        fechaActualizacion: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Error cambiando estado de cuenta:', error)
      throw error
    }
  },

  // Obtener estadísticas de cuentas bancarias
  async getBankAccountStats() {
    try {
      const allAccounts = await this.getAllBankAccounts()
      
      const stats = {
        total: allAccounts.length,
        activas: allAccounts.filter(account => account.estado === 'activa').length,
        bloqueadas: allAccounts.filter(account => account.estado === 'bloqueada').length,
        inactivas: allAccounts.filter(account => account.estado === 'inactiva').length,
        saldoTotal: allAccounts.reduce((total, account) => total + (account.saldo || 0), 0),
        porBanco: this.groupByBank(allAccounts),
        porTipoCuenta: this.groupByAccountType(allAccounts)
      }
      
      return stats
    } catch (error) {
      console.error('Error obteniendo estadísticas de cuentas:', error)
      throw error
    }
  },

  // Agrupar cuentas por banco
  groupByBank(accounts) {
    const banks = {}
    accounts.forEach(account => {
      const bank = account.nombreBanco || 'Sin especificar'
      banks[bank] = (banks[bank] || 0) + 1
    })
    return banks
  },

  // Agrupar cuentas por tipo
  groupByAccountType(accounts) {
    const types = {}
    accounts.forEach(account => {
      const type = account.tipoCuenta || 'Sin especificar'
      types[type] = (types[type] || 0) + 1
    })
    return types
  },

  // Formatear número de cuenta (ocultar dígitos)
  formatAccountNumber(accountNumber) {
    if (!accountNumber) return ''
    const str = accountNumber.toString()
    if (str.length <= 4) return str
    return '*'.repeat(str.length - 4) + str.slice(-4)
  },

  // Formatear saldo como moneda
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount || 0)
  }
}
