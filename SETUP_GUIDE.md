# 🎉 StoryOfUs - Softlovely

Uma aplicação completa para casais documentarem e compartilharem sua história de amor com funcionalidades premium.

## ✨ Features

- 📅 **Timeline de Eventos** - Organize momentos importantes em uma linha do tempo
- 👥 **Gerenciamento de Parceiros** - Adicione informações dos parceiros
- 🤖 **Histórias com IA** - Gere histórias automaticamente com inteligência artificial
- 💳 **Pagamento Stripe** - Plano básico e premium com pagamento integrado
- 🎨 **Temas Personalizados** - Customize cores e aparência
- 📸 **Galeria de Fotos** - Compartilhe fotos e vídeos dos momentos especiais
- 🌐 **Perfil Público** - Compartilhe sua história com um link único

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.5.6** - Framework Java
- **MySQL** - Banco de dados
- **Stripe API** - Processamento de pagamentos
- **JWT** - Autenticação
- **Spring Security** - Segurança

### Frontend
- **Next.js 13** - React framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Stripe.js** - Integração de pagamentos

## 🚀 Como Rodar

### Pré-requisitos
- Java 21+
- Node.js 16+
- MySQL 8+
- Git

### Backend Setup

1. **Clonar o repositório**
```bash
cd softlovely
```

2. **Configurar banco de dados MySQL**
```sql
CREATE DATABASE softlovely;
CREATE USER 'softlover'@'localhost' IDENTIFIED BY 'softlover123!';
GRANT ALL PRIVILEGES ON softlovely.* TO 'softlover'@'localhost';
FLUSH PRIVILEGES;
```

3. **Configurar variáveis de ambiente**
Editar `src/main/resources/application.properties`:
```properties
# JWT
jwt.secret=sua_chave_secreta_aqui
jwt.expiration=86400000

# Stripe
stripe.secret-key=sk_test_...
stripe.webhook-secret=whsec_...
app.base-url=http://localhost:8080
```

4. **Compilar e rodar**
```bash
./gradlew bootRun
```

Backend estará disponível em: `http://localhost:8080`

### Frontend Setup

1. **Instalar dependências**
```bash
cd frontend
npm install
```

2. **Configurar variáveis de ambiente**
Criar arquivo `.env.local`:
```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

3. **Rodar aplicação**
```bash
npm run dev
```

Frontend estará disponível em: `http://localhost:3000`

## 📖 Guia de Uso

### 1. Registrar novo casal
1. Acesse `http://localhost:3000`
2. Clique em "Registrar"
3. Preencha com email, senha e nomes dos parceiros
4. Crie um slug único (ex: joao-e-maria)

### 2. Acessar Dashboard
1. Após registro, vá para `/dashboard`
2. Adicione eventos importantes
3. Gerencie informações do casal

### 3. Adicionar Eventos
1. No Dashboard, clique em "+ Novo Evento"
2. Preencha título, data, descrição e categoria
3. Salve o evento

### 4. Atualizar para Premium
1. Clique em "Upgrade para Premium"
2. Selecione o plano desejado
3. Complete o pagamento com Stripe
4. Acesse recursos premium

### 5. Compartilhar Perfil
1. Compartilhe o link: `http://localhost:3000/[slug]`
2. Família e amigos podem visualizar a história

## 💳 Pagamento com Stripe

### Cartões de Teste
- **Sucesso**: 4242 4242 4242 4242
- **Recusa**: 4000 0000 0000 0002
- Data/CVC: Qualquer valor futuro

### Webhooks
Configure webhooks em: `https://dashboard.stripe.com/webhooks`
- Endpoint: `http://localhost:8080/api/payments/webhook`
- Eventos: `checkout.session.completed`

## 🔑 Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login

### Casais
- `GET /api/couples/slug/{slug}` - Obter casal por slug
- `GET /api/couples/{id}` - Obter casal por ID
- `POST /api/couples` - Criar novo casal
- `PUT /api/couples/{id}` - Atualizar casal

### Eventos
- `GET /api/events/couple/{coupleId}` - Listar eventos
- `POST /api/events` - Criar evento
- `PUT /api/events/{id}` - Atualizar evento
- `DELETE /api/events/{id}` - Deletar evento

### Parceiros
- `GET /api/partners/couple/{coupleId}` - Listar parceiros
- `POST /api/partners` - Adicionar parceiro
- `PUT /api/partners/{id}` - Atualizar parceiro
- `DELETE /api/partners/{id}` - Deletar parceiro

### Pagamentos
- `POST /api/payments/checkout` - Criar sessão de pagamento
- `POST /api/payments/webhook` - Webhook do Stripe

### IA
- `POST /api/ai/generate-story` - Gerar história com IA

## 📁 Estrutura do Projeto

```
softlovely/
├── src/main/java/com/softlovely/softlovely/
│   ├── controller/          # Endpoints REST
│   ├── service/             # Lógica de negócio
│   ├── repository/          # Acesso ao banco
│   ├── model/               # Entidades JPA
│   ├── dto/                 # Data Transfer Objects
│   ├── config/              # Configurações
│   └── util/                # Utilitários
├── frontend/
│   ├── pages/               # Páginas Next.js
│   ├── components/          # Componentes React
│   ├── lib/                 # Funções auxiliares
│   ├── styles/              # CSS global
│   └── public/              # Arquivos estáticos
└── build.gradle             # Dependências Java
```

## 🔒 Segurança

- ✅ Senhas com hash BCrypt
- ✅ JWT para autenticação
- ✅ CORS configurado
- ✅ Validação de inputs
- ✅ Proteção de webhook Stripe

## 🐛 Troubleshooting

### Erro de conexão com banco
```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Criar banco se não existir
CREATE DATABASE softlovely;
```

### Erro ao fazer build do Gradle
```bash
./gradlew --stop
rm -rf .gradle build
./gradlew build -x test
```

### CORS errors
Verificar se `app.base-url` está correto no `application.properties`

### Stripe webhook não funciona
1. Confirmar chave webhook em `application.properties`
2. Usar `stripe-cli` para testar: `stripe listen --forward-to localhost:8080/api/payments/webhook`
3. Verificar logs do Spring Boot

## 📞 Contato & Suporte

- Email: suporte@storyofus.com
- Issues: Criar issue no repositório

## 📄 Licença

MIT License - veja LICENSE para detalhes

## 🎨 Contribuições

Contribuições são bem-vindas! Por favor, abra um PR com suas melhorias.

---

**Made with ❤️ for couples everywhere**

