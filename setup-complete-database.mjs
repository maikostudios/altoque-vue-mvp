// Script para configurar la estructura completa de la base de datos según arquitectura
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

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

// Función para generar token único para QR
function generateSecureToken() {
  return uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
}

async function setupCompleteDatabase() {
  try {
    console.log("🚀 Configurando estructura completa de base de datos...");

    // 1. Crear usuario admin principal
    console.log("👑 Creando usuario admin principal...");
    await setDoc(doc(db, "users", "rNi8X1TXb9TFwJDkw9opqVkgrqA2"), {
      email: "maikostudios@gmail.com",
      role: "admin",
      nombre: "Michael",
      apellido: "Administrador",
      rut: "189909780",
      telefono: "+56912345678",
      comuna: "TEMUCO",
      region: "Araucanía",
      fechaNacimiento: new Date("1994-10-19"),
      fechaRegistro: serverTimestamp(),
      estado: "activo",
      ultimoAcceso: serverTimestamp(),
      creadoPor: "system",
      avatar: null,
      configuraciones: {
        notificaciones: true,
        tema: "dark"
      }
    });

    // 2. Crear vendedores de ejemplo
    console.log("🧑‍💼 Creando vendedores de ejemplo...");
    const vendedores = [
      {
        email: "vendedor1@altoque.com",
        nombre: "Carlos",
        apellido: "Vendedor",
        rut: "12345678-9",
        telefono: "+56987654321",
        comuna: "Santiago",
        region: "Metropolitana",
        metaMensual: 50,
        usuariosRegistrados: 12
      },
      {
        email: "vendedor2@altoque.com", 
        nombre: "Ana",
        apellido: "Comercial",
        rut: "98765432-1",
        telefono: "+56912345678",
        comuna: "Valparaíso",
        region: "Valparaíso",
        metaMensual: 30,
        usuariosRegistrados: 8
      }
    ];

    for (const vendedor of vendedores) {
      await addDoc(collection(db, "users"), {
        ...vendedor,
        role: "vendedor",
        fechaRegistro: serverTimestamp(),
        ultimoAcceso: serverTimestamp(),
        estado: "activo",
        creadoPor: "admin",
        avatar: null,
        configuraciones: {
          notificaciones: true,
          tema: "dark"
        }
      });
    }

    // 3. Crear usuarios finales de ejemplo
    console.log("👤 Creando usuarios finales de ejemplo...");
    const usuarios = [
      {
        email: "usuario1@example.com",
        nombre: "Juan",
        apellido: "Pérez",
        rut: "11111111-1",
        telefono: "+56911111111",
        comuna: "Santiago",
        region: "Metropolitana",
        tipoPlan: "gratuito",
        limiteTarjetas: 1
      },
      {
        email: "usuario2@example.com",
        nombre: "María",
        apellido: "González", 
        rut: "22222222-2",
        telefono: "+56922222222",
        comuna: "Concepción",
        region: "Biobío",
        tipoPlan: "premium",
        limiteTarjetas: 10
      }
    ];

    for (const usuario of usuarios) {
      await addDoc(collection(db, "users"), {
        ...usuario,
        role: "usuario",
        fechaRegistro: serverTimestamp(),
        ultimoAcceso: serverTimestamp(),
        estado: "activo",
        creadoPor: "vendedor",
        avatar: null,
        configuraciones: {
          notificaciones: true,
          tema: "dark"
        }
      });
    }

    // 4. Crear tarjetas bancarias con tokens QR
    console.log("💳 Creando tarjetas bancarias con QR...");
    const tarjetas = [
      {
        propietarioEmail: "usuario1@example.com",
        nombreTarjeta: "Cuenta Principal",
        banco: "Banco de Chile",
        tipoCuenta: "Cuenta Corriente",
        numeroCuenta: "12345678",
        rutTitular: "11111111-1",
        nombreTitular: "Juan Pérez",
        telefono: "+56911111111",
        descripcion: "Cuenta para recibir transferencias",
        direccion: "Santiago, Chile",
        imagen: null,
        qrToken: generateSecureToken(),
        activa: true,
        publica: true
      },
      {
        propietarioEmail: "usuario2@example.com",
        nombreTarjeta: "Negocio Personal",
        banco: "Banco Santander",
        tipoCuenta: "Cuenta Vista",
        numeroCuenta: "87654321",
        rutTitular: "22222222-2",
        nombreTitular: "María González",
        telefono: "+56922222222",
        descripcion: "Cuenta para mi emprendimiento",
        direccion: "Concepción, Chile",
        imagen: null,
        qrToken: generateSecureToken(),
        activa: true,
        publica: true
      }
    ];

    for (const tarjeta of tarjetas) {
      await addDoc(collection(db, "bank_cards"), {
        ...tarjeta,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        vistas: 0,
        transferenciasRealizadas: 0
      });
    }

    // 5. Crear métricas y estadísticas
    console.log("📊 Creando métricas del sistema...");
    await setDoc(doc(db, "metrics", "global"), {
      totalUsuarios: 4,
      totalVendedores: 2,
      totalTarjetas: 2,
      totalTransferencias: 0,
      usuariosActivos: 4,
      tarjetasActivas: 2,
      fechaActualizacion: serverTimestamp()
    });

    // 6. Crear configuraciones del sistema actualizadas
    console.log("⚙️ Creando configuraciones del sistema...");
    await setDoc(doc(db, "settings", "general"), {
      nombreApp: "Altoque",
      descripcion: "Plataforma de transferencias bancarias con QR",
      emailContacto: "maikostudios@gmail.com",
      telefonoWhatsApp: "+56912345678",
      modoMantenimiento: false,
      version: "1.0.0",
      urlBase: "https://altoque.web.app",
      fechaActualizacion: serverTimestamp()
    });

    await setDoc(doc(db, "settings", "plans"), {
      gratuito: {
        nombre: "Plan Gratuito",
        limiteTarjetas: 1,
        estadisticas: false,
        soporte: "email",
        precio: 0
      },
      premium: {
        nombre: "Plan Premium",
        limiteTarjetas: 10,
        estadisticas: true,
        soporte: "prioritario",
        precio: 9990
      }
    });

    await setDoc(doc(db, "settings", "design"), {
      colores: {
        fondo: "#121212",
        turquesa: "#00cccc",
        azul: "#1c94e0",
        texto: "#ffffff",
        textoSecundario: "#cccccc"
      },
      tipografia: {
        principal: "Montserrat",
        secundaria: "Roboto",
        terciaria: "Raleway"
      },
      animaciones: {
        duracion: "300ms",
        easing: "ease-in-out"
      }
    });

    // 7. Crear logs de auditoría
    console.log("📋 Creando logs de auditoría...");
    const logs = [
      {
        accion: "system_init",
        usuario: "system",
        descripcion: "Sistema inicializado correctamente",
        nivel: "info"
      },
      {
        accion: "admin_created",
        usuario: "system", 
        descripcion: "Usuario administrador creado",
        nivel: "info"
      },
      {
        accion: "database_setup",
        usuario: "system",
        descripcion: "Base de datos configurada completamente",
        nivel: "info"
      }
    ];

    for (const log of logs) {
      await addDoc(collection(db, "audit_logs"), {
        ...log,
        timestamp: serverTimestamp(),
        ip: "127.0.0.1",
        userAgent: "Setup Script"
      });
    }

    console.log("✅ Base de datos configurada exitosamente!");
    console.log("\n📊 Estructura completa creada:");
    console.log("- 👑 1 administrador principal");
    console.log("- 🧑‍💼 2 vendedores de ejemplo");
    console.log("- 👤 2 usuarios finales");
    console.log("- 💳 2 tarjetas bancarias con QR");
    console.log("- 📊 Métricas globales");
    console.log("- ⚙️ Configuraciones completas");
    console.log("- 📋 Logs de auditoría");

  } catch (error) {
    console.error("❌ Error configurando base de datos:", error);
  }
}

setupCompleteDatabase();
