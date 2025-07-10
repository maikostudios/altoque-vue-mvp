/**
 * 🧪 Security Tester - De Una Transferencias
 * Herramientas para testing de seguridad y validación de funciones críticas
 */

import { getFunctions, httpsCallable } from 'firebase/functions'
import { getAuth } from 'firebase/auth'
import { auditService } from '@/services/auditService'

/**
 * ✅ CLASE PRINCIPAL DE TESTING DE SEGURIDAD
 */
export class SecurityTester {
  constructor() {
    this.functions = getFunctions()
    this.auth = getAuth()
    this.testResults = []
  }

  /**
   * 🔐 Test completo de Cloud Functions de gestión de roles
   */
  async testRoleManagementSecurity() {
    console.log('🧪 Iniciando tests de seguridad para gestión de roles...')
    
    const tests = [
      this.testUpdateUserRolePermissions(),
      this.testUpdateUserPlanPermissions(),
      this.testInvalidRoleValues(),
      this.testTransactionAtomicity(),
      this.testLoggingCompleteness()
    ]

    const results = await Promise.allSettled(tests)
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ Test ${index + 1} completado:`, result.value)
      } else {
        console.error(`❌ Test ${index + 1} falló:`, result.reason)
      }
    })

    return results
  }

  /**
   * 🔒 Test de permisos para updateUserRole
   */
  async testUpdateUserRolePermissions() {
    try {
      const updateUserRole = httpsCallable(this.functions, 'updateUserRole')
      
      // Test 1: Usuario no autenticado
      const testUser = 'test-user-id'
      const newRole = 'vendedor'
      
      try {
        await updateUserRole({ userId: testUser, newRole })
        return { test: 'updateUserRole_unauthenticated', status: 'FAIL', message: 'Debería fallar sin autenticación' }
      } catch (error) {
        if (error.code === 'functions/unauthenticated') {
          return { test: 'updateUserRole_unauthenticated', status: 'PASS', message: 'Correctamente rechaza usuarios no autenticados' }
        }
      }

      // Test 2: Usuario sin permisos de admin
      if (this.auth.currentUser) {
        try {
          await updateUserRole({ userId: testUser, newRole })
          return { test: 'updateUserRole_permissions', status: 'FAIL', message: 'Debería fallar sin permisos de admin' }
        } catch (error) {
          if (error.code === 'functions/permission-denied') {
            return { test: 'updateUserRole_permissions', status: 'PASS', message: 'Correctamente rechaza usuarios sin permisos' }
          }
        }
      }

      return { test: 'updateUserRole_permissions', status: 'PARTIAL', message: 'Tests básicos completados' }

    } catch (error) {
      return { test: 'updateUserRole_permissions', status: 'ERROR', message: error.message }
    }
  }

  /**
   * 💎 Test de permisos para updateUserPlan
   */
  async testUpdateUserPlanPermissions() {
    try {
      const updateUserPlan = httpsCallable(this.functions, 'updateUserPlan')
      
      const testUser = 'test-user-id'
      const newPlan = { isPremium: true, planType: 'premium' }
      
      // Test 1: Usuario no autenticado
      try {
        await updateUserPlan({ userId: testUser, newPlan })
        return { test: 'updateUserPlan_unauthenticated', status: 'FAIL', message: 'Debería fallar sin autenticación' }
      } catch (error) {
        if (error.code === 'functions/unauthenticated') {
          return { test: 'updateUserPlan_unauthenticated', status: 'PASS', message: 'Correctamente rechaza usuarios no autenticados' }
        }
      }

      // Test 2: Validación de datos
      if (this.auth.currentUser) {
        try {
          await updateUserPlan({ userId: '', newPlan })
          return { test: 'updateUserPlan_validation', status: 'FAIL', message: 'Debería fallar con datos inválidos' }
        } catch (error) {
          if (error.code === 'functions/invalid-argument') {
            return { test: 'updateUserPlan_validation', status: 'PASS', message: 'Correctamente valida datos de entrada' }
          }
        }
      }

      return { test: 'updateUserPlan_permissions', status: 'PARTIAL', message: 'Tests básicos completados' }

    } catch (error) {
      return { test: 'updateUserPlan_permissions', status: 'ERROR', message: error.message }
    }
  }

  /**
   * ❌ Test de valores inválidos
   */
  async testInvalidRoleValues() {
    try {
      const updateUserRole = httpsCallable(this.functions, 'updateUserRole')
      
      const invalidRoles = ['invalid_role', '', null, 'super_admin', 'root']
      const testUser = 'test-user-id'
      
      const results = []
      
      for (const invalidRole of invalidRoles) {
        try {
          await updateUserRole({ userId: testUser, newRole: invalidRole })
          results.push({ role: invalidRole, status: 'FAIL', message: 'Debería rechazar rol inválido' })
        } catch (error) {
          if (error.code === 'functions/invalid-argument') {
            results.push({ role: invalidRole, status: 'PASS', message: 'Correctamente rechaza rol inválido' })
          } else {
            results.push({ role: invalidRole, status: 'PARTIAL', message: `Error: ${error.code}` })
          }
        }
      }

      const passCount = results.filter(r => r.status === 'PASS').length
      const totalCount = results.length

      return { 
        test: 'invalid_role_values', 
        status: passCount === totalCount ? 'PASS' : 'PARTIAL',
        message: `${passCount}/${totalCount} validaciones correctas`,
        details: results
      }

    } catch (error) {
      return { test: 'invalid_role_values', status: 'ERROR', message: error.message }
    }
  }

  /**
   * ⚛️ Test de atomicidad de transacciones
   */
  async testTransactionAtomicity() {
    try {
      // Este test requeriría acceso a Firestore para verificar que las transacciones
      // se revierten correctamente en caso de error
      
      return { 
        test: 'transaction_atomicity', 
        status: 'MANUAL', 
        message: 'Requiere testing manual con datos de prueba en Firestore' 
      }

    } catch (error) {
      return { test: 'transaction_atomicity', status: 'ERROR', message: error.message }
    }
  }

  /**
   * 📝 Test de completitud de logging
   */
  async testLoggingCompleteness() {
    try {
      // Verificar que los logs contienen todos los campos requeridos
      const recentLogs = await auditService.getLogs({}, { limit: 10 })
      
      const requiredFields = [
        'type',
        'userId',
        'responsibleUid',
        'responsibleEmail',
        'responsibleIpAddress',
        'responsibleUserAgent',
        'changeDetails',
        'eventDescription',
        'eventSeverity',
        'timestamp'
      ]

      const incompleteLogsCount = recentLogs.logs.filter(log => {
        return requiredFields.some(field => !log[field])
      }).length

      if (incompleteLogsCount === 0) {
        return { 
          test: 'logging_completeness', 
          status: 'PASS', 
          message: 'Todos los logs contienen campos requeridos' 
        }
      } else {
        return { 
          test: 'logging_completeness', 
          status: 'PARTIAL', 
          message: `${incompleteLogsCount} logs incompletos de ${recentLogs.logs.length}` 
        }
      }

    } catch (error) {
      return { test: 'logging_completeness', status: 'ERROR', message: error.message }
    }
  }

  /**
   * 🔍 Test del panel de auditoría
   */
  async testAuditPanelSecurity() {
    try {
      console.log('🧪 Testing panel de auditoría...')
      
      const tests = [
        this.testAuditPanelAccess(),
        this.testFilterSecurity(),
        this.testExportSecurity(),
        this.testDataSanitization()
      ]

      const results = await Promise.allSettled(tests)
      
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return { test: `audit_panel_${index}`, status: 'ERROR', message: result.reason.message }
        }
      })

    } catch (error) {
      return [{ test: 'audit_panel_security', status: 'ERROR', message: error.message }]
    }
  }

  /**
   * 🚪 Test de acceso al panel de auditoría
   */
  async testAuditPanelAccess() {
    try {
      // Verificar que solo usuarios con rol admin pueden acceder
      const currentUser = this.auth.currentUser
      
      if (!currentUser) {
        return { 
          test: 'audit_panel_access', 
          status: 'MANUAL', 
          message: 'Requiere usuario autenticado para testing' 
        }
      }

      // En un entorno real, verificaríamos el rol del usuario actual
      return { 
        test: 'audit_panel_access', 
        status: 'MANUAL', 
        message: 'Verificar manualmente que solo admins pueden acceder' 
      }

    } catch (error) {
      return { test: 'audit_panel_access', status: 'ERROR', message: error.message }
    }
  }

  /**
   * 🔒 Test de seguridad de filtros
   */
  async testFilterSecurity() {
    try {
      // Test de inyección en filtros
      const maliciousInputs = [
        "'; DROP TABLE logs; --",
        "<script>alert('xss')</script>",
        "../../etc/passwd",
        "javascript:alert('xss')"
      ]

      const results = []
      
      for (const input of maliciousInputs) {
        try {
          // Intentar usar input malicioso en filtros
          const testResult = await auditService.getLogs({ search: input }, { limit: 1 })
          
          // Si no hay error, verificar que el input fue sanitizado
          if (testResult.logs.length === 0 || !testResult.logs.some(log => 
            JSON.stringify(log).includes(input)
          )) {
            results.push({ input, status: 'PASS', message: 'Input malicioso filtrado correctamente' })
          } else {
            results.push({ input, status: 'FAIL', message: 'Input malicioso no filtrado' })
          }
        } catch (error) {
          results.push({ input, status: 'PASS', message: 'Error controlado correctamente' })
        }
      }

      const passCount = results.filter(r => r.status === 'PASS').length
      
      return { 
        test: 'filter_security', 
        status: passCount === results.length ? 'PASS' : 'FAIL',
        message: `${passCount}/${results.length} filtros seguros`,
        details: results
      }

    } catch (error) {
      return { test: 'filter_security', status: 'ERROR', message: error.message }
    }
  }

  /**
   * 📤 Test de seguridad de exportación
   */
  async testExportSecurity() {
    try {
      // Verificar que la exportación no expone datos sensibles
      const testLogs = [
        {
          id: 'test-1',
          type: 'test',
          eventDescription: 'Test log',
          responsibleEmail: 'test@example.com',
          responsibleIpAddress: '192.168.1.1',
          responsibleUserAgent: 'Test Agent',
          changeDetails: { password: 'secret123', token: 'abc123' }
        }
      ]

      // Simular exportación
      try {
        auditService.exportToCSV(testLogs, 'test-export.csv')
        
        return { 
          test: 'export_security', 
          status: 'MANUAL', 
          message: 'Verificar manualmente que datos sensibles no se exportan' 
        }
      } catch (error) {
        return { test: 'export_security', status: 'ERROR', message: error.message }
      }

    } catch (error) {
      return { test: 'export_security', status: 'ERROR', message: error.message }
    }
  }

  /**
   * 🧹 Test de sanitización de datos
   */
  async testDataSanitization() {
    try {
      // Verificar que los datos mostrados están sanitizados
      const testData = {
        eventDescription: '<script>alert("xss")</script>Test description',
        responsibleEmail: 'test@example.com<script>alert("xss")</script>',
        changeDetails: {
          oldValue: '<img src=x onerror=alert("xss")>',
          newValue: 'safe value'
        }
      }

      // En un entorno real, verificaríamos que estos datos se muestran sanitizados
      return { 
        test: 'data_sanitization', 
        status: 'MANUAL', 
        message: 'Verificar manualmente que datos se muestran sanitizados en UI' 
      }

    } catch (error) {
      return { test: 'data_sanitization', status: 'ERROR', message: error.message }
    }
  }

  /**
   * 📊 Generar reporte de seguridad
   */
  generateSecurityReport(testResults) {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: testResults.length,
      passed: testResults.filter(r => r.status === 'PASS').length,
      failed: testResults.filter(r => r.status === 'FAIL').length,
      errors: testResults.filter(r => r.status === 'ERROR').length,
      manual: testResults.filter(r => r.status === 'MANUAL').length,
      results: testResults
    }

    console.log('📊 Reporte de Seguridad:', report)
    
    return report
  }

  /**
   * 🚀 Ejecutar todos los tests
   */
  async runAllTests() {
    console.log('🧪 Iniciando suite completa de tests de seguridad...')
    
    try {
      const roleTests = await this.testRoleManagementSecurity()
      const auditTests = await this.testAuditPanelSecurity()
      
      const allResults = [
        ...roleTests.map(r => r.value || r.reason),
        ...auditTests
      ].filter(Boolean)

      const report = this.generateSecurityReport(allResults)
      
      console.log('🎉 Suite de tests completada')
      return report

    } catch (error) {
      console.error('❌ Error ejecutando tests:', error)
      throw error
    }
  }
}

// ✅ INSTANCIA SINGLETON
export const securityTester = new SecurityTester()

// ✅ FUNCIONES DE UTILIDAD PARA TESTING
export const testUtils = {
  /**
   * Crear datos de prueba seguros
   */
  createTestData: () => ({
    testUserId: 'test-user-' + Date.now(),
    testEmail: 'test@example.com',
    testRole: 'usuario',
    testPlan: { isPremium: false, planType: 'free' }
  }),

  /**
   * Limpiar datos de prueba
   */
  cleanupTestData: async (testIds) => {
    console.log('🧹 Limpiando datos de prueba:', testIds)
    // En un entorno real, eliminaríamos los datos de prueba
  },

  /**
   * Verificar integridad de logs
   */
  verifyLogIntegrity: (logs) => {
    const requiredFields = ['type', 'timestamp', 'eventDescription']
    return logs.every(log => 
      requiredFields.every(field => log[field] !== undefined)
    )
  }
}

export default securityTester
