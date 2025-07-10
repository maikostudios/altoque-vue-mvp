<template>
  <div class="progress-bar-container">
    <div 
      class="progress-bar-fill" 
      :style="{ 
        width: `${percentage}%`,
        backgroundColor: color,
        transition: animated ? 'width 0.3s ease-out' : 'none'
      }"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  },
  color: {
    type: String,
    default: 'var(--color-turquesa)'
  },
  animated: {
    type: Boolean,
    default: true
  },
  height: {
    type: String,
    default: '6px'
  }
})

// Computed para optimizar el estilo del contenedor
const containerStyle = computed(() => ({
  height: props.height,
  backgroundColor: 'var(--color-surface-variant)',
  borderRadius: '3px',
  overflow: 'hidden',
  width: '100%'
}))
</script>

<style scoped>
.progress-bar-container {
  position: relative;
  background: var(--color-surface-variant);
  border-radius: 3px;
  overflow: hidden;
  /* Optimización de rendering */
  contain: layout style;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 3px;
  /* Optimización GPU */
  will-change: width;
  transform: translateZ(0);
}

/* Variantes de color predefinidas para mejor rendimiento */
.progress-bar-fill.turquesa {
  background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
}

.progress-bar-fill.premium {
  background: linear-gradient(135deg, #ffd700, #ffb347);
}

.progress-bar-fill.success {
  background: linear-gradient(135deg, var(--color-success), #28a745);
}

.progress-bar-fill.warning {
  background: linear-gradient(135deg, var(--color-warning), #ff8c00);
}

.progress-bar-fill.error {
  background: linear-gradient(135deg, var(--color-error), #dc3545);
}
</style>
