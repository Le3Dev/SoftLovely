# 🚀 Quick Start - Como Testar o Projeto

## 1️⃣ Pré-requisitos
- MySQL rodando na porta 3306
- Java 21+ instalado
- Node.js 16+ instalado

## 2️⃣ Banco de Dados

```sql
CREATE DATABASE softlovely;
CREATE USER 'softlover'@'localhost' IDENTIFIED BY 'softlover123!';
GRANT ALL PRIVILEGES ON softlovely.* TO 'softlover'@'localhost';
FLUSH PRIVILEGES;
```

## 3️⃣ Backend - Spring Boot

```bash
# Terminal 1: Backend
cd C:\Users\leand\OneDrive\ -\ Grupo\ Marista\Projeto\softlovely

# Compilar e rodar
gradlew bootRun

# Esperar até ver "Application started"
# Backend estará em: http://localhost:8080
```

## 4️⃣ Frontend - Next.js

```bash
# Terminal 2: Frontend
cd frontend
npm install  # Primeira vez apenas
npm run dev

# Frontend estará em: http://localhost:3000
```

## 5️⃣ Testar a Aplicação

### 🔐 Registrar Novo Casal

**Via Frontend:**
1. Acesse http://localhost:3000
2. Preencha o formulário de registro (simular)
3. Ou use Postman/Insomnia para testar API

**Via API (Postman/Insomnia/Thunder Client):**

```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senha123",
  "partnerName1": "João",
  "partnerName2": "Maria",
  "slug": "joao-e-maria"
}

# Resposta esperada:
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "userId": "uuid-do-usuario",
  "email": "joao@example.com"
}
```

### 📝 Criar Evento

```bash
POST http://localhost:8080/api/events
Content-Type: application/json
Authorization: Bearer {TOKEN_DO_USUARIO}

{
  "coupleId": "uuid-do-casal",
  "eventDate": "2024-03-15",
  "title": "Primeira Viagem Juntos",
  "description": "Fomos para a praia",
  "category": "viagem",
  "imageUrl": "https://example.com/photo.jpg"
}
```

### 💳 Testar Pagamento

1. Acesse http://localhost:3000/payment
2. Selecione um plano (Basic ou Premium)
3. Digite o ID do casal
4. Clique em "Ir para Pagamento"
5. Use cartão de teste: `4242 4242 4242 4242`
6. Data: `12/25` CVC: `123`
7. Sucesso! Será redirecionado para payment-success

### 📊 Dashboard

1. Acesse http://localhost:3000/dashboard
2. Veja eventos e parceiros
3. Adicione novo evento
4. Teste criar/editar/deletar

## 6️⃣ Endpoints Principais para Testar

### Autenticação
```
POST /api/auth/register
POST /api/auth/login
```

### Casais
```
GET  /api/couples/slug/joao-e-maria
GET  /api/couples/{coupleId}
POST /api/couples
```

### Eventos
```
GET    /api/events/couple/{coupleId}
POST   /api/events
DELETE /api/events/{eventId}
```

### Parceiros
```
GET  /api/partners/couple/{coupleId}
POST /api/partners
```

### Pagamentos
```
POST /api/payments/checkout
GET  /api/payments/success/{coupleId}
GET  /api/payments/cancel/{coupleId}
```

## 7️⃣ Logs Úteis

### Backend
- Procure por "Application started" para confirmar que iniciou
- Use logs Spring Boot para debugging

### Frontend
- F12 > Console para ver erros JS
- Verificar requisições em Network tab

## ⚠️ Possíveis Erros

### "Connection refused"
- Verificar se MySQL está rodando
- Verificar se backend está na porta 8080

### "CORS error"
- Verificar se `app.base-url=http://localhost:8080` em application.properties
- Endpoints já têm `@CrossOrigin(origins = "http://localhost:3000")`

### "Token inválido"
- Usar token retornado do login/register
- Token é salvo em localStorage no frontend

### "404 Not Found"
- Verificar se endpoint existe
- Verificar path exato (diferencia maiúsculas/minúsculas)

## 🎯 Fluxo Completo de Teste

1. **Registrar**: POST /api/auth/register
2. **Criar Evento**: POST /api/events
3. **Listar Eventos**: GET /api/events/couple/{id}
4. **Upgrade Premium**: POST /api/payments/checkout
5. **Ver Perfil Público**: GET /couples/slug/seu-slug

## 📞 Dicas

- Use Postman/Insomnia para testar APIs (mais fácil que curl)
- Guarde o token e userId após register
- Use o coupleId que é criado automaticamente no register
- Para Stripe, usar cartões de teste da documentação oficial

## 🟢 Status

Tudo está compilando e pronto para usar!

Se receber erro de build, tente:
```bash
gradlew --stop
rm -rf build .gradle
gradlew build -x test
```

