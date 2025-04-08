import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import pinia from "./store"; // 👈 importar el store
import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { loadFonts } from "./plugins/webfontloader";

const app = createApp(App);
app.use(vuetify); // 👈 usar vuetify
app.use(pinia); // 👈 usar el store
app.use(router); // 👈 usar el router
loadFonts(); // 👈 cargar las fuentes
app.mount("#app"); // 👈 renderizar el app en el elemento con id app
