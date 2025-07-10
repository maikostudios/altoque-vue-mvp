<template>
    <div class="geo-selector">
        <!-- País -->
        <v-row>
            <v-col cols="12">
                <v-select v-model="selectedCountry" :items="countries" item-title="name" item-value="code"
                    label="País *" :rules="required ? [rules.required] : []" variant="outlined" density="comfortable"
                    @update:model-value="onCountryChange" :loading="loadingCountries">
                    <template #prepend-inner>
                        <v-icon>mdi-earth</v-icon>
                    </template>
                </v-select>
            </v-col>
        </v-row>

        <!-- Región (solo para Chile) -->
        <v-row v-if="selectedCountry === 'CL'">
            <v-col cols="12">
                <v-select v-model="selectedRegion" :items="regions" item-title="nombre" item-value="codigo"
                    label="Región *" :rules="required ? [rules.required] : []" variant="outlined" density="comfortable"
                    @update:model-value="onRegionChange" :loading="loadingRegions" :disabled="!selectedCountry">
                    <template #prepend-inner>
                        <v-icon>mdi-map</v-icon>
                    </template>
                </v-select>
            </v-col>
        </v-row>

        <!-- Provincia (solo para Chile) -->
        <v-row v-if="selectedCountry === 'CL' && selectedRegion">
            <v-col cols="12">
                <v-select v-model="selectedProvince" :items="provinces" item-title="nombre" item-value="codigo"
                    label="Provincia *" :rules="required ? [rules.required] : []" variant="outlined"
                    density="comfortable" @update:model-value="onProvinceChange" :loading="loadingProvinces"
                    :disabled="!selectedRegion">
                    <template #prepend-inner>
                        <v-icon>mdi-city</v-icon>
                    </template>
                </v-select>
            </v-col>
        </v-row>

        <!-- Comuna (solo para Chile) -->
        <v-row v-if="selectedCountry === 'CL' && selectedProvince">
            <v-col cols="12">
                <v-select v-model="selectedCommune" :items="communes" item-title="nombre" item-value="codigo"
                    label="Comuna *" :rules="required ? [rules.required] : []" variant="outlined" density="comfortable"
                    @update:model-value="onCommuneChange" :loading="loadingCommunes" :disabled="!selectedProvince">
                    <template #prepend-inner>
                        <v-icon>mdi-home-city</v-icon>
                    </template>
                </v-select>
            </v-col>
        </v-row>

        <!-- Ciudad/Estado para otros países -->
        <v-row v-if="selectedCountry && selectedCountry !== 'CL'">
            <v-col cols="12">
                <v-text-field v-model="selectedCity" label="Ciudad/Estado *" :rules="required ? [rules.required] : []"
                    variant="outlined" density="comfortable" @update:model-value="onCityChange"
                    :placeholder="getCityPlaceholder()">
                    <template #prepend-inner>
                        <v-icon>mdi-city-variant</v-icon>
                    </template>
                </v-text-field>
            </v-col>
        </v-row>

        <!-- Información adicional -->
        <v-alert v-if="selectedCountry && selectedCountry !== 'CL'" type="info" variant="tonal" class="mt-2">
            <v-icon>mdi-information</v-icon>
            Para países fuera de Chile, ingresa manualmente tu ciudad o estado.
        </v-alert>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

// Props
const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({
            pais: '',
            region: '',
            provincia: '',
            comuna: '',
            city: ''
        })
    },
    required: {
        type: Boolean,
        default: true
    }
})

// Emits
const emit = defineEmits(['update:modelValue', 'change'])

// Validation rules
const rules = {
    required: (value) => !!value || 'Este campo es obligatorio'
}

// Estado
const selectedCountry = ref(props.modelValue.pais || '')
const selectedRegion = ref(props.modelValue.region || '')
const selectedProvince = ref(props.modelValue.provincia || '')
const selectedCommune = ref(props.modelValue.comuna || '')
const selectedCity = ref(props.modelValue.city || '')
const selectedGender = ref(props.modelValue.gender || '') // ✅ Variable agregada

// Datos
const countries = ref([])
const regions = ref([])
const provinces = ref([])
const communes = ref([])

// Loading states
const loadingCountries = ref(false)
const loadingRegions = ref(false)
const loadingProvinces = ref(false)
const loadingCommunes = ref(false)

// Errores
const errors = ref({
    country: '',
    region: '',
    province: '',
    commune: '',
    gender: ''
})

// Funciones de carga de datos
const loadCountries = async () => {
    try {
        loadingCountries.value = true
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
        const data = await response.json()

        countries.value = data
            .map(country => ({
                code: country.cca2,
                name: country.name.common
            }))
            .sort((a, b) => a.name.localeCompare(b.name))

        console.log('✅ Países cargados:', countries.value.length)
    } catch (error) {
        console.error('❌ Error cargando países:', error)
    } finally {
        loadingCountries.value = false
    }
}

// Datos estáticos de Chile (más confiables que la API gubernamental)
const chileanRegions = [
    { codigo: '1', nombre: 'Tarapacá' },
    { codigo: '2', nombre: 'Antofagasta' },
    { codigo: '3', nombre: 'Atacama' },
    { codigo: '4', nombre: 'Coquimbo' },
    { codigo: '5', nombre: 'Valparaíso' },
    { codigo: '6', nombre: 'Libertador General Bernardo O\'Higgins' },
    { codigo: '7', nombre: 'Maule' },
    { codigo: '8', nombre: 'Biobío' },
    { codigo: '9', nombre: 'La Araucanía' },
    { codigo: '10', nombre: 'Los Lagos' },
    { codigo: '11', nombre: 'Aysén del General Carlos Ibáñez del Campo' },
    { codigo: '12', nombre: 'Magallanes y de la Antártica Chilena' },
    { codigo: '13', nombre: 'Metropolitana de Santiago' },
    { codigo: '14', nombre: 'Los Ríos' },
    { codigo: '15', nombre: 'Arica y Parinacota' },
    { codigo: '16', nombre: 'Ñuble' }
]

const chileanProvinces = {
    '13': [ // Metropolitana
        { codigo: '131', nombre: 'Santiago' },
        { codigo: '132', nombre: 'Cordillera' },
        { codigo: '133', nombre: 'Chacabuco' },
        { codigo: '134', nombre: 'Maipo' },
        { codigo: '135', nombre: 'Melipilla' },
        { codigo: '136', nombre: 'Talagante' }
    ],
    '5': [ // Valparaíso
        { codigo: '51', nombre: 'Valparaíso' },
        { codigo: '52', nombre: 'Isla de Pascua' },
        { codigo: '53', nombre: 'Los Andes' },
        { codigo: '54', nombre: 'Petorca' },
        { codigo: '55', nombre: 'Quillota' },
        { codigo: '56', nombre: 'San Antonio' },
        { codigo: '57', nombre: 'San Felipe de Aconcagua' },
        { codigo: '58', nombre: 'Marga Marga' }
    ],
    '8': [ // Biobío
        { codigo: '81', nombre: 'Concepción' },
        { codigo: '82', nombre: 'Arauco' },
        { codigo: '83', nombre: 'Biobío' }
    ],
    '9': [ // La Araucanía
        { codigo: '91', nombre: 'Cautín' },
        { codigo: '92', nombre: 'Malleco' }
    ],
    '4': [ // Coquimbo
        { codigo: '41', nombre: 'Elqui' },
        { codigo: '42', nombre: 'Choapa' },
        { codigo: '43', nombre: 'Limarí' }
    ],
    '2': [ // Antofagasta
        { codigo: '21', nombre: 'Antofagasta' },
        { codigo: '22', nombre: 'El Loa' },
        { codigo: '23', nombre: 'Tocopilla' }
    ],
    '10': [ // Los Lagos
        { codigo: '101', nombre: 'Llanquihue' },
        { codigo: '102', nombre: 'Chiloé' },
        { codigo: '103', nombre: 'Osorno' },
        { codigo: '104', nombre: 'Palena' }
    ],
    '1': [ // Tarapacá
        { codigo: '11', nombre: 'Iquique' },
        { codigo: '14', nombre: 'Tamarugal' }
    ],
    '15': [ // Arica y Parinacota
        { codigo: '151', nombre: 'Arica' },
        { codigo: '152', nombre: 'Parinacota' }
    ]
}

const chileanCommunes = {
    '131': [ // Santiago
        { codigo: '13101', nombre: 'Santiago' },
        { codigo: '13102', nombre: 'Cerrillos' },
        { codigo: '13103', nombre: 'Cerro Navia' },
        { codigo: '13104', nombre: 'Conchalí' },
        { codigo: '13105', nombre: 'El Bosque' },
        { codigo: '13106', nombre: 'Estación Central' },
        { codigo: '13107', nombre: 'Huechuraba' },
        { codigo: '13108', nombre: 'Independencia' },
        { codigo: '13109', nombre: 'La Cisterna' },
        { codigo: '13110', nombre: 'La Florida' },
        { codigo: '13111', nombre: 'La Granja' },
        { codigo: '13112', nombre: 'La Pintana' },
        { codigo: '13113', nombre: 'La Reina' },
        { codigo: '13114', nombre: 'Las Condes' },
        { codigo: '13115', nombre: 'Lo Barnechea' },
        { codigo: '13116', nombre: 'Lo Espejo' },
        { codigo: '13117', nombre: 'Lo Prado' },
        { codigo: '13118', nombre: 'Macul' },
        { codigo: '13119', nombre: 'Maipú' },
        { codigo: '13120', nombre: 'Ñuñoa' },
        { codigo: '13121', nombre: 'Pedro Aguirre Cerda' },
        { codigo: '13122', nombre: 'Peñalolén' },
        { codigo: '13123', nombre: 'Providencia' },
        { codigo: '13124', nombre: 'Pudahuel' },
        { codigo: '13125', nombre: 'Quilicura' },
        { codigo: '13126', nombre: 'Quinta Normal' },
        { codigo: '13127', nombre: 'Recoleta' },
        { codigo: '13128', nombre: 'Renca' },
        { codigo: '13129', nombre: 'San Joaquín' },
        { codigo: '13130', nombre: 'San Miguel' },
        { codigo: '13131', nombre: 'San Ramón' },
        { codigo: '13132', nombre: 'Vitacura' }
    ],
    '51': [ // Valparaíso
        { codigo: '5101', nombre: 'Valparaíso' },
        { codigo: '5102', nombre: 'Casablanca' },
        { codigo: '5103', nombre: 'Concón' },
        { codigo: '5104', nombre: 'Juan Fernández' },
        { codigo: '5105', nombre: 'Puchuncaví' },
        { codigo: '5106', nombre: 'Quintero' },
        { codigo: '5107', nombre: 'Viña del Mar' }
    ],
    '81': [ // Concepción
        { codigo: '8101', nombre: 'Concepción' },
        { codigo: '8102', nombre: 'Coronel' },
        { codigo: '8103', nombre: 'Chiguayante' },
        { codigo: '8104', nombre: 'Florida' },
        { codigo: '8105', nombre: 'Hualqui' },
        { codigo: '8106', nombre: 'Lota' },
        { codigo: '8107', nombre: 'Penco' },
        { codigo: '8108', nombre: 'San Pedro de la Paz' },
        { codigo: '8109', nombre: 'Santa Juana' },
        { codigo: '8110', nombre: 'Talcahuano' },
        { codigo: '8111', nombre: 'Tomé' },
        { codigo: '8112', nombre: 'Hualpén' }
    ],
    '91': [ // Cautín
        { codigo: '9101', nombre: 'Temuco' },
        { codigo: '9102', nombre: 'Carahue' },
        { codigo: '9103', nombre: 'Cunco' },
        { codigo: '9104', nombre: 'Curarrehue' },
        { codigo: '9105', nombre: 'Freire' },
        { codigo: '9106', nombre: 'Galvarino' },
        { codigo: '9107', nombre: 'Gorbea' },
        { codigo: '9108', nombre: 'Lautaro' },
        { codigo: '9109', nombre: 'Loncoche' },
        { codigo: '9110', nombre: 'Melipeuco' },
        { codigo: '9111', nombre: 'Nueva Imperial' },
        { codigo: '9112', nombre: 'Padre las Casas' },
        { codigo: '9113', nombre: 'Perquenco' },
        { codigo: '9114', nombre: 'Pitrufquén' },
        { codigo: '9115', nombre: 'Pucón' },
        { codigo: '9116', nombre: 'Saavedra' },
        { codigo: '9117', nombre: 'Teodoro Schmidt' },
        { codigo: '9118', nombre: 'Toltén' },
        { codigo: '9119', nombre: 'Vilcún' },
        { codigo: '9120', nombre: 'Villarrica' }
    ],
    '41': [ // Elqui
        { codigo: '4101', nombre: 'La Serena' },
        { codigo: '4102', nombre: 'Coquimbo' },
        { codigo: '4103', nombre: 'Andacollo' },
        { codigo: '4104', nombre: 'La Higuera' },
        { codigo: '4105', nombre: 'Paiguano' },
        { codigo: '4106', nombre: 'Vicuña' }
    ],
    '21': [ // Antofagasta
        { codigo: '2101', nombre: 'Antofagasta' },
        { codigo: '2102', nombre: 'Mejillones' },
        { codigo: '2103', nombre: 'Sierra Gorda' },
        { codigo: '2104', nombre: 'Taltal' }
    ],
    '101': [ // Llanquihue
        { codigo: '10101', nombre: 'Puerto Montt' },
        { codigo: '10102', nombre: 'Calbuco' },
        { codigo: '10103', nombre: 'Cochamó' },
        { codigo: '10104', nombre: 'Fresia' },
        { codigo: '10105', nombre: 'Frutillar' },
        { codigo: '10106', nombre: 'Los Muermos' },
        { codigo: '10107', nombre: 'Llanquihue' },
        { codigo: '10108', nombre: 'Maullín' },
        { codigo: '10109', nombre: 'Puerto Varas' }
    ],
    '103': [ // Osorno
        { codigo: '10301', nombre: 'Osorno' },
        { codigo: '10302', nombre: 'Puerto Octay' },
        { codigo: '10303', nombre: 'Purranque' },
        { codigo: '10304', nombre: 'Puyehue' },
        { codigo: '10305', nombre: 'Río Negro' },
        { codigo: '10306', nombre: 'San Juan de la Costa' },
        { codigo: '10307', nombre: 'San Pablo' }
    ],
    '11': [ // Iquique
        { codigo: '1101', nombre: 'Iquique' },
        { codigo: '1107', nombre: 'Alto Hospicio' }
    ],
    '151': [ // Arica
        { codigo: '15101', nombre: 'Arica' },
        { codigo: '15102', nombre: 'Camarones' }
    ]
}

const loadRegions = async () => {
    try {
        loadingRegions.value = true

        // Usar datos estáticos en lugar de la API problemática
        regions.value = chileanRegions.sort((a, b) => a.nombre.localeCompare(b.nombre))
        console.log('✅ Regiones cargadas (datos estáticos):', regions.value.length)

    } catch (error) {
        console.error('❌ Error cargando regiones:', error)
    } finally {
        loadingRegions.value = false
    }
}

const loadProvinces = async (regionCode) => {
    try {
        loadingProvinces.value = true

        // Usar datos estáticos en lugar de la API problemática
        const provincesData = chileanProvinces[regionCode] || []
        provinces.value = provincesData.sort((a, b) => a.nombre.localeCompare(b.nombre))
        console.log('✅ Provincias cargadas (datos estáticos):', provinces.value.length)

    } catch (error) {
        console.error('❌ Error cargando provincias:', error)
    } finally {
        loadingProvinces.value = false
    }
}

const loadCommunes = async (provinceCode) => {
    try {
        loadingCommunes.value = true

        // Usar datos estáticos en lugar de la API problemática
        const communesData = chileanCommunes[provinceCode] || []
        communes.value = communesData.sort((a, b) => a.nombre.localeCompare(b.nombre))
        console.log('✅ Comunas cargadas (datos estáticos):', communes.value.length)

    } catch (error) {
        console.error('❌ Error cargando comunas:', error)
    } finally {
        loadingCommunes.value = false
    }
}

// Event handlers
const onCountryChange = () => {
    // Reset dependent fields
    selectedRegion.value = ''
    selectedProvince.value = ''
    selectedCommune.value = ''
    regions.value = []
    provinces.value = []
    communes.value = []

    if (selectedCountry.value === 'CL') {
        loadRegions()
    }

    updateModelValue()
    validateField('country')
}

const onRegionChange = () => {
    // Reset dependent fields
    selectedProvince.value = ''
    selectedCommune.value = ''
    provinces.value = []
    communes.value = []

    if (selectedRegion.value) {
        loadProvinces(selectedRegion.value)
    }

    updateModelValue()
    validateField('region')
}

const onProvinceChange = () => {
    // Reset dependent fields
    selectedCommune.value = ''
    communes.value = []

    if (selectedProvince.value) {
        loadCommunes(selectedProvince.value)
    }

    updateModelValue()
    validateField('province')
}

const onCommuneChange = () => {
    updateModelValue()
    validateField('commune')
}

const onCityChange = () => {
    updateModelValue()
}

// Función para obtener placeholder de ciudad según país
const getCityPlaceholder = () => {
    const placeholders = {
        'AR': 'Ej: Buenos Aires, Córdoba',
        'PE': 'Ej: Lima, Arequipa',
        'CO': 'Ej: Bogotá, Medellín',
        'VE': 'Ej: Caracas, Valencia',
        'EC': 'Ej: Quito, Guayaquil',
        'BO': 'Ej: La Paz, Santa Cruz',
        'UY': 'Ej: Montevideo, Salto',
        'PY': 'Ej: Asunción, Ciudad del Este',
        'BR': 'Ej: São Paulo, Rio de Janeiro',
        'MX': 'Ej: Ciudad de México, Guadalajara'
    }
    // ✅ Validación defensiva para evitar errores
    const countryCode = selectedCountry.value || ''
    return placeholders[countryCode] || 'Ingresa tu ciudad'
}

// Actualizar modelo
const updateModelValue = () => {
    const value = {
        pais: selectedCountry.value,
        paisNombre: countries.value.find(c => c.code === selectedCountry.value)?.name || '',
        region: selectedRegion.value,
        regionNombre: regions.value.find(r => r.codigo === selectedRegion.value)?.nombre || '',
        provincia: selectedProvince.value,
        provinciaNombre: provinces.value.find(p => p.codigo === selectedProvince.value)?.nombre || '',
        comuna: selectedCommune.value,
        comunaNombre: communes.value.find(c => c.codigo === selectedCommune.value)?.nombre || '',
        city: selectedCity.value,
        gender: selectedGender.value // ✅ Incluir género en el modelo
    }

    emit('update:modelValue', value)
    emit('change', value)
}

// Validación
const validateField = (field) => {
    if (!props.required) return

    switch (field) {
        case 'country':
            errors.value.country = selectedCountry.value ? '' : 'El país es obligatorio'
            break
        case 'region':
            if (selectedCountry.value === 'CL') {
                errors.value.region = selectedRegion.value ? '' : 'La región es obligatoria'
            }
            break
        case 'province':
            if (selectedCountry.value === 'CL' && selectedRegion.value) {
                errors.value.province = selectedProvince.value ? '' : 'La provincia es obligatoria'
            }
            break
        case 'commune':
            if (selectedCountry.value === 'CL' && selectedProvince.value) {
                errors.value.commune = selectedCommune.value ? '' : 'La comuna es obligatoria'
            }
            break
        case 'gender':
            errors.value.gender = selectedGender.value ? '' : 'El sexo es obligatorio'
            break
    }
}

// Validar todo
const validateAll = () => {
    validateField('country')
    validateField('region')
    validateField('province')
    validateField('commune')
    validateField('gender')

    return !Object.values(errors.value).some(error => error !== '')
}

// Exponer función de validación
defineExpose({
    validateAll,
    errors
})

// Watchers para sincronizar con props
watch(() => props.modelValue, (newValue) => {
    // ✅ Validación defensiva más robusta
    if (newValue && typeof newValue === 'object') {
        try {
            selectedCountry.value = newValue.pais || newValue.country || ''
            selectedRegion.value = newValue.region || ''
            selectedProvince.value = newValue.provincia || newValue.province || ''
            selectedCommune.value = newValue.comuna || newValue.commune || ''
            selectedCity.value = newValue.city || ''
            selectedGender.value = newValue.gender || ''
        } catch (error) {
            console.warn('⚠️ Error sincronizando props en GeoSelector:', error)
        }
    }
}, { deep: true, immediate: false })

onMounted(() => {
    loadCountries()

    // Si ya hay un país seleccionado, cargar datos dependientes
    if (selectedCountry.value === 'CL') {
        loadRegions()
    }
})
</script>

<style scoped>
.geo-selector {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    font-weight: 600;
    color: var(--color-text);
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
}

.required {
    color: var(--color-error);
    font-weight: 700;
}

.form-select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    background: var(--color-surface-variant);
    color: var(--color-text);
    font-size: 1rem;
    transition: all var(--duration-normal) var(--easing-default);
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.75rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
}

.form-select:focus {
    outline: none;
    border-color: var(--color-turquesa);
    box-shadow: 0 0 0 3px rgba(0, 204, 204, 0.2);
    background-color: var(--color-surface);
}

.form-select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--color-surface-variant);
}

.form-select.error {
    border-color: var(--color-error);
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
}

.error-message {
    color: var(--color-error);
    font-size: 0.8rem;
    font-weight: 500;
    margin-top: 0.25rem;
}

/* Responsive */
@media (min-width: 768px) {
    .geo-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        align-items: start;
    }

    .form-group:last-child {
        grid-column: span 2;
    }
}

@media (min-width: 1024px) {
    .geo-selector {
        grid-template-columns: repeat(3, 1fr);
    }

    .form-group:last-child {
        grid-column: span 1;
    }
}

/* Animaciones */
.form-group {
    animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Estados de carga */
.form-select option:first-child {
    font-style: italic;
    color: var(--color-text-secondary);
}

/* Hover effects */
.form-select:hover:not(:disabled) {
    border-color: var(--color-turquesa);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
    .form-select {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%9ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    }
}

/* ✅ VUETIFY COMPATIBILITY */
.v-select .v-icon {
    color: var(--color-turquesa);
}

.v-text-field .v-icon {
    color: var(--color-turquesa);
}

.v-alert {
    font-size: 0.875rem;
}
</style>
