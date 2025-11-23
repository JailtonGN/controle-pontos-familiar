# 🧪 Guia de Teste Local

Este guia explica como executar o servidor de teste local do Sistema de Controle de Pontos Familiar.

## 📋 O que é o Servidor de Teste?

O `test-server.js` é um servidor especial que:
- ✅ Usa **MongoDB em memória** (não precisa instalar MongoDB)
- ✅ Cria **dados de teste automaticamente**
- ✅ Roda em uma **porta diferente** (3001) para não conflitar
- ✅ É **perfeito para desenvolvimento e testes**

## 🚀 Como Usar

### 1. Instalar Dependências (se ainda não instalou)

```bash
npm install
```

### 2. Iniciar o Servidor de Teste

```bash
npm run test-server
```

Ou diretamente:

```bash
node test-server.js
```

### 3. Acessar a Aplicação

Abra seu navegador em: **http://localhost:3002**

## 🔑 Credenciais de Teste

### Usuário Responsável (Login Principal)
- **Email:** teste@teste.com
- **Senha:** teste123

### Usuário Admin (Acesso Total)
- **Email:** temp@admin.com
- **Senha:** temp123

### Crianças (Login Infantil)
- **João**
  - PIN: 1234
  - Pontos iniciais: 50
  - Emoji: 👦

- **Maria**
  - PIN: 5678
  - Pontos iniciais: 75
  - Emoji: 👧

## 🎯 Dados de Teste Incluídos

### Atividades Positivas
- 🛏️ Arrumar a cama (5 pontos)
- 🪥 Escovar os dentes (3 pontos)
- 📚 Fazer lição de casa (10 pontos)
- 🧹 Ajudar nas tarefas (8 pontos)
- 📖 Ler um livro (15 pontos)

### Atividades Negativas
- 😠 Brigar com irmão (-10 pontos)
- 🚫 Não obedecer (-5 pontos)
- 🌪️ Fazer bagunça (-8 pontos)
- 🤥 Mentir (-15 pontos)

## 🧪 Testando Funcionalidades

### 1. Login de Responsável
1. Acesse http://localhost:3001
2. Use: teste@teste.com / teste123
3. Você será redirecionado para o dashboard

### 2. Gerenciar Pontos
1. Vá em "Atividades" → "Gerenciar Pontos"
2. Selecione uma criança
3. Adicione ou remova pontos usando atividades
4. Teste pontos avulsos também

### 3. Cadastrar Nova Criança
1. Vá em "Cadastros" → "Crianças"
2. Clique em "Adicionar Criança"
3. Preencha os dados e defina um PIN
4. Salve e teste o login da criança

### 4. Login de Criança
1. Acesse http://localhost:3001/kid-login
2. Use o PIN de uma criança (1234 ou 5678)
3. Veja a área infantil com pontos e histórico

### 5. Criar Atividades
1. Vá em "Atividades" → "Atividades"
2. Crie novas atividades positivas ou negativas
3. Defina pontos, categoria e emoji
4. Use-as no gerenciamento de pontos

## 🔄 Diferenças do Servidor Normal

| Característica | Servidor Normal | Servidor de Teste |
|----------------|-----------------|-------------------|
| Porta | 3000 | 3001 |
| Banco de Dados | MongoDB Atlas | MongoDB em Memória |
| Dados | Vazios | Pré-populados |
| Configuração | Requer .env | Não requer |
| Persistência | Permanente | Temporária |

## ⚠️ Importante

- Os dados são **temporários** e serão perdidos ao reiniciar o servidor
- Perfeito para **testes e desenvolvimento**
- Para produção, use o servidor normal com MongoDB Atlas

## 🛑 Parar o Servidor

Pressione `Ctrl + C` no terminal onde o servidor está rodando.

O servidor irá:
1. Desconectar do banco de dados
2. Encerrar o MongoDB Memory Server
3. Limpar recursos

## 🐛 Solução de Problemas

### Erro: "Cannot find module 'mongodb-memory-server'"
```bash
npm install mongodb-memory-server --save-dev
```

### Porta 3001 já está em uso
Edite o arquivo `test-server.js` e mude a linha:
```javascript
const PORT = 3001; // Mude para outra porta, ex: 3002
```

### Erro ao criar dados de teste
Verifique se todos os models existem:
- models/User.js
- models/Kid.js
- models/Activity.js

## 📝 Logs do Servidor

O servidor mostra logs coloridos para facilitar o acompanhamento:
- 🚀 Iniciando
- ✅ Sucesso
- ❌ Erro
- 📊 Informação
- 🌱 Criando dados

## 🎓 Próximos Passos

Após testar localmente:
1. Configure o MongoDB Atlas para produção
2. Crie o arquivo `.env` com suas credenciais
3. Use `npm start` para o servidor de produção
4. Faça deploy no Render ou outro serviço

## 💡 Dicas

- Use o servidor de teste para **experimentar** sem medo
- Teste todas as funcionalidades antes de ir para produção
- Crie cenários de teste diferentes
- Verifique o comportamento em diferentes navegadores

---

**Desenvolvido com ❤️ para facilitar seus testes!**
