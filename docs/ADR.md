# 📋 Registro de Decisiones de Arquitectura (ADR)
## De Una Transferencias - Maiko Studios SpA

### Propósito
Este documento registra las decisiones arquitectónicas importantes tomadas durante el desarrollo de "De Una Transferencias" y futuros proyectos de Maiko Studios SpA.

---

## ADR-001: Elección de Firebase como Backend Principal
**Fecha:** 2024-12-10  
**Estado:** Aceptado  
**Decisor:** Equipo Maiko Studios SpA  

### Problema
Necesitamos una plataforma backend escalable, segura y de rápida implementación para "De Una Transferencias".

### Alternativas Consideradas
1. **Firebase (Google Cloud)**
2. **AWS Amplify**
3. **Backend personalizado con Node.js + PostgreSQL**
4. **Supabase**

### Decisión Tomada
**Firebase** como plataforma backend principal.

### Justificación
**Pros:**
- Autenticación integrada y segura
- Firestore: base de datos NoSQL escalable
- Cloud Functions para lógica de servidor
- Hosting integrado
- Monitoreo y analytics incluidos
- Escalabilidad automática
- Capa gratuita generosa

**Contras:**
- Vendor lock-in con Google
- Costos pueden escalar rápidamente
- Limitaciones en consultas complejas

**Razón de la elección:** Firebase ofrece el mejor balance entre velocidad de desarrollo, escalabilidad y costo para un MVP, permitiendo enfocarse en la lógica de negocio.

---

## ADR-002: Estructura de Roles y Permisos
**Fecha:** 2024-12-10  
**Estado:** Aceptado  
**Decisor:** Equipo Maiko Studios SpA  

### Problema
Definir un sistema de roles escalable que soporte diferentes tipos de usuarios y permisos granulares.

### Alternativas Consideradas
1. **Roles simples (admin, user)**
2. **Sistema de roles jerárquico**
3. **Permisos granulares por función**
4. **Roles híbridos con permisos específicos**

### Decisión Tomada
**Sistema de roles híbrido** con roles base y permisos específicos.

### Justificación
**Estructura implementada:**
```javascript
{
  rol: 'admin' | 'vendedor' | 'soporte' | 'usuario',
  permisos: {
    gestionarUsuarios: boolean,
    verEstadisticas: boolean,
    cambiarPlanes: boolean,
    // ... otros permisos específicos
  },
  userType: 'internal_maiko_studios' | 'external_client',
  associatedProjects: ['deuna', 'otros_proyectos']
}
```

**Pros:**
- Flexibilidad para casos específicos
- Escalable para nuevos proyectos
- Seguridad granular
- Fácil auditoría

**Contras:**
- Mayor complejidad inicial
- Requiere validación cuidadosa

---

## ADR-003: Estrategia de Validación de Identidad
**Fecha:** 2024-12-10  
**Estado:** Aceptado  
**Decisor:** Equipo Maiko Studios SpA  

### Problema
Implementar validación de identidad robusta para usuarios chilenos cumpliendo con regulaciones locales.

### Alternativas Consideradas
1. **Solo validación de RUT**
2. **Integración con API gubernamental**
3. **Validación manual por equipo**
4. **Sistema híbrido automático + manual**

### Decisión Tomada
**Sistema híbrido** con validación automática de RUT y verificación manual de documentos.

### Justificación
**Implementación:**
- Validación automática de formato y dígito verificador de RUT
- Subida de documentos (CI, comprobante de ingresos)
- Verificación manual por equipo de soporte
- Estados: 'pending', 'verified', 'rejected'

**Pros:**
- Cumplimiento regulatorio
- Flexibilidad para casos especiales
- Control de calidad humano
- Escalable con automatización futura

**Contras:**
- Requiere recursos humanos
- Tiempo de procesamiento variable

---

## ADR-004: Arquitectura de Base de Datos para Escalabilidad
**Fecha:** 2024-12-10  
**Estado:** Aceptado  
**Decisor:** Equipo Maiko Studios SpA  

### Problema
Diseñar estructura de datos que escale eficientemente para millones de usuarios.

### Alternativas Consideradas
1. **Estructura normalizada tradicional**
2. **Desnormalización completa**
3. **Desnormalización estratégica**
4. **Microservicios con bases de datos separadas**

### Decisión Tomada
**Desnormalización estratégica** con colecciones de búsqueda dedicadas.

### Justificación
**Estructura implementada:**
```
users/{userId} - Datos principales (O(1) acceso)
user_by_rut/{rut} - Búsqueda por RUT (O(1))
user_by_email/{email} - Búsqueda por email (O(1))
user_by_phone/{phone} - Búsqueda por teléfono (O(1))
user_metrics/{userId} - Métricas de usuario
```

**Pros:**
- Consultas O(1) para búsquedas frecuentes
- Escalabilidad para millones de usuarios
- Costos optimizados de Firestore
- Consistencia mediante Cloud Functions

**Contras:**
- Complejidad en mantenimiento de consistencia
- Duplicación controlada de datos
- Requiere transacciones cuidadosas

---

## ADR-005: Estrategia de Monitoreo y Observabilidad
**Fecha:** 2024-12-10  
**Estado:** Aceptado  
**Decisor:** Equipo Maiko Studios SpA  

### Problema
Implementar monitoreo completo para detectar problemas proactivamente y optimizar costos.

### Alternativas Consideradas
1. **Solo logs básicos de Firebase**
2. **Herramientas de terceros (DataDog, New Relic)**
3. **Solución híbrida Firebase + herramientas propias**
4. **Monitoreo completo con Firebase Performance + Analytics**

### Decisión Tomada
**Monitoreo completo con Firebase** complementado con servicios propios.

### Justificación
**Implementación:**
- Firebase Performance Monitoring para trazas
- Firebase Analytics para eventos
- Crashlytics para errores
- Servicios propios para presupuesto y métricas de negocio

**Pros:**
- Integración nativa con Firebase
- Costo controlado
- Datos centralizados
- Alertas proactivas

**Contras:**
- Dependencia de Firebase
- Limitaciones en análisis avanzados

---

## ADR-006: Estrategia de Testing y Calidad
**Fecha:** 2024-12-10  
**Estado:** Aceptado  
**Decisor:** Equipo Maiko Studios SpA  

### Problema
Asegurar calidad del código y funcionalidad mediante testing automatizado.

### Alternativas Consideradas
1. **Solo testing manual**
2. **Testing unitario básico**
3. **Testing completo (unitario + integración + e2e)**
4. **Testing automatizado con CI/CD**

### Decisión Tomada
**Testing completo** con enfoque en componentes críticos.

### Justificación
**Estrategia implementada:**
- Tests unitarios para servicios críticos
- Tests de integración para flujos principales
- Tests de conversión para UX/UI
- Firebase Emulators para testing local

**Pros:**
- Detección temprana de errores
- Confianza en deployments
- Documentación viva del comportamiento
- Refactoring seguro

**Contras:**
- Tiempo inicial de setup
- Mantenimiento de tests

---

## ADR-007: Estrategia de Monetización y Publicidad
**Fecha:** 2024-12-10  
**Estado:** Aceptado  
**Decisor:** Equipo Maiko Studios SpA  

### Problema
Implementar monetización sostenible sin comprometer la experiencia de usuario.

### Alternativas Consideradas
1. **Solo planes Premium**
2. **Solo publicidad externa**
3. **Modelo híbrido Premium + publicidad propia**
4. **Freemium con publicidad externa**

### Decisión Tomada
**Modelo híbrido** con planes Premium y publicidad propia de Maiko Studios.

### Justificación
**Implementación:**
- Plan gratuito con limitaciones
- Plan Premium con funciones avanzadas
- Publicidad no invasiva de servicios Maiko Studios
- Promoción cruzada del ecosistema

**Pros:**
- Múltiples fuentes de ingresos
- Control total de la experiencia
- Promoción del ecosistema Maiko Studios
- Escalabilidad de ingresos

**Contras:**
- Complejidad en balancear monetización y UX
- Requiere contenido publicitario de calidad

---

## ADR-008: Arquitectura de Seguridad y Privacidad
**Fecha:** 2024-12-10  
**Estado:** Aceptado  
**Decisor:** Equipo Maiko Studios SpA  

### Problema
Implementar seguridad robusta protegiendo datos sensibles de usuarios.

### Alternativas Consideradas
1. **Seguridad básica de Firebase**
2. **Encriptación adicional en cliente**
3. **Seguridad multicapa con auditoría**
4. **Compliance completo con regulaciones**

### Decisión Tomada
**Seguridad multicapa** con auditoría completa.

### Justificación
**Implementación:**
- Reglas de Firestore granulares
- Validación en Cloud Functions
- Auditoría completa de acciones críticas
- Encriptación de datos sensibles
- Logs de seguridad detallados

**Pros:**
- Protección robusta de datos
- Cumplimiento regulatorio
- Trazabilidad completa
- Detección de anomalías

**Contras:**
- Complejidad adicional
- Overhead en performance

---

## Plantilla para Nuevas Decisiones

### ADR-XXX: [Título de la Decisión]
**Fecha:** YYYY-MM-DD  
**Estado:** [Propuesto/Aceptado/Rechazado/Superseded]  
**Decisor:** [Persona/Equipo]  

#### Problema
[Descripción del problema que requiere una decisión]

#### Alternativas Consideradas
1. **Opción 1**
2. **Opción 2**
3. **Opción 3**

#### Decisión Tomada
[Decisión seleccionada]

#### Justificación
**Pros:**
- [Ventajas]

**Contras:**
- [Desventajas]

**Razón de la elección:** [Explicación detallada]

---

## Historial de Cambios
- **2024-12-10:** Creación inicial del ADR con decisiones fundamentales
- **[Fecha]:** [Descripción de cambios futuros]

## Mantenimiento
Este documento debe actualizarse cada vez que se tome una decisión arquitectónica significativa. Todas las decisiones deben ser revisadas y aprobadas por el equipo técnico de Maiko Studios SpA.
