# 🚀 Variáveis de Ambiente para o Render - PRONTO PARA USAR

## ✅ Copie e Cole Estas Variáveis no Render

### 📋 Como Adicionar no Render:

1. Acesse: https://dashboard.render.com
2. Selecione seu Web Service (ou crie um novo)
3. Vá em **"Environment"** no menu lateral
4. Clique em **"Add Environment Variable"**
5. Copie e cole cada variável abaixo

---

## 🔐 VARIÁVEIS DE AMBIENTE

### 1. MONGODB_URI

**Key:**
```
MONGODB_URI
```

**Value:**
```
mongodb+srv://rninformax_db_user:9AUQFEgSIOAk7LDz@cluster0.sddcisb.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
```

---

### 2. JWT_SECRET

**Key:**
```
JWT_SECRET
```

**Value:** (Gere uma chave forte)
```
K7mP9nQ2rT5vW8xZ1aB4cD6eF9gH2jL5mN8pQ1rS4tU7vX0yZ3aB6cD9eF2gH5j
```

💡 **Ou gere sua própria chave:**
- PowerShell: `-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})`
- Online: https://randomkeygen.com/

---

### 3. NODE_ENV

**Key:**
```
NODE_ENV
```

**Value:**
```
production
```

---

### 4. PORT

**Key:**
```
PORT
```

**Value:**
```
3000
```

---

### 5. CORS_ORIGIN (Opcional - Adicione depois)

**Key:**
```
CORS_ORIGIN
```

**Value:** (Substitua pela URL do seu app)
```
https://seu-app-name.onrender.com
```

💡 **Dica:** Você pode adicionar esta variável depois que souber a URL do seu app no Render.

---

## 📋 RESUMO - Copie Tudo de Uma Vez

Se o Render permitir adicionar múltiplas variáveis, use este formato:

```
MONGODB_URI=mongodb+srv://rninformax_db_user:9AUQFEgSIOAk7LDz@cluster0.sddcisb.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority

JWT_SECRET=K7mP9nQ2rT5vW8xZ1aB4cD6eF9gH2jL5mN8pQ1rS4tU7vX0yZ3aB6cD9eF2gH5j

NODE_ENV=production

PORT=3000
```

---

## 🎯 Passo a Passo Completo no Render

### Passo 1: Criar Web Service

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"**
3. Selecione **"Web Service"**
4. Conecte seu repositório GitHub: `Controledepontos4.0`

### Passo 2: Configurar Build

- **Name:** `controle-pontos-familiar` (ou outro nome)
- **Region:** `Oregon (US West)` - Grátis
- **Branch:** `main`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

### Passo 3: Adicionar Variáveis

Role até **"Environment Variables"** e adicione as 4 variáveis acima.

### Passo 4: Criar Web Service

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (5-10 minutos)
3. Acompanhe os logs

---

## ✅ Checklist de Deploy

- [ ] Repositório conectado ao Render
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] MONGODB_URI adicionada
- [ ] JWT_SECRET adicionada
- [ ] NODE_ENV=production adicionada
- [ ] PORT=3000 adicionada
- [ ] Deploy iniciado
- [ ] Aguardando conclusão

---

## 🔍 Verificar Deploy

### Logs do Render

Você deve ver algo como:

```
==> Building...
npm install
...
==> Starting service...
npm start
Servidor rodando na porta 3000
✅ MongoDB conectado com sucesso
```

### Status

- **Building:** Instalando dependências
- **Deploying:** Iniciando servidor
- **Live:** ✅ Funcionando!

---

## 🎉 Após Deploy Bem-Sucedido

### 1. Obter URL do App

No Render, você verá a URL:
```
https://controle-pontos-familiar-xxxx.onrender.com
```

### 2. Atualizar CORS_ORIGIN (Opcional)

Volte em Environment e adicione:
```
CORS_ORIGIN=https://controle-pontos-familiar-xxxx.onrender.com
```

### 3. Criar Primeiro Admin

**Opção A - Localmente:**
```bash
# Clone o repo
git clone https://github.com/JailtonGN/Controledepontos4.0.git
cd Controledepontos4.0

# Instale dependências
npm install

# Crie .env
echo "MONGODB_URI=mongodb+srv://rninformax_db_user:9AUQFEgSIOAk7LDz@cluster0.sddcisb.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority" > .env

# Execute script
npm run create-admin
```

**Opção B - MongoDB Atlas:**
Crie manualmente via interface do Atlas.

### 4. Acessar Sistema

1. Abra: `https://seu-app.onrender.com`
2. Faça login com as credenciais criadas
3. Pronto! 🎉

---

## ⚠️ IMPORTANTE - Whitelist MongoDB

Certifique-se que o IP está liberado:

1. Acesse: https://cloud.mongodb.com
2. Vá em **"Network Access"**
3. Verifique se tem: `0.0.0.0/0`
4. Se não tiver, adicione:
   - Clique em **"Add IP Address"**
   - Selecione **"Allow Access from Anywhere"**
   - IP: `0.0.0.0/0`
   - Clique em **"Confirm"**

---

## 🔒 Segurança

### ⚠️ Não Compartilhe

- ❌ Não commite variáveis no Git
- ❌ Não compartilhe credenciais
- ❌ Não poste em fóruns públicos
- ✅ Use apenas no Render

### Arquivo .gitignore

Certifique-se que está no `.gitignore`:
```
.env
.env.*
!.env.example
```

---

## 📊 Resumo das Variáveis

| Variável | Valor | Obrigatória |
|----------|-------|-------------|
| MONGODB_URI | String de conexão completa | ✅ Sim |
| JWT_SECRET | Chave forte de 64 caracteres | ✅ Sim |
| NODE_ENV | production | ✅ Sim |
| PORT | 3000 | ✅ Sim |
| CORS_ORIGIN | URL do app | ⚠️ Opcional |

---

## 🆘 Problemas Comuns

### Deploy falha

**Verifique:**
- Todas as variáveis estão configuradas?
- MONGODB_URI está correta?
- Whitelist configurada no MongoDB?

**Solução:**
- Veja os logs no Render
- Verifique cada variável
- Teste conexão localmente primeiro

### App não carrega

**Causa:** Plano free hiberna após 15 min

**Solução:**
- Aguarde 30-60 segundos no primeiro acesso
- É normal no plano gratuito

### Erro de autenticação

**Causa:** JWT_SECRET não configurado

**Solução:**
- Verifique se JWT_SECRET está no Render
- Reinicie o serviço

---

## 🎯 Próximos Passos

1. ✅ Copiar variáveis acima
2. ✅ Adicionar no Render
3. ✅ Fazer deploy
4. ✅ Aguardar conclusão
5. ✅ Criar primeiro admin
6. ✅ Acessar sistema
7. ✅ Começar a usar!

---

## 🔗 Links Úteis

- **Render Dashboard:** https://dashboard.render.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Repositório:** https://github.com/JailtonGN/Controledepontos4.0.git

---

**Tudo pronto! Copie as variáveis e cole no Render! 🚀**

*Criado em: ${new Date().toLocaleDateString('pt-BR')}*
