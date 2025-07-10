import { defineStore } from "pinia";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    role: null,
    userProfile: null, // ✅ NUEVO: Datos adicionales del usuario
    loading: false,
    error: null,
  }),

  getters: {
    // ✅ NUEVO: Verificar si el usuario está autenticado
    isAuthenticated: (state) => !!state.user,

    // ✅ NUEVO: Información completa del usuario
    userInfo: (state) => state.userProfile,

    // ✅ NUEVO: Verificar si es usuario premium
    isPremium: (state) => state.userProfile?.isPremium || false,

    // ✅ NUEVO: Obtener el rol del usuario
    userRole: (state) => state.role || state.userProfile?.rol || "usuario",
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;

      try {
        console.log("Intentando login con:", email);
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log("Login exitoso:", userCredential.user.uid);
        this.user = userCredential.user;
        await this.fetchUserRole();
        console.log("Rol obtenido:", this.role);
        return true;
      } catch (error) {
        console.error("Error en login:", error);

        // Traducir errores comunes de Firebase
        let errorMessage = error.message;
        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "No existe una cuenta con este correo electrónico.";
            break;
          case "auth/wrong-password":
            errorMessage = "Contraseña incorrecta.";
            break;
          case "auth/invalid-email":
            errorMessage = "El correo electrónico no es válido.";
            break;
          case "auth/user-disabled":
            errorMessage = "Esta cuenta ha sido deshabilitada.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Demasiados intentos fallidos. Intenta más tarde.";
            break;
          case "auth/network-request-failed":
            errorMessage = "Error de conexión. Verifica tu internet.";
            break;
          default:
            errorMessage = "Error al iniciar sesión: " + error.message;
        }

        this.error = errorMessage;
        return false;
      } finally {
        this.loading = false;
      }
    },

    // ✅ NUEVO: Autenticación con Google
    async signInWithGoogle() {
      this.loading = true;
      this.error = null;

      try {
        console.log("🔐 Iniciando autenticación con Google...");
        const auth = getAuth();
        const provider = new GoogleAuthProvider();

        // Configurar el provider para obtener información adicional
        provider.addScope("email");
        provider.addScope("profile");

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        console.log("✅ Autenticación con Google exitosa:", user.email);

        // Verificar si es un usuario nuevo
        const isNewUser = result.additionalUserInfo?.isNewUser;
        console.log("🆕 Usuario nuevo:", isNewUser);

        this.user = user;
        await this.fetchUserRole();

        return {
          success: true,
          isNewUser,
          user,
          needsOnboarding: !this.userProfile?.onboardingCompleted,
        };
      } catch (error) {
        console.error("❌ Error en autenticación con Google:", error);

        let errorMessage = "Error al iniciar sesión con Google";

        switch (error.code) {
          case "auth/popup-closed-by-user":
            errorMessage =
              "Ventana de autenticación cerrada. Inténtalo de nuevo.";
            break;
          case "auth/popup-blocked":
            errorMessage =
              "Popup bloqueado por el navegador. Permite popups para este sitio.";
            break;
          case "auth/cancelled-popup-request":
            errorMessage = "Solicitud de autenticación cancelada.";
            break;
          case "auth/network-request-failed":
            errorMessage = "Error de conexión. Verifica tu internet.";
            break;
          default:
            errorMessage = `Error de autenticación: ${error.message}`;
        }

        this.error = errorMessage;
        return {
          success: false,
          error: errorMessage,
          errorCode: error.code,
        };
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      const auth = getAuth();
      await signOut(auth);
      this.user = null;
      this.role = null;
      this.userProfile = null; // ✅ LIMPIAR: Datos del perfil
    },

    async setUser(user) {
      this.user = user;
      if (user) {
        await this.fetchUserRole();
      }
    },

    async fetchUserRole() {
      if (!this.user) return;

      try {
        console.log("🔍 Buscando rol para usuario:", this.user.email);
        console.log("🔍 UID del usuario:", this.user.uid);

        // ✅ REMOVIDO: Hardcoded admin detection (inseguro)
        // Ahora se obtiene el rol desde Firestore de forma segura

        // Lista de colecciones posibles donde buscar el usuario
        // Basándome en tus datos, parece que está en una colección específica
        const collections = ["usuarios", "users", "user"];
        let userData = null;

        // Buscar en cada colección
        for (const collectionName of collections) {
          try {
            console.log(
              `🔍 Buscando en colección '${collectionName}' por email...`
            );
            const q = query(
              collection(db, collectionName),
              where("email", "==", this.user.email)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              userData = querySnapshot.docs[0].data();
              console.log(
                `✅ Usuario encontrado en colección '${collectionName}' por email:`,
                userData
              );
              break;
            } else {
              console.log(`❌ No encontrado en '${collectionName}' por email`);
            }
          } catch (error) {
            console.log(
              `❌ Error buscando en colección '${collectionName}':`,
              error.message
            );
          }
        }

        // Si no se encontró por email, buscar por UID
        if (!userData) {
          console.log("🔍 No encontrado por email, buscando por UID...");
          for (const collectionName of collections) {
            try {
              console.log(
                `🔍 Buscando en colección '${collectionName}' por UID: ${this.user.uid}`
              );
              const userDoc = await getDoc(
                doc(db, collectionName, this.user.uid)
              );
              if (userDoc.exists()) {
                userData = userDoc.data();
                console.log(
                  `✅ Usuario encontrado por UID en colección '${collectionName}':`,
                  userData
                );
                break;
              } else {
                console.log(`❌ No encontrado en '${collectionName}' por UID`);
              }
            } catch (error) {
              console.log(
                `❌ Error buscando por UID en colección '${collectionName}':`,
                error.message
              );
            }
          }
        }

        if (userData) {
          console.log("Datos del usuario encontrados:", userData);
          // ✅ ESTANDARIZADO: Usar solo el campo 'rol'
          const userRole = userData.rol;
          console.log("Rol extraído:", userRole);
          this.role = userRole ? userRole.toLowerCase() : "usuario";
          console.log("Rol final asignado:", this.role);

          // ✅ NUEVO: Almacenar todos los datos del usuario
          this.userProfile = {
            ...userData, // Incluir todos los datos del usuario
            isPremium: userData.isPremium || false,
            planType: userData.planType || "free",
            onboardingCompleted: userData.onboardingCompleted || false,
            idVerificationStatus: userData.idVerificationStatus || "pending",
            rol: userRole, // Asegurar que el rol esté disponible
          };
        } else {
          console.log(
            "Usuario no encontrado en Firestore, asignando rol por defecto"
          );
          this.role = "usuario"; // Rol por defecto
          this.userProfile = {
            isPremium: false,
            planType: "free",
            onboardingCompleted: false,
            idVerificationStatus: "pending",
          };
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        this.role = "user"; // Rol por defecto en caso de error
      }
    },
  },
});
