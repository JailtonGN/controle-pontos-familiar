# 🔐 Suas Credenciais MongoDB Atlas

## ✅ Credenciais Recebidas

**Usuário:** `ninformax_db_user`  
**Senha:** `9AUQFEgSIOAk7LDz`

---

## 📋 Próximos Passos

### 1. Obter URL do Cluster

Você precisa da URL do seu cluster MongoDB. Para isso:

1. Acesse: https://cloud.mongodb.com
2. Faça login
3. Clique em **"Database"** no menu lateral
4. No seu cluster, clique em **"Connect"**
5. Selecione **"Connect your application"**
6. Copie a URL que aparece (algo como: `cluster0.xxxxx.mongodb.net`)

### 2. Montar String de Conexão Completa

Substitua `<cluster-url>` pela URL que você copiou:

```
mongodb+srv://ninformax_db_user:9AUQFEgSIOAk7LDz@<cluster-url>/controle-pontos-familiar?retryWrites=true&w=majority
```

**Exemplo:**
```
mongodb+srv://ninformax_db_user:9AUQFEgSIOAk7LDz@cluster0.abc123.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
```

---

## 🚀 Configurar no Render

### Passo 1: Acessar Render

1. Acesse: https://render.com/
2. Faça login com GitHub
3. Vá para seu Web Service (ou crie um novo)

### Passo 2: Adicionar Variáveis de Ambiente

No Render, vá em **"Environment"** e adicione:

#### MONGODB_URI
```
mongodb+srv://ninformax_db_user:9AUQFEgSIOAk7LDz@<SUA-CLUSTER-URL>/controle-pontos-familiar?retryWrites=true&w=majority
```

#### JWT_SECRET
Gere uma chave forte. Opções:

**Opção 1 - Online:**
- Acesse: https://randomkeygen.com/
- Copie uma chave "Fort Knox Passwords"

**Opção 2 - PowerShell:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**Opção 3 - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Exemplo de JWT_SECRET:**
```
a7f3d9e2b8c4f1a6d5e9b2c7f4a1d8e3b6c9f2a5d8e1b4c7f0a3d6e9b2c5f8a1
```

#### NODE_ENV
```
production
```

#### PORT
```
3000
```

### Passo 3: Salvar e Fazer Deploy

1. Clique em **"Save Changes"**
2. O Render fará deploy automático
3. Aguarde 5-10 minutos

---

## ✅ Checklist de Configuração

- [ ] Obtive a URL do cluster MongoDB
- [ ] Montei a string de conexão completa
- [ ] Gerei um JWT_SECRET forte
- [ ] Adicionei MONGODB_URI no Render
- [ ] Adicionei JWT_SECRET no Render
- [ ] Adicionei NODE_ENV=production no Render
- [ ] Salvei as mudanças
- [ ] Deploy iniciado

---

## 🧪 Testar Conexão Localmente (Opcional)

Antes de fazer deploy, você pode testar localmente:

### 1. Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto:

```env
MONGODB_URI=mongodb+srv://ninformax_db_user:9AUQFEgSIOAk7LDz@<SUA-CLUSTER-URL>/controle-pontos-familiar?retryWrites=true&w=majority
JWT_SECRET=sua_chave_secreta_gerada
NODE_ENV=development
PORT=3000
```

### 2. Testar Conexão

```bash
npm install
npm start
```

Se conectar com sucesso, verá:
```
Servidor rodando na porta 3000
✅ MongoDB conectado com sucesso
```

---

## 🔒 Segurança

### ⚠️ IMPORTANTE - Não Compartilhe

- ❌ Não commite o arquivo `.env` no Git
- ❌ Não compartilhe suas credenciais
- ❌ Não poste em fóruns públicos
- ✅ Use apenas em variáveis de ambiente seguras

### Arquivo .gitignore

Certifique-se que `.env` está no `.gitignore`:

```
.env
.env.local
.env.production
.env.development
```

---

## 📊 Resumo das Variáveis

| Variável | Valor | Onde Usar |
|----------|-------|-----------|
| **MONGODB_URI** | `mongodb+srv://ninformax_db_user:9AUQFEgSIOAk7LDz@...` | Render |
| **JWT_SECRET** | Chave forte gerada | Render |
| **NODE_ENV** | `production` | Render |
| **PORT** | `3000` | Render |

---

## 🆘 Problemas Comuns

### Erro: "Authentication failed"

**Causa:** Senha incorreta ou usuário não existe

**Solução:**
1. Verifique se copiou a senha corretamente: `9AUQFEgSIOAk7LDz`
2. Verifique se o usuário existe no MongoDB Atlas
3. Tente recriar o usuário se necessário

### Erro: "Connection timeout"

**Causa:** IP não está na whitelist

**Solução:**
1. Acesse MongoDB Atlas
2. Vá em **"Network Access"**
3. Adicione IP: `0.0.0.0/0` (permitir todos)

### Erro: "Database not found"

**Causa:** Nome do banco incorreto na string

**Solução:**
1. Verifique se tem `/controle-pontos-familiar` na string
2. O banco será criado automaticamente no primeiro acesso

---

## 📞 Próximos Passos

1. ✅ Obter URL do cluster
2. ✅ Montar string completa
3. ✅ Gerar JWT_SECRET
4. ✅ Configurar no Render
5. ✅ Fazer deploy
6. ✅ Criar primeiro admin
7. ✅ Acessar sistema

---

## 🔗 Links Úteis

- **MongoDB Atlas:** https://cloud.mongodb.com
- **Render Dashboard:** https://dashboard.render.com
- **Gerador de Senhas:** https://randomkeygen.com/
- **Guia Completo:** [GUIA_DEPLOY_PRODUCAO.md](GUIA_DEPLOY_PRODUCAO.md)

---

**Suas credenciais estão prontas! Agora é só configurar no Render! 🚀**

*Documento criado em: ${new Date().toLocaleDateString('pt-BR')}*
