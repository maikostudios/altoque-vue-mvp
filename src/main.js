import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const app = createApp(App);

app.use(router); // 👈 usar el router
app.mount("#app"); // 👈 renderizar el app en el elemento con id app
