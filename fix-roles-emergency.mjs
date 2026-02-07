// Script de emergencia para corregir roles inconsistentes
// Este script verifica y corrige usuarios con campo 'role' vs 'rol'

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFfjqq8YIfrduQpiYoMLGreId4vhkX08M",
  authDomain: "deunamaikostudios.firebaseapp.com",
  projectId: "deunamaikostudios",
  storageBucket: "deunamaikostudios.firebasestorage.app",
  messagingSenderId: "515483851699",
  appId: "1:515483851699:web:009b0b4885464ece0bc9c6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixRolesEmergency() {
  try {
    console.log("🚨 INICIANDO CORRECCIÓN DE EMERGENCIA DE ROLES");
    console.log("=" .repeat(50));
    
    // Obtener todos los usuarios
    const usersSnapshot = await getDocs(collection(db, "users"));
    console.log(`📊 Total usuarios encontrados: ${usersSnapshot.docs.length}`);
    
    let usersWithRole = 0;
    let usersWithRol = 0;
    let usersFixed = 0;
    let usersWithProblems = [];
    
    console.log("\n🔍 ANALIZANDO USUARIOS...");
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Verificar qué campo de rol tiene
      const hasRole = userData.hasOwnProperty('role');
      const hasRol = userData.hasOwnProperty('rol');
      
      if (hasRole) usersWithRole++;
      if (hasRol) usersWithRol++;
      
      console.log(`\n👤 Usuario: ${userData.email || 'Sin email'}`);
      console.log(`   UID: ${userId}`);
      console.log(`   Tiene 'role': ${hasRole ? userData.role : 'NO'}`);
      console.log(`   Tiene 'rol': ${hasRol ? userData.rol : 'NO'}`);
      
      // Casos que necesitan corrección
      let needsFix = false;
      let newRol = null;
      
      if (hasRole && !hasRol) {
        // Tiene 'role' pero no 'rol' - migrar
        newRol = userData.role;
        needsFix = true;
        console.log(`   🔧 NECESITA MIGRACIÓN: role "${userData.role}" → rol "${newRol}"`);
      } else if (hasRole && hasRol && userData.role !== userData.rol) {
        // Tiene ambos pero son diferentes - usar 'rol' como autoridad
        console.log(`   ⚠️  CONFLICTO: role="${userData.role}" vs rol="${userData.rol}"`);
        console.log(`   ✅ Manteniendo rol="${userData.rol}" como autoridad`);
        // No necesita fix, 'rol' ya es correcto
      } else if (!hasRole && !hasRol) {
        // No tiene ningún rol - asignar usuario por defecto
        newRol = "usuario";
        needsFix = true;
        console.log(`   🔧 SIN ROL: Asignando rol por defecto "usuario"`);
      }
      
      // Aplicar corrección si es necesaria
      if (needsFix && newRol) {
        try {
          const updateData = { rol: newRol };
          
          // Si tenía 'role', eliminarlo para evitar confusión futura
          if (hasRole) {
            updateData.role = null; // Firebase eliminará el campo
          }
          
          await updateDoc(doc(db, "users", userId), updateData);
          usersFixed++;
          console.log(`   ✅ CORREGIDO: Ahora tiene rol="${newRol}"`);
        } catch (error) {
          console.error(`   ❌ ERROR corrigiendo usuario ${userData.email}:`, error);
          usersWithProblems.push({
            email: userData.email,
            uid: userId,
            error: error.message
          });
        }
      } else {
        console.log(`   ✅ OK: No necesita corrección`);
      }
    }
    
    // Resumen final
    console.log("\n" + "=" .repeat(50));
    console.log("📊 RESUMEN DE CORRECCIÓN:");
    console.log(`   Usuarios con campo 'role': ${usersWithRole}`);
    console.log(`   Usuarios con campo 'rol': ${usersWithRol}`);
    console.log(`   Usuarios corregidos: ${usersFixed}`);
    console.log(`   Usuarios con problemas: ${usersWithProblems.length}`);
    
    if (usersWithProblems.length > 0) {
      console.log("\n❌ USUARIOS CON PROBLEMAS:");
      usersWithProblems.forEach(user => {
        console.log(`   - ${user.email} (${user.uid}): ${user.error}`);
      });
    }
    
    console.log("\n🎉 CORRECCIÓN COMPLETADA");
    
    // Verificación final
    console.log("\n🔍 VERIFICACIÓN FINAL...");
    const finalSnapshot = await getDocs(collection(db, "users"));
    let finalRolCount = 0;
    let finalRoleCount = 0;
    
    finalSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.rol) finalRolCount++;
      if (data.role) finalRoleCount++;
    });
    
    console.log(`✅ Usuarios con 'rol' después de corrección: ${finalRolCount}`);
    console.log(`⚠️  Usuarios con 'role' después de corrección: ${finalRoleCount}`);
    
    if (finalRoleCount === 0) {
      console.log("🎉 ¡ÉXITO! Todos los usuarios ahora usan el campo 'rol' estándar");
    } else {
      console.log("⚠️  Aún hay usuarios con campo 'role' - revisar manualmente");
    }
    
  } catch (error) {
    console.error("❌ ERROR CRÍTICO:", error);
  }
}

// Ejecutar el script
fixRolesEmergency().then(() => {
  console.log("\n🏁 Script completado");
  process.exit(0);
}).catch(error => {
  console.error("💥 Error fatal:", error);
  process.exit(1);
});
