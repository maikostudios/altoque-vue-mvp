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
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        this.user = userCredential.user;
        await this.fetchUserRole();
        return true;
      } catch (error) {
        this.error = error.message;
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
        const q = query(
          collection(db, "users"),
          where("email", "==", this.user.email)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          this.role = userData.role || userData.rol;
        } else {
          // Intenta buscar por UID si no encuentra por email
          const userDoc = await getDoc(doc(db, "users", this.user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.role = userData.role || userData.rol;
          } else {
            this.role = "user"; // Rol por defecto
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        this.role = "user"; // Rol por defecto en caso de error
      }
    },
  },
});
