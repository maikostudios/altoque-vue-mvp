<template>
    <div class="bank-card-form">
        <form @submit.prevent="submitForm" class="card-form">
            <!-- Información de la Tarjeta -->
            <div class="form-section">
                <h4>💳 Información de la Tarjeta</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Nombre de la Tarjeta *</label>
                        <input 
                            v-model="form.nombreTarjeta" 
                            type="text" 
                            class="input" 
                            required
                            placeholder="Ej: Mi Cuenta Principal"
                            maxlength="50"
                        >
                        <small>Nombre que aparecerá en tu página pública</small>
                    </div>

                    <div class="form-group">
                        <label>Banco *</label>
                        <select v-model="form.banco" class="input" required>
                            <option value="">Selecciona un banco</option>
                            <option value="Banco de Chile">Banco de Chile</option>
                            <option value="Banco Santander">Banco Santander</option>
                            <option value="Banco Estado">Banco Estado</option>
                            <option value="Banco BCI">Banco BCI</option>
                            <option value="Banco Falabella">Banco Falabella</option>
                            <option value="Banco Security">Banco Security</option>
                            <option value="Banco Itaú">Banco Itaú</option>
                            <option value="Banco Scotiabank">Banco Scotiabank</option>
                            <option value="Banco BICE">Banco BICE</option>
                            <option value="Banco Consorcio">Banco Consorcio</option>
                            <option value="Banco Ripley">Banco Ripley</option>
                            <option value="Banco Paris">Banco Paris</option>
                            <option value="Coopeuch">Coopeuch</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>

                    <div v-if="form.banco === 'Otro'" class="form-group">
                        <label>Especificar Banco *</label>
                        <input 
                            v-model="form.bancoOtro" 
                            type="text" 
                            class="input" 
                            required
                            placeholder="Nombre del banco"
                        >
                    </div>

                    <div class="form-group">
                        <label>Tipo de Cuenta *</label>
                        <select v-model="form.tipoCuenta" class="input" required>
                            <option value="">Selecciona el tipo</option>
                            <option value="Cuenta Corriente">Cuenta Corriente</option>
                            <option value="Cuenta Vista">Cuenta Vista</option>
                            <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                            <option value="Cuenta RUT">Cuenta RUT</option>
                            <option value="Chequera Electrónica">Chequera Electrónica</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Número de Cuenta *</label>
                        <input 
                            v-model="form.numeroCuenta" 
                            type="text" 
                            class="input" 
                            required
                            placeholder="Número de cuenta"
                            @input="formatAccountNumber"
                        >
                        <small>Solo números, se formateará automáticamente</small>
                    </div>
                </div>
            </div>

            <!-- Información del Titular -->
            <div class="form-section">
                <h4>👤 Información del Titular</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Nombre del Titular *</label>
                        <input 
                            v-model="form.nombreTitular" 
                            type="text" 
                            class="input" 
                            required
                            placeholder="Nombre completo del titular"
                        >
                    </div>

                    <div class="form-group">
                        <label>RUT del Titular *</label>
                        <input 
                            v-model="form.rutTitular" 
                            type="text" 
                            class="input" 
                            required
                            placeholder="12345678-9"
                            @input="formatRut"
                        >
                    </div>

                    <div class="form-group">
                        <label>Email del Titular</label>
                        <input 
                            v-model="form.emailTitular" 
                            type="email" 
                            class="input"
                            placeholder="email@ejemplo.com"
                        >
                    </div>

                    <div class="form-group">
                        <label>Teléfono del Titular</label>
                        <input 
                            v-model="form.telefonoTitular" 
                            type="tel" 
                            class="input"
                            placeholder="+56912345678"
                        >
                    </div>
                </div>
            </div>

            <!-- Personalización (Solo Premium) -->
            <div v-if="userInfo.esPremium" class="form-section premium-section">
                <h4>⭐ Personalización Premium</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Título Personalizado</label>
                        <input 
                            v-model="form.tituloPersonalizado" 
                            type="text" 
                            class="input"
                            placeholder="Ej: Panadería Don Juan"
                            maxlength="100"
                        >
                        <small>Aparecerá como título en tu página pública</small>
                    </div>

                    <div class="form-group">
                        <label>Descripción</label>
                        <textarea 
                            v-model="form.descripcion" 
                            class="input textarea"
                            placeholder="Descripción de tu negocio o servicio"
                            rows="3"
                            maxlength="500"
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label>Color de Tema</label>
                        <div class="color-options">
                            <label v-for="color in colorOptions" :key="color.value" class="color-option">
                                <input 
                                    v-model="form.colorTema" 
                                    type="radio" 
                                    :value="color.value"
                                >
                                <span class="color-preview" :style="{ background: color.gradient }"></span>
                                <span class="color-name">{{ color.name }}</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input v-model="form.mostrarLogo" type="checkbox">
                            <span class="checkmark"></span>
                            Mostrar logo/imagen en la página pública
                        </label>
                    </div>
                </div>
            </div>

            <!-- Configuración -->
            <div class="form-section">
                <h4>⚙️ Configuración</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input v-model="form.activa" type="checkbox">
                            <span class="checkmark"></span>
                            Tarjeta activa (visible públicamente)
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input v-model="form.permitirComentarios" type="checkbox">
                            <span class="checkmark"></span>
                            Permitir comentarios en la página pública
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input v-model="form.notificarTransferencias" type="checkbox">
                            <span class="checkmark"></span>
                            Recibir notificaciones de visitas
                        </label>
                    </div>
                </div>
            </div>

            <!-- Vista Previa -->
            <div class="form-section preview-section">
                <h4>👁️ Vista Previa</h4>
                <div class="card-preview">
                    <div class="preview-card" :style="{ background: getPreviewGradient() }">
                        <div class="preview-header">
                            <h3>{{ form.tituloPersonalizado || form.nombreTarjeta || 'Mi Tarjeta' }}</h3>
                            <div class="preview-bank">{{ form.banco || 'Banco' }}</div>
                        </div>
                        <div class="preview-info">
                            <p><strong>Tipo:</strong> {{ form.tipoCuenta || 'Tipo de cuenta' }}</p>
                            <p><strong>Titular:</strong> {{ form.nombreTitular || 'Nombre del titular' }}</p>
                            <p><strong>Cuenta:</strong> {{ formatPreviewAccount() }}</p>
                        </div>
                        <div class="preview-footer">
                            <span class="preview-qr">📱 QR</span>
                            <span :class="['preview-status', form.activa ? 'active' : 'inactive']">
                                {{ form.activa ? 'Activa' : 'Inactiva' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Acciones -->
            <div class="form-actions">
                <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
                    Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                    {{ submitting ? '⏳ Guardando...' : (editMode ? '✅ Actualizar' : '✅ Crear Tarjeta') }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
    editMode: {
        type: Boolean,
        default: false
    },
    cardData: {
        type: Object,
        default: () => ({})
    },
    userInfo: {
        type: Object,
        required: true
    },
    submitting: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['submit', 'cancel'])

// Formulario
const form = ref({
    nombreTarjeta: '',
    banco: '',
    bancoOtro: '',
    tipoCuenta: '',
    numeroCuenta: '',
    nombreTitular: '',
    rutTitular: '',
    emailTitular: '',
    telefonoTitular: '',
    tituloPersonalizado: '',
    descripcion: '',
    colorTema: 'turquesa',
    mostrarLogo: false,
    activa: true,
    permitirComentarios: false,
    notificarTransferencias: true
})

// Opciones de colores
const colorOptions = [
    { value: 'turquesa', name: 'Turquesa', gradient: 'linear-gradient(135deg, #00cccc, #1c94e0)' },
    { value: 'azul', name: 'Azul', gradient: 'linear-gradient(135deg, #1c94e0, #0066cc)' },
    { value: 'verde', name: 'Verde', gradient: 'linear-gradient(135deg, #28a745, #20c997)' },
    { value: 'morado', name: 'Morado', gradient: 'linear-gradient(135deg, #6f42c1, #e83e8c)' },
    { value: 'naranja', name: 'Naranja', gradient: 'linear-gradient(135deg, #fd7e14, #ffc107)' },
    { value: 'rojo', name: 'Rojo', gradient: 'linear-gradient(135deg, #dc3545, #fd7e14)' }
]

// Funciones
const formatAccountNumber = (event) => {
    let value = event.target.value.replace(/\D/g, '')
    form.value.numeroCuenta = value
}

const formatRut = (event) => {
    let value = event.target.value.replace(/^0+|[^0-9kK]+/g, '')
    if (value.length > 1) {
        value = value.replace(/^(\d{1,8})([kK\d])$/, '$1-$2')
    }
    form.value.rutTitular = value
}

const getPreviewGradient = () => {
    const selectedColor = colorOptions.find(c => c.value === form.value.colorTema)
    return selectedColor ? selectedColor.gradient : colorOptions[0].gradient
}

const formatPreviewAccount = () => {
    if (!form.value.numeroCuenta) return '••••••••'
    const account = form.value.numeroCuenta
    if (account.length <= 4) return account
    return '••••' + account.slice(-4)
}

const submitForm = () => {
    const formData = { ...form.value }
    
    // Si seleccionó "Otro" banco, usar el valor personalizado
    if (formData.banco === 'Otro' && formData.bancoOtro) {
        formData.banco = formData.bancoOtro
    }
    
    // Limpiar campos no necesarios
    delete formData.bancoOtro
    
    emit('submit', formData)
}

// Cargar datos si está en modo edición
onMounted(() => {
    if (props.editMode && props.cardData) {
        Object.assign(form.value, props.cardData)
    }
})
</script>

<style scoped>
.bank-card-form {
    max-width: 100%;
}

.card-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-section {
    background: var(--color-surface-variant);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
}

.form-section h4 {
    margin: 0 0 1rem 0;
    color: var(--color-text);
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    color: var(--color-text);
    font-weight: 500;
    font-size: 0.95rem;
}

.form-group small {
    color: var(--color-text-secondary);
    font-size: 0.85rem;
}

.textarea {
    resize: vertical;
    min-height: 80px;
}

/* Premium Section */
.premium-section {
    background: linear-gradient(135deg, rgba(0, 204, 204, 0.1), rgba(28, 148, 224, 0.1));
    border: 2px solid var(--color-turquesa);
}

/* Color Options */
.color-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
}

.color-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
    transition: all var(--duration-normal) var(--easing-default);
}

.color-option:hover {
    border-color: var(--color-turquesa);
    background: var(--color-surface);
}

.color-option input[type="radio"] {
    display: none;
}

.color-option input[type="radio"]:checked + .color-preview {
    border: 3px solid var(--color-turquesa);
    transform: scale(1.1);
}

.color-preview {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid var(--color-border);
    transition: all var(--duration-normal) var(--easing-default);
}

.color-name {
    font-size: 0.9rem;
    color: var(--color-text);
    font-weight: 500;
}

/* Checkbox */
.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.75rem;
    background: var(--color-surface);
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
    transition: all var(--duration-normal) var(--easing-default);
}

.checkbox-label:hover {
    border-color: var(--color-turquesa);
}

.checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--color-turquesa);
}

/* Preview */
.preview-section {
    background: var(--color-surface);
    border: 2px solid var(--color-turquesa);
}

.card-preview {
    display: flex;
    justify-content: center;
    padding: 1rem;
}

.preview-card {
    width: 300px;
    padding: 1.5rem;
    border-radius: 1rem;
    color: white;
    box-shadow: var(--shadow-lg);
    transition: all var(--duration-normal) var(--easing-default);
}

.preview-header {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-header h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 600;
}

.preview-bank {
    font-size: 0.9rem;
    opacity: 0.9;
}

.preview-info p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
}

.preview-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-qr {
    font-size: 1.2rem;
}

.preview-status {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
}

.preview-status.active {
    background: rgba(40, 167, 69, 0.8);
}

.preview-status.inactive {
    background: rgba(108, 117, 125, 0.8);
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
}

/* Responsive */
@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
    
    .color-options {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .preview-card {
        width: 100%;
        max-width: 300px;
    }
}
</style>
