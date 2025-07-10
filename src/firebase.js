import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getPerformance } from "firebase/performance";
import { getAnalytics } from "firebase/analytics";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios de Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// ✅ CONFIGURACIÓN DE EMULATORS PARA DESARROLLO
if (import.meta.env.DEV) {
  // Conectar a emulators solo en desarrollo
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    console.log("🔧 Conectado a Firebase Emulators");
  } catch (error) {
    console.warn(
      "⚠️ Error conectando a emulators (probablemente ya conectados):",
      error.message
    );
  }
}

// ✅ ETAPA 6: Servicios de monitoreo (solo en producción)
export const performance = import.meta.env.PROD ? getPerformance(app) : null;
export const analytics = import.meta.env.PROD ? getAnalytics(app) : null;

export default app;
