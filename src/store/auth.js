import { defineStore } from "pinia";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
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
    loading: false,
    error: null,
  }),

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

    async logout() {
      const auth = getAuth();
      await signOut(auth);
      this.user = null;
      this.role = null;
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

        // Solución temporal: asignar rol admin directamente para tu usuario
        if (this.user.email === "maikostudios@gmail.com") {
          console.log(
            "✅ Usuario admin detectado, asignando rol admin directamente"
          );
          this.role = "admin";
          return;
        }

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
          // Normalizar el rol a minúsculas para consistencia
          const userRole = userData.role || userData.rol;
          console.log("Rol extraído:", userRole);
          this.role = userRole ? userRole.toLowerCase() : "user";
          console.log("Rol final asignado:", this.role);
        } else {
          console.log(
            "Usuario no encontrado en Firestore, asignando rol por defecto"
          );
          this.role = "user"; // Rol por defecto
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        this.role = "user"; // Rol por defecto en caso de error
      }
    },
  },
});
