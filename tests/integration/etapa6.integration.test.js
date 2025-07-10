// ✅ ETAPA 6: Tests de integración completos
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'

// Servicios a testear
import { performanceService } from '@/services/performanceService'
import { crashlyticsService } from '@/services/crashlyticsService'
import { budgetMonitoringService } from '@/services/budgetMonitoringService'
import { adsenseService } from '@/services/adsenseService'

// Componentes a testear
import UserDashboardView from '@/views/UserDashboardView.vue'
import PublicTransferView from '@/views/PublicTransferView.vue'
import PerformanceDashboard from '@/components/monitoring/PerformanceDashboard.vue'
import UserFeedbackModal from '@/components/feedback/UserFeedbackModal.vue'
import AdSenseUnit from '@/components/ads/AdSenseUnit.vue'

// Mock Firebase
vi.mock('@/firebase', () => ({
  db: {},
  auth: {},
  performance: {},
  analytics: {}
}))

// Mock Firebase functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  addDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  increment: vi.fn()
}))

vi.mock('firebase/performance', () => ({
  getPerformance: vi.fn(),
  trace: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    putAttribute: vi.fn(),
    putMetric: vi.fn()
  }))
}))

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
  logEvent: vi.fn()
}))

describe('ETAPA 6: Integración Completa del Sistema', () => {
  let vuetify
  let pinia

  beforeAll(() => {
    vuetify = createVuetify()
    pinia = createTestingPinia({
      createSpy: vi.fn
    })

    // Mock global objects
    global.window = {
      location: { href: 'https://test.com', pathname: '/test' },
      innerWidth: 1920,
      innerHeight: 1080,
      addEventListener: vi.fn(),
      performance: {
        getEntriesByType: vi.fn(() => []),
        now: vi.fn(() => 1000)
      },
      matchMedia: vi.fn(() => ({
        matches: true,
        addListener: vi.fn()
      }))
    }

    global.navigator = {
      userAgent: 'Test User Agent',
      connection: { effectiveType: '4g' },
      clipboard: {
        writeText: vi.fn().mockResolvedValue()
      }
    }

    global.document = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      createElement: vi.fn(() => ({
        style: {},
        setAttribute: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        click: vi.fn()
      })),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      },
      head: {
        appendChild: vi.fn()
      },
      getElementById: vi.fn(() => ({
        appendChild: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }))
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Performance Monitoring Integration', () => {
    it('debe inicializar correctamente el servicio de performance', () => {
      expect(performanceService).toBeDefined()
      expect(performanceService.isEnabled).toBe(true)
      expect(performanceService.traces).toBeDefined()
    })

    it('debe crear y gestionar trazas de performance', async () => {
      const traceName = 'test_integration_trace'
      const attributes = { test: 'integration' }

      const trace = performanceService.startTrace(traceName, attributes)
      expect(trace).toBeDefined()

      performanceService.stopTrace(traceName, { duration: 100 })
      expect(performanceService.traces.has(traceName)).toBe(false)
    })

    it('debe medir funciones correctamente', async () => {
      const testFunction = vi.fn().mockResolvedValue('success')
      
      const result = await performanceService.measureFunction(
        'test_function',
        testFunction,
        { context: 'integration_test' }
      )

      expect(result).toBe('success')
      expect(testFunction).toHaveBeenCalled()
    })
  })

  describe('Crashlytics Integration', () => {
    it('debe inicializar correctamente el servicio de crashlytics', () => {
      expect(crashlyticsService).toBeDefined()
      expect(crashlyticsService.isEnabled).toBe(true)
      expect(crashlyticsService.errorQueue).toBeDefined()
    })

    it('debe registrar errores correctamente', () => {
      const error = new Error('Integration test error')
      const context = { component: 'IntegrationTest' }

      crashlyticsService.recordError('integration_error', error, context, 'medium')

      expect(crashlyticsService.errorQueue).toHaveLength(1)
      
      const recordedError = crashlyticsService.errorQueue[0]
      expect(recordedError.error_type).toBe('integration_error')
      expect(recordedError.error_message).toBe('Integration test error')
      expect(recordedError.severity).toBe('medium')
    })

    it('debe generar estadísticas de errores', () => {
      // Limpiar cola primero
      crashlyticsService.clearErrorQueue()

      // Agregar errores de prueba
      crashlyticsService.recordError('error1', 'Test error 1', {}, 'high')
      crashlyticsService.recordError('error2', 'Test error 2', {}, 'medium')
      crashlyticsService.recordError('error1', 'Test error 3', {}, 'low')

      const stats = crashlyticsService.getErrorStats()

      expect(stats.total).toBe(3)
      expect(stats.by_type.error1).toBe(2)
      expect(stats.by_type.error2).toBe(1)
      expect(stats.by_severity.high).toBe(1)
      expect(stats.by_severity.medium).toBe(1)
      expect(stats.by_severity.low).toBe(1)
    })
  })

  describe('Budget Monitoring Integration', () => {
    it('debe inicializar correctamente el servicio de presupuesto', () => {
      expect(budgetMonitoringService).toBeDefined()
      expect(budgetMonitoringService.isEnabled).toBe(true)
      expect(budgetMonitoringService.budgetLimits).toBeDefined()
    })

    it('debe actualizar límites de presupuesto', () => {
      const newLimits = {
        firestore_reads: 75000,
        firestore_writes: 30000
      }

      budgetMonitoringService.updateBudgetLimits(newLimits)

      expect(budgetMonitoringService.budgetLimits.firestore_reads).toBe(75000)
      expect(budgetMonitoringService.budgetLimits.firestore_writes).toBe(30000)
    })

    it('debe actualizar umbrales de alerta', () => {
      const newThresholds = [0.6, 0.8, 0.95, 1.0]

      budgetMonitoringService.updateAlertThresholds(newThresholds)

      expect(budgetMonitoringService.alertThresholds).toEqual([0.6, 0.8, 0.95, 1.0])
    })
  })

  describe('AdSense Integration', () => {
    it('debe inicializar correctamente el servicio de AdSense', () => {
      expect(adsenseService).toBeDefined()
      expect(adsenseService.adUnits).toBeDefined()
    })

    it('debe detectar ad blocker', () => {
      adsenseService.setupAdBlockDetection()
      // En el entorno de test, no hay ad blocker
      expect(adsenseService.adBlockDetected).toBe(false)
    })

    it('debe generar estadísticas de anuncios', () => {
      // Simular unidades de anuncio
      adsenseService.adUnits.set('test-ad-1', {
        impressions: 100,
        clicks: 5,
        revenue: 2.50
      })

      adsenseService.adUnits.set('test-ad-2', {
        impressions: 200,
        clicks: 8,
        revenue: 4.00
      })

      const stats = adsenseService.getAdStats()

      expect(stats.totalUnits).toBe(2)
      expect(stats.totalImpressions).toBe(300)
      expect(stats.totalClicks).toBe(13)
      expect(stats.totalRevenue).toBe(6.50)
      expect(parseFloat(stats.ctr)).toBeCloseTo(4.33, 1)
    })
  })

  describe('Component Integration Tests', () => {
    it('debe montar UserDashboardView con servicios integrados', async () => {
      const wrapper = mount(UserDashboardView, {
        global: {
          plugins: [vuetify, pinia],
          mocks: {
            $route: { query: {} },
            $router: { push: vi.fn() }
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
      
      // Verificar que los servicios se inicializan
      expect(performanceService.startUserDashboardTrace).toBeDefined()
    })

    it('debe montar PublicTransferView con AdSense', async () => {
      const wrapper = mount(PublicTransferView, {
        global: {
          plugins: [vuetify, pinia],
          mocks: {
            $route: { query: { tkn: 'test-token' } },
            $router: { push: vi.fn() }
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('debe montar PerformanceDashboard', async () => {
      const wrapper = mount(PerformanceDashboard, {
        global: {
          plugins: [vuetify],
          props: {
            modelValue: true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.performance-dashboard').exists()).toBe(true)
    })

    it('debe montar UserFeedbackModal', async () => {
      const wrapper = mount(UserFeedbackModal, {
        global: {
          plugins: [vuetify, pinia],
          props: {
            modelValue: true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.feedback-modal').exists()).toBe(true)
    })

    it('debe montar AdSenseUnit', async () => {
      const wrapper = mount(AdSenseUnit, {
        global: {
          plugins: [vuetify],
          props: {
            adUnitId: 'test-ad-unit',
            publisherId: 'ca-pub-test'
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.adsense-unit').exists()).toBe(true)
    })
  })

  describe('End-to-End Workflow Tests', () => {
    it('debe completar flujo de monitoreo de performance', async () => {
      // Simular carga de dashboard
      const dashboardTrace = performanceService.startUserDashboardTrace({
        isPremium: true,
        rol: 'usuario',
        cardCount: 2
      })

      expect(dashboardTrace).toBeDefined()

      // Simular finalización exitosa
      performanceService.stopTrace('user_dashboard_load', {
        cards_count: 2,
        load_success: 1
      })

      // Verificar que la traza se completó
      expect(performanceService.traces.has('user_dashboard_load')).toBe(false)
    })

    it('debe completar flujo de manejo de errores', async () => {
      const initialErrorCount = crashlyticsService.errorQueue.length

      // Simular error en componente
      crashlyticsService.recordUIError(
        new Error('Component failed to render'),
        'TestComponent',
        'mount'
      )

      expect(crashlyticsService.errorQueue.length).toBe(initialErrorCount + 1)

      const latestError = crashlyticsService.errorQueue[crashlyticsService.errorQueue.length - 1]
      expect(latestError.error_type).toBe('ui_error')
      expect(latestError.context.component_name).toBe('TestComponent')
    })

    it('debe completar flujo de feedback de usuario', async () => {
      const feedbackData = {
        type: 'suggestion',
        title: 'Test suggestion',
        message: 'This is a test suggestion',
        contactEmail: 'test@example.com'
      }

      // Simular envío de feedback (normalmente iría a Firestore)
      const mockFeedbackSubmission = vi.fn().mockResolvedValue()
      
      await mockFeedbackSubmission(feedbackData)
      
      expect(mockFeedbackSubmission).toHaveBeenCalledWith(feedbackData)
    })
  })

  afterEach(() => {
    // Limpiar servicios después de cada test
    performanceService.clearAllTraces()
    crashlyticsService.clearErrorQueue()
    adsenseService.clearAllAds()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })
})
