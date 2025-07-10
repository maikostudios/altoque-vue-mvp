<template>
  <v-dialog v-model="show" max-width="500px" persistent>
    <v-card class="confirmation-modal">
      <!-- Header -->
      <v-card-title class="modal-header">
        <v-icon class="header-icon" :color="iconColor">{{ icon }}</v-icon>
        <span class="header-title">{{ title }}</span>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="modal-content">
        <p class="confirmation-message">{{ message }}</p>
        
        <!-- Slot para contenido adicional -->
        <slot />
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="modal-actions">
        <v-spacer />
        
        <v-btn
          @click="cancel"
          variant="outlined"
          :disabled="loading"
        >
          {{ cancelText }}
        </v-btn>
        
        <v-btn
          @click="confirm"
          :color="confirmColor"
          variant="elevated"
          :loading="loading"
        >
          <v-icon left v-if="confirmIcon">{{ confirmIcon }}</v-icon>
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmar Acción'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  confirmColor: {
    type: String,
    default: 'primary'
  },
  confirmIcon: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'mdi-help-circle'
  },
  persistent: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// Reactive data
const loading = ref(false)

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const iconColor = computed(() => {
  const colorMap = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
    primary: 'primary'
  }
  return colorMap[props.confirmColor] || 'primary'
})

// Methods
const confirm = async () => {
  loading.value = true
  try {
    await emit('confirm')
    show.value = false
  } catch (error) {
    console.error('Error en confirmación:', error)
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  emit('cancel')
  show.value = false
}
</script>

<style scoped>
.confirmation-modal {
  background: var(--color-surface);
  color: var(--color-text);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-surface-variant);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-icon {
  font-size: 1.5rem;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-content {
  padding: 2rem;
}

.confirmation-message {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-text);
  margin: 0;
}

.modal-actions {
  padding: 1rem 1.5rem;
  background: var(--color-surface-variant);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 600px) {
  .modal-header {
    padding: 1rem;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
  
  .modal-actions {
    padding: 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-actions .v-btn {
    width: 100%;
  }
}
</style>
