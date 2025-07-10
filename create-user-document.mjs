// Script para crear documento de usuario directamente en Firestore Emulator via REST API

const USER_UID = "LzeO8tnOZckweZHlN5uQCE8AMTwO";
const FIRESTORE_EMULATOR_URL = "http://127.0.0.1:8080";
const PROJECT_ID = "deunamaikostudios";

const userData = {
  fields: {
    uid: { stringValue: USER_UID },
    email: { stringValue: "maikostudios@gmail.com" },
    displayName: { stringValue: "Michael Saez" },
    rol: { stringValue: "admin" },
    isPremium: { booleanValue: false },
    planType: { stringValue: "free" },
    onboardingCompleted: { booleanValue: false },
    idVerificationStatus: { stringValue: "pending" },
    userType: { stringValue: "client_deuna" },
    associatedProjects: { 
      arrayValue: { 
        values: [{ stringValue: "deuna" }] 
      } 
    },
    signUpSource: { stringValue: "email" },
    createdAt: { timestampValue: new Date().toISOString() },
    updatedAt: { timestampValue: new Date().toISOString() },
    lastLoginAt: { timestampValue: new Date().toISOString() }
  }
};

async function createUserDocument() {
  try {
    console.log("🔄 Creando documento de usuario en Firestore...");
    
    const url = `${FIRESTORE_EMULATOR_URL}/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${USER_UID}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ Documento de usuario creado exitosamente");
      console.log("📄 Documento:", result.name);
      console.log("🎉 Usuario listo para login:");
      console.log("📧 Email: maikostudios@gmail.com");
      console.log("🔑 Password: 123456");
      console.log("👤 Rol: admin");
    } else {
      const error = await response.text();
      console.error("❌ Error creando documento:", response.status, error);
    }
    
  } catch (error) {
    console.error("❌ Error en la petición:", error);
  }
}

createUserDocument();
