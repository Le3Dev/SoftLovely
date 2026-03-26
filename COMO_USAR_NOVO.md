# 🎉 Como Usar a Tela Inicial do StoryOfUs

## 📋 O que foi implementado

Uma **tela inicial completa com formulário** que permite ao usuário:

1. **👥 Nome do Casal** - Digite o nome dos dois
2. **📅 Data de Início** - Selecione quando começaram o relacionamento
3. **🎨 Cor do Tema** - Escolha uma cor para personalizar (Rosa, Vermelho, Roxo, Azul, Verde, Laranja)
4. **📖 Nossa História** - Escreva como vocês se conheceram e momentos especiais
5. **🎵 Música que nos une** - Cole a URL de uma música no Spotify, YouTube, etc
6. **📸 Fotos do Casal** - Faça upload de múltiplas fotos

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Java 11+ instalado
- Node.js 16+ instalado
- Maven ou Gradle (já está no projeto)

### Backend (Spring Boot)

```bash
# Na pasta raiz do projeto
./gradlew clean build
./gradlew bootRun

# OU com Maven
mvn clean install
mvn spring-boot:run
```

O backend estará disponível em: **http://localhost:8080**

### Frontend (Next.js)

```bash
# Na pasta frontend
cd frontend
npm install
npm run dev
```

O frontend estará disponível em: **http://localhost:3000**

## 🧪 Como Testar

1. **Abra o navegador** e vá para: http://localhost:3000

2. **Na aba "➕ Criar Novo Casal":**
   - Preencha o Nome do Casal (ex: João e Maria)
   - Selecione a Data de Início
   - Escolha uma Cor para o Tema
   - Digite uma História
   - Cole a URL de uma Música
   - Faça Upload de Fotos
   - Clique em "💫 Criar Nossa História"

3. **O sistema irá:**
   - Criar um registro do casal no banco de dados
   - Fazer upload das fotos
   - Salvar a história
   - Redirecionar para a página pública do casal

4. **Na aba "👀 Ver Casal Existente":**
   - Digite o slug do casal criado
   - Clique em "Abrir Página"

## 📝 Formato do Nome para Link

O nome "João e Maria" será convertido para: **joao-e-maria**

Caracteres especiais e acentos são removidos automaticamente.

## 🔧 Possíveis Erros e Soluções

### Erro: "Cannot GET /api/couples"
- **Solução**: Certifique-se de que o backend está rodando em http://localhost:8080

### Erro: "Failed to load resource"
- **Solução**: Verifique se o frontend está rodando em http://localhost:3000

### Erro: "CORS policy blocked"
- **Solução**: Os controllers já têm @CrossOrigin configurado. Reinicie o backend.

### Erro ao fazer upload de fotos
- **Solução**: Certifique-se de que a pasta `uploads/` existe na raiz do projeto
  ```bash
  mkdir uploads
  ```

## 📁 Estrutura de Pastas do Upload

As fotos serão salvas em:
```
uploads/
  └── {coupleId}/
      ├── uuid1_foto1.jpg
      ├── uuid2_foto2.png
      └── uuid3_foto3.jpg
```

## 🎯 Próximos Passos

Você pode adicionar:
- ✅ Edição dos dados do casal
- ✅ Galeria com visualização de fotos
- ✅ Player de música integrado
- ✅ Geração de histórias com IA
- ✅ Timeline dos eventos
- ✅ Pagamento com Stripe

## 💡 Dicas

- Use a aba **Preview** para ver como ficará seu casal antes de enviar
- As fotos podem ser arrastadas e soltas no campo de upload
- O link do casal fica automático baseado no nome

---

**Qualquer dúvida, verifique os arquivos de log no console do Spring Boot e do Next.js! 🎵💕**

