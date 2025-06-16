<template>
    <div class="editable-field">
        <div v-if="!editing" class="field-display" @click="startEdit">
            <span class="field-value">{{ displayValue || 'Sin especificar' }}</span>
            <button class="edit-btn" title="Editar">✏️</button>
        </div>
        
        <div v-else class="field-edit">
            <select v-if="type === 'select'" v-model="editValue" class="field-input" @blur="saveField" @keyup.enter="saveField" @keyup.escape="cancelEdit">
                <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
            </select>
            
            <input 
                v-else
                v-model="editValue" 
                :type="type" 
                class="field-input"
                @blur="saveField"
                @keyup.enter="saveField"
                @keyup.escape="cancelEdit"
                ref="inputRef"
            >
            
            <div class="field-actions">
                <button @click="saveField" class="save-btn" title="Guardar">✅</button>
                <button @click="cancelEdit" class="cancel-btn" title="Cancelar">❌</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'

const props = defineProps({
    value: {
        type: [String, Number, Boolean],
        default: ''
    },
    field: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'text'
    },
    options: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update'])

// Estado
const editing = ref(false)
const editValue = ref('')
const inputRef = ref(null)

// Computed
const displayValue = computed(() => {
    if (props.value === null || props.value === undefined) return ''
    if (typeof props.value === 'boolean') return props.value ? 'Sí' : 'No'
    return props.value.toString()
})

// Funciones
const startEdit = async () => {
    editing.value = true
    editValue.value = props.value || ''
    
    await nextTick()
    if (inputRef.value) {
        inputRef.value.focus()
        inputRef.value.select()
    }
}

const saveField = () => {
    if (editValue.value !== props.value) {
        emit('update', props.field, editValue.value)
    }
    editing.value = false
}

const cancelEdit = () => {
    editing.value = false
    editValue.value = props.value || ''
}
</script>

<style scoped>
.editable-field {
    position: relative;
    min-height: 2rem;
}

.field-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all var(--duration-normal) var(--easing-default);
    border: 1px solid transparent;
}

.field-display:hover {
    background: var(--color-surface-variant);
    border-color: var(--color-border);
}

.field-value {
    flex: 1;
    color: var(--color-text);
    font-family: var(--font-secondary);
}

.field-value:empty::before {
    content: 'Sin especificar';
    color: var(--color-text-secondary);
    font-style: italic;
}

.edit-btn {
    background: none;
    border: none;
    font-size: 0.8rem;
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--duration-normal) var(--easing-default);
}

.field-display:hover .edit-btn {
    opacity: 1;
}

.field-edit {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.field-input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-surface);
    color: var(--color-text);
    font-family: var(--font-secondary);
    font-size: 0.9rem;
    transition: border-color var(--duration-normal) var(--easing-default);
}

.field-input:focus {
    outline: none;
    border-color: var(--color-turquesa);
    box-shadow: 0 0 0 2px rgba(0, 204, 204, 0.2);
}

.field-actions {
    display: flex;
    gap: 0.25rem;
}

.save-btn, .cancel-btn {
    background: none;
    border: none;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background var(--duration-normal) var(--easing-default);
}

.save-btn:hover {
    background: rgba(40, 167, 69, 0.2);
}

.cancel-btn:hover {
    background: rgba(220, 53, 69, 0.2);
}
</style>
