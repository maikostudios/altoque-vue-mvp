# Sistema de Soporte y Notificaciones - De Una

Este documento describe la implementación del sistema de soporte y notificaciones para la aplicación De Una.

## 🚀 Funcionalidades Implementadas

### 1. Navegación Actualizada
- ✅ Nueva navegación para usuarios logueados (`UserNavbar.vue`)
- ✅ Eliminación de menús "Login" y "Dashboard" en ruta `/usuario`
- ✅ Botón "Ayuda" que lleva a `/ayuda`
- ✅ Botón "Contactar soporte" en la navegación
- ✅ Campana de notificaciones con dropdown
- ✅ Avatar de usuario con menú desplegable

### 2. Sistema de Notificaciones
- ✅ Store de notificaciones (`notifications.js`)
- ✅ Componente campana de notificaciones (`NotificationBell.vue`)
- ✅ Notificaciones en tiempo real con Firestore
- ✅ Marcar como leído individual y masivo
- ✅ Contador de notificaciones no leídas

### 3. Sistema de Tickets de Soporte
- ✅ Store de soporte (`support.js`)
- ✅ Modal para crear tickets (`SupportTicketModal.vue`)
- ✅ Vista de soporte con lista de tickets (`SupportView.vue`)
- ✅ Asuntos predefinidos y estados de tickets
- ✅ Filtros y búsqueda de tickets

### 4. Páginas de Ayuda
- ✅ Vista de ayuda con FAQs (`HelpView.vue`)
- ✅ Categorías de preguntas
- ✅ Buscador de FAQs
- ✅ Enlaces a soporte

### 5. Footer Actualizado
- ✅ Footer para páginas logueadas (`AppFooter.vue`)
- ✅ Enlaces a soporte visibles desde cualquier página
- ✅ Información de contacto

### 6. Backend (Cloud Functions)
- ✅ Función para procesar tickets creados
- ✅ Función para procesar actualizaciones de tickets
- ✅ Envío de emails automáticos
- ✅ Creación de notificaciones automáticas

## 📁 Estructura de Archivos

```
src/
├── components/
│   ├── navigation/
│   │   └── UserNavbar.vue
│   ├── notifications/
│   │   └── NotificationBell.vue
│   ├── support/
│   │   └── SupportTicketModal.vue
│   └── layout/
│       └── AppFooter.vue
├── views/
│   ├── HelpView.vue
│   └── SupportView.vue
├── store/
│   ├── notifications.js
│   └── support.js
└── styles/
    └── support-view.css

functions/
├── index.js
└── package.json

firestore.rules (actualizado)
```

## 🔧 Configuración Requerida

### 1. Firebase Cloud Functions

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar funciones (si no está hecho)
firebase init functions

# Instalar dependencias
cd functions
npm install

# Configurar variables de entorno para email
firebase functions:config:set email.user="soporte@maikostudios.com"
firebase functions:config:set email.password="tu_app_password_de_gmail"

# Desplegar funciones
firebase deploy --only functions
```

### 2. Reglas de Firestore

Las reglas de Firestore han sido actualizadas para incluir:
- Colección `tickets`
- Colección `notifications`
- Colección `bank_cards`

```bash
# Desplegar reglas
firebase deploy --only firestore:rules
```

### 3. Estructura de Base de Datos

#### Colección `tickets`
```javascript
{
  ticketId: "TK1703123456789",
  userId: "user_uid",
  userEmail: "usuario@email.com",
  userName: "Nombre Usuario",
  asunto: "qr_no_funciona",
  mensaje: "Descripción del problema...",
  estado: "recibido", // recibido, en_proceso, respondido, cerrado
  prioridad: "normal",
  fechaCreacion: Timestamp,
  fechaActualizacion: Timestamp,
  comentarioAdmin: "Respuesta del soporte...",
  historial: [
    {
      accion: "creado",
      descripcion: "Ticket creado por el usuario",
      fecha: Timestamp,
      autor: "usuario"
    }
  ]
}
```

#### Colección `notifications`
```javascript
{
  userId: "user_uid",
  tipo: "ticket_creado", // ticket_creado, ticket_actualizado
  titulo: "Ticket de soporte creado",
  mensaje: "Tu ticket #TK123 ha sido recibido...",
  ticketId: "ticket_doc_id",
  icono: "🎫",
  fechaCreacion: Timestamp,
  fechaLectura: Timestamp,
  leida: false
}
```

## 🎨 Estilos y Diseño

El sistema mantiene la consistencia con el diseño existente:
- **Colores**: #121212 (fondo), #00cccc (turquesa), #1c94e0 (azul)
- **Fuentes**: Montserrat, Roboto
- **Responsive**: Mobile-first design
- **Animaciones**: Transiciones suaves

## 📱 Responsive Design

Todos los componentes son completamente responsivos:
- **Desktop**: Navegación completa, dropdowns amplios
- **Tablet**: Navegación adaptada, grids responsivos
- **Mobile**: Navegación colapsada, componentes apilados

## 🔐 Seguridad

### Reglas de Firestore
- Los usuarios solo pueden ver sus propios tickets y notificaciones
- Solo los admins pueden actualizar estados de tickets
- Validación de permisos en todas las operaciones

### Cloud Functions
- Validación de datos de entrada
- Sanitización de contenido para emails
- Manejo de errores robusto

## 📧 Sistema de Emails

### Configuración de Gmail
1. Habilitar autenticación de 2 factores
2. Generar contraseña de aplicación
3. Configurar variables de entorno en Firebase

### Templates de Email
- **Ticket creado**: Confirmación al usuario + notificación al soporte
- **Ticket actualizado**: Notificación de cambios de estado
- **Respuesta del soporte**: Cuando se agrega comentario admin

## 🚀 Despliegue

### Desarrollo
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar emuladores de Firebase (opcional)
firebase emulators:start
```

### Producción
```bash
# Build de la aplicación
npm run build

# Desplegar todo
firebase deploy

# O desplegar por partes
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## 🧪 Testing

### Funcionalidades a Probar
1. **Creación de tickets**
   - Formulario de creación
   - Validaciones
   - Envío de emails

2. **Notificaciones**
   - Aparición en tiempo real
   - Marcar como leído
   - Contador de no leídas

3. **Navegación**
   - Enlaces correctos
   - Responsive design
   - Permisos por rol

4. **FAQs**
   - Búsqueda
   - Categorías
   - Enlaces internos

## 🐛 Troubleshooting

### Problemas Comunes

1. **Emails no se envían**
   - Verificar configuración de variables de entorno
   - Comprobar contraseña de aplicación de Gmail
   - Revisar logs de Cloud Functions

2. **Notificaciones no aparecen**
   - Verificar reglas de Firestore
   - Comprobar conexión a Firebase
   - Revisar permisos de usuario

3. **Errores de permisos**
   - Verificar reglas de Firestore
   - Comprobar autenticación de usuario
   - Revisar estructura de datos

### Logs y Debugging
```bash
# Ver logs de Cloud Functions
firebase functions:log

# Ver logs en tiempo real
firebase functions:log --follow

# Logs específicos de una función
firebase functions:log --only onTicketCreated
```

## 📞 Soporte

Para problemas con la implementación:
- Email: soporte@maikostudios.com
- Crear ticket en la aplicación
- Revisar documentación de Firebase

## 🔄 Próximas Mejoras

1. **Panel de Admin para Tickets**
   - Vista de todos los tickets
   - Responder desde el panel
   - Estadísticas de soporte

2. **Notificaciones Push**
   - Firebase Cloud Messaging
   - Notificaciones del navegador

3. **Chat en Vivo**
   - Integración con servicio de chat
   - Soporte en tiempo real

4. **Base de Conocimiento**
   - Artículos detallados
   - Videos tutoriales
   - Documentación de API
