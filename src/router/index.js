// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// Importa tus vistas
import LoginView from "../views/LoginView.vue";
import AdminPanelView from "../views/AdminPanelView.vue";
import UserDashboardView from "../views/UserDashboardView.vue";
import PublicLandingView from "../views/PublicLandingView.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/admin",
    name: "AdminPanel",
    component: AdminPanelView,
  },
  {
    path: "/dashboard",
    name: "UserDashboard",
    component: UserDashboardView,
  },
  {
    path: "/landing/:username",
    name: "PublicLanding",
    component: PublicLandingView,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
