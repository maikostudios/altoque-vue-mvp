import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

console.log("🔧 Configuración Firebase:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para generar fechas de nacimiento aleatorias
function generateRandomBirthDate(minAge, maxAge) {
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - maxAge,
    today.getMonth(),
    today.getDate()
  );
  const maxDate = new Date(
    today.getFullYear() - minAge,
    today.getMonth(),
    today.getDate()
  );
  const randomTime =
    minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime());
  return new Date(randomTime);
}

// Función para generar RUT chileno válido
function generateRUT() {
  const number = Math.floor(Math.random() * 99999999) + 1;
  const dv = calculateDV(number);
  return `${number}-${dv}`;
}

function calculateDV(rut) {
  let suma = 0;
  let multiplicador = 2;

  while (rut > 0) {
    suma += (rut % 10) * multiplicador;
    rut = Math.floor(rut / 10);
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const dv = 11 - resto;

  if (dv === 11) return "0";
  if (dv === 10) return "K";
  return dv.toString();
}

async function addDemoUsers() {
  try {
    console.log(
      "🚀 Agregando usuarios de demostración con datos demográficos..."
    );

    // Usuarios de prueba con datos demográficos variados
    const demoUsers = [
      {
        email: "ana.silva@example.com",
        nombre: "Ana",
        apellido: "Silva",
        rut: generateRUT(),
        telefono: "+56912345001",
        comuna: "Santiago",
        region: "Metropolitana",
        fechaNacimiento: generateRandomBirthDate(25, 30),
        tipoPlan: "gratuito",
        esPremium: false,
        limiteTarjetas: 1,
      },
      {
        email: "carlos.rodriguez@example.com",
        nombre: "Carlos",
        apellido: "Rodríguez",
        rut: generateRUT(),
        telefono: "+56912345002",
        comuna: "Valparaíso",
        region: "Valparaíso",
        fechaNacimiento: generateRandomBirthDate(35, 40),
        tipoPlan: "premium",
        esPremium: true,
        limiteTarjetas: 5,
      },
      {
        email: "lucia.martinez@example.com",
        nombre: "Lucía",
        apellido: "Martínez",
        rut: generateRUT(),
        telefono: "+56912345003",
        comuna: "Concepción",
        region: "Biobío",
        fechaNacimiento: generateRandomBirthDate(28, 32),
        tipoPlan: "gratuito",
        esPremium: false,
        limiteTarjetas: 1,
      },
      {
        email: "diego.gonzalez@example.com",
        nombre: "Diego",
        apellido: "González",
        rut: generateRUT(),
        telefono: "+56912345004",
        comuna: "Temuco",
        region: "Araucanía",
        fechaNacimiento: generateRandomBirthDate(22, 26),
        tipoPlan: "premium",
        esPremium: true,
        limiteTarjetas: 5,
      },
      {
        email: "sofia.lopez@example.com",
        nombre: "Sofía",
        apellido: "López",
        rut: generateRUT(),
        telefono: "+56912345005",
        comuna: "La Serena",
        region: "Coquimbo",
        fechaNacimiento: generateRandomBirthDate(45, 50),
        tipoPlan: "gratuito",
        esPremium: false,
        limiteTarjetas: 1,
      },
      {
        email: "miguel.torres@example.com",
        nombre: "Miguel",
        apellido: "Torres",
        rut: generateRUT(),
        telefono: "+56912345006",
        comuna: "Antofagasta",
        region: "Antofagasta",
        fechaNacimiento: generateRandomBirthDate(38, 42),
        tipoPlan: "premium",
        esPremium: true,
        limiteTarjetas: 5,
      },
      {
        email: "valentina.morales@example.com",
        nombre: "Valentina",
        apellido: "Morales",
        rut: generateRUT(),
        telefono: "+56912345007",
        comuna: "Rancagua",
        region: "O'Higgins",
        fechaNacimiento: generateRandomBirthDate(19, 23),
        tipoPlan: "gratuito",
        esPremium: false,
        limiteTarjetas: 1,
      },
      {
        email: "francisco.herrera@example.com",
        nombre: "Francisco",
        apellido: "Herrera",
        rut: generateRUT(),
        telefono: "+56912345008",
        comuna: "Talca",
        region: "Maule",
        fechaNacimiento: generateRandomBirthDate(55, 60),
        tipoPlan: "premium",
        esPremium: true,
        limiteTarjetas: 5,
      },
      {
        email: "camila.vargas@example.com",
        nombre: "Camila",
        apellido: "Vargas",
        rut: generateRUT(),
        telefono: "+56912345009",
        comuna: "Chillán",
        region: "Ñuble",
        fechaNacimiento: generateRandomBirthDate(30, 35),
        tipoPlan: "gratuito",
        esPremium: false,
        limiteTarjetas: 1,
      },
      {
        email: "sebastian.castro@example.com",
        nombre: "Sebastián",
        apellido: "Castro",
        rut: generateRUT(),
        telefono: "+56912345010",
        comuna: "Puerto Montt",
        region: "Los Lagos",
        fechaNacimiento: generateRandomBirthDate(26, 30),
        tipoPlan: "premium",
        esPremium: true,
        limiteTarjetas: 5,
      },
    ];

    // Agregar usuarios a Firebase
    for (const usuario of demoUsers) {
      await addDoc(collection(db, "users"), {
        ...usuario,
        rol: "usuario", // Usar 'rol' en lugar de 'role'
        fechaRegistro: serverTimestamp(),
        ultimoAcceso: serverTimestamp(),
        estado: "activo",
        creadoPor: "demo-script",
        avatar: null,
        configuraciones: {
          notificaciones: true,
          tema: "dark",
        },
      });

      console.log(
        `✅ Usuario creado: ${usuario.nombre} ${usuario.apellido} (${usuario.comuna})`
      );
    }

    console.log("\n🎉 ¡Usuarios de demostración agregados exitosamente!");
    console.log(`📊 Total agregados: ${demoUsers.length} usuarios`);
    console.log("\n📍 Distribución por ubicación:");

    const locationCount = {};
    demoUsers.forEach((user) => {
      locationCount[user.comuna] = (locationCount[user.comuna] || 0) + 1;
    });

    Object.entries(locationCount).forEach(([location, count]) => {
      console.log(`   ${location}: ${count} usuario${count > 1 ? "s" : ""}`);
    });

    console.log("\n👥 Distribución por edad:");
    const ageGroups = {
      "18-25": 0,
      "26-35": 0,
      "36-45": 0,
      "46+": 0,
    };

    demoUsers.forEach((user) => {
      const today = new Date();
      const age = today.getFullYear() - user.fechaNacimiento.getFullYear();

      if (age <= 25) ageGroups["18-25"]++;
      else if (age <= 35) ageGroups["26-35"]++;
      else if (age <= 45) ageGroups["36-45"]++;
      else ageGroups["46+"]++;
    });

    Object.entries(ageGroups).forEach(([range, count]) => {
      console.log(`   ${range} años: ${count} usuario${count > 1 ? "s" : ""}`);
    });

    console.log("\n⭐ Distribución por plan:");
    const planCount = {
      Gratuito: demoUsers.filter((u) => !u.esPremium).length,
      Premium: demoUsers.filter((u) => u.esPremium).length,
    };

    Object.entries(planCount).forEach(([plan, count]) => {
      console.log(`   ${plan}: ${count} usuario${count > 1 ? "s" : ""}`);
    });
  } catch (error) {
    console.error("❌ Error agregando usuarios de demostración:", error);
  }
}

addDemoUsers();
