// ✅ ETAPA 6: Tests unitarios para Crashlytics Service
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { CrashlyticsService } from "@/services/crashlyticsService";

// Mock Firebase Analytics
vi.mock("firebase/analytics", () => {
  const mockAnalytics = {};
  const mockLogEvent = vi.fn();

  return {
    getAnalytics: vi.fn(() => mockAnalytics),
    logEvent: mockLogEvent,
  };
});

describe("CrashlyticsService", () => {
  let crashlyticsService;

  beforeEach(() => {
    // Mock window methods before creating service
    global.window = {
      addEventListener: vi.fn(),
      location: { href: "test" },
      innerWidth: 1920,
      innerHeight: 1080,
    };
    global.navigator = { userAgent: "test" };
    global.document = {
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
    };

    crashlyticsService = new CrashlyticsService();
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "group").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});
  });

  afterEach(() => {
    crashlyticsService.clearErrorQueue();
    vi.restoreAllMocks();
  });

  describe("Registro de Errores", () => {
    it("debe registrar un error básico correctamente", () => {
      const errorType = "test_error";
      const error = new Error("Test error message");
      const context = { component: "TestComponent" };

      crashlyticsService.recordError(errorType, error, context, "medium");

      expect(crashlyticsService.errorQueue).toHaveLength(1);

      const recordedError = crashlyticsService.errorQueue[0];
      expect(recordedError.error_type).toBe("test_error");
      expect(recordedError.error_message).toBe("Test error message");
      expect(recordedError.severity).toBe("medium");
      expect(recordedError.context.component).toBe("TestComponent");
    });

    it("debe manejar errores como strings", () => {
      const errorMessage = "String error message";

      crashlyticsService.recordError("string_error", errorMessage);

      const recordedError = crashlyticsService.errorQueue[0];
      expect(recordedError.error_message).toBe("String error message");
      expect(recordedError.error_stack).toBeNull();
    });

    it("debe incluir stack trace para objetos Error", () => {
      const error = new Error("Error with stack");

      crashlyticsService.recordError("stack_error", error);

      const recordedError = crashlyticsService.errorQueue[0];
      expect(recordedError.error_stack).toBeTruthy();
      expect(recordedError.error_stack).toContain("Error with stack");
    });

    it("debe agregar contexto automático", () => {
      // Mock window y navigator
      global.window = {
        location: { href: "https://test.com/page" },
        innerWidth: 1920,
        innerHeight: 1080,
      };
      global.navigator = {
        userAgent: "Test User Agent",
      };

      crashlyticsService.recordError("context_test", "Test error");

      const recordedError = crashlyticsService.errorQueue[0];
      expect(recordedError.context.url).toBe("https://test.com/page");
      expect(recordedError.context.user_agent).toBe("Test User Agent");
      expect(recordedError.context.viewport).toBe("1920x1080");
    });

    it("no debe registrar errores cuando está deshabilitado", () => {
      crashlyticsService.setEnabled(false);

      crashlyticsService.recordError("disabled_test", "Test error");

      expect(crashlyticsService.errorQueue).toHaveLength(0);
    });
  });

  describe("Errores Específicos de la Aplicación", () => {
    it("debe registrar error de autenticación", () => {
      const authError = new Error("Authentication failed");
      const context = { provider: "google" };

      crashlyticsService.recordAuthError(authError, context);

      const recordedError = crashlyticsService.errorQueue[0];
      expect(recordedError.error_type).toBe("authentication_error");
      expect(recordedError.severity).toBe("high");
      expect(recordedError.context.component).toBe("auth_system");
      expect(recordedError.context.provider).toBe("google");
    });

    it("debe registrar error de Firestore", () => {
      const firestoreError = new Error("Permission denied");
      const operation = "read";
      const collection = "users";

      crashlyticsService.recordFirestoreError(
        firestoreError,
        operation,
        collection
      );

      const recordedError = crashlyticsService.errorQueue[0];
      expect(recordedError.error_type).toBe("firestore_error");
      expect(recordedError.context.operation).toBe("read");
      expect(recordedError.context.collection).toBe("users");
      expect(recordedError.context.component).toBe("database");
    });

    it("debe registrar error de Cloud Function", () => {
      const functionError = new Error("Function timeout");
      const functionName = "updateUserRole";
      const parameters = { userId: "123", newRole: "admin" };

      crashlyticsService.recordCloudFunctionError(
        functionError,
        functionName,
        parameters
      );

      const recordedError = crashlyticsService.errorQueue[0];
      expect(recordedError.error_type).toBe("cloud_function_error");
      expect(recordedError.context.function_name).toBe("updateUserRole");
      expect(recordedError.context.component).toBe("cloud_functions");
    });

    it("debe registrar error de validación", () => {
      const validationError = new Error("Invalid RUT format");
      const formType = "user_registration";
      const fieldName = "rut";

      crashlyticsService.recordValidationError(
        validationError,
        formType,
        fieldName
      );

      const recordedError = crashlyticsService.errorQueue[0];
      expect(recordedError.error_type).toBe("validation_error");
      expect(recordedError.severity).toBe("low");
      expect(recordedError.context.form_type).toBe("user_registration");
      expect(recordedError.context.field_name).toBe("rut");
    });

    it("debe registrar error de red", () => {
      const networkError = new Error("Network timeout");
      const url = "/api/users";
      const method = "POST";

      crashlyticsService.recordNetworkError(networkError, url, method);

      const recordedError = crashlyticsService.errorQueue[0];
      expect(recordedError.error_type).toBe("network_error");
      expect(recordedError.context.url).toBe("/api/users");
      expect(recordedError.context.method).toBe("POST");
    });

    it("debe registrar error de UI", () => {
      const uiError = new Error("Component render failed");
      const componentName = "UserProfileCard";
      const action = "mount";

      crashlyticsService.recordUIError(uiError, componentName, action);

      const recordedError = crashlyticsService.errorQueue[0];
      expect(recordedError.error_type).toBe("ui_error");
      expect(recordedError.context.component_name).toBe("UserProfileCard");
      expect(recordedError.context.action).toBe("mount");
    });
  });

  describe("Gestión de Cola de Errores", () => {
    it("debe mantener el tamaño máximo de la cola", () => {
      crashlyticsService.maxQueueSize = 3;

      // Agregar más errores que el límite
      for (let i = 0; i < 5; i++) {
        crashlyticsService.recordError("test_error", `Error ${i}`);
      }

      expect(crashlyticsService.errorQueue).toHaveLength(3);

      // Verificar que se mantuvieron los errores más recientes
      const messages = crashlyticsService.errorQueue.map(
        (e) => e.error_message
      );
      expect(messages).toEqual(["Error 2", "Error 3", "Error 4"]);
    });

    it("debe limpiar la cola de errores", () => {
      crashlyticsService.recordError("test_error", "Test error");
      expect(crashlyticsService.errorQueue).toHaveLength(1);

      crashlyticsService.clearErrorQueue();
      expect(crashlyticsService.errorQueue).toHaveLength(0);
    });
  });

  describe("Estadísticas y Análisis", () => {
    beforeEach(() => {
      // Agregar errores de prueba
      crashlyticsService.recordError("auth_error", "Auth failed", {}, "high");
      crashlyticsService.recordError(
        "network_error",
        "Network failed",
        {},
        "medium"
      );
      crashlyticsService.recordError(
        "auth_error",
        "Auth failed again",
        {},
        "high"
      );
      crashlyticsService.recordError("ui_error", "UI failed", {}, "low");
    });

    it("debe generar estadísticas correctas", () => {
      const stats = crashlyticsService.getErrorStats();

      expect(stats.total).toBe(4);
      expect(stats.by_type.auth_error).toBe(2);
      expect(stats.by_type.network_error).toBe(1);
      expect(stats.by_type.ui_error).toBe(1);
      expect(stats.by_severity.high).toBe(2);
      expect(stats.by_severity.medium).toBe(1);
      expect(stats.by_severity.low).toBe(1);
      expect(stats.recent).toHaveLength(4);
    });

    it("debe exportar errores en formato JSON", () => {
      const exported = crashlyticsService.exportErrors("json");
      const data = JSON.parse(exported);

      expect(data.total_errors).toBe(4);
      expect(data.errors).toHaveLength(4);
      expect(data.exported_at).toBeTruthy();
    });

    it("debe exportar errores en formato CSV", () => {
      const csv = crashlyticsService.exportErrors("csv");

      expect(csv).toContain("timestamp,error_type,severity,error_message,url");
      expect(csv).toContain("auth_error");
      expect(csv).toContain("network_error");
      expect(csv).toContain("ui_error");
    });

    it("debe convertir errores a CSV correctamente", () => {
      const errors = [
        {
          timestamp: "2024-01-01T00:00:00.000Z",
          error_type: "test_error",
          severity: "medium",
          error_message: 'Test "quoted" message',
          context: { url: "https://test.com" },
        },
      ];

      const csv = crashlyticsService.convertToCSV(errors);

      expect(csv).toContain('"Test ""quoted"" message"'); // Escaped quotes
      expect(csv).toContain('"https://test.com"');
    });
  });

  describe("Configuración de Usuario y Contexto", () => {
    it("debe configurar contexto de usuario", () => {
      const userId = "user123";
      const email = "test@example.com";
      const additionalData = { role: "admin" };

      crashlyticsService.setUser(userId, email, additionalData);

      expect(crashlyticsService.userContext.user_id).toBe("user123");
      expect(crashlyticsService.userContext.user_email).toBe(
        "test@example.com"
      );
      expect(crashlyticsService.userContext.role).toBe("admin");
    });

    it("debe configurar contexto global", () => {
      const globalContext = { app_version: "1.0.0", environment: "production" };

      crashlyticsService.setGlobalContext(globalContext);

      expect(crashlyticsService.globalContext.app_version).toBe("1.0.0");
      expect(crashlyticsService.globalContext.environment).toBe("production");
    });
  });

  describe("Estilos de Consola", () => {
    it("debe obtener estilos correctos según severidad", () => {
      expect(crashlyticsService.getConsoleStyle("low")).toContain(
        "color: #2196F3"
      );
      expect(crashlyticsService.getConsoleStyle("medium")).toContain(
        "color: #FF9800"
      );
      expect(crashlyticsService.getConsoleStyle("high")).toContain(
        "color: #F44336"
      );
      expect(crashlyticsService.getConsoleStyle("critical")).toContain(
        "background-color: #F44336"
      );
    });
  });

  describe("Error de Prueba", () => {
    it("debe generar error de prueba", () => {
      crashlyticsService.generateTestError();

      expect(crashlyticsService.errorQueue).toHaveLength(1);

      const testError = crashlyticsService.errorQueue[0];
      expect(testError.error_type).toBe("test_error");
      expect(testError.error_message).toBe(
        "This is a test error for Crashlytics"
      );
      expect(testError.severity).toBe("low");
      expect(testError.context.test).toBe(true);
    });
  });
});
