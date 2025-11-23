# 🚀 Guia Completo de Deploy - Produção

## 📋 Índice
1. [Configurar MongoDB Atlas](#1-configurar-mongodb-atlas)
2. [Configurar Render](#2-configurar-render)
3. [Variáveis de Ambiente](#3-variáveis-de-ambiente)
4. [Primeiro Acesso](#4-primeiro-acesso)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Configurar MongoDB Atlas

### Passo 1.1: Criar Conta no MongoDB Atlas

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie uma conta gratuita
3. Confirme seu email

### Passo 1.2: Criar um Cluster

1. Após login, clique em **"Build a Database"**
2. Escolha **"M0 FREE"** (Shared)
3. Selecione:
   - **Provider:** AWS
   - **Region:** São Paulo (sa-east-1) ou mais próxima
4. **Cluster Name:** `controle-pontos` (ou outro nome)
5. Clique em **"Create"**
6. Aguarde 3-5 minutos para o cluster ser criado

### Passo 1.3: Criar Usuário do Banco de Dados

1. Na tela de "Security Quickstart":
   - **Username:** `admin` (ou outro)
   - **Password:** Clique em **"Autogenerate Secure Password"**
   - ⚠️ **COPIE E SALVE A SENHA!** Você vai precisar dela
2. Clique em **"Create User"**

### Passo 1.4: Configurar Acesso de Rede

1. Na mesma tela, em "Where would you like to connect from?":
   - Selecione **"Cloud Environment"**
   - Ou clique em **"Add My Current IP Address"**
2. Para permitir acesso de qualquer lugar (necessário para Render):
   - Clique em **"Network Access"** no menu lateral
   - Clique em **"Add IP Address"**
   - Clique em **"Allow Access from Anywhere"**
   - IP: `0.0.0.0/0`
   - Clique em **"Confirm"**

### Passo 1.5: Obter String de Conexão

1. Clique em **"Database"** no menu lateral
2. No seu cluster, clique em **"Connect"**
3. Selecione **"Connect your application"**
4. **Driver:** Node.js
5. **Version:** 4.1 or later
6. Copie a string de conexão:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. ⚠️ **Substitua `<password>` pela senha que você salvou**
8. ⚠️ **Adicione o nome do banco após `.net/`:**
   ```
   mongodb+srv://admin:SUA_SENHA@cluster0.xxxxx.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
   ```

### Exemplo de String Completa:
```
mongodb+srv://admin:Abc123XYZ@cluster0.abc123.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
```

---

## 2. Configurar Render

### Passo 2.1: Criar Conta no Render

1. Acesse: https://render.com/
2. Clique em **"Get Started"**
3. Faça login com GitHub (recomendado)
4. Autorize o Render a acessar seus repositórios

### Passo 2.2: Criar Novo Web Service

1. No Dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório:
   - Se não aparecer, clique em **"Configure account"**
   - Autorize acesso ao repositório `Controledepontos4.0`
4. Selecione o repositório **"Controledepontos4.0"**

### Passo 2.3: Configurar o Web Service

Preencha os campos:

#### Informações Básicas
- **Name:** `controle-pontos-familiar` (ou outro nome único)
- **Region:** Oregon (US West) - Grátis
- **Branch:** `main`
- **Root Directory:** (deixe em branco)

#### Build & Deploy
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

#### Plano
- **Instance Type:** `Free`
- ⚠️ **Nota:** O plano gratuito hiberna após 15 minutos de inatividade

### Passo 2.4: Adicionar Variáveis de Ambiente

Role até **"Environment Variables"** e adicione:

#### Variável 1: MONGODB_URI
- **Key:** `MONGODB_URI`
- **Value:** (Cole a string de conexão do MongoDB Atlas)
  ```
  mongodb+srv://admin:SUA_SENHA@cluster0.xxxxx.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
  ```

#### Variável 2: JWT_SECRET
- **Key:** `JWT_SECRET`
- **Value:** (Gere uma chave secreta forte)
  ```
  sua_chave_secreta_jwt_muito_segura_2024_XYZ123
  ```
  💡 **Dica:** Use um gerador online: https://randomkeygen.com/

#### Variável 3: PORT
- **Key:** `PORT`
- **Value:** `3000`

#### Variável 4: NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`

#### Variável 5: CORS_ORIGIN (Opcional)
- **Key:** `CORS_ORIGIN`
- **Value:** `https://seu-app.onrender.com`
  (Você pode adicionar depois que souber a URL)

### Passo 2.5: Criar o Web Service

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (5-10 minutos)
3. Acompanhe os logs na tela

---

## 3. Variáveis de Ambiente

### Resumo das Variáveis Necessárias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `MONGODB_URI` | String de conexão do MongoDB Atlas | `mongodb+srv://...` |
| `JWT_SECRET` | Chave secreta para tokens JWT | `chave_super_secreta_123` |
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente de execução | `production` |
| `CORS_ORIGIN` | Origem permitida para CORS | `https://seu-app.onrender.com` |

### Como Gerar JWT_SECRET Seguro

Opção 1 - Online:
```
https://randomkeygen.com/
```

Opção 2 - Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Opção 3 - PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

---

## 4. Primeiro Acesso

### Passo 4.1: Verificar Deploy

1. No Render, aguarde até ver **"Live"** em verde
2. Clique na URL do seu app (ex: `https://controle-pontos-familiar.onrender.com`)
3. A página de login deve aparecer

### Passo 4.2: Criar Primeiro Usuário Admin

Como o banco está vazio, você precisa criar o primeiro usuário. Use um dos métodos:

#### Método 1: Script de Criação (Recomendado)

Crie um arquivo `scripts/create-first-admin.js`:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createFirstAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');

        const User = require('../models/User');
        const Family = require('../models/Family');

        // Criar família ADM
        let adminFamily = await Family.findOne({ name: 'Família ADM' });
        if (!adminFamily) {
            adminFamily = await Family.create({
                name: 'Família ADM',
                description: 'Família administrativa do sistema',
                isActive: true,
                createdBy: null // Será atualizado depois
            });
            console.log('✅ Família ADM criada');
        }

        // Verificar se já existe admin
        const existingAdmin = await User.findOne({ email: 'admin@admin.com' });
        if (existingAdmin) {
            console.log('⚠️  Admin já existe!');
            process.exit(0);
        }

        // Criar usuário admin
        const admin = await User.create({
            name: 'Administrador',
            email: 'admin@admin.com',
            password: 'admin123', // Será hasheada automaticamente
            role: 'admin',
            familyId: adminFamily._id,
            isActive: true
        });

        // Atualizar createdBy da família
        adminFamily.createdBy = admin._id;
        await adminFamily.save();

        console.log('✅ Admin criado com sucesso!');
        console.log('📧 Email: admin@admin.com');
        console.log('🔑 Senha: admin123');
        console.log('⚠️  ALTERE A SENHA APÓS O PRIMEIRO LOGIN!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

createFirstAdmin();
```

Execute localmente:
```bash
node scripts/create-first-admin.js
```

#### Método 2: Via MongoDB Atlas

1. Acesse MongoDB Atlas
2. Vá em **"Browse Collections"**
3. Crie as collections manualmente
4. Insira documentos via interface

### Passo 4.3: Fazer Login

1. Acesse sua URL do Render
2. Faça login com:
   - **Email:** `admin@admin.com`
   - **Senha:** `admin123`
3. ⚠️ **IMPORTANTE:** Altere a senha imediatamente!

### Passo 4.4: Configurar Sistema

1. Crie sua família
2. Cadastre crianças
3. Configure atividades
4. Comece a usar!

---

## 5. Troubleshooting

### Problema: "Cannot connect to database"

**Causa:** String de conexão incorreta ou IP não autorizado

**Solução:**
1. Verifique a string de conexão no Render
2. Confirme que a senha está correta
3. Verifique se `0.0.0.0/0` está na whitelist do MongoDB Atlas

### Problema: "Application error"

**Causa:** Variáveis de ambiente faltando

**Solução:**
1. Verifique se todas as variáveis estão configuradas
2. Reinicie o serviço no Render

### Problema: "JWT malformed"

**Causa:** JWT_SECRET não configurado

**Solução:**
1. Adicione JWT_SECRET nas variáveis de ambiente
2. Reinicie o serviço

### Problema: App muito lento

**Causa:** Plano gratuito do Render hiberna após inatividade

**Solução:**
1. Primeiro acesso sempre é lento (30-60 segundos)
2. Considere upgrade para plano pago
3. Ou use serviço de "ping" para manter ativo

### Problema: "Port already in use"

**Causa:** Porta configurada incorretamente

**Solução:**
1. Certifique-se que PORT=3000 nas variáveis
2. Ou remova a variável PORT (Render define automaticamente)

---

## 6. Checklist de Deploy

### Antes do Deploy
- [ ] Código commitado e pushed para GitHub
- [ ] MongoDB Atlas configurado
- [ ] String de conexão copiada
- [ ] JWT_SECRET gerado

### Durante o Deploy
- [ ] Render conectado ao repositório
- [ ] Variáveis de ambiente configuradas
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Deploy iniciado

### Após o Deploy
- [ ] App está "Live"
- [ ] URL acessível
- [ ] Página de login carrega
- [ ] Primeiro admin criado
- [ ] Login funciona
- [ ] Funcionalidades testadas

---

## 7. Manutenção

### Atualizar Aplicação

1. Faça alterações no código
2. Commit e push para GitHub:
   ```bash
   git add .
   git commit -m "Descrição das mudanças"
   git push
   ```
3. Render fará deploy automático

### Monitorar Logs

1. Acesse o Dashboard do Render
2. Clique no seu serviço
3. Vá em **"Logs"**
4. Acompanhe em tempo real

### Backup do Banco

1. No MongoDB Atlas, vá em **"Clusters"**
2. Clique em **"..."** → **"Take Snapshot"**
3. Configure backups automáticos

---

## 8. URLs Importantes

### Desenvolvimento
- **Local:** http://localhost:3000
- **Teste:** http://localhost:3002

### Produção
- **App:** https://seu-app.onrender.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Render Dashboard:** https://dashboard.render.com

---

## 9. Custos

### MongoDB Atlas
- **M0 (Free):** 512 MB de armazenamento
- **Limitações:** Compartilhado, sem backups automáticos
- **Upgrade:** M10 a partir de $0.08/hora

### Render
- **Free:** 750 horas/mês, hiberna após 15 min
- **Starter:** $7/mês, sempre ativo
- **Limitações Free:** 
  - 512 MB RAM
  - Compartilhado
  - Hiberna após inatividade

---

## 10. Próximos Passos

1. ✅ Deploy concluído
2. ✅ Primeiro acesso realizado
3. ⏭️ Configurar domínio personalizado (opcional)
4. ⏭️ Configurar SSL (automático no Render)
5. ⏭️ Configurar backups automáticos
6. ⏭️ Monitorar uso e performance

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Render
2. Verifique a conexão no MongoDB Atlas
3. Consulte a documentação oficial
4. Abra uma issue no GitHub

---

**Boa sorte com seu deploy! 🚀**

*Guia criado em: ${new Date().toLocaleDateString('pt-BR')}*
