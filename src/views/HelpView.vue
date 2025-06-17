<template>
  <div class="help-view">
    <div class="help-container">
      <!-- Header -->
      <div class="help-header">
        <h1>❓ Centro de Ayuda</h1>
        <p>Encuentra respuestas a las preguntas más frecuentes</p>
      </div>

      <!-- Buscador -->
      <div class="search-section">
        <div class="search-box">
          <i class="bi bi-search"></i>
          <input v-model="searchQuery" type="text" placeholder="Buscar en las preguntas frecuentes..."
            class="search-input">
        </div>
      </div>

      <!-- Categorías -->
      <div class="categories-section">
        <h2>📚 Categorías</h2>
        <div class="categories-grid">
          <button v-for="category in categories" :key="category.id" @click="selectedCategory = category.id"
            class="category-card" :class="{ active: selectedCategory === category.id }">
            <div class="category-icon">{{ category.icon }}</div>
            <h3>{{ category.name }}</h3>
            <p>{{ category.description }}</p>
          </button>
        </div>
      </div>

      <!-- FAQs -->
      <div class="faqs-section">
        <h2>🔍 Preguntas Frecuentes</h2>
        <div class="faqs-list">
          <div v-for="faq in filteredFaqs" :key="faq.id" class="faq-item">
            <button @click="toggleFaq(faq.id)" class="faq-question" :class="{ active: openFaqs.includes(faq.id) }">
              <span>{{ faq.question }}</span>
              <i class="bi bi-chevron-down"></i>
            </button>
            <div v-if="openFaqs.includes(faq.id)" class="faq-answer">
              <div v-html="faq.answer"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contacto -->
      <div class="contact-section">
        <div class="contact-card">
          <h3>🤝 ¿No encontraste lo que buscabas?</h3>
          <p>Nuestro equipo de soporte está aquí para ayudarte</p>
          <div class="contact-actions">
            <router-link to="/soporte" class="btn btn-primary">
              <i class="bi bi-ticket-perforated"></i>
              Crear Ticket de Soporte
            </router-link>
            <a href="mailto:soporte@maikostudios.com" class="btn btn-ghost">
              <i class="bi bi-envelope"></i>
              Enviar Email
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedCategory = ref('all')
const openFaqs = ref([])

// Categorías
const categories = [
  {
    id: 'all',
    name: 'Todas',
    description: 'Ver todas las preguntas',
    icon: '📋'
  },
  {
    id: 'account',
    name: 'Cuenta',
    description: 'Registro, login y perfil',
    icon: '👤'
  },
  {
    id: 'cards',
    name: 'Tarjetas',
    description: 'Gestión de tarjetas bancarias',
    icon: '💳'
  },
  {
    id: 'qr',
    name: 'Códigos QR',
    description: 'Generación y uso de QR',
    icon: '📱'
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Funciones y planes Premium',
    icon: '⭐'
  },
  {
    id: 'technical',
    name: 'Técnico',
    description: 'Problemas técnicos',
    icon: '🔧'
  }
]

// FAQs
const faqs = [
  {
    id: 1,
    category: 'account',
    question: '¿Cómo creo una cuenta en De Una?',
    answer: `
      <p>Para crear una cuenta en De Una:</p>
      <ol>
        <li>Ve a la página de registro</li>
        <li>Completa tus datos personales</li>
        <li>Verifica tu correo electrónico</li>
        <li>¡Listo! Ya puedes usar la aplicación</li>
      </ol>
    `
  },
  {
    id: 2,
    category: 'cards',
    question: '¿Cuántas tarjetas puedo registrar?',
    answer: `
      <p>Depende de tu plan:</p>
      <ul>
        <li><strong>Plan Gratuito:</strong> 1 tarjeta bancaria</li>
        <li><strong>Plan Premium:</strong> Hasta 5 tarjetas bancarias</li>
      </ul>
      <p>Puedes actualizar a Premium en cualquier momento desde tu dashboard.</p>
    `
  },
  {
    id: 3,
    category: 'qr',
    question: '¿Cómo funciona el código QR?',
    answer: `
      <p>El código QR te permite compartir tus datos bancarios de forma segura:</p>
      <ol>
        <li>Genera tu QR desde el dashboard</li>
        <li>Compártelo con quien necesite transferirte dinero</li>
        <li>Al escanearlo, verán tus datos bancarios</li>
        <li>Podrán hacer la transferencia fácilmente</li>
      </ol>
      <p><strong>Nota:</strong> Solo se muestran los datos necesarios para la transferencia, nunca información sensible.</p>
    `
  },
  {
    id: 4,
    category: 'premium',
    question: '¿Qué incluye el plan Premium?',
    answer: `
      <p>El plan Premium incluye:</p>
      <ul>
        <li>Hasta 5 tarjetas bancarias</li>
        <li>Estadísticas detalladas de uso</li>
        <li>Personalización avanzada</li>
        <li>Soporte prioritario</li>
        <li>Análisis de visitas y escaneos</li>
      </ul>
      <p>El plan Premium tiene una duración de 1 año desde la activación.</p>
    `
  },
  {
    id: 5,
    category: 'technical',
    question: 'El código QR no funciona, ¿qué hago?',
    answer: `
      <p>Si tu código QR no funciona, intenta:</p>
      <ol>
        <li>Verificar que tengas conexión a internet</li>
        <li>Regenerar el código QR desde tu dashboard</li>
        <li>Asegurarte de que la tarjeta esté activa</li>
        <li>Verificar que los datos de la tarjeta sean correctos</li>
      </ol>
      <p>Si el problema persiste, <a href="/soporte">crea un ticket de soporte</a> y te ayudaremos.</p>
    `
  },
  {
    id: 6,
    category: 'cards',
    question: '¿Puedo editar los datos de mi tarjeta?',
    answer: `
      <p>Sí, puedes editar los datos de tus tarjetas:</p>
      <ol>
        <li>Ve a tu dashboard</li>
        <li>Busca la tarjeta que quieres editar</li>
        <li>Haz clic en el ícono de editar (✏️)</li>
        <li>Modifica los datos necesarios</li>
        <li>Guarda los cambios</li>
      </ol>
      <p>Los cambios se reflejarán inmediatamente en tu código QR.</p>
    `
  },
  {
    id: 7,
    category: 'account',
    question: '¿Cómo cambio mi contraseña?',
    answer: `
      <p>Para cambiar tu contraseña:</p>
      <ol>
        <li>Ve a tu dashboard</li>
        <li>Entra en la sección "Configuración"</li>
        <li>Haz clic en "Cambiar Contraseña"</li>
        <li>Ingresa tu contraseña actual y la nueva</li>
        <li>Confirma los cambios</li>
      </ol>
    `
  },
  {
    id: 8,
    category: 'premium',
    question: '¿Cómo renuevo mi plan Premium?',
    answer: `
      <p>Para renovar tu plan Premium:</p>
      <ol>
        <li>Ve a tu dashboard</li>
        <li>En la sección "Configuración", busca "Plan Actual"</li>
        <li>Haz clic en "Renovar Premium"</li>
        <li>Sigue las instrucciones de pago</li>
      </ol>
      <p>Te recomendamos renovar antes de que expire para no perder el acceso a las funciones Premium.</p>
    `
  }
]

// Computed
const filteredFaqs = computed(() => {
  let filtered = faqs

  // Filtrar por categoría
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(faq => faq.category === selectedCategory.value)
  }

  // Filtrar por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
const toggleFaq = (faqId) => {
  const index = openFaqs.value.indexOf(faqId)
  if (index > -1) {
    openFaqs.value.splice(index, 1)
  } else {
    openFaqs.value.push(faqId)
  }
}
</script>

<style scoped>
.help-view {
  min-height: 100vh;
  background: #121212;
  color: #ffffff;
  padding: 20px;
}

.help-container {
  max-width: 1000px;
  margin: 0 auto;
}

.help-header {
  text-align: center;
  margin-bottom: 40px;
}

.help-header h1 {
  font-size: 2.5rem;
  margin-bottom: 12px;
  color: #00cccc;
}

.help-header p {
  font-size: 1.1rem;
  color: #ccc;
}

.search-section {
  margin-bottom: 40px;
}

.search-box {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 12px;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #00cccc;
  box-shadow: 0 0 0 3px rgba(0, 204, 204, 0.1);
}

.categories-section {
  margin-bottom: 40px;
}

.categories-section h2 {
  margin-bottom: 20px;
  color: #ffffff;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.category-card {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  background: #333;
  border-color: #00cccc;
  transform: translateY(-2px);
}

.category-card.active {
  background: rgba(0, 204, 204, 0.1);
  border-color: #00cccc;
}

.category-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.category-card h3 {
  margin: 0 0 8px 0;
  color: #ffffff;
  font-size: 1.1rem;
}

.category-card p {
  margin: 0;
  color: #ccc;
  font-size: 0.9rem;
}

.faqs-section h2 {
  margin-bottom: 20px;
  color: #ffffff;
}

.faq-item {
  background: #2a2a2a;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}

.faq-question {
  width: 100%;
  padding: 20px;
  background: none;
  border: none;
  color: #ffffff;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.faq-question:hover {
  background: rgba(255, 255, 255, 0.05);
}

.faq-question.active {
  background: rgba(0, 204, 204, 0.1);
  color: #00cccc;
}

.faq-question i {
  transition: transform 0.3s ease;
}

.faq-question.active i {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 20px 20px;
  color: #ccc;
  line-height: 1.6;
}

.contact-section {
  margin-top: 60px;
}

.contact-card {
  background: linear-gradient(135deg, rgba(0, 204, 204, 0.1), rgba(28, 148, 224, 0.1));
  border: 1px solid rgba(0, 204, 204, 0.3);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
}

.contact-card h3 {
  margin: 0 0 12px 0;
  color: #00cccc;
  font-size: 1.3rem;
}

.contact-card p {
  margin: 0 0 24px 0;
  color: #ccc;
  font-size: 1rem;
}

.contact-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #00cccc;
  color: #121212;
}

.btn-primary:hover {
  background: #1c94e0;
  transform: translateY(-2px);
}

.btn-ghost {
  background: transparent;
  color: #00cccc;
  border: 1px solid #00cccc;
}

.btn-ghost:hover {
  background: rgba(0, 204, 204, 0.1);
}

/* Deep link styles for FAQ answers */
.faq-answer :deep(a) {
  color: #00cccc;
  text-decoration: none;
}

.faq-answer :deep(a:hover) {
  color: #1c94e0;
  text-decoration: underline;
}

.faq-answer :deep(ul),
.faq-answer :deep(ol) {
  margin: 12px 0;
  padding-left: 20px;
}

.faq-answer :deep(li) {
  margin-bottom: 8px;
}

.faq-answer :deep(strong) {
  color: #ffffff;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .help-header h1 {
    font-size: 2rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .contact-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}
</style>
