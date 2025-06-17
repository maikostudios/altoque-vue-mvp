import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAFfjqq8YIfrduQpiYoMLGreId4vhkX08M",
  authDomain: "deunamaikostudios.firebaseapp.com",
  projectId: "deunamaikostudios",
  storageBucket: "deunamaikostudios.firebasestorage.app",
  messagingSenderId: "515483851699",
  appId: "1:515483851699:web:009b0b4885464ece0bc9c6"
};

// Ubicaciones chilenas jerárquicamente correctas
const ubicacionesJerarquicas = [
  // REGIÓN METROPOLITANA (13)
  {
    region: '13', regionNombre: 'Metropolitana de Santiago',
    provincia: '131', provinciaNombre: 'Santiago',
    comunas: [
      { codigo: '13101', nombre: 'Santiago' },
      { codigo: '13102', nombre: 'Cerrillos' },
      { codigo: '13103', nombre: 'Cerro Navia' },
      { codigo: '13104', nombre: 'Conchalí' },
      { codigo: '13105', nombre: 'El Bosque' },
      { codigo: '13106', nombre: 'Estación Central' },
      { codigo: '13107', nombre: 'Huechuraba' },
      { codigo: '13108', nombre: 'Independencia' },
      { codigo: '13109', nombre: 'La Cisterna' },
      { codigo: '13110', nombre: 'La Florida' },
      { codigo: '13111', nombre: 'La Granja' },
      { codigo: '13112', nombre: 'La Pintana' },
      { codigo: '13113', nombre: 'La Reina' },
      { codigo: '13114', nombre: 'Las Condes' },
      { codigo: '13115', nombre: 'Lo Barnechea' },
      { codigo: '13116', nombre: 'Lo Espejo' },
      { codigo: '13117', nombre: 'Lo Prado' },
      { codigo: '13118', nombre: 'Macul' },
      { codigo: '13119', nombre: 'Maipú' },
      { codigo: '13120', nombre: 'Ñuñoa' },
      { codigo: '13121', nombre: 'Pedro Aguirre Cerda' },
      { codigo: '13122', nombre: 'Peñalolén' },
      { codigo: '13123', nombre: 'Providencia' },
      { codigo: '13124', nombre: 'Pudahuel' },
      { codigo: '13125', nombre: 'Quilicura' },
      { codigo: '13126', nombre: 'Quinta Normal' },
      { codigo: '13127', nombre: 'Recoleta' },
      { codigo: '13128', nombre: 'Renca' },
      { codigo: '13129', nombre: 'San Joaquín' },
      { codigo: '13130', nombre: 'San Miguel' },
      { codigo: '13131', nombre: 'San Ramón' },
      { codigo: '13132', nombre: 'Vitacura' }
    ]
  },
  
  // REGIÓN DE VALPARAÍSO (5)
  {
    region: '5', regionNombre: 'Valparaíso',
    provincia: '51', provinciaNombre: 'Valparaíso',
    comunas: [
      { codigo: '5101', nombre: 'Valparaíso' },
      { codigo: '5102', nombre: 'Casablanca' },
      { codigo: '5103', nombre: 'Concón' },
      { codigo: '5104', nombre: 'Juan Fernández' },
      { codigo: '5105', nombre: 'Puchuncaví' },
      { codigo: '5106', nombre: 'Quintero' },
      { codigo: '5107', nombre: 'Viña del Mar' }
    ]
  },
  
  // REGIÓN DEL BIOBÍO (8)
  {
    region: '8', regionNombre: 'Biobío',
    provincia: '81', provinciaNombre: 'Concepción',
    comunas: [
      { codigo: '8101', nombre: 'Concepción' },
      { codigo: '8102', nombre: 'Coronel' },
      { codigo: '8103', nombre: 'Chiguayante' },
      { codigo: '8104', nombre: 'Florida' },
      { codigo: '8105', nombre: 'Hualqui' },
      { codigo: '8106', nombre: 'Lota' },
      { codigo: '8107', nombre: 'Penco' },
      { codigo: '8108', nombre: 'San Pedro de la Paz' },
      { codigo: '8109', nombre: 'Santa Juana' },
      { codigo: '8110', nombre: 'Talcahuano' },
      { codigo: '8111', nombre: 'Tomé' },
      { codigo: '8112', nombre: 'Hualpén' }
    ]
  },
  
  // REGIÓN DE LA ARAUCANÍA (9)
  {
    region: '9', regionNombre: 'La Araucanía',
    provincia: '91', provinciaNombre: 'Cautín',
    comunas: [
      { codigo: '9101', nombre: 'Temuco' },
      { codigo: '9102', nombre: 'Carahue' },
      { codigo: '9103', nombre: 'Cunco' },
      { codigo: '9104', nombre: 'Curarrehue' },
      { codigo: '9105', nombre: 'Freire' },
      { codigo: '9106', nombre: 'Galvarino' },
      { codigo: '9107', nombre: 'Gorbea' },
      { codigo: '9108', nombre: 'Lautaro' },
      { codigo: '9109', nombre: 'Loncoche' },
      { codigo: '9110', nombre: 'Melipeuco' },
      { codigo: '9111', nombre: 'Nueva Imperial' },
      { codigo: '9112', nombre: 'Padre las Casas' },
      { codigo: '9113', nombre: 'Perquenco' },
      { codigo: '9114', nombre: 'Pitrufquén' },
      { codigo: '9115', nombre: 'Pucón' },
      { codigo: '9116', nombre: 'Saavedra' },
      { codigo: '9117', nombre: 'Teodoro Schmidt' },
      { codigo: '9118', nombre: 'Toltén' },
      { codigo: '9119', nombre: 'Vilcún' },
      { codigo: '9120', nombre: 'Villarrica' }
    ]
  },
  
  // REGIÓN DE COQUIMBO (4)
  {
    region: '4', regionNombre: 'Coquimbo',
    provincia: '41', provinciaNombre: 'Elqui',
    comunas: [
      { codigo: '4101', nombre: 'La Serena' },
      { codigo: '4102', nombre: 'Coquimbo' },
      { codigo: '4103', nombre: 'Andacollo' },
      { codigo: '4104', nombre: 'La Higuera' },
      { codigo: '4105', nombre: 'Paiguano' },
      { codigo: '4106', nombre: 'Vicuña' }
    ]
  },
  
  // REGIÓN DE ANTOFAGASTA (2)
  {
    region: '2', regionNombre: 'Antofagasta',
    provincia: '21', provinciaNombre: 'Antofagasta',
    comunas: [
      { codigo: '2101', nombre: 'Antofagasta' },
      { codigo: '2102', nombre: 'Mejillones' },
      { codigo: '2103', nombre: 'Sierra Gorda' },
      { codigo: '2104', nombre: 'Taltal' }
    ]
  }
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

function getRandomLocationHierarchical() {
  // Seleccionar región aleatoria
  const regionData = ubicacionesJerarquicas[Math.floor(Math.random() * ubicacionesJerarquicas.length)];
  
  // Seleccionar comuna aleatoria de esa región
  const comunaData = regionData.comunas[Math.floor(Math.random() * regionData.comunas.length)];
  
  return {
    pais: 'CL',
    region: regionData.region,
    regionNombre: regionData.regionNombre,
    provincia: regionData.provincia,
    provinciaNombre: regionData.provinciaNombre,
    comuna: comunaData.codigo,
    comunaNombre: comunaData.nombre
  };
}

function getRandomGender() {
  return sexos[Math.floor(Math.random() * sexos.length)];
}

async function fixUserDataHierarchy() {
  try {
    console.log('🔧 Corrigiendo datos jerárquicos de usuarios...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Conectado a Firebase');
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`📊 Total usuarios encontrados: ${usersSnapshot.size}`);
    
    let updatedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      const userRole = userData.rol || userData.role;
      console.log(`\n👤 Procesando: ${userData.email || userData.nombre} (rol: ${userRole})`);
      
      if (userRole !== 'usuario') {
        console.log(`⏭️ Saltando - no es usuario final`);
        continue;
      }
      
      const updateData = {};
      let needsUpdate = false;
      
      // Verificar y completar fecha de nacimiento
      if (!userData.fechaNacimiento) {
        updateData.fechaNacimiento = generateRandomBirthDate();
        needsUpdate = true;
        console.log(`📅 ✅ Agregando fecha de nacimiento`);
      } else {
        console.log(`📅 ✓ Ya tiene fecha de nacimiento`);
      }
      
      // Verificar y completar ubicación jerárquica
      const hasCompleteLocation = userData.comunaNombre && userData.regionNombre && 
                                 userData.provincia && userData.comuna && userData.region;
      
      if (!hasCompleteLocation) {
        const location = getRandomLocationHierarchical();
        Object.assign(updateData, location);
        needsUpdate = true;
        console.log(`📍 ✅ Agregando ubicación: ${location.comunaNombre}, ${location.regionNombre}`);
        console.log(`   Códigos: R${location.region}-P${location.provincia}-C${location.comuna}`);
      } else {
        console.log(`📍 ✓ Ya tiene ubicación completa: ${userData.comunaNombre}, ${userData.regionNombre}`);
      }
      
      // Verificar y completar sexo
      if (!userData.sexo) {
        updateData.sexo = getRandomGender();
        needsUpdate = true;
        console.log(`👤 ✅ Agregando sexo: ${updateData.sexo}`);
      } else {
        console.log(`👤 ✓ Ya tiene sexo: ${userData.sexo}`);
      }
      
      // Migrar role a rol si es necesario
      if (userData.role && !userData.rol) {
        updateData.rol = userData.role;
        needsUpdate = true;
        console.log(`🔄 ✅ Migrando role → rol`);
      }
      
      // Aplicar actualizaciones
      if (needsUpdate) {
        try {
          await updateDoc(doc(db, 'users', userId), updateData);
          updatedCount++;
          console.log(`✅ Usuario actualizado exitosamente`);
        } catch (error) {
          console.error(`❌ Error actualizando usuario:`, error);
        }
      } else {
        console.log(`✓ Usuario ya tiene todos los datos completos`);
      }
    }
    
    console.log(`\n🎉 Proceso completado!`);
    console.log(`📈 Total usuarios actualizados: ${updatedCount}`);
    
    // Mostrar estadísticas finales
    console.log('\n📊 Verificando datos finales...');
    const finalSnapshot = await getDocs(collection(db, 'users'));
    
    let usuariosFinales = 0;
    let conUbicacion = 0;
    let conFecha = 0;
    let conSexo = 0;
    const ubicacionStats = {};
    const sexoStats = {};
    
    finalSnapshot.forEach(doc => {
      const userData = doc.data();
      const userRole = userData.rol || userData.role;
      
      if (userRole === 'usuario') {
        usuariosFinales++;
        
        if (userData.comunaNombre && userData.regionNombre) {
          conUbicacion++;
          ubicacionStats[userData.comunaNombre] = (ubicacionStats[userData.comunaNombre] || 0) + 1;
        }
        
        if (userData.fechaNacimiento) conFecha++;
        
        if (userData.sexo) {
          conSexo++;
          sexoStats[userData.sexo] = (sexoStats[userData.sexo] || 0) + 1;
        }
      }
    });
    
    console.log(`\n📈 Estadísticas finales:`);
    console.log(`👥 Total usuarios finales: ${usuariosFinales}`);
    console.log(`📍 Con ubicación completa: ${conUbicacion}/${usuariosFinales}`);
    console.log(`📅 Con fecha de nacimiento: ${conFecha}/${usuariosFinales}`);
    console.log(`👤 Con sexo definido: ${conSexo}/${usuariosFinales}`);
    
    console.log(`\n📍 Distribución por comuna:`);
    Object.entries(ubicacionStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([comuna, count]) => {
        console.log(`   ${comuna}: ${count} usuario${count > 1 ? 's' : ''}`);
      });
    
    console.log(`\n👤 Distribución por sexo:`);
    Object.entries(sexoStats).forEach(([sexo, count]) => {
      console.log(`   ${sexo}: ${count} usuario${count > 1 ? 's' : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

fixUserDataHierarchy();
