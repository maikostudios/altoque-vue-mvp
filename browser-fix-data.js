// Script para ejecutar en la consola del navegador
// Abre http://localhost:5176/admin y ejecuta este código en la consola

async function fixUserDataInBrowser() {
  console.log('🔧 Iniciando corrección de datos desde el navegador...');
  
  // Importar Firebase desde el contexto global
  const { db } = window;
  const { collection, getDocs, updateDoc, doc } = window.firebase;
  
  if (!db || !collection) {
    console.error('❌ Firebase no está disponible. Asegúrate de estar en la página del admin.');
    return;
  }
  
  // Ubicaciones jerárquicamente correctas
  const ubicaciones = [
    // Región Metropolitana
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13101', comunaNombre: 'Santiago' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13119', comunaNombre: 'Maipú' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13114', comunaNombre: 'Las Condes' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13123', comunaNombre: 'Providencia' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13120', comunaNombre: 'Ñuñoa' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13110', comunaNombre: 'La Florida' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13122', comunaNombre: 'Peñalolén' },
    { region: '13', regionNombre: 'Metropolitana de Santiago', provincia: '131', provinciaNombre: 'Santiago', comuna: '13132', comunaNombre: 'Vitacura' },
    
    // Valparaíso
    { region: '5', regionNombre: 'Valparaíso', provincia: '51', provinciaNombre: 'Valparaíso', comuna: '5101', comunaNombre: 'Valparaíso' },
    { region: '5', regionNombre: 'Valparaíso', provincia: '51', provinciaNombre: 'Valparaíso', comuna: '5107', comunaNombre: 'Viña del Mar' },
    { region: '5', regionNombre: 'Valparaíso', provincia: '51', provinciaNombre: 'Valparaíso', comuna: '5103', comunaNombre: 'Concón' },
    
    // Biobío
    { region: '8', regionNombre: 'Biobío', provincia: '81', provinciaNombre: 'Concepción', comuna: '8101', comunaNombre: 'Concepción' },
    { region: '8', regionNombre: 'Biobío', provincia: '81', provinciaNombre: 'Concepción', comuna: '8110', comunaNombre: 'Talcahuano' },
    { region: '8', regionNombre: 'Biobío', provincia: '81', provinciaNombre: 'Concepción', comuna: '8108', comunaNombre: 'San Pedro de la Paz' },
    
    // Araucanía
    { region: '9', regionNombre: 'La Araucanía', provincia: '91', provinciaNombre: 'Cautín', comuna: '9101', comunaNombre: 'Temuco' },
    { region: '9', regionNombre: 'La Araucanía', provincia: '91', provinciaNombre: 'Cautín', comuna: '9115', comunaNombre: 'Pucón' },
    { region: '9', regionNombre: 'La Araucanía', provincia: '91', provinciaNombre: 'Cautín', comuna: '9120', comunaNombre: 'Villarrica' },
    
    // Coquimbo
    { region: '4', regionNombre: 'Coquimbo', provincia: '41', provinciaNombre: 'Elqui', comuna: '4101', comunaNombre: 'La Serena' },
    { region: '4', regionNombre: 'Coquimbo', provincia: '41', provinciaNombre: 'Elqui', comuna: '4102', comunaNombre: 'Coquimbo' },
    
    // Antofagasta
    { region: '2', regionNombre: 'Antofagasta', provincia: '21', provinciaNombre: 'Antofagasta', comuna: '2101', comunaNombre: 'Antofagasta' }
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
  
  try {
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
      
      // Completar fecha de nacimiento
      if (!userData.fechaNacimiento) {
        updateData.fechaNacimiento = generateRandomBirthDate();
        needsUpdate = true;
        console.log(`📅 ✅ Agregando fecha de nacimiento`);
      }
      
      // Completar ubicación jerárquica
      const hasCompleteLocation = userData.comunaNombre && userData.regionNombre && 
                                 userData.provincia && userData.comuna && userData.region;
      
      if (!hasCompleteLocation) {
        const location = getRandomLocation();
        updateData.pais = 'CL';
        updateData.region = location.region;
        updateData.regionNombre = location.regionNombre;
        updateData.provincia = location.provincia;
        updateData.provinciaNombre = location.provinciaNombre;
        updateData.comuna = location.comuna;
        updateData.comunaNombre = location.comunaNombre;
        needsUpdate = true;
        console.log(`📍 ✅ Agregando ubicación: ${location.comunaNombre}, ${location.regionNombre}`);
      }
      
      // Completar sexo
      if (!userData.sexo) {
        updateData.sexo = getRandomGender();
        needsUpdate = true;
        console.log(`👤 ✅ Agregando sexo: ${updateData.sexo}`);
      }
      
      // Migrar role a rol
      if (userData.role && !userData.rol) {
        updateData.rol = userData.role;
        needsUpdate = true;
        console.log(`🔄 ✅ Migrando role → rol`);
      }
      
      if (needsUpdate) {
        try {
          await updateDoc(doc(db, 'users', userId), updateData);
          updatedCount++;
          console.log(`✅ Usuario actualizado exitosamente`);
        } catch (error) {
          console.error(`❌ Error actualizando usuario:`, error);
        }
      } else {
        console.log(`✓ Usuario ya completo`);
      }
    }
    
    console.log(`\n🎉 Proceso completado! ${updatedCount} usuarios actualizados`);
    
    // Recargar la página para ver los cambios
    setTimeout(() => {
      console.log('🔄 Recargando página para mostrar cambios...');
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar la función
fixUserDataInBrowser();
