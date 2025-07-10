<template>
  <v-card class="user-profile-card" elevation="3">
    <v-card-text class="profile-content">
      <!-- Avatar y información básica -->
      <div class="profile-header">
        <div class="avatar-section">
          <v-avatar
            :size="isMobile ? 64 : 80"
            class="profile-avatar"
          >
            <v-img
              v-if="userInfo.photoURL"
              :src="userInfo.photoURL"
              :alt="userInfo.displayName || userInfo.nombre"
              cover
            />
            <span v-else class="avatar-initials">
              {{ getInitials() }}
            </span>
          </v-avatar>
          
          <!-- Indicador de verificación -->
          <v-badge
            v-if="userInfo.idVerificationStatus === 'verified'"
            color="success"
            icon="mdi-check-circle"
            overlap
            offset-x="8"
            offset-y="8"
          />
          <v-badge
            v-else-if="userInfo.idVerificationStatus === 'pending'"
            color="warning"
            icon="mdi-clock"
            overlap
            offset-x="8"
            offset-y="8"
          />
        </div>

        <div class="profile-info">
          <h3 class="user-name">
            {{ userInfo.displayName || getFullName() || 'Usuario' }}
          </h3>
          <p class="user-email">{{ userInfo.email }}</p>
          
          <!-- Plan y rol -->
          <div class="user-badges">
            <v-chip
              :color="getPlanColor()"
              variant="elevated"
              size="small"
              class="plan-chip"
            >
              <v-icon left size="small">{{ getPlanIcon() }}</v-icon>
              {{ getPlanText() }}
            </v-chip>
            
            <v-chip
              v-if="userInfo.rol && userInfo.rol !== 'usuario'"
              :color="getRoleColor()"
              variant="outlined"
              size="small"
              class="role-chip"
            >
              {{ getRoleText() }}
            </v-chip>
          </div>
        </div>
      </div>

      <!-- Información adicional -->
      <v-divider class="my-4" />
      
      <div class="profile-details">
        <v-row dense>
          <!-- Estadísticas rápidas -->
          <v-col cols="12" sm="6">
            <div class="stat-item">
              <v-icon color="turquesa" size="small">mdi-credit-card</v-icon>
              <span class="stat-label">Tarjetas:</span>
              <span class="stat-value">{{ cardCount }}/{{ userInfo.limiteTarjetas || 1 }}</span>
            </div>
          </v-col>
          
          <v-col cols="12" sm="6">
            <div class="stat-item">
              <v-icon color="turquesa" size="small">mdi-eye</v-icon>
              <span class="stat-label">Visitas:</span>
              <span class="stat-value">{{ formatNumber(userMetrics.visitasPagina || 0) }}</span>
            </div>
          </v-col>
          
          <v-col cols="12" sm="6">
            <div class="stat-item">
              <v-icon color="turquesa" size="small">mdi-content-copy</v-icon>
              <span class="stat-label">Copias:</span>
              <span class="stat-value">{{ formatNumber(userMetrics.datosCopiadosCount || 0) }}</span>
            </div>
          </v-col>
          
          <v-col cols="12" sm="6">
            <div class="stat-item">
              <v-icon color="turquesa" size="small">mdi-calendar</v-icon>
              <span class="stat-label">Miembro desde:</span>
              <span class="stat-value">{{ formatMemberSince() }}</span>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Información Premium -->
      <div v-if="userInfo.isPremium || userInfo.esPremium" class="premium-info">
        <v-divider class="my-4" />
        <div class="premium-details">
          <v-icon color="warning" class="premium-icon">mdi-diamond</v-icon>
          <div class="premium-text">
            <span class="premium-label">Premium activo</span>
            <span v-if="premiumDaysLeft > 0" class="premium-expiry">
              {{ premiumDaysLeft }} días restantes
            </span>
            <span v-else class="premium-expired">
              Plan vencido
            </span>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="profile-actions">
        <v-divider class="my-4" />
        <v-row dense>
          <v-col cols="6">
            <v-btn
              @click="$emit('edit-profile')"
              variant="outlined"
              size="small"
              block
              color="turquesa"
            >
              <v-icon left size="small">mdi-pencil</v-icon>
              Editar
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn
              @click="$emit('view-qr')"
              variant="elevated"
              size="small"
              block
              color="turquesa"
            >
              <v-icon left size="small">mdi-qrcode</v-icon>
              Mi QR
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

// Props
const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  },
  userMetrics: {
    type: Object,
    default: () => ({})
  },
  cardCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['edit-profile', 'view-qr'])

// Composables
const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

// Computed
const premiumDaysLeft = computed(() => {
  if (!props.userInfo.isPremium && !props.userInfo.esPremium) return 0
  
  const expiryDate = props.userInfo.premiumExpiryDate || props.userInfo.fechaVencimientoPremium
  if (!expiryDate) return 0
  
  const expiry = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate)
  const today = new Date()
  const diffTime = expiry - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
})

// Methods
const getInitials = () => {
  const name = props.userInfo.displayName || props.userInfo.nombre || ''
  const lastName = props.userInfo.apellido || ''
  
  if (name && lastName) {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  } else if (name) {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  } else if (props.userInfo.email) {
    return props.userInfo.email.charAt(0).toUpperCase()
  }
  
  return '?'
}

const getFullName = () => {
  const name = props.userInfo.nombre || ''
  const lastName = props.userInfo.apellido || ''
  return `${name} ${lastName}`.trim()
}

const getPlanColor = () => {
  if (props.userInfo.isPremium || props.userInfo.esPremium) {
    return premiumDaysLeft.value > 0 ? 'warning' : 'error'
  }
  return 'default'
}

const getPlanIcon = () => {
  if (props.userInfo.isPremium || props.userInfo.esPremium) {
    return premiumDaysLeft.value > 0 ? 'mdi-diamond' : 'mdi-diamond-outline'
  }
  return 'mdi-account'
}

const getPlanText = () => {
  if (props.userInfo.isPremium || props.userInfo.esPremium) {
    return premiumDaysLeft.value > 0 ? 'Premium' : 'Premium Vencido'
  }
  return 'Gratuito'
}

const getRoleColor = () => {
  const roleColors = {
    admin: 'error',
    vendedor: 'warning',
    soporte: 'info',
    usuario: 'default'
  }
  return roleColors[props.userInfo.rol] || 'default'
}

const getRoleText = () => {
  const roleTexts = {
    admin: 'Administrador',
    vendedor: 'Vendedor',
    soporte: 'Soporte',
    usuario: 'Usuario'
  }
  return roleTexts[props.userInfo.rol] || props.userInfo.rol
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatMemberSince = () => {
  const createdAt = props.userInfo.createdAt || props.userInfo.fechaRegistro
  if (!createdAt) return 'Reciente'
  
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt)
  const now = new Date()
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return `${diffDays} días`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} mes${months > 1 ? 'es' : ''}`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} año${years > 1 ? 's' : ''}`
  }
}
</script>

<style scoped>
.user-profile-card {
  background: var(--color-surface);
  border: 1px solid rgba(0, 204, 204, 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.profile-content {
  padding: 1.5rem;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  border: 3px solid var(--color-turquesa);
  background: linear-gradient(135deg, var(--color-turquesa), var(--color-azul));
}

.avatar-initials {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
  word-break: break-word;
}

.user-email {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0 0 0.75rem 0;
  word-break: break-word;
}

.user-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.plan-chip {
  font-weight: 500;
}

.role-chip {
  font-size: 0.75rem;
}

.profile-details {
  margin: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
  margin-left: auto;
}

.premium-info {
  margin-top: 0.5rem;
}

.premium-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1));
  border-radius: 8px;
  border-left: 4px solid var(--color-warning);
}

.premium-icon {
  font-size: 1.5rem;
}

.premium-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.premium-label {
  font-weight: 500;
  color: var(--color-text);
}

.premium-expiry {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.premium-expired {
  font-size: 0.8rem;
  color: var(--color-error);
  font-weight: 500;
}

.profile-actions {
  margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 600px) {
  .profile-content {
    padding: 1rem;
  }
  
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
  
  .user-badges {
    justify-content: center;
  }
  
  .stat-item {
    justify-content: space-between;
  }
}
</style>
