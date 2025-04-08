<template>
    <section class="about-contact">
        <div class="about">
            <h3>Quiénes Somos</h3>
            <p>Somos Maiko Studios, un equipo dedicado a crear soluciones digitales innovadoras para facilitar tus
                transacciones financieras.</p>
            <p><strong>Email:</strong> info@deu.na.com</p>
            <p><strong>Teléfono:</strong> 122 4567660</p>
        </div>
        <form @submit.prevent class="contact">
            <h3>Contacto</h3>
            <input type="text" placeholder="Nombre" required>
            <input type="email" placeholder="Correo" required>
            <textarea placeholder="Mensaje" required></textarea>
            <button type="submit">Enviar</button>
        </form>
    </section>
</template>

<style scoped>
.about-contact {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2rem 1rem;
    background: linear-gradient(to bottom, #121212, #00cccc11);
    color: white;
}

.about h3,
.contact h3 {
    margin-bottom: 0.5rem;
    color: #00cccc;
}

.contact input,
.contact textarea {
    width: 100%;
    margin-bottom: 1rem;
    padding: 0.6rem;
    border: none;
    border-radius: 4px;
    background: #222;
    color: white;
}

.contact button {
    background: #00cccc;
    color: #121212;
    padding: 0.6rem;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s ease;
}

.contact button:hover {
    background: #00bbbb;
}

@media (min-width: 768px) {
    .about-contact {
        flex-direction: row;
        justify-content: space-between;
    }

    .about,
    .contact {
        flex: 1;
        max-width: 45%;
    }
}
</style>