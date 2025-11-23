# ⚡ Deploy Rápido - 5 Minutos

## 🎯 Checklist Rápido

### 1️⃣ MongoDB Atlas (2 minutos)

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie conta gratuita
3. Crie cluster M0 (Free)
4. Crie usuário do banco:
   - Username: `admin`
   - Password: **Autogenerate** (copie e salve!)
5. Whitelist IP: `0.0.0.0/0` (permitir todos)
6. Copie string de conexão:
   ```
   mongodb+srv://admin:SUA_SENHA@cluster0.xxxxx.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
   ```

### 2️⃣ Render (3 minutos)

1. Acesse: https://render.com/
2. Login com GitHub
3. New + → Web Service
4. Conecte repositório: `Controledepontos4.0`
5. Configure:
   - **Name:** `controle-pontos-familiar`
   - **Build:** `npm install`
   - **Start:** `npm start`
   - **Plan:** Free

6. Adicione variáveis de ambiente:

```
MONGODB_URI = mongodb+srv://admin:SUA_SENHA@cluster0.xxxxx.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority

JWT_SECRET = sua_chave_secreta_muito_forte_123_XYZ

NODE_ENV = production

PORT = 3000
```

7. Clique em **"Create Web Service"**
8. Aguarde deploy (5-10 min)

### 3️⃣ Criar Primeiro Admin

Opção A - Localmente:
```bash
# Clone o repo
git clone https://github.com/JailtonGN/Controledepontos4.0.git
cd Controledepontos4.0

# Instale dependências
npm install

# Crie arquivo .env com MONGODB_URI
echo "MONGODB_URI=sua_string_de_conexao" > .env

# Execute o script
node scripts/create-first-admin.js
```

Opção B - Manualmente no MongoDB Atlas:
1. Acesse MongoDB Atlas
2. Browse Collections
3. Crie collections e insira dados

### 4️⃣ Acessar Sistema

1. Acesse: `https://seu-app.onrender.com`
2. Login com credenciais criadas
3. Pronto! 🎉

---

## 🔗 Links Úteis

- **MongoDB Atlas:** https://cloud.mongodb.com
- **Render Dashboard:** https://dashboard.render.com
- **Repositório:** https://github.com/JailtonGN/Controledepontos4.0.git
- **Guia Completo:** [GUIA_DEPLOY_PRODUCAO.md](GUIA_DEPLOY_PRODUCAO.md)

---

## ⚠️ Problemas Comuns

### App não carrega
- Aguarde 30-60 segundos (plano free hiberna)
- Verifique logs no Render

### Erro de conexão
- Verifique MONGODB_URI
- Confirme whitelist `0.0.0.0/0` no Atlas

### Erro de autenticação
- Verifique JWT_SECRET configurado
- Limpe cache do navegador

---

## 📞 Precisa de Ajuda?

Consulte o [GUIA_DEPLOY_PRODUCAO.md](GUIA_DEPLOY_PRODUCAO.md) para instruções detalhadas.

---

**Tempo total:** ~5-10 minutos ⏱️
