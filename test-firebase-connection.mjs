import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('🔧 Verificando conexión a Firebase...');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

console.log('📋 Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey
});

try {
  // Inicializar Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log('✅ Firebase inicializado correctamente');
  
  // Obtener usuarios
  const usersSnapshot = await getDocs(collection(db, 'users'));
  console.log(`📊 Total usuarios encontrados: ${usersSnapshot.size}`);
  
  usersSnapshot.forEach((doc) => {
    const userData = doc.data();
    const userRole = userData.rol || userData.role;
    console.log(`👤 ${userData.email || userData.nombre} - Rol: ${userRole}`);
    
    if (userRole === 'usuario') {
      console.log(`   📍 Comuna: ${userData.comunaNombre || userData.comuna || 'Sin definir'}`);
      console.log(`   👤 Sexo: ${userData.sexo || 'Sin definir'}`);
      console.log(`   📅 Fecha nacimiento: ${userData.fechaNacimiento ? 'Definida' : 'Sin definir'}`);
    }
  });
  
} catch (error) {
  console.error('❌ Error:', error);
}
