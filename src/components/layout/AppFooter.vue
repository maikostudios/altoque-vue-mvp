<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <div class="footer-brand">
          <span class="brand-d">D</span>euna
        </div>
        <p class="footer-description">
          Simplificando tus transferencias bancarias con tecnología innovadora.
        </p>
      </div>

      <div class="footer-section">
        <h4>Enlaces Útiles</h4>
        <ul class="footer-links">
          <li>
            <router-link to="/ayuda">
              <i class="bi bi-question-circle"></i>
              Centro de Ayuda
            </router-link>
          </li>
          <li>
            <router-link to="/soporte">
              <i class="bi bi-headset"></i>
              Soporte Técnico
            </router-link>
          </li>
          <li>
            <router-link to="/usuario">
              <i class="bi bi-person"></i>
              Mi Perfil
            </router-link>
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Contacto</h4>
        <div class="contact-info">
          <div class="contact-item">
            <i class="bi bi-envelope"></i>
            <span>soporte@maikostudios.com</span>
          </div>
          <div class="contact-item">
            <i class="bi bi-telephone"></i>
            <span>+56 9 1234 5678</span>
          </div>
          <div class="contact-item">
            <i class="bi bi-geo-alt"></i>
            <span>Santiago, Chile</span>
          </div>
        </div>
      </div>

      <div class="footer-section">
        <h4>Síguenos</h4>
        <div class="social-links">
          <a href="#" class="social-link" aria-label="Facebook">
            <i class="bi bi-facebook"></i>
          </a>
          <a href="#" class="social-link" aria-label="Twitter">
            <i class="bi bi-twitter"></i>
          </a>
          <a href="#" class="social-link" aria-label="Instagram">
            <i class="bi bi-instagram"></i>
          </a>
          <a href="#" class="social-link" aria-label="LinkedIn">
            <i class="bi bi-linkedin"></i>
          </a>
        </div>
        
        <!-- Botón de soporte destacado -->
        <router-link to="/soporte" class="support-button">
          <i class="bi bi-headset"></i>
          Contactar Soporte
        </router-link>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p>&copy; {{ currentYear }} Maiko Studios. Todos los derechos reservados.</p>
        <div class="footer-bottom-links">
          <a href="#" class="footer-link">Términos de Servicio</a>
          <a href="#" class="footer-link">Política de Privacidad</a>
          <a href="#" class="footer-link">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.app-footer {
  background: #191b1f;
  border-top: 1px solid #333;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 20px 32px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.footer-section h4 {
  color: #00cccc;
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.footer-brand {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12px;
  font-family: 'Montserrat', sans-serif;
}

.brand-d {
  color: #00cccc;
}

.footer-description {
  color: #ccc;
  line-height: 1.6;
  margin: 0;
  font-size: 0.9rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #ccc;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
  font-size: 0.9rem;
}

.footer-links a:hover {
  color: #00cccc;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 0.9rem;
}

.contact-item i {
  color: #00cccc;
  width: 16px;
  text-align: center;
}

.social-links {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.social-link {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.social-link:hover {
  background: #00cccc;
  color: #121212;
  transform: translateY(-2px);
}

.support-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #00cccc, #1c94e0);
  color: #121212;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 204, 204, 0.2);
}

.support-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 204, 204, 0.3);
}

.footer-bottom {
  border-top: 1px solid #333;
  background: #121212;
}

.footer-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-bottom-content p {
  margin: 0;
  color: #888;
  font-size: 0.8rem;
}

.footer-bottom-links {
  display: flex;
  gap: 20px;
}

.footer-link {
  color: #888;
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #00cccc;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .footer-content {
    padding: 32px 16px 24px;
    grid-template-columns: 1fr;
    gap: 24px;
    text-align: center;
  }
  
  .footer-brand {
    font-size: 1.5rem;
  }
  
  .footer-section h4 {
    font-size: 1rem;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .support-button {
    display: inline-flex;
    width: auto;
  }
  
  .footer-bottom-content {
    padding: 16px;
    flex-direction: column;
    text-align: center;
  }
  
  .footer-bottom-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .footer-content {
    padding: 24px 12px 20px;
  }
  
  .footer-bottom-links {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
