# Implementação de Fluxo de Pagamento Stripe com QR Code

## Resumo das Alterações Realizadas

### Backend (Java/Spring Boot)

#### 1. **Modelo Couple.java** ✅
- Adicionado campo `uniqueHash` (String, unique, max 64 caracteres)
- Adicionados getters e setters para `uniqueHash`
- Campo gerado automaticamente após pagamento bem-sucedido

#### 2. **Novo Serviço: QRCodeService.java** ✅
- Gera QR Codes em formato Base64 PNG
- Método `generateUniqueHash()` - cria hash único de 32 caracteres
- Método `generateQRCodeBase64()` - cria QR code customizável
- Método `generateQRCodeForCouple()` - integra hash com URL base do app

#### 3. **Repository: CoupleRepository.java** ✅
- Adicionado método `findByUniqueHash(String uniqueHash)`
- Permite buscar casal pelo hash único do QR code

#### 4. **Service: StripeService.java** ✅
- Injetado QRCodeService
- Webhook atualizado para gerar hash único após pagamento bem-sucedido
- Hash gerado apenas uma vez e persistido no banco

#### 5. **Service: CoupleService.java** ✅
- Injetado QRCodeService
- Método `getCoupleByHash()` - busca casal pelo hash
- Método `generateQRCodeForCouple()` - gera QR code para casal específico

#### 6. **DTO: PaymentDtos.java** ✅
- SuccessResponse expandido com campos:
  - `qrCodeData` - QR code em Base64
  - `coupleHash` - hash único do casal
  - `pageUrl` - URL completa para página do casal

#### 7. **Controller: PaymentController.java** ✅
- Injetado QRCodeService
- Endpoint `/success/{coupleId}` retorna QR code e URL
- Gera QR code automaticamente após pagamento

#### 8. **Novo Controller: CoupleHashController.java** ✅
- Endpoint `/api/couples/hash/{hash}` para acessar casal pelo QR
- Permite que links do QR code funcionem corretamente

### Frontend (Next.js)

#### 1. **package.json** ✅
- Adicionada dependência `@stripe/react-stripe-js: ^2.4.0`
- Adicionada dependência `qrcode.react: ^1.0.1`

#### 2. **Página: pages/payment.js** ✅
- Integração com query param `coupleId`
- Carregamento automático de dados do casal
- Interface de seleção entre Plano Básico ($9.99) e Premium ($29.99)
- Exibição de informações do casal
- Instruções de teste com cartão 4242 4242 4242 4242
- Botão para redirecionar ao Stripe Checkout

#### 3. **Página: pages/payment-success.js** ✅
- Exibição de QR Code gerado
- Link da página do casal
- Botão para copiar link
- Botão para visualizar página
- Próximos passos para o usuário

#### 4. **Página: pages/index.js** ✅
- Formulário atualizado para redirecionar a `/payment?coupleId={coupleId}`
- Ao invés de ir direto para a página do casal

#### 5. **Página: pages/c/[hash].js** ✅ (NOVO)
- Rota dinâmica para acessar casal via QR code
- Acessa casal pelo hash único ao invés de slug
- Exibe todas as informações e história do casal
- Renderiza parceiros, eventos e timeline

## Fluxo Completo

1. **Usuário preenche formulário** na página inicial
   - Nome do casal, data, cor, fotos, história

2. **Casal é criado** no banco de dados
   - ID único gerado automaticamente
   - Hash único ainda é NULL

3. **Redireciona para página de pagamento**
   - Exibe planos básico e premium
   - Usuário escolhe um plano e vai para Stripe

4. **Stripe processa pagamento**
   - Webhook é acionado após sucesso
   - Hash único é gerado
   - Campo `isPremium` é atualizado

5. **Usuário vê página de sucesso**
   - QR Code exibido
   - Link da página personalizada
   - Opções para copiar link ou visualizar

6. **Amigos escanear QR Code**
   - Redireciona para `http://localhost:3000/c/{hash}`
   - Página renderiza casal automaticamente
   - Sem conflito com casais de mesmo nome

## Estrutura de URLs

- **Slug (antigo)**: `http://localhost:3000/joao-e-maria`
  - Problema: Casais com mesmo nome conflitam
  
- **Hash (novo)**: `http://localhost:3000/c/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
  - Solução: Cada casal tem hash único gerado após pagamento
  - QR Code aponta para esta URL
  - Funciona mesmo com casais de nomes idênticos

## Variáveis de Ambiente Necessárias

```properties
# Backend
stripe.secret-key=sk_test_...
stripe.public-key=pk_test_...
stripe.webhook-secret=whsec_test_...
app.base-url=http://localhost:8080

# Frontend
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Próximos Passos (Opcional)

1. Implementar renovação de plano Premium
2. Adicionar página de gerenciamento de casais
3. Implementar exportação como PDF
4. Adicionar mais temas de personalização
5. Implementar comentários de convidados
6. Adicionar contador de visualizações do QR Code

