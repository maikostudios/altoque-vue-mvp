// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// Importa tus vistas
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import AdminPanelView from "../views/AdminPanelView.vue";
import UserDashboardView from "../views/UserDashboardView.vue";
import PublicLandingView from "../views/PublicLandingView.vue";

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/login", name: "login", component: LoginView },
  {
    path: "/admin",
    name: "admin",
    component: AdminPanelView,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: UserDashboardView,
    meta: { requiresAuth: true, role: "user" },
  },
  // 🔁 Cambio importante aquí 👇
  {
    path: "/u/:username",
    name: "PublicLanding", // ← Este nombre debe coincidir con lo que usas en router-link
    component: PublicLandingView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Protección de rutas
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (to.meta.requiresAuth) {
    if (!user) return next("/login");
    if (to.meta.role && to.meta.role !== user.role) return next("/login");
  }

  next();
});

export default router;
