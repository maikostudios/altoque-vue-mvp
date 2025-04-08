// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify"; // 👈 importa el plugin

import path from "path";

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }), // 👈 activa el autoimport de componentes Vuetify
  ],
  optimizeDeps: {
    include: ["vuetify"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
