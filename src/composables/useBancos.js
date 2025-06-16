import { ref, computed } from 'vue'
import bancosData from '@/data/bancos-chile.json'

export function useBancos() {
    const bancos = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Cargar bancos desde el archivo JSON
    const loadBancos = async () => {
        try {
            loading.value = true
            error.value = null
            
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 300))
            
            // Cargar datos del archivo JSON
            bancos.value = bancosData
            
            console.log('✅ Bancos cargados:', bancos.value.length)
            
        } catch (err) {
            console.error('❌ Error cargando bancos:', err)
            error.value = 'Error al cargar la lista de bancos'
        } finally {
            loading.value = false
        }
    }

    // Computed para filtrar por tipo
    const bancosTradicionles = computed(() => {
        return bancos.value.filter(banco => banco.type === 'BANK')
    })

    const wallets = computed(() => {
        return bancos.value.filter(banco => banco.type === 'WALLET')
    })

    const tarjetasPrepagadas = computed(() => {
        return bancos.value.filter(banco => banco.type === 'PREPAID_CARD')
    })

    // Computed para todos los bancos agrupados
    const bancosAgrupados = computed(() => {
        return [
            {
                label: '🏦 Bancos Tradicionales',
                options: bancosTradicionles.value
            },
            {
                label: '💳 Wallets Digitales',
                options: wallets.value
            },
            {
                label: '🎫 Tarjetas Prepagadas',
                options: tarjetasPrepagadas.value
            }
        ].filter(group => group.options.length > 0)
    })

    // Función para buscar banco por código
    const findBancoByCode = (bankCode) => {
        return bancos.value.find(banco => banco.bankCode === bankCode)
    }

    // Función para buscar banco por nombre
    const findBancoByName = (bankName) => {
        return bancos.value.find(banco => banco.bankName === bankName)
    }

    // Función para obtener icono por tipo
    const getBancoIcon = (type) => {
        const icons = {
            'BANK': '🏦',
            'WALLET': '💳',
            'PREPAID_CARD': '🎫'
        }
        return icons[type] || '🏦'
    }

    // Función para obtener color por tipo
    const getBancoColor = (type) => {
        const colors = {
            'BANK': '#1c94e0',
            'WALLET': '#00cccc',
            'PREPAID_CARD': '#28a745'
        }
        return colors[type] || '#1c94e0'
    }

    // Función para formatear datos para guardar
    const formatBancoData = (selectedBanco) => {
        if (!selectedBanco) return null
        
        return {
            banco: selectedBanco.bankName,
            bancoCodigo: selectedBanco.bankCode,
            bancoTipo: selectedBanco.type
        }
    }

    // Función para obtener estadísticas de uso
    const getBancoStats = () => {
        return {
            totalBancos: bancos.value.length,
            bancosTradicionles: bancosTradicionles.value.length,
            wallets: wallets.value.length,
            tarjetasPrepagadas: tarjetasPrepagadas.value.length
        }
    }

    return {
        // Estado
        bancos,
        loading,
        error,
        
        // Computed
        bancosTradicionles,
        wallets,
        tarjetasPrepagadas,
        bancosAgrupados,
        
        // Métodos
        loadBancos,
        findBancoByCode,
        findBancoByName,
        getBancoIcon,
        getBancoColor,
        formatBancoData,
        getBancoStats
    }
}
