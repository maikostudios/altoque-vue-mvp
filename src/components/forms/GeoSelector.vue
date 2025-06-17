<template>
    <div class="geo-selector">
        <!-- País -->
        <div class="form-group">
            <label for="pais" class="form-label">
                País <span class="required">*</span>
            </label>
            <select id="pais" v-model="selectedCountry" @change="onCountryChange" class="form-select"
                :class="{ 'error': errors.country }" :disabled="loadingCountries">
                <option value="">
                    {{ loadingCountries ? 'Cargando países...' : 'Selecciona un país' }}
                </option>
                <option v-for="country in countries" :key="country.code" :value="country.code">
                    {{ country.name }}
                </option>
            </select>
            <span v-if="errors.country" class="error-message">{{ errors.country }}</span>
        </div>

        <!-- Región (solo para Chile) -->
        <div v-if="selectedCountry === 'CL'" class="form-group">
            <label for="region" class="form-label">
                Región <span class="required">*</span>
            </label>
            <select id="region" v-model="selectedRegion" @change="onRegionChange" class="form-select"
                :class="{ 'error': errors.region }" :disabled="loadingRegions">
                <option value="">
                    {{ loadingRegions ? 'Cargando regiones...' : 'Selecciona una región' }}
                </option>
                <option v-for="region in regions" :key="region.codigo" :value="region.codigo">
                    {{ region.nombre }}
                </option>
            </select>
            <span v-if="errors.region" class="error-message">{{ errors.region }}</span>
        </div>

        <!-- Provincia (solo para Chile) -->
        <div v-if="selectedCountry === 'CL' && selectedRegion" class="form-group">
            <label for="provincia" class="form-label">
                Provincia <span class="required">*</span>
            </label>
            <select id="provincia" v-model="selectedProvince" @change="onProvinceChange" class="form-select"
                :class="{ 'error': errors.province }" :disabled="loadingProvinces">
                <option value="">
                    {{ loadingProvinces ? 'Cargando provincias...' : 'Selecciona una provincia' }}
                </option>
                <option v-for="province in provinces" :key="province.codigo" :value="province.codigo">
                    {{ province.nombre }}
                </option>
            </select>
            <span v-if="errors.province" class="error-message">{{ errors.province }}</span>
        </div>

        <!-- Comuna (solo para Chile) -->
        <div v-if="selectedCountry === 'CL' && selectedProvince" class="form-group">
            <label for="comuna" class="form-label">
                Comuna <span class="required">*</span>
            </label>
            <select id="comuna" v-model="selectedCommune" @change="onCommuneChange" class="form-select"
                :class="{ 'error': errors.commune }" :disabled="loadingCommunes">
                <option value="">
                    {{ loadingCommunes ? 'Cargando comunas...' : 'Selecciona una comuna' }}
                </option>
                <option v-for="commune in communes" :key="commune.codigo" :value="commune.codigo">
                    {{ commune.nombre }}
                </option>
            </select>
            <span v-if="errors.commune" class="error-message">{{ errors.commune }}</span>
        </div>

        <!-- Sexo -->
        <div class="form-group">
            <label for="sexo" class="form-label">
                Sexo <span class="required">*</span>
            </label>
            <select id="sexo" v-model="selectedGender" @change="onGenderChange" class="form-select"
                :class="{ 'error': errors.gender }">
                <option value="">Selecciona el sexo</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
            </select>
            <span v-if="errors.gender" class="error-message">{{ errors.gender }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// Props
const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({
            country: '',
            region: '',
            province: '',
            commune: '',
            gender: ''
        })
    },
    required: {
        type: Boolean,
        default: true
    }
})

// Emits
const emit = defineEmits(['update:modelValue', 'change'])

// Estado
const selectedCountry = ref(props.modelValue.country || '')
const selectedRegion = ref(props.modelValue.region || '')
const selectedProvince = ref(props.modelValue.province || '')
const selectedCommune = ref(props.modelValue.commune || '')
const selectedGender = ref(props.modelValue.gender || '')

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

const loadRegions = async () => {
    try {
        loadingRegions.value = true
        const response = await fetch('https://apis.digital.gob.cl/dpa/regiones')
        const data = await response.json()

        regions.value = data.sort((a, b) => a.nombre.localeCompare(b.nombre))
        console.log('✅ Regiones cargadas:', regions.value.length)
    } catch (error) {
        console.error('❌ Error cargando regiones:', error)
    } finally {
        loadingRegions.value = false
    }
}

const loadProvinces = async (regionCode) => {
    try {
        loadingProvinces.value = true
        const response = await fetch(`https://apis.digital.gob.cl/dpa/regiones/${regionCode}/provincias`)
        const data = await response.json()

        provinces.value = data.sort((a, b) => a.nombre.localeCompare(b.nombre))
        console.log('✅ Provincias cargadas:', provinces.value.length)
    } catch (error) {
        console.error('❌ Error cargando provincias:', error)
    } finally {
        loadingProvinces.value = false
    }
}

const loadCommunes = async (provinceCode) => {
    try {
        loadingCommunes.value = true
        const response = await fetch(`https://apis.digital.gob.cl/dpa/provincias/${provinceCode}/comunas`)
        const data = await response.json()

        communes.value = data.sort((a, b) => a.nombre.localeCompare(b.nombre))
        console.log('✅ Comunas cargadas:', communes.value.length)
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

const onGenderChange = () => {
    updateModelValue()
    validateField('gender')
}

// Actualizar modelo
const updateModelValue = () => {
    const value = {
        country: selectedCountry.value,
        region: selectedRegion.value,
        province: selectedProvince.value,
        commune: selectedCommune.value,
        gender: selectedGender.value
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
    if (newValue) {
        selectedCountry.value = newValue.country || ''
        selectedRegion.value = newValue.region || ''
        selectedProvince.value = newValue.province || ''
        selectedCommune.value = newValue.commune || ''
        selectedGender.value = newValue.gender || ''
    }
}, { deep: true })

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
</style>
