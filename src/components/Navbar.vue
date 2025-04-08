<template>
    <nav class="navbar">
        <div class="logo">
            <span class="logo-d">D</span>euna
        </div>
        <ul class="menu">
            <li><a href="#">Inicio</a></li>
            <li><a href="#">Quiénes Somos</a></li>
            <li><a href="#">Contacto</a></li>
            <li><button class="btn login"><router-link to="/login" class=" login">Iniciar
                        Sesión</router-link></button>
            </li>
            <li><button class="btn register">Regístrate</button></li>

        </ul>
    </nav>
</template>

<style scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #121212;
    padding: 1rem 2rem;
    color: white;
}

.logo {
    font-size: 1.6rem;
    font-weight: bold;
}

.logo-d {
    color: #00cccc;
}

.menu {
    list-style: none;
    display: flex;
    gap: 1.2rem;
    align-items: center;
    margin: 0;
    padding: 0;
}

.menu a {
    color: white;
    text-decoration: none;
}

.btn {
    padding: 0.4rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.login {
    background-color: #00cccc;
    color: #121212;
}

.register {
    background-color: #00cccc;
    color: #121212;
}
</style>