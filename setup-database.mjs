// Script para configurar la estructura inicial de la base de datos
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFfjqq8YIfrduQpiYoMLGreId4vhkX08M",
  authDomain: "deunamaikostudios.firebaseapp.com",
  projectId: "deunamaikostudios",
  storageBucket: "deunamaikostudios.firebasestorage.app",
  messagingSenderId: "515483851699",
  appId: "1:515483851699:web:009b0b4885464ece0bc9c6",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupDatabase() {
  try {
    console.log("🚀 Configurando estructura de base de datos...");

    // 1. Crear usuario admin
    console.log("👤 Creando usuario admin...");
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
    });

    // 2. Crear usuarios de ejemplo
    console.log("👥 Creando usuarios de ejemplo...");
    const usuariosEjemplo = [
      {
        email: "juan.perez@example.com",
        role: "user",
        nombre: "Juan",
        apellido: "Pérez",
        rut: "12345678-9",
        telefono: "+56987654321",
        comuna: "Santiago",
        region: "Metropolitana",
        fechaNacimiento: new Date("1990-05-15"),
        estado: "activo",
      },
      {
        email: "maria.gonzalez@example.com",
        role: "vendedor",
        nombre: "María",
        apellido: "González",
        rut: "98765432-1",
        telefono: "+56912345678",
        comuna: "Valparaíso",
        region: "Valparaíso",
        fechaNacimiento: new Date("1985-08-22"),
        estado: "activo",
      },
      {
        email: "carlos.rodriguez@example.com",
        role: "user",
        nombre: "Carlos",
        apellido: "Rodríguez",
        rut: "11223344-5",
        telefono: "+56998877665",
        comuna: "Concepción",
        region: "Biobío",
        fechaNacimiento: new Date("1992-12-03"),
        estado: "inactivo",
      },
    ];

    for (const usuario of usuariosEjemplo) {
      await addDoc(collection(db, "users"), {
        ...usuario,
        fechaRegistro: serverTimestamp(),
        ultimoAcceso: serverTimestamp(),
        creadoPor: "admin",
      });
    }

    // 3. Crear cuentas bancarias de ejemplo
    console.log("💳 Creando cuentas bancarias de ejemplo...");
    const cuentasBancarias = [
      {
        nombreBanco: "Banco de Chile",
        tipoCuenta: "Cuenta Corriente",
        numeroCuenta: "12345678",
        titularCuenta: "Juan Pérez",
        rutTitular: "12345678-9",
        estado: "activa",
        saldo: 1500000,
      },
      {
        nombreBanco: "Banco Santander",
        tipoCuenta: "Cuenta Vista",
        numeroCuenta: "87654321",
        titularCuenta: "María González",
        rutTitular: "98765432-1",
        estado: "activa",
        saldo: 850000,
      },
      {
        nombreBanco: "Banco Estado",
        tipoCuenta: "Cuenta de Ahorros",
        numeroCuenta: "11223344",
        titularCuenta: "Carlos Rodríguez",
        rutTitular: "11223344-5",
        estado: "bloqueada",
        saldo: 320000,
      },
    ];

    for (const cuenta of cuentasBancarias) {
      await addDoc(collection(db, "bank_accounts"), {
        ...cuenta,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        creadoPor: "admin",
      });
    }

    // 4. Crear transacciones de ejemplo
    console.log("💰 Creando transacciones de ejemplo...");
    const transacciones = [
      {
        tipo: "deposito",
        monto: 100000,
        descripcion: "Depósito inicial",
        cuentaOrigen: "12345678",
        estado: "completada",
      },
      {
        tipo: "retiro",
        monto: 50000,
        descripcion: "Retiro cajero automático",
        cuentaOrigen: "87654321",
        estado: "completada",
      },
      {
        tipo: "transferencia",
        monto: 75000,
        descripcion: "Transferencia entre cuentas",
        cuentaOrigen: "12345678",
        cuentaDestino: "11223344",
        estado: "pendiente",
      },
    ];

    for (const transaccion of transacciones) {
      await addDoc(collection(db, "transactions"), {
        ...transaccion,
        fechaTransaccion: serverTimestamp(),
        fechaCreacion: serverTimestamp(),
        procesadoPor: "system",
      });
    }

    // 5. Crear configuraciones del sistema
    console.log("⚙️ Creando configuraciones del sistema...");
    await setDoc(doc(db, "settings", "general"), {
      nombreApp: "De Una App",
      emailContacto: "admin@deuna.com",
      modoMantenimiento: false,
      version: "1.0.0",
      fechaActualizacion: serverTimestamp(),
    });

    await setDoc(doc(db, "settings", "security"), {
      tiempoSesion: 60,
      autenticacionDosFactor: false,
      logsAuditoria: true,
      intentosMaximoLogin: 5,
      fechaActualizacion: serverTimestamp(),
    });

    await setDoc(doc(db, "settings", "notifications"), {
      notificacionesEmail: true,
      notificacionesPush: false,
      frecuenciaReportes: "semanal",
      emailReportes: "reports@deuna.com",
      fechaActualizacion: serverTimestamp(),
    });

    // 6. Crear logs de auditoría de ejemplo
    console.log("📋 Creando logs de auditoría...");
    const logsAuditoria = [
      {
        accion: "login",
        usuario: "maikostudios@gmail.com",
        descripcion: "Usuario admin inició sesión",
        ip: "192.168.1.100",
        userAgent: "Mozilla/5.0...",
      },
      {
        accion: "create_user",
        usuario: "maikostudios@gmail.com",
        descripcion: "Creó nuevo usuario: juan.perez@example.com",
        ip: "192.168.1.100",
        userAgent: "Mozilla/5.0...",
      },
      {
        accion: "update_settings",
        usuario: "maikostudios@gmail.com",
        descripcion: "Actualizó configuraciones de seguridad",
        ip: "192.168.1.100",
        userAgent: "Mozilla/5.0...",
      },
    ];

    for (const log of logsAuditoria) {
      await addDoc(collection(db, "audit_logs"), {
        ...log,
        timestamp: serverTimestamp(),
        nivel: "info",
      });
    }

    console.log("✅ Base de datos configurada exitosamente!");
    console.log("\n📊 Estructura creada:");
    console.log("- 👤 1 usuario admin + 3 usuarios de ejemplo");
    console.log("- 💳 3 cuentas bancarias de ejemplo");
    console.log("- 💰 3 transacciones de ejemplo");
    console.log("- ⚙️ Configuraciones del sistema");
    console.log("- 📋 3 logs de auditoría");
  } catch (error) {
    console.error("❌ Error configurando base de datos:", error);
  }
}

setupDatabase();
