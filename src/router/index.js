import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/HomeView.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue"),
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../views/UserDashboardView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("../views/AdminPanelView.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/vendedor",
    name: "Vendedor",
    component: () => import("../views/SellerDashboardView.vue"),
    meta: { requiresAuth: true, role: "vendedor" },
  },
  {
    path: "/usuario",
    name: "Usuario",
    component: () => import("../views/UserDashboardView.vue"),
    meta: { requiresAuth: true, role: "usuario" },
  },
  {
    path: "/datostransferencia",
    name: "DatosTransferencia",
    component: () => import("../views/PublicTransferView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/datostransferencia/:id",
    name: "DatosTransferenciaConId",
    component: () => import("../views/PublicTransferView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/u/:username",
    name: "PublicLanding",
    component: () => import("../views/PublicLandingView.vue"),
  },
  {
    path: "/ayuda",
    name: "Ayuda",
    component: () => import("../views/HelpView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/soporte",
    name: "Soporte",
    component: () => import("../views/SupportView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/support-dashboard",
    name: "SupportDashboard",
    component: () => import("../views/SupportDashboardView.vue"),
    meta: { requiresAuth: true, requiresRole: "soporte" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Esperar a que Firebase Auth se inicialice antes de resolver la navegación
let authReady = false;
const auth = getAuth();

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    if (authReady) {
      resolve(auth.currentUser);
    } else {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          authReady = true;
          unsubscribe();
          resolve(user);
        },
        reject
      );
    }
  });
};

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Esperar a que Firebase Auth esté listo
  const currentUser = await getCurrentUser();

  // Si el usuario está autenticado pero no está en el store, actualizarlo
  if (currentUser && !authStore.user) {
    await authStore.setUser(currentUser);
  }

  const isAuthenticated = !!authStore.user;

  // Redirigir según el rol si ya está autenticado e intenta ir a login
  if (to.path === "/login" && isAuthenticated) {
    console.log(
      "Usuario autenticado intentando ir a login, rol:",
      authStore.role
    );
    if (authStore.role === "admin") {
      console.log("Redirigiendo admin a /admin");
      return next("/admin");
    }
    if (authStore.role === "soporte") {
      console.log("Redirigiendo soporte a /support-dashboard");
      return next("/support-dashboard");
    }
    if (authStore.role === "vendedor") {
      console.log("Redirigiendo vendedor a /vendedor");
      return next("/vendedor");
    }
    if (authStore.role === "usuario") {
      console.log("Redirigiendo usuario a /usuario");
      return next("/usuario");
    }
    console.log("Redirigiendo usuario por defecto a /dashboard");
    return next("/dashboard");
  }

  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next("/login");
  }

  // Verificar si la ruta requiere un rol específico
  if (to.meta.requiresRole) {
    const requiredRole = to.meta.requiresRole;
    const userRole = authStore.role;

    // Admin puede acceder a todo, otros roles solo a su área específica
    const hasAccess = userRole === "admin" || userRole === requiredRole;

    if (!hasAccess) {
      console.log(
        `Acceso denegado. Rol requerido: ${requiredRole}, rol actual: ${userRole}`
      );

      // Redirigir según el rol del usuario
      if (userRole === "soporte") {
        return next("/support-dashboard");
      } else if (userRole === "vendedor") {
        return next("/vendedor");
      } else {
        return next("/usuario");
      }
    }
  }

  // Verificar si la ruta requiere un rol específico (legacy)
  if (to.meta.role && authStore.role !== to.meta.role) {
    return next("/dashboard");
  }

  next();
});

export default router;
