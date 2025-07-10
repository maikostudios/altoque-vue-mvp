// ✅ ETAPA 6: Tests unitarios para Performance Service
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock Firebase Performance
vi.mock("firebase/performance", () => {
  const mockTrace = {
    start: vi.fn(),
    stop: vi.fn(),
    putAttribute: vi.fn(),
    putMetric: vi.fn(),
  };

  return {
    getPerformance: vi.fn(() => ({})),
    trace: vi.fn(() => mockTrace),
  };
});

// Mock Firebase app
vi.mock("@/firebase", () => ({
  default: {},
}));

// Importar después de los mocks
const { PerformanceService } = await import("@/services/performanceService");

describe("PerformanceService", () => {
  let performanceService;

  beforeEach(() => {
    performanceService = new PerformanceService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    performanceService.clearAllTraces();
  });

  describe("Gestión de Trazas", () => {
    it("debe iniciar una traza correctamente", () => {
      const traceName = "test_trace";
      const attributes = { test: "value" };

      const result = performanceService.startTrace(traceName, attributes);

      expect(mockTrace.start).toHaveBeenCalled();
      expect(mockTrace.putAttribute).toHaveBeenCalledWith("test", "value");
      expect(result).toBe(mockTrace);
    });

    it("debe finalizar una traza correctamente", () => {
      const traceName = "test_trace";
      const metrics = { duration: 100 };

      // Iniciar traza primero
      performanceService.startTrace(traceName);

      // Finalizar traza
      performanceService.stopTrace(traceName, metrics);

      expect(mockTrace.putMetric).toHaveBeenCalledWith("duration", 100);
      expect(mockTrace.stop).toHaveBeenCalled();
    });

    it("debe manejar errores al iniciar trazas", () => {
      performanceService.isEnabled = false;

      const result = performanceService.startTrace("test_trace");

      expect(result).toBeNull();
      expect(mockTrace.start).not.toHaveBeenCalled();
    });

    it("debe advertir cuando se intenta finalizar una traza inexistente", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      performanceService.stopTrace("nonexistent_trace");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Trace nonexistent_trace not found"
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Medición de Funciones", () => {
    it("debe medir el tiempo de ejecución de una función exitosa", async () => {
      const testFunction = vi.fn().mockResolvedValue("success");
      const traceName = "function_test";

      const result = await performanceService.measureFunction(
        traceName,
        testFunction
      );

      expect(result).toBe("success");
      expect(mockTrace.start).toHaveBeenCalled();
      expect(mockTrace.stop).toHaveBeenCalled();
      expect(mockTrace.putMetric).toHaveBeenCalledWith("success", 1);
    });

    it("debe manejar errores en funciones medidas", async () => {
      const testError = new Error("Test error");
      const testFunction = vi.fn().mockRejectedValue(testError);
      const traceName = "function_error_test";

      await expect(
        performanceService.measureFunction(traceName, testFunction)
      ).rejects.toThrow("Test error");

      expect(mockTrace.putMetric).toHaveBeenCalledWith("success", 0);
      expect(mockTrace.putMetric).toHaveBeenCalledWith("error_count", 1);
    });
  });

  describe("Trazas Específicas de la Aplicación", () => {
    it("debe crear traza de dashboard con atributos correctos", () => {
      const userInfo = {
        isPremium: true,
        rol: "admin",
        cardCount: 3,
      };

      performanceService.startUserDashboardTrace(userInfo);

      expect(mockTrace.putAttribute).toHaveBeenCalledWith(
        "user_type",
        "premium"
      );
      expect(mockTrace.putAttribute).toHaveBeenCalledWith("user_role", "admin");
      expect(mockTrace.putAttribute).toHaveBeenCalledWith("has_cards", "true");
    });

    it("debe crear traza de landing público con token", () => {
      const userToken = "test_token_123";

      performanceService.startPublicLandingTrace(userToken);

      expect(mockTrace.putAttribute).toHaveBeenCalledWith("has_token", "true");
      expect(mockTrace.putAttribute).toHaveBeenCalledWith(
        "access_type",
        "direct"
      );
    });

    it("debe crear traza de landing público sin token", () => {
      performanceService.startPublicLandingTrace(null);

      expect(mockTrace.putAttribute).toHaveBeenCalledWith("has_token", "false");
      expect(mockTrace.putAttribute).toHaveBeenCalledWith(
        "access_type",
        "organic"
      );
    });

    it("debe crear traza de copia de datos", () => {
      const cardCount = 2;

      performanceService.startCopyDataTrace(cardCount);

      expect(mockTrace.putAttribute).toHaveBeenCalledWith("card_count", "2");
      expect(mockTrace.putAttribute).toHaveBeenCalledWith(
        "action_type",
        "copy_all_data"
      );
    });

    it("debe crear traza de Cloud Function", () => {
      const functionName = "updateUserRole";
      const parameters = { userId: "123", newRole: "admin" };

      performanceService.startCloudFunctionTrace(functionName, parameters);

      expect(mockTrace.putAttribute).toHaveBeenCalledWith(
        "function_name",
        "updateUserRole"
      );
      expect(mockTrace.putAttribute).toHaveBeenCalledWith(
        "parameter_count",
        "2"
      );
    });
  });

  describe("Métricas Personalizadas", () => {
    it("debe registrar métrica personalizada", () => {
      const metricName = "custom_metric";
      const value = 150;
      const attributes = { context: "test" };

      performanceService.recordCustomMetric(metricName, value, attributes);

      expect(mockTrace.putAttribute).toHaveBeenCalledWith("context", "test");
    });

    it("debe registrar error de performance", () => {
      const errorType = "network_error";
      const errorMessage = "Connection timeout";
      const context = { url: "/api/test" };

      performanceService.recordPerformanceError(
        errorType,
        errorMessage,
        context
      );

      expect(mockTrace.putAttribute).toHaveBeenCalledWith(
        "error_type",
        "network_error"
      );
    });

    it("debe calcular severidad de error correctamente", () => {
      expect(performanceService.getErrorSeverity("critical_error")).toBe(5);
      expect(performanceService.getErrorSeverity("system_error")).toBe(4);
      expect(performanceService.getErrorSeverity("network_error")).toBe(3);
      expect(performanceService.getErrorSeverity("timeout_error")).toBe(2);
      expect(performanceService.getErrorSeverity("user_error")).toBe(1);
      expect(performanceService.getErrorSeverity("unknown_error")).toBe(2);
    });
  });

  describe("Configuración", () => {
    it("debe habilitar y deshabilitar el servicio", () => {
      performanceService.setEnabled(false);
      expect(performanceService.isEnabled).toBe(false);

      performanceService.setEnabled(true);
      expect(performanceService.isEnabled).toBe(true);
    });

    it("debe limpiar todas las trazas activas", () => {
      // Crear algunas trazas
      performanceService.startTrace("trace1");
      performanceService.startTrace("trace2");

      expect(performanceService.traces.size).toBe(2);

      performanceService.clearAllTraces();

      expect(performanceService.traces.size).toBe(0);
      expect(mockTrace.stop).toHaveBeenCalledTimes(2);
    });
  });

  describe("Métricas Automáticas", () => {
    beforeEach(() => {
      // Mock window y performance API
      global.window = {
        addEventListener: vi.fn(),
        location: { pathname: "/test" },
        performance: {
          getEntriesByType: vi.fn(() => [
            {
              domContentLoadedEventEnd: 1000,
              domContentLoadedEventStart: 500,
              loadEventEnd: 1500,
              loadEventStart: 1200,
              domainLookupEnd: 100,
              domainLookupStart: 50,
              connectEnd: 200,
              connectStart: 150,
              responseEnd: 800,
              responseStart: 600,
            },
          ]),
          now: vi.fn(() => 1000),
        },
      };
      global.navigator = {
        connection: { effectiveType: "4g" },
      };
      global.document = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });

    it("debe configurar listeners de eventos automáticos", () => {
      performanceService.setupAutomaticMetrics();

      expect(window.addEventListener).toHaveBeenCalledWith(
        "load",
        expect.any(Function)
      );
    });

    it("debe medir métricas de carga de página", () => {
      performanceService.measurePageLoadMetrics();

      expect(mockTrace.putAttribute).toHaveBeenCalledWith("page_url", "/test");
      expect(mockTrace.putAttribute).toHaveBeenCalledWith(
        "connection_type",
        "4g"
      );
    });

    it("debe configurar métricas de interacción del usuario", () => {
      performanceService.setupUserInteractionMetrics();

      expect(document.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        { once: true }
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
        { once: true }
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        "touchstart",
        expect.any(Function),
        { once: true }
      );
    });
  });
});
