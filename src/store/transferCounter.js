import { defineStore } from 'pinia'
import { ref } from 'vue'
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/firebase'

export const useTransferCounterStore = defineStore('transferCounter', () => {
    const count = ref(0)
    const loading = ref(false)
    const error = ref(null)

    // Cargar contador desde Firebase
    const loadCounter = async () => {
        try {
            loading.value = true
            error.value = null

            const counterDoc = await getDoc(doc(db, 'metrics', 'transferCounter'))
            
            if (counterDoc.exists()) {
                count.value = counterDoc.data().count || 0
            } else {
                // Si no existe, crear con valor inicial
                await setInitialCount(25134) // Número inicial atractivo
            }
        } catch (err) {
            console.error('Error cargando contador:', err)
            error.value = 'Error al cargar contador'
            // Usar valor local como fallback
            const localCount = localStorage.getItem('transferCounter')
            if (localCount) {
                count.value = parseInt(localCount)
            }
        } finally {
            loading.value = false
        }
    }

    // Establecer contador inicial
    const setInitialCount = async (initialValue = 25134) => {
        try {
            await setDoc(doc(db, 'metrics', 'transferCounter'), {
                count: initialValue,
                lastUpdated: new Date(),
                createdAt: new Date()
            })
            count.value = initialValue
            
            // Guardar también en localStorage como backup
            localStorage.setItem('transferCounter', initialValue.toString())
        } catch (err) {
            console.error('Error estableciendo contador inicial:', err)
            // Fallback a localStorage
            count.value = initialValue
            localStorage.setItem('transferCounter', initialValue.toString())
        }
    }

    // Incrementar contador
    const incrementCounter = async () => {
        try {
            // Incrementar localmente primero para UX inmediata
            count.value += 1
            
            // Guardar en localStorage como backup
            localStorage.setItem('transferCounter', count.value.toString())

            // Intentar actualizar en Firebase
            await updateDoc(doc(db, 'metrics', 'transferCounter'), {
                count: increment(1),
                lastUpdated: new Date()
            })

            console.log('✅ Contador incrementado:', count.value)
        } catch (err) {
            console.error('Error incrementando contador:', err)
            // El contador ya se incrementó localmente, así que no hay problema
            // Firebase se sincronizará cuando esté disponible
        }
    }

    // Sincronizar con Firebase (para casos de reconexión)
    const syncCounter = async () => {
        try {
            const counterDoc = await getDoc(doc(db, 'metrics', 'transferCounter'))
            
            if (counterDoc.exists()) {
                const firebaseCount = counterDoc.data().count || 0
                const localCount = parseInt(localStorage.getItem('transferCounter') || '0')
                
                // Usar el mayor de los dos valores
                const maxCount = Math.max(firebaseCount, localCount)
                
                if (maxCount !== firebaseCount) {
                    // Actualizar Firebase con el valor local si es mayor
                    await updateDoc(doc(db, 'metrics', 'transferCounter'), {
                        count: maxCount,
                        lastUpdated: new Date()
                    })
                }
                
                count.value = maxCount
                localStorage.setItem('transferCounter', maxCount.toString())
            }
        } catch (err) {
            console.error('Error sincronizando contador:', err)
        }
    }

    // Obtener estadísticas adicionales
    const getCounterStats = async () => {
        try {
            const counterDoc = await getDoc(doc(db, 'metrics', 'transferCounter'))
            
            if (counterDoc.exists()) {
                return {
                    count: counterDoc.data().count || 0,
                    lastUpdated: counterDoc.data().lastUpdated?.toDate(),
                    createdAt: counterDoc.data().createdAt?.toDate()
                }
            }
            
            return null
        } catch (err) {
            console.error('Error obteniendo estadísticas:', err)
            return null
        }
    }

    // Simular incremento para demostración (solo desarrollo)
    const simulateIncrement = () => {
        if (import.meta.env.DEV) {
            incrementCounter()
        }
    }

    // Auto-incremento aleatorio para simular actividad (solo desarrollo)
    const startAutoIncrement = () => {
        if (import.meta.env.DEV) {
            setInterval(() => {
                // Incrementar aleatoriamente cada 10-30 segundos
                if (Math.random() < 0.1) { // 10% de probabilidad cada segundo
                    incrementCounter()
                }
            }, 1000)
        }
    }

    return {
        count,
        loading,
        error,
        loadCounter,
        setInitialCount,
        incrementCounter,
        syncCounter,
        getCounterStats,
        simulateIncrement,
        startAutoIncrement
    }
})

// Función global para incrementar desde cualquier componente
export const incrementTransferCounter = () => {
    const store = useTransferCounterStore()
    store.incrementCounter()
}
