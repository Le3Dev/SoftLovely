# Guia de Solução de Problemas - Network Error

## Problema
Ao preencher o formulário e clicar em "Finalizar", ocorre um **Network Error**.

## Possíveis Causas e Soluções

### 1. **Backend não está rodando**
```powershell
cd "C:\Users\leand\OneDrive - Grupo Marista\Projeto\softlovely"
./gradlew bootRun
```
- Espere até ver: `Started SoftlovelyApplication`
- Acesse `http://localhost:8080/api/couples` para testar
- Deve retornar um JSON vazio ou lista

### 2. **MySQL não está rodando**
```powershell
# Verificar se MySQL está rodando
Get-Service | Where-Object {$_.Name -like "*mysql*"}

# Se não estiver, inicie:
Start-Service MySQL80  # ou o nome do seu serviço MySQL
```

### 3. **Banco de dados não existe ou não tem a coluna uniqueHash**
```sql
-- Conectar ao MySQL e executar:
USE softlovely;

-- Verificar se a coluna uniqueHash existe
DESCRIBE couples;

-- Se não existir, adicionar manualmente:
ALTER TABLE couples ADD COLUMN unique_hash VARCHAR(64) UNIQUE;
```

### 4. **Frontend não está rodando**
```powershell
cd "C:\Users\leand\OneDrive - Grupo Marista\Projeto\softlovely\frontend"

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```
- Acesse `http://localhost:3000`

### 5. **Dependências do Frontend faltando**
```powershell
cd "C:\Users\leand\OneDrive - Grupo Marista\Projeto\softlovely\frontend"

# Instalar dependências adicionadas
npm install @stripe/react-stripe-js qrcode.react

# Ou reinstalar tudo
npm install --legacy-peer-deps
```

### 6. **Porta 8080 já em uso**
```powershell
# Encontrar processo usando porta 8080
Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess
Get-Process -Id <PID>

# Matar o processo
Stop-Process -Id <PID> -Force
```

## Checklist de Verificação

- [ ] MySQL está rodando: `http://localhost/phpmyadmin` (ou similar)
- [ ] Banco de dados `softlovely` existe
- [ ] Tabela `couples` tem coluna `unique_hash`
- [ ] Backend compila sem erros: `./gradlew clean build`
- [ ] Backend está rodando na porta 8080
- [ ] Frontend está rodando na porta 3000
- [ ] `.env.local` do frontend tem `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`
- [ ] Console do navegador (F12) mostra qual erro específico

## Como Verificar o Erro Real

1. Abra o navegador (Chrome/Firefox)
2. Pressione `F12` para abrir o Developer Tools
3. Vá para a aba **Network**
4. Preencha o formulário e clique em "Finalizar"
5. Procure pela requisição `POST /api/couples`
6. Clique nela e verifique:
   - **Status**: Deve ser 201 (Created) ou 200 (OK)
   - **Response**: Ver a resposta do servidor
   - **Console**: Ver se há erros JavaScript

## Logs Úteis

### Backend (mostrar logs)
```powershell
# Abrir o arquivo de log
Get-Content -Path "build\logs\*.log" -Tail 50 -Wait
```

### Frontend (mostrar console)
```
1. Abra o navegador
2. F12 -> Console
3. Procure por mensagens de erro vermelhas
4. Procure por "console.error" ou "console.log"
```

## Exemplo de Requisição Correta

```javascript
// O que o frontend está tentando fazer
const coupleResponse = await axios.post('http://localhost:8080/api/couples', {
  slug: 'joao-e-maria',
  anniversaryDate: '2020-01-15',
  themeColor: '#ec4899'
}, {
  headers: {
    'Content-Type': 'application/json'
  }
})
```

O que o backend espera receber no CoupleController:
- POST /api/couples
- Body: { slug, anniversaryDate, themeColor }
- Sem Authorization header (agora opcional)
- Deve retornar: { id, slug, anniversaryDate, themeColor, isPremium, ownerId }

## Se ainda não funcionar

1. Verifique se há erros de compilação:
```powershell
cd "C:\Users\leand\OneDrive - Grupo Marista\Projeto\softlovely"
./gradlew compileJava
```

2. Verifique se o banco de dados está acessível:
```powershell
# Testar conexão MySQL
mysql -u softlover -p -h localhost
# Digite a senha: softlover123!
# Se conectar, a senha está correta
```

3. Verifique o arquivo `application.properties`:
```
spring.datasource.url=jdbc:mysql://localhost:3306/softlovely
spring.datasource.username=softlover
spring.datasource.password=softlover123!
```

