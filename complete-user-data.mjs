import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Datos de ubicaciones chilenas realistas
const ubicacionesChile = [
  { region: '13', provincia: '131', comuna: '13101', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Santiago' },
  { region: '13', provincia: '131', comuna: '13102', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Cerrillos' },
  { region: '13', provincia: '131', comuna: '13103', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Cerro Navia' },
  { region: '13', provincia: '131', comuna: '13104', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Conchalí' },
  { region: '13', provincia: '131', comuna: '13105', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'El Bosque' },
  { region: '13', provincia: '131', comuna: '13106', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Estación Central' },
  { region: '13', provincia: '131', comuna: '13107', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Huechuraba' },
  { region: '13', provincia: '131', comuna: '13108', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Independencia' },
  { region: '13', provincia: '131', comuna: '13109', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'La Cisterna' },
  { region: '13', provincia: '131', comuna: '13110', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'La Florida' },
  { region: '13', provincia: '131', comuna: '13111', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'La Granja' },
  { region: '13', provincia: '131', comuna: '13112', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'La Pintana' },
  { region: '13', provincia: '131', comuna: '13113', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'La Reina' },
  { region: '13', provincia: '131', comuna: '13114', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Las Condes' },
  { region: '13', provincia: '131', comuna: '13115', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Lo Barnechea' },
  { region: '13', provincia: '131', comuna: '13116', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Lo Espejo' },
  { region: '13', provincia: '131', comuna: '13117', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Lo Prado' },
  { region: '13', provincia: '131', comuna: '13118', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Macul' },
  { region: '13', provincia: '131', comuna: '13119', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Maipú' },
  { region: '13', provincia: '131', comuna: '13120', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Ñuñoa' },
  { region: '13', provincia: '131', comuna: '13121', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Pedro Aguirre Cerda' },
  { region: '13', provincia: '131', comuna: '13122', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Peñalolén' },
  { region: '13', provincia: '131', comuna: '13123', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Providencia' },
  { region: '13', provincia: '131', comuna: '13124', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Pudahuel' },
  { region: '13', provincia: '131', comuna: '13125', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Quilicura' },
  { region: '13', provincia: '131', comuna: '13126', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Quinta Normal' },
  { region: '13', provincia: '131', comuna: '13127', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Recoleta' },
  { region: '13', provincia: '131', comuna: '13128', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Renca' },
  { region: '13', provincia: '131', comuna: '13129', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'San Joaquín' },
  { region: '13', provincia: '131', comuna: '13130', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'San Miguel' },
  { region: '13', provincia: '131', comuna: '13131', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'San Ramón' },
  { region: '13', provincia: '131', comuna: '13132', regionNombre: 'Metropolitana', provinciaNombre: 'Santiago', comunaNombre: 'Vitacura' },
  
  // Valparaíso
  { region: '5', provincia: '51', comuna: '5101', regionNombre: 'Valparaíso', provinciaNombre: 'Valparaíso', comunaNombre: 'Valparaíso' },
  { region: '5', provincia: '51', comuna: '5102', regionNombre: 'Valparaíso', provinciaNombre: 'Valparaíso', comunaNombre: 'Casablanca' },
  { region: '5', provincia: '51', comuna: '5103', regionNombre: 'Valparaíso', provinciaNombre: 'Valparaíso', comunaNombre: 'Concón' },
  { region: '5', provincia: '51', comuna: '5104', regionNombre: 'Valparaíso', provinciaNombre: 'Valparaíso', comunaNombre: 'Juan Fernández' },
  { region: '5', provincia: '51', comuna: '5105', regionNombre: 'Valparaíso', provinciaNombre: 'Valparaíso', comunaNombre: 'Puchuncaví' },
  { region: '5', provincia: '51', comuna: '5106', regionNombre: 'Valparaíso', provinciaNombre: 'Valparaíso', comunaNombre: 'Quintero' },
  { region: '5', provincia: '51', comuna: '5107', regionNombre: 'Valparaíso', provinciaNombre: 'Valparaíso', comunaNombre: 'Viña del Mar' },
  
  // Concepción
  { region: '8', provincia: '81', comuna: '8101', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Concepción' },
  { region: '8', provincia: '81', comuna: '8102', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Coronel' },
  { region: '8', provincia: '81', comuna: '8103', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Chiguayante' },
  { region: '8', provincia: '81', comuna: '8104', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Florida' },
  { region: '8', provincia: '81', comuna: '8105', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Hualqui' },
  { region: '8', provincia: '81', comuna: '8106', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Lota' },
  { region: '8', provincia: '81', comuna: '8107', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Penco' },
  { region: '8', provincia: '81', comuna: '8108', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'San Pedro de la Paz' },
  { region: '8', provincia: '81', comuna: '8109', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Santa Juana' },
  { region: '8', provincia: '81', comuna: '8110', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Talcahuano' },
  { region: '8', provincia: '81', comuna: '8111', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Tomé' },
  { region: '8', provincia: '81', comuna: '8112', regionNombre: 'Biobío', provinciaNombre: 'Concepción', comunaNombre: 'Hualpén' },
  
  // Temuco
  { region: '9', provincia: '91', comuna: '9101', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Temuco' },
  { region: '9', provincia: '91', comuna: '9102', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Carahue' },
  { region: '9', provincia: '91', comuna: '9103', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Cunco' },
  { region: '9', provincia: '91', comuna: '9104', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Curarrehue' },
  { region: '9', provincia: '91', comuna: '9105', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Freire' },
  { region: '9', provincia: '91', comuna: '9106', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Galvarino' },
  { region: '9', provincia: '91', comuna: '9107', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Gorbea' },
  { region: '9', provincia: '91', comuna: '9108', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Lautaro' },
  { region: '9', provincia: '91', comuna: '9109', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Loncoche' },
  { region: '9', provincia: '91', comuna: '9110', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Melipeuco' },
  { region: '9', provincia: '91', comuna: '9111', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Nueva Imperial' },
  { region: '9', provincia: '91', comuna: '9112', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Padre las Casas' },
  { region: '9', provincia: '91', comuna: '9113', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Perquenco' },
  { region: '9', provincia: '91', comuna: '9114', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Pitrufquén' },
  { region: '9', provincia: '91', comuna: '9115', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Pucón' },
  { region: '9', provincia: '91', comuna: '9116', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Saavedra' },
  { region: '9', provincia: '91', comuna: '9117', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Teodoro Schmidt' },
  { region: '9', provincia: '91', comuna: '9118', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Toltén' },
  { region: '9', provincia: '91', comuna: '9119', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Vilcún' },
  { region: '9', provincia: '91', comuna: '9120', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Villarrica' },
  { region: '9', provincia: '91', comuna: '9121', regionNombre: 'Araucanía', provinciaNombre: 'Cautín', comunaNombre: 'Cholchol' }
];

// Opciones de sexo
const sexos = ['masculino', 'femenino', 'otro'];

// Función para generar fecha de nacimiento aleatoria
function generateRandomBirthDate(minAge = 18, maxAge = 65) {
  const today = new Date();
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const randomTime = minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime());
  return new Date(randomTime);
}

// Función para seleccionar ubicación aleatoria
function getRandomLocation() {
  return ubicacionesChile[Math.floor(Math.random() * ubicacionesChile.length)];
}

// Función para seleccionar sexo aleatorio
function getRandomGender() {
  return sexos[Math.floor(Math.random() * sexos.length)];
}

async function completeUserData() {
  try {
    console.log('🔄 Completando datos faltantes de usuarios...');
    
    // Obtener todos los usuarios
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const updates = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Solo procesar usuarios con rol 'usuario'
      const userRole = userData.rol || userData.role;
      if (userRole !== 'usuario') {
        continue;
      }
      
      const updateData = {};
      let needsUpdate = false;
      
      // Verificar y completar fecha de nacimiento
      if (!userData.fechaNacimiento) {
        updateData.fechaNacimiento = generateRandomBirthDate();
        needsUpdate = true;
        console.log(`📅 Agregando fecha de nacimiento a ${userData.email}`);
      }
      
      // Verificar y completar ubicación
      if (!userData.comuna || !userData.region || !userData.provincia) {
        const location = getRandomLocation();
        updateData.pais = 'CL';
        updateData.region = location.region;
        updateData.provincia = location.provincia;
        updateData.comuna = location.comuna;
        updateData.regionNombre = location.regionNombre;
        updateData.provinciaNombre = location.provinciaNombre;
        updateData.comunaNombre = location.comunaNombre;
        needsUpdate = true;
        console.log(`📍 Agregando ubicación a ${userData.email}: ${location.comunaNombre}, ${location.regionNombre}`);
      }
      
      // Verificar y completar sexo
      if (!userData.sexo) {
        updateData.sexo = getRandomGender();
        needsUpdate = true;
        console.log(`👤 Agregando sexo a ${userData.email}: ${updateData.sexo}`);
      }
      
      // Migrar campo 'role' a 'rol' si es necesario
      if (userData.role && !userData.rol) {
        updateData.rol = userData.role;
        needsUpdate = true;
        console.log(`🔄 Migrando role → rol para ${userData.email}`);
      }
      
      if (needsUpdate) {
        updates.push({
          userId,
          email: userData.email,
          updateData
        });
      }
    }
    
    console.log(`\n📊 Usuarios que necesitan actualización: ${updates.length}`);
    
    // Aplicar actualizaciones
    for (const update of updates) {
      try {
        await updateDoc(doc(db, 'users', update.userId), update.updateData);
        console.log(`✅ Usuario actualizado: ${update.email}`);
      } catch (error) {
        console.error(`❌ Error actualizando ${update.email}:`, error);
      }
    }
    
    console.log('\n🎉 ¡Proceso completado!');
    console.log(`📈 Total usuarios actualizados: ${updates.length}`);
    
    // Mostrar estadísticas finales
    const finalSnapshot = await getDocs(collection(db, 'users'));
    const finalUsers = [];
    
    finalSnapshot.forEach(doc => {
      const userData = doc.data();
      const userRole = userData.rol || userData.role;
      if (userRole === 'usuario') {
        finalUsers.push(userData);
      }
    });
    
    console.log('\n📊 Estadísticas finales:');
    console.log(`👥 Total usuarios finales: ${finalUsers.length}`);
    console.log(`📅 Con fecha de nacimiento: ${finalUsers.filter(u => u.fechaNacimiento).length}`);
    console.log(`📍 Con ubicación completa: ${finalUsers.filter(u => u.comuna && u.region).length}`);
    console.log(`👤 Con sexo definido: ${finalUsers.filter(u => u.sexo).length}`);
    
    // Distribución por ubicación
    const locationStats = {};
    finalUsers.forEach(user => {
      if (user.comunaNombre) {
        locationStats[user.comunaNombre] = (locationStats[user.comunaNombre] || 0) + 1;
      }
    });
    
    console.log('\n📍 Distribución por comuna:');
    Object.entries(locationStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([comuna, count]) => {
        console.log(`   ${comuna}: ${count} usuario${count > 1 ? 's' : ''}`);
      });
    
    // Distribución por sexo
    const genderStats = {};
    finalUsers.forEach(user => {
      if (user.sexo) {
        genderStats[user.sexo] = (genderStats[user.sexo] || 0) + 1;
      }
    });
    
    console.log('\n👤 Distribución por sexo:');
    Object.entries(genderStats).forEach(([sexo, count]) => {
      console.log(`   ${sexo}: ${count} usuario${count > 1 ? 's' : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error completando datos de usuarios:', error);
  }
}

completeUserData();
