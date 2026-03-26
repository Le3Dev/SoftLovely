@echo off
REM Script para verificar e iniciar o projeto SoftLovely

echo ===============================================
echo   Verificacao de Ambiente - SoftLovely
echo ===============================================
echo.

REM Verificar se Java está instalado
echo [1/5] Verificando Java...
java -version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ Java encontrado
) else (
    echo ✗ Java NAO encontrado! Instale Java 21+
    exit /b 1
)

REM Verificar se Node.js está instalado
echo [2/5] Verificando Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✓ Node.js encontrado: %%i
) else (
    echo ✗ Node.js NAO encontrado! Instale Node.js
    exit /b 1
)

REM Verificar se MySQL está rodando
echo [3/5] Verificando MySQL...
mysql -u softlover -psoftlover123! -e "SELECT 1" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ MySQL conectado com sucesso
) else (
    echo ✗ MySQL NAO esta respondendo
    echo   Inicie o MySQL manualmente ou verifique as credenciais
)

REM Verificar se porta 8080 está livre
echo [4/5] Verificando porta 8080...
netstat -ano | findstr :8080 >nul 2>&1
if %ERRORLEVEL% EQU 1 (
    echo ✓ Porta 8080 disponivel
) else (
    echo ✗ Porta 8080 ja esta em uso
    echo   Execute: netstat -ano | findstr :8080
)

REM Verificar se porta 3000 está livre
echo [5/5] Verificando porta 3000...
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL% EQU 1 (
    echo ✓ Porta 3000 disponivel
) else (
    echo ✗ Porta 3000 ja esta em uso
)

echo.
echo ===============================================
echo   Ambiente verificado!
echo ===============================================
echo.
echo Para iniciar o projeto:
echo.
echo Terminal 1 - Backend:
echo   cd "C:\Users\leand\OneDrive - Grupo Marista\Projeto\softlovely"
echo   .\gradlew bootRun
echo.
echo Terminal 2 - Frontend:
echo   cd "C:\Users\leand\OneDrive - Grupo Marista\Projeto\softlovely\frontend"
echo   npm install
echo   npm run dev
echo.
echo Acesse: http://localhost:3000
echo.
pause

