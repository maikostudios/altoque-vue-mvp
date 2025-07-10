// ✅ ETAPA 6: Database Optimization for Scale
// Cloud Functions para mantener colecciones de búsqueda optimizadas

const { onWrite, onDelete } = require('firebase-functions/v2/firestore')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { logger } = require('firebase-functions')

const db = getFirestore()

// ==================== FUNCIONES DE NORMALIZACIÓN ====================

/**
 * Normalizar RUT chileno
 * @param {string} rut - RUT con o sin formato
 * @returns {string} - RUT normalizado (solo números y K)
 */
function normalizeRut(rut) {
  if (!rut) return null
  return rut.toString().replace(/[^0-9kK]/g, '').toLowerCase()
}

/**
 * Normalizar email
 * @param {string} email - Email a normalizar
 * @returns {string} - Email en minúsculas
 */
function normalizeEmail(email) {
  if (!email) return null
  return email.toLowerCase().trim()
}

/**
 * Normalizar teléfono
 * @param {string} phone - Teléfono a normalizar
 * @returns {string} - Solo números
 */
function normalizePhone(phone) {
  if (!phone) return null
  return phone.toString().replace(/[^0-9]/g, '')
}

// ==================== MANTENIMIENTO DE COLECCIONES DE BÚSQUEDA ====================

/**
 * Mantener colecciones de búsqueda cuando un usuario cambia
 */
exports.maintainSearchCollections = onWrite('users/{userId}', async (change, context) => {
  const { userId } = context.params
  const before = change.before.exists ? change.before.data() : null
  const after = change.after.exists ? change.after.data() : null

  logger.info(`Maintaining search collections for user: ${userId}`)

  try {
    // Usar transacción para garantizar atomicidad
    await db.runTransaction(async (transaction) => {
      
      // ==================== CASO: USUARIO ELIMINADO ====================
      if (before && !after) {
        logger.info(`User deleted: ${userId}`)
        
        // Eliminar de colecciones de búsqueda
        if (before.rutNormalized) {
          const rutRef = db.collection('user_by_rut').doc(before.rutNormalized)
          transaction.delete(rutRef)
        }
        
        if (before.emailNormalized) {
          const emailRef = db.collection('user_by_email').doc(before.emailNormalized)
          transaction.delete(emailRef)
        }
        
        if (before.phoneNormalized) {
          const phoneRef = db.collection('user_by_phone').doc(before.phoneNormalized)
          transaction.delete(phoneRef)
        }
        
        return
      }

      // ==================== CASO: USUARIO CREADO O ACTUALIZADO ====================
      const userData = after
      
      // Normalizar campos de búsqueda
      const rutNormalized = normalizeRut(userData.rut)
      const emailNormalized = normalizeEmail(userData.email)
      const phoneNormalized = normalizePhone(userData.telefono || userData.phone)

      // ==================== ACTUALIZAR CAMPOS NORMALIZADOS EN USUARIO ====================
      const userUpdates = {}
      let needsUserUpdate = false

      if (rutNormalized && userData.rutNormalized !== rutNormalized) {
        userUpdates.rutNormalized = rutNormalized
        needsUserUpdate = true
      }

      if (emailNormalized && userData.emailNormalized !== emailNormalized) {
        userUpdates.emailNormalized = emailNormalized
        needsUserUpdate = true
      }

      if (phoneNormalized && userData.phoneNormalized !== phoneNormalized) {
        userUpdates.phoneNormalized = phoneNormalized
        needsUserUpdate = true
      }

      // Actualizar contadores agregados
      if (!userData.totalBankAccountsCount && userData.totalBankAccountsCount !== 0) {
        userUpdates.totalBankAccountsCount = 0
        needsUserUpdate = true
      }

      if (needsUserUpdate) {
        userUpdates.updatedAt = FieldValue.serverTimestamp()
        const userRef = db.collection('users').doc(userId)
        transaction.update(userRef, userUpdates)
      }

      // ==================== MANTENER COLECCIÓN user_by_rut ====================
      if (rutNormalized) {
        // Eliminar entrada anterior si cambió el RUT
        if (before && before.rutNormalized && before.rutNormalized !== rutNormalized) {
          const oldRutRef = db.collection('user_by_rut').doc(before.rutNormalized)
          transaction.delete(oldRutRef)
        }

        // Crear/actualizar nueva entrada
        const rutRef = db.collection('user_by_rut').doc(rutNormalized)
        transaction.set(rutRef, {
          userId,
          rut: userData.rut,
          rutNormalized,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true })
      }

      // ==================== MANTENER COLECCIÓN user_by_email ====================
      if (emailNormalized) {
        // Eliminar entrada anterior si cambió el email
        if (before && before.emailNormalized && before.emailNormalized !== emailNormalized) {
          const oldEmailRef = db.collection('user_by_email').doc(before.emailNormalized)
          transaction.delete(oldEmailRef)
        }

        // Crear/actualizar nueva entrada
        const emailRef = db.collection('user_by_email').doc(emailNormalized)
        transaction.set(emailRef, {
          userId,
          email: userData.email,
          emailNormalized,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true })
      }

      // ==================== MANTENER COLECCIÓN user_by_phone ====================
      if (phoneNormalized) {
        // Eliminar entrada anterior si cambió el teléfono
        if (before && before.phoneNormalized && before.phoneNormalized !== phoneNormalized) {
          const oldPhoneRef = db.collection('user_by_phone').doc(before.phoneNormalized)
          transaction.delete(oldPhoneRef)
        }

        // Crear/actualizar nueva entrada
        const phoneRef = db.collection('user_by_phone').doc(phoneNormalized)
        transaction.set(phoneRef, {
          userId,
          phone: userData.telefono || userData.phone,
          phoneNormalized,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true })
      }

      logger.info(`Search collections updated for user: ${userId}`)
    })

  } catch (error) {
    logger.error(`Error maintaining search collections for user ${userId}:`, error)
    throw error
  }
})

// ==================== CONTADORES AGREGADOS PARA TARJETAS BANCARIAS ====================

/**
 * Incrementar contador cuando se crea una tarjeta bancaria
 */
exports.incrementBankAccountCounter = onWrite('users/{userId}/bank_accounts/{cardId}', async (change, context) => {
  const { userId } = context.params
  const before = change.before.exists
  const after = change.after.exists

  try {
    const userRef = db.collection('users').doc(userId)

    if (!before && after) {
      // Tarjeta creada
      await userRef.update({
        totalBankAccountsCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      })
      
      logger.info(`Bank account counter incremented for user: ${userId}`)
      
    } else if (before && !after) {
      // Tarjeta eliminada
      await userRef.update({
        totalBankAccountsCount: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp()
      })
      
      logger.info(`Bank account counter decremented for user: ${userId}`)
    }

  } catch (error) {
    logger.error(`Error updating bank account counter for user ${userId}:`, error)
    throw error
  }
})

// ==================== FUNCIONES DE BÚSQUEDA OPTIMIZADAS ====================

/**
 * Buscar usuario por RUT (O(1))
 * @param {string} rut - RUT a buscar
 * @returns {Object|null} - Datos del usuario o null
 */
async function findUserByRut(rut) {
  try {
    const rutNormalized = normalizeRut(rut)
    if (!rutNormalized) return null

    // Búsqueda O(1) en colección de lookup
    const lookupDoc = await db.collection('user_by_rut').doc(rutNormalized).get()
    
    if (!lookupDoc.exists) return null

    const { userId } = lookupDoc.data()
    
    // Obtener datos completos del usuario O(1)
    const userDoc = await db.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      // Limpiar entrada huérfana
      await db.collection('user_by_rut').doc(rutNormalized).delete()
      return null
    }

    return {
      id: userId,
      ...userDoc.data()
    }

  } catch (error) {
    logger.error('Error finding user by RUT:', error)
    throw error
  }
}

/**
 * Buscar usuario por email (O(1))
 * @param {string} email - Email a buscar
 * @returns {Object|null} - Datos del usuario o null
 */
async function findUserByEmail(email) {
  try {
    const emailNormalized = normalizeEmail(email)
    if (!emailNormalized) return null

    // Búsqueda O(1) en colección de lookup
    const lookupDoc = await db.collection('user_by_email').doc(emailNormalized).get()
    
    if (!lookupDoc.exists) return null

    const { userId } = lookupDoc.data()
    
    // Obtener datos completos del usuario O(1)
    const userDoc = await db.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      // Limpiar entrada huérfana
      await db.collection('user_by_email').doc(emailNormalized).delete()
      return null
    }

    return {
      id: userId,
      ...userDoc.data()
    }

  } catch (error) {
    logger.error('Error finding user by email:', error)
    throw error
  }
}

/**
 * Buscar usuario por teléfono (O(1))
 * @param {string} phone - Teléfono a buscar
 * @returns {Object|null} - Datos del usuario o null
 */
async function findUserByPhone(phone) {
  try {
    const phoneNormalized = normalizePhone(phone)
    if (!phoneNormalized) return null

    // Búsqueda O(1) en colección de lookup
    const lookupDoc = await db.collection('user_by_phone').doc(phoneNormalized).get()
    
    if (!lookupDoc.exists) return null

    const { userId } = lookupDoc.data()
    
    // Obtener datos completos del usuario O(1)
    const userDoc = await db.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      // Limpiar entrada huérfana
      await db.collection('user_by_phone').doc(phoneNormalized).delete()
      return null
    }

    return {
      id: userId,
      ...userDoc.data()
    }

  } catch (error) {
    logger.error('Error finding user by phone:', error)
    throw error
  }
}

// ==================== FUNCIONES DE MANTENIMIENTO ====================

/**
 * Reconstruir colecciones de búsqueda (para migración/reparación)
 */
exports.rebuildSearchCollections = async () => {
  try {
    logger.info('Starting search collections rebuild...')

    const usersSnapshot = await db.collection('users').get()
    const batch = db.batch()
    let batchCount = 0

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id
      const userData = userDoc.data()

      const rutNormalized = normalizeRut(userData.rut)
      const emailNormalized = normalizeEmail(userData.email)
      const phoneNormalized = normalizePhone(userData.telefono || userData.phone)

      // Crear entradas en colecciones de búsqueda
      if (rutNormalized) {
        const rutRef = db.collection('user_by_rut').doc(rutNormalized)
        batch.set(rutRef, { userId, rut: userData.rut, rutNormalized })
        batchCount++
      }

      if (emailNormalized) {
        const emailRef = db.collection('user_by_email').doc(emailNormalized)
        batch.set(emailRef, { userId, email: userData.email, emailNormalized })
        batchCount++
      }

      if (phoneNormalized) {
        const phoneRef = db.collection('user_by_phone').doc(phoneNormalized)
        batch.set(phoneRef, { userId, phone: userData.telefono || userData.phone, phoneNormalized })
        batchCount++
      }

      // Ejecutar batch cada 500 operaciones
      if (batchCount >= 500) {
        await batch.commit()
        batchCount = 0
      }
    }

    // Ejecutar batch final
    if (batchCount > 0) {
      await batch.commit()
    }

    logger.info('Search collections rebuild completed')

  } catch (error) {
    logger.error('Error rebuilding search collections:', error)
    throw error
  }
}

// Exportar funciones de búsqueda para uso en otras Cloud Functions
module.exports = {
  findUserByRut,
  findUserByEmail,
  findUserByPhone,
  normalizeRut,
  normalizeEmail,
  normalizePhone
}
