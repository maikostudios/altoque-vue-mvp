import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import pinia from "./store";
import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { loadFonts } from "./plugins/webfontloader";
import "./firebase"; // Importar Firebase para inicializarlo

const app = createApp(App);
app.use(vuetify);
app.use(pinia);
app.use(router);
loadFonts();
app.mount("#app");
