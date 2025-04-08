import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/auth"; // Asegúrate de que la ruta sea correcta

const routes = [
  { path: "/", component: () => import("@/views/HomeView.vue") },
  { path: "/login", component: () => import("@/views/LoginView.vue") },
  {
    path: "/dashboard",
    component: () => import("@/views/UserDashboardView.vue"),
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/admin",
    component: () => import("@/views/AdminPanelView.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/:username",
    name: "PublicLanding",
    component: () => import("@/views/PublicLandingView.vue"),
  },
  {
    path: "/vendedor",
    component: () => import("@/views/SellerDashboardView.vue"),
    meta: { requiresAuth: true, role: "vendedor" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const auth = getAuth();

  if (!authStore.user) {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await authStore.setUser(currentUser);
    }
  }

  const isAuthenticated = !!authStore.user;

  // Si está intentando ir a login y ya está logueado, redirige según su rol
  if (to.path === "/login" && isAuthenticated) {
    if (authStore.role === "admin") return next("/admin");
    if (authStore.role === "vendedor") return next("/vendedor");
    return next("/dashboard");
  }

  // Protección de rutas privadas (si hay rutas protegidas más adelante)
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next("/login");
  }

  next(); // todo bien
});

export default router;
