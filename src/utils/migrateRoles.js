// Script de migración para estandarizar el campo 'rol' en Firebase
import { db } from '@/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

export const migrateUserRoles = async () => {
    console.log('🔄 Iniciando migración de roles...')
    
    try {
        // Obtener todos los usuarios
        const usersSnapshot = await getDocs(collection(db, 'users'))
        let migratedCount = 0
        let totalUsers = usersSnapshot.docs.length
        
        console.log(`📊 Total de usuarios a revisar: ${totalUsers}`)
        
        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data()
            const userId = userDoc.id
            
            // Verificar si necesita migración
            let needsMigration = false
            let newRol = null
            
            if (userData.role && !userData.rol) {
                // Tiene 'role' pero no 'rol' - migrar
                newRol = userData.role
                needsMigration = true
                console.log(`🔄 Migrando ${userData.email}: role="${userData.role}" → rol="${newRol}"`)
            } else if (!userData.role && !userData.rol) {
                // No tiene ningún rol - asignar por defecto
                newRol = 'usuario'
                needsMigration = true
                console.log(`➕ Asignando rol por defecto a ${userData.email}: rol="${newRol}"`)
            } else if (userData.rol) {
                // Ya tiene 'rol' - verificar si es válido
                const validRoles = ['admin', 'vendedor', 'usuario']
                if (!validRoles.includes(userData.rol)) {
                    newRol = 'usuario'
                    needsMigration = true
                    console.log(`🔧 Corrigiendo rol inválido para ${userData.email}: "${userData.rol}" → "${newRol}"`)
                } else {
                    console.log(`✅ ${userData.email} ya tiene rol válido: "${userData.rol}"`)
                }
            }
            
            // Realizar migración si es necesaria
            if (needsMigration && newRol) {
                try {
                    await updateDoc(doc(db, 'users', userId), {
                        rol: newRol
                    })
                    migratedCount++
                    console.log(`✅ Migrado: ${userData.email}`)
                } catch (error) {
                    console.error(`❌ Error migrando ${userData.email}:`, error)
                }
            }
        }
        
        console.log(`🎉 Migración completada:`)
        console.log(`   - Total usuarios: ${totalUsers}`)
        console.log(`   - Migrados: ${migratedCount}`)
        console.log(`   - Sin cambios: ${totalUsers - migratedCount}`)
        
        return {
            total: totalUsers,
            migrated: migratedCount,
            unchanged: totalUsers - migratedCount
        }
        
    } catch (error) {
        console.error('❌ Error en migración:', error)
        throw error
    }
}

// Función para verificar el estado actual de los roles
export const checkRoleStatus = async () => {
    console.log('🔍 Verificando estado de roles...')
    
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const stats = {
            total: 0,
            withRol: 0,
            withRole: 0,
            withBoth: 0,
            withNeither: 0,
            roleDistribution: {
                admin: 0,
                vendedor: 0,
                usuario: 0,
                other: 0
            }
        }
        
        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data()
            stats.total++
            
            const hasRol = !!userData.rol
            const hasRole = !!userData.role
            
            if (hasRol && hasRole) stats.withBoth++
            else if (hasRol) stats.withRol++
            else if (hasRole) stats.withRole++
            else stats.withNeither++
            
            // Contar distribución por rol
            const currentRol = userData.rol || userData.role || 'unknown'
            if (stats.roleDistribution.hasOwnProperty(currentRol)) {
                stats.roleDistribution[currentRol]++
            } else {
                stats.roleDistribution.other++
            }
        }
        
        console.log('📊 Estado actual de roles:')
        console.log(`   Total usuarios: ${stats.total}`)
        console.log(`   Con campo 'rol': ${stats.withRol}`)
        console.log(`   Con campo 'role': ${stats.withRole}`)
        console.log(`   Con ambos campos: ${stats.withBoth}`)
        console.log(`   Sin ningún campo: ${stats.withNeither}`)
        console.log('📈 Distribución de roles:')
        console.log(`   Admin: ${stats.roleDistribution.admin}`)
        console.log(`   Vendedor: ${stats.roleDistribution.vendedor}`)
        console.log(`   Usuario: ${stats.roleDistribution.usuario}`)
        console.log(`   Otros: ${stats.roleDistribution.other}`)
        
        return stats
        
    } catch (error) {
        console.error('❌ Error verificando roles:', error)
        throw error
    }
}
