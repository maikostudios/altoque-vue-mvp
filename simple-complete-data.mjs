import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Configuración de Firebase directa
const firebaseConfig = {
  apiKey: "AIzaSyAFfjqq8YIfrduQpiYoMLGreId4vhkX08M",
  authDomain: "deunamaikostudios.firebaseapp.com",
  projectId: "deunamaikostudios",
  storageBucket: "deunamaikostudios.firebasestorage.app",
  messagingSenderId: "515483851699",
  appId: "1:515483851699:web:009b0b4885464ece0bc9c6"
};

// Ubicaciones chilenas simplificadas
const ubicaciones = [
  { region: '13', provincia: '131', comuna: '13101', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Santiago' },
  { region: '13', provincia: '131', comuna: '13119', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Maipú' },
  { region: '13', provincia: '131', comuna: '13114', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Las Condes' },
  { region: '13', provincia: '131', comuna: '13123', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Providencia' },
  { region: '13', provincia: '131', comuna: '13120', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Ñuñoa' },
  { region: '5', provincia: '51', comuna: '5101', regionNombre: 'Valparaíso', provinciaNombre: 'Valparaíso', comunaNombre: 'Valparaíso' },
  { region: '5', provincia: '51', comuna: '5107', regionNombre: 'Valparaíso', provinciaNombre: 'Valparaíso', comunaNombre: 'Viña del Mar' },
  { region: '8', provincia: '81', comuna: '8101', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Concepción' },
  { region: '8', provincia: '81', comuna: '8110', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Talcahuano' },
  { region: '9', provincia: '91', comuna: '9101', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Temuco' }
];

const sexos = ['masculino', 'femenino', 'otro'];

function generateRandomBirthDate() {
  const today = new Date();
  const minAge = 18;
  const maxAge = 65;
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const randomTime = minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime());
  return new Date(randomTime);
}

function getRandomLocation() {
  return ubicaciones[Math.floor(Math.random() * ubicaciones.length)];
}

function getRandomGender() {
  return sexos[Math.floor(Math.random() * sexos.length)];
}

async function completeData() {
  try {
    console.log('🚀 Iniciando completado de datos...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Conectado a Firebase');
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`📊 Total usuarios: ${usersSnapshot.size}`);
    
    let updatedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      const userRole = userData.rol || userData.role;
      if (userRole !== 'usuario') {
        console.log(`⏭️ Saltando ${userData.email} (rol: ${userRole})`);
        continue;
      }
      
      const updateData = {};
      let needsUpdate = false;
      
      // Completar fecha de nacimiento
      if (!userData.fechaNacimiento) {
        updateData.fechaNacimiento = generateRandomBirthDate();
        needsUpdate = true;
        console.log(`📅 Agregando fecha de nacimiento a ${userData.email}`);
      }
      
      // Completar ubicación
      if (!userData.comunaNombre) {
        const location = getRandomLocation();
        updateData.pais = 'CL';
        updateData.region = location.region;
        updateData.provincia = location.provincia;
        updateData.comuna = location.comuna;
        updateData.regionNombre = location.regionNombre;
        updateData.provinciaNombre = location.provinciaNombre;
        updateData.comunaNombre = location.comunaNombre;
        needsUpdate = true;
        console.log(`📍 Agregando ubicación a ${userData.email}: ${location.comunaNombre}`);
      }
      
      // Completar sexo
      if (!userData.sexo) {
        updateData.sexo = getRandomGender();
        needsUpdate = true;
        console.log(`👤 Agregando sexo a ${userData.email}: ${updateData.sexo}`);
      }
      
      // Migrar role a rol
      if (userData.role && !userData.rol) {
        updateData.rol = userData.role;
        needsUpdate = true;
        console.log(`🔄 Migrando role → rol para ${userData.email}`);
      }
      
      if (needsUpdate) {
        await updateDoc(doc(db, 'users', userId), updateData);
        updatedCount++;
        console.log(`✅ Usuario actualizado: ${userData.email}`);
      } else {
        console.log(`✓ Usuario ya completo: ${userData.email}`);
      }
    }
    
    console.log(`\n🎉 Proceso completado! ${updatedCount} usuarios actualizados`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

completeData();
