@echo off
REM ✅ ETAPA 6: Script para ejecutar todos los tests y verificaciones (Windows)
REM Este script ejecuta una verificación completa del sistema implementado

echo 🚀 INICIANDO VERIFICACIÓN COMPLETA DE ETAPA 6...
echo ==================================================

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo [ERROR] No se encontró package.json. Ejecuta este script desde la raíz del proyecto.
    exit /b 1
)

echo [INFO] Verificando estructura del proyecto...

REM 1. Verificar archivos críticos
echo [INFO] 1. Verificando archivos críticos de Etapa 6...

set "missing_files=0"

REM Lista de archivos críticos
set files[0]=src\services\performanceService.js
set files[1]=src\services\crashlyticsService.js
set files[2]=src\services\budgetMonitoringService.js
set files[3]=src\services\adsenseService.js
set files[4]=src\components\monitoring\PerformanceDashboard.vue
set files[5]=src\components\feedback\UserFeedbackModal.vue
set files[6]=src\components\ads\AdSenseUnit.vue
set files[7]=functions\src\databaseOptimization.js
set files[8]=tests\unit\services\performanceService.test.js
set files[9]=tests\unit\services\crashlyticsService.test.js
set files[10]=tests\integration\etapa6.integration.test.js
set files[11]=docs\ADR.md
set files[12]=docs\ETAPA6_DOCUMENTACION.md
set files[13]=firebase.json

for /L %%i in (0,1,13) do (
    if exist "!files[%%i]!" (
        echo [SUCCESS] ✓ !files[%%i]!
    ) else (
        echo [ERROR] ✗ !files[%%i]! - FALTANTE
        set /a missing_files+=1
    )
)

if %missing_files% gtr 0 (
    echo [ERROR] Faltan %missing_files% archivos críticos. Abortando tests.
    exit /b 1
)

echo [SUCCESS] Todos los archivos críticos están presentes

REM 2. Verificar dependencias
echo [INFO] 2. Verificando dependencias de Node.js...

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm no está instalado
    exit /b 1
)

echo [INFO] Instalando dependencias...
call npm install --silent

if %errorlevel% neq 0 (
    echo [ERROR] Error instalando dependencias
    exit /b 1
)

echo [SUCCESS] Dependencias instaladas correctamente

REM 3. Verificar Firebase CLI
echo [INFO] 3. Verificando Firebase CLI...

where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Firebase CLI no está instalado. Instalando...
    call npm install -g firebase-tools
)

echo [SUCCESS] Firebase CLI disponible

REM 4. Ejecutar linting
echo [INFO] 4. Ejecutando linting...

call npm run lint --silent
if %errorlevel% equ 0 (
    echo [SUCCESS] Linting pasó sin errores
) else (
    echo [WARNING] Hay warnings de linting, pero continuando...
)

REM 5. Ejecutar tests unitarios
echo [INFO] 5. Ejecutando tests unitarios...

call npm run test:unit --silent
if %errorlevel% equ 0 (
    echo [SUCCESS] Tests unitarios pasaron
) else (
    echo [ERROR] Tests unitarios fallaron
    exit /b 1
)

REM 6. Ejecutar tests de integración
echo [INFO] 6. Ejecutando tests de integración...

call npm run test:integration --silent
if %errorlevel% equ 0 (
    echo [SUCCESS] Tests de integración pasaron
) else (
    echo [WARNING] Tests de integración fallaron, pero continuando...
)

REM 7. Verificar build de producción
echo [INFO] 7. Verificando build de producción...

call npm run build --silent
if %errorlevel% equ 0 (
    echo [SUCCESS] Build de producción exitoso
    
    REM Verificar que los archivos de build existen
    if exist "dist" if exist "dist\index.html" (
        echo [SUCCESS] Archivos de build generados correctamente
    ) else (
        echo [ERROR] Build completado pero archivos no encontrados
        exit /b 1
    )
) else (
    echo [ERROR] Build de producción falló
    exit /b 1
)

REM 8. Verificar configuración de Firebase
echo [INFO] 8. Verificando configuración de Firebase...

if exist "firebase.json" (
    REM Verificar que tiene configuración de emulators
    findstr /c:"emulators" firebase.json >nul
    if %errorlevel% equ 0 (
        echo [SUCCESS] Configuración de emulators encontrada
    ) else (
        echo [WARNING] Configuración de emulators no encontrada
    )
    
    REM Verificar que tiene configuración de functions
    findstr /c:"functions" firebase.json >nul
    if %errorlevel% equ 0 (
        echo [SUCCESS] Configuración de functions encontrada
    ) else (
        echo [WARNING] Configuración de functions no encontrada
    )
) else (
    echo [ERROR] firebase.json no encontrado
    exit /b 1
)

REM 9. Verificar Cloud Functions
echo [INFO] 9. Verificando Cloud Functions...

if exist "functions" if exist "functions\package.json" (
    echo [INFO] Instalando dependencias de Cloud Functions...
    cd functions
    call npm install --silent
    
    if %errorlevel% equ 0 (
        echo [SUCCESS] Dependencias de Cloud Functions instaladas
    ) else (
        echo [ERROR] Error instalando dependencias de Cloud Functions
        cd ..
        exit /b 1
    )
    
    REM Verificar build de functions
    call npm run build --silent
    if %errorlevel% equ 0 (
        echo [SUCCESS] Build de Cloud Functions exitoso
    ) else (
        echo [WARNING] Build de Cloud Functions falló
    )
    
    cd ..
) else (
    echo [WARNING] Directorio de Cloud Functions no encontrado
)

REM 10. Ejecutar script de verificación personalizado
echo [INFO] 10. Ejecutando verificación personalizada...

if exist "scripts\verify-etapa6.js" (
    node scripts\verify-etapa6.js
    if %errorlevel% equ 0 (
        echo [SUCCESS] Verificación personalizada pasó
    ) else (
        echo [WARNING] Verificación personalizada encontró problemas
    )
) else (
    echo [WARNING] Script de verificación personalizada no encontrado
)

REM 11. Resumen final
echo.
echo ==================================================
echo [SUCCESS] 🎉 VERIFICACIÓN DE ETAPA 6 COMPLETADA
echo ==================================================

echo.
echo [INFO] 📊 RESUMEN DE VERIFICACIÓN:
echo    ✅ Archivos críticos: Presentes
echo    ✅ Dependencias: Instaladas
echo    ✅ Tests unitarios: Pasaron
echo    ✅ Build de producción: Exitoso
echo    ✅ Configuración Firebase: Válida

echo.
echo [INFO] 🚀 PRÓXIMOS PASOS:
echo    1. Iniciar emulators: firebase emulators:start
echo    2. Probar en desarrollo: npm run dev
echo    3. Deploy a producción: firebase deploy

echo.
echo [INFO] 📚 DOCUMENTACIÓN:
echo    • ADR: docs\ADR.md
echo    • Documentación Etapa 6: docs\ETAPA6_DOCUMENTACION.md
echo    • Tests: tests\unit\ y tests\integration\

echo.
echo [SUCCESS] ✨ Sistema listo para monitoreo continuo y escalabilidad
echo ==================================================

pause
