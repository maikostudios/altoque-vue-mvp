// Script para verificar los datos de tickets y agentes
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

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

async function verifyData() {
  try {
    console.log("🔍 Verificando datos en Firestore...");
    
    // Verificar agentes de soporte
    console.log("\n👥 AGENTES DE SOPORTE:");
    const supportQuery = query(
      collection(db, 'users'),
      where('rol', '==', 'soporte')
    );
    
    const supportSnapshot = await getDocs(supportQuery);
    console.log(`📊 Total agentes de soporte: ${supportSnapshot.size}`);
    
    supportSnapshot.forEach((doc) => {
      const agent = doc.data();
      console.log(`  - ${agent.email} (${agent.nombre} ${agent.apellido})`);
      console.log(`    Estado: ${agent.estado || 'sin estado'}`);
      console.log(`    Especialidad: ${agent.especialidad || 'sin especialidad'}`);
    });
    
    // Verificar tickets
    console.log("\n🎫 TICKETS:");
    const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
    console.log(`📊 Total tickets: ${ticketsSnapshot.size}`);
    
    let assignedCount = 0;
    let unassignedCount = 0;
    let resolvedCount = 0;
    
    ticketsSnapshot.forEach((doc) => {
      const ticket = doc.data();
      console.log(`  - ${ticket.ticketId}: ${ticket.asunto}`);
      console.log(`    Estado: ${ticket.estado}`);
      console.log(`    Prioridad: ${ticket.prioridad}`);
      console.log(`    Asignado a: ${ticket.asignadoA || 'Sin asignar'}`);
      console.log(`    Usuario: ${ticket.userEmail}`);
      
      if (ticket.asignadoA) {
        assignedCount++;
      } else {
        unassignedCount++;
      }
      
      if (ticket.estado === 'respondido' || ticket.estado === 'cerrado') {
        resolvedCount++;
      }
      
      console.log('    ---');
    });
    
    console.log("\n📈 ESTADÍSTICAS:");
    console.log(`  - Tickets asignados: ${assignedCount}`);
    console.log(`  - Tickets sin asignar: ${unassignedCount}`);
    console.log(`  - Tickets resueltos: ${resolvedCount}`);
    
    // Verificar tickets por agente
    console.log("\n🎧 TICKETS POR AGENTE:");
    const supportAgentId = "KCcfigeVFEYjTxLtiW7VtfOcTod2";
    
    const agentTicketsQuery = query(
      collection(db, 'tickets'),
      where('asignadoA', '==', supportAgentId)
    );
    
    const agentTicketsSnapshot = await getDocs(agentTicketsQuery);
    console.log(`📊 Tickets asignados al agente ${supportAgentId}: ${agentTicketsSnapshot.size}`);
    
    agentTicketsSnapshot.forEach((doc) => {
      const ticket = doc.data();
      console.log(`  - ${ticket.ticketId}: ${ticket.estado} (${ticket.prioridad})`);
    });
    
    console.log("\n✅ Verificación completada!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

verifyData();
