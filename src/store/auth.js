// src/store/auth.js
import { defineStore } from "pinia";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import router from "@/router"; // Ojo: importa directamente el router

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    role: null,
    loading: false,
  }),

  actions: {
    async login(email, password) {
      this.loading = true;
      try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        this.user = user;

        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          this.role = userData.rol;

          // Redirección automática por rol
          if (userData.rol === "ADMIN") {
            router.push("/admin");
          } else if (userData.rol === "VENDEDOR") {
            router.push("/vendedor");
          } else {
            router.push("/usuario");
          }
        } else {
          alert("El usuario no existe en Firestore");
        }
      } catch (error) {
        alert("Error al iniciar sesión: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      const auth = getAuth();
      await signOut(auth);
      this.user = null;
      this.role = null;
      this.loading = false;
      router.push("/"); // Redirigir a la página de inicio después de cerrar sesión
    },
  },
});
