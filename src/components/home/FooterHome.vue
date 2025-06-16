<template>
    <footer class="footer">
        <div class="footer-content">
            <div class="about">
                <h3>Quiénes Somos</h3>
                <p>Somos Maiko Studios, un equipo dedicado a crear soluciones digitales innovadoras para facilitar tus transacciones financieras.</p>
                <div class="contact-info">
                    <p><strong>info@deuna.com</strong></p>
                    <p><strong>📞 122 4567660</strong></p>
                </div>
            </div>
            <div class="contact">
                <h3>Contacto</h3>
                <form @submit.prevent="submitForm" class="contact-form">
                    <input 
                        v-model="form.nombre" 
                        type="text" 
                        placeholder="Nombre" 
                        required 
                    />
                    <input 
                        v-model="form.correo" 
                        type="email" 
                        placeholder="Correo" 
                        required 
                    />
                    <textarea 
                        v-model="form.mensaje" 
                        placeholder="Mensaje" 
                        rows="4" 
                        required
                    ></textarea>
                    <button type="submit" class="submit-btn">Enviar</button>
                </form>
            </div>
        </div>
    </footer>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
    nombre: '',
    correo: '',
    mensaje: ''
})

const submitForm = () => {
    // Aquí puedes agregar la lógica para enviar el formulario
    console.log('Formulario enviado:', form.value)
    
    // Reset form
    form.value = {
        nombre: '',
        correo: '',
        mensaje: ''
    }
    
    // Mostrar mensaje de éxito (puedes usar una notificación)
    alert('¡Mensaje enviado correctamente!')
}
</script>

<style scoped>
.footer {
    background: #191b1f;
    padding: 48px 8vw 32px 8vw;
    border-radius: 32px 32px 0 0;
    box-shadow: 0 4px 32px 0 rgba(0,204,204,0.08);
    margin-top: 40px;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    gap: 40px;
}

.about, .contact {
    flex: 1;
    max-width: 420px;
}

.about h3, .contact h3 {
    color: #00cccc;
    font-size: 1.2rem;
    margin-bottom: 16px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
}

.about p {
    color: #bababa;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 16px;
    font-family: 'Roboto', sans-serif;
}

.contact-info {
    margin-top: 20px;
}

.contact-info p {
    color: #bababa;
    font-size: 0.95rem;
    margin-bottom: 8px;
    font-family: 'Roboto', sans-serif;
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.contact-form input,
.contact-form textarea {
    background: #15181c;
    border: 1px solid #333;
    border-radius: 8px;
    color: #fff;
    padding: 12px 16px;
    font-size: 1rem;
    font-family: 'Roboto', sans-serif;
    transition: border-color 0.3s ease;
}

.contact-form input:focus,
.contact-form textarea:focus {
    outline: none;
    border-color: #00cccc;
    box-shadow: 0 0 0 2px rgba(0, 204, 204, 0.1);
}

.contact-form input::placeholder,
.contact-form textarea::placeholder {
    color: #666;
}

.submit-btn {
    background: #00cccc;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 12px 0;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
    font-family: 'Montserrat', sans-serif;
}

.submit-btn:hover {
    background: #1c94e0;
}

/* Mobile First - Responsive */
@media (max-width: 768px) {
    .footer {
        padding: 32px 4vw 24px 4vw;
        border-radius: 24px 24px 0 0;
    }
    
    .footer-content {
        flex-direction: column;
        gap: 32px;
    }
    
    .about, .contact {
        max-width: 100%;
    }
    
    .about h3, .contact h3 {
        font-size: 1.1rem;
        text-align: center;
    }
    
    .about p {
        font-size: 0.95rem;
        text-align: center;
    }
    
    .contact-info {
        text-align: center;
    }
    
    .contact-form input,
    .contact-form textarea {
        padding: 10px 14px;
        font-size: 0.95rem;
    }
    
    .submit-btn {
        padding: 10px 0;
        font-size: 0.95rem;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .footer {
        padding: 40px 6vw 28px 6vw;
        border-radius: 28px 28px 0 0;
    }
    
    .footer-content {
        gap: 32px;
    }
    
    .about h3, .contact h3 {
        font-size: 1.15rem;
    }
    
    .about p {
        font-size: 0.95rem;
    }
}

@media (min-width: 1025px) and (max-width: 1200px) {
    .footer {
        padding: 44px 7vw 30px 7vw;
    }
}

/* Animaciones */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.about {
    animation: fadeInUp 0.8s ease-out;
}

.contact {
    animation: fadeInUp 0.8s ease-out 0.2s both;
}
</style>
