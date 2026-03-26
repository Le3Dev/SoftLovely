# Script para iniciar SoftLovely em duas abas do PowerShell

# Definir cores
$Success = 'Green'
$Error = 'Red'
$Info = 'Cyan'

Write-Host "===============================================" -ForegroundColor $Info
Write-Host "  Iniciando SoftLovely..." -ForegroundColor $Info
Write-Host "===============================================" -ForegroundColor $Info
Write-Host ""

$projectPath = "C:\Users\leand\OneDrive - Grupo Marista\Projeto\softlovely"

# Verificar MySQL
Write-Host "[1/3] Verificando conexão com MySQL..." -ForegroundColor $Info
try {
    mysql -u softlover -psoftlover123! -e "SELECT 1" | Out-Null
    Write-Host "✓ MySQL conectado" -ForegroundColor $Success
} catch {
    Write-Host "✗ MySQL não está acessível" -ForegroundColor $Error
    Write-Host "  Inicie o MySQL manualmente" -ForegroundColor $Error
}

Write-Host ""

# Iniciar Backend em nova janela
Write-Host "[2/3] Iniciando Backend (porta 8080)..." -ForegroundColor $Info
Start-Process powershell -ArgumentList @"
    Set-Location "$projectPath"
    Write-Host "Backend iniciando..." -ForegroundColor Cyan
    .\gradlew bootRun
"@
Write-Host "✓ Backend iniciado em nova janela" -ForegroundColor $Success

Write-Host ""

# Aguardar um pouco para o backend iniciar
Write-Host "[3/3] Aguardando Backend iniciar (30 segundos)..." -ForegroundColor $Info
Start-Sleep -Seconds 30

# Iniciar Frontend em nova janela
Write-Host "✓ Iniciando Frontend (porta 3000)..." -ForegroundColor $Info
Start-Process powershell -ArgumentList @"
    Set-Location "$projectPath\frontend"
    Write-Host "Instalando dependências..." -ForegroundColor Cyan
    npm install --legacy-peer-deps
    Write-Host "Frontend iniciando..." -ForegroundColor Cyan
    npm run dev
"@

Write-Host ""
Write-Host "===============================================" -ForegroundColor $Success
Write-Host "  SoftLovely iniciado!" -ForegroundColor $Success
Write-Host "===============================================" -ForegroundColor $Success
Write-Host ""
Write-Host "Backend:  http://localhost:8080" -ForegroundColor $Success
Write-Host "Frontend: http://localhost:3000" -ForegroundColor $Success
Write-Host ""
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor $Info

